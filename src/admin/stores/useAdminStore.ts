import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAuthApi, getApiErrorMessage } from '../lib/adminApi';
import type { AdminUser, AdminUserRole, Notification } from '../types';

export type AdminPermission =
  | 'VIEW_ADMIN_USERS'
  | 'CREATE_ADMIN'
  | 'CREATE_SUPPORT'
  | 'DELETE_ADMIN'
  | 'DELETE_SUPPORT'
  | 'CHANGE_ADMIN_ROLE'
  | 'CHANGE_SUPPORT_ROLE'
  | 'CHANGE_ADMIN_STATUS';

const ADMIN_STORE_VERSION = 3;

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

interface AdminState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  adminUser: AdminUser | null;
  notifications: Notification[];
  sidebarCollapsed: boolean;
  setAuthenticated: (value: boolean) => void;
  setAdminUser: (user: AdminUser | null) => void;
  setInitialized: (value: boolean) => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: AdminPermission) => boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
}

const getRolePermissions = (role: AdminUserRole): AdminPermission[] => permissionsByRole[role];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isInitialized: false,
      adminUser: null,
      notifications: [],
      sidebarCollapsed: false,

      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setAdminUser: (user) => set({ adminUser: user }),
      setInitialized: (value) => set({ isInitialized: value }),

      // Restores the session on page load using the HttpOnly admin cookies.
      // The adminApi interceptor automatically attempts a token refresh and
      // retries the profile request when the access token has expired.
      initialize: async () => {
        if (get().isInitialized) return;

        try {
          const admin = await adminAuthApi.profile();
          set({ isAuthenticated: true, adminUser: admin, isInitialized: true });
        } catch {
          set({ isAuthenticated: false, adminUser: null, isInitialized: true });
        }
      },

      login: async (email, password) => {
        try {
          const response = await adminAuthApi.login({
            email: email.trim(),
            password,
          });

          set({
            isAuthenticated: true,
            adminUser: response.admin,
            isInitialized: true,
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
        } catch (error) {
          throw new Error(getApiErrorMessage(error));
        }
      },

      logout: () => {
        // Best-effort server logout (revokes the session + clears cookies).
        adminAuthApi.logout().catch(() => undefined);
        set({ isAuthenticated: false, adminUser: null, notifications: [] });
      },

      hasPermission: (permission) => {
        const role = get().adminUser?.role;
        return role ? getRolePermissions(role).includes(permission) : false;
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

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'admin-store',
      version: ADMIN_STORE_VERSION,
      // Auth state is derived from the backend session cookies, so only the
      // UI preference is persisted locally.
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      migrate: () => ({ sidebarCollapsed: false }) as unknown as AdminState,
    }
  )
);

// Kick off session restoration once, as soon as the store is imported.
void useAdminStore.getState().initialize();

// If a background refresh fails (expired refresh cookie), drop the session.
window.addEventListener('admin:auth:logout', () => {
  useAdminStore.setState({ isAuthenticated: false, adminUser: null });
});
