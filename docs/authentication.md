# Authentication System Overview

Your Viewesta backend uses **JWT (JSON Web Token) based authentication** for API access, and **PostgreSQL username/password authentication** for database connections.

---

## 1. API User Authentication (JWT)

### How It Works

1. **Registration/Login**: Users register or login with email and password
2. **Token Generation**: Server generates JWT tokens (access + refresh)
3. **Token Usage**: Client sends token in `Authorization: Bearer <token>` header
4. **Token Verification**: Middleware verifies token and attaches user to request

### Authentication Flow

```
User Registration/Login
    ↓
Email + Password (hashed with bcrypt)
    ↓
Server generates JWT tokens
    ↓
Client stores tokens
    ↓
Client sends token in Authorization header
    ↓
Middleware verifies token
    ↓
Protected routes access user data
```

### Token Types

#### Access Token
- **Purpose**: Authenticate API requests
- **Expires**: 7 days (configurable via `JWT_EXPIRE`)
- **Secret**: `JWT_SECRET` (from environment variables)
- **Contains**: `{ id: userId, userType: 'viewer'|'admin'|'creator' }`

#### Refresh Token
- **Purpose**: Get new access tokens without re-login
- **Expires**: 30 days (configurable via `JWT_REFRESH_EXPIRE`)
- **Secret**: `JWT_REFRESH_SECRET` (or falls back to `JWT_SECRET`)
- **Contains**: `{ id: userId }`

### Password Security

- **Hashing**: Passwords are hashed using **bcrypt** with **12 salt rounds**
- **Never stored**: Plain passwords are never stored in the database
- **Verification**: `bcrypt.compare()` is used to verify passwords

### Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/v1/auth/register` | POST | No | Register new user |
| `/api/v1/auth/login` | POST | No | Login user |
| `/api/v1/auth/me` | GET | Yes | Get current user profile |
| `/api/v1/auth/profile` | PUT | Yes | Update user profile |
| `/api/v1/auth/change-password` | PUT | Yes | Change password |
| `/api/v1/auth/request-verify` | POST | No | Request email verification |
| `/api/v1/auth/verify` | POST | No | Verify email with token |
| `/api/v1/auth/request-reset` | POST | No | Request password reset |
| `/api/v1/auth/reset` | POST | No | Reset password with token |

### Using Authentication in Requests

**Example Login:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Example Protected Request:**
```bash
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware

#### `protect` - Required Authentication
- Verifies JWT token
- Checks if user exists and is active
- Attaches `req.user` with `{ id, email, userType }`
- Returns 401 if token is missing/invalid

#### `authorize(...roles)` - Role-Based Access
- Must be used after `protect`
- Checks if user has required role (`viewer`, `admin`, `creator`)
- Returns 403 if user doesn't have permission

#### `optionalAuth` - Optional Authentication
- Tries to authenticate if token is provided
- Doesn't fail if token is missing/invalid
- Useful for public endpoints that show different data for logged-in users

### User Types (Roles)

- **`viewer`**: Regular user (default)
- **`admin`**: Platform administrator
- **`creator`**: Content creator

---

## 2. Database Authentication (PostgreSQL)

### How It Works

The backend connects to PostgreSQL using **username/password authentication** from environment variables.

### Connection Configuration

```env
DB_HOST=localhost                    # or AWS RDS endpoint
DB_PORT=5432                        # PostgreSQL port
DB_NAME=viewesta_db                 # Database name
DB_USER=postgres                    # Database username
DB_PASSWORD=your_password_here      # Database password
```

### Security Features

1. **SSL Support**: 
   - Automatically enabled for AWS RDS
   - Disabled for localhost connections
   - Uses `rejectUnauthorized: false` for self-signed certificates

2. **Connection Pooling**:
   - Min connections: 2 (configurable)
   - Max connections: 20 (configurable)
   - Prevents connection exhaustion

3. **Password Handling**:
   - Passwords are read from environment variables
   - Special characters are preserved
   - URL encoding is supported for AWS RDS

### Testing Database Connection

```bash
npm run test:db
```

This will:
- Show your database configuration (password masked)
- Test the connection
- Provide specific error messages if connection fails

---

## 3. Environment Variables Required

### JWT Authentication
```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d
```

### Database Authentication
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viewesta_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_POOL_MAX=20
DB_POOL_MIN=2
```

---

## 4. Security Best Practices

### ✅ Implemented

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens with expiration
- [x] Refresh token mechanism
- [x] Email verification
- [x] Password reset with tokens
- [x] Role-based access control
- [x] SSL for database connections (production)
- [x] Environment variables for secrets
- [x] User account activation check

### 🔒 Recommendations

1. **Rotate JWT secrets** periodically
2. **Use HTTPS** in production (SSL/TLS)
3. **Rate limit** authentication endpoints
4. **Log authentication failures** for security monitoring
5. **Implement 2FA** for admin accounts (future enhancement)
6. **Use strong passwords** for database connections
7. **Restrict database access** by IP/security groups (AWS)

---

## 5. Common Authentication Errors

### "Not authorized to access this route"
- **Cause**: Missing or invalid JWT token
- **Fix**: Include `Authorization: Bearer <token>` header

### "Invalid or expired token"
- **Cause**: Token expired or secret mismatch
- **Fix**: Login again to get new token, or use refresh token

### "User account is inactive"
- **Cause**: User's `is_active` flag is false
- **Fix**: Admin must activate the account

### "Password authentication failed" (Database)
- **Cause**: Wrong database username/password
- **Fix**: Verify `DB_USER` and `DB_PASSWORD` in `.env`

### "The server does not support SSL connections"
- **Cause**: Local database doesn't support SSL
- **Fix**: SSL is automatically disabled for localhost (already handled)

---

## 6. Code Examples

### Protecting a Route

```javascript
import { protect, authorize } from '../middleware/authMiddleware.js';

// Require authentication
router.get('/movies', protect, getMovies);

// Require authentication + specific role
router.delete('/movies/:id', protect, authorize('admin'), deleteMovie);
```

### Accessing Authenticated User

```javascript
export const getMovies = async (req, res) => {
  const userId = req.user.id;        // From protect middleware
  const userType = req.user.userType; // 'viewer', 'admin', or 'creator'
  
  // Use userId to filter user-specific data
  const movies = await Movie.findByUserId(userId);
  res.json({ success: true, data: movies });
};
```

---

## 7. Testing Authentication

### Test Database Connection
```bash
npm run test:db
```

### Test API Endpoints
```bash
npm run test:api
```

### Manual Testing with curl

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Get Profile (Protected):**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Summary

- **API Auth**: JWT tokens (access + refresh) with bcrypt password hashing
- **Database Auth**: PostgreSQL username/password from environment variables
- **Security**: SSL for production databases, password hashing, token expiration
- **Roles**: viewer, admin, creator with role-based access control
- **Features**: Email verification, password reset, account activation

For AWS deployment, ensure all environment variables are set correctly in your hosting platform's configuration.

