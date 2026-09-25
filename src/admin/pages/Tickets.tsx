import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  Headphones,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Tag,
  MessageSquare
} from 'lucide-react';
import type { Ticket } from '../types';

// Mock data
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
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = [...tickets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(
        (ticket) => ticket.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (priorityFilter !== 'All') {
      filtered = filtered.filter(
        (ticket) => ticket.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (status.toLowerCase()) {
      case 'open': return <span className={`${baseClasses} bg-blue-100 text-blue-600`}>Open</span>;
      case 'pending': return <span className={`${baseClasses} bg-amber-100 text-amber-600`}>Pending</span>;
      case 'resolved': return <span className={`${baseClasses} bg-green-100 text-green-600`}>Resolved</span>;
      case 'closed': return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>Closed</span>;
      default: return <span className={baseClasses}>{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (priority.toLowerCase()) {
      case 'critical': return <span className={`${baseClasses} bg-red-100 text-red-600`}>Critical</span>;
      case 'high': return <span className={`${baseClasses} bg-amber-100 text-amber-600`}>High</span>;
      case 'medium': return <span className={`${baseClasses} bg-blue-100 text-blue-600`}>Medium</span>;
      case 'low': return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>Low</span>;
      default: return <span className={baseClasses}>{priority}</span>;
    }
  };

  const toggleTicketSelection = (id: string) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((t) => t.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Tickets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer and seller support tickets</p>
        </div>
        <Link to="/admin/tickets/new" className="admin-btn admin-btn-primary mt-4 sm:mt-0">
          <Plus size={16} /> Create Ticket
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Tickets</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tickets.length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Open</div>
          <div className="text-2xl font-bold text-blue-600">{tickets.filter((t) => t.status === 'OPEN').length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-amber-600">{tickets.filter((t) => t.status === 'PENDING').length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Critical</div>
          <div className="text-2xl font-bold text-red-600">{tickets.filter((t) => t.priority === 'CRITICAL').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Search size={16} /> Search
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by ticket ID or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="relative">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={16} /> Filters
                {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        {priorityOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        className="admin-btn admin-btn-ghost text-sm"
                        onClick={() => {
                          setStatusFilter('All');
                          setPriorityFilter('All');
                          setSearchQuery('');
                          setIsFilterOpen(false);
                        }}
                      >
                        Clear
                      </button>
                      <button
                        className="admin-btn admin-btn-primary text-sm"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Headphones size={64} className="mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No tickets found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or create a new ticket
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTickets.length} selected
                </span>
              </label>
              <div className="ml-auto flex gap-2">
                <button className="admin-btn admin-btn-secondary text-sm">Export CSV</button>
                <button className="admin-btn admin-btn-danger text-sm">
                  <Trash2 size={16} /> Delete Selected
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Ticket ID</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Seller ID</th>
                    <th className="px-4 py-3 text-left">Assigned To</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => toggleTicketSelection(ticket.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{ticket.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{ticket.subject}</div>
                      </td>
                      <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                      <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{ticket.sellerId}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {ticket.assignedTo ? `Admin #${ticket.assignedTo}` : 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </div>
              <div className="flex gap-2">
                <button className="admin-btn admin-btn-secondary text-sm" disabled>Previous</button>
                <button className="admin-btn admin-btn-secondary text-sm" disabled>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};