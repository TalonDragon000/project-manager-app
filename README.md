# Gatekeeper — Mobile Priority App

A focused, no-account mobile productivity app for indie makers and solo developers.
Built with Expo (React Native), Supabase, and a device-scoped anonymous data model.

Gatekeeper forces intentional prioritization using the RICE scoring framework combined
with MoSCoW filtering. Every task earns its place.

---

## What It Does

- Manage multiple projects, one active at a time (The Vault)
- Capture raw ideas instantly (Brain Dump → "To Sort")
- Score tasks with RICE (Reach × Impact × Confidence ÷ Effort) on a Fibonacci scale
- Override scores with MoSCoW categorization (Must / Should / Could / Won't)
- Auto-assign tasks to a priority column: High, Med, Low, Later, or To Sort
- View a live GO Roadmap (Now / Next) and Devlog (completed wins)
- Swipe between priority columns on the Tasks screen
- Long-press any task card to re-score it in the Wizard

---

## Tech Stack

| Layer           | Technology                           |
|-----------------|--------------------------------------|
| Framework       | Expo SDK 54 / React Native 0.81      |
| Navigation      | Expo Router v6 (file-based tabs)     |
| Database        | Supabase (PostgreSQL + PostgREST)    |
| Auth model      | Anonymous device identity (no login) |
| Secure storage  | expo-secure-store                    |
| Icons           | lucide-react-native                  |
| SVG graphics    | react-native-svg                     |
| Language        | TypeScript                           |

---

## Project Structure

```
app/
  _layout.tsx              Root layout (Expo Router Stack)
  (tabs)/
    _layout.tsx            Tab bar layout with AppProvider wrapper
    index.tsx              Home tab — Strategy Dashboard
    tasks.tsx              Tasks tab — Kanban column view

components/
  modals/
    WizardModal.tsx        "The Gatekeeper" — RICE + MoSCoW task wizard
    QuickNoteModal.tsx     Brain Dump — instant idea capture
    VaultModal.tsx         Project switcher bottom sheet
    OnboardingModal.tsx    New project creation form

context/
  AppContext.tsx           React Context wrapping useAppStore hook

store/
  appStore.ts              Central data layer — Supabase queries, device init,
                           RICE logic, column prediction

lib/
  supabase.ts              Supabase client with dynamic device header injection
  deviceId.ts              Persistent anonymous device UUID (SecureStore / localStorage)

types/
  database.ts              TypeScript types for the Supabase schema

supabase/migrations/
  ..._create_projects_and_tasks.sql    Initial schema, RLS enable, seed data
  ..._add_device_id_and_scope_rls.sql  device_id columns + per-device RLS policies
```

---

## Screens

### Home Tab — Strategy Dashboard

- Circular progress ring showing % of project tasks completed
- Project mission statement
- Strategy Specs placeholders (WHO / WHAT / WHY) — ready for content
- GO Roadmap: "Now" (High priority tasks) and "Next" (Med / Low tasks)
- Devlog: reverse-chronological list of completed tasks
- FAB (+) button for New Priority Task, Quick Note, and New Project

### Tasks Tab — Kanban Column View

- Five columns: **High**, **Med**, **Low**, **Later**, **To Sort**
- Swipe left / right to move between columns (touch gesture on scroll area and header)
- Tap dot indicators to jump directly to any column
- Each task card shows title, tags, RICE score, and MoSCoW badge
- Tap the circle button to mark a task complete (brief confetti moment)
- Long-press a card (500 ms) to open the Wizard and re-score it
- "To Sort" column shows a Brain Dump button and a Prioritize action per card
- Peek arrow on the right edge advances to the next column

---

## Modals

### The Gatekeeper (Wizard)

The intentional prioritization modal. Forces you to think before committing a task.

1. Name the goal
2. Apply quick tags (Growth, Retention, Tech Debt, Core Loop, Bugfix)
3. Set MoSCoW category — overrides RICE for Must (always High) and Won't (always Later)
4. Rate each RICE dimension on the Fibonacci scale: 1, 2, 3, 5, 8
   - **Reach** — how many users does this affect per period?
   - **Impact** — how much does it move the needle? (massive = 8, minimal = 1)
   - **Confidence** — how sure are you of these estimates?
   - **Effort** — how many person-weeks? (lower is better)
5. Live gauge shows the calculated tier and RICE points as you adjust sliders
6. Tap "Commit to X Priority" to save

### Brain Dump (Quick Note)

One-tap idea capture. Sends the note straight to "To Sort" with default RICE values.
Return later to prioritize it properly when you have time.

### The Vault

Bottom sheet listing all projects. Tap to switch the active project.
Includes a shortcut to create a new project.

### Onboarding

Shown automatically when no projects exist (fresh install or all projects deleted).
Requires a project name; mission statement is optional.

---

## Data Model

### projects

| Column     | Type         | Notes                                |
|------------|--------------|--------------------------------------|
| id         | uuid PK      | Auto-generated                       |
| name       | text         | Project display name                 |
| mission    | text         | One-sentence purpose statement       |
| device_id  | text         | Owning device UUID (RLS key)         |
| user_id    | uuid         | Reserved for future auth (nullable)  |
| created_at | timestamptz  |                                      |

### tasks

| Column          | Type        | Notes                                   |
|-----------------|-------------|-----------------------------------------|
| id              | uuid PK     | Auto-generated                          |
| project_id      | uuid FK     | References projects(id), CASCADE delete |
| title           | text        | Task / goal name                        |
| reach           | int         | Fibonacci: 1 / 2 / 3 / 5 / 8           |
| impact          | int         | Fibonacci: 1 / 2 / 3 / 5 / 8           |
| confidence      | int         | Fibonacci: 1 / 2 / 3 / 5 / 8           |
| effort          | int         | Fibonacci: 1 / 2 / 3 / 5 / 8           |
| moscow          | text        | Must / Should / Could / Won't           |
| priority_column | text        | High / Med / Low / Later / To Sort      |
| completed       | boolean     | Default false                           |
| tags            | text[]      | Array of tag strings                    |
| device_id       | text        | Owning device UUID (RLS key)            |
| created_at      | timestamptz |                                         |

---

## Security Model

This app uses **anonymous device-scoped data isolation** — no accounts, no login.

### How it works

1. On first launch, `lib/deviceId.ts` generates a UUID v4 and stores it permanently
   in the device keychain via `expo-secure-store` (iOS / Android) or `localStorage`
   (web).

2. `lib/supabase.ts` exposes `setDeviceId(id)` which injects the UUID into the
   `x-device-id` HTTP header on every Supabase request via `global.headers`.

3. `store/appStore.ts` calls `getOrCreateDeviceId()` on mount, injects the ID into
   the Supabase client, then fetches data. All `INSERT` calls stamp `device_id` onto
   every new row.

4. PostgreSQL RLS policies on both tables evaluate:
   ```sql
   device_id = (current_setting('request.headers', true)::json)->>'x-device-id'
   ```
   A device can only SELECT, INSERT, UPDATE, or DELETE its own rows. Any request
   without the correct header — or with a different device ID — returns zero rows on
   reads and fails the `WITH CHECK` clause on writes.

### What this means in practice

- Each phone install is a completely isolated data silo
- No user can access another user's data, even with the anon key
- The Supabase anon key is safe to ship in the app bundle because RLS enforces
  cross-device isolation at the database layer
- Uninstalling the app loses the device ID and therefore access to that device's data
  (by design for an MVP — a future auth layer can replace this)

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- A Supabase project (free tier is sufficient)

### Steps

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file at the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Apply the database migrations by pasting the two SQL files from
   `supabase/migrations/` into the Supabase SQL Editor in chronological order,
   or by running:
   ```bash
   npx supabase db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

---

## Available Scripts

| Script              | Description                            |
|---------------------|----------------------------------------|
| `npm run dev`       | Start Expo dev server                  |
| `npm run build:web` | Export static web build to `dist/`     |
| `npm run lint`      | Run Expo linter                        |
| `npm run typecheck` | Run TypeScript type checks only        |

---

## RICE Scoring Reference

```
RICE Score = (Reach × Impact × Confidence) ÷ Effort
```

| MoSCoW / Score | Predicted column |
|----------------|-----------------|
| Must           | High (always)   |
| Won't          | Later (always)  |
| Score >= 25    | High            |
| Score 10-24    | Med             |
| Score < 10     | Low             |

Fibonacci values prevent false precision on large estimates. If an estimate feels
bigger than a 3, jump to 5 — the gap is intentional.

---

## Roadmap / Coming Soon

- [ ] Strategy Specs — fill in WHO / WHAT / WHY per project
- [ ] User authentication — replace device ID with real accounts for cross-device sync
- [ ] Task archiving — permanent delete vs. archive completed tasks
- [ ] Project analytics — velocity and completion rate over time
- [ ] Drag-and-drop reordering within a column
- [ ] Push notifications for stale High-priority tasks
- [ ] Export / share roadmap as image or link
