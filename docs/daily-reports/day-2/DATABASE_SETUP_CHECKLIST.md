# Day 2 - Database Setup Checklist

## ✅ **Pre-Setup Verification**

### **System Requirements**
- [ ] PostgreSQL 13+ installed
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Git installed
- [ ] PowerShell (Windows) or Terminal (Mac/Linux)

### **PostgreSQL Verification**
```bash
# Check PostgreSQL version
psql --version

# Check if PostgreSQL service is running
# Windows: Check Services.msc for "postgresql" service
# Mac/Linux: sudo systemctl status postgresql
```

---

## 🔧 **Database Setup Process**

### **Step 1: Create PostgreSQL User**
```bash
# Create superuser (if not exists)
createuser -s isaac

# Set password for user
psql -U postgres -c "ALTER USER isaac PASSWORD 'your_password_here';"

# Grant database creation privileges
psql -U postgres -c "ALTER USER isaac CREATEDB;"
```

### **Step 2: Create Database**
```bash
# Create the database
createdb -U isaac viewesta_db

# Verify database creation
psql -U isaac -d viewesta_db -c "SELECT current_database();"
```

### **Step 3: Environment Configuration**
```bash
# Navigate to database package
cd packages/database

# Create .env file
cp env.example .env

# Edit .env file with your actual password
# DB_PASSWORD=your_actual_password_here
```

### **Step 4: Install Dependencies**
```bash
# Install Node.js packages
npm install

# Verify installation
npm list
```

### **Step 5: Run Database Setup**
```bash
# Option A: Automated setup
npm run setup

# Option B: Manual setup
npm run init    # Create tables
npm run seed    # Add sample data
```

---

## 🧪 **Verification Tests**

### **Test 1: Database Connection**
```bash
# Test connection
npm test

# Expected output:
# ✅ Database connection successful!
# 📅 Current database time: [timestamp]
# 📋 Existing tables: [list of tables]
```

### **Test 2: Table Verification**
```bash
# Check all tables exist
psql -U isaac -d viewesta_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

# Expected: 14 tables
# categories, downloads, movie_pricing, movie_purchases, 
# movie_reviews, movies, subscriptions, transactions, 
# user_favorites, user_profiles, user_wallets, 
# user_watchlists, users, watch_history
```

### **Test 3: Sample Data Verification**
```bash
# Check categories
psql -U isaac -d viewesta_db -c "SELECT COUNT(*) FROM categories;"
# Expected: 3 or more

# Check users
psql -U isaac -d viewesta_db -c "SELECT COUNT(*) FROM users;"
# Expected: 3 or more
```

### **Test 4: Schema Verification**
```bash
# Check users table structure
psql -U isaac -d viewesta_db -c "\d users"

# Expected columns:
# id (uuid), email (varchar), password_hash (varchar), 
# first_name (varchar), last_name (varchar), 
# user_type (varchar), is_verified (boolean), 
# is_active (boolean), created_at (timestamp), 
# updated_at (timestamp)
```

---

## 🐛 **Troubleshooting Guide**

### **Issue: Password Authentication Failed**
**Error**: `FATAL: password authentication failed for user "isaac"`

**Solutions**:
1. **Reset Password**:
   ```bash
   psql -U postgres -c "ALTER USER isaac PASSWORD 'new_password';"
   ```

2. **Check User Exists**:
   ```bash
   psql -U postgres -c "SELECT usename FROM pg_user WHERE usename = 'isaac';"
   ```

3. **Create User** (if doesn't exist):
   ```bash
   createuser -s isaac
   psql -U postgres -c "ALTER USER isaac PASSWORD 'password';"
   ```

### **Issue: Database Does Not Exist**
**Error**: `FATAL: database "viewesta_db" does not exist`

**Solution**:
```bash
createdb -U isaac viewesta_db
```

### **Issue: Permission Denied**
**Error**: `FATAL: permission denied for database "viewesta_db"`

**Solution**:
```bash
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE viewesta_db TO isaac;"
```

### **Issue: Tables Already Exist**
**Error**: `ERROR: relation "users" already exists`

**Solution**:
```bash
# Drop existing tables
psql -U isaac -d viewesta_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run schema
psql -U isaac -d viewesta_db -f init.sql
```

### **Issue: Node.js Connection Fails**
**Error**: `Database connection failed`

**Solutions**:
1. **Check .env file**:
   ```bash
   # Ensure .env file exists in packages/database/
   cat .env
   ```

2. **Verify password**:
   ```bash
   # Test with psql first
   psql -U isaac -d viewesta_db -c "SELECT 1;"
   ```

3. **Check environment variables**:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.DB_PASSWORD);"
   ```

---

## 📋 **Success Criteria**

### **Day 2 Complete When:**
- [ ] PostgreSQL user `isaac` exists and has password
- [ ] Database `viewesta_db` exists and accessible
- [ ] All 14 tables created successfully
- [ ] Sample data inserted (categories, users)
- [ ] Node.js connection test passes
- [ ] Environment file configured
- [ ] Dependencies installed
- [ ] Documentation reviewed

### **Ready for Day 3 When:**
- [ ] Database schema fully functional
- [ ] Connection pool working
- [ ] Sample data verified
- [ ] All tests passing
- [ ] Environment configured
- [ ] Team can connect to database

---

## 🚀 **Next Steps**

### **Day 3 Preparation**
1. **Review Authentication Requirements**
2. **Install JWT and bcrypt dependencies**
3. **Plan user registration/login flow**
4. **Design API endpoints structure**

### **Files to Create Tomorrow**
- `apps/backend/src/auth/auth.js`
- `apps/backend/src/models/userModel.js`
- `apps/backend/src/routes/authRoutes.js`
- `apps/backend/src/middlewares/authMiddleware.js`

---

**Checklist Created**: October 26, 2025  
**For**: Day 2 Database Setup  
**Next**: Day 3 Authentication Implementation
