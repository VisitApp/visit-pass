#!/usr/bin/env tsx
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import chalk from "chalk";
import inquirer from "inquirer";
import Mustache from "mustache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required because chalk v4 is CJS
const require = createRequire(import.meta.url);
const chalkCjs = require("chalk") as typeof chalk;

interface UserConfig {
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion?: string;
}

interface ProjectConfig {
  hostingType: "s3";
  projectName: string;
  /** Override the default `visit-cdn` bucket. */
  bucket?: string;
  /** Invalidate this CloudFront distribution after upload. */
  cloudfrontDistributionId?: string;
}

interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

const DEFAULT_BUCKET = "visit-cdn";
const DEFAULT_REGION = "ap-southeast-1";
const UPLOAD_CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY ?? 16);
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

const log = {
  info: (m: string) => console.log(chalkCjs.bold.blue("▸ ") + m),
  ok: (m: string) => console.log(chalkCjs.bold.green("✓ ") + m),
  warn: (m: string) => console.log(chalkCjs.bold.yellow("! ") + m),
  err: (m: string) => console.error(chalkCjs.bold.red("✗ ") + m),
};

const die = (message: string): never => {
  log.err(message);
  process.exit(1);
};

const createFileFromTemplate = (
  templatePath: string,
  outputPath: string,
  config: Record<string, string>,
): void => {
  const output = Mustache.render(
    fs.readFileSync(templatePath, { encoding: "utf8" }),
    config,
  );
  fs.writeFileSync(outputPath, output);
};

const getAllFiles = (dirPath: string, fileList: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) getAllFiles(fullPath, fileList);
    else fileList.push(fullPath);
  }
  return fileList;
};

/** Run `worker` over `items` with at most `limit` in flight at once. */
const runPool = async <T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> => {
  let cursor = 0;
  const lanes = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++;
        await worker(items[index], index);
      }
    },
  );
  await Promise.all(lanes);
};

/** Files that must always be revalidated (never cached). */
const isNoCache = (key: string): boolean =>
  key.endsWith(".html") ||
  key.endsWith(".txt") || // Next.js RSC payload / index data files
  key.endsWith(".json") ||
  key === "sw.js";

const resolveCredentials = (): AwsCredentials => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  try {
    const userConfig: UserConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "./.userconfig")).toString(),
    );
    if (!process.env.AWS_REGION && userConfig.awsRegion) {
      process.env.AWS_REGION = userConfig.awsRegion;
    }
    return {
      accessKeyId: userConfig.awsAccessKey,
      secretAccessKey: userConfig.awsSecretKey,
    };
  } catch {
    return die(
      "Could not read .userconfig — make sure it exists and is readable, or set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.",
    );
  }
};

const invalidateCloudFront = async (
  distributionId: string,
  region: string,
): Promise<void> => {
  log.info(`Invalidating CloudFront distribution ${distributionId}…`);
  if (DRY_RUN) {
    log.warn("DRY_RUN — skipping invalidation");
    return;
  }
  const { CloudFrontClient, CreateInvalidationCommand } =
    await import("@aws-sdk/client-cloudfront");
  const cf = new CloudFrontClient({ region });
  await cf.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `deploy-${Date.now()}`,
        Paths: { Quantity: 1, Items: ["/*"] },
      },
    }),
  );
  log.ok("CloudFront invalidation requested");
};

