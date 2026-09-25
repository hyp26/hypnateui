import React, { useMemo, useState } from 'react';
import {
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  X,
  Shield,
  Users,
  Headset,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';
import type { AdminUserRole, UserStatus } from '../types';
import { AdminUserStats } from '../components/AdminUsers/AdminUserStats';
import { AdminUserFilters } from '../components/AdminUsers/AdminUserFilters';
import { AdminUserTable } from '../components/AdminUsers/AdminUserTable';
import { CreateAdminUserModal } from '../components/AdminUsers/CreateAdminUserModal';
import '../styles/AdminUsers.css';

type ManagedRole = 'ADMIN' | 'SUPPORT';

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

export const AdminUsers: React.FC = () => {
  const currentUser = useAdminStore((s) => s.adminUser);
  const accounts = useAdminStore((s) => s.adminAccounts);
  const hasPermission = useAdminStore((s) => s.hasPermission);
  const createAdminAccount = useAdminStore((s) => s.createAdminAccount);
  const deleteAdminAccount = useAdminStore((s) => s.deleteAdminAccount);
  const updateAdminRole = useAdminStore((s) => s.updateAdminRole);
  const updateAdminStatus = useAdminStore((s) => s.updateAdminStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | AdminUserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [createRole, setCreateRole] = useState<ManagedRole>('SUPPORT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | number | null>(null);

  const canCreateAdmin = hasPermission('CREATE_ADMIN');
  const canCreateSupport = hasPermission('CREATE_SUPPORT');

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return accounts.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesQuery =
        !query || fullName.includes(query) || user.email.toLowerCase().includes(query);

      return (
        matchesQuery &&
        (roleFilter === 'ALL' || user.role === roleFilter) &&
        (statusFilter === 'ALL' || user.status === statusFilter)
      );
    });
  }, [accounts, searchQuery, roleFilter, statusFilter]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setCreateRole(canCreateAdmin ? 'ADMIN' : 'SUPPORT');
    setError(null);
  };

  const closeCreate = () => {
    setShowCreate(false);
    resetForm();
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createAdminAccount({
        firstName,
        lastName,
        email,
        password,
        role: createRole,
      });

      setSuccess(
        `${createRole === 'ADMIN' ? 'Admin' : 'Support'} account created successfully.`,
      );
      setShowCreate(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    }
  };

  const handleDelete = (id: string | number) => {
    const target = accounts.find((account) => account.id === id);
    if (!target) return;

    setError(null);
    setSuccess(null);

    if (deleteAdminAccount(id)) {
      setSuccess(`${roleLabel[target.role]} account deleted.`);
    } else {
      setError('You do not have permission to delete this account.');
    }

    setOpenMenu(null);
  };

  const handleRoleChange = (id: string | number, role: ManagedRole) => {
    setError(null);
    setSuccess(null);

    if (updateAdminRole(id, role)) {
      setSuccess('Account role updated.');
    } else {
      setError('You do not have permission to change this account role.');
    }

    setOpenMenu(null);
  };

  const handleStatusChange = (
    id: string | number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  ) => {
    setError(null);
    setSuccess(null);

    if (updateAdminStatus(id, status)) {
      setSuccess(`Account marked ${statusLabel[status].toLowerCase()}.`);
    } else {
      setError('You do not have permission to change this account status.');
    }

    setOpenMenu(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="adminusers-page">
      <header className="adminusers-header">
        <div>
          <div className="adminusers-eyebrow">
            <Shield size={15} />
            Access management
          </div>
          <h1>Admin Users</h1>
          <p>Manage platform administrators and support accounts.</p>
        </div>

        {(canCreateAdmin || canCreateSupport) && (
          <button
            type="button"
            className="adminusers-primary-btn"
            onClick={() => {
              resetForm();
              setShowCreate(true);
            }}
          >
            <UserPlus size={17} />
            Create Account
          </button>
        )}
      </header>

      <AdminUserStats accounts={accounts} />

      {(error || success) && (
        <div className={`adminusers-alert ${error ? 'is-error' : 'is-success'}`}>
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || success}</span>
          <button
            type="button"
            className="adminusers-alert-close"
            onClick={() => {
              setError(null);
              setSuccess(null);
            }}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="adminusers-panel">
        <div className="adminusers-panel-heading">
          <div>
            <h2>Team accounts</h2>
            <p>
              {filteredUsers.length} of {accounts.length} accounts shown
            </p>
          </div>
          <div className="adminusers-permission-note">
            <Users size={16} />
            {currentUser?.role === 'SUPER_ADMIN'
              ? 'Full account management'
              : currentUser?.role === 'ADMIN'
                ? 'Support account management'
                : 'View access only'}
          </div>
        </div>

        <AdminUserFilters
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
          onClear={clearFilters}
        />

        <AdminUserTable
          accounts={filteredUsers}
          currentUserId={currentUser?.id}
          currentUserRole={currentUser?.role}
          openMenu={openMenu}
          onMenuToggle={(id) => setOpenMenu(openMenu === id ? null : id)}
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </section>

      {showCreate && (
        <CreateAdminUserModal
          createRole={createRole}
          firstName={firstName}
          lastName={lastName}
          email={email}
          password={password}
          canCreateAdmin={canCreateAdmin}
          canCreateSupport={canCreateSupport}
          onRoleChange={setCreateRole}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onClose={closeCreate}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

export default AdminUsers;
