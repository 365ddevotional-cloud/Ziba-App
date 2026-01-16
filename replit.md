# Ziba - Ride-Hailing Platform

## Stage 18 Complete - Hybrid Maps System + Driver App

## Overview
Ziba is a ride-hailing and logistics platform, similar to Uber, designed to connect users with drivers for transportation services. The project is now production-ready, featuring a dynamic fare control system, advanced authentication with role-based access control, and comprehensive production hardening. Ziba aims to provide a robust, scalable, and user-friendly platform for ride-hailing operations across multiple countries, with a focus on efficient logistics, fair pricing, and comprehensive administrative oversight. The platform supports various user roles including users, drivers, directors, and administrators, each with tailored functionalities and access levels.

## User Preferences
I want to ensure all changes are thoroughly reviewed. Please ask for confirmation before implementing any significant changes or new features. I prefer clear, concise explanations and detailed documentation for any new modules or complex logic introduced.

## System Architecture
The Ziba platform is built with a modern web development stack:
- **Frontend**: Developed using React, Vite, and TypeScript, providing a responsive and interactive user interface. Styling is handled with Tailwind CSS, augmented by Shadcn UI components for a polished design. The UI/UX emphasizes a professional, Uber-like aesthetic with a dark blue primary color, Inter font family, and mobile-first responsive design. Dark mode is the default, with a toggle for light mode.
- **Backend**: Implemented with Node.js and Express, providing a robust API layer.
- **Database**: PostgreSQL is used as the primary data store, with Prisma ORM facilitating seamless database interactions and schema management.
- **Authentication**: Features `bcrypt` for secure password hashing and `express-session` with a PostgreSQL store for session management. 
    - **Admin Login**: Available at `/api/auth/login` with role="admin". Founder admin account: `founder@ziba.app` with password `admin-ziba-2013` (auto-created on server start if no admins exist, idempotent).
    - **Multi-Role Signup System** (Stage 18):
      - Unified signup page at `/signup` with role tabs (Rider, Driver, Director)
      - **Rider Signup**: Instant activation via `/api/rider/register` - accounts are immediately active
      - **Driver Signup**: Pending verification via `/api/driver/register` - accounts created with `status=PENDING`, `isVerified=false`; login blocked until admin verifies
      - **Director Signup**: Pending approval via `/api/director/register` - accounts created with `status=PENDING`, `isVerified=false`, `isApproved=false`; login blocked until admin verifies AND approves
    - **Role-Aware Login**:
      - Rider login: `/api/rider/login` - standard authentication
      - Driver login: `/api/driver/login` - returns 403 with redirect to `/driver/pending-verification` if unverified
      - Director login: `/api/director/login` - returns 403 with redirect to `/director/pending-approval` if unverified or unapproved
    - All `/api/admin/*` routes require ADMIN role (401 if not authenticated as admin).
    - All `/api/rider/*` routes require RIDER role with active session.
    - Test account impersonation system allows admin to login as any test account for development testing.
- **Ride Completion Pages**:
    - Professional Uber-like ride completion experience for both Riders and Drivers
    - Rider completion page (`/rider/ride-complete`): Success animation, ride summary, 5-star rating system, optional feedback, "Book Another Ride" and "View History" actions
    - Driver completion page (`/driver/ride-complete`): Success animation, earnings breakdown (85% after 15% commission), 5-star rider rating, "Go Online" and "View Earnings" actions
    - Proper 401/404 error handling with redirects to login/signup pages
    - Automatic redirect to completion page after ride ends
