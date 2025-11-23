import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'whatsapp' | 'instagram' | 'facebook' | 'telegram';

export interface ChannelConfig {
  connected: boolean;
  identifier?: string; // Phone number, page name, bot name
  lastSynced?: string;
  metadata?: any;
}

interface IntegrationState {
  channels: Record<Platform, ChannelConfig>;
  connectChannel: (platform: Platform, data: any) => Promise<void>;
  disconnectChannel: (platform: Platform) => void;
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      channels: {
        whatsapp: { connected: false },
        instagram: { connected: false },
        facebook: { connected: false },
        telegram: { connected: false },
      },
      connectChannel: async (platform, data) => {
        // Simulate API Latency
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let identifier = '';
        const now = new Date().toISOString();

        switch(platform) {
          case 'whatsapp': 
            identifier = data.phoneNumber || '+91 98765 43210'; 
            break;
          case 'instagram': 
            identifier = '@hypnate_store'; 
            break; 
          case 'facebook': 
            identifier = 'Hypnate Store Page'; 
            break; 
          case 'telegram': 
            identifier = 'hypnate_bot'; 
            break; 
        }

        set((state) => ({
          channels: {
            ...state.channels,
            [platform]: { 
              connected: true, 
              identifier, 
              lastSynced: now,
              metadata: data 
            }
          }
        }));
      },
      disconnectChannel: (platform) => set((state) => ({
        channels: {
          ...state.channels,
          [platform]: { connected: false, identifier: undefined, lastSynced: undefined }
        }
      })),
    }),
    { name: 'integration-storage' }
  )
);
