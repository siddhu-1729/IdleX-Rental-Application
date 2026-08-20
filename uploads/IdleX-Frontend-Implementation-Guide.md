# IdleX Frontend Implementation Guide (Next.js App Router)

> One note before we start: Next.js App Router handles routing itself (file-system based, with layouts, route groups, parallel/intercepting routes). You don't need `react-router-dom` alongside it — that's for non-Next React SPAs. I'm assuming "react router" meant "client-side routing/navigation" in general, and this guide uses App Router's native routing (`next/navigation`, `<Link>`, `useRouter`) throughout. Flag it if you actually have a reason to run react-router in parallel — it's unusual but not impossible.

---

## 1. Guiding Principles for the Structure

Before the folder tree, the *why* — so you can extend this later without breaking the pattern:

1. **Route structure mirrors the three roles** (Guest, Renter/Owner, Admin) using Next.js **route groups** — folders in parentheses `(group)` that organize routes without affecting the URL.
2. **Feature-based, not type-based, for anything domain-specific.** Don't dump all components in one giant `/components` folder. Group by feature (`booking/`, `listing/`, `kyc/`) — this matches your PRD's modules almost 1:1, which makes future backend integration and code review much easier.
3. **Shared/reusable UI stays separate from feature UI.** A `Button` used everywhere lives in `components/ui`. A `BookingStatusBadge` used only in booking flows lives in `features/booking/components`.
4. **Server Components by default, Client Components only where needed** (forms, interactivity, hooks). Mark client boundaries deliberately — don't `"use client"` entire pages.
5. **Colocate what changes together.** Types, hooks, and API calls for "booking" live near booking's components, not scattered across `/types`, `/hooks`, `/lib` at the root.

---

## 2. Full Folder Structure

