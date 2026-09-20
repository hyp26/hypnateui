export const PUBLIC_CHANNELS = ['WhatsApp', 'Instagram', 'Facebook', 'Telegram'] as const;
export type PublicChannel = (typeof PUBLIC_CHANNELS)[number];
export const PUBLIC_CHANNEL_SUMMARY = 'WhatsApp, Instagram, Facebook and Telegram';
export const PUBLIC_CHANNEL_TITLE_SUMMARY = 'WhatsApp, Instagram, Facebook & Telegram';
