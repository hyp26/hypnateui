
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConnectModal } from './ConnectModal';

const mockConnectWhatsApp = jest.fn();
const mockConnectChannel = jest.fn();
const mockMarkTelegramConnected = jest.fn();
const mockApiPost = jest.fn();

jest.mock('../ui/Modal', () => ({
  Modal: ({ children, isOpen, title }: any) =>
    isOpen ? (
      <div>
        <div>{title}</div>
        {children}
      </div>
    ) : null,
}));

jest.mock('../ui/Button', () => ({
  Button: ({ children, isLoading, ...props }: any) => (
    <button {...props} disabled={isLoading || props.disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    post: (...args: any[]) => mockApiPost(...args),
  },
}));

jest.mock('../../stores/useIntegrationStore', () => ({
  useIntegrationStore: (selector: any) =>
    selector({
      connectChannel: (...args: any[]) => mockConnectChannel(...args),
      connectWhatsApp: (...args: any[]) => mockConnectWhatsApp(...args),
      markTelegramConnected: (...args: any[]) =>
        mockMarkTelegramConnected(...args),
    }),
}));

describe('ConnectModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiPost.mockResolvedValue({ data: {} });
    mockConnectChannel.mockResolvedValue(undefined);
  });

  describe('WhatsApp OAuth', () => {
    it('starts the Settings OAuth flow with the settings return context', () => {
      render(
        <ConnectModal
          isOpen
          platform="whatsapp"
          onClose={jest.fn()}
        />
      );

      fireEvent.click(
        screen.getByRole('button', { name: /continue to meta/i })
      );

      expect(mockConnectWhatsApp).toHaveBeenCalledTimes(1);
      expect(mockConnectWhatsApp).toHaveBeenCalledWith('settings');
    });
  });

  describe('Telegram API connection', () => {
    const botToken = '123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const renderTelegramModal = (onClose = jest.fn()) => {
      render(
        <ConnectModal
          isOpen
          platform="telegram"
          onClose={onClose}
        />
      );

      return onClose;
    };

    const enterToken = () => {
      fireEvent.change(
        screen.getByLabelText(/bot token/i),
        { target: { value: botToken } }
      );
    };

    it('connects through the real Telegram API and updates local state after success', async () => {
      const onClose = renderTelegramModal();

      enterToken();

      fireEvent.click(
        screen.getByRole('button', { name: /connect bot/i })
      );

      await waitFor(() => {
        expect(mockApiPost).toHaveBeenCalledWith(
          '/api/channels/telegram',
          { botToken }
        );
      });

      await waitFor(() => {
        expect(mockMarkTelegramConnected).toHaveBeenCalledWith(
          'Telegram Bot'
        );
        expect(onClose).toHaveBeenCalledTimes(1);
      });

      expect(
        (screen.getByLabelText(/bot token/i) as HTMLInputElement).value
      ).toBe('');

      expect(mockConnectChannel).not.toHaveBeenCalled();
    });

    it('does not mark Telegram connected when the backend rejects the token', async () => {
      mockApiPost.mockRejectedValue(new Error('Invalid token'));

      const onClose = renderTelegramModal();

      enterToken();

      fireEvent.click(
        screen.getByRole('button', { name: /connect bot/i })
      );

      expect(
        await screen.findByRole('alert')
      ).toHaveTextContent(/connection failed/i);

      expect(mockMarkTelegramConnected).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not mark Telegram connected when the API request fails', async () => {
      mockApiPost.mockRejectedValue(new Error('Network Error'));

      const onClose = renderTelegramModal();

      enterToken();

      fireEvent.click(
        screen.getByRole('button', { name: /connect bot/i })
      );

      expect(
        await screen.findByRole('alert')
      ).toHaveTextContent(/connection failed/i);

      expect(mockMarkTelegramConnected).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
