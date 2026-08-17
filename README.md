## Driver database (Monday.com)

The dashboard reads drivers from the Monday boards listed in
`lib/services/monday/config.ts` and merges every record of the same person into one profile.

1. Copy `.env` to `.env.local` and paste a Monday personal API token
   (Monday → avatar → Developers → My access tokens). The token must have read access to
   all boards in the list.
2. Restart `npm run dev`.

How it works:

- `lib/services/monday/fetchBoards.ts` pulls every item + column of every board.
- `lib/services/monday/normalize.ts` detects the name / phone / email / status columns and
  infers the outcome of each record (hired, rejected, terminated, in progress).
- `lib/services/monday/profiles.ts` merges records that share a phone, an email or a full
  name into one driver profile with its application history.
- `lib/services/monday/cache.ts` keeps a snapshot in memory for 15 minutes
  (`MONDAY_CACHE_TTL_MS`); the refresh button re-pulls the boards.

API routes: `GET /api/drivers/search?name=&phone=&email=` and `GET /api/drivers/overview`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Your Project

This project is organized using the following directory structure:

```
project/
│
├── app/                             # App directory for Next.js all all your pages (auto-routing) by page.tsx
│   │
│   ├── dashboard/              # Dashboard-related pages
│   │   ├── layout.tsx             # Dashboard layout component
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── user                # User page
│   │   │   └── page.tsx            # User Page
│   │   └── ...                      # Other static or dynamic pages
│   │
│   ├── login/                  # Login page
│   │   └──page.tsx           
│   └── ...  
│
├── components/                  # Reusable components across your project
│   ├── ui/                      # UI components like buttons, modals, etc.
│   ├── forms/                   # Form components, maybe with Formik or React Hook Form
│   └── ...                      # Other component categorizations
│ 
│ 
├── lib/                             # Lib
│   ├── context                      # Custom React context
│   ├── hooks/                       # Custom React hooks
│   ├── services/                    # services React hooks
│   └── utils/                       # Utility functions and helpers
│
│── styles/                      # Global styles, variables, theme configs
│── models/                      # Global styles, variables, theme configs
│
├── public/                          # Static files like images, fonts, etc.
│
├── styles/                          # Global styles (if any outside the app directory)
│
├── types/                           # TypeScript types, interfaces
│
├── .env.local                       # Environment variables
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
└── package.json                     # Project metadata and dependencies
```
