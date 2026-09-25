import React from 'react';
import { X, UserPlus, ShieldCheck, Headset } from 'lucide-react';

type ManagedRole = 'ADMIN' | 'SUPPORT';

interface Props {
  createRole: ManagedRole;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  canCreateAdmin: boolean;
  canCreateSupport: boolean;
  onRoleChange: (value: ManagedRole) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const CreateAdminUserModal: React.FC<Props> = ({
  createRole,
  firstName,
  lastName,
  email,
  password,
  canCreateAdmin,
  canCreateSupport,
  onRoleChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onClose,
  onSubmit,
}) => (
  <div className="adminusers-modal-backdrop" onMouseDown={onClose}>
    <div
      className="adminusers-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-admin-user-title"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="adminusers-modal-header">
        <div className="adminusers-modal-title">
          <div className="adminusers-modal-icon">
            <UserPlus size={19} />
          </div>
          <div>
            <h2 id="create-admin-user-title">Create account</h2>
            <p>Create an Admin or Support account based on your permissions.</p>
          </div>
        </div>
        <button type="button" className="adminusers-modal-close" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="adminusers-form-section">
          <label>Account type</label>
          <div className="adminusers-role-options">
            {canCreateAdmin && (
              <button
                type="button"
                className={`adminusers-role-option ${createRole === 'ADMIN' ? 'selected' : ''}`}
                onClick={() => onRoleChange('ADMIN')}
              >
                <ShieldCheck size={18} />
                <span><strong>Admin</strong><small>Manage permitted platform operations</small></span>
              </button>
            )}
            {canCreateSupport && (
              <button
                type="button"
                className={`adminusers-role-option ${createRole === 'SUPPORT' ? 'selected' : ''}`}
                onClick={() => onRoleChange('SUPPORT')}
              >
                <Headset size={18} />
                <span><strong>Support</strong><small>Handle support-level operations</small></span>
              </button>
            )}
          </div>
        </div>

        <div className="adminusers-form-grid">
          <label>
            First name
            <input value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} required />
          </label>
          <label>
            Last name
            <input value={lastName} onChange={(e) => onLastNameChange(e.target.value)} required />
          </label>
        </div>

        <label className="adminusers-form-field">
          Email address
          <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} required />
        </label>

        <label className="adminusers-form-field">
          Temporary password
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            minLength={8}
            required
          />
          <small>Use at least 8 characters.</small>
        </label>

        <div className="adminusers-modal-footer">
          <button type="button" className="adminusers-secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="adminusers-primary-btn">
            <UserPlus size={16} />
            Create {createRole === 'ADMIN' ? 'Admin' : 'Support'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
