# Deploying to S3

This app is a **static export** (`output: "export"` in `next.config.ts`).
`next build` emits a static site into `./out`, which `deployment/deploy.ts`
uploads to the `opd-wallet` S3 bucket.

## What gets uploaded where

| | |
|---|---|
| Bucket | `opd-wallet` |
| Key prefix (prod) | `web/opd-wallet/…` |
| Key prefix (staging) | `web-stage/opd-wallet/…` |
| Default region | `ap-southeast-1` (override with `AWS_REGION`) |

`projectconfig` (committed) sets the project name and hosting type:

```json
{ "hostingType": "s3", "projectName": "opd-wallet" }
```

Cache headers are set per file: `*.html` → `no-cache`, everything else
(hashed assets) → `public, max-age=31536000, immutable`.

## Prerequisites

- Node.js **20.9+** (`nvm use 24`).
- AWS credentials with write access to `opd-wallet`.

## Credentials

The script resolves credentials in this order:

1. **Env vars** — `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (preferred for CI).
2. **`.userconfig`** — a gitignored JSON file in the project root. If it's
   missing, the script prompts for your keys on first run and writes it:

   ```json
   { "awsAccessKey": "AKIA…", "awsSecretKey": "…" }
   ```

## Deploy

```bash
nvm use 24
npm run deploy            # next build → upload ./out to web/opd-wallet/
npm run deploy:staging    # → uploads to web-stage/opd-wallet/  (DEPLOY_ENV=staging)
npm run deploy:dry        # build + simulate upload, no S3 writes
```

The deployer uploads with bounded concurrency, reports a per-file failure
summary, and **exits non-zero if any upload fails** (safe for CI).

### Options (env vars)

| Var | Default | Purpose |
|---|---|---|
| `AWS_REGION` | `ap-southeast-1` | AWS region |
| `S3_BUCKET` | `opd-wallet` | override target bucket |
| `DEPLOY_ENV` | – | `staging` → `web-stage/` prefix |
| `UPLOAD_CONCURRENCY` | `16` | parallel uploads |
| `CLOUDFRONT_DISTRIBUTION_ID` | – | invalidate this distribution after upload |
| `S3_DISABLE_ACL` | – | set `1` for buckets with ACLs disabled (use a bucket policy instead) |
| `DRY_RUN` | – | set `1` to simulate without writing |

`bucket` and `cloudfrontDistributionId` can also be set in `projectconfig`.

CI example (no prompt):

```bash
AWS_ACCESS_KEY_ID=… AWS_SECRET_ACCESS_KEY=… AWS_REGION=ap-southeast-1 npm run deploy
```

Preview the export locally before deploying:

```bash
npm run preview           # serves ./out at http://localhost:3000
```

## Notes

- `images.unoptimized: true` is required — S3 has no Next.js image optimizer,
  so `next/image` serves the original files.
- `trailingSlash: true` emits `route/index.html` so routes resolve under S3.
- Objects are uploaded with `public-read` ACL — the bucket must allow ACLs.
