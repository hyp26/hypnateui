import React from 'react';
import type { Ticket } from '../../types';

interface TicketStatsProps {
  tickets: Ticket[];
}

const TicketStats: React.FC<TicketStatsProps> = ({ tickets }) => {
  const stats = [
    {
      label: 'Total Tickets',
      value: tickets.length,
      className: 'tickets-stat__value--default',
    },
    {
      label: 'Open',
      value: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      className: 'tickets-stat__value--blue',
    },
    {
      label: 'Pending',
      value: tickets.filter((ticket) => ticket.status === 'PENDING').length,
      className: 'tickets-stat__value--amber',
    },
    {
      label: 'Critical',
      value: tickets.filter((ticket) => ticket.priority === 'CRITICAL').length,
      className: 'tickets-stat__value--red',
    },
  ];

  return (
    <div className="tickets-stats">
      {stats.map((stat) => (
        <div className="tickets-stat" key={stat.label}>
          <div className="tickets-stat__label">{stat.label}</div>
          <div className={`tickets-stat__value ${stat.className}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketStats;
