import React from 'react';
import { Gift, Settings2 } from 'lucide-react';
import type { AdminSeller } from '../../lib/adminApi';

/* ------------------------------------------------------------------
 * Free-access grants section (Subscriptions page)
 *
 * Administrative grants are NOT paid subscriptions: this section is
 * deliberately separate from the paid-subscriptions table so the
 * two entitlement kinds can never be confused.
 *
 * Data comes from the admin sellers list (accessSource / adminGrant
 * fields). Expiry display rules:
 * - expiresAt null  → "Indefinite" (never rendered as expired)
 * - future expiresAt → date; past expiresAt → "Expired" (the
 *   backend's server-time check stops granting access, so it is
 *   never rendered as active)
 * - a valid paid subscription always takes precedence over a grant
 * ------------------------------------------------------------------ */

interface FreeAccessGrantsSectionProps {
  sellers: AdminSeller[];
  isLoading: boolean;
  /** True only for SUPER_ADMIN users (backend still enforces 403). */
  canManageFreeAccess: boolean;
  /** Opens the shared FreeAccessModal to change or revoke a grant. */
  onManageGrant: (seller: AdminSeller) => void;
}

const isExpired = (expiresAt: string | null | undefined) =>
  !!expiresAt && new Date(expiresAt).getTime() <= Date.now();

export const FreeAccessGrantsSection: React.FC<FreeAccessGrantsSectionProps> = ({
  sellers,
  isLoading,
  canManageFreeAccess,
  onManageGrant,
}) => {
  const granted = sellers.filter((seller) => !!seller.adminGrant);

  return (
    <section
      className="subscriptions-grants"
      aria-label="Free-access grants"
      style={{
        background: '#fff',
        border: '1px solid #dfe7ef',
        borderRadius: 13,
        boxShadow: '0 2px 8px rgba(24,45,72,.035)',
        padding: '16px 18px',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <Gift size={16} color="#0d9488" />
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 750,
            color: '#17253a',
          }}
        >
          Free-access grants
        </h2>
        <span
          className="subscriptions-badge subscriptions-badge--trialing"
          style={{ marginLeft: 'auto' }}
        >
          {granted.length} active
        </span>
      </header>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#71829a' }}>
        Administrative grants provide a plan at no charge. They are not paid
        subscriptions and never appear in billing revenue.
      </p>

      {isLoading ? (
        <div style={{ padding: '18px 0', textAlign: 'center', color: '#91a1b3', fontSize: 13 }}>
          <div className="subscriptions-spinner" style={{ margin: '0 auto 10px' }} />
          Loading grants…
        </div>
      ) : granted.length === 0 ? (
        <div style={{ padding: '14px 0', textAlign: 'center', color: '#91a1b3', fontSize: 13 }}>
          No free-access grants.
          {canManageFreeAccess
            ? ' Use "Grant Free Access" to give a seller plan capabilities at no charge.'
            : ''}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {granted.map((seller) => {
            const grant = seller.adminGrant!;
            const expired = isExpired(grant.expiresAt);
            const paidTakesPrecedence = seller.accessSource === 'paid';

            return (
              <li
                key={seller.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  padding: '10px 0',
                  borderTop: '1px solid #eef2f7',
                }}
              >
                <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#263950',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {seller.businessName}
                  </div>
                  <div style={{ fontSize: 11, color: '#8a9aae' }}>
                    Seller ID: {seller.id}
                    {grant.reason ? ` · Reason: ${grant.reason}` : ''}
                  </div>
                </div>

                <span className={`subscriptions-plan subscriptions-plan--${grant.plan.toLowerCase()}`}>
                  {grant.plan}
                </span>

                {expired ? (
                  <span className="subscriptions-badge subscriptions-badge--cancelled">
                    Expired — grants no access
                  </span>
                ) : grant.expiresAt ? (
                  <span className="subscriptions-badge subscriptions-badge--active">
                    until {new Date(grant.expiresAt).toLocaleString('en-GB')}
                  </span>
                ) : (
                  <span className="subscriptions-badge subscriptions-badge--trialing">
                    Indefinite
                  </span>
                )}

                {paidTakesPrecedence && !expired && (
                  <span className="subscriptions-badge subscriptions-badge--active">
                    Paid subscription takes precedence
                  </span>
                )}

                {canManageFreeAccess && (
                  <button
                    type="button"
                    className="subscriptions-secondary-button subscriptions-primary-button--small"
                    onClick={() => onManageGrant(seller)}
                    aria-label={`Manage free access for ${seller.businessName}`}
                    style={{ flexShrink: 0 }}
                  >
                    <Settings2 size={13} /> Manage
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default FreeAccessGrantsSection;
