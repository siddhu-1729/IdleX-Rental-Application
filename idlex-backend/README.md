# IdleX Backend API Documentation (Node.js + Express + MongoDB)

Converted from the original Django/DRF documentation. Same feature
mapping, same endpoint contracts — different stack. This file documents
the architecture; the code in `src/` is a working implementation, not a
plan.

**Stack:** Node.js, Express, MongoDB (Mongoose), JWT auth, Socket.IO for
chat, Multer for uploads, Zod for validation.

---

## 0. Project Setup & Core Conventions

**Libraries used (in place of the Django/DRF equivalents):**

| Concern | Django doc used | This stack uses |
|---|---|---|
| Web framework | Django + DRF | Express |
| ORM | Django ORM | Mongoose |
| Env vars | `django-environ` | `dotenv` (`src/config/env.js`) |
| CORS | `django-cors-headers` | `cors` |
| Auth tokens | `djangorestframework-simplejwt` | `jsonwebtoken` (`src/utils/tokens.js`) |
| Validation | DRF serializers | `zod` schemas per module |
| File uploads | DRF `MultiPartParser` | `multer` |
| Real-time | Django Channels + Redis | `socket.io` |
| Rate limiting | DRF throttling | `express-rate-limit` |
| Password hashing | Django's built-in hasher | `bcryptjs` |

**Folder structure** — one module per feature, each split into
`routes` → `controller` → `service` (business logic) → shared `models/`,
mirroring the separation DRF gets from `serializers.py`/`views.py`/`urls.py`:

```
idlex-backend/
├── src/
│   ├── config/           # env.js, db.js
│   ├── models/           # Mongoose schemas (User, Listing, Booking, ...)
│   ├── middlewares/       # auth, role, error, upload, validate
│   ├── utils/             # ApiError, ApiResponse, asyncHandler, tokens, otp
│   ├── sockets/           # chat.socket.js (Socket.IO)
│   ├── modules/
│   │   ├── auth/          # controller, service, validation, routes
│   │   ├── kyc/
│   │   ├── listings/      # also serves the "search" query layer
│   │   ├── search/        # README only — folded into listings, see below
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── chat/
│   │   ├── reviews/
│   │   └── admin/
│   ├── app.js             # Express app, middleware & route wiring
│   └── server.js          # HTTP + Socket.IO bootstrap
├── package.json
└── .env.example
```

