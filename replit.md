# Ziba - Ride-Hailing Platform

## Overview
Ziba is a ride-hailing/logistics platform (Uber-like) currently in Stage 10 - Admin Directors Management. The platform is in preview mode with public routes (no login enforcement) but maintains full authentication system, login pages, and role-based access control for future deployment.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: bcrypt password hashing + express-session with PostgreSQL store
- **Styling**: Tailwind CSS with Shadcn UI components

## Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Shadcn components
│   │   ├── header.tsx  # Navigation header with auth
│   │   ├── protected-route.tsx  # Route protection
│   │   ├── theme-provider.tsx   # Dark/light theme
│   │   └── theme-toggle.tsx     # Theme toggle button
│   ├── lib/
│   │   ├── auth.tsx     # Auth context and hooks
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/           # Route pages
│   │   ├── landing.tsx  # Home page (/)
│   │   ├── login.tsx    # Login pages for all roles
│   │   ├── users.tsx    # Users list (/users)
│   │   ├── drivers.tsx  # Drivers list (/drivers)
│   │   ├── directors.tsx # Directors list (/directors - read-only)
│   │   ├── rides.tsx    # Rides list (/rides)
│   │   ├── admin.tsx    # Admin dashboard (/admin)
│   │   ├── admin-users.tsx     # Admin users management
│   │   ├── admin-drivers.tsx   # Admin drivers management
│   │   ├── admin-directors.tsx # Admin directors management
│   │   ├── admin-rides.tsx     # Admin rides management
│   │   └── not-found.tsx
│   ├── App.tsx         # Main app with routes
│   └── index.css       # Global styles
server/
├── auth.ts             # Auth utilities (hash, verify, middleware)
├── prisma.ts           # Prisma client instance
├── routes.ts           # API endpoints
└── index.ts            # Server entry with session config
prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Seed data
```

## Routes & Access Control

### Public Routes (Preview Mode - All routes accessible)
| Path | Description |
|------|-------------|
| `/` | Landing page with hero, features, how it works |
| `/login` | User login page |
| `/director/login` | Director login page |
| `/admin/login` | Admin login page |
| `/users` | Users list with status indicators |
| `/drivers` | Drivers list (read-only) |
| `/directors` | Directors list (read-only) |
| `/rides` | Rides list with fare and status |
| `/admin` | Admin dashboard with real-time stats |
| `/admin/users` | Admin users management |
| `/admin/drivers` | Admin drivers management (status editable) |
| `/admin/directors` | Admin directors management (status, contract dates editable) |
| `/admin/rides` | Admin rides management |

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/login` - Login with email, password, role
- `POST /api/auth/setup-password` - First-time password setup
- `POST /api/auth/logout` - Logout current session

### Users
- `GET /api/users` - List all users with ride counts
- `POST /api/users` - Create a user (fullName, email required)
- `PATCH /api/users/:id` - Update user status/details

### Drivers
- `GET /api/drivers` - List all drivers with ride counts
- `GET /api/drivers/active` - List only active drivers
- `POST /api/drivers` - Create a driver (fullName, email, phone, vehiclePlate required)
- `PATCH /api/drivers/:id` - Update driver status/details

### Directors
- `GET /api/directors` - List all directors
- `POST /api/directors` - Create a director
- `PATCH /api/directors/:id` - Update director (contractEnd - admin only)

### Admin Directors (Admin Only)
- `PATCH /api/admin/directors/:id/status` - Update director status (ACTIVE, PENDING, SUSPENDED, TERMINATED)
- `PATCH /api/admin/directors/:id/contract` - Update director contract dates (contractStart, contractEnd)

### Rides
- `GET /api/rides` - List all rides with user/driver info
- `POST /api/rides` - Create a ride (requires userId, only ACTIVE drivers can be assigned)
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
- passwordHash (optional - set on first login)
- createdAt
- rides (relation)

### Driver
- id (UUID)
- fullName (string)
- email (unique)
- phone (string)
- vehicleType (CAR | BIKE | VAN)
- vehiclePlate (string)
- status (PENDING | ACTIVE | SUSPENDED | OFFLINE)
- currentRate (float, default 1.0)
- avgStartTime (optional)
- avgEndTime (optional)
- createdAt
- rides (relation)
- incentives (relation)

### Director
- id (UUID)
- fullName (string)
- email (unique)
- phone (optional)
- role (OPERATIONS | FINANCE | COMPLIANCE)
- region (string)
- status (ACTIVE | PENDING | SUSPENDED | TERMINATED)
- contractStart (DateTime, optional)
- contractEnd (DateTime, optional)
- driversAssigned (int, default 0)
- driversOnline (int, default 0)
- passwordHash (optional - set on first login)
- createdAt

### Admin
- id (UUID)
- email (unique)
- phone (optional)
- passwordHash (optional - set on first login)
- createdAt

### Ride
- id (UUID)
- pickupLocation (string)
- dropoffLocation (string)
- fareEstimate (float, optional)
- status (REQUESTED | ACCEPTED | COMPLETED | CANCELLED)
- userId (required relation to User)
- driverId (optional relation to Driver)
- createdAt

### Payment
- id (UUID)
- amount (float)
- status (PENDING | PAID | FAILED)
- rideId (unique relation to Ride)
- createdAt

### Incentive
- id (UUID)
- amount (float)
- reason (string)
- driverId (relation to Driver)
- createdAt

## Business Rules
1. A ride MUST be linked to a user
2. Only ACTIVE drivers can be assigned to rides
3. When a driver is assigned, ride status automatically changes to ACCEPTED
4. Status changes reflect immediately in UI
5. First-time login requires password setup (passwordHash is NULL)
6. Sessions persist across browser refresh
7. Only admins can update director status and contract dates (backend enforced)

## Authentication Flow
1. User enters email on login page
2. If passwordHash is NULL, system prompts for password setup
3. User sets password (min 6 characters)
4. Password is hashed with bcrypt and stored
5. User is logged in with session cookie
6. Future logins require email + password

## Test Accounts (Seeded)
- **Admin**: admin@ziba.com
- **Directors**: operations@ziba.com, finance@ziba.com, compliance@ziba.com
- **Users**: amara@example.com, chidi@example.com, fatima@example.com, ngozi@example.com
- **Suspended User**: emeka@example.com

All accounts require password setup on first login.

## Design
- Dark blue primary color
- Professional Uber-like aesthetic
- Dark mode default with light mode toggle
- Inter font family
- Responsive mobile-first design

## Stage 10 Notes
- Added DirectorStatus enum (ACTIVE, PENDING, SUSPENDED, TERMINATED)
- Created /admin/directors page with full management capabilities
- Status dropdown editable by admin only
- Contract start/end dates editable by admin only (pencil icon + date picker)
- Backend validates admin role before allowing updates (403 Forbidden for non-admin)
- Public /directors page remains read-only
- Preview mode maintained - all routes publicly accessible
