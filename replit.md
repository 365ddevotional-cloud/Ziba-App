# Ziba - Ride-Hailing Platform

## Overview
Ziba is a ride-hailing/logistics platform (Uber-like) currently in Stage 2 - Database Models & Public Previews. This stage focuses on data models and public-facing read-only views without authentication.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with Shadcn UI components

## Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Shadcn components
│   │   ├── header.tsx  # Navigation header
│   │   ├── theme-provider.tsx  # Dark/light theme
│   │   └── theme-toggle.tsx    # Theme toggle button
│   ├── lib/
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/          # Route pages
│   │   ├── landing.tsx        # Home page (/)
│   │   ├── users.tsx          # Users list (/users)
│   │   ├── drivers.tsx        # Drivers list (/drivers)
│   │   ├── rides.tsx          # Rides list (/rides)
│   │   ├── admin.tsx          # Admin overview (/admin)
│   │   ├── admin-users.tsx    # Admin users (/admin/users)
│   │   ├── admin-drivers.tsx  # Admin drivers (/admin/drivers)
│   │   ├── admin-rides.tsx    # Admin rides (/admin/rides)
│   │   └── not-found.tsx
│   ├── App.tsx         # Main app with routes
│   └── index.css       # Global styles
server/
├── prisma.ts           # Prisma client instance
├── routes.ts           # API endpoints
└── index.ts            # Server entry
prisma/
└── schema.prisma       # Database schema
```

## Routes (All Public - No Auth Required)
| Path | Description |
|------|-------------|
| `/` | Landing page with hero, features, how it works |
| `/users` | Public users list |
| `/drivers` | Public drivers list |
| `/rides` | Public rides list |
| `/admin` | Admin overview with stats |
| `/admin/users` | Admin users management |
| `/admin/drivers` | Admin drivers management |
| `/admin/rides` | Admin rides management |

## API Endpoints (All Public)
- `GET /api/users` - List all users
- `GET /api/drivers` - List all drivers
- `GET /api/rides` - List all rides with user/driver info
- `GET /api/admins` - List all admins
- `GET /api/admin/stats` - Platform statistics

## Database Schema (Prisma)
### User
- id (UUID)
- fullName
- email (unique)
- phone (optional)
- createdAt

### Driver
- id (UUID)
- fullName
- phone
- vehicleType
- vehiclePlate
- isActive (boolean)
- createdAt

### Ride
- id (UUID)
- pickupLocation
- dropoffLocation
- status (REQUESTED, ACCEPTED, COMPLETED, CANCELLED)
- userId (relation to User)
- driverId (optional relation to Driver)
- createdAt

### Admin
- id (UUID)
- email (unique)
- phone (optional)
- createdAt
- NOTE: No password field in Stage 2

## Design
- Dark blue primary color
- Professional Uber-like aesthetic
- Dark mode default with light mode toggle
- Inter font family
- Responsive mobile-first design

## Stage 2 Notes
- All routes are public (no authentication required)
- All pages are read-only previews
- Database tables are empty by default
- No login/register functionality in this stage
