import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Subscriptions from './Subscriptions';

/* ------------------------------------------------------------------
 * Subscriptions page — SUPER_ADMIN "Grant Free Access" integration
 *
 * Verifies that the action is visible only to SUPER_ADMIN users,
 * that the seller picker → grant modal flow works end to end
 * against the (mocked) real API client, and that displayed data is
 * refreshed after a successful grant.
 *
 * The backend independently rejects grant/revoke calls from
 * ADMIN / SUPPORT users with 403; hiding the button is a UI
 * convenience only.
 * ------------------------------------------------------------------ */

jest.mock('../stores/useAdminStore', () => {
  // State lives in the factory closure so the factory never
  // references an uninitialized test-file variable.
  const state = { adminUser: null as { role: string } | null };
  return {
    __setMockAdminUser: (user: { role: string } | null) => {
      state.adminUser = user;
    },
    useAdminStore: (
      selector: (state: { adminUser: { role: string } | null }) => unknown
    ) => selector(state),
  };
});

jest.mock('../lib/adminApi', () => ({
  ...jest.requireActual('../lib/adminApi'),
  adminSubscriptionsApi: { list: jest.fn() },
  adminSellersApi: { list: jest.fn() },
  adminFreeAccessApi: {
    grant: jest.fn(),
    update: jest.fn(),
    revoke: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __setMockAdminUser } = require('../stores/useAdminStore') as {
  __setMockAdminUser: (user: { role: string } | null) => void;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { adminSubscriptionsApi, adminSellersApi, adminFreeAccessApi } = require('../lib/adminApi') as {
  adminSubscriptionsApi: { list: jest.Mock };
  adminSellersApi: { list: jest.Mock };
  adminFreeAccessApi: { grant: jest.Mock; update: jest.Mock; revoke: jest.Mock };
};

const subscriptionPage = { data: [], page: 1, limit: 100, total: 0, totalPages: 0 };
const grantedSeller = {
  id: 5,
  email: 'acme@example.com',
  businessName: 'Acme',
  firstName: 'A',
  lastName: 'C',
  status: 'ACTIVE',
  plan: 'pro',
  accessSource: null,
  adminGrant: null,
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const sellersPage = (data: unknown[]) => ({
  data,
  page: 1,
  limit: 100,
  total: data.length,
  totalPages: 1,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <Subscriptions />
    </MemoryRouter>
  );

describe('Subscriptions page free-access gating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    adminSubscriptionsApi.list.mockResolvedValue(subscriptionPage);
    adminSellersApi.list.mockResolvedValue(sellersPage([]));
  });

  it('shows the Grant Free Access action to a SUPER_ADMIN', async () => {
    __setMockAdminUser({ role: 'SUPER_ADMIN' });
    renderPage();

    expect(
      screen.getByRole('button', { name: /Grant free access to a seller/i })
    ).toBeInTheDocument();
    await waitFor(() => expect(adminSubscriptionsApi.list).toHaveBeenCalled());
  });

  it('hides the Grant Free Access action from ADMIN and SUPPORT users', async () => {
    __setMockAdminUser({ role: 'ADMIN' });
    renderPage();

    expect(
      screen.queryByRole('button', { name: /Grant free access to a seller/i })
    ).not.toBeInTheDocument();
    await waitFor(() => expect(adminSubscriptionsApi.list).toHaveBeenCalled());
  });

  it('does not render Manage controls in the grants section for non-SUPER_ADMIN users', async () => {
    __setMockAdminUser({ role: 'ADMIN' });
    adminSellersApi.list.mockResolvedValue(
      sellersPage([
        {
          ...grantedSeller,
          adminGrant: { id: 9, plan: 'pro', expiresAt: null },
          accessSource: 'admin_grant',
        },
      ])
    );
    renderPage();

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Manage free access/i })).not.toBeInTheDocument();
  });
});

describe('Subscriptions page grant workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __setMockAdminUser({ role: 'SUPER_ADMIN' });
    adminSubscriptionsApi.list.mockResolvedValue(subscriptionPage);
    adminSellersApi.list.mockResolvedValue(sellersPage([grantedSeller]));
    adminFreeAccessApi.grant.mockResolvedValue({});
  });

  it('opens the seller picker from the Grant Free Access action', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Grant free access to a seller/i }));

    await waitFor(() =>
      expect(screen.getByLabelText('Select a seller for free access')).toBeInTheDocument()
    );
  });

  it('completes seller selection → grant → refresh end to end', async () => {
    renderPage();

    await waitFor(() => expect(adminSellersApi.list).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Grant free access to a seller/i }));
    await waitFor(() => expect(screen.getByRole('option', { name: /Acme/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('option', { name: /Acme/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // The shared FreeAccessModal opens for the selected seller.
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Grant free access' })).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText(/Reason \(required, audited\)/), {
      target: { value: 'Goodwill grant' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    await waitFor(() =>
      expect(adminFreeAccessApi.grant).toHaveBeenCalledWith(5, {
        plan: 'starter',
        reason: 'Goodwill grant',
      })
    );

    // The picker searched on open, so sellers were listed twice
    // before the grant; both the grants section and the
    // subscriptions view refresh once more after success.
    await waitFor(() => expect(adminSellersApi.list).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(adminSubscriptionsApi.list).toHaveBeenCalledTimes(2));
    // The modal is closed after success.
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Grant free access' })).not.toBeInTheDocument()
    );
  });
});
