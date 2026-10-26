import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  adminFreeAccessApi,
  getApiErrorMessage,
  type AdminSellerGrant,
  type FreeAccessPayload,
} from '../../lib/adminApi';

/* ------------------------------------------------------------------
 * Grant Free Access modal (SUPER_ADMIN only)
 *
 * Lets a Super Admin provide any plan's capabilities to a seller
 * for free — including after the 7-day trial has expired. The
 * grant is NOT a paid subscription: the backend keeps billing
 * fields and Razorpay records untouched.
 *
 * The backend independently rejects these calls with 403 for
 * ADMIN / SUPPORT users. The caller must hide this modal for
 * those roles (UI convenience only).
 * ------------------------------------------------------------------ */

const PLAN_OPTIONS: Array<{ value: 'starter' | 'pro' | 'business'; label: string }> = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'business', label: 'Business' },
];

/**
 * Structural seller info the modal needs. This matches both the admin
 * panel's Seller rows and the API client's AdminSeller shape without
 * coupling the two type hierarchies.
 */
interface FreeAccessSellerInfo {
  id: string | number;
  businessName: string;
  adminGrant?: AdminSellerGrant | null;
}

interface FreeAccessModalProps {
  seller: FreeAccessSellerInfo;
  onClose: () => void;
  /** Called after a successful grant, change or revocation. */
  onSuccess: () => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: 13,
  color: '#0f172a',
  background: '#fff',
  boxSizing: 'border-box',
};

export const FreeAccessModal: React.FC<FreeAccessModalProps> = ({
  seller,
  onClose,
  onSuccess,
}) => {
  const activeGrant = seller.adminGrant ?? null;

  const [plan, setPlan] = useState<'starter' | 'pro' | 'business'>(
    (activeGrant?.plan as 'starter' | 'pro' | 'business') ?? 'starter'
  );
  const [duration, setDuration] = useState<'indefinite' | 'expires'>(
    activeGrant?.expiresAt ? 'expires' : 'indefinite'
  );
  const [expiresAt, setExpiresAt] = useState(
    activeGrant?.expiresAt ? activeGrant.expiresAt.slice(0, 16) : ''
  );
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiryDate = useMemo(() => {
    if (duration !== 'expires' || !expiresAt) return null;
    const date = new Date(expiresAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [duration, expiresAt]);

  const validationError = useMemo(() => {
    if (!reason.trim()) return 'A reason is required.';
    if (reason.trim().length > 1000) return 'Reason must be 1000 characters or fewer.';
    if (duration === 'expires') {
      if (!expiryDate) return 'Provide a valid expiration date and time.';
      if (expiryDate.getTime() <= Date.now()) return 'Expiration must be in the future.';
    }
    if (!confirmed) {
      return 'Confirm that you understand this grants free access.';
    }
    return null;
  }, [reason, duration, expiresAt, expiryDate, confirmed]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: FreeAccessPayload = {
      plan,
      reason: reason.trim(),
    };

    if (duration === 'expires' && expiryDate) {
      payload.expiresAt = expiryDate.toISOString();
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (activeGrant) {
        // Change plan / expiration. expiresAt is always sent:
        // a valid timestamp sets it, null makes the grant indefinite.
        await adminFreeAccessApi.update(seller.id, {
          plan: payload.plan,
          expiresAt: payload.expiresAt ?? undefined,
          reason: payload.reason,
        });
      } else {
        await adminFreeAccessApi.grant(seller.id, payload);
      }
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const revoke = async () => {
    if (!activeGrant) return;
    if (!reason.trim()) {
      setError('A reason is required to revoke free access.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await adminFreeAccessApi.revoke(seller.id, reason.trim());
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="free-access-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Grant free access"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        aria-label={
          activeGrant ? 'Change free access grant' : 'Grant free access'
        }
        style={{
          background: '#fff',
          borderRadius: 14,
          width: '100%',
          maxWidth: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 22,
          boxShadow: '0 20px 50px rgba(15,23,42,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 14,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>
              {activeGrant ? 'Change free access' : 'Grant free access'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
              {seller.businessName} · ID {seller.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {activeGrant && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            ADMIN-GRANTED · FREE — current grant: {activeGrant.plan}
            {activeGrant.expiresAt
              ? ` until ${new Date(activeGrant.expiresAt).toLocaleString()}`
              : ' (indefinite until revoked)'}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="free-access-plan" style={labelStyle}>
            Plan
          </label>
          <select
            id="free-access-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as 'starter' | 'pro' | 'business')}
            style={inputStyle}
            disabled={isSubmitting}
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <span style={labelStyle}>Duration</span>
          <label
            style={{ display: 'block', fontSize: 13, color: '#0f172a', marginBottom: 6 }}
          >
            <input
              type="radio"
              name="free-access-duration"
              value="indefinite"
              checked={duration === 'indefinite'}
              onChange={() => setDuration('indefinite')}
              disabled={isSubmitting}
            />{' '}
            Indefinite, until revoked
          </label>
          <label
            style={{ display: 'block', fontSize: 13, color: '#0f172a', marginBottom: 6 }}
          >
            <input
              type="radio"
              name="free-access-duration"
              value="expires"
              checked={duration === 'expires'}
              onChange={() => setDuration('expires')}
              disabled={isSubmitting}
            />{' '}
            Expires at a specific date and time
          </label>
          {duration === 'expires' && (
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={inputStyle}
              disabled={isSubmitting}
              aria-label="Grant expiration"
            />
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="free-access-reason" style={labelStyle}>
            Reason (required, audited)
          </label>
          <textarea
            id="free-access-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Explain why free access is being granted…"
            style={{ ...inputStyle, resize: 'vertical' }}
            disabled={isSubmitting}
          />
        </div>

        <label
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            fontSize: 12,
            color: '#475569',
            marginBottom: 14,
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={isSubmitting}
            style={{ marginTop: 2 }}
          />
          <span>
            I confirm that the <strong>{plan}</strong> plan will be provided at{' '}
            <strong>no charge</strong>. This does <strong>not</strong> create a paid
            subscription and will not be billed.
          </span>
        </label>

        {error && (
          <div
            role="alert"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {activeGrant && (
            <button
              type="button"
              onClick={revoke}
              disabled={isSubmitting}
              style={{
                marginRight: 'auto',
                padding: '9px 14px',
                borderRadius: 8,
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Revoke free access
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#0f172a',
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#0d9488',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting
              ? 'Saving…'
              : activeGrant
                ? 'Save changes'
                : 'Grant free access'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FreeAccessModal;
