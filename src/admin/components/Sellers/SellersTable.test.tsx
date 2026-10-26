import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SellersTable from './SellersTable';
import type { Seller } from '../../types';

/* ------------------------------------------------------------------
 * SellersTable — effective access column and SUPER_ADMIN gating
 *
 * Verifies that the Access column reflects the backend's effective
 * entitlement decision and that free-access management controls are
 * only rendered for users who can manage them (backend still
 * independently rejects non-SUPER_ADMIN requests with 403).
 * ------------------------------------------------------------------ */

const makeSeller = (overrides: Partial<Seller> = {}): Seller => ({
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

const defaultProps = {
  allSellersCount: 1,
  isLoading: false,
  selectedSellers: [] as Array<string | number>,
  selectedVisibleCount: 0,
  onToggle: jest.fn(),
  onSelectAll: jest.fn(),
  formatRevenue: (amount: number) => `₹${amount}`,
};

const renderTable = (
  sellers: Seller[],
  canManageFreeAccess: boolean,
  onManageFreeAccess = jest.fn()
) =>
  render(
    <MemoryRouter>
      <SellersTable
        {...defaultProps}
        sellers={sellers}
        canManageFreeAccess={canManageFreeAccess}
        onManageFreeAccess={onManageFreeAccess}
      />
    </MemoryRouter>
  );

describe('SellersTable Access column', () => {
  it('shows ADMIN-GRANTED · FREE for a seller with an active administrative grant', () => {
    renderTable(
      [
        makeSeller({
          plan: 'PRO',
          accessSource: 'admin_grant',
          adminGrant: { id: 9, plan: 'pro', expiresAt: null },
        }),
      ],
      false
    );

    expect(screen.getByText('ADMIN-GRANTED · FREE')).toBeInTheDocument();
  });

  it('shows the grant expiration date when the grant is time-limited', () => {
    renderTable(
      [
        makeSeller({
          accessSource: 'admin_grant',
          adminGrant: { id: 9, plan: 'pro', expiresAt: '2027-03-01T12:00:00.000Z' },
        }),
      ],
      false
    );

    expect(screen.getByText(/until /i)).toBeInTheDocument();
  });

  it('shows Paid subscription for paid access and Access required when there is no entitlement', () => {
    renderTable(
      [
        makeSeller({ plan: 'PRO', accessSource: 'paid' }),
        makeSeller({ plan: 'FREE', accessSource: null }),
      ],
      false
    );

    expect(screen.getByText('Paid subscription')).toBeInTheDocument();
    expect(screen.getByText('Access required')).toBeInTheDocument();
  });

  it('shows Trial active during the standard trial', () => {
    renderTable([makeSeller({ status: 'TRIALING', accessSource: 'trial', plan: 'STARTER' })], false);

    expect(screen.getByText('Trial active')).toBeInTheDocument();
  });

  it('labels suspended accounts regardless of grant state', () => {
    renderTable(
      [makeSeller({ status: 'SUSPENDED', accessSource: 'admin_grant', adminGrant: { id: 9, plan: 'pro', expiresAt: null } })],
      false
    );

    expect(screen.getByText('Suspended')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN-GRANTED · FREE')).not.toBeInTheDocument();
  });
});

describe('SellersTable free-access gating', () => {
  it('does not render free-access controls when the user cannot manage grants', () => {
    renderTable([makeSeller()], false);

    expect(
      screen.queryByRole('button', { name: /Manage free access/i })
    ).not.toBeInTheDocument();
  });

  it('renders and wires the free-access action for permitted users', () => {
    const onManageFreeAccess = jest.fn();
    const seller = makeSeller({ businessName: 'Acme' });
    renderTable([seller], true, onManageFreeAccess);

    const button = screen.getByRole('button', { name: /Manage free access for Acme/i });
    fireEvent.click(button);

    expect(onManageFreeAccess).toHaveBeenCalledWith(seller);
  });
});
