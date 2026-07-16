# TechVault Corp CTF - Walkthrough

## Overview
This is a multi-stage CTF challenge simulating a corporate website with multiple security vulnerabilities. The goal is to find all flags by exploiting different attack vectors.

**Difficulty:** Beginner-Intermediate
**Estimated time:** 30-60 minutes
**Flags to find:** 6

---

## Flag 1: Reconnaissance
**Location:** `robots.txt`
**Vulnerability:** Information Disclosure

1. Visit the main page and explore
2. Check `robots.txt` at `/robots.txt`
3. You'll find hidden paths: `/admin/`, `/dev/`, `/backup/`, `/internal/`, `/.env`
4. **Flag:** `flag{r3c0nn4ss4nc3_1s_k3y}`

---

## Flag 2: Source Code Analysis
**Location:** `index.html` (HTML comment)
**Vulnerability:** Information Leakage in Comments

1. View the page source of `index.html`
2. Look for HTML comments (Ctrl+F for `<!--`)
3. Find the comment: `<!-- TODO: Remove debug panel before production deploy -->`
4. **Flag:** `flag{h1dd3n_1n_pl41n_s1ght}`

---

## Flag 3: Environment Variables
**Location:** `.env`
**Vulnerability:** Exposed Configuration Files

1. From robots.txt, you know `.env` exists
2. Navigate to `/.env`
3. Read the file contents
4. The JWT_SECRET contains the flag
5. **Flag:** `flag{3nv_v4r14bl3s_sh0uld_n3v3r_b3_3xp0s3d}`

---

## Flag 4: Backup File Discovery
**Location:** `backup/config.bak`
**Vulnerability:** Exposed Backup Files

1. From robots.txt, navigate to `/backup/`
2. Download `config.bak`
3. Read the `internal_notes` field
4. It contains a base64 string: `ZmxhZ3tjbGllbnRfc2lkZV9hdXRoX2lzX25vX2F1dGh9`
5. Decode it: `flag{client_side_auth_is_no_auth}`
6. **Flag:** `flag{client_side_auth_is_no_auth}`

---

## Flag 5: JavaScript Analysis & Hash Cracking
**Location:** `js/auth.js` + Login Page
**Vulnerability:** Hardcoded Credentials + Weak Hashing

1. View the source of `js/auth.js`
2. Find the `ADMIN_CREDENTIALS` object
3. You'll see the username `sysadmin` and password hash `0192023a7bbd73250516f069df18b500`
4. The hash algorithm is MD5 (insecure!)
5. Use an online MD5 cracker (like crackstation.net) or rainbow tables
6. The hash decodes to: `admin123`
7. Login with `sysadmin` / `admin123`
8. **Flag:** `flag{cr4ck3d_th3_h4sh_w1th_r41nb0w_t4bl3s}`

---

## Flag 6: Final Flag - Dashboard Access
**Location:** `dashboard.html`
**Vulnerability:** Client-Side Authentication Bypass

1. After logging in with the cracked credentials
2. The dashboard reveals the final flag
3. **Flag:** `flag{y0u_4r3_th3_t3chv4ult_m4st3r}`

---

## Bonus: Console Exploration

When you visit the site, open the browser console (F12). You'll notice:
- Debug messages logged
- A `TechVaultAuth` object available globally
- Version information exposed
- API endpoints documented in console output

Try running in the console:
```javascript
TechVaultAuth.getConfig()
TechVaultAuth.login('sysadmin', 'admin123')
```

---

## Lessons Learned

1. **Never commit secrets to version control** (.env files)
2. **Server-side authentication is mandatory** - client-side checks can be bypassed
3. **Use bcrypt/argon2 instead of MD5** for password hashing
4. **Remove debug endpoints in production**
5. **Don't expose sensitive info in comments** or source code
6. **Secure backup files** - they shouldn't be publicly accessible
7. **Implement proper access controls** on sensitive files
8. **Use environment-specific configurations** (dev vs prod)

---

## Flag Summary

| # | Flag | Location | Vulnerability |
|---|------|----------|--------------|
| 1 | `flag{r3c0nn4ss4nc3_1s_k3y}` | robots.txt | Info Disclosure |
| 2 | `flag{h1dd3n_1n_pl41n_s1ght}` | index.html | HTML Comments |
| 3 | `flag{3nv_v4r14bl3s_sh0uld_n3v3r_b3_3xp0s3d}` | .env | Exposed Config |
| 4 | `flag{client_side_auth_is_no_auth}` | backup/config.bak | Backup Files |
| 5 | `flag{cr4ck3d_th3_h4sh_w1th_r41nb0w_t4bl3s}` | auth.js | Weak Hashing |
| 6 | `flag{y0u_4r3_th3_t3chv4ult_m4st3r}` | dashboard.html | Client Auth |

Good luck, and happy hacking! 🔐
