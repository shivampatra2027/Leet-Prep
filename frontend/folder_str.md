├─ app/                    
│  ├─ layout.tsx
│  ├─ page.tsx             
│  ├─ company/
│  │   └─ [company]/page.tsx  # /company/Amazon -> list
│  └─ problem/
│      └─ [id]/page.tsx     # problem detail
├─ components/
│  ├─ ui/
│  │   ├─ Button.tsx
│  │   ├─ Card.tsx
│  │   └─ Tag.tsx
│  ├─ ProblemList.tsx
│  ├─ ProblemItem.tsx
│  └─ Filters/              # filter components (CompanyFilter, TopicFilter)
├─ hooks/
│  ├─ useProblems.ts       # React Query hooks for problems
│  ├─ useLocalProgress.ts  # localStorage progress management
│  └─ useDebounce.ts
├─ lib/
│  ├─ api.ts               # axios instance + typed endpoints
│  └─ utils.ts
├─ styles/
│  └─ globals.css          # Tailwind entry
├─ contexts/
│  └─ UIContext.tsx
├─ pages/api/              # optional API routes (if using Next API routes)
├─ public/
├─ tests/
├─ next.config.js
├─ tailwind.config.js
├─ tsconfig.json
└─ package.json