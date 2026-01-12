# Ziba - Ride-Hailing Platform

## Overview
Ziba is a ride-hailing and logistics platform, similar to Uber, designed to connect users with drivers for transportation services. The project is currently in an advanced stage of development, featuring a dynamic fare control system and an advanced authentication system with role-based access control. Ziba aims to provide a robust, scalable, and user-friendly platform for ride-hailing operations across multiple countries, with a focus on efficient logistics, fair pricing, and comprehensive administrative oversight. The platform supports various user roles including users, drivers, directors, and administrators, each with tailored functionalities and access levels.

## User Preferences
I want to ensure all changes are thoroughly reviewed. Please ask for confirmation before implementing any significant changes or new features. I prefer clear, concise explanations and detailed documentation for any new modules or complex logic introduced.

## System Architecture
The Ziba platform is built with a modern web development stack:
- **Frontend**: Developed using React, Vite, and TypeScript, providing a responsive and interactive user interface. Styling is handled with Tailwind CSS, augmented by Shadcn UI components for a polished design. The UI/UX emphasizes a professional, Uber-like aesthetic with a dark blue primary color, Inter font family, and mobile-first responsive design. Dark mode is the default, with a toggle for light mode.
- **Backend**: Implemented with Node.js and Express, providing a robust API layer.
- **Database**: PostgreSQL is used as the primary data store, with Prisma ORM facilitating seamless database interactions and schema management.
- **Authentication**: Features `bcrypt` for secure password hashing and `express-session` with a PostgreSQL store for session management. Currently configured for **ADMIN-ONLY** login at `/admin/login`. Founder admin account: `founder@ziba.app` (auto-created on server start if no admins exist and ADMIN_DEFAULT_PASSWORD env var is set). All admin routes are protected by AdminGuard requiring ADMIN role. User, Driver, and Director logins are disabled pending future implementation. Test account impersonation system allows admin to login as any test account for development testing.
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