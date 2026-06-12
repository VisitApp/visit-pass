#!/usr/bin/env tsx
import path from "node:path";
import { createRequire } from "node:module";
import fs from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import chalk from "chalk";

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
  sessionToken?: string;
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

/**
 * Load `KEY=value` pairs from a dotenv file into process.env without clobbering
 * vars already set in the environment (real env / CI secrets always win).
 * No-op if the file is absent. Deliberately minimal — no dep, no export/quotes
 * gymnastics beyond stripping one layer of surrounding quotes.
 */
const loadEnvFile = (filePath: string): void => {
  if (!fs.existsSync(filePath)) return;
  for (const raw of fs.readFileSync(filePath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key || key in process.env) continue;
    process.env[key] = line
      .slice(eq + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");
  }
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

/**
 * Resolve credentials, most-secure path first:
 *   1. Explicit env vars (CI secrets, `export AWS_*`, OIDC-assumed sessions).
 *   2. Returning `undefined` → hand off to the AWS SDK default provider chain,
 *      which transparently resolves shared profiles / SSO, OIDC web-identity
 *      tokens (`AWS_ROLE_ARN` + `AWS_WEB_IDENTITY_TOKEN_FILE` in CI), and
 *      EC2/ECS instance roles. This is the preferred production path — no
 *      long-lived keys ever touch disk.
 *   3. Legacy `.userconfig` plaintext keys — DEPRECATED, kept only so existing
 *      local setups keep working. Warns loudly.
 */
const resolveCredentials = (): AwsCredentials | undefined => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN
        ? { sessionToken: process.env.AWS_SESSION_TOKEN }
        : {}),
    };
  }

  const legacyPath = path.join(process.cwd(), "./.userconfig");
  if (fs.existsSync(legacyPath)) {
    try {
      const userConfig: UserConfig = JSON.parse(
        fs.readFileSync(legacyPath, "utf8"),
      );
      if (userConfig.awsAccessKey && userConfig.awsSecretKey) {
        log.warn(
          ".userconfig is DEPRECATED — plaintext AWS keys on disk. " +
            "Prefer env vars, `aws configure sso`, or OIDC. See deployment/.env.example.",
        );
        if (!process.env.AWS_REGION && userConfig.awsRegion) {
          process.env.AWS_REGION = userConfig.awsRegion;
        }
        return {
          accessKeyId: userConfig.awsAccessKey,
          secretAccessKey: userConfig.awsSecretKey,
        };
      }
    } catch {
      /* malformed legacy file — fall through to the SDK provider chain */
    }
  }

  // Let the AWS SDK resolve from profile / SSO / OIDC / instance role.
  return undefined;
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
  const s3 = new S3Client({
    region,
    maxAttempts: 3,
    // Omit `credentials` when undefined so the SDK default provider chain runs.
    ...(credentials ? { credentials } : {}),
  });

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

        // `trailingSlash: true` emits `<route>/index.html`, so S3 only resolves
        // deep links that end in a slash. Payment redirects hit `/order-confirmed`
        // (no slash) → 404 → error doc (homepage). Mirror each nested
        // `<route>/index.html` to an extensionless `<route>` object so the
        // slash-less URL resolves to the same HTML.
        if (relKey.endsWith("/index.html")) {
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: `${keyPrefix}/${relKey.slice(0, -"/index.html".length)}`,
              Body: fs.readFileSync(absoluteFilePath),
              ContentType: "text/html; charset=utf-8",
              CacheControl: "no-cache, no-store, must-revalidate",
              ...(useAcl ? { ACL: "public-read" as const } : {}),
            }),
          );
        }
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
  // Pick up local secrets/config from a gitignored dotenv if present.
  loadEnvFile(path.join(process.cwd(), "deployment/.env"));
  loadEnvFile(path.join(process.cwd(), ".env"));

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

  await deployProject(projectConfig);
};

run().catch((err: unknown) => die((err as Error).message));
