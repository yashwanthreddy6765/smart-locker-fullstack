# Deployment Guide - Smart Storage Locker Management System

## ⚠️ SECURITY NOTICE

**BEFORE DEPLOYING:** You must enable Row-Level Security (RLS) on your Supabase database to fix critical security vulnerabilities. See `SECURITY_SETUP.md` for complete instructions.

---

## What To Deploy Where

This assignment uses Django REST Framework for the backend and React/Vite for the frontend.

Use this free deployment setup:

- Frontend: Vercel
- Backend API: Render
- Database: Supabase PostgreSQL (RLS enabled)
- Code hosting: GitHub

Vercel should host only the React frontend. The Django backend should run on Render because this project is a Django REST API, not a Next.js serverless backend.

## Requirement Checklist

- User registration: `POST /api/auth/register/`
- Login with JWT: `POST /api/auth/login/`
- Token refresh: `POST /api/auth/refresh/`
- JWT-protected API endpoints
- Admin/User role-based access using Django `is_staff`
- Locker create/list/detail/update/deactivate
- Reservation create/list/detail/release
- Admin can view all reservations
- User can view/release own reservations
- React pages for login, register, lockers, reservations, admin reservations
- Tailwind CSS responsive UI
- **Row-Level Security (RLS) enabled on Supabase** ✅

## 1. Security Setup (FIRST - CRITICAL)

### Step 1.1: Enable Supabase Row-Level Security

**IMPORTANT:** Do this BEFORE deploying to production!

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `backend/sql/01_enable_rls.sql`
5. Paste into the editor
6. Click **Run**

This will:
- Enable RLS on all tables
- Block anonymous API access
- Allow Django backend full access
- Protect sensitive data

**Verification:** Run this query to confirm RLS is enabled:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `rowsecurity = t` (true).

---

## 2. Push Latest Code To GitHub

Open PowerShell:

```powershell
cd "C:\Users\yaswa\OneDrive\Desktop\Fullstack"
git add .
git commit -m "Add security setup and RLS configuration"
git push
```

If this is your first push:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

If remote already exists:

```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 3. Supabase Database

### 3.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click `New project`.
3. Fill project name and database password.
4. Click `Create new project`.
5. Open the project.

### 3.2 Get Database Connection String

1. Click `Connect` at the top of the dashboard.
2. Choose `Session pooler`.
3. Copy the PostgreSQL connection string.
4. Replace `[YOUR-PASSWORD]` with your database password.

Keep this value for Render:

```text
DATABASE_URL=postgres://...
```

### 3.3 Enable Row-Level Security (CRITICAL!)

See **Section 1: Security Setup** above.

---

## 4. Render Backend Deployment

### 4.1 Create Web Service

1. Go to https://dashboard.render.com/
2. Click `New +`.
3. Click `Web Service`.
4. Select your GitHub repository.
5. Fill these settings:

```text
Name: smart-locker-api
Runtime: Python
Root Directory: backend
Build Command: bash build.sh
Start Command: gunicorn config.wsgi:application
Instance Type: Free
```

### 4.2 Configure Environment Variables

Click `Environment Variables` and add:

```text
DEBUG=False
SECRET_KEY=make-a-long-random-secret-key-min-50-chars
DATABASE_URL=your-supabase-session-pooler-url
ALLOWED_HOSTS=your-render-service-name.onrender.com,localhost
CSRF_TRUSTED_ORIGINS=https://your-render-service-name.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-project.vercel.app,http://localhost:5173
ADMIN_SECRET_CODE=your-admin-registration-code
```

### 4.3 Deploy

1. Click `Create Web Service`.
2. Wait until status becomes `Live` (2-5 minutes).

### 4.4 Test Backend

```bash
# Should return 401 (good - requires authentication)
curl https://your-render-service-name.onrender.com/api/lockers/

