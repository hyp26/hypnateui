import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DataDeletion } from './DataDeletion';

describe('DataDeletion page', () => {
  it('renders the public data-deletion instructions without authentication', () => {
    render(
      <BrowserRouter>
        <DataDeletion />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /data deletion/i })).toBeInTheDocument();
    expect(
      screen.getByText(/deletion requests are reviewed and processed by hypnate/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/account email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit deletion request/i })
    ).toBeInTheDocument();
  });

  it('does not ask for or accept account IDs in the request form', () => {
    render(
      <BrowserRouter>
        <DataDeletion />
      </BrowserRouter>
    );

    expect(screen.queryByLabelText(/user ?id/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/seller ?id/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/customer ?id/i)).not.toBeInTheDocument();
  });
});
