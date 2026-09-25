import React from 'react';
import {
  MoreVertical,
  Trash2,
  UserRound,
  Shield,
  Headset,
  CheckCircle2,
  PauseCircle,
  UserCog,
} from 'lucide-react';
import type { AdminUserRole, UserStatus } from '../../types';

interface AdminAccount {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminUserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

interface Props {
  accounts: AdminAccount[];
  currentUserId?: string | number;
  currentUserRole?: AdminUserRole;
  openMenu: string | number | null;
  onMenuToggle: (id: string | number) => void;
  onRoleChange: (id: string | number, role: 'ADMIN' | 'SUPPORT') => void;
  onStatusChange: (
    id: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  ) => void;
  onDelete: (id: string | number) => void;
}

const roleLabel: Record<AdminUserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  SUPPORT: 'Support',
};

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  PENDING: 'Pending',
  BLOCKED: 'Blocked',
  TRIALING: 'Trialing',
};

const formatDate = (value?: string, includeTime = false) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
};

export const AdminUserTable: React.FC<Props> = ({
  accounts,
  currentUserId,
  currentUserRole,
  openMenu,
  onMenuToggle,
  onRoleChange,
  onStatusChange,
  onDelete,
}) => {
  return (
    <div className="adminusers-table-wrap">
      <table className="adminusers-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last login</th>
            <th>Created</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {accounts.map((user) => {
            const canManage =
              currentUserId !== user.id &&
              user.role !== 'SUPER_ADMIN' &&
              (currentUserRole === 'SUPER_ADMIN' ||
                (currentUserRole === 'ADMIN' && user.role === 'SUPPORT'));

            return (
              <tr key={user.id}>
                <td>
                  <div className="adminusers-user">
                    <div className="adminusers-avatar">
                      {user.firstName.charAt(0).toUpperCase()}
                      {user.lastName.charAt(0).toUpperCase()}
                    </div>
                    <div className="adminusers-user-copy">
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className={`adminusers-role-badge ${user.role.toLowerCase()}`}>
                    {user.role === 'SUPER_ADMIN' ? <Shield size={13} /> : user.role === 'ADMIN' ? <UserCog size={13} /> : <Headset size={13} />}
                    {roleLabel[user.role]}
                  </span>
                </td>

                <td>
                  <span className={`adminusers-status ${user.status.toLowerCase()}`}>
                    <span className="adminusers-status-dot" />
                    {statusLabel[user.status]}
                  </span>
                </td>

                <td className="adminusers-muted">{formatDate(user.lastLoginAt, true)}</td>
                <td className="adminusers-muted">{formatDate(user.createdAt)}</td>

                <td className="adminusers-actions-cell">
                  {canManage && (
                    <>
                      <button
                        type="button"
                        className="adminusers-icon-btn"
                        onClick={() => onMenuToggle(user.id)}
                        aria-label={`Manage ${user.firstName} ${user.lastName}`}
                        aria-expanded={openMenu === user.id}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === user.id && (
                        <div className="adminusers-menu">
                          {user.role === 'SUPPORT' && currentUserRole === 'SUPER_ADMIN' && (
                            <button type="button" onClick={() => onRoleChange(user.id, 'ADMIN')}>
                              <UserCog size={15} />
                              Promote to Admin
                            </button>
                          )}

                          {user.role === 'ADMIN' && currentUserRole === 'SUPER_ADMIN' && (
                            <button type="button" onClick={() => onRoleChange(user.id, 'SUPPORT')}>
                              <Headset size={15} />
                              Change to Support
                            </button>
                          )}

                          {user.role === 'SUPPORT' && (
                            <button
                              type="button"
                              onClick={() =>
                                onStatusChange(
                                  user.id,
                                  user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                                )
                              }
                            >
                              {user.status === 'ACTIVE' ? (
                                <PauseCircle size={15} />
                              ) : (
                                <CheckCircle2 size={15} />
                              )}
                              {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          )}

                          {user.role === 'SUPPORT' && (
                            <button
                              type="button"
                              className="danger"
                              onClick={() => onDelete(user.id)}
                            >
                              <Trash2 size={15} />
                              Delete Support
                            </button>
                          )}

                          {user.role === 'ADMIN' && currentUserRole === 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              className="danger"
                              onClick={() => onDelete(user.id)}
                            >
                              <Trash2 size={15} />
                              Delete Admin
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {accounts.length === 0 && (
        <div className="adminusers-empty">
          <div className="adminusers-empty-icon">
            <UserRound size={22} />
          </div>
          <strong>No admin accounts found</strong>
          <span>Try changing your search or filters.</span>
        </div>
      )}
    </div>
  );
};
