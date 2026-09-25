import React from 'react';
import SettingsCard from './SettingsCard';
import SettingsField from './SettingsField';

const BillingSettings: React.FC = () => (
  <SettingsCard
    title="Billing Settings"
    description="Configure currency, trials, payment processing, and tax defaults."
  >
    <div className="settings-fields">
      <SettingsField label="Default Currency">
        <select className="settings-input" defaultValue="INR">
          <option value="INR">Indian Rupee (₹)</option>
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">British Pound (£)</option>
        </select>
      </SettingsField>

      <SettingsField
        label="Trial Period (Days)"
        description="Number of days for the free trial."
      >
        <input className="settings-input" type="number" defaultValue={7} min={1} max={30} />
      </SettingsField>

      <SettingsField label="Payment Gateway">
        <select className="settings-input" defaultValue="razorpay">
          <option value="razorpay">Razorpay</option>
          <option value="stripe">Stripe</option>
          <option value="both">Both</option>
        </select>
      </SettingsField>

      <SettingsField
        label="Tax Rate (%)"
        description="Default tax rate applied to all transactions."
      >
        <input
          className="settings-input"
          type="number"
          defaultValue={18}
          min={0}
          max={100}
          step={0.1}
        />
      </SettingsField>
    </div>
  </SettingsCard>
);

export default BillingSettings;
