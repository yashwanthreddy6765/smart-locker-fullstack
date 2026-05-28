# Smart Storage Locker Management System

Full-stack assignment project with Django REST Framework, JWT authentication, role-based access control, locker size categories, reservation history dashboard, and a React/Vite/Tailwind frontend.

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT
- Frontend: React, Vite, Tailwind CSS, Lucide React icons
- Local database: SQLite
- Free deployment database: Supabase PostgreSQL
- Free deployment targets: Render for backend, Vercel for frontend

## Features

### 🔐 Authentication & Roles
- JWT-based login/registration with auto-refresh
- Role-based access: regular users vs. admin (staff) users
- Admin registration via secret code

### 📦 Locker Management
- **Size categories** — Each locker can be Small, Medium, or Large (badge color-coded)
- **Size filter bar** — Filter lockers by size (All / Small / Medium / Large)
- Admin CRUD — Create, update status, delete lockers with size selector
- Visual cards showing locker number, location, status & size at a glance

### 📋 Reservations
- Reserve any available locker with an end-time picker
- **Duration display** — Occupied lockers show how long they've been reserved
- Release early with one click
- Role-filtered listing: users see only their own reservations, admins see all

### 📊 My Dashboard (Regular Users)
- **Active reservation** section — quick overview of current locker
- **Past reservations** history — sorted newest first with timestamps

### 👑 Admin View
- Separate **Active** and **Past** reservation sections
- **Reserved At** timestamp column
- **Duration** badges showing how long ago each reservation was made
- Green-highlighted active rows for quick scanning

### 🚀 CI/CD
- **GitHub Actions** workflow auto-deploys frontend to Vercel on every push to `main`

## Project Structure

```text
backend/
  config/          Django project settings and URLs
  core/            Lockers, reservations, serializers, permissions, API views
  core/migrations/ Database migration history (0001_initial, 0002_locker_size)
  requirements.txt
frontend/
  src/
    api/           Axios HTTP client with JWT interceptor
    state/         AuthContext (global auth state via React Context)
    components/    Reusable Button, PageHeader, StatusBadge
    pages/
      LoginPage.jsx           Login form
      RegisterPage.jsx        Registration (optional admin code)
      MyDashboard.jsx         User dashboard: active + past reservations
      LockersPage.jsx         Admin locker management with size filter
      ReservationsPage.jsx    Browse lockers, book, release, size badges
      AdminReservationsPage.jsx  Admin overview with timestamps & duration
    main.jsx        App entry with React Router routes
    App.jsx         Root component + navigation + route guards
  package.json
  vercel.json       Vercel deployment settings
.github/
  workflows/
    deploy.yml      CI/CD: auto-deploy frontend to Vercel on git push
render.yaml         Render backend deployment blueprint
```

## Backend Setup

Python is required. On Windows, install Python 3.12+ from the Microsoft Store or from python.org, then restart the terminal.

```powershell
cd backend
python -m venv .venv
.\\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API will run at:

```text
http://127.0.0.1:8000/api/
```

## Frontend Setup

Use `npm.cmd` in PowerShell if `npm` is blocked by execution policy.

```powershell
cd frontend
npm.cmd install
copy .env.example .env
npm.cmd run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create account (optional `admin_code` for staff) |
| POST | `/api/auth/login/` | Get JWT access + refresh tokens |
| POST | `/api/auth/refresh/` | Refresh expired access token |
| GET | `/api/auth/user/` | Get current user profile |

### Lockers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/lockers/` | Any user | List all lockers (includes `size`, `reserved_since`) |
| POST | `/api/lockers/` | Admin only | Create a locker |
| PATCH | `/api/lockers/<id>/` | Admin only | Update locker (status, size, etc.) |
| DELETE | `/api/lockers/<id>/` | Admin only | Soft-deactivates locker |

**Locker fields:** `id`, `locker_number`, `location`, `status` (available/unavailable), `size` (Small/Medium/Large), `created_at`, `reserved_since` (ISO timestamp of current active reservation, or `null`)

### Reservations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations/` | List — users see own, admins see all |
| POST | `/api/reservations/` | Create a new reservation |
| PATCH | `/api/reservations/<id>/release/` | Release a reservation |

**Query params:** `?status=active`, `?locker=<id>`

## Database Models

### Locker

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-generated |
| locker_number | CharField (unique) | e.g. A-101, B-2 |
| location | CharField | e.g. Building 1, Floor 2 |
| status | CharField | `available` or `unavailable` |
| **size** | **CharField** | **`Small`, `Medium`, or `Large` (default: `Medium`)** |
| created_at | DateTimeField | Auto-set on creation |

### Reservation

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-generated |
| user | ForeignKey → User | Who reserved it |
| locker | ForeignKey → Locker | Which locker |
| start_time | DateTimeField | When reserved (auto-set) |
| end_time | DateTimeField | When reservation ends |
| status | CharField | `active` or `released` |
| created_at | DateTimeField | When the reservation was made |

## Role-Based Access

- **Admin users** — Django staff users (`is_staff=True`). Can create/update/delete lockers, view all reservations, and access all admin pages.
- **Regular users** — Registered via `/api/auth/register/`. Can browse lockers, reserve/release lockers, and view their own reservations on the Dashboard.

## Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Login | `/login` | Public | Sign in with username + password |
| Register | `/register` | Public | Create account (optional admin code) |
| My Dashboard | `/dashboard` | Regular users | Active reservation + past history |
| Reservations | `/reservations` | All users | Browse lockers, book, release |
| Manage Lockers | `/lockers` | Admin only | CRUD lockers with size filter |
| All Reservations | `/admin` | Admin only | All reservations with timestamps & duration |

## Deployment

### Backend → Render

1. Push your code to GitHub.
2. Create a free Supabase project and copy the PostgreSQL connection string.
3. Deploy `backend/` to Render.
4. Set environment variables:
   - `DEBUG=False`
   - `SECRET_KEY=<secure generated value>`
   - `DATABASE_URL=<Supabase PostgreSQL session pooler URL>`
   - `ALLOWED_HOSTS=<your-render-domain>`
   - `CORS_ALLOWED_ORIGINS=<your-vercel-domain>`
   - `ADMIN_SECRET_CODE=<your-admin-registration-code>`

### Frontend → Vercel (Auto-deploy via GitHub Actions)

1. Deploy `frontend/` to Vercel manually the first time.
2. Set Vercel environment variable:
   - `VITE_API_BASE_URL=https://your-render-domain.onrender.com/api`
3. Add these secrets to your GitHub repo (**Settings → Secrets and variables → Actions**):
   - `VERCEL_TOKEN` — Create at [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` — Your Vercel team/username
   - `VERCEL_PROJECT_ID` — Found in Vercel project settings
4. Every push to `main` will now automatically build and deploy the frontend.

## Notes

- JWT access tokens are attached as `Authorization: Bearer <token>`.
- The frontend stores JWTs in `localStorage` and auto-refreshes expired tokens via an Axios interceptor.
- Render free services may sleep after inactivity, so the first API request can be slow.
- Locker sizes are color-coded: Small (purple), Medium (blue), Large (amber).