- **Brand Design System (Premium Enterprise)**:
    - Primary: Deep Royal Blue #0A2540 (header, dark backgrounds)
    - Accent: Emerald Teal #1ABC9C (buttons, highlights, icons)
    - Backgrounds: #0B1220 (main), #111827 (cards), #1F2937 (surfaces/borders)
    - Text: #F9FAFB (primary), #9CA3AF (secondary), #6B7280 (muted)
    - Status: #16A34A (success), #F59E0B (warning), #DC2626 (error)
    - Rating stars: Gold #FACC15
    - Hero gradient: linear-gradient(135deg, #0A2540 0%, #0B1220 100%)
    - Buttons: Teal with glow effect on hover, transparent outline for secondary
    - Cards: 12px radius, subtle borders, drop shadows
- **Production Hardening (Stage 16)**: 
    - Admin bootstrap is idempotent - creates founder admin only if no admins exist, with bcrypt-hashed password
    - Authentication relies on stored database credentials with secure bcrypt hashing
    - Compute costs optimized by removing all refetchInterval polling
    - Debug routes and test account login blocked in production via NODE_ENV checks
    - Play Store preparation checklist created (PLAY_STORE_CHECKLIST.md)
    - Play Store Checklist admin page at `/admin/playstore-checklist` with real-time readiness verification
- **Payments & Wallet (Stage 17)**:
    - Tips system (Uber-style) with preset percentages (5%, 10%, 15%, 20%) or custom amounts
    - Tips go 100% to driver with separate wallet credit
    - Payment gateway abstraction supporting SANDBOX and LIVE modes
    - Supported providers: Stripe (international), Paystack/Flutterwave (Africa-ready)
    - TEST_MODE toggle in Admin UI - controls test account behavior
    - Test accounts only work when Test Mode is ON
    - No real money moves in SANDBOX mode
- **Hybrid Maps System (Stage 18)**:
    - **Locked Fare**: Fare is calculated ONCE at ride request and locked at trip start via `lockedFare` field - never recalculated mid-trip
    - **No Turn-by-Turn Navigation**: Ziba does NOT implement in-app navigation or call Google routing APIs after trip start
    - **External Navigation**: "Navigate" button in Driver App opens external Google Maps using deep links:
      - Android: `google.navigation:q=LAT,LNG&mode=d`
      - iOS: `comgooglemaps://?daddr=LAT,LNG&directionsmode=driving`
      - Fallback to browser-based Google Maps if app unavailable
    - **Light GPS Tracking**: GPS logged every 5-8 seconds during IN_PROGRESS rides for safety and fraud detection only
    - **Database Fields**: Ride model extended with `pickupLat/Lng`, `dropoffLat/Lng`, `lockedFare`, `estimatedDistance`, `estimatedDuration`, `startedAt`, `completedAt`
    - **GpsLog Model**: Stores safety tracking data with `rideId`, `driverId`, `lat`, `lng`, `speed`, `bearing`, `createdAt`
- **Driver App (Stage 18)**:
    - Driver Home (`/driver/home`): Dashboard with online/offline toggle, today's earnings/trips, rating, waiting for requests state
    - Driver Active Ride (`/driver/ride/:id`): Full ride details, rider info, pickup/dropoff locations, Navigate button, status update buttons (Arrived, Start Trip, Complete Trip)
    - Proper authentication guard with redirect to signup for unauthenticated users
    - Pending verification handling for unverified drivers
- **Core Features**:
    - **User and Driver Management**: Comprehensive CRUD operations for users and drivers, including status management, online/offline toggling for drivers, and rating systems.
    - **Ride Management**: End-to-end ride lifecycle management from request to completion, including driver assignment, ride status tracking, and automatic wallet transactions upon ride completion.
    - **Dynamic Fare Control System**: Implemented with a `FareConfig` model allowing country-specific pricing (base fare, per KM, per minute), commission splits, and advanced smart pricing features like surge pricing, weather, and traffic multipliers with configurable caps.
    - **Wallet and Payment System**: Integrated wallet system for users and drivers, handling ride payments, commissions, and driver payouts. User wallets start with a default balance, and ride completion automatically debits user wallets and credits driver wallets minus commission.
    - **Notifications**: Real-time notification system for ride events and wallet updates, with unread counts and mark-as-read functionalities.
    - **Admin Dashboard**: A comprehensive administrative interface for managing users, drivers, directors, rides, payments, incentives, wallets, platform configurations, and analytics. It includes platform statistics and director performance metrics.
    - **Multi-country Currency Support**: Global support with dynamic currency formatting using `Intl.NumberFormat` and a country selector, with settings persisting locally.
    - **Test Login Manager**: An admin-only tool for generating and managing test accounts with "Login As" functionality for development and testing environments. This feature is production-guarded.

## External Dependencies
- **PostgreSQL**: Relational database for all persistent data.
- **Prisma ORM**: Database toolkit for Node.js and TypeScript.
- **React**: Frontend JavaScript library for building user interfaces.
- **Vite**: Frontend build tool.
- **TypeScript**: Superset of JavaScript that adds static types.
- **Node.js**: JavaScript runtime for the backend server.
- **Express**: Web application framework for Node.js.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: Reusable UI components.
- **Bcrypt**: Library for hashing passwords.
- **Express-session**: Middleware for managing user sessions.
- **Intl.NumberFormat**: JavaScript API for locale-sensitive number formatting (used for currency display).