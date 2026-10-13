# CampusPulse 🎓✨
> **Discover Better. Organize Smarter. Connect Campus.**  
> *Developed for SYNESIS '26 — Smart Campus Hackathon*

CampusPulse is a complete, production-grade, two-sided smart campus event management and discovery platform. It eliminates fragmented WhatsApp invites, clash-prone manual hall bookings, and counterfeit physical passes by uniting students, club organizers, faculty approvers, and university administrators in one frictionless ecosystem.

---

## 🎨 Strict Design System & Palette

In accordance with competition branding guidelines, **no blue or purple shades are used anywhere** in the user interface, focus rings, badges, or analytics charts.

| Role | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Forest Green | `#174C3C` | Top navigation, primary CTA buttons, brand badges |
| **Secondary** | Warm Emerald Green | `#27866A` | Sub-headings, active indicators, verified tags |
| **Accent** | Vibrant Coral | `#FF6B4A` | Live alerts, highlight chips, urgency badges |
| **Highlight** | Golden Yellow | `#F4C95D` | Star badges, Monogram accents, warning tags |
| **Background** | Warm Ivory | `#FAF8F2` | Body backdrop, card hover surfaces |
| **Card Surface** | Pure White | `#FFFFFF` | Cards, modals, data tables |
| **Primary Text** | Dark Charcoal | `#202923` | High-contrast editorial typography |
| **Muted Text** | Olive Gray | `#73796F` | Metadata, captions, placeholders |
| **Borders** | Soft Warm Gray | `#E8E5DC` | Dividers, subtle borders, input outlines |

---

## ⚡ Core Features & Complete Event Lifecycle

CampusPulse models the **end-to-end journey** of campus event discovery, scheduling, authorization, and attendance:

### 1. 🔍 Student Experience (`/events`, `/dashboard/student`)
- **Smart Discovery Feed**: Real-time filtering by category (Technical, Hackathons, Workshops, Cultural, Sports, Entrepreneurship, Art & Design, Clubs), dates, and campus venues.
- **Rule-Based Recommendations**: Scores and promotes events aligning with student academic departments and selected preference tags.
- **Capacity-Protected Registration**: Atomic seat allocation prevents overbooking.
- **Cryptographic QR Passbook**: HMAC-signed tamper-proof tokens generated on confirmation without leaking sensitive student PII into raw QR text.
- **Calendar Sync**: One-click `.ics` RFC 5545 calendar download for Apple Calendar, Google Calendar, and Outlook.
- **My Registrations (`/my-registrations`)**: Dedicated passbook with Upcoming, Completed, and Cancelled tabs.

### 2. 🚀 Organizer Workflow (`/host`, `/host/create`, `/dashboard/organizer`)
- **AI Flyer-to-Event Auto-Fill**:
  - Image upload with client-side preview.
  - Powered by Google Gemini Vision API (`gemini-1.5-flash`) on the server.
  - Transparent fallback: When an API key is not configured, automatically activates manual draft mode without pretending or inserting silent fakes.
  - Flags ambiguous times or dates for mandatory human review.
- **Server-Side Venue Conflict Engine**:
  - Calculates time slot interval overlaps `(StartA < EndB AND EndA > StartB)` across active bookings at the requested auditorium or lab.
  - Proposes non-overlapping alternative time slots on the same date.
  - Suggests free alternative campus venues matching event capacity.
  - Blocks submission for approval until conflicts are cleared.
- **Organizer Analytics**: Real-time registration velocity curves, turnout percentages, and category distributions built with Recharts in our custom forest-and-coral theme.

### 3. 🛡️ Digital Approval Workflow (`/approvals`)
- **Authorized Oversight**: Reserved for faculty deans and campus approvers.
- **Live Conflict Recheck**: Re-evaluates venue availability on-the-fly before authorizing.
- **Rejection Accountability**: Mandatory rejection reasons with guidance notes returned directly to organizers for revision and resubmission.
- **Audit History**: Full log of approvals, rejections, approver IDs, and timestamps.

### 4. 📲 Gate Scanner & QR Check-in (`/check-in`)
- **Real-time Camera Scanner**: Powered by `html5-qrcode` to scan physical passes or phone screens with low-light camera support.
- **Manual Code Lookup**: Fallback entry for registration codes (e.g., `REG-CP-2026-X891`).
- **Duplicate Prevention**: Immediate detection and rejection of re-used tickets with timestamp of prior scan.
- **Live Attendance Roster**: Dynamic turnout rate and attendee list synchronization.

### 5. 🏛️ System Administration (`/dashboard/admin`)
- Campus-wide user demographic breakdown.
- Venue utilization rankings across all university halls.
- System-wide approvals queue oversight.

---

## 👥 Demo Accounts (1-Click Switcher Available in UI!)

For effortless hackathon evaluation, CampusPulse features a **top demo switcher bar** that allows instant role-switching with one click:

| Role | Name | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `alex.student@campus.edu` | `password123` | Discover, register, receive QR passes, view calendar |
| **Organizer** | Maya Patel | `maya.organizer@campus.edu` | `password123` | Upload flyer, check conflicts, submit drafts, track registrations |
| **Approver** | Dean Marcus Vance | `dean.approver@campus.edu` | `password123` | Review pending queue, inspect conflicts, approve/reject with feedback |
| **Admin** | Campus Systems | `admin@campus.edu` | `password123` | University-wide overview, venue utilization, global approvals |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Lucide React, Recharts, `qrcode.react`, `html5-qrcode`, `canvas-confetti`.
- **Backend**: Node.js v24, Express, TypeScript (`tsx`), SQLite via `better-sqlite3` (with WAL mode enabled), JWT authentication, HMAC-SHA256 tokens, Multer.
- **AI Vision Integration**: `@google/generative-ai` with structured JSON schema and confidence validation.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher, tested on v24)
- npm

### 2. Installation
Clone or navigate to the repository directory:
```bash
cd campuspulse
npm run install:all
```

### 3. Initialize Database & Seed Demo Events
Run the database seed script to populate realistic venues, approved events, pending drafts, registrations, and demo users:
```bash
npm run seed
```

### 4. Environment Variables
Copy `.env.example` in `server/.env`:
```env
PORT=5000
JWT_SECRET=campuspulse-synesis26-jwt-top-secret
QR_SECRET=campuspulse-synesis26-secure-secret-salt-forest-ivory
# Optional: Set your Google Gemini API key for AI flyer extraction
GEMINI_API_KEY=
```

### 5. Start Development Servers
Start backend API:
```bash
npm run dev:server
```
*(Runs on `http://localhost:5000`)*

In a second terminal, start Vite frontend:
```bash
npm run dev:client
```
*(Runs on `http://localhost:5173` with automatic API proxy to port 5000)*

### 6. Run Automated End-to-End Test Suite
To verify all 21 critical workflows (registration, capacity checks, conflict intervals, approvals, gate scanning, duplicate blocks):
```bash
npm run test:e2e
```

---

## 🏆 SYNESIS '26 Hackathon Verification Summary

- **Automated E2E Suite**: 21 / 21 tests passed (100%).
- **Color Discipline**: 0 blue or purple elements; strictly deep forest green, warm emerald, vibrant coral, golden yellow, and warm ivory.
- **Database Architecture**: SQLite WAL mode with foreign key referential integrity and atomic transaction guarantees.
- **Live Testing URLs**:
  - Web UI: `http://localhost:5173/`
  - Health API: `http://localhost:5000/api/health`
  - Public Discovery: `http://localhost:5173/events`
  - Gate Check-in: `http://localhost:5173/check-in`
  - Approvals Queue: `http://localhost:5173/approvals`
