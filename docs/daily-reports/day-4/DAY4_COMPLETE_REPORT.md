# Viewesta Day 4 — AWS S3 Integration & Verification

Date: October 30, 2025  
Scope: Backend S3 integration, environment configuration, runtime verification, and API routes  
Status: ✅ Complete

---

## 🎯 Objectives
- Configure AWS credentials and S3 bucket for media storage
- Verify runtime AWS connectivity (STS + S3)
- Implement backend S3 upload capability
- Provide repeatable verification steps and health checks

---

## ✅ What We Implemented
- AWS SDK available in backend (`aws-sdk` v2)
- Environment variables wired (`AWS_S3_BUCKET`, `AWS_REGION`, etc.)
- S3 connectivity verified via STS and S3 list/get/put/delete
- API Routes in backend:
  - `POST /api/s3/upload` — accepts multipart file upload and stores in S3
  - `GET /api/s3/test-upload` — small server-side text upload for quick health checks
- ACL issue resolved by removing ACL for buckets with Object Ownership enforced

---

## ⚙️ Environment Variables
- Required at runtime (backend):
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (e.g., `us-east-1`)
  - `AWS_S3_BUCKET` (e.g., `viewesta-movies-bucket-2025`)

Reference templates:
```62:68:env.template
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=viewesta-movies-dev
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=your_cloudfront_domain.cloudfront.net
```

```22:28:packages/database/env.example
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=viewesta-movies
AWS_S3_REGION=us-east-1
```

---

## 🧩 Backend Implementation
Dependency:
```19:23:apps/backend/package.json
"dependencies": {
  "aws-sdk": "^2.1490.0",
```

Routes added/updated:
```16:35:apps/backend/src/routes/s3Routes.js
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `movies/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const result = await s3.upload(params).promise();
    res.status(200).json({ message: 'File uploaded successfully!', url: result.Location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'S3 upload failed', details: err.message });
  }
});
```

```38:56:apps/backend/src/routes/s3Routes.js
router.get('/test-upload', async (req, res) => {
  try {
    const key = `healthcheck/api-${Date.now()}.txt`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: 'Viewesta API route connectivity test',
      ContentType: 'text/plain'
    };
    const result = await s3.upload(params).promise();
    return res.status(200).json({ message: 'Test upload successful', key, url: result.Location });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'S3 test upload failed', details: err.message });
  }
});
```

Routes are mounted in the backend app:
```71:76:apps/backend/src/index.js
const s3Routes = require('./routes/s3Routes');
app.use('/api/s3', s3Routes);
```

---

## 🔎 Verification Steps (Windows)

Set the bucket and start the backend (example on alternate port):
```bash
# From repo root
cd apps/backend
$env:PORT="3002"; $env:AWS_S3_BUCKET="viewesta-movies-bucket-2025"; node src/index.js
```

Health check:
```bash
cmd /C curl.exe -sS http://localhost:3002/health
```

Quick server-side S3 test upload:
```bash
cmd /C curl.exe -sS http://localhost:3002/api/s3/test-upload
# Response contains: { message, key, url }
```

Manual runtime credential test (STS):
```bash
node -e "require('dotenv').config(); const AWS=require('aws-sdk'); const sts=new AWS.STS(); sts.getCallerIdentity({}, (e,d)=>{ if(e){console.error(e)} else {console.log(d)} });"
```

List a few objects in your bucket:
```bash
$env:AWS_S3_BUCKET="viewesta-movies-bucket-2025"; \
node -e "const AWS=require('aws-sdk'); const s3=new AWS.S3(); const b=process.env.AWS_S3_BUCKET; s3.listObjectsV2({Bucket:b,MaxKeys:5},(e,d)=>{ if(e){console.error(e.code||e.message)} else {console.log('KeyCount:',d.KeyCount,(d.Contents||[]).map(o=>o.Key))} });"
```

Cleanup example:
```bash
node -e "const AWS=require('aws-sdk'); const s3=new AWS.S3(); s3.deleteObject({Bucket:'viewesta-movies-bucket-2025',Key:'healthcheck/example.txt'},(e)=>{ if(e){console.error(e.code||e.message)} else {console.log('Deleted')} });"
```

---

## 🧪 Evidence Collected
- STS identity returned successfully for the active IAM user/account
- S3 ListObjectsV2 executed against the provided bucket
- Test object uploaded via server route and accessible at returned URL
- Object deleted successfully after verification

Example successful response:
```start:end:apps/backend/example
{"message":"Test upload successful","key":"healthcheck/api-<timestamp>.txt","url":"https://<bucket>.s3.amazonaws.com/healthcheck/api-<timestamp>.txt"}
```

---

## 🐛 Issues & Resolutions
- Error: "The bucket does not allow ACLs"
  - Cause: Bucket has Object Ownership (Bucket owner enforced) — ACLs disabled
  - Fix: Removed `ACL` from upload params in both routes

- PowerShell quoting issues with multipart uploads
  - Used `curl.exe` directly or `cmd /C` to bypass quoting pitfalls

---

## 📌 Current Endpoints Summary
- `GET /health` — service status
- `POST /api/s3/upload` — multipart upload field name: `file`
- `GET /api/s3/test-upload` — creates a small text object for verification

---

## ▶️ Next Steps (Day 5 Plan)
Aligned with `docs/planning/Viewesta_Deep_Workflow.md` and our current state:

### Immediate (Week 1 continuation)
- Day 5: Integrate SendGrid (email verification + password reset)
  - Add `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
  - Implement email service and templates (verification, reset)
  - Add endpoints: `POST /api/auth/request-verify`, `POST /api/auth/verify`, `POST /api/auth/request-reset`, `POST /api/auth/reset`
- Day 6: Setup CI/CD
  - GitHub Actions for backend (build, lint, test)
  - Add environment and deployment secrets
  - Optional: Dev deploy to AWS EC2 or Render/Fly.io
- Day 7: Testing & Docs
  - Backend endpoint tests (auth + s3)
  - Update API docs and runbook (S3 health, email test)
  - Env cleanup and sample `.env` updates

### Weeks 2–4 preview (from Deep Workflow)
- Week 2 (Frontend Base)
  - Routing and layout (web + mobile)
  - Pages: Home, Movies, About, Login, Register
  - Connect mock APIs; set up theme/dark mode and responsiveness
- Weeks 3–4 (Backend Movie & User System)
  - Movie model + CRUD, categories/genres
  - Integrate upload route with S3 for movies/trailers (current S3 base is ready)
  - Watchlist, comments, ratings/reviews
  - Payments (Flutterwave/Stripe) and subscriptions
  - Transactions history and wallet endpoints

### Platform hygiene
- Keep `GET /api/s3/test-upload` as an ops health endpoint (or restrict to admin)
- Plan AWS SDK v3 migration (modular packages, tree-shaking)
- Add CloudWatch logging/correlation IDs and structured logs

---

## ✅ Conclusion
Day 4 is complete. AWS S3 is fully configured and verified end-to-end with working backend routes, documented procedures, and operational checks.


