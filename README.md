## School Management Admin Portal

A modern, high-performance administrative web application designed for higher education institutions. Built with **React 19**, **Vite**, and **TanStack Query**, featuring a tailored design system with full dark/light theme support.

---

## Features

- **Executive Dashboard**: Real-time KPI stat cards, fee collection trend charts, class size capacity bars, and gender distribution donuts.
- **Student & Guardian Management**: Complete student records, profile details, document uploads (IDs, photos), and a multi-step student enrollment wizard with guardian linking.
- **Faculty & Staff**: Teacher directory, department assignments, and onboarding workflows.
- **Academic Operations**: Class section manager and course catalog with room allocation.
- **Finance & Invoicing**: Tuition fee tracking, invoice generator modal, and transaction ledger.
- **Campus Helpdesk & Notices**: Dispute/complaint resolution desk and broadcast announcements manager.
- **Modern UI/UX**: Custom CSS design tokens, smooth micro-interactions, responsive side navigation, and zero heavy UI dependencies.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | React 19, React Router v7 |
| **Build & Tooling** | Vite, Oxlint |
| **Server State & HTTP**| TanStack Query v5, Axios |
| **Icons & Typography** | Lucide React, Bricolage Grotesque, Manrope |
| **Styling** | Vanilla CSS (CSS Variables / Tokens, Custom Reset, Responsive Grid) |

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
├── api/          # Axios client, multipart serializers, queryClient, and adapters
├── assets/       # Branding assets, vector illustrations, and sprites
├── components/   # Reusable UI component library (modals, forms, stats, inputs)
├── features/     # Domain feature modules (overview, students, teachers, etc.)
├── hooks/        # Custom hooks (queries, debounce, theme)
├── layout/       # AdminLayout shell, TopBar, and Sidebar navigation
├── routes/       # React Router setup and AdminGuard auth protection
├── services/     # API service methods
└── styles/       # CSS tokens, base reset, and reusable component styles
```

---

## Available Scripts

- `npm run dev` — Starts local development server with HMR.
- `npm run build` — Bundles production assets.
- `npm run lint` — Runs fast static analysis via Oxlint.
- `npm run preview` — Previews the production build locally.

---
