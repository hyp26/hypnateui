import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AdminUser,
  AdminUserRole,
  Notification,
  Settings,
  FeatureFlagConfig,
} from '../types';

export type AdminPermission =
  | 'VIEW_ADMIN_USERS'
  | 'CREATE_ADMIN'
  | 'CREATE_SUPPORT'
  | 'DELETE_ADMIN'
  | 'DELETE_SUPPORT'
  | 'CHANGE_ADMIN_ROLE'
  | 'CHANGE_SUPPORT_ROLE'
  | 'CHANGE_ADMIN_STATUS';

export interface AdminAccount extends AdminUser {
  passwordHash: string;
}

export const SUPER_ADMIN_EMAIL = 'hamim.quazi@gmail.com';
export const SUPER_ADMIN_PASSWORD = 'Admin@123';

const SUPER_ADMIN_ID = 'super-admin-1';
const ADMIN_STORE_VERSION = 2;

const permissionsByRole: Record<AdminUserRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'VIEW_ADMIN_USERS',
    'CREATE_ADMIN',
    'CREATE_SUPPORT',
    'DELETE_ADMIN',
    'DELETE_SUPPORT',
    'CHANGE_ADMIN_ROLE',
    'CHANGE_SUPPORT_ROLE',
    'CHANGE_ADMIN_STATUS',
  ],
  ADMIN: [
    'VIEW_ADMIN_USERS',
    'CREATE_SUPPORT',
    'DELETE_SUPPORT',
    'CHANGE_SUPPORT_ROLE',
  ],
  SUPPORT: [],
};

const defaultSettings: Settings = {
  siteName: 'Hypnate Admin',
  siteDescription: 'Internal administration panel for Hypnate',
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.ico',
  defaultCurrency: 'USD',
  defaultTimezone: 'UTC',
  supportEmail: 'support@hypnate.in',
  featureFlags: {
    maintenanceMode: false,
    newUserRegistration: true,
    emailNotifications: true,
    analyticsDashboard: true,
    subscriptionUpgrades: true,
  },
};

const initialSuperAdmin: AdminAccount = {
  id: SUPER_ADMIN_ID,
  email: SUPER_ADMIN_EMAIL,
  firstName: 'Hamim',
  lastName: 'Quazi',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  avatar: '',
  lastLoginAt: undefined,
  createdAt: '2026-09-25T00:00:00.000Z',
  updatedAt: '2026-09-25T00:00:00.000Z',
  // This is replaced with a SHA-256 hash during store initialization.
  passwordHash: '',
};

const hashPassword = async (password: string): Promise<string> => {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const createInitialAccounts = async (): Promise<AdminAccount[]> => [
  {
    ...initialSuperAdmin,
    passwordHash: await hashPassword(SUPER_ADMIN_PASSWORD),
  },
];

interface AdminState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  adminUser: AdminUser | null;
  adminAccounts: AdminAccount[];
  notifications: Notification[];
  settings: Settings;
  featureFlags: FeatureFlagConfig;
  sidebarCollapsed: boolean;
  setAuthenticated: (value: boolean) => void;
  setAdminUser: (user: AdminUser | null) => void;
  setInitialized: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: AdminPermission) => boolean;
  createAdminAccount: (input: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'SUPPORT';
    password: string;
  }) => Promise<AdminAccount>;
  deleteAdminAccount: (id: string | number) => boolean;
  updateAdminRole: (id: string | number, role: 'ADMIN' | 'SUPPORT') => boolean;
  updateAdminStatus: (id: string | number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateFeatureFlags: (flags: Partial<FeatureFlagConfig>) => void;
  toggleSidebar: () => void;
}

const getRolePermissions = (role: AdminUserRole): AdminPermission[] => permissionsByRole[role];

