import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Ticket } from '../types';
import TicketStats from '../components/Tickets/TicketStats';
import TicketFilters from '../components/Tickets/TicketFilters';
import TicketTable from '../components/Tickets/TicketTable';
import '../styles/Tickets.css';

const mockTickets: Ticket[] = [
  {
    id: 'TKT-2024-001234',
    subject: 'Payment not processing',
    status: 'OPEN',
    priority: 'HIGH',
    sellerId: 1,
    customerId: 1,
    assignedTo: 1,
    createdAt: '2024-01-28T10:30:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
  },
  {
    id: 'TKT-2024-001235',
    subject: 'How to connect Instagram?',
    status: 'PENDING',
    priority: 'MEDIUM',
    sellerId: 2,
    customerId: undefined,
    assignedTo: 2,
    createdAt: '2024-01-27T16:45:00Z',
    updatedAt: '2024-01-27T18:00:00Z',
  },
  {
    id: 'TKT-2024-001236',
    subject: 'Order not delivered',
    status: 'RESOLVED',
    priority: 'HIGH',
    sellerId: 3,
    customerId: 3,
    assignedTo: 1,
    createdAt: '2024-01-26T14:20:00Z',
    updatedAt: '2024-01-27T11:30:00Z',
  },
  {
    id: 'TKT-2024-001237',
    subject: 'Feature request: Bulk import',
    status: 'OPEN',
    priority: 'LOW',
    sellerId: 4,
    customerId: undefined,
    assignedTo: undefined,
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'TKT-2024-001238',
    subject: 'Bug: Dashboard not loading',
    status: 'CLOSED',
    priority: 'CRITICAL',
    sellerId: 5,
    customerId: 5,
    assignedTo: 1,
    createdAt: '2024-01-24T09:15:00Z',
    updatedAt: '2024-01-25T10:30:00Z',
  },
];

const statusOptions = ['All', 'Open', 'Pending', 'Resolved', 'Closed'];
const priorityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTickets(mockTickets);
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
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
        ticket.status.toLowerCase() === statusFilter.toLowerCase();

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

        <Link to="/admin/tickets/new" className="tickets-primary-button">
          <Plus size={17} />
          Create Ticket
        </Link>
      </header>

      <TicketStats tickets={tickets} />

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
