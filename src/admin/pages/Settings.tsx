import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  adminFeatureFlagsApi,
  adminSettingsApi,
  getApiErrorMessage,
} from '../lib/adminApi';
import SettingsNavigation from '../components/Settings/SettingsNavigation';
import GeneralSettings, { type GeneralSettingsField } from '../components/Settings/GeneralSettings';
import FeatureFlagsSettings from '../components/Settings/FeatureFlagsSettings';
import BillingSettings from '../components/Settings/BillingSettings';
import NotificationSettings from '../components/Settings/NotificationSettings';
import EmailSettings from '../components/Settings/EmailSettings';
import SecuritySettings from '../components/Settings/SecuritySettings';
import type { FeatureFlagConfig, Settings } from '../types';
import '../styles/Settings.css';

export interface FeatureFlag {
  id: keyof FeatureFlagConfig;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
}

// Presentational labels for the backend feature flag keys.
const featureFlagMeta: Record<keyof FeatureFlagConfig, { name: string; description: string }> = {
  maintenanceMode: {
    name: 'Maintenance Mode',
    description: 'Show a maintenance page to platform users when enabled.',
  },
  newUserRegistration: {
    name: 'New User Registration',
    description: 'Allow new sellers to sign up for the platform.',
  },
  emailNotifications: {
    name: 'Email Notifications',
    description: 'Send transactional email notifications to platform users.',
  },
  analyticsDashboard: {
    name: 'Analytics Dashboard',
    description: 'Enable the analytics dashboard for admin users.',
  },
  subscriptionUpgrades: {
    name: 'Subscription Upgrades',
    description: 'Allow sellers to upgrade or change their subscription plan.',
  },
};

const toDisplayFlags = (flags: FeatureFlagConfig): FeatureFlag[] =>
  (Object.keys(featureFlagMeta) as Array<keyof FeatureFlagConfig>).map((key) => ({
    id: key,
    ...featureFlagMeta[key],
    isEnabled: flags[key],
    rolloutPercentage: flags[key] ? 100 : 0,
    targetUsers: [],
  }));

const defaultSettings: Settings = {
  siteName: 'Hypnate',
  siteDescription: 'Internal administration panel for Hypnate',
  logoUrl: '',
  faviconUrl: '',
  defaultCurrency: 'INR',
  defaultTimezone: 'Asia/Kolkata',
  supportEmail: '',
  featureFlags: {
    maintenanceMode: false,
    newUserRegistration: true,
    emailNotifications: true,
    analyticsDashboard: true,
    subscriptionUpgrades: true,
  },
};

export type SettingsSection =
  | 'general'
  | 'feature-flags'
  | 'billing'
  | 'notifications'
  | 'email'
  | 'security';

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagConfig>(
    defaultSettings.featureFlags
  );
  const [displayFlags, setDisplayFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [settingsResult, flagsResult] = await Promise.allSettled([
        adminSettingsApi.get(),
        adminFeatureFlagsApi.get(),
      ]);

      if (cancelled) return;

      if (settingsResult.status === 'fulfilled') {
        const next = settingsResult.value;
        setSettings({ ...defaultSettings, ...next });
      }
      if (flagsResult.status === 'fulfilled') {
        const flags = {
          ...defaultSettings.featureFlags,
          ...flagsResult.value,
        };
        setFeatureFlags(flags);
        setDisplayFlags(toDisplayFlags(flags));
      }

      setIsLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const markDirty = () => {
    setSaved(false);
    setSaveError(null);
  };

  const handleGeneralChange = (
    field: GeneralSettingsField,
    value: string | boolean
  ) => {
    markDirty();
    if (field === 'maintenanceMode') {
      const flags = { ...featureFlags, maintenanceMode: Boolean(value) };
      setFeatureFlags(flags);
      setDisplayFlags(toDisplayFlags(flags));
      return;
    }
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const toggleFeatureFlag = (id: string) => {
    markDirty();
    const key = id as keyof FeatureFlagConfig;
    const flags = { ...featureFlags, [key]: !featureFlags[key] };
    setFeatureFlags(flags);
    setDisplayFlags((current) =>
      current.map((flag) =>
        flag.id === key
          ? { ...flag, isEnabled: !flag.isEnabled, rolloutPercentage: !flag.isEnabled ? 100 : 0 }
          : flag,
      ),
    );
  };

  const updateRolloutPercentage = (id: string, percentage: number) => {
    markDirty();
    setDisplayFlags((current) =>
      current.map((flag) =>
        flag.id === (id as keyof FeatureFlagConfig)
          ? { ...flag, rolloutPercentage: percentage }
          : flag,
      ),
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaved(false);
    setSaveError(null);

    try {
      await adminSettingsApi.update({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        supportEmail: settings.supportEmail,
        defaultCurrency: settings.defaultCurrency,
        defaultTimezone: settings.defaultTimezone,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
      });
      await adminFeatureFlagsApi.update(featureFlags);

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'feature-flags':
        return (
          <FeatureFlagsSettings
            featureFlags={displayFlags}
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
        return (
          <GeneralSettings
            siteName={settings.siteName}
            siteDescription={settings.siteDescription}
            supportEmail={settings.supportEmail}
            defaultCurrency={settings.defaultCurrency}
            defaultTimezone={settings.defaultTimezone}
            maintenanceMode={featureFlags.maintenanceMode}
            onChange={handleGeneralChange}
          />
        );
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
          {saveError && (
            <span className="settings-save-status settings-save-status--error" role="alert">
              {saveError}
            </span>
          )}
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
