import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import SettingsNavigation from '../components/Settings/SettingsNavigation';
import GeneralSettings from '../components/Settings/GeneralSettings';
import FeatureFlagsSettings from '../components/Settings/FeatureFlagsSettings';
import BillingSettings from '../components/Settings/BillingSettings';
import NotificationSettings from '../components/Settings/NotificationSettings';
import EmailSettings from '../components/Settings/EmailSettings';
import SecuritySettings from '../components/Settings/SecuritySettings';
import '../styles/Settings.css';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
}

const initialFeatureFlags: FeatureFlag[] = [
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

export type SettingsSection =
  | 'general'
  | 'feature-flags'
  | 'billing'
  | 'notifications'
  | 'email'
  | 'security';

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFeatureFlags(initialFeatureFlags);
      setIsLoading(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  const toggleFeatureFlag = (id: string) => {
    setFeatureFlags((current) =>
      current.map((flag) =>
        flag.id === id ? { ...flag, isEnabled: !flag.isEnabled } : flag,
      ),
    );
    setSaved(false);
  };

  const updateRolloutPercentage = (id: string, percentage: number) => {
    setFeatureFlags((current) =>
      current.map((flag) =>
        flag.id === id
          ? { ...flag, rolloutPercentage: percentage }
          : flag,
      ),
    );
    setSaved(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaved(false);

    await new Promise((resolve) => window.setTimeout(resolve, 500));

    setIsSaving(false);
    setSaved(true);

    window.setTimeout(() => setSaved(false), 2500);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'feature-flags':
        return (
          <FeatureFlagsSettings
            featureFlags={featureFlags}
            isLoading={isLoading}
            onToggle={toggleFeatureFlag}
            onRolloutChange={updateRolloutPercentage}
          />
        );
      case 'billing':
        return <BillingSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'email':
        return <EmailSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'general':
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <div>
          <h1 className="settings-page__title">Settings</h1>
          <p className="settings-page__subtitle">
            Configure platform settings and feature flags
          </p>
        </div>

        <div className="settings-page__header-actions">
          {saved && <span className="settings-save-status">Changes saved</span>}
          <button
            type="button"
            className="settings-save-button"
            onClick={saveSettings}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </header>

      <div className="settings-layout">
        <SettingsNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="settings-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Settings;
