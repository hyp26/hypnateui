import React from 'react';
import { MoreVertical, Percent, Plus, ToggleRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsCard from './SettingsCard';
import type { FeatureFlag } from '../../pages/Settings';

interface FeatureFlagsSettingsProps {
  featureFlags: FeatureFlag[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onRolloutChange: (id: string, percentage: number) => void;
}

const FeatureFlagsSettings: React.FC<FeatureFlagsSettingsProps> = ({
  featureFlags,
  isLoading,
  onToggle,
  onRolloutChange,
}) => (
  <SettingsCard
    title="Feature Flags"
    description="Control feature availability and rollout percentages across the platform."
    actions={
      <Link to="/admin/settings/feature-flags/new" className="settings-secondary-action">
        <Plus size={16} />
        Add Feature Flag
      </Link>
    }
  >
    {isLoading ? (
      <div className="settings-loading">
        <div className="settings-spinner" />
        <span>Loading feature flags...</span>
      </div>
    ) : (
      <div className="feature-flags-list">
        {featureFlags.map((flag) => (
          <article className="feature-flag" key={flag.id}>
            <div className="feature-flag__top">
              <div className="feature-flag__identity">
                <div className="feature-flag__title-row">
                  <h3>{flag.name}</h3>
                  <span
                    className={`feature-flag__status ${
                      flag.isEnabled ? 'is-enabled' : 'is-disabled'
                    }`}
                  >
                    {flag.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p>{flag.description}</p>
              </div>

              <button type="button" className="feature-flag__menu" aria-label={`Actions for ${flag.name}`}>
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="feature-flag__controls">
              <div>
                <div className="feature-flag__control-label">
                  <ToggleRight size={16} />
                  Enable Feature
                </div>
                <button
                  type="button"
                  className={`settings-toggle ${flag.isEnabled ? 'is-on' : ''}`}
                  onClick={() => onToggle(flag.id)}
                >
                  <ToggleRight size={17} />
                  {flag.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="feature-flag__rollout">
                <div className="feature-flag__control-label">
                  <Percent size={16} />
                  Rollout
                </div>
                <div className="feature-flag__range">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={(event) =>
                      onRolloutChange(flag.id, Number(event.target.value))
                    }
                    aria-label={`${flag.name} rollout percentage`}
                  />
                  <strong>{flag.rolloutPercentage}%</strong>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </SettingsCard>
);

export default FeatureFlagsSettings;
