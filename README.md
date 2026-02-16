# GreenCover Plant Identifier

Identify any plant from a photo. Get care instructions and diagnose plant health issues.

Built for the [GreenCover Initiative](https://www.greencoverinitiative.com).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router, TypeScript) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Database | [Supabase](https://supabase.com) (planned) |
| Payments | [Stripe](https://stripe.com) (planned) |
| Hosting | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with Header + Footer
│   ├── page.tsx                # Home page
│   ├── globals.css             # Tailwind imports
│   ├── identify/page.tsx       # Plant identification page
│   ├── health/page.tsx         # Plant health diagnosis page
│   ├── history/page.tsx        # Identification history (login required)
│   ├── pricing/page.tsx        # Free vs Pro pricing
│   ├── account/page.tsx        # Account / sign-in placeholder
│   └── api/
│       ├── identify/route.ts   # POST — mock plant identification
│       └── health/route.ts     # POST — mock health diagnosis
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Button.tsx              # Reusable button / link
│   ├── Card.tsx                # Content card wrapper
│   └── ImageUpload.tsx         # Drag-and-drop image uploader
├── data/
│   └── gci_pages.json          # GreenCover Initiative plant page links
├── docs/
│   ├── PRD.md                  # Product requirements document
│   └── TODO.md                 # Build plan
├── lib/
│   └── utils.ts                # Helper utilities
├── types/
│   └── index.ts                # TypeScript type definitions
└── supabase/                   # Supabase migrations (planned)
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — overview and navigation |
| `/identify` | Upload 1–5 images to identify a plant |
| `/health` | Upload images to diagnose plant health issues |
| `/history` | View past identifications (login required) |
| `/pricing` | Free vs Pro plan comparison |
| `/account` | Sign-in placeholder |

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/identify` | Returns mock plant matches (3 results with confidence) |
| POST | `/api/health` | Returns mock health diagnosis (2 conditions) |

---

## Documentation

- [Product Requirements (PRD)](./docs/PRD.md)
- [Build Plan (TODO)](./docs/TODO.md)

---

## License

Proprietary. Copyright GreenCover Initiative.
