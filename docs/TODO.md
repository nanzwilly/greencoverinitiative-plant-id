# GreenCover Plant Identifier — Build Plan

A step-by-step plan for building the MVP. Each phase builds on the previous one.

---

## Phase 1: Project Setup

- [ ] Initialize Next.js project with TypeScript and App Router.
- [ ] Configure Tailwind CSS.
- [ ] Set up ESLint and Prettier.
- [ ] Create Supabase project (database, auth, storage).
- [ ] Add environment variables (`.env.local`) for Supabase URL, anon key, service role key.
- [ ] Set up Vercel project and link to GitHub repo.
- [ ] Configure CI: lint and type-check on every push.

## Phase 2: Database & Auth

- [ ] Write Supabase SQL migrations for all tables: Users, PlantCatalog, PlantHistory, Nurseries, NurseryPlants, Communities, DailyUsage, Plans.
- [ ] Seed the Plans table with `free` and `pro` rows.
- [ ] Configure Supabase Auth (email/password provider).
- [ ] Build sign-up page (`/signup`).
- [ ] Build log-in page (`/login`).
- [ ] Implement auth context/provider in the app (session management).
- [ ] Add protected route middleware for authenticated pages.

## Phase 3: Plant Identification (Core Feature)

- [ ] Choose and integrate a plant identification API (e.g., Plant.id, PlantNet).
- [ ] Set up Supabase Storage bucket for user-uploaded images.
- [ ] Build the upload UI component (drag-and-drop + file picker + camera capture).
- [ ] Create `/api/identify` route handler:
  - Accept image upload.
  - Check daily usage limit.
  - Call external plant ID API.
  - Match result to PlantCatalog if possible.
  - Save to PlantHistory.
  - Increment DailyUsage.
  - Return result.
- [ ] Build the result page showing plant name, confidence, care info, and image.
- [ ] Implement daily usage tracking and limit enforcement.
- [ ] Build the "limit reached" upgrade prompt UI.

## Phase 4: Plant Catalog

- [ ] Seed PlantCatalog with initial dataset (common plants, care instructions).
- [ ] Build `/plants` listing page with search and filters (name, family, tags).
- [ ] Build `/plants/[id]` detail page with care guide and images.
- [ ] Add "Find Nurseries" link from plant detail to nursery search.

## Phase 5: Nursery Directory

- [ ] Seed Nurseries table with sample data.
- [ ] Build `/nurseries` listing page with search and location filter.
- [ ] Build `/nurseries/[id]` detail page showing contact info and plant inventory.
- [ ] Implement `/api/nurseries/nearby` endpoint using PostGIS or Haversine formula.
- [ ] Add geolocation prompt in the UI to auto-detect user location.
- [ ] Show nursery cards on plant result pages.

## Phase 6: Identification History

- [ ] Build `/history` page listing past identifications for the logged-in user.
- [ ] Create `/api/identify/history` endpoint (paginated).
- [ ] Create `/api/identify/:id` endpoint for single result detail.
- [ ] Add ability to click a history item and view its full result.

## Phase 7: Payments (Stripe)

- [ ] Create Stripe account and configure products/prices for the Pro plan.
- [ ] Install Stripe SDK.
- [ ] Build `/api/billing/checkout` to create a Stripe Checkout session.
- [ ] Build `/api/billing/webhook` to handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- [ ] Update user's `plan_id` on successful payment.
- [ ] Build pricing/upgrade page (`/pricing`).
- [ ] Add subscription status display in user profile/settings.

## Phase 8: GreenCover SSO Integration

- [ ] Coordinate with greencoverinitiative.com team to set up OAuth 2.0 client credentials.
- [ ] Implement `/api/auth/sso/greencover` (redirect to GreenCover authorize URL).
- [ ] Implement `/api/auth/sso/greencover/callback` (exchange code for token, create/link user).
- [ ] Add "Sign in with GreenCover" button on login page.

## Phase 9: UI Polish & Branding

- [ ] Apply GreenCover brand colors, typography, and logo.
- [ ] Build shared layout: header (nav, logo, auth state), footer (links, branding).
- [ ] Add loading states and skeleton screens.
- [ ] Add error boundaries and user-friendly error pages (404, 500).
- [ ] Ensure responsive design works on mobile, tablet, and desktop.
- [ ] Run Lighthouse audit; fix accessibility and performance issues.

## Phase 10: Testing & QA

- [ ] Write unit tests for API route handlers (identify, usage, billing).
- [ ] Write integration tests for auth flows (email + SSO).
- [ ] Write E2E tests for core journeys (identify plant, view history, upgrade).
- [ ] Test Stripe webhook handling with Stripe CLI.
- [ ] Test daily limit enforcement (free tier edge cases).
- [ ] Cross-browser testing.

## Phase 11: Deployment & Launch

- [ ] Set production environment variables in Vercel.
- [ ] Configure custom domain (e.g., plantid.greencoverinitiative.com).
- [ ] Set up Supabase production project with RLS policies.
- [ ] Enable Stripe live mode.
- [ ] Run final smoke tests on production.
- [ ] Announce launch on greencoverinitiative.com.

---

## Future Phases (Post-MVP)

- [ ] Community feed (share identifications, like/comment).
- [ ] Gamification (badges, streaks, leaderboards).
- [ ] Nursery self-service dashboard.
- [ ] PWA / offline mode.
- [ ] Multi-language support.
- [ ] AR plant identification overlay.
- [ ] Public developer API.
