import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || '';

type Customer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string | null;
};

type CustomerStats = {
  totalCustomers: number;
  totalRevenue: number;
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [customersRes, statsRes] = await Promise.all([
        axios.get(`${API}/customers`, { headers }),
        axios.get(`${API}/customers/stats`, { headers }),
      ]);

      setCustomers(customersRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      setError(
        err.response?.data?.message || "Failed to load customer data"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.email ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: 20 }}>Loading customers...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Customers</h2>

      <div style={{ marginBottom: 16 }}>
        <strong>Total Customers:</strong> {stats.totalCustomers} <br />
        <strong>Total Revenue:</strong> ₹{stats.totalRevenue}
      </div>

      <input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: 300 }}
      />

      <table border={1} cellPadding={10} width="100%">
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th>Orders</th>
            <th>Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan={4} align="center">
                No customers found
              </td>
            </tr>
          ) : (
            filteredCustomers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email || "-"}</td>
                <td align="center">{c.totalOrders}</td>
                <td align="center">₹{c.totalSpent}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;
