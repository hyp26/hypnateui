import React, { useState } from 'react';
import SettingsCard from './SettingsCard';
import SettingsField from './SettingsField';

const EmailSettings: React.FC = () => {
  const [testMessage, setTestMessage] = useState('');

  const sendTestEmail = () => {
    setTestMessage('Test email queued.');
    window.setTimeout(() => setTestMessage(''), 2500);
  };

  return (
    <SettingsCard
      title="Email Settings"
      description="Configure the SMTP connection used for platform email delivery."
    >
      <div className="settings-fields">
        <SettingsField label="SMTP Host">
          <input className="settings-input" type="text" placeholder="smtp.example.com" />
        </SettingsField>

        <SettingsField label="SMTP Port">
          <input className="settings-input" type="number" placeholder="587" />
        </SettingsField>

        <SettingsField label="SMTP Username">
          <input className="settings-input" type="text" placeholder="username" />
        </SettingsField>

        <SettingsField label="SMTP Password">
          <input className="settings-input" type="password" placeholder="••••••••" />
        </SettingsField>

        <SettingsField label="From Email">
          <input
            className="settings-input"
            type="email"
            placeholder="noreply@hypnate.in"
          />
        </SettingsField>

        <SettingsField
          label="Test Email"
          description="Send a test message to verify the configured email transport."
        >
          <div className="settings-inline-action">
            <button type="button" className="settings-primary-action" onClick={sendTestEmail}>
              Send Test Email
            </button>
            {testMessage && <span className="settings-save-status">{testMessage}</span>}
          </div>
        </SettingsField>
      </div>
    </SettingsCard>
  );
};

export default EmailSettings;