```
src/
├── app/
│   ├── (public)/                      # Guest-accessible, no auth required
│   │   ├── page.tsx                   # Landing page
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── product/
│   │   │   └── [productId]/
│   │   │       └── page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   └── terms/page.tsx
│   │
│   ├── (auth)/                        # Auth pages — own minimal layout (no navbar/footer)
│   │   ├── layout.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-otp/page.tsx
│   │
│   ├── (dashboard)/                   # Authenticated: Renter + Owner (shared shell)
│   │   ├── layout.tsx                 # Sidebar + topbar shell, auth guard
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Overview
│   │   ├── my-listings/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx           # Listing stepper (create)
│   │   │   └── [listingId]/edit/page.tsx
│   │   ├── my-rentals/
│   │   │   ├── page.tsx
│   │   │   └── [rentalId]/page.tsx    # Booking detail/status/tracking
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [conversationId]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── profile/page.tsx
│   │   └── kyc/
│   │       ├── page.tsx               # KYC stepper entry/resume
│   │       └── layout.tsx             # Stepper-specific layout (progress bar)
│   │
│   ├── (admin)/                       # Admin-only, separate layout + guard
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── page.tsx               # Admin dashboard (stats)
│   │       ├── users/page.tsx
│   │       ├── listings/page.tsx
│   │       ├── categories/page.tsx
│   │       ├── payments/page.tsx
│   │       ├── reports/page.tsx
│   │       └── disputes/page.tsx
│   │
│   ├── checkout/
│   │   └── [productId]/page.tsx       # Own top-level route, focused layout (no distractions)
│   │
│   ├── api/                           # Route handlers (BFF layer — see §5)
│   │   └── ...
│   │
│   ├── layout.tsx                     # Root layout (fonts, providers, <html>/<body>)
│   ├── globals.css
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                            # Design-system primitives (Button, Card, Input, Modal, Stepper...)
│   ├── layout/                        # Navbar, Footer, Sidebar, MobileBottomNav
│   └── shared/                        # Cross-feature composites (EmptyState, TrustBadge, PriceBreakdown)
│
├── features/                          # Domain modules — mirrors PRD's Core Modules
│   ├── auth/
│   │   ├── components/                # LoginForm, OtpInput, SignUpForm
│   │   ├── hooks/                     # useAuth, useOtpTimer
│   │   ├── api/                       # authApi.ts (calls backend later)
│   │   ├── types.ts
│   │   └── schema.ts                  # zod validation schemas
│   │
│   ├── kyc/
│   │   ├── components/                # KycStepper, IdUploadStep, SelfieStep, BankDetailsStep
│   │   ├── hooks/                     # useKycProgress
│   │   ├── api/
│   │   ├── types.ts
│   │   └── schema.ts
│   │
│   ├── listing/
│   │   ├── components/                # ListingCard, ListingStepper, PhotoUploader, AvailabilityCalendar
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types.ts
│   │   └── schema.ts
│   │
│   ├── search/
│   │   ├── components/                # FilterSidebar, SortDropdown, ProductGrid, ActiveFilterPills
│   │   ├── hooks/                     # useSearchFilters (syncs to URL query params)
│   │   └── types.ts
│   │
│   ├── booking/
│   │   ├── components/                # BookingWidget, StatusTimeline, ExtensionRequestModal, FlexibleRentalCounter
│   │   ├── hooks/                     # useBookingFlow, useExtensionEstimate
│   │   ├── api/
│   │   └── types.ts
│   │
│   ├── payment/
│   │   ├── components/                # PaymentMethodSelector, CostBreakdown, PayoutSettings
│   │   ├── hooks/
│   │   └── types.ts
│   │
│   ├── chat/
│   │   ├── components/                # ChatThread, MessageBubble, ChatInput
│   │   ├── hooks/                     # useChatSocket (or polling, until backend defines transport)
│   │   └── types.ts
│   │
│   ├── review/
│   │   ├── components/                # ReviewForm, StarRating, ReviewList
│   │   └── types.ts
│   │
│   └── admin/
│       ├── components/                # DataTable, StatsCard, DisputeResolutionModal
│       └── types.ts
│
├── lib/
│   ├── api-client.ts                  # Central fetch wrapper (base URL, interceptors) — stubbed for now
│   ├── constants.ts                   # Route paths, enums (BookingStatus, KycStatus)
│   ├── utils.ts                       # cn(), formatCurrency(), formatDate()
│   └── validations/                   # Shared zod schemas (phone, pincode, etc.)
│
├── hooks/                             # App-wide hooks only (useDebounce, useMediaQuery, useLocalStorage)
│
├── store/                             # Global client state (Zustand recommended — see §4)
│   ├── useAuthStore.ts
│   ├── useUiStore.ts                  # modals, toasts, mobile nav state
│   └── useCartStore.ts (if needed)
│
├── types/                             # Truly global types only (User, ApiResponse<T>)
│
├── config/
│   ├── site.ts                       # Site metadata, nav links per role
│   └── navigation.ts                 # Bottom nav items, sidebar items (role-based)
│
├── styles/
│   └── tokens.css                    # CSS variables for design tokens (see §3)
│
└── middleware.ts                      # Route protection (auth/role checks) at the edge
```

**Why route groups this way:** `(public)`, `(auth)`, `(dashboard)`, `(admin)` each get their own `layout.tsx` without polluting the URL — `/dashboard` stays `/dashboard`, not `/(dashboard)/dashboard`. This directly maps to your PRD's four target users (Guest, Owner, Renter, Admin) and lets you apply different auth guards and shells per group instead of `if` branching inside one giant layout.

**Owner vs Renter:** the PRD treats them as two roles but one logged-in person can be both (list *and* rent). Rather than splitting `(owner)` and `(renter)` route groups — which would duplicate `profile`, `messages`, `notifications` — keep one `(dashboard)` group and let `my-listings` (owner-facing) and `my-rentals` (renter-facing) coexist. Gate individual actions (e.g., "Add Listing" button) by role/KYC status at the component level, not the route level.

---

## 3. Design System Setup (Do This First — Milestone 1 in your PRD)

Matches your UX guide's tokens exactly:

**`tailwind.config.ts`**
```ts
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: "#2563EB", ... }, // Royal Blue
      secondary: { DEFAULT: "#10B981", ... }, // Emerald
      accent: { DEFAULT: "#F59E0B", ... },   // Orange
    },
    fontFamily: {
      heading: ["Poppins", "sans-serif"],
      body: ["Inter", "sans-serif"],
    },
    spacing: { /* 4/8/16/32/64 already covered by Tailwind's default scale */ },
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
  }
}
```

