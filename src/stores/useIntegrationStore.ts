import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

/* Base URL used by the rest of the app (src/lib/api.ts).
 * Empty string means same-origin. */
const API = process.env.REACT_APP_API_URL || '';

export type Platform = 'whatsapp' | 'instagram' | 'facebook' | 'telegram';

export interface ChannelConfig {
  connected: boolean;
  identifier?: string; // Page name, bot name, etc. (never WhatsApp credentials)
  lastSynced?: string;
  metadata?: any;
}

/* ------------------------------------------------------------------
 * REAL WHATSAPP CONNECTION STATE
 *
 * Types mirror the exact response of
 * GET /api/channels/whatsapp/status on the Hypnate backend.
 * Do not add fields here that the backend does not return.
 * ------------------------------------------------------------------ */

export interface WhatsAppPhoneNumber {
  id: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
}

export interface WhatsAppStatus {
  connected: boolean;
  /** NOT_CONNECTED | DISCONNECTED | ACTIVE | ERROR (backend may add codes) */
  connectionStatus: string;
  businessName: string | null;
  whatsappBusinessName: string | null;
  wabaId: string | null;
  phoneNumbers: WhatsAppPhoneNumber[];
  lastValidatedAt: string | null;
  tokenExpiresAt: string | null;
  lastError: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
}

/** Response of POST /api/channels/whatsapp/validate (success shape). */
export interface WhatsAppValidationResult {
  valid: boolean;
  validatedAt: string;
  whatsappBusinessName: string | null;
}

interface IntegrationState {
  /* ---- Existing multi-channel card state (non-WhatsApp channels unchanged) ---- */
  channels: Record<Platform, ChannelConfig>;
  connectChannel: (platform: Platform, data: any) => Promise<void>;
  disconnectChannel: (platform: Platform) => void;

  /* ---- Real WhatsApp state (backend is the source of truth) ---- */
  whatsapp: WhatsAppStatus | null;
  whatsappLoading: boolean;
  whatsappValidating: boolean;
  whatsappDisconnecting: boolean;
  whatsappError: string | null;
  lastValidation: WhatsAppValidationResult | null;

  loadWhatsAppStatus: () => Promise<void>;
  connectWhatsApp: () => void;
  validateWhatsApp: () => Promise<boolean>;
  disconnectWhatsApp: () => Promise<void>;
  clearWhatsAppError: () => void;
}

/* Extract a safe, user-facing error message.
 * Never surfaces tokens, secrets, or raw provider payloads. */
const whatsappErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const response = (err as { response?: { data?: { message?: unknown } } }).response;
    const message = response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
};

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      channels: {
        whatsapp: { connected: false },
        instagram: { connected: false },
        facebook: { connected: false },
        telegram: { connected: false },
      },

      /* ---- real WhatsApp state ---- */
      whatsapp: null,
      whatsappLoading: false,
      whatsappValidating: false,
      whatsappDisconnecting: false,
      whatsappError: null,
      lastValidation: null,

      /* ----------------------------------------------------------------
       * Fetch the real connection status from the backend.
       * The backend response is stored verbatim; nothing is simulated.
       * ---------------------------------------------------------------- */
      loadWhatsAppStatus: async () => {
        set({ whatsappLoading: true, whatsappError: null });
        try {
          const res = await api.get('/api/channels/whatsapp/status');
          const status: WhatsAppStatus = res.data;
          set({
            whatsapp: status,
            whatsappLoading: false,
            // keep the channel card in sync with the real state
            channels: {
              ...get().channels,
              whatsapp: {
                connected: status.connected,
                identifier: status.phoneNumbers[0]?.displayPhoneNumber ?? undefined,
                lastSynced: status.updatedAt ?? undefined,
                metadata: undefined,
              },
            },
          });
        } catch (err) {
          set({
            whatsappError: whatsappErrorMessage(err, 'Could not load the WhatsApp connection status.'),
            whatsappLoading: false,
          });
        }
      },

      /* ----------------------------------------------------------------
       * Start the backend OAuth flow.
       *
       * GET /api/channels/whatsapp/connect responds with a 302 redirect
       * to Meta, so this MUST be a full browser navigation — never an
       * axios call. Authentication rides the existing httpOnly cookies.
       * No WhatsApp/Meta credentials exist in frontend code.
       * ---------------------------------------------------------------- */
      connectWhatsApp: () => {
        set({ whatsappError: null });
        window.location.href = `${API}/api/channels/whatsapp/connect`;
      },

      /* Ask the backend to re-check the stored connection. */
      validateWhatsApp: async () => {
        set({ whatsappValidating: true, whatsappError: null });
        try {
          const res = await api.post('/api/channels/whatsapp/validate');
          const result: WhatsAppValidationResult = res.data;
          set({ lastValidation: result, whatsappValidating: false });
          // Refresh the full status so UI state stays backend-driven.
          await get().loadWhatsAppStatus();
          return result.valid;
        } catch (err) {
          set({
            whatsappError: whatsappErrorMessage(err, 'WhatsApp connection could not be validated. Please reconnect WhatsApp.'),
            whatsappValidating: false,
          });
          return false;
        }
      },

      /* Disconnect through the backend, then reflect the real state. */
      disconnectWhatsApp: async () => {
        set({ whatsappDisconnecting: true, whatsappError: null });
        try {
          await api.post('/api/channels/whatsapp/disconnect');
          set({ whatsappDisconnecting: false, lastValidation: null });
          await get().loadWhatsAppStatus();
        } catch (err) {
          set({
            whatsappError: whatsappErrorMessage(err, 'Could not disconnect WhatsApp. Please try again.'),
            whatsappDisconnecting: false,
          });
        }
      },

      clearWhatsAppError: () => set({ whatsappError: null }),

      /* ----------------------------------------------------------------
       * Channel-card actions.
       *
       * WhatsApp is real: connect navigates to the backend OAuth flow
       * and disconnect calls the real endpoint. There is no simulation
       * and no hardcoded WhatsApp identifier anywhere.
       *
       * Other platforms are intentionally left untouched.
       * ---------------------------------------------------------------- */
      connectChannel: async (platform, data) => {
        if (platform === 'whatsapp') {
          get().connectWhatsApp();
          return;
        }

        // Simulate API Latency (non-WhatsApp channels only)
        await new Promise(resolve => setTimeout(resolve, 1500));

        let identifier = '';
        const now = new Date().toISOString();

        switch (platform) {
          case 'instagram':
            identifier = '@hypnate_store';
            break;
          case 'facebook':
            identifier = 'Hypnate Store Page';
            break;
          case 'telegram':
            identifier = data?.botToken ? 'Telegram Bot' : 'hypnate_bot';
            break;
        }

        set((state) => ({
          channels: {
            ...state.channels,
            [platform]: {
              connected: true,
              identifier,
              lastSynced: now,
              metadata: data,
            },
          },
        }));
      },

      disconnectChannel: (platform) => {
        if (platform === 'whatsapp') {
          // Real endpoint; store updates from the backend response.
          void get().disconnectWhatsApp();
          return;
        }

        set((state) => ({
          channels: {
            ...state.channels,
            [platform]: { connected: false, identifier: undefined, lastSynced: undefined },
          },
        }));
      },
    }),
    {
      name: 'integration-storage',
      /* Persist only the non-WhatsApp channel cards.
       * WhatsApp connection state is never persisted — the backend
       * status endpoint is the single source of truth and is loaded
       * fresh via loadWhatsAppStatus(). */
      partialize: (state) => ({
        channels: {
          whatsapp: { connected: false },
          instagram: state.channels.instagram,
          facebook: state.channels.facebook,
          telegram: state.channels.telegram,
        },
      }),
    }
  )
);
