# Deployment Guide - Smart Storage Locker Management System

## What To Deploy Where

This assignment uses Django REST Framework for the backend and React/Vite for the frontend.

Use this free deployment setup:

- Frontend: Vercel
- Backend API: Render
- Database: Supabase PostgreSQL
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

## 1. Push Latest Code To GitHub

Open PowerShell:

```powershell
cd "C:\Users\yaswa\OneDrive\Desktop\Fullstack"
git add .
git commit -m "Prepare final deployment"
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

## 2. Supabase Database

1. Go to https://supabase.com/dashboard
2. Click `New project`.
3. Fill project name and database password.
4. Click `Create new project`.
5. Open the project.
6. Click `Connect` at the top of the dashboard.
7. Choose `Session pooler`.
8. Copy the PostgreSQL connection string.
9. Replace `[YOUR-PASSWORD]` with your database password.

Keep this value for Render:

```text
DATABASE_URL=postgres://...
```

## 3. Render Backend

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

6. In `Environment Variables`, add:

```text
DEBUG=False
SECRET_KEY=make-a-long-random-secret-key
DATABASE_URL=your-supabase-session-pooler-url
ALLOWED_HOSTS=your-render-service-name.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-render-service-name.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-project.vercel.app,http://localhost:5173
```

7. Click `Create Web Service`.
8. Wait until status becomes `Live`.

Test backend:

```text
https://your-render-service-name.onrender.com/api/lockers/
```

If you see `Authentication credentials were not provided.`, that is good. It means the API is running and protected.

## 4. Create Admin User On Render

1. Open your Render web service.
2. Click `Shell` in the left sidebar.
3. Run:

```bash
python manage.py createsuperuser
```

4. Use this admin account to log in from the frontend.

## 5. Vercel Frontend

Your screenshot already shows Vercel deployment is `Ready`. Check these settings:

1. Open your Vercel project.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add or update:

```text
VITE_API_BASE_URL=https://your-render-service-name.onrender.com/api
```

5. Go to `Settings` > `Build and Development Settings`.
6. Confirm:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

7. Go to `Deployments`.
8. Click the three dots on the latest deployment.
9. Click `Redeploy`.

## 6. Final Test Flow

Open your Vercel URL:

```text
https://your-vercel-project.vercel.app
```

Test as admin:

1. Login using the Render `createsuperuser` account.
2. Go to `Lockers`.
3. Add a locker.
4. Confirm locker appears.
5. Go to `All Reservations`.

Test as user:

1. Register a new user.
2. Login.
3. View available lockers.
4. Reserve a locker with future date/time.
5. Go to `My Reservations`.
6. Release the locker.

## Common Fixes

### Frontend opens but login fails

Check Vercel environment variable:

```text
VITE_API_BASE_URL=https://your-render-service-name.onrender.com/api
```

Then redeploy Vercel.

### Browser shows CORS error

Update Render environment variable:

```text
CORS_ALLOWED_ORIGINS=https://your-vercel-project.vercel.app,http://localhost:5173
```

Then redeploy Render.

### Render says DisallowedHost

Update Render environment variable:

```text
ALLOWED_HOSTS=your-render-service-name.onrender.com
```

### Render database connection fails

Use Supabase `Session pooler` connection string, not the direct connection string.

### Build script error on Render

Render build command must be:

```text
bash build.sh
```