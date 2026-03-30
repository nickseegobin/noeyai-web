# NoeyAI Web — Documentation

> The Caribbean's first AI-focused platform for primary school education.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [User Roles & Flows](#4-user-roles--flows)
5. [Authentication & Security](#5-authentication--security)
6. [Exam System](#6-exam-system)
7. [Gem / Token Economy](#7-gem--token-economy)
8. [Analytics & AI Insights](#8-analytics--ai-insights)
9. [Avatar System](#9-avatar-system)
10. [API Reference](#10-api-reference)
11. [Data Models](#11-data-models)
12. [Components](#12-components)
13. [Utility Functions](#13-utility-functions)
14. [Configuration & Environment](#14-configuration--environment)
15. [Design System](#15-design-system)

---

## 1. Overview

**NoeyAI** is an AI-powered unlimited practice exam platform designed for primary school students in Trinidad and Tobago preparing for the **Secondary Entrance Assessment (SEA)**. The platform uses artificial intelligence to generate curriculum-aligned practice questions without repetition, giving students unlimited opportunity to practise across every subject and standard.

**Key Value Propositions**:
- Unlimited, non-repeating AI-generated exam questions
- Covers all 4 core SEA subjects across Standards 1–5 and Terms 1–3
- Parents can monitor child performance and receive weekly AI-generated insights
- Gamified gem economy encourages engagement

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5 |
| Component Library | HeroUI React | 2.6.11 |
| Styling | TailwindCSS | 3.4.19 |
| Animations | Framer Motion | 12.38.0 |
| HTTP Client | Axios | 1.13.6 |
| Font | Nunito (Google Fonts) | — |
| Linting | ESLint + eslint-config-next | 9 / 16.2.1 |

**Backend**: WordPress with a custom REST API namespace (`/wp-json/noey/v1`).

---

## 3. Project Structure

```
noeyai-web/
├── app/                          # Next.js App Router (pages & layouts)
│   ├── layout.tsx               # Root layout — metadata, font, providers
│   ├── page.tsx                 # Landing / marketing page
│   ├── globals.css              # Global CSS & utility classes
│   ├── providers.tsx            # HeroUI + AuthContext wrapper
│   │
│   ├── login/                   # Login page
│   ├── register/
│   │   ├── parent/              # Parent account registration
│   │   ├── child/               # Child profile registration
│   │   └── pin/                 # Parent PIN setup (post-registration)
│   │
│   ├── settings/pin/create/     # Parent PIN creation (in-app)
│   ├── profile-select/          # Multi-profile selection screen
│   │
│   ├── child/                   # Child user section
│   │   ├── home/                # Child dashboard
│   │   ├── subjects/            # Subject + filter selection
│   │   ├── difficulty/          # Difficulty selection
│   │   ├── prestart/            # Exam preview & resume check
│   │   ├── exam/                # Active exam interface
│   │   ├── results/             # Post-exam results & breakdown
│   │   ├── progress/            # Historical progress view
│   │   ├── settings/            # Child account settings
│   │   └── content-settings/    # Curriculum filter settings
│   │
│   ├── parent/                  # Parent user section
│   │   ├── home/                # Parent dashboard
│   │   ├── analytics/           # Child performance analytics
│   │   ├── exam-detail/         # Detailed exam review
│   │   ├── children/            # Manage child profiles
│   │   ├── tokens/              # Gem / token purchase
│   │   └── settings/            # Parent account settings
│   │
│   └── news/                    # News & announcements
│
├── components/ui/               # Reusable UI components
│   ├── NavBar.tsx
│   ├── AvatarCircle.tsx
│   ├── AvatarPicker.tsx
│   ├── AvatarMenu.tsx
│   ├── GemBadge.tsx
│   ├── PinInput.tsx
│   ├── BackButton.tsx
│   └── Spinner.tsx
│
├── context/
│   └── AuthContext.tsx          # Global auth state & useAuth hook
│
├── lib/
│   ├── api.ts                   # Axios instance with auth interceptors
│   └── utils.ts                 # Shared helper functions
│
├── types/
│   └── noey.ts                  # All TypeScript interfaces for the API
│
├── public/avatars/
│   ├── children/                # 10 child avatar images
│   └── parents/                 # 10 parent avatar images
│
├── .env.local                   # Environment variables
├── next.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. User Roles & Flows

### Roles

| Role | Description |
|---|---|
| `parent` | Account owner. Can manage child profiles, view analytics, purchase gems. |
| `child` | Student profile. Takes exams, views own results and progress. |
| `admin` | Platform administrator (internal use). |

### Registration Flow

```
/register/parent  →  (creates account)
      ↓
/register/child   →  (creates first child profile)
      ↓
/register/pin     →  (sets 4-digit parent PIN)
      ↓
/profile-select
```

### Login Flow

```
/login  →  /profile-select
              ├── Select Parent  →  PIN prompt  →  /parent/home
              └── Select Child   →  /child/home
```

### Child Exam Flow

```
/child/home
    ↓
/child/subjects      (pick subject + standard/term filters)
    ↓
/child/difficulty    (pick Easy / Medium / Hard + see gem cost)
    ↓
/child/prestart      (preview exam details, resume if session exists)
    ↓
/child/exam          (timed exam with checkpoint saving)
    ↓
/child/results       (score, topic breakdown, AI coaching note)
```

---

## 5. Authentication & Security

### JWT Authentication

- On login, the server returns a JWT token stored in `localStorage` under the key `noey_token`.
- All API requests include the token via an Axios request interceptor as a `Bearer` header.
- On any `401 Unauthorized` response, the interceptor clears the token and redirects to `/login`.

### Parent PIN

- Parents set a 4-digit PIN during registration and can update it in settings.
- Accessing the parent panel from the profile selector always requires PIN entry.
- Failed attempts trigger a server-side lockout with a cooldown countdown.
- PIN state is fetched from `GET /auth/pin/status` (returns lock status and time remaining).

### Auth Context (`context/AuthContext.tsx`)

| Property / Method | Description |
|---|---|
| `user` | Current `NoeyUser` object or `null` |
| `loading` | `true` while the initial auth check is running |
| `login(token, userData)` | Store token & set user state |
| `logout()` | Clear token, reset state, redirect to `/` |
| `refreshUser()` | Re-fetch user data from `GET /auth/me` |
| `setActiveChild(childId)` | Switch the active child profile |

---

## 6. Exam System

### Subjects

| Subject | Key |
|---|---|
| Mathematics | `mathematics` |
| Language Arts | `language_arts` |
| Social Studies | `social_studies` |
| Science | `science` |

### Standards & Terms

- **Standards**: `std_1` through `std_5`
- **Terms**: `term_1`, `term_2`, `term_3` (Standards 1–4 only; Standard 5 has no term filter)

### Difficulty Levels

| Difficulty | Questions | Gem Cost |
|---|---|---|
| Easy | 20 | 1 gem |
| Medium | 40 | 2 gems |
| Hard | 60 | 3 gems |

### Question Structure

Each question includes:
- `question_text` — the question string
- `options` — array of answer choices
- `correct_index` — index of the correct answer
- `topic` — curriculum topic label
- `cognitive_level` — one of: `recall`, `application`, `analysis`, `knowledge`, `comprehension`
- `tip` / `explanation` — coaching content shown post-exam

### Exam Lifecycle

1. **Start** — `POST /exams/start` deducts gems and returns an `ExamSession` with all questions.
2. **Checkpoint** — `POST /exams/{id}/checkpoint` saves current progress (question index, answers, elapsed time) to allow resuming.
3. **Resume** — On `/prestart`, the app checks `GET /exams/active`; if a session exists the user can continue from where they left off.
4. **Submit** — `POST /exams/{id}/submit` sends all answers and returns a `SubmitResult` with score and topic breakdown.
5. **Cancel** — `DELETE /exams/{id}` abandons the session (gems are not refunded).

---

## 7. Gem / Token Economy

- **Gems** (also called tokens) are the in-app currency used to start exams.
- Each difficulty tier costs 1–3 gems per exam attempt.
- Parents can top up gem balances via the `/parent/tokens` page.
- Gems are tracked per child profile and visible in the `GemBadge` component.
- Transaction history (purchases, exam deductions, monthly refreshes) is recorded as `LedgerEntry` objects.

---

## 8. Analytics & AI Insights

### Parent Analytics (`/parent/analytics`)

- Displays stats for a selected child: total exams taken, average score, best subject, weakest topic.
- Lists full exam history with score, date, subject, difficulty.
- Surfaces the current week's **Weekly Digest** (AI-generated summary).

### Weekly Digest

- Fetched from `GET /insights/weekly/{iso_week}` using the current ISO week string (e.g. `2026-W13`).
- Contains an AI-generated narrative summary of the child's performance that week.
- Displayed as a card on the analytics page.

### Exam Insight (AI Coaching Note)

- Triggered via `POST /insights/exam/{id}` after an exam is completed.
- Returns an `InsightResult` with a coaching note tailored to the child's performance on that exam.
- Displayed on the `/child/results` page (when AI coaching is enabled).

### Performance Labels

| Score Range | Label | Color |
|---|---|---|
| ≥ 75% | Strong | `#22C55E` (green) |
| ≥ 50% | Good | `#F59E0B` (amber) |
| < 50% | Needs Work | `#E8396A` (red/pink) |

---

## 9. Avatar System

- Each user (parent or child) selects from **10 avatar options**.
- Child avatars are stored at `/public/avatars/children/avatar-{1–10}.png`.
- Parent avatars are stored at `/public/avatars/parents/avatar-{1–10}.png`.
- Each avatar index maps to one of 10 ring colours defined in `AVATAR_COLORS[]` in `lib/utils.ts`.
- If no avatar is selected, `AvatarCircle` falls back to displaying the user's initials.
- Avatar index for the parent profile is persisted in `localStorage` under `noey_parent_avatar_index`.

---

## 10. API Reference

**Base URL**: `NEXT_PUBLIC_API_BASE` (e.g. `http://noeyai.local/wp-json/noey/v1`)

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Login with username & password |
| `POST` | `/auth/register` | Register a new parent account |
| `GET` | `/auth/me` | Get current user data |
| `POST` | `/auth/pin/verify` | Verify parent PIN |
| `GET` | `/auth/pin/status` | Get PIN lock status |

### Children

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/children` | List all child profiles |
| `POST` | `/children/{id}/switch` | Set active child |
| `POST` | `/children/deselect` | Clear active child |

### Exams

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/exams/start` | Start a new exam session |
| `GET` | `/exams/active` | Check for an unfinished session |
| `POST` | `/exams/{id}/checkpoint` | Save exam progress |
| `POST` | `/exams/{id}/submit` | Submit answers & get result |
| `DELETE` | `/exams/{id}` | Cancel an exam session |

### Results

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/results` | List exam results (supports `child_id`, `per_page`) |
| `GET` | `/results/stats` | Aggregated performance stats |

### Insights

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/insights/exam/{id}` | Generate AI coaching note for an exam |
| `GET` | `/insights/weekly/{iso_week}` | Get weekly AI digest |

### Tokens

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tokens/balance` | Get current & lifetime gem balance |

### Error Codes

| Code | Meaning |
|---|---|
| `noey_invalid_credentials` | Wrong username or password |
| `noey_pin_locked` | Parent PIN is locked due to failed attempts |
| `noey_insufficient_tokens` | Not enough gems to start the exam |
| `noey_no_exam_available` | No questions available for the selected filters |

---

## 11. Data Models

Key TypeScript interfaces defined in [types/noey.ts](types/noey.ts):

```typescript
// Core user
NoeyUser          // id, role, display_name, email, children[], token_balance
ChildProfile      // id, display_name, avatar_index, standard, term, age, active

// Exam lifecycle
ExamCatalogueEntry  // standard, term, subject, difficulty, pool_count
ExamSession         // id, package (ExamPackage), balance_after
ExamPackage         // id, metadata (subject, standard, term, difficulty, question_count), questions[]
Question            // id, question_text, options[], correct_index, topic, cognitive_level, tip, explanation
ActiveSession       // id, metadata, checkpoint (CheckpointState)
CheckpointState     // current_question_index, answers[], elapsed_seconds

// Results
SubmitResult        // score, total, percentage, duration_seconds, topic_breakdown[]
ResultDetail        // ...SubmitResult + questions[] with answer review
ResultStats         // total_exams, average_score, best_subject, weakest_topic
TopicBreakdown      // topic, correct, total, percentage

// AI
InsightResult       // exam_id, insight (string)
WeeklyDigest        // child_id, iso_week, digest (string)

// Billing
TokenBalance        // current_balance, lifetime_earned
LedgerEntry         // id, type, amount, description, created_at
```

---

## 12. Components

### `NavBar`

Top navigation bar rendered on most pages. Displays the app logo, page title, gem balance (`GemBadge`), and a hamburger menu with profile/logout options.

### `AvatarCircle`

Displays a user's avatar image with a coloured ring. Falls back to the user's initials if no avatar is set. Accepts `avatarIndex`, `name`, `role`, and optional `size` props.

### `AvatarPicker`

A modal overlay presenting all 10 avatar options in a grid. Used during registration and in settings to let users choose their avatar.

### `AvatarMenu`

Dropdown or sheet menu anchored to the avatar. Used for quick profile actions.

### `GemBadge`

Displays the gem icon alongside the current gem count. Used in `NavBar` and on the difficulty selection page.

### `PinInput`

A 4-digit PIN input that renders individual character boxes. Handles keyboard input, backspace, and clipboard paste. Used for parent PIN entry and setup screens.

### `BackButton`

A simple chevron-left button for navigating to the previous page. Wraps Next.js `router.back()`.

### `Spinner`

A centered loading spinner shown during data fetching.

---

## 13. Utility Functions

All helpers live in [lib/utils.ts](lib/utils.ts).

### Formatting

| Function | Input | Output |
|---|---|---|
| `formatStandard(std)` | `"std_4"` | `"Standard 4"` |
| `formatTerm(term)` | `"term_1"` | `"Term 1"` |
| `formatDifficulty(d)` | `"medium"` | `"Medium"` |
| `formatDuration(seconds)` | `245` | `"4:05"` |
| `formatDate(iso)` | `"2026-03-25T..."` | `"25 Mar 2026"` |

### Scoring

| Function | Input | Output |
|---|---|---|
| `getScoreLabel(pct)` | `82` | `"Strong"` |
| `getScoreColor(pct)` | `45` | `"#E8396A"` |

### Avatars

| Function | Description |
|---|---|
| `getChildAvatarSrc(index)` | Returns `/avatars/children/avatar-{n}.png` |
| `getParentAvatarSrc(index)` | Returns `/avatars/parents/avatar-{n}.png` |
| `getAvatarSrc(index, role)` | Role-aware wrapper for the above |
| `AVATAR_COLORS[]` | Array of 10 hex colours for avatar rings |

### Time

| Function | Output |
|---|---|
| `getCurrentIsoWeek()` | `"2026-W13"` |

---

## 14. Configuration & Environment

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Base URL for all API requests (e.g. `http://noeyai.local/wp-json/noey/v1`) |

### `next.config.ts`

- `devIndicators: false` — hides the Next.js development indicator overlay
- `remotePatterns` — permits images served from `http://noeyai.local`

### `tsconfig.json`

- Target: `ES2017`, Module: `ESNext`
- Path alias: `@/*` maps to the project root
- Strict mode enabled

### `tailwind.config.js`

Extends Tailwind with the HeroUI plugin and a custom colour palette:

| Token | Hex | Usage |
|---|---|---|
| `noey-bg` | `#ECEDF2` | Page background |
| `noey-surface` | `#E2E3E9` | Card surfaces |
| `noey-surface-dark` | `#D4D5DC` | Darker surfaces |
| `noey-card-dark` | `#3A3A42` | Dark mode cards |
| `noey-text` | `#111114` | Primary text |
| `noey-text-muted` | `#9B9BA8` | Secondary / muted text |
| `noey-primary` | `#2B2B33` | Primary action colour |
| `noey-gem` | `#E8396A` | Gem / accent colour |
| `noey-gem-light` | `#FFF0F4` | Gem light tint |

---

## 15. Design System

### Layout

All pages use a `.page-container` class that centres content with a `max-width` of **430px**, making the app feel native on mobile while remaining usable on desktop. Pages are flex-column with vertical padding and safe-area insets for mobile notch handling.

### Typography

- Font family: **Nunito** (loaded via Google Fonts)
- Consistent use of `font-bold` headings and `font-medium` body text

### Spacing & Radius

- Spacing follows a 5-unit base (5 px increments)
- Border radii favour `rounded-2xl` and `rounded-3xl` for a friendly, rounded aesthetic

### Global CSS Classes

| Class | Purpose |
|---|---|
| `.page-container` | Centred, max-width page wrapper |
| `.noey-btn-primary` | Filled primary action button |
| `.noey-btn-secondary` | Outlined secondary action button |
| `.noey-input` | Standard text input styling |

### Animations

Framer Motion is used for page transitions and component entrance animations throughout the app.

---

*Last updated: March 2026*
