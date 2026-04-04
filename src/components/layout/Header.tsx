import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Globe, ChevronDown, Settings, LogOut, User, X } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
];

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [search, setSearch] = useState("");
  const [showLang, setShowLang] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order #0042 received", time: "2m ago", read: false },
    { id: 2, text: "Priya Mehta left a message", time: "15m ago", read: false },
    { id: 3, text: "Low stock: Cotton Kurta (Blue)", time: "1h ago", read: true },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/orders?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  const markAllRead = () =>
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <header style={{
      height: "64px",
      background: "#fff",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: "16px",
      position: "sticky",
      top: 0,
      zIndex: 40,
      boxShadow: "0 1px 0 #f1f5f9",
    }}>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: "480px" }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, customers, products..."
            style={{
              width: "100%",
              padding: "9px 36px 9px 36px",
              borderRadius: "10px",
              border: "1.5px solid #f1f5f9",
              background: "#f8fafc",
              fontSize: "13px",
              color: "#0f172a",
              outline: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.background = "#fff"; }}
            onBlur={e => { e.target.style.borderColor = "#f1f5f9"; e.target.style.background = "#f8fafc"; }}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px" }}>
              <X style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>
      </form>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>

        {/* Language picker */}
        <div ref={langRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setShowLang((s) => !s); setShowNotifs(false); setShowProfile(false); }}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "10px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#64748b", fontWeight: 500, transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Globe style={{ width: 15, height: 15 }} />
            <span>{currentLang.label.split(" ")[0]}</span>
            <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
          {showLang && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: "6px", minWidth: "160px", zIndex: 100 }}>
              {LANGUAGES.map((lang) => (
                <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setShowLang(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 12px", borderRadius: "8px", border: "none", background: i18n.language === lang.code ? "#f0f9ff" : "transparent", cursor: "pointer", fontSize: "13px", color: "#0f172a", textAlign: "left", fontWeight: i18n.language === lang.code ? 600 : 400 }}
                  onMouseEnter={e => { if (i18n.language !== lang.code) (e.currentTarget.style.background = "#f8fafc"); }}
                  onMouseLeave={e => { if (i18n.language !== lang.code) (e.currentTarget.style.background = "transparent"); }}
                >
                  <span style={{ fontSize: "16px" }}>{lang.flag}</span>
                  {lang.label}
                  {i18n.language === lang.code && <span style={{ marginLeft: "auto", color: "#0ea5e9", fontSize: "11px" }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setShowNotifs((s) => !s); setShowLang(false); setShowProfile(false); }}
            style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "transparent", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Bell style={{ width: 17, height: 17, color: "#64748b" }} />
            {unread > 0 && (
              <div style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", border: "2px solid #fff" }} />
            )}
          </button>

          {showNotifs && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", width: "320px", zIndex: 100, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>
                  Notifications {unread > 0 && <span style={{ marginLeft: "6px", padding: "1px 7px", borderRadius: "999px", background: "#fee2e2", color: "#dc2626", fontSize: "11px", fontWeight: 700 }}>{unread}</span>}
                </p>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: "11px", color: "#0ea5e9", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>
                )}
              </div>
              {notifications.map((n) => (
                <div key={n.id} style={{ display: "flex", gap: "10px", padding: "12px 16px", borderBottom: "1px solid #f8fafc", background: n.read ? "transparent" : "#f0f9ff", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "#f0f9ff")}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.read ? "#cbd5e1" : "#0ea5e9", marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "13px", color: "#0f172a", fontWeight: n.read ? 400 : 500 }}>{n.text}</p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{n.time}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No notifications</p>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative", marginLeft: "4px" }}>
          <button
            onClick={() => { setShowProfile((s) => !s); setShowLang(false); setShowNotifs(false); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px 5px 5px", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#fff", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>{user?.name?.split(" ")[0] || "User"}</p>
              <p style={{ fontSize: "10px", color: "#94a3b8", lineHeight: 1.2, textTransform: "capitalize" }}>{user?.role?.toLowerCase() || "seller"}</p>
            </div>
            <ChevronDown style={{ width: 12, height: 12, color: "#94a3b8" }} />
          </button>

          {showProfile && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", width: "220px", zIndex: 100, overflow: "hidden" }}>
              {/* User info */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{user?.name || "User"}</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{user?.email || ""}</p>
              </div>
              {/* Menu items */}
              {[
                { icon: User, label: "My Profile", action: () => { navigate("/settings"); setShowProfile(false); } },
                { icon: Settings, label: "Settings", action: () => { navigate("/settings"); setShowProfile(false); } },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#374151", textAlign: "left", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Icon style={{ width: 15, height: 15, color: "#94a3b8" }} />
                  {label}
                </button>
              ))}
              <div style={{ borderTop: "1px solid #f8fafc", margin: "4px 0" }} />
              <button
                onClick={() => { logout(); navigate("/login"); }}
                style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#dc2626", textAlign: "left", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut style={{ width: 15, height: 15 }} />
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};