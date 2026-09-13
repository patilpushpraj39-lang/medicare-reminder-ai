# 💊 MediCare Reminder AI

MediCare Reminder AI is a responsive medication-management web application. Signed-in users can create medicine schedules, record taken or missed doses, review seven-day adherence, and enable browser reminders.

## 🌐 Live website

[Open MediCare Reminder AI](https://patilpushpraj39-lang.github.io/medicare-reminder-ai/)

## Features

- Email/password authentication and optional Google OAuth through Supabase
- Add, edit, search, and delete medicines
- Multiple daily reminder times, treatment dates, dosage, quantity, food timing, doctor, and notes
- Real dose history stored in PostgreSQL
- Taken, pending, and missed dose states
- Seven-day adherence calculated from the signed-in user's records
- Opt-in browser notifications while the dashboard is open
- Built-in safety assistant for schedule summaries and responsible escalation
- Responsive landing page and dashboard
- Row-level security that isolates each user's records

> MediCare Reminder AI is an organizational tool, not a medical device. It does not diagnose conditions or recommend medication changes. Users should confirm medication questions with a qualified healthcare professional.

## Tech stack

- React 19, TypeScript, TanStack Router/Start, Vite, and Tailwind CSS
- Supabase Auth, PostgreSQL, and Row Level Security
- GitHub Actions and GitHub Pages

## Local development

Create a `.env.local` file with a Supabase project URL and publishable key:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Then run:

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys `dist/client` to GitHub Pages on every push to `main`. The repository must define these Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

For authentication callbacks, add the following URLs to the Supabase project's redirect allow list:

- `https://patilpushpraj39-lang.github.io/medicare-reminder-ai/dashboard`
- `https://patilpushpraj39-lang.github.io/medicare-reminder-ai/reset-password`

## Project structure

```text
src/routes/                 Landing, authentication, and dashboard routes
src/integrations/supabase/  Typed Supabase browser client
supabase/migrations/        Database schema and RLS policies
.github/workflows/          GitHub Pages deployment
```
