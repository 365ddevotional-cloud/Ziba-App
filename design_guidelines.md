# Ziba Design Guidelines

## Design Approach
**Reference-Based: Uber/Lyft-Inspired Modern Mobility Platform**

Draw inspiration from Uber's clean professionalism and Lyft's approachable aesthetic. Focus on trust, clarity, and efficiency. This is a foundation-stage app, so maintain simplicity while establishing a scalable visual system.

## Typography
- **Primary Font**: Inter or DM Sans via Google Fonts
- **Headings**: Font weight 700, sizes: text-4xl (hero), text-3xl (page titles), text-xl (section headers)
- **Body**: Font weight 400-500, text-base for content, text-sm for labels/captions
- **CTA Buttons**: Font weight 600, text-base

## Layout System
**Tailwind Spacing**: Use units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-20 desktop, py-12 mobile
- Component gaps: gap-6 or gap-8
- Container: max-w-6xl centered for content areas

## Component Library

### Navigation
- Fixed header with logo left, auth buttons right
- Height: h-16, subtle border-b
- Mobile: Hamburger menu for auth links

### Forms (Login/Register/Admin Setup)
- Centered card layout: max-w-md, p-8
- Input fields: h-12, rounded-lg, border with focus states
- Labels above inputs (text-sm, font-medium)
- Full-width primary buttons: h-12, rounded-lg
- Error messages: text-sm, positioned below inputs

### Buttons
- Primary: Full background, hover lift effect (translate-y slightly)
- Secondary: Border style with transparent background
- On images: Backdrop blur (backdrop-blur-md) with semi-transparent background

### Admin Dashboard
- Sidebar navigation (w-64) with menu items
- Main content area with stats cards in 3-column grid (lg:grid-cols-3)
- Stats cards: p-6, rounded-xl, border

## Page-Specific Guidelines

### Landing Page (/)
**Hero Section**: Full viewport height (min-h-screen)
- Left-aligned headline and CTA (2-column grid on desktop)
- Right side: Hero image showing urban mobility scene
- Headline: "Your City, On Demand" style messaging
- Two CTAs: "Get Started" (primary) + "Learn More" (secondary)

**Features Section**: 3-column grid showcasing platform benefits
- Icon + title + brief description per card
- Icons: Simple line icons (Heroicons)
- Cards: p-6, hover lift effect

**How It Works**: Numbered steps in horizontal flow
- 3 steps with connecting lines
- Icons representing: Register → Request → Ride

**Footer**: Multi-column layout
- Company info, Quick links, Contact, Social icons
- Newsletter signup form

### Login/Register Pages
- Centered card on subtle gradient background
- Logo at top of card
- Form fields with clear spacing (space-y-4)
- Link to alternate action below button ("Don't have an account?")
- Minimal decorative element (subtle geometric shape or pattern in background)

### Admin Setup (/admin/setup)
- Single-purpose page with welcome message
- "Welcome, Administrator" headline
- Clear instructions above password form
- Password strength indicator below input
- One-time setup messaging ("This is a one-time setup")

### Admin Dashboard
- Horizontal stat cards showing key metrics (Total Users, Active Sessions, Platform Status)
- Recent activity table with clean typography
- Action buttons for key admin functions
- Empty state messaging if no data yet

## Images

### Hero Image (Landing Page)
**Description**: Modern cityscape at dusk/evening with urban traffic or someone using a phone to request a ride. Professional photography style, high quality. Shows movement, connectivity, urban life.
**Placement**: Right 50% of hero section on desktop, background overlay on mobile
**Treatment**: Subtle gradient overlay for text readability

### Background Elements
**Login/Register**: Optional abstract geometric pattern in background (very subtle, low opacity)
**Admin Pages**: Clean solid backgrounds, no imagery needed

## Visual Rhythm
- Consistent 8px baseline grid
- Generous whitespace between sections (py-20)
- Maintain breathing room around interactive elements
- Card shadows: Subtle (shadow-sm default, shadow-md on hover)

**Key Principle**: Professional, trustworthy, and efficient. Every element should communicate reliability and ease of use.