# Ziba - Ride-Hailing Platform Foundation

## Overview
Ziba is a ride-hailing/logistics platform (Uber-like) currently in Stage 1 - Core Foundation & Authentication. This stage focuses on user authentication, admin management, and the foundational UI/UX.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Shadcn UI components
- **Auth**: Email + Password with session-based authentication

## Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Shadcn components
│   │   ├── header.tsx  # Main header component
│   │   ├── theme-provider.tsx  # Dark/light theme
│   │   └── theme-toggle.tsx    # Theme toggle button
│   ├── lib/
│   │   ├── auth.tsx    # Auth context and hooks
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/          # Route pages
│   │   ├── landing.tsx        # Home page (/)
│   │   ├── login.tsx          # User login (/login)
│   │   ├── register.tsx       # User registration (/register)
│   │   ├── admin-login.tsx    # Admin login (/admin/login)
│   │   ├── admin-setup.tsx    # Admin setup (/admin/setup)
│   │   ├── admin-dashboard.tsx # Admin dashboard (/admin/dashboard)
│   │   └── not-found.tsx
│   ├── App.tsx         # Main app with routes
│   └── index.css       # Global styles
server/
├── db.ts               # Database connection
├── routes.ts           # API endpoints
├── storage.ts          # Database operations
└── index.ts            # Server entry
shared/
└── schema.ts           # Database schemas and validation
```

## Routes
| Path | Description |
|------|-------------|
| `/` | Landing page with hero, features, how it works |
| `/login` | User login |
| `/register` | User registration |
| `/admin/login` | Admin login (redirects to setup if needed) |
| `/admin/setup` | First-time admin password setup |
| `/admin/dashboard` | Protected admin dashboard |

## API Endpoints
### User Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current session
- `POST /api/auth/logout` - Logout

### Admin Authentication
- `GET /api/admin/status` - Check if admin needs setup
- `POST /api/admin/setup` - Set admin password (one-time)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get admin session
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/recent-users` - Recent registrations

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `ADMIN_EMAIL` - Initial admin email
- `ADMIN_PHONE` - Initial admin phone (optional)

## Admin Setup Flow
1. Admin email/phone set via environment variables
2. On first `/admin/login`, admin is redirected to `/admin/setup`
3. Admin sets password (one-time setup)
4. Future logins use `/admin/login` directly

## Database Schema
### Users Table
- id (UUID)
- email (unique)
- name
- phone (optional)
- password (hashed)
- createdAt

### Admins Table
- id (UUID)
- email (unique)
- phone (optional)
- password (hashed, nullable initially)
- isPasswordSet (boolean)
- createdAt

## Design
- Dark blue primary color
- Professional Uber-like aesthetic
- Dark mode default with light mode toggle
- Inter font family
- Responsive mobile-first design
