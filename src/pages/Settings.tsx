import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useIntegrationStore, Platform } from '../stores/useIntegrationStore';
import { Button } from '../components/ui/Button';
import { ConnectModal } from '../components/integrations/ConnectModal';
import { User, Building2, Lock, Bell, Share2, Save, MessageCircle, Instagram, Facebook, Send, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const { channels, disconnectChannel } = useIntegrationStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Integration Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const handleConnectClick = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsConnectModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const integrationCards = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-600 bg-green-100', desc: 'Connect Business API for automated messaging.' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-100', desc: 'Sync DMs and comments to your dashboard.' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-100', desc: 'Manage Messenger chats and Page interactions.' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-600 bg-sky-100', desc: 'Connect your Telegram Bot for support.' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.id 
                    ? "bg-white text-primary-600 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Connected Channels</h2>
                <p className="text-sm text-gray-500">Manage your social media connections.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {integrationCards.map((item) => {
                  const isConnected = channels[item.id as Platform].connected;
                  const identifier = channels[item.id as Platform].identifier;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", item.color)}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {item.name}
                            {isConnected && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {isConnected ? `Connected as ${identifier}` : item.desc}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isConnected ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            onClick={() => disconnectChannel(item.id as Platform)}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleConnectClick(item.id as Platform)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Tabs (Profile, Business, etc.) - Keeping existing form structure */}
          {activeTab !== 'integrations' && (
            <form onSubmit={handleSave} className="max-w-xl space-y-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h2>
                    <p className="text-sm text-gray-500">Update your personal details here.</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600 border-2 border-white shadow-md">
                      {user?.name?.charAt(0) || 'M'}
                    </div>
                    <Button type="button" variant="outline" size="sm">Change Avatar</Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business Tab */}
              {activeTab === 'business' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Business Profile</h2>
                    <p className="text-sm text-gray-500">This information will be visible on your invoices.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input 
                        type="text" 
                        defaultValue="Hypnate Store"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                        placeholder="123, Business Park, Mumbai..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Security</h2>
                    <p className="text-sm text-gray-500">Manage your password and 2FA settings.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Notification Preferences</h2>
                    <p className="text-sm text-gray-500">Choose what you want to be notified about.</p>
                  </div>
                  <div className="space-y-4">
                    {['New Order Received', 'Payment Successful', 'New Customer Message'].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <span className="text-gray-700 font-medium">{item}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 flex justify-end">
                <Button type="submit" isLoading={isLoading} className="px-8">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Connection Modal */}
      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
        platform={selectedPlatform} 
      />
    </div>
  );
};
