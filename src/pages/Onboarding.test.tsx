import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  useAuthStore: mockUseAuthStore,
}));

jest.mock('../stores/useIntegrationStore', () => ({
  useIntegrationStore: mockUseIntegrationStore,
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
  ChannelModal: () => null,
}));
jest.mock('../components/onboarding/ChannelsStep', () => ({
  ChannelsStep: ({ channels, error }: any) => (
    <div>
      <span data-testid="wa-connected">
        {String(channels?.whatsapp?.connected)}
      </span>
      {error && <div role="alert">{error}</div>}
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
  });

  it('restores Step 4 and fetches the real status after wa=connected', async () => {
    window.history.replaceState(null, '', '/onboarding?wa=connected');

    renderOnboarding();

    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    expect(mockLoadWhatsAppStatus).toHaveBeenCalledTimes(1);
    expect(window.location.search).toBe('');

    await waitFor(() =>
      expect(screen.getByTestId('wa-connected').textContent).toBe('true')
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps WhatsApp disconnected when the backend reports connected=false', async () => {
    mockWhatsAppStatus = { connected: false };
    window.history.replaceState(null, '', '/onboarding?wa=connected');

    renderOnboarding();

    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
    expect(mockLoadWhatsAppStatus).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(screen.getByTestId('wa-connected').textContent).toBe('false')
    );
    expect(screen.getByRole('alert').textContent).toMatch(
      /could not connect whatsapp/i
    );
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
