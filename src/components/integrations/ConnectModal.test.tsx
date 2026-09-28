import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectModal } from './ConnectModal';

const mockConnectWhatsApp = jest.fn();

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
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('../../stores/useIntegrationStore', () => ({
  useIntegrationStore: (selector: any) =>
    selector({
      connectChannel: jest.fn(),
      connectWhatsApp: (...args: any[]) => mockConnectWhatsApp(...args),
    }),
}));

describe('ConnectModal - WhatsApp OAuth return context', () => {
  beforeEach(() => {
    mockConnectWhatsApp.mockClear();
  });

  it('starts the Settings OAuth flow with the settings return context', () => {
    render(<ConnectModal isOpen platform="whatsapp" onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /continue to meta/i }));

    expect(mockConnectWhatsApp).toHaveBeenCalledTimes(1);
    expect(mockConnectWhatsApp).toHaveBeenCalledWith('settings');
  });
});
