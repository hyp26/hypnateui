import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsField from './SettingsField';

export type GeneralSettingsField =
  | 'siteName'
  | 'siteDescription'
  | 'supportEmail'
  | 'defaultCurrency'
  | 'defaultTimezone'
  | 'maintenanceMode';

interface GeneralSettingsProps {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  onChange: (field: GeneralSettingsField, value: string | boolean) => void;
}

const currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
const timezoneOptions = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Singapore',
];

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  siteName,
  siteDescription,
  supportEmail,
  defaultCurrency,
  defaultTimezone,
  maintenanceMode,
  onChange,
}) => (
  <SettingsCard
    title="General Settings"
    description="Manage the core identity and availability of the Hypnate platform."
  >
    <div className="settings-fields">
      <SettingsField
        label="Platform Name"
        description="The name displayed across the platform."
      >
        <input
          className="settings-input"
          type="text"
          value={siteName}
          onChange={(event) => onChange('siteName', event.target.value)}
        />
      </SettingsField>

      <SettingsField
        label="Platform Description"
        description="Short description of the platform."
      >
        <input
          className="settings-input"
          type="text"
          value={siteDescription}
          onChange={(event) => onChange('siteDescription', event.target.value)}
        />
      </SettingsField>

      <SettingsField label="Support Email">
        <input
          className="settings-input"
          type="email"
          value={supportEmail}
          onChange={(event) => onChange('supportEmail', event.target.value)}
        />
      </SettingsField>

      <SettingsField label="Default Currency">
        <select
          className="settings-input"
          value={defaultCurrency}
          onChange={(event) => onChange('defaultCurrency', event.target.value)}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </SettingsField>

      <SettingsField label="Default Timezone">
        <select
          className="settings-input"
          value={defaultTimezone}
          onChange={(event) => onChange('defaultTimezone', event.target.value)}
        >
          {timezoneOptions.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
      </SettingsField>

      <SettingsField
        label="Maintenance Mode"
        description="Show a maintenance page to platform users when enabled."
      >
        <button
          type="button"
          className={`settings-toggle ${maintenanceMode ? 'is-on' : ''}`}
          onClick={() => onChange('maintenanceMode', !maintenanceMode)}
        >
          {maintenanceMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {maintenanceMode ? 'Enabled' : 'Off'}
        </button>
      </SettingsField>
    </div>
  </SettingsCard>
);

export default GeneralSettings;
