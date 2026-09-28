import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChannelModal } from './ChannelModal';

const connectWhatsAppMock = jest.fn();

jest.mock('../../stores/useIntegrationStore', () => ({
  useIntegrationStore: (selector: any) =>
    selector({ connectWhatsApp: () => connectWhatsAppMock() }),
}));

describe('ChannelModal — WhatsApp OAuth-only flow', () => {
  beforeEach(() => {
    connectWhatsAppMock.mockClear();
    window.sessionStorage.clear();
  });

  const renderWhatsAppModal = (onConnect = jest.fn()) =>
    render(<ChannelModal type="whatsapp" onClose={jest.fn()} onConnect={onConnect} />);

  it('does not render manual credential fields for WhatsApp', () => {
    renderWhatsAppModal();

    expect(screen.queryByLabelText(/phone number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/api key/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/EAAG/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/access token from your meta developer setup/i)).not.toBeInTheDocument();
  });

  it('does not link WhatsApp merchants to developer setup documentation', () => {
    renderWhatsAppModal();

    expect(screen.queryByText(/open meta setup guide/i)).not.toBeInTheDocument();
  });

  it('shows the merchant OAuth steps and a Connect with Meta CTA', () => {
    renderWhatsAppModal();

    expect(
      screen.getByText(/Select the WhatsApp Business account and phone number you want to connect/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect with meta/i })).toBeInTheDocument();
  });

  it('starts the real OAuth flow from onboarding and marks the return context', () => {
    const onConnect = jest.fn();
    renderWhatsAppModal(onConnect);

    fireEvent.click(screen.getByRole('button', { name: /connect with meta/i }));

    expect(connectWhatsAppMock).toHaveBeenCalledTimes(1);
    expect(onConnect).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem('hypnate_whatsapp_oauth_return')).toBe('onboarding');
  });

  it('keeps the Telegram bot-token flow unchanged', () => {
    render(
      <ChannelModal type="telegram" onClose={jest.fn()} onConnect={jest.fn().mockResolvedValue(undefined)} />
    );

    expect(screen.getByLabelText(/telegram bot token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect telegram/i })).toBeInTheDocument();
  });
});
