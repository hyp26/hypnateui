import React from 'react';

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsField: React.FC<SettingsFieldProps> = ({
  label,
  description,
  children,
}) => (
  <div className="settings-field">
    <div className="settings-field__copy">
      <label className="settings-field__label">{label}</label>
      {description && <p className="settings-field__description">{description}</p>}
    </div>
    <div className="settings-field__control">{children}</div>
  </div>
);

export default SettingsField;
