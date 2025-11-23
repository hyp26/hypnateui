import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useIntegrationStore, Platform } from '../../stores/useIntegrationStore';
import { MessageCircle, Instagram, Facebook, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform | null;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, platform }) => {
  const connectChannel = useIntegrationStore((state) => state.connectChannel);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    apiKey: '',
    botToken: '',
  });

  if (!platform) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await connectChannel(platform, formData);
      onClose();
    } catch (error) {
      console.error(error);
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
            {platform === 'whatsapp' && "You need a valid Facebook Business Manager account and a phone number not currently registered on WhatsApp personal app."}
            {platform === 'instagram' && "Ensure your Instagram account is switched to a Business Profile and linked to a Facebook Page."}
            {platform === 'facebook' && "We need permission to manage your Pages and read messages to automate replies."}
            {platform === 'telegram' && "Create a new bot via @BotFather on Telegram and paste the API Token below."}
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          {platform === 'whatsapp' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business API Key</label>
                <input
                  type="password"
                  placeholder="EAAG..."
                  required
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Found in your Meta Developer Portal.</p>
              </div>
            </>
          )}

          {platform === 'telegram' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <input
                type="text"
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
                <Facebook className="w-5 h-5" />
                Continue with Facebook
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                You will be redirected to Facebook to authorize Hypnate.
              </p>
            </div>
          )}

          {(platform === 'whatsapp' || platform === 'telegram') && (
            <Button type="submit" isLoading={isLoading} className="w-full">
              Connect {platform === 'whatsapp' ? 'WhatsApp' : 'Bot'}
            </Button>
          )}
        </form>
      </div>
    </Modal>
  );
};
