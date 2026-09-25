import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Shield,
  User,
  Key,
  Bell,
  Mail,
  Globe,
  Database,
  Save,
  Plus,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Percent,
  MoreVertical
} from 'lucide-react';
import { useAdminStore } from '../stores/useAdminStore';
import type { FeatureFlag } from '../types';

// Mock data
const mockFeatureFlags: FeatureFlag[] = [
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'Enable AI-powered chatbot responses for customer queries',
    isEnabled: true,
    rolloutPercentage: 100,
    targetUsers: [],
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Enable the advanced analytics dashboard for all users',
    isEnabled: true,
    rolloutPercentage: 100,
    targetUsers: [],
  },
  {
    id: 'bulk-import',
    name: 'Bulk Import',
    description: 'Allow users to bulk import products via CSV/Excel',
    isEnabled: true,
    rolloutPercentage: 100,
    targetUsers: [],
  },
  {
    id: 'multi-store',
    name: 'Multi-Store Support',
    description: 'Enable support for managing multiple stores from one account',
    isEnabled: false,
    rolloutPercentage: 0,
    targetUsers: [],
  },
  {
    id: 'new-onboarding',
    name: 'New Onboarding Flow',
    description: 'Use the new simplified onboarding flow for new users',
    isEnabled: true,
    rolloutPercentage: 100,
    targetUsers: [],
  },
];

const settingsSections = [
  { id: 'general', label: 'General', icon: <SettingsIcon size={20} /> },
  { id: 'feature-flags', label: 'Feature Flags', icon: <ToggleRight size={20} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={20} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  { id: 'email', label: 'Email', icon: <Mail size={20} /> },
  { id: 'security', label: 'Security', icon: <Shield size={20} /> },
];

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeatureFlags(mockFeatureFlags);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFeatureFlag = (id: string) => {
    setFeatureFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, isEnabled: !flag.isEnabled } : flag
      )
    );
  };

  const updateRolloutPercentage = (id: string, percentage: number) => {
    setFeatureFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, rolloutPercentage: percentage } : flag
      )
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure platform settings and feature flags</p>
        </div>
        <button
          className="admin-btn admin-btn-primary mt-4 sm:mt-0"
          onClick={saveSettings}
          disabled={isSaving}
        >
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="admin-card">
            <div className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'general' && (
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue="Hypnate"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    The name displayed across the platform
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Platform URL
                  </label>
                  <input
                    type="url"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue="https://hypnate.in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Default Language
                  </label>
                  <select
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue="en"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center gap-3">
                    <button className="admin-btn admin-btn-secondary text-sm">
                      <ToggleLeft size={16} /> Off
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Enable maintenance mode to show a maintenance page to all users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'feature-flags' && (
            <div className="admin-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feature Flags</h2>
                <Link to="/admin/settings/feature-flags/new" className="admin-btn admin-btn-primary text-sm">
                  <Plus size={16} /> Add Feature Flag
                </Link>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{flag.name}</h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              flag.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {flag.isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{flag.description}</p>
                        </div>
                        <button className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <ToggleRight size={16} />
                            Enable Feature
                          </label>
                          <button
                            className={`admin-btn text-sm ${flag.isEnabled ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                            onClick={() => toggleFeatureFlag(flag.id)}
                          >
                            {flag.isEnabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                            <Percent size={16} />
                            Rollout %
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={flag.rolloutPercentage}
                              onChange={(e) => updateRolloutPercentage(flag.id, parseInt(e.target.value))}
                              className="w-32"
                            />
                            <span className="font-semibold">{flag.rolloutPercentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Billing Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Default Currency
                  </label>
                  <select
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue="INR"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Trial Period (Days)
                  </label>
                  <input
                    type="number"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue={7}
                    min={1}
                    max={30}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of days for the free trial
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Gateway
                  </label>
                  <select
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue="razorpay"
                  >
                    <option value="razorpay">Razorpay</option>
                    <option value="stripe">Stripe</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue={18}
                    min={0}
                    max={100}
                    step={0.1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Default tax rate applied to all transactions
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Notifications
                  </label>
                  <div className="flex items-center gap-3">
                    <button className="admin-btn admin-btn-primary text-sm">
                      <ToggleRight size={16} /> Enabled
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Send email notifications to users
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Push Notifications
                  </label>
                  <div className="flex items-center gap-3">
                    <button className="admin-btn admin-btn-secondary text-sm">
                      <ToggleLeft size={16} /> Disabled
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Send push notifications to users (coming soon)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    SMS Notifications
                  </label>
                  <div className="flex items-center gap-3">
                    <button className="admin-btn admin-btn-secondary text-sm">
                      <ToggleLeft size={16} /> Disabled
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Send SMS notifications to users (coming soon)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'email' && (
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Email Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="noreply@hypnate.in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Test Email
                  </label>
                  <button className="admin-btn admin-btn-primary w-full max-w-md">Send Test Email</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="admin-card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue={30}
                    min={1}
                    max={1440}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    User session timeout in minutes
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Login Attempts
                  </label>
                  <input
                    type="number"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue={5}
                    min={1}
                    max={20}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum failed login attempts before account lockout
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Lockout Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    defaultValue={15}
                    min={1}
                    max={1440}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Duration of account lockout after maximum login attempts
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Two-Factor Authentication
                  </label>
                  <div className="flex items-center gap-3">
                    <button className="admin-btn admin-btn-secondary text-sm">
                      <ToggleLeft size={16} /> Disabled
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Require two-factor authentication for all users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};