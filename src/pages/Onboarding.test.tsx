import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import api from '../lib/api';
import { MemoryRouter } from 'react-router-dom';
import { Onboarding } from './Onboarding';

const mockLoadWhatsAppStatus = jest.fn();
let mockWhatsAppStatus: any = { connected: true };

const mockUseIntegrationStore: any = (selector: any) =>
  selector({ loadWhatsAppStatus: mockLoadWhatsAppStatus });
mockUseIntegrationStore.getState = () => ({
  loadWhatsAppStatus: mockLoadWhatsAppStatus,
  whatsapp: mockWhatsAppStatus,
});

const mockUseAuthStore: any = (selector: any) =>
  selector({ user: null, setUser: jest.fn() });
mockUseAuthStore.getState = () => ({ loadProfile: jest.fn() });

jest.mock('../lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn().mockResolvedValue({ data: {} }) },
}));

jest.mock('../stores/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (...args: any[]) => mockUseAuthStore(...args),
    {
      getState: (...args: any[]) => mockUseAuthStore.getState(...args),
    }
  ),
}));

jest.mock('../stores/useIntegrationStore', () => ({
  useIntegrationStore: Object.assign(
    (...args: any[]) => mockUseIntegrationStore(...args),
    {
      getState: (...args: any[]) => mockUseIntegrationStore.getState(...args),
    }
  ),
}));

jest.mock('../config/planEntitlements', () => ({
  hasPlanChannel: () => true,
}));

jest.mock('lucide-react', () => ({
  Loader2: () => null,
  Sparkles: () => null,
}));

jest.mock('../components/onboarding/Onboardingstepper', () => ({
  OnboardingStepper: () => null,
}));
jest.mock('../components/onboarding/OnboardingFooter', () => ({
  OnboardingFooter: () => null,
}));
jest.mock('../components/onboarding/BusinessStep', () => ({
  BusinessStep: () => null,
}));
jest.mock('../components/onboarding/CatalogStep', () => ({
  CatalogStep: () => null,
}));
jest.mock('../components/onboarding/PaymentsStep', () => ({
  PaymentsStep: () => null,
}));
jest.mock('../components/onboarding/SummaryStep', () => ({
  SummaryStep: () => null,
}));
jest.mock('../components/onboarding/SkipConfirmPopup', () => ({
  SkipConfirmPopup: () => null,
}));
jest.mock('../components/onboarding/ChannelModal', () => ({
  ChannelModal: ({ type, onConnect, onClose }: any) => {
    const React = require('react');
    const [error, setError] = React.useState('');

    if (type !== 'telegram') return null;

    const submit = async () => {
      try {
        await onConnect(type, {
          botToken: '123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        });
        onClose();
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Could not connect Telegram.'
        );
      }
    };

    return (
      <div>
        <button type="button" onClick={submit}>
          Submit Telegram
        </button>
        {error && <div role="alert">{error}</div>}
      </div>
    );
  },
}));

jest.mock('../components/onboarding/ChannelsStep', () => ({
  ChannelsStep: ({ channels, error, onOpenChannel }: any) => (
    <div>
      <span data-testid="wa-connected">
        {String(channels?.whatsapp?.connected)}
      </span>

      <span data-testid="telegram-connected">
        {String(channels?.telegram?.connected)}
      </span>

      <span data-testid="telegram-token">
        {channels?.telegram?.botToken || ''}
      </span>

      {error && <div role="alert">{error}</div>}

      <button
        type="button"
        onClick={() => onOpenChannel('telegram')}
      >
        Open Telegram
      </button>
    </div>
  ),
}));

const renderOnboarding = () =>
  render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  );

describe('Onboarding - WhatsApp OAuth return', () => {
  beforeEach(() => {
    mockLoadWhatsAppStatus.mockClear();
    mockLoadWhatsAppStatus.mockResolvedValue(undefined);
    mockWhatsAppStatus = { connected: true };
    window.history.replaceState(null, '', '/onboarding');
    (api.post as jest.Mock).mockReset();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  it('restores Step 4 and fetches the real status after wa=connected', async () => {
    window.history.replaceState(null, '', '/onboarding?wa=connected');

    renderOnboarding();

    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    expect(mockLoadWhatsAppStatus).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe('');

    await waitFor(() => {
      expect(screen.getByTestId('wa-connected').textContent).toBe('true');
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('keeps WhatsApp disconnected when the backend reports connected=false', async () => {
    mockWhatsAppStatus = { connected: false };
    window.history.replaceState(null, '', '/onboarding?wa=connected');

    renderOnboarding();

    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    expect(mockLoadWhatsAppStatus).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByTestId('wa-connected').textContent).toBe('false');
      expect(screen.getByRole('alert')).toHaveTextContent(
        /could not connect whatsapp/i
      );
    });
  });

  it('stays on Step 4 with a safe error after wa=error', () => {
    window.history.replaceState(
      null,
      '',
      '/onboarding?wa=error&reason=state_mismatch'
    );

    renderOnboarding();

    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    expect(mockLoadWhatsAppStatus).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toMatch(
      /could not verify your whatsapp session/i
    );
    expect(window.location.search).toBe('');
  });
});

describe('Onboarding - Telegram API connection', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/onboarding?wa=connected');
    mockWhatsAppStatus = { connected: true };

    (api.post as jest.Mock).mockReset();
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  it('connects Telegram through the backend API and clears the token', async () => {
    renderOnboarding();

    fireEvent.click(await screen.findByRole('button', {
      name: /open telegram/i,
    }));

    fireEvent.click(screen.getByRole('button', {
      name: /submit telegram/i,
    }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/channels/telegram',
        {
          botToken: '123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('telegram-connected'))
        .toHaveTextContent('true');

      expect(screen.getByTestId('telegram-token'))
        .toBeEmptyDOMElement();
    });
  });

  it('does not mark Telegram connected when the backend rejects the token', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid Telegram bot token')
    );

    renderOnboarding();

    fireEvent.click(await screen.findByRole('button', {
      name: /open telegram/i,
    }));

    fireEvent.click(screen.getByRole('button', {
      name: /submit telegram/i,
    }));

    expect(await screen.findByRole('alert'))
      .toHaveTextContent(/invalid telegram bot token/i);

    expect(screen.getByTestId('telegram-connected'))
      .toHaveTextContent('false');

    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('does not mark Telegram connected when the backend is unavailable', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(
      new Error('Network Error')
    );

    renderOnboarding();

    fireEvent.click(await screen.findByRole('button', {
      name: /open telegram/i,
    }));

    fireEvent.click(screen.getByRole('button', {
      name: /submit telegram/i,
    }));

    expect(await screen.findByRole('alert'))
      .toHaveTextContent(/network error/i);

    expect(screen.getByTestId('telegram-connected'))
      .toHaveTextContent('false');
  });
});
