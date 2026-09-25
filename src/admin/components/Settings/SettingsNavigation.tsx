import React from 'react';
import {
  Bell,
  CreditCard,
  Mail,
  Settings as SettingsIcon,
  Shield,
  ToggleRight,
} from 'lucide-react';
import type { SettingsSection } from '../../pages/Settings';

interface SettingsNavigationProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const sections: Array<{
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
  { id: 'feature-flags', label: 'Feature Flags', icon: <ToggleRight size={18} /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'email', label: 'Email', icon: <Mail size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
];

const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => (
  <aside className="settings-navigation">
    <div className="settings-navigation__label">Configuration</div>

    <nav aria-label="Settings sections">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`settings-navigation__item ${
            activeSection === section.id ? 'is-active' : ''
          }`}
          onClick={() => onSectionChange(section.id)}
        >
          <span className="settings-navigation__icon">{section.icon}</span>
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  </aside>
);

export default SettingsNavigation;
