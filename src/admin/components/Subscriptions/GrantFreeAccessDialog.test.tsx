import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GrantFreeAccessDialog from './GrantFreeAccessDialog';
import type { AdminSeller } from '../../lib/adminApi';

/* ------------------------------------------------------------------
 * GrantFreeAccessDialog — seller selection step of the Subscriptions
 * "Grant Free Access" flow. Verifies search via the existing admin
 * sellers API, selection/review, loading and error states.
 * ------------------------------------------------------------------ */

jest.mock('../../lib/adminApi', () => ({
  ...jest.requireActual('../../lib/adminApi'),
  adminSellersApi: {
    list: jest.fn(),
  },
  getApiErrorMessage: (error: unknown) =>
    (error as { message?: string }).message ?? 'Request failed. Please try again.',
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { adminSellersApi } = require('../../lib/adminApi') as {
  adminSellersApi: { list: jest.Mock };
};

const makeSeller = (overrides: Partial<AdminSeller> = {}): AdminSeller => ({
  id: 1,
  email: 'seller@example.com',
  businessName: 'Test Store',
  firstName: 'Test',
  lastName: 'Seller',
  status: 'ACTIVE',
  plan: 'FREE',
  totalRevenue: 0,
  totalOrders: 0,
  totalProducts: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const sellersPage = (data: AdminSeller[]) => ({ data, total: data.length, page: 1, limit: 20, totalPages: 1 });

describe('GrantFreeAccessDialog seller search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads sellers on mount and searches by query on submit', async () => {
    adminSellersApi.list.mockResolvedValue(sellersPage([makeSeller()]));
    render(<GrantFreeAccessDialog onClose={jest.fn()} onSellerSelected={jest.fn()} />);

    await waitFor(() => expect(adminSellersApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20 })
    ));

    fireEvent.change(screen.getByLabelText('Search sellers'), {
      target: { value: 'acme' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() =>
      expect(adminSellersApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'acme', limit: 20 })
      )
    );
  });

  it('renders results with their effective access state', async () => {
    adminSellersApi.list.mockResolvedValue(
      sellersPage([
        makeSeller({ id: 1, businessName: 'Acme', adminGrant: { id: 9, plan: 'pro', expiresAt: null }, accessSource: 'admin_grant' }),
        makeSeller({ id: 2, businessName: 'Paid Co', accessSource: 'paid' }),
        makeSeller({ id: 3, businessName: 'Trial Co', status: 'TRIALING', accessSource: 'trial' }),
      ])
    );
    render(<GrantFreeAccessDialog onClose={jest.fn()} onSellerSelected={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    expect(screen.getByText('ADMIN-GRANTED · FREE')).toBeInTheDocument();
    expect(screen.getByText('Paid subscription')).toBeInTheDocument();
    expect(screen.getByText('Trial')).toBeInTheDocument();
  });

  it('enables Continue only after a seller is selected and passes the choice for review', async () => {
    const onSellerSelected = jest.fn();
    adminSellersApi.list.mockResolvedValue(sellersPage([makeSeller({ id: 5, businessName: 'Acme' })]));
    render(<GrantFreeAccessDialog onClose={jest.fn()} onSellerSelected={onSellerSelected} />);

    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument());
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole('option', { name: /Acme/ }));
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    expect(onSellerSelected).toHaveBeenCalledTimes(1);
    expect(onSellerSelected.mock.calls[0][0]).toMatchObject({ id: 5, businessName: 'Acme' });
  });

  it('shows an empty state when no sellers match', async () => {
    adminSellersApi.list.mockResolvedValue(sellersPage([]));
    render(<GrantFreeAccessDialog onClose={jest.fn()} onSellerSelected={jest.fn()} />);

    await waitFor(() => expect(screen.getByText(/No sellers match your search/i)).toBeInTheDocument());
  });

  it('surfaces search API failures', async () => {
    adminSellersApi.list.mockRejectedValue({ message: 'Seller search failed' });
    render(<GrantFreeAccessDialog onClose={jest.fn()} onSellerSelected={jest.fn()} />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Seller search failed/i));
  });
});
