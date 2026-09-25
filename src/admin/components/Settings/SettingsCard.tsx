import React from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  actions,
}) => (
  <section className="settings-card">
    <header className="settings-card__header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="settings-card__actions">{actions}</div>}
    </header>
    <div className="settings-card__body">{children}</div>
  </section>
);

export default SettingsCard;
