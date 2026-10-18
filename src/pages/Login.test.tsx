import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from './Login';

/*
 * Regression tests for the premature-trial-paywall bug (P1-005):
 *
 * The old login handler routed every onboarded seller WITHOUT an
 * activePlan to /plan-required. Sellers inside their 7-day trial
 * have no activePlan yet, so mid-trial sellers (e.g. account created
 * Oct 13, login Oct 18) hit the paywall on day 5 of 7.
 *
 * The fix: login only enforces onboarding completion; billing access
 * is decided exclusively by ProtectedRoute via the authoritative
 * GET /api/billing/status.
 */

jest.mock('../utils/Validation', () => ({
  validateEmail: (value: string) => ({
    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email',
  }),
  validateLoginPassword: (value: string) => ({
    valid: value.length >= 8,
    message: 'Invalid password',
  }),
}));

jest.mock('../components/auth/AuthLayout', () => ({
  AuthLayout: ({ children }: any) => <div>{children}</div>,
}));

let mockLoginResult: any;

const mockUseAuthStore: any = (selector: any) =>
  selector({ login: (...args: any[]) => mockLoginResult.promise(...args) });

jest.mock('../stores/useAuthStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

const seller = (overrides: Record<string, unknown> = {}) => ({
  businessName: 'Aisha Threads',
  onboardedAt: '2026-10-13T10:00:00.000Z',
  // Mid-trial seller: has a valid trial but NO activePlan.
  trialPlan: 'starter',
  trialStartedAt: '2026-10-13T10:00:00.000Z',
  trialEndsAt: '2026-10-20T10:00:00.000Z',
  activePlan: null,
  ...overrides,
});

const makeUser = (sellerOverrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Aisha',
  email: 'aisha@example.com',
  role: 'SELLER',
  sellerId: 1,
  emailVerified: true,
  seller: seller(sellerOverrides),
});

const renderLoginAtEntry = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<div data-testid="workspace-dashboard" />}
        />
        <Route
          path="/onboarding"
          element={<div data-testid="onboarding-page" />}
        />
        <Route
          path="/plan-required"
          element={<div data-testid="plan-required-page" />}
        />
        <Route
          path="/verify-email"
          element={<div data-testid="verify-email-page" />}
        />
      </Routes>
    </MemoryRouter>
  );

const submitLoginForm = async () => {
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'aisha@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'Str0ng!pass' },
  });
  fireEvent.submit(screen.getByRole('button', { name: /log in/i }));

  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: /signing in/i })
    ).toBeNull()
  );
};

beforeEach(() => {
  mockLoginResult = { promise: () => Promise.resolve(makeUser()) };
});

describe('Login routing after authentication', () => {
  it('routes an onboarded, mid-trial seller WITHOUT an activePlan to the workspace, not the paywall', async () => {
    // Deterministic scenario: account created Oct 13, trial ends Oct 20,
    // logging in "Oct 18" — well inside the 7-day trial, no activePlan.
    mockLoginResult = {
      promise: () => Promise.resolve(makeUser()),
    };

    renderLoginAtEntry();
    await submitLoginForm();

    expect(screen.getByTestId('workspace-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-required-page')).toBeNull();
  });

  it('routes a paid seller (activePlan present) to the workspace', async () => {
    mockLoginResult = {
      promise: () =>
        Promise.resolve(
          makeUser({
            activePlan: 'starter',
            planStatus: 'ACTIVE',
          })
        ),
    };

    renderLoginAtEntry();
    await submitLoginForm();

    expect(screen.getByTestId('workspace-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-required-page')).toBeNull();
  });

  it('routes a seller who has not completed onboarding to onboarding', async () => {
    mockLoginResult = {
      promise: () =>
        Promise.resolve(makeUser({ onboardedAt: null, trialStartedAt: null, trialEndsAt: null })),
    };

    renderLoginAtEntry();
    await submitLoginForm();

    expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-required-page')).toBeNull();
    expect(screen.queryByTestId('workspace-dashboard')).toBeNull();
  });

  it('does not inspect billing fields for non-seller roles', async () => {
    mockLoginResult = {
      promise: () =>
        Promise.resolve({
          id: 2,
          name: 'Ops',
          email: 'ops@example.com',
          role: 'ADMIN',
          sellerId: null,
          emailVerified: true,
        }),
    };

    renderLoginAtEntry();
    await submitLoginForm();

    expect(screen.getByTestId('workspace-dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-required-page')).toBeNull();
  });

  it('still sends unverified accounts to the email-verification flow', async () => {
    mockLoginResult = {
      promise: () =>
        Promise.reject(
          Object.assign(new Error('verify email'), {
            code: 'EMAIL_NOT_VERIFIED',
          })
        ),
    };

    renderLoginAtEntry();
    await submitLoginForm();

    expect(screen.getByTestId('verify-email-page')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-required-page')).toBeNull();
  });
});
