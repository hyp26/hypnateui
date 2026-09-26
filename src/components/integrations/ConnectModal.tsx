import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useIntegrationStore, Platform } from '../../stores/useIntegrationStore';
import { MessageCircle, Instagram, Facebook, Send } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform | null;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, platform }) => {
  const connectChannel = useIntegrationStore((state) => state.connectChannel);
  const connectWhatsApp = useIntegrationStore((state) => state.connectWhatsApp);
  const [isLoading, setIsLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    botToken: '',
  });

  if (!platform) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConnectError(null);
    try {
      await connectChannel(platform, formData);
      onClose();
    } catch (error: any) {
      setConnectError(error?.message || 'Could not connect this channel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformConfig = () => {
    switch (platform) {
      case 'whatsapp':
        return {
          title: 'Connect WhatsApp Business',
          icon: <MessageCircle className="w-6 h-6 text-green-600" />,
          color: 'bg-green-50',
        };
      case 'instagram':
        return {
          title: 'Connect Instagram',
          icon: <Instagram className="w-6 h-6 text-pink-600" />,
          color: 'bg-pink-50',
        };
      case 'facebook':
        return {
          title: 'Connect Facebook Page',
          icon: <Facebook className="w-6 h-6 text-blue-600" />,
          color: 'bg-blue-50',
        };
      case 'telegram':
        return {
          title: 'Connect Telegram Bot',
          icon: <Send className="w-6 h-6 text-sky-600" />,
          color: 'bg-sky-50',
        };
      default:
        return { title: 'Connect Channel', icon: null, color: 'bg-gray-50' };
    }
  };

  const config = getPlatformConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title}>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${config.color} flex items-start gap-3`}>
          <div className="shrink-0 mt-1">{config.icon}</div>
          <div className="text-sm text-gray-700">
            {platform === 'whatsapp' && "Connecting WhatsApp is done through Meta authorization. You will be redirected to Meta to sign in and approve your WhatsApp Business assets — no API keys or access tokens needed."}
            {platform === 'instagram' && "Ensure your Instagram account is switched to a Business Profile and linked to a Facebook Page."}
            {platform === 'facebook' && "We need permission to manage your Pages and read messages to automate replies."}
            {platform === 'telegram' && "Create a new bot via @BotFather on Telegram and paste the API Token below."}
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4" noValidate>
          {connectError && (
            <div role="alert" aria-live="assertive" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{connectError}</div>
          )}
          {platform === 'whatsapp' && (
            <div className="py-4">
              <button
                type="button"
                onClick={() => connectWhatsApp()}
                className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                Continue to Meta
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                You will be redirected to Meta to authorize Hypnate. Hypnate never asks for your Meta credentials, API keys, or access tokens.
              </p>
            </div>
          )}

          {platform === 'telegram' && (
            <div>
              <label htmlFor="connect-telegram-bot-token" className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <input
                id="connect-telegram-bot-token"
                name="botToken"
                type="text"
                autoComplete="off"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                required
                value={formData.botToken}
                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
              />
            </div>
          )}

          {(platform === 'instagram' || platform === 'facebook') && (
            <div className="py-4">
              <button
                type="button"
                onClick={handleConnect}
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
                Continue with Facebook
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                You will be redirected to Facebook to authorize Hypnate.
              </p>
            </div>
          )}

          {platform === 'telegram' && (
            <Button type="submit" isLoading={isLoading} className="w-full">
              Connect Bot
            </Button>
          )}
        </form>
      </div>
    </Modal>
  );
};
