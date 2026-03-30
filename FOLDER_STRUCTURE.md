# NoeyAI Web — Folder Structure

```
noeyai-web/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata, providers)
│   ├── page.tsx                  # Entry redirect (→ /login or /profile-select)
│   ├── providers.tsx             # Client-side context providers wrapper
│   ├── globals.css               # Global styles / Tailwind base
│   │
│   ├── login/
│   │   └── page.tsx              # Login screen (username + password)
│   │
│   ├── register/
│   │   ├── page.tsx              # Register entry / role select
│   │   ├── parent/page.tsx       # Parent registration form
│   │   ├── child/page.tsx        # Child registration form
│   │   └── pin/page.tsx          # Set child PIN during registration
│   │
│   ├── profile-select/
│   │   └── page.tsx              # Switch between parent / child profiles
│   │
│   ├── settings/
│   │   └── pin/
│   │       └── create/page.tsx   # Create / reset child PIN
│   │
│   ├── news/
│   │   ├── page.tsx              # News feed list
│   │   └── [id]/page.tsx         # Single news article
│   │
│   ├── child/                    # Child zone (requires active_child_id)
│   │   ├── home/page.tsx         # Child home dashboard
│   │   ├── subjects/page.tsx     # Subject picker
│   │   ├── difficulty/page.tsx   # Difficulty picker
│   │   ├── content-settings/page.tsx  # Term / standard selector
│   │   ├── prestart/page.tsx     # Exam preview (cost, rules)
│   │   ├── exam/page.tsx         # Live exam (questions, timer, submit)
│   │   ├── results/page.tsx      # Post-exam results + leaderboard card
│   │   ├── progress/page.tsx     # Child progress over time
│   │   ├── settings/page.tsx     # Child settings (avatar, nickname, PIN)
│   │   └── leaderboard/
│   │       ├── page.tsx          # Leaderboard subject list
│   │       └── [subject]/page.tsx  # Subject leaderboard board
│   │
│   └── parent/                   # Parent zone
│       ├── home/page.tsx         # Parent home dashboard
│       ├── analytics/page.tsx    # Cross-child analytics
│       ├── tokens/page.tsx       # Gem / token top-up
│       ├── settings/page.tsx     # Parent account settings
│       ├── exam-detail/page.tsx  # Drill into a specific exam result
│       └── children/
│           ├── page.tsx          # Children list
│           ├── add/page.tsx      # Add new child
│           └── [id]/page.tsx     # Individual child detail
│
├── components/
│   └── ui/
│       ├── NavBar.tsx            # Top navigation bar (child + parent zones)
│       ├── AvatarCircle.tsx      # Round avatar image
│       ├── AvatarPicker.tsx      # Avatar selection grid
│       ├── AvatarMenu.tsx        # Avatar dropdown menu
│       ├── PinInput.tsx          # 4-digit PIN input
│       ├── GemBadge.tsx          # Gem count badge
│       ├── Spinner.tsx           # Loading spinner
│       ├── BackButton.tsx        # Generic back navigation button
│       └── LeaderboardResultCard.tsx  # Post-exam leaderboard update card
│
├── context/
│   └── AuthContext.tsx           # Global auth state (user, token, refreshUser)
│
├── hooks/
│   └── useLeaderboard.ts         # Fetch leaderboard board by subject
│
├── lib/
│   ├── api.ts                    # Axios instance (base URL, auth headers)
│   ├── leaderboard.ts            # Leaderboard types, subject maps, helpers
│   ├── nickname.ts               # Nickname generation utilities
│   └── utils.ts                  # Shared formatters (duration, score, term, standard)
│
├── types/
│   └── noey.ts                   # Shared TypeScript types (User, ExamSession, Question, etc.)
│
├── public/
│   └── avatars/
│       ├── children/             # avatar-1.png … avatar-9.png
│       └── parents/              # avatar-1.png … avatar-9.png
│
├── next.config.ts                # Next.js config
├── tailwind.config.js            # Tailwind config (custom tokens, colours)
├── tsconfig.json                 # TypeScript config
├── postcss.config.mjs            # PostCSS config
└── package.json                  # Dependencies
```

## Zone Overview

| Zone | Path prefix | Auth guard |
|---|---|---|
| Public | `/login`, `/register/*` | None |
| Shared | `/profile-select`, `/news/*`, `/settings/*` | JWT required |
| Child | `/child/*` | JWT + active child profile |
| Parent | `/parent/*` | JWT + parent role |
