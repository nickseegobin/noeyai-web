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
9. [Leaderboard System](#9-leaderboard-system)
10. [Avatar System](#10-avatar-system)
11. [API Reference](#11-api-reference)
12. [Data Models](#12-data-models)
13. [Components](#13-components)
14. [Utility Libraries](#14-utility-libraries)
15. [Configuration & Environment](#15-configuration--environment)
16. [Design System](#16-design-system)

---

## 1. Overview

**NoeyAI** is an AI-powered unlimited practice exam platform designed for primary school students in Trinidad and Tobago preparing for the **Secondary Entrance Assessment (SEA)**. The platform uses artificial intelligence to generate curriculum-aligned practice questions without repetition, giving students unlimited opportunity to practise across every subject and standard.

**Key Value Propositions**:
- Unlimited, non-repeating AI-generated exam questions
- Covers all 4 core SEA subjects across Standards 4–5 and Terms 1–3
- Parents can monitor child performance and receive weekly AI-generated insights
- Gamified gem economy and competitive leaderboards encourage engagement

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
| Fonts | Poppins + Playfair Display (Google Fonts) | — |
| Linting | ESLint + eslint-config-next | 9 / 16.2.1 |

**Backend**: WordPress with a custom REST API namespace (`/wp-json/noey/v1`). WordPress is also used as a headless CMS for site settings and slider messages via `/wp-json/noeyai/v1`.

---

## 3. Project Structure

```
noeyai-web/
├── app/                          # Next.js App Router (pages & layouts)
│   ├── layout.tsx               # Root layout — metadata, font, providers
│   ├── page.tsx                 # Landing / marketing page (server component)
│   ├── globals.css              # Global CSS & utility classes
│   ├── providers.tsx            # HeroUI + AuthContext wrapper
│   │
│   ├── login/                   # Login page
│   ├── forgot-password/         # Password recovery flow
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
│   │   ├── leaderboard/         # Leaderboard overview (all subjects)
│   │   ├── leaderboard/[subject]/ # Subject-specific leaderboard
│   │   ├── settings/            # Child account settings
│   │   └── content-settings/    # Curriculum filter settings
│   │
│   └── parent/                  # Parent user section
│       ├── home/                # Parent dashboard
│       ├── analytics/           # Child performance analytics
│       ├── exam-detail/         # Detailed exam review
│       ├── children/            # Manage child profiles
│       ├── children/[id]/       # Individual child profile detail
│       ├── children/add/        # Add new child profile
│       ├── tokens/              # Gem / token purchase
│       └── settings/            # Parent account settings
│
├── components/ui/               # Reusable UI components
│   ├── NavBar.tsx               # Top navigation bar
│   ├── AppLeftPanel.tsx         # Desktop sidebar with illustration & brand text
│   ├── BrandLogo.tsx            # SVG logo (coral / dark / white variants)
│   ├── BrandHeader.tsx          # Logo + tagline header block
│   ├── HeroPanel.tsx            # Sliding carousel banner (landing page)
│   ├── LandingPage.tsx          # Full landing page layout component
│   ├── LoginForm.tsx            # Email/password login form
│   ├── ParentSignUpForm.tsx     # Parent registration form
│   ├── ChildSignUpForm.tsx      # Child registration form
│   ├── SetPinForm.tsx           # PIN / password setter
│   ├── ProfileSelectClient.tsx  # Client-side profile / child selection
│   ├── QuestionRenderer.tsx     # Rich-text question parser
│   ├── LeaderboardResultCard.tsx # Leaderboard rank card
│   ├── AvatarCircle.tsx         # Avatar image with coloured ring
│   ├── AvatarPicker.tsx         # 10-avatar selection modal
│   ├── AvatarMenu.tsx           # Dropdown anchored to avatar
│   ├── GemBadge.tsx             # Gem icon + count
│   ├── PinInput.tsx             # 4-digit PIN input boxes
│   ├── BackButton.tsx           # Chevron-left router.back() button
│   └── Spinner.tsx              # Centered loading spinner
│
├── context/
│   └── AuthContext.tsx          # Global auth state & useAuth hook
│
├── hooks/
│   └── useLeaderboard.ts        # Data-fetching hooks for leaderboard boards
│
├── lib/
│   ├── api.ts                   # Axios instance, auth interceptors, WP helpers
│   ├── leaderboard.ts           # Leaderboard constants, types & helpers
│   ├── nickname.ts              # Client-side Caribbean nickname generator
│   └── utils.ts                 # Shared helper functions (format, score, avatar)
│
├── types/
│   └── noey.ts                  # All TypeScript interfaces & constants for the API
│
├── public/avatars/
│   ├── children/                # 10 child avatar images (avatar-1 to avatar-10)
│   └── parents/                 # 10 parent avatar images (avatar-1 to avatar-10)
├── public/icons/                # UI icon assets
├── public/illustrations/        # Full-page background illustrations
├── public/logos/                # Logo variants (color, light, dark)
├── public/logo.svg              # Primary logo SVG
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
/child/results       (score, topic breakdown, AI coaching note, leaderboard update)
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
- PIN state is fetched from `GET /auth/pin/status` (returns `PinStatus` with lock status and time remaining).

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

| Subject | Value |
|---|---|
| Mathematics | `Mathematics` |
| Language Arts | `Language Arts` |
| Social Studies | `Social Studies` |
| Science | `Science` |

### Standards & Terms

- **Active Standards**: `std_4` (Standard 4), `std_5` (Standard 5)
- **Terms**: `term_1`, `term_2`, `term_3`

### Difficulty Levels

| Difficulty | Questions | Min / Question | Gem Cost |
|---|---|---|---|
| Easy | 20 | 5 min | 1 gem |
| Medium | 40 | 4 min | 2 gems |
| Hard | 60 | 3 min | 3 gems |

### Question Structure

Each `Question` object includes:
- `question_id` — unique identifier string
- `question` — the question text (may include rich-text markup, see `QuestionRenderer`)
- `options` — `Record<string, string>` map of option keys to answer strings
- `correct_answer` — the key of the correct option (only present after submission)
- `tip` / `explanation` — coaching content shown post-exam
- `meta.topic` — curriculum topic label
- `meta.subtopic` — more granular topic
- `meta.cognitive_level` — one of: `recall`, `application`, `analysis`, `knowledge`, `comprehension`

### Question Rich-Text Markup

The `QuestionRenderer` component interprets embedded tags in question text:

| Tag | Renders As |
|---|---|
| `[emphasize]text[/emphasize]` | Bold text |
| `[hide]word[/hide]` | Underlined blank (fill-in-the-blank style) |
| `[blank]` | Answer input line |

### Exam Lifecycle

1. **Start** — `POST /exams/start` deducts gems and returns an `ExamSession` with all questions.
2. **Checkpoint** — `POST /exams/{id}/checkpoint` saves current progress (question index, answers map, elapsed time) to allow resuming.
3. **Resume** — On `/prestart`, the app checks `GET /exams/active`; if a session exists the user can continue from where they left off.
4. **Submit** — `POST /exams/{id}/submit` sends all answers and returns a `SubmitResult` with score and topic breakdown. The response also includes a `LeaderboardUpdate` with the child's new rank.
5. **Cancel** — `DELETE /exams/{id}` abandons the session (gems are not refunded).

---

## 7. Gem / Token Economy

- **Gems** (also called tokens) are the in-app currency used to start exams.
- Each difficulty tier costs 1–3 gems per exam attempt.
- Parents can top up gem balances via the `/parent/tokens` page.
- Gems are tracked per user and visible in the `GemBadge` component.
- Transaction history is recorded as `LedgerEntry` objects.

### Ledger Entry Types

| Type | Description |
|---|---|
| `exam_deduct` | Gems spent starting an exam |
| `registration` | Bonus gems awarded on signup |
| `monthly_refresh` | Monthly free gem allocation |
| `purchase` | Parent-purchased top-up |
| `admin_credit` | Manually credited by admin |
| `admin_deduct` | Manually deducted by admin |
| `refund` | Refund for a cancelled/failed exam |

---

## 8. Analytics & AI Insights

### Parent Analytics (`/parent/analytics`)

- Displays stats for a selected child: total exams taken, average score, best subject, weakest topic.
- Lists full exam history with score, date, subject, difficulty.
- Surfaces the current week's **Weekly Digest** (AI-generated summary).

### Weekly Digest

- Fetched from `GET /insights/weekly/{iso_week}` using the current ISO week string (e.g. `2026-W13`).
- Returns a `WeeklyDigest` with an `insight_text` narrative summary of the child's performance.
- Displayed as a card on the analytics page.

### Exam Insight (AI Coaching Note)

- Triggered via `POST /insights/exam/{id}` after an exam is completed.
- Returns an `InsightResult` with `insight_text` tailored to the child's performance.
- Displayed on the `/child/results` page.

### Performance Labels

| Score Range | Label | Color |
|---|---|---|
| ≥ 75% | Strong | `#22C55E` (green) |
| ≥ 50% | Good | `#F59E0B` (amber) |
| < 50% | Needs Work | `#E8396A` (red/pink) |

---

## 9. Leaderboard System

The leaderboard ranks students by subject on a **daily** basis using a points system (not raw percentage).

### Subjects (Leaderboard Slugs)

| Slug | Display Name |
|---|---|
| `math` | Mathematics |
| `english` | Language Arts |
| `science` | Science |
| `social_studies` | Social Studies |

### How Points Work

- Points are earned per exam submission.
- `total_points_today` accumulates across all exams taken on the same day for a given subject.
- `last_score_pct` reflects the percentage from the most recent exam.
- Leaderboards reset daily.

### Rank Medals

| Rank | Medal |
|---|---|
| 1 | 🥇 Gold (`#FFD700`) |
| 2 | 🥈 Silver (`#C0C0C0`) |
| 3 | 🥉 Bronze (`#CD7F32`) |

### Leaderboard Hooks (`hooks/useLeaderboard.ts`)

| Hook | Description |
|---|---|
| `useMyBoards(enabled)` | Fetch the current user's personal rankings across all subjects (auto-refreshes every 60 s) |
| `useBoard(standard, term, subject)` | Fetch the full leaderboard for a specific subject board (auto-refreshes every 30 s) |

### Leaderboard API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/leaderboard/me` | Current user's personal board summary |
| `GET` | `/leaderboard/{standard}/{term}/{subject}` | Full ranked board for a subject |

---

## 10. Avatar System

- Each user (parent or child) selects from **10 avatar options**.
- Child avatars are stored at `/public/avatars/children/avatar-{1–10}.png`.
- Parent avatars are stored at `/public/avatars/parents/avatar-{1–10}.png`.
- Each avatar index maps to one of 10 ring colours defined in `AVATAR_COLORS[]` in `lib/utils.ts`.
- If no avatar is selected, `AvatarCircle` falls back to displaying the user's initials.
- The parent's `avatar_index` is stored on the `NoeyUser` object (returned from `GET /auth/me`); it is no longer persisted separately in `localStorage`.

---

## 11. API Reference

**Base URL**: `NEXT_PUBLIC_API_BASE` (e.g. `http://noeyai.local/wp-json/noey/v1`)

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Login with username & password |
| `POST` | `/auth/register` | Register a new parent account |
| `GET` | `/auth/me` | Get current user data |
| `POST` | `/auth/pin/verify` | Verify parent PIN |
| `GET` | `/auth/pin/status` | Get PIN lock status (`PinStatus`) |

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
| `POST` | `/exams/{id}/submit` | Submit answers & get result + leaderboard update |
| `DELETE` | `/exams/{id}` | Cancel an exam session |

### Results

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/results` | List exam results (supports `child_id`, `per_page`) |
| `GET` | `/results/stats` | Aggregated performance stats (`ResultStats`) |

### Insights

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/insights/exam/{id}` | Generate AI coaching note for an exam |
| `GET` | `/insights/weekly/{iso_week}` | Get weekly AI digest |

### Tokens

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tokens/balance` | Get current & lifetime gem balance |

### Leaderboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/leaderboard/me` | Current user's personal board rankings |
| `GET` | `/leaderboard/{standard}/{term}/{subject}` | Full ranked leaderboard for a subject |

### WordPress CMS (via `NEXT_PUBLIC_WP_API`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/noeyai/v1/messages` | Slider / carousel messages (ISR cached 1 h) |
| `GET` | `/noeyai/v1/site` | Site settings — logo, tagline, links (ISR cached 1 h) |

### Error Codes

| Code | Meaning |
|---|---|
| `noey_invalid_credentials` | Wrong username or password |
| `noey_pin_locked` | Parent PIN is locked due to failed attempts |
| `noey_insufficient_tokens` | Not enough gems to start the exam |
| `noey_no_exam_available` | No questions available for the selected filters |

---

## 12. Data Models

Key TypeScript interfaces and constants defined in [types/noey.ts](types/noey.ts):

```typescript
// Core users
NoeyUser          // user_id, role, display_name, first_name, last_name,
                  // email, avatar_index, active_child_id, token_balance, children[]
ChildProfile      // child_id, display_name, nickname, standard, term,
                  // age, avatar_index, created_at

// Billing
TokenBalance      // balance, tokens_lifetime
LedgerEntry       // ledger_id, user_id, amount, balance_after, type,
                  // reference_id, note, created_at

// Exam catalogue & sessions
ExamCatalogueEntry  // standard, term, subject, difficulty, pool_count
ExamSession         // session_id, external_session_id, package (ExamPackage), balance_after
ExamPackage         // package_id, meta (standard, term, subject, difficulty, topics_covered[]),
                    // questions[]
Question            // question_id, question, options (Record<string,string>),
                    // correct_answer?, tip?, explanation?, meta{topic,subtopic,cognitive_level}
ActiveSession       // session_id, external_session_id, subject, standard, term, difficulty,
                    // started_at, checkpoint{session_id,state,saved_at}|null
CheckpointState     // current_question, answers (Record<string,string>), elapsed_seconds?

// Answer submission
SubmitAnswer        // question_id, selected_answer, correct_answer, is_correct,
                    // topic, subtopic?, cognitive_level, time_taken_seconds?

// Results
SubmitResult        // session_id, score, total, percentage, time_taken_seconds, topic_breakdown[]
SessionResult       // session_id, subject, standard, term, difficulty, score, total, percentage,
                    // time_taken_seconds, state, started_at, completed_at
ResultDetail        // session (SessionResult), answers[], topic_breakdown[]
ResultStats         // total_exams, average_score, best_subject, weakest_topic, topic_breakdown[]
TopicBreakdown      // topic, correct, total, percentage

// AI
InsightResult       // session_id, insight_text, model_used, generated_at, from_cache
WeeklyDigest        // child_id, iso_week, insight_text, generated_at

// Security
PinStatus           // pin_set, is_locked, locked_until, seconds_remaining
NoeyError           // code, message, data?

// Configuration constants (exported from types/noey.ts)
DifficultyConfig    // label, questions, minutesPerQuestion, gemCost, description
DIFFICULTY_CONFIG   // Record<"easy"|"medium"|"hard", DifficultyConfig>
SUBJECTS            // ["Mathematics","Language Arts","Social Studies","Science"]
STANDARDS           // [{value:"std_4",label:"Standard 4"},{value:"std_5",label:"Standard 5"}]
TERMS               // [{value:"term_1",...},{value:"term_2",...},{value:"term_3",...}]
```

Leaderboard types are defined in [lib/leaderboard.ts](lib/leaderboard.ts):

```typescript
LeaderboardEntry    // rank, nickname, total_points, last_score_pct, is_current_user
LeaderboardBoard    // board_key, standard, term, subject, date,
                    // total_participants, my_position, entries[]
MyBoardEntry        // board_key, subject, difficulty?, best_score_pct, best_points, rank
MyBoardsSummary     // user_id, standard, term, date, boards[]
LeaderboardUpdate   // points_earned, total_points_today, board_key, new_rank, previous_rank
SubjectSlug         // "math" | "english" | "science" | "social_studies"
```

---

## 13. Components

### `NavBar`

Top navigation bar rendered on most app pages. Displays the app logo, page title, gem balance (`GemBadge`), and a hamburger menu with profile/logout options.

### `AppLeftPanel`

Desktop-only left sidebar rendered on auth/landing pages. Contains a brand illustration and descriptive text. Hidden on mobile.

### `BrandLogo`

SVG logo component with three variants: `coral` (default), `dark`, and `white`. Used in headers and the landing page.

### `BrandHeader`

Composed block of `BrandLogo` + tagline text. Used at the top of auth pages.

### `HeroPanel`

Sliding carousel that displays rotating messages fetched from the WordPress CMS. Used on the landing page.

### `LandingPage`

Full landing page layout that combines `HeroPanel`, `BrandHeader`, and call-to-action buttons.

### `LoginForm`

Username/password login form with error handling and a link to the forgot-password flow.

### `ParentSignUpForm`

Multi-field registration form for parent accounts (first name, last name, email, username, password).

### `ChildSignUpForm`

Registration form for child profiles. Generates a nickname client-side using `lib/nickname.ts`.

### `SetPinForm`

4-digit PIN creation and confirmation form. Used during registration and in the parent settings.

### `ProfileSelectClient`

Client-side component for selecting which child profile to switch to after login.

### `QuestionRenderer`

Parses and renders question text that may contain custom markup tags (`[emphasize]`, `[hide]`, `[blank]`). Ensures questions with blanks and bold terms render correctly in the exam UI.

### `LeaderboardResultCard`

Displays a single leaderboard entry: rank number, medal (top 3), nickname, total points, and last score percentage.

### `AvatarCircle`

Displays a user's avatar image with a coloured ring. Falls back to the user's initials if no avatar is set. Accepts `avatarIndex`, `name`, `role`, and optional `size` props.

### `AvatarPicker`

A modal overlay presenting all 10 avatar options in a grid. Used during registration and in settings.

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

## 14. Utility Libraries

### `lib/utils.ts`

Shared helper functions.

#### Formatting

| Function | Input | Output |
|---|---|---|
| `formatStandard(std)` | `"std_4"` | `"Standard 4"` |
| `formatTerm(term)` | `"term_1"` | `"Term 1"` |
| `formatDifficulty(d)` | `"medium"` | `"Medium"` |
| `formatDuration(seconds)` | `245` | `"4:05"` |
| `formatDate(iso)` | `"2026-03-25T..."` | `"25 Mar 2026"` (locale: `en-TT`) |

#### Scoring

| Function | Input | Output |
|---|---|---|
| `getScoreLabel(pct)` | `82` | `"Strong"` |
| `getScoreColor(pct)` | `45` | `"#E8396A"` |

#### Avatars

| Function | Description |
|---|---|
| `getChildAvatarSrc(index)` | Returns `/avatars/children/avatar-{n}.png` |
| `getParentAvatarSrc(index)` | Returns `/avatars/parents/avatar-{n}.png` |
| `getAvatarSrc(index, role)` | Role-aware wrapper for the above |
| `getAvatarColor(index)` | Returns the ring hex colour for a given avatar index |
| `AVATAR_COLORS[]` | Array of 10 hex colours for avatar rings |

#### Time

| Function | Output |
|---|---|
| `getCurrentIsoWeek()` | `"2026-W13"` |

---

### `lib/leaderboard.ts`

Constants and helpers for the leaderboard feature.

| Export | Description |
|---|---|
| `LEADERBOARD_SUBJECTS` | Array of `{slug, label, emoji, color}` for all 4 subjects |
| `SUBJECT_SLUG_TO_DISPLAY` | Maps slug → display name (e.g. `"math"` → `"Mathematics"`) |
| `SUBJECT_DISPLAY_TO_SLUG` | Maps display name → slug |
| `SubjectSlug` | Union type: `"math" \| "english" \| "science" \| "social_studies"` |
| `getMedalColor(rank)` | Gold / silver / bronze hex for ranks 1–3 |
| `getMedalEmoji(rank)` | 🥇 / 🥈 / 🥉 emoji for ranks 1–3, `"#N"` otherwise |
| `getSubjectColor(slug)` | Returns the subject's brand colour hex |

Leaderboard type interfaces (`LeaderboardEntry`, `LeaderboardBoard`, `LeaderboardUpdate`, `MyBoardEntry`, `MyBoardsSummary`) are also defined here.

---

### `lib/nickname.ts`

Client-side Caribbean-themed nickname generator. Produces instant nicknames with zero API calls.

| Export | Description |
|---|---|
| `generateNickname()` | Random `AdjectiveNoun` string from 100 × 100 word lists (e.g. `"CoralBolt"`) |
| `generateUsername(firstName)` | `FirstName` + 3-digit random number (e.g. `"Nick847"`) |

---

### `lib/api.ts`

Axios instance pre-configured with auth interceptors, plus WordPress CMS fetch helpers.

| Export | Description |
|---|---|
| `default` (axios instance) | All Noey API calls; auto-attaches Bearer token; redirects to `/login` on 401 |
| `getApiError(err)` | Extracts a typed `NoeyError` from an Axios error |
| `getSliderMessages()` | Server-side fetch of WordPress carousel messages (ISR 1 h) |
| `getSiteSettings()` | Server-side fetch of WordPress site settings (ISR 1 h) |

---

## 15. Configuration & Environment

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Base URL for all Noey API requests (e.g. `http://noeyai.local/wp-json/noey/v1`) |
| `NEXT_PUBLIC_WP_API` | WordPress REST base URL for CMS content (e.g. `http://noeyai.local/wp-json`) |

### `next.config.ts`

- `devIndicators: false` — hides the Next.js development indicator overlay
- `remotePatterns` — permits images served from `http://noeyai.local`

### `tsconfig.json`

- Target: `ES2017`, Module: `ESNext`
- Path alias: `@/*` maps to the project root
- Strict mode enabled

### `tailwind.config.js`

Extends Tailwind with the HeroUI plugin and a custom colour palette:

#### Custom Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `noey-primary` | `#F9695A` | Primary coral action colour & gem accent |
| `noey-dark` | `#3D2B3D` | Dark brand colour |
| `noey-bg` | `#FFFDFA` | Page background (warm cream) |
| `noey-neutral` | `#F8EFE2` | Neutral surfaces / card backgrounds |
| `noey-text` | `#3D2B3D` | Primary text (same as `noey-dark`) |
| `noey-text-muted` | `#9B8FA0` | Secondary / muted text |
| `noey-gem` | `#F9695A` | Gem icon colour (alias for `noey-primary`) |
| `noey-gem-light` | `#FFF0F4` | Gem light tint for backgrounds |
| `noey-surface` | `#F8EFE2` | Alias — legacy surface colour |
| `noey-surface-dark` | `#EDE8E0` | Alias — legacy darker surface |
| `noey-card-dark` | `#3D2B3D` | Alias — legacy dark card |

#### HeroUI Theme Overrides

| Token | Value |
|---|---|
| `background` | `#ECEDF2` |
| `foreground` | `#111114` |
| `primary` | `#2B2B33` (foreground: white) |
| `secondary` | `#E2E3E9` (foreground: `#111114`) |
| `danger` | `#E8396A` (foreground: white) |

#### Custom Fonts

| Role | Family |
|---|---|
| `font-sans` | Poppins |
| `font-display` | Playfair Display |

---

## 16. Design System

### Layout

All app pages use a `.page-container` class that centres content with a `max-width` of **430px**, making the app feel native on mobile while remaining usable on desktop. Pages are flex-column with vertical padding and safe-area insets for mobile notch handling.

Auth and marketing pages use a two-column layout on desktop: `AppLeftPanel` on the left, form content on the right.

### Typography

- Body text: **Poppins** (`font-sans`)
- Display / hero headings: **Playfair Display** (`font-display`), used italic for emphasis
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

*Last updated: April 2026*
