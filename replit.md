# Ziba - Ride-Hailing Platform

## Overview
Ziba is a ride-hailing/logistics platform (Uber-like) currently in Stage 4 - Real-World Structure & States. This stage introduces proper status fields, validation rules, and real-time statistics.

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
│   │   ├── admin.tsx          # Admin dashboard (/admin)
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
| `/users` | Public users list with status indicators |
| `/drivers` | Public drivers list with approval status |
| `/rides` | Public rides list with fare and status |
| `/admin` | Admin dashboard with real-time stats |
| `/admin/users` | Admin users management |
| `/admin/drivers` | Admin drivers management |
| `/admin/rides` | Admin rides management |

## API Endpoints

### Users
- `GET /api/users` - List all users with ride counts
- `POST /api/users` - Create a user (fullName, email required)
- `PATCH /api/users/:id` - Update user status/details

### Drivers
- `GET /api/drivers` - List all drivers with ride counts
- `GET /api/drivers/approved` - List only approved drivers
- `POST /api/drivers` - Create a driver (fullName, phone, vehiclePlate required)
- `PATCH /api/drivers/:id` - Update driver status/details

### Rides
- `GET /api/rides` - List all rides with user/driver info
- `POST /api/rides` - Create a ride (requires userId, only approved drivers can be assigned)
- `PATCH /api/rides/:id` - Update ride status/assignment

### Admin
- `GET /api/admins` - List all admins
- `GET /api/admin/stats` - Comprehensive platform statistics

## Database Schema (Prisma)

### User
- id (UUID)
- fullName (string)
- email (unique)
- phone (optional)
- city (optional)
- status (ACTIVE | SUSPENDED)
- createdAt
- rides (relation)

### Driver
- id (UUID)
- fullName (string)
- phone (string)
- vehicleType (CAR | BIKE | VAN)
- vehiclePlate (string)
- status (PENDING | APPROVED | SUSPENDED)
- createdAt
- rides (relation)

### Ride
- id (UUID)
- pickupLocation (string)
- dropoffLocation (string)
- fareEstimate (float, optional)
- status (REQUESTED | ACCEPTED | COMPLETED | CANCELLED)
- userId (required relation to User)
- driverId (optional relation to Driver)
- createdAt

### Admin
- id (UUID)
- email (unique)
- phone (optional)
- createdAt
- NOTE: No password field yet

## Business Rules (Stage 4)
1. A ride MUST be linked to a user
2. Only APPROVED drivers can be assigned to rides
3. When a driver is assigned, ride status automatically changes to ACCEPTED
4. Status changes reflect immediately in UI

## Admin Dashboard Stats
- Total users (active/suspended breakdown)
- Total drivers (approved/pending/suspended breakdown)
- Active rides (requested + accepted)
- Total rides (completed/cancelled breakdown)

## Design
- Dark blue primary color
- Professional Uber-like aesthetic
- Dark mode default with light mode toggle
- Inter font family
- Responsive mobile-first design

## Stage 4 Notes
- All routes are public (no authentication required)
- Real status states and lifecycle tracking
- Validation rules enforced on API
- Real counts only - no fake numbers
