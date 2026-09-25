import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsField from './SettingsField';

const SecuritySettings: React.FC = () => {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <SettingsCard
      title="Security Settings"
      description="Configure session and account protection policies."
    >
      <div className="settings-fields">
        <SettingsField
          label="Session Timeout (Minutes)"
          description="User session timeout in minutes."
        >
          <input
            className="settings-input"
            type="number"
            defaultValue={30}
            min={1}
            max={1440}
          />
        </SettingsField>

        <SettingsField
          label="Maximum Login Attempts"
          description="Maximum failed login attempts before account lockout."
        >
          <input
            className="settings-input"
            type="number"
            defaultValue={5}
            min={1}
            max={20}
          />
        </SettingsField>

        <SettingsField
          label="Lockout Duration (Minutes)"
          description="Duration of account lockout after maximum login attempts."
        >
          <input
            className="settings-input"
            type="number"
            defaultValue={15}
            min={1}
            max={1440}
          />
        </SettingsField>

        <SettingsField
          label="Two-Factor Authentication"
          description="Require two-factor authentication for all users."
        >
          <button
            type="button"
            className={`settings-toggle ${twoFactor ? 'is-on' : ''}`}
            onClick={() => setTwoFactor((value) => !value)}
          >
            {twoFactor ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {twoFactor ? 'Enabled' : 'Disabled'}
          </button>
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default SecuritySettings;
