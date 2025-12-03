# AWS Deployment Guide for Viewesta Platform Backend

Complete guide to deploy the Viewesta backend on AWS with RDS PostgreSQL database.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Services Overview](#aws-services-overview)
3. [Step 1: Set Up RDS PostgreSQL Database](#step-1-set-up-rds-postgresql-database)
4. [Step 2: Configure Security Groups](#step-2-configure-security-groups)
5. [Step 3: Set Up S3 Bucket (Optional)](#step-3-set-up-s3-bucket-optional)
6. [Step 4: Create IAM User for Backend](#step-4-create-iam-user-for-backend)
7. [Step 5: Deploy Backend Application](#step-5-deploy-backend-application)
8. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
9. [Step 7: Initialize Database](#step-7-initialize-database)
10. [Step 8: Verify Deployment](#step-8-verify-deployment)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (optional, for CLI operations)
- GitHub repository with your code
- Domain name (optional, for custom domain)
- SendGrid account (for email)
- Flutterwave/Stripe accounts (for payments)

---

## AWS Services Overview

You'll need these AWS services:

| Service | Purpose | Cost Estimate |
|---------|---------|---------------|
| **RDS PostgreSQL** | Managed PostgreSQL database | ~$15-50/month (db.t3.micro) |
| **EC2 / ECS / Elastic Beanstalk** | Host backend application | ~$10-30/month (t3.micro) |
| **S3** | Store movie files/media | ~$0.023/GB/month |
| **IAM** | Manage access credentials | Free |
| **Route 53** | DNS (optional) | ~$0.50/month per hosted zone |
| **CloudFront** | CDN for media (optional) | Pay per use |

**Total Estimated Cost**: ~$25-80/month (depending on usage)

---

## Step 1: Set Up RDS PostgreSQL Database

### 1.1 Create RDS Instance

1. **Navigate to RDS Console**
   - Go to AWS Console → RDS → Databases
   - Click **Create database**

2. **Database Configuration**
   - **Engine**: PostgreSQL
   - **Version**: 15.x or 16.x (recommended)
   - **Template**: Free tier (for testing) or Production (for production)

3. **Settings**
   ```
   DB instance identifier: viewesta-db
   Master username: viewesta_admin
   Master password: [Generate a strong password - save this!]
   ```

   ⚠️ **IMPORTANT**: Save the master username and password securely. You'll need them for environment variables.

4. **Instance Configuration**
   - **DB instance class**: 
     - Development: `db.t3.micro` (1 vCPU, 1 GB RAM) - Free tier eligible
     - Production: `db.t3.small` or larger (2+ vCPU, 2+ GB RAM)

5. **Storage**
   - **Storage type**: General Purpose SSD (gp3)
   - **Allocated storage**: 20 GB (minimum, increase as needed)
   - **Storage autoscaling**: Enable (recommended)

6. **Connectivity**
   - **VPC**: Default VPC (or create custom VPC)
   - **Public access**: 
     - ✅ **Yes** (if backend is outside AWS or in different VPC)
     - ❌ **No** (if backend is in same VPC - more secure)
   - **VPC security group**: Create new or use existing
   - **Availability Zone**: No preference (or select closest to your backend)

7. **Database Authentication**
   - **Database authentication**: Password authentication
   - **Initial database name**: `viewesta_db` (or leave blank to create later)

8. **Additional Configuration**
   - **Backup retention period**: 7 days (production) or 1 day (development)
   - **Enable encryption**: ✅ Yes (recommended for production)
   - **Enable Enhanced monitoring**: Optional
   - **Enable Performance Insights**: Optional (costs extra)

9. **Click "Create database"**

### 1.2 Get Database Connection Details

After creation (takes 5-10 minutes), go to your database:

1. Click on your database instance name
2. Note these values from **Connectivity & security** tab:

   ```
   Endpoint: viewesta-db.xxxxx.us-east-1.rds.amazonaws.com
   Port: 5432
   Database name: postgres (or viewesta_db if you created it)
   Username: viewesta_admin
   Password: [The password you set]
   ```

   **Save these credentials securely!**

### 1.3 Create Application Database

If you didn't create the database during setup:

1. **Connect to RDS** using a PostgreSQL client (pgAdmin, DBeaver, or psql)
2. **Connection details**:
   ```
   Host: viewesta-db.xxxxx.us-east-1.rds.amazonaws.com
   Port: 5432
   Database: postgres
   Username: viewesta_admin
   Password: [Your password]
   ```

3. **Run SQL**:
   ```sql
   CREATE DATABASE viewesta_db;
   ```

---

## Step 2: Configure Security Groups

### 2.1 Database Security Group

1. **Go to RDS** → Your database → **Connectivity & security** → Security group
2. **Click on the security group** → **Edit inbound rules**

3. **Add Rule**:
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: 
     - If backend on EC2: Select the EC2 security group
     - If backend outside AWS: Your backend server's IP (e.g., 1.2.3.4/32)
     - For testing: 0.0.0.0/0 (⚠️ Remove after testing!)
   Description: Allow PostgreSQL from backend
   ```

4. **Save rules**

### 2.2 Backend Security Group (if using EC2)

1. **Go to EC2** → Security Groups → Create security group
2. **Inbound Rules**:
   ```
   Type: HTTP
   Port: 80
   Source: 0.0.0.0/0 (or your frontend IP)
   
   Type: HTTPS
   Port: 443
   Source: 0.0.0.0/0 (or your frontend IP)
   
   Type: SSH (for management)
   Port: 22
   Source: Your IP address
   ```

3. **Outbound Rules**: Allow all (default)

---

## Step 3: Set Up S3 Bucket (Optional)

For storing movie files and media:

1. **Go to S3** → Create bucket
2. **Bucket Configuration**:
   ```
   Bucket name: viewesta-movies-[your-unique-id]
   AWS Region: us-east-1 (or your preferred region)
   Block Public Access: ✅ Block all public access (recommended)
   Versioning: Enable (optional)
   Encryption: Enable (recommended)
   ```

3. **Create bucket**

4. **Create IAM Policy** (see Step 4)

---

## Step 4: Create IAM User for Backend

### 4.1 Create IAM User

1. **Go to IAM** → Users → Create user
2. **User name**: `viewesta-backend-user`
3. **Access type**: Programmatic access
4. **Click Next**

### 4.2 Attach Policies

**For S3 Access** (if using S3):
1. **Attach policies directly** → Search "S3"
2. **Select**: `AmazonS3FullAccess` (or create custom policy for specific bucket)

**For Systems Manager Parameter Store** (recommended for secrets):
1. **Attach policies** → Search "SystemsManager"
2. **Select**: `AmazonSSMReadOnlyAccess`

### 4.3 Save Credentials

After creation, you'll see:
```
Access key ID: AKIA...
Secret access key: [Save this immediately - shown only once!]
```

⚠️ **Save these credentials securely!** You'll need them for environment variables.

### 4.4 Alternative: Use IAM Roles (Recommended for EC2/ECS)

If deploying on EC2 or ECS, use IAM roles instead:

1. **Go to IAM** → Roles → Create role
2. **Trusted entity**: EC2 (or ECS task)
3. **Attach policies**: Same as above
4. **Attach role to EC2 instance** or ECS task definition

---

## Step 5: Deploy Backend Application

You have three main options:

### Option A: AWS Elastic Beanstalk (Easiest)

1. **Go to Elastic Beanstalk** → Create application
2. **Application name**: `viewesta-backend`
3. **Platform**: Node.js
4. **Platform branch**: Node.js 18 or 20
5. **Application code**: Upload your code or connect to GitHub
6. **Configure more options**:
   - **Capacity**: Single instance (free tier) or load balanced
   - **Load balancer**: Application Load Balancer
   - **Instances**: t3.micro (free tier eligible)
7. **Create environment**

### Option B: EC2 Instance

1. **Launch EC2 Instance**:
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04
   - **Instance type**: t3.micro (free tier) or t3.small
   - **Security group**: Use the one created in Step 2.2
   - **Key pair**: Create or select existing
   - **IAM role**: Attach the role from Step 4.4

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. **Install Dependencies**:
   ```bash
   # Amazon Linux
   sudo yum update -y
   sudo yum install -y nodejs npm git
   
   # Ubuntu
   sudo apt update
   sudo apt install -y nodejs npm git
   ```

4. **Clone and Setup**:
   ```bash
   git clone https://github.com/Samalync-Ltd/viewesta-backend.git
   cd viewesta-backend
   npm install
   ```

5. **Install PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   ```

6. **Create .env file** (see Step 6)

7. **Start Application**:
   ```bash
   pm2 start src/index.js --name viewesta-api
   pm2 save
   pm2 startup  # Enable auto-start on reboot
   ```

### Option C: ECS (Docker Containers)

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "src/index.js"]
   ```

2. **Build and Push to ECR**:
   ```bash
   aws ecr create-repository --repository-name viewesta-backend
   docker build -t viewesta-backend .
   docker tag viewesta-backend:latest [account].dkr.ecr.us-east-1.amazonaws.com/viewesta-backend:latest
   docker push [account].dkr.ecr.us-east-1.amazonaws.com/viewesta-backend:latest
   ```

3. **Create ECS Task Definition** and **Service**

---

## Step 6: Configure Environment Variables

### 6.1 Environment Variables Template

Create a `.env` file on your server or set in your deployment platform:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3000
API_VERSION=v1

# ============================================
# DATABASE CONFIGURATION (RDS)
# ============================================
# Get these from RDS Console → Your database → Connectivity & security
DB_HOST=viewesta-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=viewesta_db
DB_USER=viewesta_admin
DB_PASSWORD=YourStrongPasswordHere123!
DB_POOL_MAX=15
DB_POOL_MIN=2

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate strong random strings (use: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-jwt-secret
JWT_REFRESH_EXPIRE=30d

# ============================================
# AWS CONFIGURATION
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...  # From Step 4.3
AWS_SECRET_ACCESS_KEY=your-secret-access-key  # From Step 4.3
AWS_S3_BUCKET_NAME=viewesta-movies-your-unique-id

# ============================================
# EMAIL CONFIGURATION (SendGrid)
# ============================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxx  # Your SendGrid API key
EMAIL_FROM=noreply@viewesta.com
EMAIL_FROM_NAME=Viewesta Platform

# ============================================
# PAYMENT GATEWAYS
# ============================================
# Flutterwave (for African markets)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=xxxxxxxxxxxxx

# Stripe (for international)
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ============================================
# FRONTEND CONFIGURATION
# ============================================
FRONTEND_URL=https://app.viewesta.com  # Your frontend URL

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6.2 Where to Set Environment Variables

**Elastic Beanstalk**:
- Go to your environment → Configuration → Software → Environment properties
- Add each variable

**EC2**:
- Create `.env` file in project root
- Or use `/etc/environment` for system-wide vars
- Or use PM2 ecosystem file

**ECS**:
- Task definition → Container definitions → Environment variables
- Or use AWS Systems Manager Parameter Store (recommended)

**EC2 with PM2 Ecosystem** (Recommended):
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'viewesta-api',
    script: 'src/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'viewesta-db.xxxxx.us-east-1.rds.amazonaws.com',
      DB_PORT: 5432,
      DB_NAME: 'viewesta_db',
      DB_USER: 'viewesta_admin',
      DB_PASSWORD: 'YourPassword',
      // ... add all other variables
    }
  }]
};
```

Then start with: `pm2 start ecosystem.config.js`

### 6.3 Secure Credential Storage (Advanced)

**Use AWS Systems Manager Parameter Store**:

1. **Store secrets**:
   ```bash
   aws ssm put-parameter --name "/viewesta/db/password" --value "YourPassword" --type "SecureString"
   aws ssm put-parameter --name "/viewesta/jwt/secret" --value "YourJWTSecret" --type "SecureString"
   ```

2. **Retrieve in application** (modify `src/config/database.js`):
   ```javascript
   import { SSM } from 'aws-sdk';
   const ssm = new SSM({ region: process.env.AWS_REGION });
   
   const dbPassword = await ssm.getParameter({
     Name: '/viewesta/db/password',
     WithDecryption: true
   }).promise();
   ```

---

## Step 7: Initialize Database

### 7.1 Connect and Initialize

**Option A: From Your Local Machine**

1. **Install PostgreSQL client** (if not installed)
2. **Connect to RDS**:
   ```bash
   psql -h viewesta-db.xxxxx.us-east-1.rds.amazonaws.com \
        -U viewesta_admin \
        -d viewesta_db \
        -p 5432
   ```

3. **Or use the project scripts** (if your IP is allowed):
   ```bash
   # Set environment variables
   export DB_HOST=viewesta-db.xxxxx.us-east-1.rds.amazonaws.com
   export DB_PORT=5432
   export DB_NAME=viewesta_db
   export DB_USER=viewesta_admin
   export DB_PASSWORD=YourPassword
   export NODE_ENV=production
   
   # Run initialization
   npm run db:schema
   npm run db:seed  # Optional: add sample data
   ```

**Option B: From EC2 Instance**

1. **SSH into your EC2 instance**
2. **Navigate to project directory**
3. **Run**:
   ```bash
   npm run db:schema
   npm run db:seed
   ```

**Option C: Using SQL Files Directly**

1. **Connect to RDS** using pgAdmin or DBeaver
2. **Open** `database/schema.sql`
3. **Execute** the SQL script
4. **Optionally run** `database/seeds.sql` for sample data

### 7.2 Verify Database

```bash
npm run test:db
```

Should output:
```
✅ Database connection successful!
📅 Database time: ...
📋 Found X tables in database
```

---

## Step 8: Verify Deployment

### 8.1 Test Health Endpoint

```bash
curl https://your-backend-url/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 8.2 Test API Endpoints

```bash
# Test registration
curl -X POST https://your-backend-url/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Test login
curl -X POST https://your-backend-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 8.3 Check Logs

**Elastic Beanstalk**:
- Environment → Logs → Request logs

**EC2 with PM2**:
```bash
pm2 logs viewesta-api
```

**ECS**:
- CloudWatch Logs → Log groups → Your ECS log group

---

## Troubleshooting

### Database Connection Errors

**Error: "password authentication failed"**
- ✅ Verify `DB_USER` matches RDS master username exactly
- ✅ Check `DB_PASSWORD` has no extra spaces or quotes
- ✅ Ensure password doesn't contain special characters that need escaping
- ✅ Try resetting RDS master password if needed

**Error: "timeout" or "connection refused"**
- ✅ Check security group allows inbound PostgreSQL (port 5432) from your backend
- ✅ Verify RDS is publicly accessible (if backend is outside AWS)
- ✅ Check `DB_HOST` is the full endpoint (ends with `.rds.amazonaws.com`)
- ✅ Ensure RDS instance is running (not stopped)

**Error: "database does not exist"**
- ✅ Create database: `CREATE DATABASE viewesta_db;`
- ✅ Verify `DB_NAME` matches the created database

**Error: "SSL connection required"**
- ✅ Ensure `NODE_ENV=production` is set (enables SSL automatically)
- ✅ The code automatically enables SSL for AWS RDS connections

### Application Errors

**Error: "JWT_SECRET not set"**
- ✅ Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in environment variables
- ✅ Generate strong secrets: `openssl rand -base64 32`

**Error: "AWS credentials not found"**
- ✅ Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- ✅ Or attach IAM role to EC2/ECS instance

**Error: "CORS error"**
- ✅ Set `FRONTEND_URL` to your frontend domain
- ✅ Ensure frontend URL matches exactly (including https://)

### Performance Issues

**Database connection pool exhausted**
- ✅ Increase `DB_POOL_MAX` (but not more than RDS max connections)
- ✅ Check RDS instance size (upgrade if needed)
- ✅ Monitor RDS CloudWatch metrics

**High latency**
- ✅ Ensure backend and RDS are in same region
- ✅ Use RDS read replicas for read-heavy workloads
- ✅ Enable RDS Performance Insights

---

## Security Checklist

- [ ] RDS database is encrypted at rest
- [ ] Security groups only allow necessary ports
- [ ] Database password is strong and stored securely
- [ ] JWT secrets are strong random strings
- [ ] AWS credentials are stored securely (not in code)
- [ ] HTTPS is enabled (use Application Load Balancer or CloudFront)
- [ ] Regular database backups are enabled
- [ ] IAM users have least privilege access
- [ ] Environment variables are not logged
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled

---

## Cost Optimization Tips

1. **Use Reserved Instances** for RDS (save up to 40%)
2. **Use Spot Instances** for non-critical workloads
3. **Enable RDS storage autoscaling** (pay only for what you use)
4. **Use S3 Intelligent-Tiering** for media files
5. **Set up CloudWatch alarms** to monitor costs
6. **Use AWS Free Tier** for development/testing

---

## Next Steps

1. **Set up monitoring**: CloudWatch, Application Insights
2. **Configure backups**: Automated RDS snapshots
3. **Set up CI/CD**: AWS CodePipeline or GitHub Actions
4. **Add CDN**: CloudFront for static assets
5. **Enable logging**: CloudWatch Logs for application logs
6. **Set up alerts**: SNS notifications for errors

---

## Support & Resources

- **AWS RDS Documentation**: https://docs.aws.amazon.com/rds/
- **AWS EC2 Documentation**: https://docs.aws.amazon.com/ec2/
- **AWS Elastic Beanstalk**: https://docs.aws.amazon.com/elasticbeanstalk/
- **Project Issues**: GitHub repository issues

---

**Last Updated**: 2024
**Maintained by**: Viewesta Platform Team