const deployProject = async (projectConfig: ProjectConfig): Promise<void> => {
  if (projectConfig.hostingType !== "s3") {
    return die(`Unsupported hostingType: ${projectConfig.hostingType}`);
  }

  const credentials = resolveCredentials();
  const region = process.env.AWS_REGION ?? DEFAULT_REGION;
  const bucket =
    process.env.S3_BUCKET ?? projectConfig.bucket ?? DEFAULT_BUCKET;
  const useAcl = process.env.S3_DISABLE_ACL !== "1"; // some buckets disable ACLs
  const deployEnv = process.env.DEPLOY_ENV ?? process.env.NODE_ENV;
  const s3Directory = deployEnv === "staging" ? "web-stage" : "web";
  const keyPrefix = `${s3Directory}/${projectConfig.projectName}`;

  // Next.js static export outputs to ./out
  const distPath = path.join(process.cwd(), "out");
  if (!fs.existsSync(path.join(distPath, "index.html"))) {
    return die(
      "out/index.html not found — run `npm run build` (static export) first.",
    );
  }

  const files = getAllFiles(distPath);
  const s3 = new S3Client({ region, credentials, maxAttempts: 3 });

  log.info(
    `Deploying ${chalkCjs.bold(String(files.length))} files → ` +
      `${chalkCjs.bold(`s3://${bucket}/${keyPrefix}/`)} (${region})` +
      (DRY_RUN ? chalkCjs.yellow("  [dry run]") : ""),
  );

  let done = 0;
  const failures: { key: string; message: string }[] = [];

  await runPool(files, UPLOAD_CONCURRENCY, async (absoluteFilePath) => {
    const relKey = path
      .relative(distPath, absoluteFilePath)
      .split(path.sep)
      .join("/");
    const key = `${keyPrefix}/${relKey}`;
    try {
      if (!DRY_RUN) {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fs.createReadStream(absoluteFilePath),
            ContentType:
              mime.contentType(path.basename(relKey)) ||
              "application/octet-stream",
            CacheControl: isNoCache(relKey)
              ? "no-cache, no-store, must-revalidate"
              : "public, max-age=31536000, immutable",
            ...(useAcl ? { ACL: "public-read" as const } : {}),
          }),
        );
      }
      done += 1;
      process.stdout.write(`\r  uploaded ${done}/${files.length}`);
    } catch (err) {
      failures.push({ key: relKey, message: (err as Error).message });
    }
  });
  process.stdout.write("\n");

  if (failures.length > 0) {
    log.err(`${failures.length} file(s) failed to upload:`);
    for (const f of failures.slice(0, 10)) log.err(`  ${f.key} — ${f.message}`);
    if (failures.length > 10) log.err(`  …and ${failures.length - 10} more`);
    process.exit(1);
  }

  log.ok(`Uploaded ${done} files`);

  const distributionId =
    process.env.CLOUDFRONT_DISTRIBUTION_ID ??
    projectConfig.cloudfrontDistributionId;
  if (distributionId) await invalidateCloudFront(distributionId, region);

  log.ok(`Deployment complete → s3://${bucket}/${keyPrefix}/`);
};

const run = async (): Promise<void> => {
  let projectConfig: ProjectConfig;
  try {
    projectConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "./projectconfig")).toString(),
    );
  } catch {
    return die(
      "Could not read ./projectconfig — make sure it exists and is readable.",
    );
  }

  const haveEnvCreds = Boolean(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
  );
  const userconfigPath = path.join(process.cwd(), "./.userconfig");

  if (!haveEnvCreds && !fs.existsSync(userconfigPath)) {
    log.warn("No credentials found — let's set up .userconfig");
    const answers = await inquirer.prompt<UserConfig>([
      {
        type: "input",
        message: "AWS Access Key",
        name: "awsAccessKey",
        validate: (a: string) => a.trim() !== "" || "Please enter a valid key",
      },
      {
        type: "password",
        message: "AWS Secret Key",
        name: "awsSecretKey",
        validate: (a: string) => a.trim() !== "" || "Please enter a valid key",
      },
      {
        type: "input",
        message: "AWS region",
        name: "awsRegion",
        default: DEFAULT_REGION,
      },
    ]);
    createFileFromTemplate(
      path.join(__dirname, "./.userconfig.mustache"),
      userconfigPath,
      answers as unknown as Record<string, string>,
    );
    log.ok("Wrote .userconfig (gitignored)");
  }

  await deployProject(projectConfig);
};

run().catch((err: unknown) => die((err as Error).message));
