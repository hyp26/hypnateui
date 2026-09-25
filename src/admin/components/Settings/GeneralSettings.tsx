import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsField from './SettingsField';

const GeneralSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <SettingsCard
      title="General Settings"
      description="Manage the core identity and availability of the Hypnate platform."
    >
      <div className="settings-fields">
        <SettingsField
          label="Platform Name"
          description="The name displayed across the platform."
        >
          <input className="settings-input" type="text" defaultValue="Hypnate" />
        </SettingsField>

        <SettingsField label="Platform URL">
          <input
            className="settings-input"
            type="url"
            defaultValue="https://hypnate.in"
          />
        </SettingsField>

        <SettingsField label="Default Language">
          <select className="settings-input" defaultValue="en">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
        </SettingsField>

        <SettingsField
          label="Maintenance Mode"
          description="Show a maintenance page to platform users when enabled."
        >
          <button
            type="button"
            className={`settings-toggle ${maintenanceMode ? 'is-on' : ''}`}
            onClick={() => setMaintenanceMode((current) => !current)}
          >
            {maintenanceMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {maintenanceMode ? 'Enabled' : 'Off'}
          </button>
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default GeneralSettings;
