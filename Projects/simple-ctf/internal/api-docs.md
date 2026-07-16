# TechVault Corp - Internal API Documentation
# ============================================
# WARNING: INTERNAL USE ONLY - DO NOT DISTRIBUTE
# Last updated: 2024-01-10

## Authentication

All API requests require Bearer token authentication.

### POST /api/auth/login
Login endpoint.

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "sysadmin",
    "role": "admin"
  }
}
```

### GET /api/users
List all users. Admin only.

### GET /api/debug
Debug endpoint - returns system information.
NOTE: This endpoint should be disabled in production but currently isn't.

## CTF Flags

The CTF challenge contains multiple flags:
1. Reconnaissance flag (check robots.txt)
2. Source code analysis (check HTML comments)
3. Environment variables (check .env)
4. Crypto challenge (decode the base64 in backup/config.bak)
5. Authentication bypass (crack the MD5 hash)
6. Final flag (accessible in dashboard after login)

Default admin credentials: sysadmin / MD5("admin123")
