import React from 'react';
import { render, screen } from '@testing-library/react';
import FreeAccessGrantsSection from './FreeAccessGrantsSection';
import type { AdminSeller } from '../../lib/adminApi';

/* ------------------------------------------------------------------
 * FreeAccessGrantsSection — the grant-management section of the
 * Subscriptions page. Verifies that paid subscriptions, trials and
 * administrative grants are clearly distinguished, and that an
 * indefinite grant is never rendered as expired (and vice versa).
 * ------------------------------------------------------------------ */

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

describe('FreeAccessGrantsSection grant states', () => {
  it('renders an indefinite grant as Indefinite — never as expired', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[
          makeSeller({
            adminGrant: { id: 9, plan: 'pro', expiresAt: null },
            accessSource: 'admin_grant',
          }),
        ]}
        isLoading={false}
        canManageFreeAccess={false}
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.getByText('Indefinite')).toBeInTheDocument();
    expect(screen.queryByText(/expired/i)).not.toBeInTheDocument();
  });

  it('renders a future expiry with its date', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[
          makeSeller({
            adminGrant: { id: 9, plan: 'starter', expiresAt: '2031-03-01T12:00:00.000Z' },
            accessSource: 'admin_grant',
          }),
        ]}
        isLoading={false}
        canManageFreeAccess={false}
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.getByText(/until /i)).toBeInTheDocument();
    expect(screen.queryByText('Indefinite')).not.toBeInTheDocument();
  });

  it('renders an expired grant as expired — never as active', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[
          makeSeller({
            adminGrant: { id: 9, plan: 'starter', expiresAt: '2020-03-01T12:00:00.000Z' },
            accessSource: null,
          }),
        ]}
        isLoading={false}
        canManageFreeAccess={false}
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.getByText(/Expired — grants no access/i)).toBeInTheDocument();
    expect(screen.queryByText('Indefinite')).not.toBeInTheDocument();
  });

  it('notes that a valid paid subscription takes precedence over a grant', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[
          makeSeller({
            adminGrant: { id: 9, plan: 'starter', expiresAt: null },
            accessSource: 'paid',
          }),
        ]}
        isLoading={false}
        canManageFreeAccess={false}
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.getByText(/Paid subscription takes precedence/i)).toBeInTheDocument();
  });

  it('shows an empty state when there are no grants', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[makeSeller({ accessSource: 'paid' })]}
        isLoading={false}
        canManageFreeAccess
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.getByText(/No free-access grants/i)).toBeInTheDocument();
    expect(screen.getByText(/Grant Free Access/i)).toBeInTheDocument();
  });

  it('excludes sellers without grants (paid/trial only) from the grant list', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[
          makeSeller({ id: 1, accessSource: 'paid' }),
          makeSeller({
            id: 2,
            adminGrant: { id: 9, plan: 'pro', expiresAt: null },
            accessSource: 'admin_grant',
          }),
        ]}
        isLoading={false}
        canManageFreeAccess={false}
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.getByText('1 active')).toBeInTheDocument();
    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });
});

describe('FreeAccessGrantsSection gating', () => {
  it('does not render Manage controls for users who cannot manage grants', () => {
    render(
      <FreeAccessGrantsSection
        sellers={[
          makeSeller({
            adminGrant: { id: 9, plan: 'pro', expiresAt: null },
            accessSource: 'admin_grant',
          }),
        ]}
        isLoading={false}
        canManageFreeAccess={false}
        onManageGrant={jest.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Manage free access/i })).not.toBeInTheDocument();
  });

  it('wires the Manage action for permitted users', () => {
    const onManageGrant = jest.fn();
    const seller = makeSeller({
      adminGrant: { id: 9, plan: 'pro', expiresAt: null },
      accessSource: 'admin_grant',
    });
    render(
      <FreeAccessGrantsSection
        sellers={[seller]}
        isLoading={false}
        canManageFreeAccess
        onManageGrant={onManageGrant}
      />
    );

    screen.getByRole('button', { name: /Manage free access/i }).click();
    expect(onManageGrant).toHaveBeenCalledWith(seller);
  });
});