Build these primitives in `components/ui` before touching any feature screen:
- `Button` (variants: primary/secondary/ghost/danger; loading state built in)
- `Card`
- `Input`, `Select`, `Textarea` (with error state styling — you'll need this everywhere for KYC/listing forms)
- `Badge` (for status labels — Pending/Approved/Active/Overdue map directly to badge variants)
- `Stepper` (used by both KYC and Listing creation — build once, reuse twice)
- `Modal` / `Dialog`
- `Skeleton` (loading states)

This is the highest-leverage work in the whole project — every other screen consumes these.

---

## 4. State Management Strategy

Given the PRD's modules, you'll need three different kinds of state — don't reach for one tool for all of them:

| State type | Tool | Examples |
|---|---|---|
| Server data (fetched from API) | **TanStack Query** (React Query) | Listings, bookings, messages, KYC status |
| Global client UI state | **Zustand** | Auth user, active modal, mobile nav open/closed |
| Local component state | `useState` | Form step index, toggle states |
| URL-synced state | Search params (`useSearchParams` / `nuqs`) | Search filters, sort, pagination — makes filtered searches shareable/bookmarkable |

Since backend isn't built yet, start TanStack Query pointed at mock handlers (see §6) so the data-fetching pattern is already correct when the real API lands — you won't need to rewrite component logic later, only swap the fetch functions in `features/*/api/`.

---

## 5. Talking to a Backend That Doesn't Exist Yet

You said to ignore backend for now — but structure the frontend so backend integration is a swap, not a rewrite:

1. Define your API contracts in `features/*/types.ts` now, based on the PRD's modules (e.g., `Booking`, `Listing`, `KycStatus` types).
2. Put every fetch call behind a function in `features/*/api/` (e.g., `getListingById(id)`), never call `fetch` directly inside components.
3. Use **Next.js route handlers** (`app/api/mock/...`) or a tool like **MSW (Mock Service Worker)** to serve fake data matching those types, so you can build and test full flows (booking, KYC stepper) end-to-end with realistic data before NestJS exists.
4. When the real backend is ready, only `lib/api-client.ts` and the functions in `features/*/api/` change — components and hooks stay untouched.

---

## 6. Suggested Build Order (mapped to your PRD milestones + UX guide's order)

1. **Design system** — tokens, `components/ui` primitives, root layout, Navbar/Footer/MobileBottomNav.
2. **Public pages** — Landing, Search, Product Detail (money path starts here per your UX guide).
3. **Auth** — Sign Up, Login, OTP verification (mocked).
4. **Checkout** — booking widget, cost breakdown, deposit payment UI (mocked payment).
5. **KYC stepper** — multi-step, save-and-resume, progress indicator.
6. **Dashboard shell** — sidebar/topbar, role-aware nav.
7. **My Listings + Listing Stepper** — unlocks owner side.
8. **My Rentals + Booking status timeline + Extension request modal.**
9. **Messages, Notifications, Payments, Profile.**
10. **Admin panel** — lowest priority, build last.

---

## 7. A Few Things to Decide Before You Start Coding

- **Auth guard location:** `middleware.ts` (edge, redirects before render) vs. layout-level checks (`(dashboard)/layout.tsx` checking a server-side session). Middleware is faster to bounce unauthenticated users; layout checks are simpler to reason about. For this project, middleware for route-group-level gating + layout for role-specific checks (e.g., "is this user's KYC verified enough to list") is the cleanest split.
- **Forms:** `react-hook-form` + `zod` for KYC and Listing steppers — you'll want per-step validation and this pairing handles it cleanly.
- **Maps:** Google Maps needs a client component wrapper (`"use client"`) since it's inherently interactive — isolate it in `components/shared/MapPicker.tsx` so it doesn't force its parent page to become a client component too.

Want me to scaffold the actual folders and starter files (`tailwind.config.ts`, `components/ui/Button.tsx`, root layout, etc.) as real code next?
