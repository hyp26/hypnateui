import React from 'react';
import { Gift, MoreVertical, Plus, Store, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Seller } from '../../types';

interface SellersTableProps {
  sellers: Seller[];
  allSellersCount: number;
  isLoading: boolean;
  selectedSellers: Array<string | number>;
  selectedVisibleCount: number;
  onToggle: (id: string | number) => void;
  onSelectAll: () => void;
  formatRevenue: (amount: number) => string;
  /** True only for SUPER_ADMIN users (backend still enforces 403). */
  canManageFreeAccess: boolean;
  /** Opens the Grant/Change Free Access modal for a seller. */
  onManageFreeAccess: (seller: Seller) => void;
}

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'sellers-badge sellers-badge--active';
    case 'inactive': return 'sellers-badge sellers-badge--inactive';
    case 'suspended': return 'sellers-badge sellers-badge--suspended';
    case 'trialing': return 'sellers-badge sellers-badge--trialing';
    default: return 'sellers-badge sellers-badge--inactive';
  }
};

const getPlanClass = (plan: string) => {
  switch (plan.toLowerCase()) {
    case 'starter': return 'sellers-plan sellers-plan--starter';
    case 'pro': return 'sellers-plan sellers-plan--pro';
    case 'business': return 'sellers-plan sellers-plan--business';
    default: return 'sellers-plan';
  }
};

/**
 * Effective access state for the Access column.
 * Mirrors the backend's getPlanAccess decision, which is the
 * single source of truth shared with billing-status and the
 * seller-facing plan guards.
 */
const getAccessState = (seller: Seller) => {
  if (seller.status === 'SUSPENDED' || seller.status === 'INACTIVE') {
    return { label: seller.status === 'SUSPENDED' ? 'Suspended' : 'Inactive', className: 'sellers-badge sellers-badge--inactive' };
  }
  if (seller.adminGrant && seller.accessSource === 'admin_grant') {
    return { label: 'ADMIN-GRANTED · FREE', className: 'sellers-badge sellers-badge--trialing' };
  }
  if (seller.accessSource === 'paid') {
    return { label: 'Paid subscription', className: 'sellers-badge sellers-badge--active' };
  }
  if (seller.accessSource === 'trial' || seller.status === 'TRIALING') {
    return { label: 'Trial active', className: 'sellers-badge sellers-badge--trialing' };
  }
  return { label: 'Access required', className: 'sellers-badge sellers-badge--inactive' };
};

const SellersTable: React.FC<SellersTableProps> = ({
  sellers,
  isLoading,
  selectedSellers,
  selectedVisibleCount,
  onToggle,
  onSelectAll,
  formatRevenue,
  canManageFreeAccess,
  onManageFreeAccess,
}) => {
  const allVisibleSelected = sellers.length > 0 && selectedVisibleCount === sellers.length;

  return (
    <section className="sellers-table-card">
      {isLoading ? (
        <div className="sellers-empty-state">
          <div className="sellers-spinner" />
          <span>Loading sellers...</span>
        </div>
      ) : sellers.length === 0 ? (
        <div className="sellers-empty-state">
          <Store size={48} />
          <h3>No sellers found</h3>
          <p>Try adjusting your filters or add a new seller.</p>
          <Link to="/admin/sellers/new" className="sellers-primary-button">
            <Plus size={17} /> Add Seller
          </Link>
        </div>
      ) : (
        <>
          <div className="sellers-table-toolbar">
            <label className="sellers-selection">
              <input type="checkbox" checked={allVisibleSelected} onChange={onSelectAll} />
              <span>{selectedSellers.length} selected</span>
            </label>
            <div className="sellers-table-toolbar__actions">
              <button type="button" className="sellers-secondary-button">Export CSV</button>
              <button type="button" className="sellers-danger-button" disabled={selectedSellers.length === 0}>
                <Trash2 size={15} /> Delete Selected
              </button>
            </div>
          </div>

          <div className="sellers-table-scroll">
            <table className="sellers-table">
              <thead>
                <tr>
                  <th className="sellers-table__check"><input type="checkbox" checked={allVisibleSelected} onChange={onSelectAll} /></th>
                  <th>Seller</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Access</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Joined</th>
                  <th className="sellers-table__actions" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  const access = getAccessState(seller);

                  return (
                    <tr key={seller.id}>
                      <td className="sellers-table__check">
                        <input
                          type="checkbox"
                          checked={selectedSellers.includes(seller.id)}
                          onChange={() => onToggle(seller.id)}
                        />
                      </td>
                      <td>
                        <div className="sellers-table__primary">{seller.businessName}</div>
                        <div className="sellers-table__secondary">ID: {seller.id}</div>
                      </td>
                      <td>
                        <div className="sellers-table__primary sellers-table__primary--normal">{seller.email}</div>
                        <div className="sellers-table__secondary">{seller.phone || '—'}</div>
                      </td>
                      <td><span className={getPlanClass(seller.plan)}>{seller.plan}</span></td>
                      <td>
                        <span className={access.className}>{access.label}</span>
                        {seller.adminGrant && seller.adminGrant.expiresAt && (
                          <div className="sellers-table__secondary">
                            until {new Date(seller.adminGrant.expiresAt).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </td>
                      <td><span className={getStatusClass(seller.status)}>{seller.status.charAt(0) + seller.status.slice(1).toLowerCase()}</span></td>
                      <td className="sellers-table__number">{seller.totalProducts}</td>
                      <td className="sellers-table__number">{seller.totalOrders}</td>
                      <td className="sellers-table__revenue">{formatRevenue(seller.totalRevenue)}</td>
                      <td className="sellers-table__date">{new Date(seller.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="sellers-table__actions">
                        {canManageFreeAccess && (
                          <button
                            type="button"
                            className="sellers-icon-button"
                            aria-label={`Manage free access for ${seller.businessName}`}
                            title={seller.adminGrant ? 'Change or revoke free access' : 'Grant free access'}
                            onClick={() => onManageFreeAccess(seller)}
                          >
                            <Gift size={18} />
                          </button>
                        )}
                        <button type="button" className="sellers-icon-button" aria-label={`Actions for ${seller.businessName}`}>
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default SellersTable;
