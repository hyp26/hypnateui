# Hypnate Plan & Feature Mapping

## Purpose

Hypnate uses `Seller.selectedPlan` as the server-side entitlement source for the current pilot plan model. The same minimum-plan rules are now enforced in the frontend navigation/routes and backend APIs.

## Current mapping

| Capability | Starter | Pro | Business |
|---|:---:|:---:|:---:|
| Core commerce workspace | Yes | Yes | Yes |
| Products / inventory | Yes | Yes | Yes |
| Orders | Yes | Yes | Yes |
| Customers | Yes | Yes | Yes |
| Conversations / channel connections | Yes | Yes | Yes |
| Catalog AI assistance | Yes | Yes | Yes |
| Payment tracking | Yes | Yes | Yes |
| Advanced analytics | No | Yes | Yes |
| Payment-link generation | No | Yes | Yes |
| Hypnate X website builder | No | No | Yes |

## Frontend enforcement

- A seller must have a valid selected plan before entering the authenticated application.
- Starter accounts can access the core commerce workspace.
- Analytics is gated to Pro and Business.
- Payment-link generation is gated to Pro and Business.
- Hypnate X is gated to Business.
- Locked navigation items remain discoverable and open the plan gate instead of silently failing.
- Payment tracking remains available to Starter accounts; only payment-link generation is gated.
- Existing sellers with no plan are redirected to onboarding to select one.

## Backend enforcement

The backend has the same entitlement rules through `requirePlanFeature()`:

- Core seller APIs require `commerceWorkspace` (Starter+).
- Analytics overview/export require `advancedAnalytics` (Pro+).
- Payment-link creation requires `paymentLinks` (Pro+).
- Hypnate X build/status/store APIs require `hypnateX` (Business).
- Admin users bypass merchant plan checks.
- A missing plan returns `403 PLAN_REQUIRED`.
- An insufficient plan returns `403 PLAN_UPGRADE_REQUIRED`.

## Signup and onboarding

- Signup requires `starter`, `pro`, or `business`.
- Pricing CTAs pass `?plan=starter|pro|business` into signup.
- Backend persists the selected plan on `Seller`.
- Onboarding carries the selected plan into the authenticated seller record.
- Existing planless sellers receive a plan-selection step in onboarding.

## Important billing note

`selectedPlan` is an entitlement selection for the current pilot implementation. The supplied backend does not yet contain a SaaS subscription/checkout state, so selecting a plan is not the same thing as completing a Hypnate subscription payment.

The plan model should be connected to the eventual subscription/billing system before plan status is treated as paid or active billing status.