Each module follows: `X.routes.js` (URL → controller wiring, matches
DRF's router/urls.py) → `X.controller.js` (parse req, call service, shape
response, matches a DRF view) → `X.service.js` (business logic, matches
a `services.py` module or a fat serializer's `validate()`/`create()`).

**Response shape:** every endpoint returns
`{ success, message, data }` via `ApiResponse`, and every error returns
`{ success: false, message, details? }` via the central `errorMiddleware`
— a fixed contract in place of DRF's default renderer.

---

## 1. Auth (`src/modules/auth`) — maps to `apps/users`

**Covers:** Sign Up, Login, Forgot Password, Verify OTP, current-user/role
state.

- Custom `User` model with `role: 'renter' | 'owner' | 'admin'` plus
  `isOwner`/`isRenter` flags — same "one user table, flags for dual
  capability" decision as the Django doc, no separate role tables.
- JWT access + refresh tokens (`src/utils/tokens.js`), access token
  short-lived and sent via `Authorization: Bearer`, refresh token used
  only to mint new access tokens.
- OTP: generated and stored (hashed-in-practice recommended) on the user
  document with an expiry; delivery is via Twilio, same "SMS is an
  external integration, not a framework feature" note as the Django doc.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/register` | POST | creates user, returns tokens |
| `/api/auth/login` | POST | validates credentials, returns tokens |
| `/api/auth/token/refresh` | POST | exchanges refresh token for new access token |
| `/api/auth/otp/request` | POST | triggers SMS |
| `/api/auth/otp/verify` | POST | validates code, marks phone verified |
| `/api/auth/password/reset` | POST | emails a reset token (logged in dev) |
| `/api/auth/password/reset/confirm` | POST | sets new password |
| `/api/auth/me` | GET | current user + role (protected) |

---

## 2. KYC (`src/modules/kyc`)

**Covers:** multi-step stepper (ID upload, selfie, bank details),
save-and-resume.

- One `Kyc` document per user (`unique: true` on `user`), `status`
  (`not_started/in_progress/pending/approved/rejected`) and `currentStep`
  fields — same single-row-updated-per-step pattern as the Django doc.
- File uploads via `multer` (`src/middlewares/upload.middleware.js`),
  local disk in dev — swap the `storage` adapter for S3/Cloudinary in
  production, same call-out as `django-storages`.
- Selfie/liveness matching is flagged as a third-party vision API
  integration, not built here — same as the original doc.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/kyc` | GET | current user's KYC status + step progress |
| `/api/kyc/step/:step` | POST | submit one step (`id-upload`, `selfie`, `bank-details`) |
| `/api/kyc/submit` | POST | finalize, moves status to `pending` |

---

## 3. Listings (`src/modules/listings`)

**Covers:** listing CRUD, photo uploads, availability calendar.

- Photos and availability blocks are embedded subdocuments on `Listing`
  rather than separate collections — MongoDB's document model replaces
  the Django doc's separate `ListingPhoto` FK model.
- Availability overlap validation happens in the service layer
  (`listings.service.js` / `listings.controller.js`), equivalent to a
  DRF serializer's `validate()`.
- Draft/published/paused status field, same enum pattern as KYC.
- Object-level "only the owner can edit" is enforced by
  `listingsService.getOwnedListingOr404`, the Mongoose equivalent of
  DRF's `IsOwnerOrReadOnly`.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/listings` | GET, POST | list (public, filtered) / create (owner only) |
| `/api/listings/:id` | GET, PUT, PATCH, DELETE | detail / edit / delete |
| `/api/listings/:id/photos` | POST, DELETE (`/:photoId`) | manage photos |
| `/api/listings/:id/availability` | GET, POST | calendar blocks |
| `/api/listings/mine/all` | GET | owner's own listings |

---

## 4. Search (`src/modules/search`)

Same decision as the Django doc: **not a separate resource.** All
filtering/sorting/pagination are query params handled in
`listings.service.js#queryListings`:

```
GET /api/listings?category=tools&minPrice=100&maxPrice=500&city=Pune&ordering=-pricePerDay&page=2&limit=20&q=drill
```

- `q` uses a MongoDB text index on `title`/`description` (declared in
  `Listing.js`) — the Mongo equivalent of Postgres full-text search,
  which the Django doc calls out as sufficient before reaching for
  Elasticsearch.
- `ordering`, `page`/`limit` mirror DRF's `OrderingFilter` and
  `PageNumberPagination`.

---

## 5. Bookings (`src/modules/bookings`)

**Covers:** booking lifecycle, extension requests, cost calculation.

- `status`: `requested/confirmed/active/completed/cancelled/disputed`,
  same enum as the Django doc.
- Double-booking prevention: `bookingsService.assertDatesAvailable`
  checks both the listing's blocked `availability` and existing active
  bookings for date overlap before a booking (or extension) is created —
  same overlap-check pattern used for listing availability itself.
- Cost breakdown (subtotal, service fee, deposit) computed in
  `bookings.service.js`, plain JS — same "no special framework feature
  needed" note as the Django doc's `services.py` mention.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/bookings` | GET, POST | list renter's bookings / create |
| `/api/bookings/:id` | GET | detail — StatusTimeline data |
| `/api/bookings/:id/confirm` | POST | owner confirms |
| `/api/bookings/:id/cancel` | POST | either party, with reason |
| `/api/bookings/:id/extension-request` | POST | renter requests extension |
| `/api/bookings/:id/extension-request/:reqId/respond` | POST | owner approves/rejects |
| `/api/bookings/owner` | GET | owner-facing list |

---

## 6. Payments (`src/modules/payments`)

**Covers:** checkout, payout history, payout settings, webhooks.

- No payment logic lives in the app itself — `payments.service.js`
  stubs a gateway call (swap in the real Razorpay/Stripe SDK) and
  stores only the gateway's order/payment/signature references, never
  card data — same rule as the Django doc.
- Webhook route (`POST /api/webhooks/payments`) is mounted in `app.js`
  **before** the global `express.json()` parser, using `express.raw()`
  so the raw body is available for HMAC signature verification — the
  Express equivalent of DRF's `@csrf_exempt` + signature check.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/payments/checkout` | POST | creates a payment intent for a booking |
| `/api/payments/payouts` | GET | owner's payout history |
| `/api/payments/payout-settings` | GET, PUT | bank/payout details |
| `/api/webhooks/payments` | POST | gateway webhook receiver, not user-facing |

---

## 7. Chat (`src/modules/chat` + `src/sockets/chat.socket.js`)

**Covers:** conversation list, message history, live messaging.

- **Socket.IO** in place of Django Channels + Redis — the direct
  Node/Express equivalent for WebSockets, running on the same HTTP
  server (`src/server.js`), no separate ASGI server needed the way
  Channels requires Daphne/Uvicorn. Add the `socket.io-redis` adapter
  only if you scale beyond one Node process.
- REST endpoints serve initial page-load data; the socket connection
  takes over for live updates — same two-layer approach as the Django
  doc.
- Socket auth verifies the same JWT access token used for REST calls
  (`socket.handshake.auth.token`).

| Endpoint | Method | Notes |
|---|---|---|
| `/api/chat/conversations` | GET | list threads for current user |
| `/api/chat/conversations/:id/messages` | GET | message history (paginated) |
| `message:send` / `message:new` | Socket.IO event | live send/receive, joined via `conversation:join` |

---

## 8. Reviews (`src/modules/reviews`)

**Covers:** review creation, per-listing review list.

- "One review per completed booking" enforced with a compound unique
  index on `(booking, reviewer)` — the Mongoose equivalent of Django's
  `UniqueConstraint`.
- Average rating denormalized onto `Listing` and recomputed via
  `Review.aggregate()` on each new review — the "high read volume"
  option the Django doc offers as an alternative to computing on read.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/reviews` | POST | create, only if booking is completed |
| `/api/listings/:id/reviews` | GET | ReviewList for a product page |

---

## 9. Admin (`src/modules/admin`)

**Covers:** dashboard stats, user/listing moderation, disputes, reports.

- No built-in admin UI equivalent to Django's admin site — all admin
  operations are explicit `IsAdminUser`-gated REST endpoints
  (`authorize('admin')` middleware), since Express has no free CRUD
  admin generator.
- Dashboard stats use Mongoose's `countDocuments`/`aggregate`, the
  direct equivalent of Django's `Count`/`Sum`/`Avg` aggregation API.
- `Dispute` model with the same status-workflow enum pattern as bookings.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/admin/stats` | GET | dashboard numbers |
| `/api/admin/users` | GET, PATCH (`/:id`) | list/suspend users |
| `/api/admin/listings` | GET, PATCH (`/:id`) | moderate listings |
| `/api/admin/disputes` | GET, POST (`/:id/resolve`) | list / resolve |
| `/api/admin/reports` | GET | flagged content queue |

---

## 10. Cross-Cutting Concerns

| Concern | Django doc used | This stack uses |
|---|---|---|
| API contract / OpenAPI docs | `drf-spectacular` | Add `swagger-jsdoc` + `swagger-ui-express` if a generated schema is needed |
| Async/background jobs | Celery + Redis | `bullmq` + Redis (not wired up yet — add when a real queue is needed, e.g. payout processing, KYC-approved emails) |
| Rate limiting | DRF throttling | `express-rate-limit` (`src/app.js`, applied to `/api/auth`) |
| Env-based settings | `django-environ` | `dotenv` (`src/config/env.js`) |
| Testing | DRF `APITestCase` | `jest` + `supertest` (add as a dev dependency when writing tests) |
| CI/CD | GitHub Actions running `manage.py test` | GitHub Actions running `npm test` + `eslint` |

---

## 11. Suggested Build Order

Same order as the Django doc, unchanged by the stack switch:

1. `User` model + JWT auth
2. Listings CRUD + photo upload + search/filter
3. KYC stepper
4. Bookings + availability validation
5. Payments (checkout intent + webhook skeleton first, real gateway account later)
6. Reviews
7. Chat (Socket.IO — after core REST endpoints are stable)
8. Admin panel

---

## Running locally

```bash
cp .env.example .env        # fill in MONGO_URI, JWT secrets, etc.
npm install
npm run seed:admin          # creates the initial admin user from .env
npm run dev                 # nodemon, http://localhost:5000
```

Health check: `GET /health` → `{ "status": "ok" }`
