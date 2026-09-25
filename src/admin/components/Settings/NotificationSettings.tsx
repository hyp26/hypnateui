import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsField from './SettingsField';

const NotificationSettings: React.FC = () => {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [sms, setSms] = useState(false);

  const Toggle = ({
    enabled,
    onClick,
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className={`settings-toggle ${enabled ? 'is-on' : ''}`}
      onClick={onClick}
    >
      {enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      {enabled ? 'Enabled' : 'Disabled'}
    </button>
  );

  return (
    <SettingsCard
      title="Notification Settings"
      description="Choose which notification channels are enabled for the platform."
    >
      <div className="settings-fields">
        <SettingsField
          label="Email Notifications"
          description="Send email notifications to users."
        >
          <Toggle enabled={email} onClick={() => setEmail((value) => !value)} />
        </SettingsField>

        <SettingsField
          label="Push Notifications"
          description="Send push notifications to users. Coming soon."
        >
          <Toggle enabled={push} onClick={() => setPush((value) => !value)} />
        </SettingsField>

        <SettingsField
          label="SMS Notifications"
          description="Send SMS notifications to users. Coming soon."
        >
          <Toggle enabled={sms} onClick={() => setSms((value) => !value)} />
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default NotificationSettings;
