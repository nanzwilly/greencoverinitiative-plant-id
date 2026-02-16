# GreenCover Plant Identifier — Product Requirements Document

## 1. Product Overview

GreenCover Plant Identifier is a web application that allows users to identify plants by uploading a photo. It returns the plant name, care instructions, and nearby nurseries where the plant can be purchased. The app integrates with [www.greencoverinitiative.com](https://www.greencoverinitiative.com) as its parent brand and serves as a tool to promote urban greening and biodiversity awareness.

### Goals

- Let anyone identify a plant in seconds from a photo.
- Provide actionable care information and nursery availability.
- Drive traffic and engagement to the GreenCover Initiative ecosystem.
- Monetize through a freemium daily-usage model.

---

## 2. User Personas

| Persona | Description | Primary Need |
|---|---|---|
| **Casual Gardener** | Home gardener who occasionally encounters unknown plants. | Quick identification and basic care tips. |
| **Plant Enthusiast** | Frequent user who identifies multiple plants daily. | Unlimited identifications, detailed plant data, history. |
| **Nursery Owner** | Local business wanting visibility to plant buyers. | Listing their nursery and inventory in the app. |
| **Educator / Student** | Uses the tool for botany coursework or field trips. | Bulk identification, exportable history. |
| **GreenCover Community Member** | Already part of the greencoverinitiative.com community. | Seamless SSO, community sharing features. |

---

## 3. Core User Journeys

### 3.1 Identify a Plant (unauthenticated)

1. User lands on the homepage.
2. Uploads or captures a photo.
3. App returns the top identification result with confidence score.
4. User sees plant name, common names, care summary, and nearby nurseries.
5. After 10 identifications in a day, the app prompts sign-up / upgrade.

### 3.2 Identify a Plant (authenticated, free tier)

1. User logs in (email/password or GreenCover SSO).
2. Uploads a photo.
3. Receives identification result; result is saved to their history.
4. Daily counter increments. At 10/day, prompted to upgrade.

### 3.3 Identify a Plant (authenticated, paid tier)

1. User logs in.
2. Uploads a photo.
3. Receives identification — no daily limit.
4. Result saved to history.

### 3.4 Browse Plant Catalog

1. User navigates to the catalog.
2. Searches or filters by name, family, region, care difficulty.
3. Views a plant detail page with full care guide and nursery links.

### 3.5 Find Nearby Nurseries

1. From a plant result or catalog page, user clicks "Find Nurseries."
2. App uses geolocation (or manual location entry) to show nearby nurseries.
3. Nursery cards show name, distance, contact, and available plants.

### 3.6 Community Sharing

1. Authenticated user shares an identification to the GreenCover community feed.
2. Other community members can like, comment, or save the post.

---

## 4. Features

### 4.1 MVP (v1.0)

| # | Feature | Description |
|---|---|---|
| F1 | Photo Upload & Identification | Upload/capture a photo; receive plant ID via AI/ML API. |
| F2 | Plant Result Page | Display plant name, confidence score, taxonomy, and care summary. |
| F3 | Daily Usage Limiting | Free users get 10 IDs/day. Counter resets at midnight UTC. |
| F4 | Auth (Email + GreenCover SSO) | Sign up / log in with email or via greencoverinitiative.com OAuth. |
| F5 | Identification History | Authenticated users can view past identifications. |
| F6 | Plant Catalog | Browsable/searchable directory of plants with care info. |
| F7 | Nursery Directory | List of nurseries with location, contact, and plant availability. |
| F8 | Nearby Nurseries (Geo) | Show nurseries near the user based on browser geolocation. |
| F9 | Paid Plan (Stripe) | Upgrade to unlimited identifications via Stripe checkout. |
| F10 | Responsive Design | Mobile-first, works on all screen sizes. |

### 4.2 Future Scope (v2.0+)

| # | Feature | Description |
|---|---|---|
| F11 | Community Feed | Share identifications, like/comment (ties into greencoverinitiative.com). |
| F12 | Gamification | Badges, streaks, leaderboards for identifications. |
| F13 | Nursery Dashboard | Nurseries manage their own listings and inventory. |
| F14 | Offline Mode (PWA) | Cache recent results; queue identifications when offline. |
| F15 | Multi-language Support | i18n for Hindi, Spanish, French, etc. |
| F16 | AR Overlay | Point camera at plant for real-time identification overlay. |
| F17 | API Access for Developers | Public API with key-based auth and rate limiting. |

---

## 5. Data Model

### 5.1 Entity Relationship Overview

```
Users 1──N PlantHistory
Users 1──1 Plans
Users 1──N DailyUsage
PlantCatalog 1──N PlantHistory
Nurseries N──N PlantCatalog  (via NurseryPlants join)
Communities N──1 Users
Communities N──1 PlantHistory
```

### 5.2 Tables

#### Users

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| email | text | Unique, not null |
| name | text | |
| avatar_url | text | |
| provider | text | `email`, `greencover_sso` |
| provider_id | text | External ID from SSO provider |
| plan_id | uuid | FK → Plans.id |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | |

#### PlantHistory

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → Users.id (nullable for anonymous) |
| plant_id | uuid | FK → PlantCatalog.id (nullable if unknown plant) |
| image_url | text | Stored in Supabase Storage |
| result_json | jsonb | Raw API response from identification service |
| confidence | float | 0.0–1.0 |
| identified_at | timestamptz | Default now() |

#### PlantCatalog

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| common_name | text | |
| scientific_name | text | Unique |
| family | text | |
| genus | text | |
| description | text | |
| care_instructions | jsonb | `{ light, water, soil, temperature, humidity }` |
| image_urls | text[] | Array of reference images |
| tags | text[] | e.g., `['indoor', 'low-light', 'tropical']` |
| created_at | timestamptz | |

#### Nurseries

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Not null |
| address | text | |
| city | text | |
| state | text | |
| country | text | |
| latitude | float | |
| longitude | float | |
| phone | text | |
| email | text | |
| website | text | |
| logo_url | text | |
| created_at | timestamptz | |

#### NurseryPlants (join table)

| Column | Type | Notes |
|---|---|---|
| nursery_id | uuid | FK → Nurseries.id |
| plant_id | uuid | FK → PlantCatalog.id |
| in_stock | boolean | Default true |
| price | numeric | Optional |

#### Communities

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → Users.id |
| history_id | uuid | FK → PlantHistory.id |
| caption | text | |
| likes_count | int | Default 0 |
| created_at | timestamptz | |

#### DailyUsage

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → Users.id (nullable for anonymous; keyed by IP/fingerprint) |
| usage_date | date | Not null |
| count | int | Default 0, max enforced in app logic |
| UNIQUE | | (user_id, usage_date) |

#### Plans

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | `free`, `pro` |
| price_monthly | numeric | 0 for free |
| daily_limit | int | 10 for free, null (unlimited) for pro |
| stripe_price_id | text | Stripe Price object ID |
| created_at | timestamptz | |

---

## 6. API Endpoints

All endpoints are prefixed with `/api`.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register with email/password |
| POST | `/api/auth/login` | Log in with email/password |
| GET | `/api/auth/sso/greencover` | Initiate GreenCover SSO flow |
| GET | `/api/auth/sso/greencover/callback` | SSO callback handler |
| POST | `/api/auth/logout` | Log out / invalidate session |

### Identification

| Method | Path | Description |
|---|---|---|
| POST | `/api/identify` | Upload image, get plant identification. Checks daily limit. |
| GET | `/api/identify/history` | List user's past identifications (paginated). |
| GET | `/api/identify/:id` | Get a single identification result. |

### Plant Catalog

| Method | Path | Description |
|---|---|---|
| GET | `/api/plants` | List/search plants (paginated, filterable). |
| GET | `/api/plants/:id` | Get plant detail with care info. |

### Nurseries

| Method | Path | Description |
|---|---|---|
| GET | `/api/nurseries` | List nurseries (filterable by location, plant). |
| GET | `/api/nurseries/:id` | Get nursery detail with plant inventory. |
| GET | `/api/nurseries/nearby` | Get nurseries near lat/lng within radius. |

### Usage & Billing

| Method | Path | Description |
|---|---|---|
| GET | `/api/usage/today` | Get current day's identification count. |
| POST | `/api/billing/checkout` | Create Stripe checkout session for pro plan. |
| POST | `/api/billing/webhook` | Stripe webhook to handle payment events. |
| GET | `/api/billing/subscription` | Get current subscription status. |

### Community (v2)

| Method | Path | Description |
|---|---|---|
| POST | `/api/community/posts` | Share an identification to the community. |
| GET | `/api/community/posts` | List community posts (paginated). |
| POST | `/api/community/posts/:id/like` | Like a post. |

---

## 7. Integration with www.greencoverinitiative.com

### 7.1 Single Sign-On (SSO)

- Implement OAuth 2.0 / OpenID Connect flow with greencoverinitiative.com as the identity provider.
- Users who already have a GreenCover account can log in without creating a new account.
- The `provider` field in `Users` tracks the auth source.

### 7.2 Shared Branding

- Use GreenCover brand colors, logo, and typography.
- Header links back to greencoverinitiative.com.
- Footer includes GreenCover Initiative branding and legal links.

### 7.3 Community Cross-posting (v2)

- Identifications shared in the Plant Identifier community feed can optionally be cross-posted to the main GreenCover community on greencoverinitiative.com.
- Requires an API integration with the parent site's community module.

### 7.4 Analytics & Referral

- Track referrals from greencoverinitiative.com via UTM parameters.
- Report identification stats back to the parent site dashboard (v2).

---

## 8. Payment Model

### 8.1 Free Tier

- 10 plant identifications per day.
- Counter resets at midnight UTC.
- Unauthenticated users are tracked by IP/device fingerprint (best-effort).
- Authenticated users are tracked by `user_id` in `DailyUsage`.

### 8.2 Pro Tier

- Unlimited identifications.
- Monthly subscription via Stripe.
- Pricing TBD (placeholder: $4.99/month).
- Stripe Checkout for payment, Stripe Webhooks for subscription lifecycle.

### 8.3 Enforcement Flow

1. On each `/api/identify` call, query `DailyUsage` for the current user + today's date.
2. If `count >= plan.daily_limit` and `daily_limit` is not null, return `429 Too Many Requests` with upgrade prompt.
3. Otherwise, increment `count` and proceed with identification.

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response time (identification) | < 3 seconds (p95) |
| Uptime | 99.5% |
| Image max size | 10 MB |
| Supported formats | JPEG, PNG, WebP |
| Accessibility | WCAG 2.1 AA |
| Browser support | Latest 2 versions of Chrome, Firefox, Safari, Edge |