# Response should be:
# {"detail":"Authentication credentials were not provided."}
```

---

## 5. Create Admin User On Render

1. Open your Render web service.
2. Click `Shell` in the left sidebar.
3. Run:

```bash
python manage.py createsuperuser
```

4. Use this admin account to log in from the frontend.

---

## 6. Vercel Frontend Deployment

### 6.1 Create Vercel Project

1. Go to https://vercel.com
2. Import your GitHub repository
3. Select project root: `frontend`

### 6.2 Configure Build Settings

1. Go to `Settings` → `Build and Development Settings`
2. Confirm:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 6.3 Add Environment Variable

1. Go to `Settings` → `Environment Variables`
2. Add:

```text
VITE_API_BASE_URL=https://your-render-service-name.onrender.com/api
```

### 6.4 Deploy

1. Go to `Deployments`
2. Click the three dots on the latest deployment
3. Click `Redeploy`

---

## 7. Final Test Flow

Open your Vercel URL:

```text
https://your-vercel-project.vercel.app
```

### Test as Admin:

1. Click **Login**
2. Use the `createsuperuser` account you created
3. Go to **Lockers**
4. Click **Add Locker**
5. Fill in details:
   - Locker Number: `L-001`
   - Location: `Floor 1`
   - Size: `Medium`
6. Click **Create**
7. Confirm locker appears in list
8. Go to **All Reservations**
9. Confirm page loads (empty or with existing reservations)

### Test as User:

1. Click **Logout** (or open in private/incognito window)
2. Click **Register**
3. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `SecurePass123`
   - Leave "Admin Registration Code" empty
4. Click **Register**
5. Login with new credentials
6. Go to **Lockers**
7. Find an AVAILABLE locker
8. Click **Reserve**
9. Set date/time in future
10. Click **Reserve**
11. Go to **My Reservations**
12. Confirm reservation appears
13. Click **Release** to release locker

---

## Common Fixes

### Frontend opens but login fails

**Error:** "Network error" or "Cannot reach API"

**Check:**
1. Vercel environment variable `VITE_API_BASE_URL` is correct
2. Render backend is deployed and `Live` status
3. Test backend is accessible: `https://your-render-api.onrender.com/api/lockers/`

**Fix:**
1. Update Vercel environment variable
2. Redeploy Vercel

```powershell
# Or use Vercel CLI
vercel env pull
# Edit .env.local
vercel deploy --prod
```

### Browser shows CORS error

**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Cause:** Frontend domain not in `CORS_ALLOWED_ORIGINS`

**Fix:**
1. Go to Render service
2. Edit environment variable `CORS_ALLOWED_ORIGINS`
3. Add your Vercel domain: `https://your-vercel-project.vercel.app`
4. Click **Deploy** to redeploy

```bash
# Example:
CORS_ALLOWED_ORIGINS=https://my-app.vercel.app,https://another-domain.com,http://localhost:5173
```

### Render says "DisallowedHost"

**Error:** "Invalid HTTP_HOST header"

**Cause:** Render domain not in `ALLOWED_HOSTS`

**Fix:**
1. Go to Render service
2. Edit environment variable `ALLOWED_HOSTS`
3. Add your Render domain: `your-service-name.onrender.com`
4. Redeploy

```bash
# Example:
ALLOWED_HOSTS=smart-locker-api.onrender.com,localhost
```

### Render database connection fails

**Error:** "could not translate host name to address"

**Cause:** Wrong DATABASE_URL or connection string format

**Fix:**
1. Go to Supabase dashboard
2. Click **Connect**
3. Select **Session pooler** (not "Direct connection")
4. Copy the full URL
5. Paste into Render `DATABASE_URL`
6. Ensure `[YOUR-PASSWORD]` is replaced with actual password

### Build script error on Render

**Error:** "bash build.sh: not found"

**Fix:**
1. Ensure `backend/build.sh` exists
2. Check build command is exactly: `bash build.sh`
3. Redeploy

### RLS blocks database access

**Error:** "new row violates row-level security policy"

**Cause:** RLS policies correctly blocking Supabase API access

**This is NORMAL and GOOD!** It means security is working.

