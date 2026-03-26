# MediTransit - Non-Emergency Ambulance Booking Platform

MediTransit is a modern, full-stack Next.js application designed to streamline the process of booking non-emergency ambulances. It connects patients with verified ambulance providers, offering real-time status updates and a comprehensive admin dashboard for request management.

## 🚀 Key Features

### 🚑 For Patients & Users
- **Easy Booking Flow:** Quick search and booking for basic or advanced life support ambulances.
- **Patient-Centric Data:** Dedicated fields for patient names, ages, and specific medical conditions.
- **Booking Confirmation:** Real-time tracking of request status (Pending → Accepted → On the Way).
- **Cost Estimation:** Transparent pricing based on base charges and distance calculations.

### 🛠️ For Admin & Operators
- **Request Management:** A powerful dashboard to accept, reject, or assign ambulance requests.
- **Audit Logs:** Full traceability of all admin actions for accountability and troubleshooting.
- **Statistics Dashboard:** High-level overview of total, pending, and completed bookings.
- **Provider View:** Management of ambulance service providers and their vehicle fleets.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** Custom Store with Supabase Sync
- **Forms:** React Hook Form & Zod Validation

## 🏗️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase Project

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the SQL script located at `scripts/setup-database.sql` in your Supabase SQL Editor. This will create all necessary tables, indexes, and initial RLS policies.

### 4. Installation & Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

- `/app`: Next.js App Router pages and API routes.
- `/components`: Reusable UI components (Shared, Admin, Ambulance, Booking).
- `/lib`: Supabase clients, state stores, and utility functions (Pricing, Distance).
- `/scripts`: SQL setup and maintenance scripts.
- `/public`: Static assets and image icons.

## 🔐 Authentication & RLS
Currently, the platform uses a client-side simulated authentication context for rapid development. **Row Level Security (RLS)** is managed via the `scripts/disable-rls.sql` or `scripts/fix-rls.sql` scripts depending on your environment needs.

---
Built with ❤️ for improved medical accessibility.
