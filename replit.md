# Ziba - Ride-Hailing Platform

## Overview
Ziba is a production-ready ride-hailing and logistics platform, akin to Uber, designed to connect users with drivers for transportation services. It features dynamic fare control, advanced authentication with role-based access, and comprehensive production hardening. The platform aims to be a robust, scalable, and user-friendly solution for ride-hailing operations across multiple countries, emphasizing efficient logistics, fair pricing, and extensive administrative oversight. It supports various user roles, including riders, drivers, directors, and administrators, each with customized functionalities and access levels.

## User Preferences
I want to ensure all changes are thoroughly reviewed. Please ask for confirmation before implementing any significant changes or new features. I prefer clear, concise explanations and detailed documentation for any new modules or complex logic introduced.

## System Architecture
The Ziba platform is built using a modern web development stack.

**Frontend:**
- **Technology**: React, Vite, TypeScript.
- **Styling**: Tailwind CSS with Shadcn UI components.
- **UI/UX**: Professional, Uber-like aesthetic with a dark blue primary color, Inter font family, and mobile-first responsive design. Dark mode is default with a light mode toggle.

**Backend:**
- **Technology**: Node.js and Express.
- **Database**: PostgreSQL with Prisma ORM.

**Authentication:**
- **Security**: `bcrypt` for password hashing, `express-session` for session management.
- **Multi-Role System**: Unified signup at `/signup` for Rider, Driver, and Director roles. Rider accounts are active immediately. Driver and Director accounts require admin verification/approval.
- **Role-Aware Login**: Specific login endpoints for Rider, Driver, and Director, with access restrictions based on verification/approval status.
- **Access Control**: Role-based access for API routes (e.g., `/api/admin/*` requires ADMIN role).
- **Test Accounts**: Admin tool for test account generation and "Login As" functionality (production-guarded).

**Core Features:**
- **Ride Management**: End-to-end lifecycle from request to completion, including driver assignment, status tracking, and automatic wallet transactions.
- **Trip State Machine**: Defines strict, forward-only transitions for trip statuses (`REQUESTED` → `DRIVER_ASSIGNED` → `DRIVER_ARRIVED` → `IN_PROGRESS` → `COMPLETED` → `SETTLED`). Role-based guards and business logic hooks are integrated into transitions (e.g., fare locking at `IN_PROGRESS`, fraud detection at `COMPLETED`). Settled trips are immutable.
- **Dynamic Fare Control**: `FareConfig` model supports country-specific pricing (base, per KM/minute), commission splits, and smart pricing (surge, weather, traffic multipliers) with configurable caps.
- **Minimum Fare Logic**: Ensures no trip generates negative margin for Ziba by automatically adjusting fares below a calculated minimum based on operational costs and commission rates.
- **Wallet and Payment System**: Integrated user and driver wallets handling payments, commissions, and payouts. Supports tipping.
- **Hybrid Maps System**: Uses optimized GPS tracking frequencies based on driver status (idle, en route, in-trip). No in-app turn-by-turn navigation; "Navigate" button opens external Google Maps via deep links.
- **Map Cost Protection**: System to monitor and control map API costs. Tracks metrics like `MapCostPerTrip` and `MapCostRatio`, implementing protective actions (e.g., reduced GPS frequency, disabling paid autocomplete) if cost thresholds are exceeded.
- **Fraud Detection**: Flags trips for review and holds payouts based on discrepancies between estimated vs. actual distance/time, GPS anomalies (jumps, looping), and mid-trip idleness.
- **Notifications**: Real-time system for ride events and wallet updates.
- **Admin Dashboard**: Comprehensive interface for managing users, drivers, directors, rides, payments, configurations, and analytics. Includes Play Store checklist verification.
- **Multi-country Currency Support**: Global support with `Intl.NumberFormat` for dynamic currency formatting.
- **Brand Design System**: Defined color palette (Deep Royal Blue, Emerald Teal), typography (Inter), and UI component styling for a consistent, professional brand identity.
- **Production Hardening**: Idempotent admin bootstrapping, secure password hashing, optimized compute costs, and production-guarded debug routes.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Prisma ORM**: Database toolkit.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **TypeScript**: Static type checking.
- **Node.js**: Backend runtime.
- **Express**: Backend framework.
- **Tailwind CSS**: Styling framework.
- **Shadcn UI**: UI component library.
- **Bcrypt**: Password hashing.
- **Express-session**: Session management.
- **Stripe**: Payment gateway (international).
- **Paystack/Flutterwave**: Payment gateways (Africa-ready).