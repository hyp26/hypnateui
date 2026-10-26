import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FreeAccessModal from './FreeAccessModal';

/* ------------------------------------------------------------------
 * FreeAccessModal (SUPER_ADMIN free-access grants)
 *
 * Verifies the client-side validation and that the correct API
 * call (grant / update / revoke) is made with the right payload.
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
      // Sending null keeps the grant indefinite.
      expiresAt: null,
      reason: 'Extend to Pro',
    });
    expect(adminFreeAccessApi.grant).not.toHaveBeenCalled();
  });

  it('revokes an existing grant with a reason', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Revoke free access' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/reason is required/i);
    expect(adminFreeAccessApi.revoke).not.toHaveBeenCalled();

    fillReason('No longer eligible');
    fireEvent.click(screen.getByRole('button', { name: 'Revoke free access' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(adminFreeAccessApi.revoke).toHaveBeenCalledWith(42, 'No longer eligible');
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
