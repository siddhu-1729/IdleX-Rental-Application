# IdleX Backend API Documentation (Django)

This maps every feature module from the frontend implementation guide to a Django app, its models, endpoints, and the official library/documentation to use. Stack assumed: **Django + Django REST Framework (DRF)**, PostgreSQL, and a small set of well-established packages — no custom-built solutions where a maintained library already solves the problem.

---

## 0. Project Setup & Core Conventions

**Use:**
- Django — https://docs.djangoproject.com/en/stable/
- Django REST Framework (DRF) — https://www.django-rest-framework.org/
- `django-environ` for settings/env vars — https://django-environ.readthedocs.io/
- `django-cors-headers` (Next.js frontend is a separate origin) — https://pypi.org/project/django-cors-headers/
- `drf-spectacular` for OpenAPI/Swagger schema generation — https://drf-spectacular.readthedocs.io/

**App structure** (one Django app per feature, matching your `features/` folders on the frontend):

```
idlex_backend/
├── config/                  # settings, root urls, asgi/wsgi
├── apps/
│   ├── users/                # auth + profile (maps to features/auth)
│   ├── kyc/
│   ├── listings/             # maps to features/listing
│   ├── search/                # thin — mostly query params on listings
│   ├── bookings/             # maps to features/booking
│   ├── payments/
│   ├── chat/
│   ├── reviews/
│   └── adminpanel/           # maps to features/admin
```

Each app follows Django's standard `models.py` / `serializers.py` / `views.py` / `urls.py` / `permissions.py` split, per DRF's tutorial structure: https://www.django-rest-framework.org/tutorial/1-serialization/

**Base response/routing pattern:** use DRF `ViewSet` + `DefaultRouter` for standard CRUD resources (listings, bookings, reviews) and plain `APIView` for non-CRUD actions (OTP verify, KYC step submit). Router docs: https://www.django-rest-framework.org/api-guide/routers/

---

## 1. Auth (`apps/users`) — maps to `features/auth`

**Covers:** Sign Up, Login, Forgot Password, Verify OTP, session/role state that `useAuthStore` on the frontend consumes.

**Use:**
- Custom user model extending `AbstractUser` — https://docs.djangoproject.com/en/stable/topics/auth/customizing/#substituting-a-custom-user-model (do this before your first migration — swapping later is painful)
- `djangorestframework-simplejwt` for JWT access/refresh tokens (pairs naturally with a stateless Next.js frontend) — https://django-rest-framework-simplejwt.readthedocs.io/
- `dj-rest-auth` on top of `django-allauth` if you want registration/password-reset/email-verification endpoints pre-built instead of hand-rolling views — https://dj-rest-auth.readthedocs.io/ and https://docs.allauth.org/
- For OTP (phone-based verify): `django-otp` for the OTP data model/verification primitives — https://django-otp-official.readthedocs.io/ — combined with an SMS provider (Twilio's official Python SDK: https://www.twilio.com/docs/libraries/python) for delivery. Django itself has no SMS sending; treat SMS as an external integration, not a Django feature.

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/register/` | POST | dj-rest-auth `RegisterView` or custom |
| `/api/auth/login/` | POST | simplejwt `TokenObtainPairView` |
| `/api/auth/token/refresh/` | POST | simplejwt `TokenRefreshView` |
| `/api/auth/otp/request/` | POST | custom `APIView`, triggers SMS |
| `/api/auth/otp/verify/` | POST | custom `APIView`, validates against django-otp |
| `/api/auth/password/reset/` | POST | dj-rest-auth `PasswordResetView` |
| `/api/auth/me/` | GET | current user + role (owner/renter flags) |

**Roles (Owner/Renter/Admin):** don't create separate user tables. Use Django's `is_staff`/`is_superuser` for Admin, and a `role` or boolean flags (`is_owner`, `is_renter`) on the custom user model — matching the frontend's decision to keep one `(dashboard)` group and gate by role at the component level. Permission classes enforce this server-side: https://www.django-rest-framework.org/api-guide/permissions/#custom-permissions

---

## 2. KYC (`apps/kyc`)

**Covers:** multi-step KYC stepper (ID upload, selfie, bank details), save-and-resume progress.

**Use:**
- Model a `KycSubmission` with a `status` field (`pending/approved/rejected`) using Django's `TextChoices` — https://docs.djangoproject.com/en/stable/ref/models/fields/#enumeration-types
- File/image uploads: DRF's `FileField`/`ImageField` support via `parsers.MultiPartParser` — https://www.django-rest-framework.org/api-guide/parsers/#multipartparser
- Store uploaded ID/selfie files in cloud storage, not local disk, via `django-storages` (S3/GCS backend) — https://django-storages.readthedocs.io/
- If selfie/liveness matching is required, that's a third-party vision API (not Django) — flag this as an external integration decision, don't build face-match logic yourself.

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/kyc/` | GET | current user's KYC status + step progress |
| `/api/kyc/step/{step_name}/` | POST | submit one step (id-upload, selfie, bank-details) |
| `/api/kyc/submit/` | POST | finalize, moves status to `pending` |

