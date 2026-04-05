import { useEffect, useState, useRef } from "react";
import api from '../lib/api';

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

/* ─── tiny avatar helper ─── */
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const avatarColor = (name: string) => {
  const colors = [
    "#FF6B35",
    "#F7931E",
    "#2EC4B6",
    "#E71D36",
    "#011627",
    "#7B2D8B",
    "#1A936F",
    "#C6AC8F",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<CustomerStats>({ totalCustomers: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<"totalOrders" | "totalSpent" | "name">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visible, setVisible] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  /* ── BUG FIX: use Promise.allSettled so one failing endpoint
       doesn't kill the whole page. Stats are non-critical. ── */
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [customersResult, statsResult] = await Promise.allSettled([
        api.get("/api/customers"),
        api.get("/api/customers/stats"),
      ]);

      if (customersResult.status === "fulfilled") {
        setCustomers(customersResult.value.data);
      } else {
        throw new Error(
          customersResult.reason?.response?.data?.message ||
          "Failed to load customers"
        );
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      }
      // stats failing is non-fatal — page still renders
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      setError(err.message || "Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = customers
    .filter((c) =>
      `${c.name} ${c.email ?? ""} ${c.phone ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = sortKey === "name" ? a.name : a[sortKey];
      const bv = sortKey === "name" ? b.name : b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey === col ? (
      <span style={{ marginLeft: 4, opacity: 0.8 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <span style={{ marginLeft: 4, opacity: 0.25 }}>↕</span>
    );

  /* ── LOADING ── */
  if (loading) return (
    <div style={styles.centerBox}>
      <div style={styles.spinner} />
      <p style={{ color: "#94a3b8", marginTop: 16, fontFamily: "'DM Sans', sans-serif" }}>
        Loading customers…
      </p>
    </div>
  );

  /* ── ERROR ── */
  if (error) return (
    <div style={styles.centerBox}>
      <div style={styles.errorCard}>
        <div style={styles.errorIcon}>⚠</div>
        <h3 style={styles.errorTitle}>Couldn't load customers</h3>
        <p style={styles.errorMsg}>{error}</p>
        <button style={styles.retryBtn} onClick={loadData}>Retry</button>
      </div>
    </div>
  );

  /* ── MAIN ── */
  return (
    <>
      <style>{css}</style>
      <div style={{ ...styles.page, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(12px)", transition: "opacity 0.45s ease, transform 0.45s ease" }}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Customers</h1>
            <p style={styles.subtitle}>Manage and track your customer base</p>
          </div>
          <button style={styles.exportBtn}>↑ Export CSV</button>
        </div>

        {/* Stat cards */}
        <div style={styles.statsRow}>
          <StatCard label="Total Customers" value={stats.totalCustomers.toLocaleString()} accent="#FF6B35" icon="👥" delay={0} />
          <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} accent="#2EC4B6" icon="₹" delay={80} />
          <StatCard label="Avg. Spent" value={stats.totalCustomers ? `₹${Math.round(stats.totalRevenue / stats.totalCustomers).toLocaleString()}` : "—"} accent="#F7931E" icon="📊" delay={160} />
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            ref={searchRef}
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            className="cust-search"
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={{ ...styles.th, cursor: "pointer" }} onClick={() => toggleSort("name")}>
                  Customer <SortIcon col="name" />
                </th>
                <th style={styles.th}>Contact</th>
                <th style={{ ...styles.th, cursor: "pointer", textAlign: "center" }} onClick={() => toggleSort("totalOrders")}>
                  Orders <SortIcon col="totalOrders" />
                </th>
                <th style={{ ...styles.th, cursor: "pointer", textAlign: "right" }} onClick={() => toggleSort("totalSpent")}>
                  Total Spent <SortIcon col="totalSpent" />
                </th>
                <th style={{ ...styles.th, textAlign: "center" }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.emptyCell}>
                    <div style={styles.emptyBox}>
                      <span style={{ fontSize: 40 }}>🕵️</span>
                      <p>No customers match "{search}"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} style={styles.row} className="cust-row">
                    <td style={{ ...styles.td, color: "#94a3b8", fontSize: 12, width: 36 }}>{i + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={{ ...styles.avatar, background: avatarColor(c.name) }}>
                          {initials(c.name)}
                        </div>
                        <span style={styles.nameText}>{c.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.contactCell}>
                        {c.email && <span style={styles.contactLine}>✉ {c.email}</span>}
                        {c.phone && <span style={{ ...styles.contactLine, color: "#94a3b8" }}>📞 {c.phone}</span>}
                        {!c.email && !c.phone && <span style={{ color: "#cbd5e1" }}>—</span>}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{ ...styles.badge, background: c.totalOrders > 5 ? "#dcfce7" : "#f1f5f9", color: c.totalOrders > 5 ? "#166534" : "#475569" }}>
                        {c.totalOrders}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      <span style={styles.spent}>₹{c.totalSpent.toLocaleString()}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                      {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={styles.footer}>
          Showing {filtered.length} of {customers.length} customers
        </p>
      </div>
    </>
  );
};

/* ── Stat Card sub-component ── */
const StatCard = ({ label, value, accent, icon, delay }: { label: string; value: string; accent: string; icon: string; delay: number }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay + 100); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ ...styles.statCard, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(10px)", transition: "opacity 0.4s ease, transform 0.4s ease", borderTop: `3px solid ${accent}` }} className="stat-card">
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={{ ...styles.statValue, color: accent }}>{value}</p>
      </div>
    </div>
  );
};

/* ── Styles ── */
const styles: Record<string, React.CSSProperties> = {
  page: { padding: "32px 36px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#94a3b8", margin: "4px 0 0", fontWeight: 400 },
  exportBtn: { background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 },
  statCard: { background: "#fff", borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" },
  statLabel: { fontSize: 12, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 },
  statValue: { fontSize: 22, fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" },
  searchWrap: { position: "relative", marginBottom: 20 },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" },
  searchInput: { width: "100%", boxSizing: "border-box", padding: "12px 16px 12px 42px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#fff", color: "#0f172a", outline: "none", transition: "border-color 0.2s" },
  clearBtn: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14, padding: 4 },
  tableWrap: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f1f5f9", background: "#fafafa", userSelect: "none" },
  td: { padding: "14px 16px", fontSize: 14, color: "#0f172a", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
  row: { transition: "background 0.15s" },
  nameCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  nameText: { fontWeight: 600, color: "#1e293b" },
  contactCell: { display: "flex", flexDirection: "column", gap: 2 },
  contactLine: { fontSize: 12, color: "#475569" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  spent: { fontWeight: 700, color: "#0f172a", fontSize: 14 },
  emptyCell: { padding: "60px 20px", textAlign: "center" },
  emptyBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14 },
  footer: { marginTop: 14, fontSize: 12, color: "#94a3b8", textAlign: "right" },
  centerBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, padding: 40 },
  spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #FF6B35", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  errorCard: { background: "#fff", borderRadius: 14, padding: "36px 40px", textAlign: "center", border: "1px solid #fee2e2", maxWidth: 380 },
  errorIcon: { fontSize: 36, marginBottom: 12, color: "#ef4444" },
  errorTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
  errorMsg: { fontSize: 14, color: "#64748b", margin: "0 0 20px" },
  retryBtn: { background: "#FF6B35", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  .cust-row:hover td { background: #fafafa !important; }
  .cust-search:focus { border-color: #FF6B35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.1); }
  .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; transition: box-shadow 0.2s; }
`;

export default Customers;