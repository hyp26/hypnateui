import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FreeAccessModal from './FreeAccessModal';

/* ------------------------------------------------------------------
 * FreeAccessModal (SUPER_ADMIN free-access grants)
 *
 * Verifies the client-side validation, the grant/update/revoke API
 * calls with the right payload (including PATCH expiration
 * semantics: null = indefinite, ISO string = new expiry), the
 * review summary, and the two-step revocation confirmation.
 * The backend independently enforces SUPER_ADMIN authorization.
 * ------------------------------------------------------------------ */

jest.mock('../../lib/adminApi', () => {
  const actual = jest.requireActual('../../lib/adminApi');
  return {
    ...actual,
    adminFreeAccessApi: {
      grant: jest.fn(),
      update: jest.fn(),
      revoke: jest.fn(),
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { adminFreeAccessApi } = require('../../lib/adminApi') as {
  adminFreeAccessApi: {
    grant: jest.Mock;
    update: jest.Mock;
    revoke: jest.Mock;
  };
};

const baseSeller = {
  id: 42,
  businessName: 'Test Store',
};

const renderModal = (sellerOverrides: Record<string, unknown> = {}) =>
  render(
    <FreeAccessModal
      seller={{ ...baseSeller, ...sellerOverrides }}
      onClose={jest.fn()}
      onSuccess={jest.fn()}
    />
  );

const fillReason = (text: string) => {
  fireEvent.change(screen.getByLabelText(/Reason \(required, audited\)/), {
    target: { value: text },
  });
};

const confirmFreeOfCharge = () => {
  fireEvent.click(screen.getByRole('checkbox'));
};

describe('FreeAccessModal validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks submission without a reason', () => {
    renderModal();
    confirmFreeOfCharge();

    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/reason is required/i);
    expect(adminFreeAccessApi.grant).not.toHaveBeenCalled();
  });

  it('blocks submission until the free-of-charge confirmation is checked', () => {
    renderModal();
    fillReason('Goodwill after incident');

    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/confirm that you understand/i);
    expect(adminFreeAccessApi.grant).not.toHaveBeenCalled();
  });

  it('blocks an expiration date in the past', () => {
    renderModal();
    fillReason('Goodwill after incident');
    confirmFreeOfCharge();
    fireEvent.click(screen.getByLabelText(/Expires at a specific date and time/));
    fireEvent.change(screen.getByLabelText('Grant expiration'), {
      target: { value: '2020-01-01T10:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/expiration must be in the future/i);
    expect(adminFreeAccessApi.grant).not.toHaveBeenCalled();
  });

  it('shows a review summary of the exact grant that will be submitted', () => {
    renderModal();

    const review = screen.getByLabelText('Review grant details');
    expect(review).toHaveTextContent('Test Store');
    expect(review).toHaveTextContent('ID 42');
    expect(review).toHaveTextContent(/indefinite until revoked/i);
  });
});

describe('FreeAccessModal submissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('grants indefinite free access with the selected plan', async () => {
    const onSuccess = jest.fn();
    render(
      <FreeAccessModal seller={{ ...baseSeller }} onClose={jest.fn()} onSuccess={onSuccess} />
    );

    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'pro' } });
    fireEvent.click(screen.getByLabelText(/Indefinite, until revoked/));
    fillReason('Marketing partnership');
    confirmFreeOfCharge();

    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(adminFreeAccessApi.grant).toHaveBeenCalledTimes(1);
    expect(adminFreeAccessApi.grant).toHaveBeenCalledWith(42, {
      plan: 'pro',
      reason: 'Marketing partnership',
    });
    // An indefinite grant must not send an expiresAt.
    const payload = adminFreeAccessApi.grant.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.expiresAt).toBeUndefined();
  });

  it('sends an ISO expiresAt when granting time-limited access', async () => {
    const onSuccess = jest.fn();
    adminFreeAccessApi.grant.mockResolvedValue({});
    render(
      <FreeAccessModal seller={{ ...baseSeller }} onClose={jest.fn()} onSuccess={onSuccess} />
    );

    fillReason('Q4 promotion');
    confirmFreeOfCharge();
    fireEvent.click(screen.getByLabelText(/Expires at a specific date and time/));
    fireEvent.change(screen.getByLabelText('Grant expiration'), {
      target: { value: '2031-01-15T09:30' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const payload = adminFreeAccessApi.grant.mock.calls[0][1] as {
      expiresAt?: string;
    };
    expect(payload.expiresAt).toEqual(new Date('2031-01-15T09:30').toISOString());
  });

  it('updates an existing grant instead of creating a duplicate', async () => {
    adminFreeAccessApi.update.mockResolvedValue({});
    renderModal({
      adminGrant: { id: 7, plan: 'starter', expiresAt: null, reason: 'initial' },
    });

    expect(screen.getByText(/ADMIN-GRANTED · FREE/)).toBeInTheDocument();
    fillReason('Extend to Pro');
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'pro' } });
    confirmFreeOfCharge();

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(adminFreeAccessApi.update).toHaveBeenCalledTimes(1));
    expect(adminFreeAccessApi.update).toHaveBeenCalledWith(42, {
      plan: 'pro',
      // "Indefinite" was explicitly chosen: null clears the expiry.
      expiresAt: null,
      reason: 'Extend to Pro',
    });
    expect(adminFreeAccessApi.grant).not.toHaveBeenCalled();
  });

  it('keeps an existing dated grant expiring when the date is unchanged', async () => {
    const existingExpiry = '2031-06-01T12:00:00.000Z';
    adminFreeAccessApi.update.mockResolvedValue({});
    renderModal({
      adminGrant: { id: 7, plan: 'pro', expiresAt: existingExpiry, reason: 'initial' },
    });

    fillReason('Renew justification');
    confirmFreeOfCharge();

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(adminFreeAccessApi.update).toHaveBeenCalledTimes(1));
    const payload = adminFreeAccessApi.update.mock.calls[0][1] as {
      expiresAt?: string | null;
    };
    // The form was pre-filled with the existing expiry: the same
    // instant must be sent, not null and not a stale value.
    expect(payload.expiresAt).toEqual(new Date('2031-06-01T12:00').toISOString());
  });

  it('requires a confirmation step before revoking', async () => {
    const onSuccess = jest.fn();
    adminFreeAccessApi.revoke.mockResolvedValue({});
    render(
      <FreeAccessModal
        seller={{
          ...baseSeller,
          adminGrant: { id: 7, plan: 'starter', expiresAt: null, reason: 'initial' },
        }}
        onClose={jest.fn()}
        onSuccess={onSuccess}
      />
    );

    fillReason('No longer eligible');

    // First click arms the confirmation; nothing is revoked yet.
    fireEvent.click(screen.getByRole('button', { name: 'Revoke free access' }));
    expect(screen.getByRole('alertdialog', { name: 'Confirm revocation' })).toBeInTheDocument();
    expect(adminFreeAccessApi.revoke).not.toHaveBeenCalled();

    // Confirm the explicit second step.
    fireEvent.click(screen.getByRole('button', { name: 'Yes, revoke now' }));

    await waitFor(() => expect(adminFreeAccessApi.revoke).toHaveBeenCalledWith(42, 'No longer eligible'));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('blocks revocation without a reason', () => {
    renderModal({
      adminGrant: { id: 7, plan: 'starter', expiresAt: null, reason: 'initial' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Revoke free access' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/reason is required/i);
    expect(adminFreeAccessApi.revoke).not.toHaveBeenCalled();
  });

  it('shows the API error message when the backend rejects the request', async () => {
    adminFreeAccessApi.grant.mockRejectedValue({
      response: { data: { message: 'Only a Super Admin may grant free access.' } },
    });
    renderModal();

    fillReason('Try anyway');
    confirmFreeOfCharge();
    fireEvent.click(screen.getByRole('button', { name: 'Grant free access' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Only a Super Admin/i)
    );
  });
});
