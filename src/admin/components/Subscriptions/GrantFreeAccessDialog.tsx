import React, { useEffect, useState } from 'react';
import { Search, Store, X } from 'lucide-react';
import {
  adminSellersApi,
  getApiErrorMessage,
  type AdminSeller,
} from '../../lib/adminApi';

/* ------------------------------------------------------------------
 * Grant Free Access dialog — seller selection step (SUPER_ADMIN)
 *
 * Reuses the existing admin sellers search API. Once a seller is
 * picked and confirmed, the parent opens the shared FreeAccessModal
 * for plan / duration / reason — no duplicated grant logic.
 *
 * The backend independently rejects grant calls with 403 for
 * ADMIN / SUPPORT users; hiding this dialog is a convenience only.
 * ------------------------------------------------------------------ */

interface GrantFreeAccessDialogProps {
  onClose: () => void;
  /** Called with the reviewed seller choice. */
  onSellerSelected: (seller: AdminSeller) => void;
}

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

const accessBadge = (seller: AdminSeller) => {
  if (seller.status === 'SUSPENDED' || seller.status === 'INACTIVE') {
    return <span className="subscriptions-badge subscriptions-badge--cancelled">{seller.status}</span>;
  }
  if (seller.adminGrant && seller.accessSource === 'admin_grant') {
    return <span className="subscriptions-badge subscriptions-badge--trialing">ADMIN-GRANTED · FREE</span>;
  }
  if (seller.accessSource === 'paid') {
    return <span className="subscriptions-badge subscriptions-badge--active">Paid subscription</span>;
  }
  if (seller.accessSource === 'trial' || seller.status === 'TRIALING') {
    return <span className="subscriptions-badge subscriptions-badge--trialing">Trial</span>;
  }
  return <span className="subscriptions-badge subscriptions-badge--cancelled">No plan access</span>;
};

export const GrantFreeAccessDialog: React.FC<GrantFreeAccessDialogProps> = ({
  onClose,
  onSellerSelected,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSeller[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = (search: string) => {
    setIsSearching(true);
    setError(null);
    adminSellersApi
      .list({ search: search.trim() || undefined, limit: 20 })
      .then((response) => {
        setResults(response.data);
        setSelectedId(null);
        setHasSearched(true);
        setIsSearching(false);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err));
        setIsSearching(false);
      });
  };

  // Initial list so the picker is immediately usable.
  useEffect(() => {
    runSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = results.find((seller) => seller.id === selectedId) ?? null;

  return (
    <div
      className="free-access-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Select a seller for free access"
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
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          width: '100%',
          maxWidth: 520,
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
              Grant free access
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
              Select the seller who should receive a plan at no charge.
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

        <form
          onSubmit={(event) => {
            event.preventDefault();
            runSearch(query);
          }}
          style={{ display: 'flex', gap: 8, marginBottom: 12 }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by business name, email or phone…"
            aria-label="Search sellers"
            style={inputStyle}
          />
          <button
            type="submit"
            className="subscriptions-secondary-button"
            disabled={isSearching}
            style={{ flexShrink: 0 }}
          >
            <Search size={14} /> Search
          </button>
        </form>

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
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          {isSearching ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              <div className="subscriptions-spinner" style={{ margin: '0 auto 10px' }} />
              Searching sellers…
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              <Store size={30} style={{ marginBottom: 8 }} />
              <div>
                {hasSearched
                  ? 'No sellers match your search.'
                  : 'No sellers found.'}
              </div>
            </div>
          ) : (
            <ul
              role="listbox"
              aria-label="Seller results"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {results.map((seller) => {
                const isSelected = seller.id === selectedId;
                return (
                  <li key={seller.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedId(seller.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        marginBottom: 6,
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? '#0d9488' : '#e2e8f0'}`,
                        background: isSelected ? '#f0fdfa' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>
                        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {seller.businessName}
                        </span>
                        <span style={{ display: 'block', fontSize: 12, color: '#64748b' }}>
                          {seller.email} · ID {seller.id}
                        </span>
                      </span>
                      {accessBadge(seller)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="subscriptions-secondary-button"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onSellerSelected(selected)}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: selected ? '#0d9488' : '#94a3b8',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: selected ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantFreeAccessDialog;
