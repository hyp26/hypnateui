import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlanRequired } from './PlanRequired';

/*
 * Regression tests for the premature-trial-paywall bug (P1-005):
 *
 * /plan-required used to ALWAYS claim "Your 7-day free trial has
 * ended", even when the seller's trial was still running or the
 * billing-status request had merely failed. The page now derives
 * its copy from the authoritative GET /api/billing/status response:
 *
 * - access.hasAccess === false → the backend CONFIRMED no access;
 *   only then is the trial-ended copy shown.
 * - access.hasAccess === true  → the seller has access (trial or
 *   paid); show the way back to the workspace.
 * - request failure / malformed response → a distinct
 *   verification-failure notice; NEVER presented as a confirmed
 *   trial expiry.
 *
 * No real clock is involved: the page itself computes no dates —
 * every decision comes from the mocked billing status, so the tests
 * are deterministic by construction.
 */

let mockStatus: () => Promise<any>;

jest.mock('../lib/billingApi', () => ({
  billingApi: {
    status: () => mockStatus(),
    createSubscription: jest.fn(),
    verifyPayment: jest.fn(),
  },
  __esModule: true,
}));

const mockUseAuthStore: any = (selector: any) =>
  selector({
    user: {
      id: 1,
      email: 'aisha@example.com',
      seller: { selectedPlan: 'starter', onboardedAt: '2026-10-13T10:00:00.000Z' },
    },
  });
mockUseAuthStore.getState = () => ({ loadProfile: jest.fn() });

jest.mock('../stores/useAuthStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

jest.mock('../config/planEntitlements', () => ({
  PLAN_OPTIONS: [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'For new sellers',
      features: ['Up to 50 products'],
      priceMonthly: 99,
      priceYearly: 999,
    },
  ],
  normalizePlan: (value: unknown) =>
    typeof value === 'string' && value ? value : null,
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => null,
  Check: () => null,
  CreditCard: () => null,
  Loader2: () => null,
  LockKeyhole: () => null,
  ShieldCheck: () => null,
}));

const renderPlanRequired = () =>
  render(
    <MemoryRouter>
      <PlanRequired />
    </MemoryRouter>
  );

describe('PlanRequired paywall messaging (authoritative billing status)', () => {
  beforeEach(() => {
    mockStatus = () => Promise.resolve({});
  });

  it('shows the trial-ended copy ONLY when the backend confirms access.hasAccess === false', async () => {
    mockStatus = () =>
      Promise.resolve({
        access: { hasAccess: false, source: null, status: 'NONE' },
        trialPlan: 'starter',
        trialEndsAt: '2026-10-11T10:00:00.000Z',
      });

    renderPlanRequired();

    await waitFor(() =>
      expect(screen.getByText(/7-day free trial has ended/i)).toBeInTheDocument()
    );
  });

  it('does NOT claim the trial ended when the seller still has trial access', async () => {
    // Backend confirms the seller is inside their trial window
    // (e.g. Oct 13 signup, Oct 18 login, trial ends Oct 20).
    mockStatus = () =>
      Promise.resolve({
        access: {
          hasAccess: true,
          source: 'trial',
          plan: 'starter',
          status: 'TRIALING',
          trialEndsAt: '2026-10-20T10:00:00.000Z',
        },
      });

    renderPlanRequired();

    await waitFor(() =>
      expect(
        screen.getByText(/workspace access is active/i)
      ).toBeInTheDocument()
    );

    expect(
      screen.queryByText(/7-day free trial has ended/i)
    ).toBeNull();
  });

  it('does NOT claim the trial ended for a seller with paid access', async () => {
    mockStatus = () =>
      Promise.resolve({
        access: {
          hasAccess: true,
          source: 'paid',
          plan: 'starter',
          status: 'ACTIVE',
        },
      });

    renderPlanRequired();

    await waitFor(() =>
      expect(
        screen.getByText(/workspace access is active/i)
      ).toBeInTheDocument()
    );

    expect(
      screen.queryByText(/7-day free trial has ended/i)
    ).toBeNull();
  });

  it('shows a distinct verification-failure notice when the billing status request fails — never a false trial expiry', async () => {
    mockStatus = () => Promise.reject(new Error('network down'));

    renderPlanRequired();

    await waitFor(() =>
      expect(
        screen.getByText(/couldn't verify your plan status/i)
      ).toBeInTheDocument()
    );

    expect(
      screen.queryByText(/7-day free trial has ended/i)
    ).toBeNull();
  });

  it('treats a malformed billing status (missing access object) as a verification failure, not a confirmed expiry', async () => {
    mockStatus = () => Promise.resolve({ unexpected: 'shape' });

    renderPlanRequired();

    await waitFor(() =>
      expect(
        screen.getByText(/couldn't verify your plan status/i)
      ).toBeInTheDocument()
    );

    expect(
      screen.queryByText(/7-day free trial has ended/i)
    ).toBeNull();
  });

  it('offers a retry when verification fails', async () => {
    mockStatus = () => Promise.reject(new Error('network down'));

    renderPlanRequired();

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /retry verification/i })
      ).toBeInTheDocument()
    );
  });

  it('keeps the pricing UI available regardless of the access state', async () => {
    mockStatus = () =>
      Promise.resolve({
        access: { hasAccess: false, source: null, status: 'NONE' },
      });

    renderPlanRequired();

    await waitFor(() =>
      expect(screen.getByText('Starter')).toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', { name: /Buy Starter/i })
    ).toBeInTheDocument();
  });
});
