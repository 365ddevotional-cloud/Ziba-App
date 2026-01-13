# Ziba Design Guidelines

## Design Approach
**Reference-Based: Uber/Lyft-Inspired Modern Mobility Platform**

Draw inspiration from Uber's clean professionalism and Lyft's approachable aesthetic. Focus on trust, clarity, and efficiency. This is a foundation-stage app, so maintain simplicity while establishing a scalable visual system.

---

## Ziba Design System

### Colors
- **PrimaryColor**: Use Ziba brand primary (dark blue) ONLY for:
  - Primary CTA buttons
  - Active ride status indicators
  - Progress indicators
  - Important links
- **BackgroundColor**: Light neutral (cards sit on this)
- **CardColor**: White or near-white with subtle border
- **TextPrimary**: Dark neutral (headings) - `text-foreground`
- **TextSecondary**: Muted gray (supporting text) - `text-muted-foreground`
- **SuccessColor**: Soft emerald green (ARRIVED, COMPLETED states)
- **DangerColor**: Muted red (Cancel only, never for status)

### Color Rules
- Never use bright colors for body text
- Never mix multiple accent colors on one screen
- No red/orange for non-critical states
- Use semantic colors from the design system utilities

### Status Colors (Ride States)
- **Searching**: Amber/yellow tones (`ziba-status-searching`)
- **Driver En Route**: Blue tones (`ziba-status-enroute`)
- **Arrived**: Emerald/green tones (`ziba-status-arrived`)
- **In Progress**: Primary color (`ziba-status-progress`)
- **Completed**: Emerald/green tones (`ziba-status-complete`)

---

## Typography
- **Primary Font**: Inter (system sans-serif fallback)
- **Headline**: `ziba-headline` - text-2xl, font-semibold, tracking-tight
- **Subheadline**: `ziba-subheadline` - text-base, font-normal, muted color
- **Body**: `ziba-body` - text-sm, normal weight
- **Body Muted**: `ziba-body-muted` - text-sm, muted color
- **Caption**: `ziba-caption` - text-xs, uppercase, tracking-wide

### Typography Rules
- No decorative fonts
- No excessive bolding
- No inconsistent font sizes within the same view
- Use consistent hierarchy across all screens

---

## Layout System
**Tailwind Spacing**: Use units of 4, 5, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Screen padding: `p-5` or `px-5`
- Card padding: `p-4` to `p-6`
- Bottom nav offset: `pb-24`
- Component gaps: `space-y-5` or `gap-4`

---

## Component Library

### Cards
- Standard: `ziba-card` - subtle border, rounded-xl
- Elevated: `ziba-card-elevated` - with shadow-sm

### Buttons
- Primary: Full background, h-12 for main CTAs
- Secondary: Border style with transparent background
- Cancel: `ziba-cancel-btn` - subtle destructive, outline style
- Size="icon" for icon-only buttons

### Status Display
- Large centered icon in colored circular background
- Clear headline text (human-readable, not technical)
- Supportive subtext below

---

## Rider App Screens

### Rider Home
- Greeting header: "Hello, [FirstName]"
- Primary CTA: "Where are you going?" card
- Wallet balance card (compact)
- Recent trips list (max 3)
- Clean, minimal layout with generous whitespace

### Ride Status (Live Ride)
- Hero status display: large icon, headline, subtext
- Human-readable status messages:
  - "Finding your driver" (not REQUESTED)
  - "Driver on the way" (not DRIVER_EN_ROUTE)
  - "Driver has arrived" (not ARRIVED)
  - "Trip in progress" (not IN_PROGRESS)
- Driver card: photo placeholder, name, rating, vehicle
- Trip details: pickup/dropoff with colored dots
- Cancel button: subtle, secondary styling

### Trip Summary
- Completion confirmation with checkmark
- Fare prominently displayed
- Driver rating UI (5 stars)
- Route summary

### Request Ride
- Location inputs with colored indicators
- Recent places list
- Map placeholder
- Single primary CTA

---

## Error Handling (UI)
- Never show technical error messages to users
- Never display internal status names (e.g., DRIVER_EN_ROUTE)
- Never show router or system error messages
- Use calm, reassuring language

### User-Friendly Error Examples
Instead of: "Did you forget to add the page to the router?"
Show: "We're having trouble loading this screen. Please try again."

Instead of: "Network error: ETIMEDOUT"
Show: "Connection issue. Please check your internet and try again."

Log technical details to console only.

---

## Visual Rhythm
- Consistent 8px baseline grid
- Generous whitespace between sections
- Maintain breathing room around interactive elements
- Card borders: subtle, consistent
- No mixing of bordered and shadow-only cards in same view

**Key Principle**: Professional, trustworthy, and efficient. Every element should communicate reliability and ease of use. The app should feel calm, modern, and premium.