**Why it happens:**
- Anonymous/unauthenticated users cannot access data via Supabase API
- Only your Django backend (with service role) can access
- Your frontend goes through Django, not Supabase API directly

**No fix needed** - this is expected behavior.

---

## Database Schema

Your database has these tables:

```
core_user
├── id (PK)
├── username (unique)
├── email (unique)
├── password_hash
├── is_staff (admin flag)
├── created_at
└── updated_at

core_locker
├── id (PK)
├── locker_number (unique)
├── location
├── status (available, reserved, inactive, maintenance)
├── size (small, medium, large)
├── created_at
└── updated_at

core_reservation
├── id (PK)
├── user_id (FK → core_user)
├── locker_id (FK → core_locker)
├── reserved_until (datetime)
├── status (active, released, expired)
├── released_at
├── created_at
└── updated_at
```

All tables have Row-Level Security enabled. See `SECURITY_SETUP.md` for RLS policies.

---

## API Endpoints

### Authentication

```
POST /api/auth/register/
  Body: {
    "username": "john",
    "email": "john@example.com",
    "password": "SecurePass123",
    "name": "John Doe",
    "admin_code": ""  // Leave empty for regular user
  }

POST /api/auth/login/
  Body: {
    "username": "john",
    "password": "SecurePass123"
  }
  Response: {
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": { ... }
  }

POST /api/auth/refresh/
  Body: {
    "refresh": "eyJ..."
  }
  Response: {
    "access": "eyJ..."
  }
```

### Lockers

```
GET /api/lockers/                    // List all lockers
GET /api/lockers/{id}/               // Get single locker
POST /api/lockers/                   // Create (admin only)
PATCH /api/lockers/{id}/             // Update (admin only)
DELETE /api/lockers/{id}/            // Deactivate (admin only)

Query params:
  ?status=available
  ?status=reserved
  ?status=inactive
```

### Reservations

```
GET /api/reservations/               // List (users see own, admins see all)
GET /api/reservations/{id}/          // Get single reservation
POST /api/reservations/              // Create reservation
PUT /api/reservations/{id}/release/  // Release locker
```

---

## Monitoring

### Check Render Logs

```
https://dashboard.render.com/
→ Select your web service
→ Logs tab
```

Look for:
- Application errors
- Database connection issues
- Missing environment variables

### Check Supabase Logs

```
https://app.supabase.com/
→ Project settings
→ Logs
```

Look for:
- RLS policy violations (expected for anonymous requests)
- Connection errors
- SQL errors

### Check Frontend Errors

In browser console (`F12`):
- Network errors
- Authentication errors
- API call failures

---

## Security Checklist Before Production

- [x] Row-Level Security enabled on all tables
- [x] Anonymous API access blocked
- [x] JWT authentication enforced
- [x] Admin role properly configured
- [x] CORS configured for your domain
- [x] CSRF protection enabled
- [x] HTTPS/SSL enabled
- [x] Database connection secured
- [x] Environment variables set correctly
- [x] Super user created for admin access

---

## Troubleshooting Checklist

1. **Frontend won't load**
   - Check Vercel deployment status
   - Check browser console for errors
   - Verify `VITE_API_BASE_URL` environment variable

2. **Login fails**
   - Check backend is running (`Live` status on Render)
   - Check `CORS_ALLOWED_ORIGINS` includes frontend domain
   - Check database connection works

3. **Can't create lockers (admin)**
   - Check user is actually admin (has `is_staff=True`)
   - Check permission error in response
   - Verify `createsuperuser` account was created

4. **Can't reserve lockers**
   - Check locker status is "available"
   - Check reserved_until is in the future
   - Check JWT token is being sent

5. **Database errors**
   - Check `DATABASE_URL` is correct
   - Use Session pooler, not Direct connection
   - Verify password is correct

---

## Support Resources

- Django REST Framework: https://www.django-rest-framework.org/
- Supabase Docs: https://supabase.com/docs
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

**Last Updated:** June 3, 2026
**Status:** Ready for Production with Security ✅
