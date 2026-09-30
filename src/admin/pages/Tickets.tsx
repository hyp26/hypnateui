import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminTicketsApi, getApiErrorMessage, type AdminTicket } from '../lib/adminApi';
import type { Ticket } from '../types';
import TicketStats from '../components/Tickets/TicketStats';
import TicketFilters from '../components/Tickets/TicketFilters';
import TicketTable from '../components/Tickets/TicketTable';
import '../styles/Tickets.css';

const mapApiTicket = (ticket: AdminTicket): Ticket => ({
  id: ticket.ticketNumber || ticket.id,
  ticketNumber: ticket.ticketNumber || ticket.id,
  subject: ticket.subject,
  description: ticket.description,
  status: ticket.status as Ticket['status'],
  priority: ticket.priority as Ticket['priority'],
  category: ticket.category,
  sellerId: ticket.sellerId,
  customerId: ticket.customerId,
  assignedToId: ticket.assignedToId,
  assignedTo: ticket.assignedTo ? ticket.assignedTo.id : undefined,
  tags: ticket.tags,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

const statusOptions = ['All', 'Open', 'Pending', 'In Progress', 'Resolved', 'Closed'];
const priorityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    adminTicketsApi
      .list({ limit: 100 })
      .then((response) => {
        if (cancelled) return;
        setTickets(response.data.map(mapApiTicket));
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(getApiErrorMessage(error));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        ticket.status.toLowerCase() === statusFilter.toLowerCase().replace(' ', '_');

      const matchesPriority =
        priorityFilter === 'All' ||
        ticket.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    setSelectedTickets((current) =>
      current.filter((id) => filteredTickets.some((ticket) => ticket.id === id)),
    );
  }, [filteredTickets]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const toggleTicketSelection = (id: string) => {
    setSelectedTickets((current) =>
      current.includes(id)
        ? current.filter((ticketId) => ticketId !== id)
        : [...current, id],
    );
  };

  const selectAll = () => {
    const visibleIds = filteredTickets.map((ticket) => ticket.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedTickets.includes(id));

    setSelectedTickets((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  return (
    <div className="tickets-page">
      <header className="tickets-page__header">
        <div>
          <h1 className="tickets-page__title">Support Tickets</h1>
          <p className="tickets-page__subtitle">
            Manage customer and seller support tickets
          </p>
        </div>

        <Link to="/admin/tickets" className="tickets-primary-button">
          <Plus size={17} />
          Create Ticket
        </Link>
      </header>

      <TicketStats tickets={tickets} />

      {loadError && (
        <div className="tickets-card tickets-card--filters">
          <span role="alert">{loadError}</span>
        </div>
      )}

      <section className="tickets-card tickets-card--filters">
        <TicketFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onClear={clearFilters}
        />
      </section>

      <TicketTable
        tickets={tickets}
        filteredTickets={filteredTickets}
        isLoading={isLoading}
        selectedTickets={selectedTickets}
        onToggle={toggleTicketSelection}
        onSelectAll={selectAll}
      />
    </div>
  );
};

export default Tickets;
