import React, { useMemo, useState } from 'react';
import { UserPlus, Search, MoreVertical, Trash2, X } from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';
import type { AdminUserRole, UserStatus } from '../types';

type ManagedRole = 'ADMIN' | 'SUPPORT';

const roleLabel: Record<AdminUserRole, string> = {
  SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', SUPPORT: 'Support',
};

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: 'Active', INACTIVE: 'Inactive', SUSPENDED: 'Suspended',
  PENDING: 'Pending', BLOCKED: 'Blocked', TRIALING: 'Trialing',
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
      const matchesQuery = !query || `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      return matchesQuery && (roleFilter === 'ALL' || user.role === roleFilter) && (statusFilter === 'ALL' || user.status === statusFilter);
    });
  }, [accounts, searchQuery, roleFilter, statusFilter]);

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPassword('');
    setCreateRole(canCreateAdmin ? 'ADMIN' : 'SUPPORT'); setError(null);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setSuccess(null);
    try {
      await createAdminAccount({ firstName, lastName, email, password, role: createRole });
      setSuccess(`${createRole === 'ADMIN' ? 'Admin' : 'Support'} account created successfully.`);
      setShowCreate(false); resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    }
  };

  const handleDelete = (id: string | number) => {
    const target = accounts.find((a) => a.id === id);
    if (!target) return;
    setError(null); setSuccess(null);
    if (deleteAdminAccount(id)) setSuccess(`${roleLabel[target.role]} account deleted.`);
    else setError('You do not have permission to delete this account.');
    setOpenMenu(null);
  };

  const handleRoleChange = (id: string | number, role: ManagedRole) => {
    setError(null); setSuccess(null);
    if (updateAdminRole(id, role)) setSuccess('Account role updated.');
    else setError('You do not have permission to change this account role.');
    setOpenMenu(null);
  };

  const handleStatusChange = (id: string | number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    setError(null); setSuccess(null);
    if (updateAdminStatus(id, status)) setSuccess(`Account marked ${statusLabel[status].toLowerCase()}.`);
    else setError('You do not have permission to change this account status.');
    setOpenMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform administrators and support accounts.</p>
        </div>
        {(canCreateAdmin || canCreateSupport) && (
          <button className="admin-btn admin-btn-primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            <UserPlus size={16} /> Create Account
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4"><div className="text-xs text-gray-500">Super Admin</div><div className="text-2xl font-bold text-purple-600">{accounts.filter((u) => u.role === 'SUPER_ADMIN').length}</div></div>
        <div className="admin-card p-4"><div className="text-xs text-gray-500">Admins</div><div className="text-2xl font-bold text-blue-600">{accounts.filter((u) => u.role === 'ADMIN').length}</div></div>
        <div className="admin-card p-4"><div className="text-xs text-gray-500">Support</div><div className="text-2xl font-bold text-green-600">{accounts.filter((u) => u.role === 'SUPPORT').length}</div></div>
      </div>

      {(error || success) && <div className={`p-4 rounded-lg border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{error || success}</div>}

      <div className="admin-card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}>
            <option value="ALL">All roles</option><option value="SUPER_ADMIN">Super Admin</option><option value="ADMIN">Admin</option><option value="SUPPORT">Support</option>
          </select>
          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="admin-card overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Last Login</th><th className="px-4 py-3 text-left">Created</th><th /></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const canManage = currentUser?.id !== user.id && user.role !== 'SUPER_ADMIN' && (currentUser?.role === 'SUPER_ADMIN' || (currentUser?.role === 'ADMIN' && user.role === 'SUPPORT'));
                return <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">{user.firstName.charAt(0).toUpperCase()}</div><div><div className="font-medium">{user.firstName} {user.lastName}</div><div className="text-xs text-gray-500">{user.email}</div></div></div></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{roleLabel[user.role]}</span></td>
                  <td className="px-4 py-3">{statusLabel[user.status]}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right relative">
                    {canManage && <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)} aria-label="Manage account"><MoreVertical size={16} /></button>}
                    {openMenu === user.id && canManage && <div className="absolute right-4 top-12 z-30 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-xl p-1">
                      {user.role === 'SUPPORT' && currentUser?.role === 'SUPER_ADMIN' && <button onClick={() => handleRoleChange(user.id, 'ADMIN')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100">Promote to Admin</button>}
                      {user.role === 'ADMIN' && currentUser?.role === 'SUPER_ADMIN' && <button onClick={() => handleRoleChange(user.id, 'SUPPORT')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100">Change to Support</button>}
                      {user.role === 'SUPPORT' && <button onClick={() => handleStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100">{user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button>}
                      {user.role === 'SUPPORT' && <button onClick={() => handleDelete(user.id)} className="w-full text-left px-3 py-2 text-sm rounded text-red-600 hover:bg-red-50"><Trash2 size={14} className="inline mr-2" /> Delete Support</button>}
                      {user.role === 'ADMIN' && currentUser?.role === 'SUPER_ADMIN' && <button onClick={() => handleDelete(user.id)} className="w-full text-left px-3 py-2 text-sm rounded text-red-600 hover:bg-red-50"><Trash2 size={14} className="inline mr-2" /> Delete Admin</button>}
                    </div>}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <div className="py-12 text-center text-gray-500">No admin accounts found.</div>}
        </div>
      </div>

      {showCreate && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={() => setShowCreate(false)}>
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold">Create Admin Account</h2><p className="text-sm text-gray-500 mt-1">Create an Admin or Support account according to your permissions.</p></div><button onClick={() => setShowCreate(false)}><X size={20} /></button></div>
          <form onSubmit={handleCreate} className="space-y-4">
            <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" value={createRole} onChange={(e) => setCreateRole(e.target.value as ManagedRole)}>{canCreateAdmin && <option value="ADMIN">Admin</option>}{canCreateSupport && <option value="SUPPORT">Support</option>}</select>
            <div className="grid grid-cols-2 gap-3"><input className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /><input className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
            <input type="email" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            <button type="submit" className="w-full admin-btn admin-btn-primary">Create {createRole === 'ADMIN' ? 'Admin' : 'Support'} Account</button>
          </form>
        </div>
      </div>}
    </div>
  );
};