const canManageTarget = (actor: AdminUser, target: AdminAccount): boolean => {
  if (actor.id === target.id) return false;
  if (target.role === 'SUPER_ADMIN') return false;
  if (actor.role === 'SUPER_ADMIN') return true;
  return actor.role === 'ADMIN' && target.role === 'SUPPORT';
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isInitialized: true,
      adminUser: null,
      adminAccounts: [initialSuperAdmin],
      notifications: [],
      settings: defaultSettings,
      featureFlags: defaultSettings.featureFlags,
      sidebarCollapsed: false,

      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setAdminUser: (user) => set({ adminUser: user }),
      setInitialized: (value) => set({ isInitialized: value }),

      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        let accounts = get().adminAccounts;

        // Always ensure the code-defined super-admin account exists.
        const superHash = await hashPassword(SUPER_ADMIN_PASSWORD);
        const existingSuperAdmin = accounts.find(
          (account) => account.id === SUPER_ADMIN_ID
        );

        if (!existingSuperAdmin) {
          accounts = [{ ...initialSuperAdmin, passwordHash: superHash }, ...accounts];
          set({ adminAccounts: accounts });
        } else if (existingSuperAdmin.passwordHash !== superHash) {
          accounts = accounts.map((account) =>
            account.id === SUPER_ADMIN_ID
              ? { ...account, email: SUPER_ADMIN_EMAIL, role: 'SUPER_ADMIN', passwordHash: superHash }
              : account
          );
          set({ adminAccounts: accounts });
        }

        const account = accounts.find(
          (candidate) => candidate.email.toLowerCase() === normalizedEmail
        );

        if (!account || account.status !== 'ACTIVE') {
          throw new Error('Invalid admin credentials or inactive account.');
        }

        const passwordHash = await hashPassword(password);
        if (passwordHash !== account.passwordHash) {
          throw new Error('Invalid admin credentials.');
        }

        const loggedInUser: AdminUser = {
          id: account.id,
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          status: account.status,
          avatar: account.avatar,
          lastLoginAt: new Date().toISOString(),
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        };

        set({
          isAuthenticated: true,
          adminUser: loggedInUser,
          isInitialized: true,
          adminAccounts: accounts.map((candidate) =>
            candidate.id === account.id
              ? { ...candidate, lastLoginAt: loggedInUser.lastLoginAt, updatedAt: new Date().toISOString() }
              : candidate
          ),
          notifications: [
            {
              id: `login-${Date.now()}`,
              type: 'SUCCESS',
              title: 'Welcome back!',
              message: 'You have successfully logged in.',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        });

        return true;
      },

      logout: () => {
        set({ isAuthenticated: false, adminUser: null, notifications: [] });
      },

      hasPermission: (permission) => {
        const role = get().adminUser?.role;
        return role ? getRolePermissions(role).includes(permission) : false;
      },

      createAdminAccount: async ({ email, firstName, lastName, role, password }) => {
        const actor = get().adminUser;
        if (!actor) throw new Error('You must be logged in.');

        const permission = role === 'ADMIN' ? 'CREATE_ADMIN' : 'CREATE_SUPPORT';
        if (!get().hasPermission(permission)) {
          throw new Error(`Your ${actor.role.toLowerCase()} account cannot create ${role.toLowerCase()} accounts.`);
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password || !firstName.trim() || !lastName.trim()) {
          throw new Error('Name, email, and password are required.');
        }

        if (get().adminAccounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
          throw new Error('An admin account with this email already exists.');
        }

        const now = new Date().toISOString();
        const account: AdminAccount = {
          id: `admin-${Date.now()}`,
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role,
          status: 'ACTIVE',
          avatar: '',
          createdAt: now,
          updatedAt: now,
          passwordHash: await hashPassword(password),
        };

        set((state) => ({ adminAccounts: [...state.adminAccounts, account] }));
        return account;
      },

      deleteAdminAccount: (id) => {
        const actor = get().adminUser;
        const target = get().adminAccounts.find((account) => account.id === id);
        if (!actor || !target || !canManageTarget(actor, target)) return false;

        const permission = target.role === 'ADMIN' ? 'DELETE_ADMIN' : 'DELETE_SUPPORT';
        if (!get().hasPermission(permission)) return false;

        set((state) => ({ adminAccounts: state.adminAccounts.filter((account) => account.id !== id) }));
        return true;
      },

      updateAdminRole: (id, role) => {
        const actor = get().adminUser;
        const target = get().adminAccounts.find((account) => account.id === id);
        if (!actor || !target || !canManageTarget(actor, target)) return false;
        if (!get().hasPermission(target.role === 'ADMIN' ? 'CHANGE_ADMIN_ROLE' : 'CHANGE_SUPPORT_ROLE')) return false;
        if (actor.role === 'ADMIN' && role !== 'SUPPORT') return false;

        set((state) => ({
          adminAccounts: state.adminAccounts.map((account) =>
            account.id === id ? { ...account, role, updatedAt: new Date().toISOString() } : account
          ),
        }));
        return true;
      },

      updateAdminStatus: (id, status) => {
        const actor = get().adminUser;
        const target = get().adminAccounts.find((account) => account.id === id);
        if (!actor || !target || !canManageTarget(actor, target)) return false;
        if (!get().hasPermission('CHANGE_ADMIN_STATUS')) return false;

        set((state) => ({
          adminAccounts: state.adminAccounts.map((account) =>
            account.id === id ? { ...account, status, updatedAt: new Date().toISOString() } : account
          ),
        }));
        return true;
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((state) => ({ notifications: [newNotification, ...state.notifications] }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      updateSettings: (settings) => {
        set((state) => ({ settings: { ...state.settings, ...settings } }));
      },

      updateFeatureFlags: (flags) => {
        set((state) => ({
          featureFlags: { ...state.featureFlags, ...flags },
          settings: {
            ...state.settings,
            featureFlags: { ...state.settings.featureFlags, ...flags },
          },
        }));
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'admin-store',
      version: ADMIN_STORE_VERSION,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        adminUser: state.adminUser,
        adminAccounts: state.adminAccounts,
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
      migrate: (persistedState: any) => ({
        ...persistedState,
        isInitialized: true,
        adminAccounts: persistedState?.adminAccounts?.length
          ? persistedState.adminAccounts
          : [initialSuperAdmin],
      }),
    }
  )
);