Save-and-resume works naturally if each step POST just updates fields on one `KycSubmission` row rather than creating a new record per step.

---

## 3. Listings (`apps/listings`) — maps to `features/listing`

**Covers:** ListingCard data, ListingStepper (create/edit), PhotoUploader, AvailabilityCalendar.

**Use:**
- Standard DRF `ModelViewSet` for full CRUD — https://www.django-rest-framework.org/api-guide/viewsets/#modelviewset
- Multiple photo uploads: a related `ListingPhoto` model (FK to `Listing`) rather than a JSON array field, so DRF's nested serializers handle it — https://www.django-rest-framework.org/api-guide/relations/#nested-relationships
- Availability calendar: a `ListingAvailability` model with date ranges; validate overlaps in `clean()` or serializer `validate()` — https://docs.djangoproject.com/en/stable/ref/models/instances/#validating-objects
- Image optimization/thumbnails on upload: `django-imagekit` — https://django-imagekit.readthedocs.io/
- Draft/step-in-progress listings: same `status` `TextChoices` pattern as KYC (`draft/published/paused`)

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/listings/` | GET, POST | list (public, filtered) / create (owner only) |
| `/api/listings/{id}/` | GET, PUT, PATCH, DELETE | detail / edit / delete |
| `/api/listings/{id}/photos/` | POST, DELETE | manage photos |
| `/api/listings/{id}/availability/` | GET, POST | calendar blocks |
| `/api/listings/my-listings/` | GET | owner's own listings, `my-listings` page |

Permissions: only the owning user can edit/delete — use DRF's object-level permission pattern (`IsOwnerOrReadOnly` custom class) — https://www.django-rest-framework.org/api-guide/permissions/#object-level-permissions

---

## 4. Search (`apps/search`)

**Covers:** FilterSidebar, SortDropdown, ProductGrid, ActiveFilterPills — this is a query layer over `Listing`, not a separate resource.

**Use:**
- `django-filter` for declarative filtering (category, price range, availability, location) bound directly into the listings viewset — https://django-filter.readthedocs.io/
- DRF's built-in `OrderingFilter` for sort dropdown (price, newest, rating) — https://www.django-rest-framework.org/api-guide/filtering/#orderingfilter
- Pagination matching the frontend's URL-synced state (`?page=`) via DRF `PageNumberPagination` or `LimitOffsetPagination` — https://www.django-rest-framework.org/api-guide/pagination/
- If you need full-text or fuzzy search on titles/descriptions beyond simple filters, Postgres full-text search is built into Django itself — https://docs.djangoproject.com/en/stable/ref/contrib/postgres/search/ (don't reach for Elasticsearch unless scale actually demands it)

**Endpoint:** all search/filter/sort is just query params on `/api/listings/` — e.g. `/api/listings/?category=tools&min_price=100&ordering=-created_at`. No dedicated `/api/search/` resource needed.

---

## 5. Bookings (`apps/bookings`) — maps to `features/booking`

**Covers:** BookingWidget, StatusTimeline, ExtensionRequestModal, FlexibleRentalCounter.

**Use:**
- `ModelViewSet` for the core `Booking` resource, `status` as `TextChoices` (`requested/confirmed/active/completed/cancelled/disputed`)
- Status transitions as custom actions on the viewset via DRF's `@action` decorator (e.g., `/bookings/{id}/confirm/`, `/bookings/{id}/cancel/`) rather than exposing raw status field edits — https://www.django-rest-framework.org/api-guide/viewsets/#marking-extra-actions-for-routing
- Extension requests: a related `BookingExtensionRequest` model (FK to `Booking`), its own small state machine (`requested/approved/rejected`)
- Enforce valid state transitions with `django-fsm` if the state machine gets complex (many statuses, guards on who can transition what) — https://github.com/viewflow/django-fsm — otherwise plain `if` checks in the serializer/view are fine for a first version; don't add the dependency until you feel the pain.
- Preventing double-booking on overlapping dates: validate against `ListingAvailability`/existing bookings in the serializer's `validate()`, same overlap-check pattern as listings availability.

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/bookings/` | GET, POST | list user's bookings (renter view) / create |
| `/api/bookings/{id}/` | GET | detail — StatusTimeline data |
| `/api/bookings/{id}/confirm/` | POST | owner confirms |
| `/api/bookings/{id}/cancel/` | POST | either party, with reason |
| `/api/bookings/{id}/extension-request/` | POST | renter requests extension |
| `/api/bookings/{id}/extension-request/{req_id}/respond/` | POST | owner approves/rejects |
| `/api/bookings/owner/` | GET | owner-facing list (`my-rentals` counterpart from the owner side) |

