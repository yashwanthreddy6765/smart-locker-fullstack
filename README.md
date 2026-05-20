# Smart Storage Locker Management System

Full-stack assignment project with Django REST Framework, JWT authentication, role-based access control, and a React/Vite/Tailwind frontend.

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT
- Frontend: React, Vite, Tailwind CSS
- Local database: SQLite
- Free deployment database: Supabase PostgreSQL
- Free deployment targets: Render for backend, Vercel for frontend

## Project Structure

```text
backend/
  config/          Django project settings and URLs
  core/            Lockers, reservations, serializers, permissions, API views
  requirements.txt
frontend/
  src/             React app, pages, API client, auth state
  package.json
render.yaml        Render backend deployment blueprint
```

## Backend Setup

Python is required. On Windows, install Python 3.12+ from the Microsoft Store or from python.org, then restart the terminal.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
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

Authentication:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`

Lockers:

- `POST /api/lockers/` admin only
- `GET /api/lockers/`
- `GET /api/lockers/<id>/`
- `PUT /api/lockers/<id>/` admin only
- `DELETE /api/lockers/<id>/` admin only, soft-deactivates locker

Reservations:

- `POST /api/reservations/`
- `GET /api/reservations/` admin sees all, users see own
- `GET /api/reservations/<id>/`
- `PUT /api/reservations/<id>/release/`

## Role-Based Access

The project uses Django's built-in `User` model:

- Admin users are Django staff users (`is_staff=True`).
- Regular users are created through `/api/auth/register/`.
- Admins can create, update, and deactivate lockers.
- Users can reserve available lockers and release their own reservations.
- Admins can view all reservations.

## Free Deployment Plan

1. Push this repository to GitHub.
2. Create a free Supabase project and copy the PostgreSQL connection string.
3. Deploy `backend/` to Render.
4. Set Render environment variables:
   - `DEBUG=False`
   - `SECRET_KEY=<secure generated value>`
   - `DATABASE_URL=<Supabase PostgreSQL URL>`
   - `ALLOWED_HOSTS=<your-render-domain>`
   - `CORS_ALLOWED_ORIGINS=<your-vercel-domain>`
5. Deploy `frontend/` to Vercel.
6. Set Vercel environment variable:
   - `VITE_API_BASE_URL=https://your-render-domain.onrender.com/api`

## Notes

- JWT access tokens are attached as `Authorization: Bearer <token>`.
- The frontend currently stores JWTs in `localStorage`, which is acceptable for an assignment demo. For production, prefer HttpOnly cookies.
- Render free services may sleep after inactivity, so the first API request can be slow.

