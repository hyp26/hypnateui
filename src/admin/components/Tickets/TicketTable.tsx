import React from 'react';
import {
  CheckCircle,
  Headphones,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import type { Ticket } from '../../types';

interface TicketTableProps {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  isLoading: boolean;
  selectedTickets: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'blue';
    case 'PENDING':
      return 'amber';
    case 'RESOLVED':
      return 'green';
    case 'CLOSED':
      return 'gray';
    default:
      return 'gray';
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'red';
    case 'HIGH':
      return 'amber';
    case 'MEDIUM':
      return 'blue';
    case 'LOW':
      return 'gray';
    default:
      return 'gray';
  }
};

const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  filteredTickets,
  isLoading,
  selectedTickets,
  onToggle,
  onSelectAll,
}) => {
  const visibleIds = filteredTickets.map((ticket) => ticket.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedTickets.includes(id));

  if (isLoading) {
    return (
      <section className="tickets-card tickets-card--table">
        <div className="ticket-state">
          <div className="ticket-spinner" />
          <span>Loading tickets...</span>
        </div>
      </section>
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <section className="tickets-card tickets-card--table">
        <div className="ticket-state">
          <Headphones size={48} />
          <h3>No tickets found</h3>
          <p>Try adjusting your filters or create a new ticket.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="tickets-card tickets-card--table">
      <div className="ticket-selection-bar">
        <label className="ticket-select-all">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={onSelectAll}
            aria-label="Select all visible tickets"
          />
          <span>{selectedTickets.length} selected</span>
        </label>

        <div className="ticket-bulk-actions">
          <button type="button" className="ticket-action-button">
            Export CSV
          </button>
          <button type="button" className="ticket-action-button ticket-action-button--danger">
            <Trash2 size={15} />
            Delete Selected
          </button>
        </div>
      </div>

      <div className="ticket-table-scroll">
        <table className="ticket-table">
          <thead>
            <tr>
              <th className="ticket-table__check">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={onSelectAll}
                  aria-label="Select all visible tickets"
                />
              </th>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Seller ID</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th className="ticket-table__actions" aria-label="Actions" />
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="ticket-table__check">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={() => onToggle(ticket.id)}
                    aria-label={`Select ${ticket.id}`}
                  />
                </td>

                <td>
                  <span className="ticket-table__id">{ticket.id}</span>
                </td>

                <td>
                  <span className="ticket-table__subject">
                    {ticket.subject}
                  </span>
                </td>

                <td>
                  <span
                    className={`ticket-badge ticket-badge--${getPriorityClass(
                      ticket.priority,
                    )}`}
                  >
                    {ticket.priority.charAt(0) +
                      ticket.priority.slice(1).toLowerCase()}
                  </span>
                </td>

                <td>
                  <span
                    className={`ticket-badge ticket-badge--${getStatusClass(
                      ticket.status,
                    )}`}
                  >
                    {ticket.status.charAt(0) +
                      ticket.status.slice(1).toLowerCase()}
                  </span>
                </td>

                <td>
                  <span className="ticket-table__plain">{ticket.sellerId}</span>
                </td>

                <td>
                  <span className="ticket-table__plain">
                    {ticket.assignedTo
                      ? `Admin #${ticket.assignedTo}`
                      : 'Unassigned'}
                  </span>
                </td>

                <td>
                  <span className="ticket-table__date">
                    {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </td>

                <td className="ticket-table__actions">
                  <button
                    type="button"
                    className="ticket-icon-button"
                    aria-label={`Actions for ${ticket.id}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ticket-pagination">
        <span>
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>

        <div className="ticket-pagination__buttons">
          <button type="button" disabled>
            Previous
          </button>
          <button type="button" disabled>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default TicketTable;
