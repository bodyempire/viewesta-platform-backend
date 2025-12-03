# AWS RDS Database Setup Guide

This guide helps you configure your backend to connect to AWS RDS PostgreSQL.

## 1. Get Your RDS Connection Details

From your AWS RDS console, note these values:

- **Endpoint**: `your-db.xxxxx.us-east-1.rds.amazonaws.com` (this is your `DB_HOST`)
- **Port**: Usually `5432` for PostgreSQL
- **Database Name**: The database you created (or `postgres` as default)
- **Master Username**: The username you set when creating the RDS instance
- **Master Password**: The password you set when creating the RDS instance

## 2. Configure Environment Variables

Create a `.env` file in your project root (or set these in your deployment platform):

```env
# Database Configuration for AWS RDS
DB_HOST=your-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=viewesta_db
DB_USER=your_master_username
DB_PASSWORD=your_master_password

# Required for AWS RDS
NODE_ENV=production

# Optional: Connection Pool Settings
DB_POOL_MAX=15
DB_POOL_MIN=2
```

## 3. Common Authentication Errors & Solutions

### Error: "password authentication failed"

**Causes:**
- Wrong username or password
- Username/password have extra spaces or quotes
- Password contains special characters that need escaping

**Solutions:**
1. **Double-check credentials**: Copy-paste directly from AWS RDS console
2. **Remove quotes**: Don't wrap password in quotes in `.env` file
   ```env
   # ❌ Wrong
   DB_PASSWORD="my@password#123"
   
   # ✅ Correct
   DB_PASSWORD=my@password#123
   ```
3. **URL encode special characters**: If password has `@`, `#`, `%`, etc., you may need to URL encode:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `%` becomes `%25`
   - `&` becomes `%26`
4. **Verify master username**: Make sure `DB_USER` matches exactly what you set in RDS

### Error: "timeout" or "connection refused"

**Causes:**
- Security group not allowing connections
- Wrong endpoint/host
- RDS instance not publicly accessible (if needed)

**Solutions:**
1. **Check Security Group**: 
   - Go to RDS → Your instance → Connectivity & security → VPC security groups
   - Edit inbound rules → Add rule:
     - Type: PostgreSQL
     - Port: 5432
     - Source: Your backend server's IP or security group (or `0.0.0.0/0` for testing only)

2. **Verify Public Accessibility**:
   - RDS → Your instance → Connectivity & security
   - If "Publicly accessible" is "No", either:
     - Enable it (for testing), OR
     - Connect from within same VPC/security group

3. **Check Endpoint**: Make sure `DB_HOST` is the full endpoint, not just the instance name

### Error: "database does not exist"

**Causes:**
- Database name doesn't exist in RDS instance

**Solutions:**
1. Connect to RDS using a SQL client (pgAdmin, DBeaver, etc.)
2. Create the database:
   ```sql
   CREATE DATABASE viewesta_db;
   ```
3. Or use the default `postgres` database temporarily

## 4. Test Your Connection

Run the diagnostic script:

```bash
npm run test:db
```

This will:
- Show your current configuration (without exposing password)
- Test the connection
- Provide specific error messages if it fails

## 5. Initialize Database Schema

Once connected, initialize your database:

```bash
npm run db:schema
npm run db:seed  # Optional: add sample data
```

## 6. Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use IAM database authentication** (advanced) - More secure than password auth
3. **Restrict security groups** - Only allow connections from your backend server
4. **Use SSL** - Already enabled in production mode
5. **Rotate passwords regularly** - Change RDS master password periodically

## 7. Environment Variables for Different Platforms

### AWS Elastic Beanstalk
Set environment variables in: Configuration → Software → Environment properties

### AWS EC2 / ECS
- Use AWS Systems Manager Parameter Store
- Or use `.env` file (keep it secure)
- Or use environment variables in your deployment config

### Render / Railway / Other Platforms
Set in the platform's environment variables section

## 8. Troubleshooting Checklist

- [ ] `DB_HOST` is the full RDS endpoint (ends with `.rds.amazonaws.com`)
- [ ] `DB_PORT` is `5432` (or your custom port)
- [ ] `DB_USER` matches RDS master username exactly
- [ ] `DB_PASSWORD` has no extra quotes or spaces
- [ ] `DB_NAME` exists in your RDS instance
- [ ] Security group allows inbound connections on port 5432
- [ ] RDS instance is running (not stopped)
- [ ] `NODE_ENV=production` is set (enables SSL)
- [ ] Backend server can reach RDS (same VPC or public access enabled)

## 9. Quick Connection String Format

If you prefer connection strings, you can parse them:

```env
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://username:password@your-db.xxxxx.us-east-1.rds.amazonaws.com:5432/viewesta_db
```

Then parse it in your code (not currently implemented, but can be added).

