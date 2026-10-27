## School Management Admin Portal

A modern, high-performance administrative web application designed for educational institutions. Built with **React 19**, **Vite**, and **TanStack Query**, featuring an intentional design system with full dark/light theme support.

---

## Key Features

- **Executive Dashboard**: Real-time KPI stat cards, fee collection trend charts, class size capacity metrics, and multi-entity activity counters.
- **Student & Guardian Management**: Complete student records, profile details, document uploads (birth certificates, photos), and a multi-step student enrollment wizard with instant guardian lookup or inline registration.
- **Faculty & Staff Directory**: Teacher directory with assigned subject badges, degree credentials, qualification certificate uploads, and multi-subject onboarding wizards.
- **Academic Operations (Classes & Subjects)**:
  - Section management, room allocations, and grade badge tile fallbacks (`ClassImageTile`).
  - Curriculum catalog with subject codes, syllabus tracking, and cover image uploads.
- **Complaints & Dispute Resolution Desk**: Structured 3-state resolution pipeline (`Open`, `Under review`, `Resolved`) with resolution notes, case timelines, status filters, and case deletion.
- **Campus Notices & Announcements**: School-wide broadcast notice board with multipart file attachment uploads, category/severity filtering, and notice editor.
- **Finance & Invoicing**: Tuition fee tracking, invoice generator modal, payment status tracking, and transaction ledger.
- **Universal Deletion Safeguards**: Interactive confirmation modals across all entities (Students, Teachers, Guardians, Classes, Subjects, Announcements, Complaints) with automatic cross-query cache invalidation.
- **Secure Authentication**: Refined login experience with password visibility toggle, session persistence ("Remember me"), focus animations, and security trust badges.
- **Tailored Design System**: Custom CSS design tokens, browser autofill styling normalization, reusable card anatomy (`.cd-top`, `.cd-body`, `.cd-footer`, `.cd-btn-view`, `.cd-btn-delete`), and dark-mode tag contrasts.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | React 19, React Router v7 |
| **Build & Tooling** | Vite, Oxlint |
| **Server State & HTTP**| TanStack Query v5, Axios |
| **Icons & Typography** | Lucide React, Bricolage Grotesque, Manrope |
| **Styling** | Vanilla CSS (Design Tokens, Custom Reset, Responsive Grid, Micro-animations) |

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FarhadNuri/School-Management-Admin.git
   cd School-Management-Admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Configure your backend API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/admin
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```text
src/
├── api/          # Axios client, multipart serializers, queryClient, and entity adapters
├── assets/       # Branding assets, vector illustrations, and media
├── components/   # Reusable UI library (modals, forms, ClassImageTile, stats, inputs)
├── features/     # Feature domains:
│   ├── announcements/  # Notice board, attachment uploads & filters
│   ├── auth/           # Login screen with password visibility & validation
│   ├── classes/        # Class sections, schedules & class detail view
│   ├── complaints/     # Dispute resolution desk, status state machine & detail views
│   ├── courses/        # Subjects catalog, cover image uploads & syllabus views
│   ├── guardians/      # Guardian directory & linked student records
│   ├── overview/       # Executive dashboard KPIs & metrics
│   ├── payments/       # Fee billing, transactions & invoice generation
│   ├── students/       # Student directory, detail views & enrollment wizard
│   └── teachers/       # Faculty directory, credential management & onboarding wizard
├── hooks/        # Custom hooks (TanStack queries & mutations, debounce, theme)
├── layout/       # AdminLayout shell, TopBar, and Sidebar navigation
├── routes/       # React Router configuration and AdminGuard auth protection
├── services/     # API service methods and auth token management
└── styles/       # CSS tokens, base reset, and reusable component classes
```

---

## Available Scripts

- `npm run dev` — Starts local development server with HMR.
- `npm run build` — Bundles production assets.
- `npm run lint` — Runs fast static analysis via Oxlint.
- `npm run preview` — Previews the production build locally.