---

## 6. Payments (`apps/payments`)

**Covers:** PaymentMethodSelector, CostBreakdown, PayoutSettings.

**Use:**
- Django itself does not process payments — integrate a payment gateway (Stripe or Razorpay, common for marketplace/India-facing apps) and store only references, never raw card data:
  - Stripe's official Python library — https://docs.stripe.com/api?lang=python (Stripe Connect specifically for marketplace payouts to Owners — https://docs.stripe.com/connect)
  - Razorpay's official Python SDK if targeting India — https://razorpay.com/docs/payments/server-integration/python/
- Model a `Payment`/`Payout` table storing the gateway's transaction ID, amount, status — mirror the gateway's own status enum rather than inventing your own
- Webhooks from the payment provider: a plain DRF `APIView` with CSRF exempted (`@csrf_exempt` + signature verification per the provider's docs) — Stripe webhook verification: https://docs.stripe.com/webhooks#verify-official-libraries
- Cost breakdown calculation (deposit, service fee, taxes) is plain Python business logic in a serializer method field or a `services.py` module — no special Django feature needed here.

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/payments/methods/` | GET, POST | saved payment methods (tokenized via gateway) |
| `/api/payments/checkout/` | POST | creates a payment intent for a booking |
| `/api/payments/payouts/` | GET | owner's payout history |
| `/api/payments/payout-settings/` | GET, PUT | bank/payout details |
| `/api/webhooks/payments/` | POST | gateway webhook receiver, not user-facing |

---

## 7. Chat (`apps/chat`)

**Covers:** ChatThread, MessageBubble, ChatInput — the frontend guide flags this as "polling or socket, until backend decides transport." Decide here: **use WebSockets**, not polling, for anything conversational.

**Use:**
- `Django Channels` for WebSocket support — https://channels.readthedocs.io/ (this is the standard, actively maintained answer for real-time in Django; there isn't a good alternative)
- Redis as the channel layer backend — https://channels.readthedocs.io/en/stable/topics/channel_layers.html
- Regular DRF `ModelViewSet` for REST access to conversation/message history (so the frontend can fetch on page load, then upgrade to the socket for live updates)
- Deployment note: Channels needs an ASGI server (Daphne or Uvicorn), not the default WSGI dev server — https://channels.readthedocs.io/en/stable/deploying.html

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/chat/conversations/` | GET | list threads for current user |
| `/api/chat/conversations/{id}/messages/` | GET | message history (paginated) |
| `ws/chat/{conversation_id}/` | WebSocket | live message send/receive via Channels consumer |

---

## 8. Reviews (`apps/reviews`)

**Covers:** ReviewForm, StarRating, ReviewList.

**Use:**
- Plain `ModelViewSet`, no special package needed — this is standard CRUD
- Enforce "one review per completed booking" with a model-level `unique_together` (or `UniqueConstraint`) on `(booking, reviewer)` — https://docs.djangoproject.com/en/stable/ref/models/constraints/#uniqueconstraint
- Average rating on a listing: either compute on read with `.aggregate(Avg('rating'))` (https://docs.djangoproject.com/en/stable/ref/models/querysets/#avg) or denormalize onto `Listing` and update via a Django signal (`post_save` on `Review`) if read volume is high — https://docs.djangoproject.com/en/stable/topics/signals/

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/reviews/` | POST | create, only if booking is completed |
| `/api/listings/{id}/reviews/` | GET | ReviewList for a product page |

---

## 9. Admin (`apps/adminpanel`) — maps to `features/admin`

**Covers:** Admin dashboard stats, Users, Listings, Categories, Payments, Reports, Disputes.

**Use:**
- Django's built-in admin site for internal ops work you don't need a custom UI for — https://docs.djangoproject.com/en/stable/ref/contrib/admin/ (register `User`, `Listing`, `Booking`, `Payment` models here first; it's free CRUD + is often enough that you don't need to build `/admin/*` API endpoints for every table)
- For the custom admin API endpoints your Next.js `(admin)` route group actually calls (stats, disputes workflow, moderation actions), use DRF `ViewSet`s gated by `IsAdminUser` — https://www.django-rest-framework.org/api-guide/permissions/#isadminuser
- Dashboard stats/aggregates: Django's aggregation API (`Count`, `Sum`, `Avg` across models) — https://docs.djangoproject.com/en/stable/topics/db/aggregation/
- Disputes: a `Dispute` model (FK to `Booking`), status workflow same `TextChoices` pattern as bookings

**Endpoints:**
| Endpoint | Method | Notes |
|---|---|---|
| `/api/admin/stats/` | GET | dashboard numbers |
| `/api/admin/users/` | GET, PATCH | list/suspend users |
| `/api/admin/listings/` | GET, PATCH | moderate listings |
| `/api/admin/disputes/` | GET, POST | list / resolve |
| `/api/admin/reports/` | GET | flagged content queue |

---

## 10. Cross-Cutting Concerns

| Concern | Use | Docs |
|---|---|---|
| API contract types matching frontend's `features/*/types.ts` | `drf-spectacular` auto-generates OpenAPI schema from your serializers — export this and generate/verify TS types against it | https://drf-spectacular.readthedocs.io/ |
| Async/background jobs (e.g. sending KYC-approved emails, payout processing) | `Celery` + Redis/RabbitMQ broker | https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html |
| Rate limiting (OTP requests, login attempts) | DRF `throttling` classes | https://www.django-rest-framework.org/api-guide/throttling/ |
| Environment-based settings (dev/staging/prod) | `django-environ` | https://django-environ.readthedocs.io/ |
| Testing | DRF's `APITestCase` | https://www.django-rest-framework.org/api-guide/testing/ |
| CI/CD | GitHub Actions running `manage.py test` + linting, matches your frontend's stated CI/CD interest | (no Django-specific doc — standard GitHub Actions Python workflow) |

---

## 11. Suggested Build Order (mirrors your frontend's Section 6)

1. Custom user model + JWT auth (must be first — everything else has an FK to `User`)
2. Listings CRUD + photo upload + search/filter
3. KYC stepper
4. Bookings + availability validation
5. Payments (start with checkout intent + webhook skeleton, even before a real gateway account exists)
6. Reviews
7. Chat (Channels — most infra-heavy, do after core REST endpoints are stable)
8. Admin panel (mostly Django admin + a thin stats API — build last, as your frontend guide also states)

---

Want me to scaffold the actual Django project (apps, base models, `settings.py` with DRF + JWT + CORS wired up) as real starter code next?


admin username: admin
email : _____
password: admin12345