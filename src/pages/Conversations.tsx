import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Search, Send, Paperclip, MoreVertical, Phone, Video,
  Image as ImageIcon, CreditCard, ShoppingBag, MessageCircle,
  Instagram, Facebook, CheckCheck, Check, Wifi, WifiOff,
  RefreshCw, X, ChevronDown, Circle,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "https://hypnate-backend-staging.onrender.com/api";

// ── Types ──────────────────────────────────────────────────────────────────
type Platform = "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "TELEGRAM";
type ConversationStatus = "OPEN" | "RESOLVED" | "PENDING";
type MessageSender = "CUSTOMER" | "SELLER" | "BOT";

interface Conversation {
  id: number;
  platform: Platform;
  status: ConversationStatus;
  customerName: string;
  customerPhone?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface Message {
  id: number;
  conversationId: number;
  sender: MessageSender;
  text: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ── Platform Config ────────────────────────────────────────────────────────
const PLATFORM = {
  WHATSAPP: { label: "WA", color: "#25D366", bg: "#dcfce7", text: "#166534", icon: "💬" },
  INSTAGRAM: { label: "IG", color: "#E1306C", bg: "#fce7f3", text: "#9d174d", icon: "📸" },
  FACEBOOK: { label: "FB", color: "#1877F2", bg: "#dbeafe", text: "#1e40af", icon: "👤" },
  TELEGRAM: { label: "TG", color: "#26A5E4", bg: "#e0f2fe", text: "#0c4a6e", icon: "✈️" },
};

const avatarColors = ["#FF6B35", "#2EC4B6", "#E71D36", "#7B2D8B", "#1A936F", "#F7931E", "#0891b2", "#be123c"];
const avatarColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
};
const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ── Main Component ─────────────────────────────────────────────────────────
export const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [msgText, setMsgText] = useState("");
  const [filter, setFilter] = useState<"all" | Platform>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(true);
  const [lastPoll, setLastPoll] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const headers = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  // ── Fetch conversations ────────────────────────────────────────────────
  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params: any = {};
      if (filter !== "all") params.platform = filter;
      if (search) params.search = search;

      const res = await axios.get(`${API_URL}/conversations`, { headers: headers(), params });
      setConversations(res.data);
      setOnline(true);
      setLastPoll(new Date());
    } catch {
      setOnline(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter, search, headers]);

  // ── Fetch messages for active chat ────────────────────────────────────
  const fetchMessages = useCallback(async (id: number, silent = false) => {
    try {
      if (!silent) setMsgLoading(true);
      const res = await axios.get(`${API_URL}/conversations/${id}/messages`, { headers: headers() });
      setMessages(res.data);
      // Reset unread in local state
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
      );
    } catch {
      // silent fail on poll
    } finally {
      if (!silent) setMsgLoading(false);
    }
  }, [headers]);

  // ── Polling ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchConversations(true);
      if (activeChatId) fetchMessages(activeChatId, true);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchConversations, fetchMessages, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select chat ────────────────────────────────────────────────────────
  const selectChat = (id: number) => {
    setActiveChatId(id);
    fetchMessages(id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send message ───────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !activeChatId || sending) return;

    const text = msgText.trim();
    setMsgText("");
    setSending(true);

    // Optimistic update
    const temp: Message = {
      id: Date.now(),
      conversationId: activeChatId,
      sender: "SELLER",
      text,
      type: "text",
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, temp]);
    setConversations(prev =>
      prev.map(c => c.id === activeChatId ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() } : c)
    );

    try {
      await axios.post(`${API_URL}/conversations/${activeChatId}/messages`, { text }, { headers: headers() });
      await fetchMessages(activeChatId, true);
    } catch {
      // Remove optimistic message on fail
      setMessages(prev => prev.filter(m => m.id !== temp.id));
    } finally {
      setSending(false);
    }
  };

  const activeChat = conversations.find(c => c.id === activeChatId);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // ── Group messages by date ─────────────────────────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.date === date) { last.msgs.push(msg); }
    else { groups.push({ date, msgs: [msg] }); }
    return groups;
  }, []);

  return (
    <>
      <style>{globalCss}</style>
      <div style={s.root}>

        {/* ── LEFT PANEL ── */}
        <div style={s.sidebar}>
          {/* Header */}
          <div style={s.sideHeader}>
            <div style={s.sideTop}>
              <div>
                <h2 style={s.sideTitle}>Inbox</h2>
                {totalUnread > 0 && (
                  <span style={s.unreadBadge}>{totalUnread} unread</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ ...s.onlineDot, background: online ? "#22c55e" : "#ef4444" }} title={online ? `Live · ${fmtTime(lastPoll.toISOString())}` : "Offline"} />
                <button style={s.iconBtn} onClick={() => fetchConversations()} title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div style={s.searchWrap}>
              <Search size={14} style={s.searchIcon} />
              <input
                placeholder="Search conversations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={s.searchInput}
                className="conv-search"
              />
              {search && <button style={s.clearSearch} onClick={() => setSearch("")}><X size={12} /></button>}
            </div>

            {/* Platform filters */}
            <div style={s.filters}>
              {(["all", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "TELEGRAM"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  style={{
                    ...s.filterBtn,
                    background: filter === p ? (p === "all" ? "#0f172a" : PLATFORM[p]?.color) : "#f1f5f9",
                    color: filter === p ? "#fff" : "#64748b",
                  }}
                  className="filter-btn"
                >
                  {p === "all" ? "All" : `${PLATFORM[p].icon} ${PLATFORM[p].label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Chat list */}
          <div style={s.chatList}>
            {loading ? (
              <div style={s.emptyState}>
                <div style={s.spinner} className="spin" />
                <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 12 }}>Loading…</p>
              </div>
            ) : conversations.length === 0 ? (
              <div style={s.emptyState}>
                <MessageCircle size={40} color="#cbd5e1" />
                <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>No conversations yet</p>
              </div>
            ) : (
              conversations.map(chat => {
                const pl = PLATFORM[chat.platform];
                const isActive = activeChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    style={{
                      ...s.chatItem,
                      background: isActive ? "#fff7f3" : "transparent",
                      borderLeft: isActive ? "3px solid #FF6B35" : "3px solid transparent",
                    }}
                    className="chat-item"
                  >
                    <div style={{ ...s.chatAvatar, background: avatarColor(chat.customerName) }}>
                      {initials(chat.customerName)}
                      <span style={{ ...s.platformDot, background: pl.color }}>{pl.icon}</span>
                    </div>
                    <div style={s.chatInfo}>
                      <div style={s.chatRow}>
                        <span style={{ ...s.chatName, fontWeight: chat.unreadCount > 0 ? 700 : 500 }}>
                          {chat.customerName}
                        </span>
                        <span style={s.chatTime}>{fmtTime(chat.lastMessageAt)}</span>
                      </div>
                      <div style={s.chatRow}>
                        <span style={{ ...s.chatPreview, fontWeight: chat.unreadCount > 0 ? 600 : 400, color: chat.unreadCount > 0 ? "#374151" : "#9ca3af" }}>
                          {chat.lastMessage || "No messages yet"}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span style={s.chatUnread}>{chat.unreadCount > 99 ? "99+" : chat.unreadCount}</span>
                        )}
                      </div>
                      <span style={{ ...s.platformTag, background: pl.bg, color: pl.text }}>
                        {pl.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: CHAT WINDOW ── */}
        {activeChat ? (
          <div style={s.chatWindow}>
            {/* Chat header */}
            <div style={s.chatHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...s.headerAvatar, background: avatarColor(activeChat.customerName) }}>
                  {initials(activeChat.customerName)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={s.headerName}>{activeChat.customerName}</h3>
                    <span style={{ ...s.platformTag, background: PLATFORM[activeChat.platform].bg, color: PLATFORM[activeChat.platform].text, fontSize: 10 }}>
                      {PLATFORM[activeChat.platform].icon} {PLATFORM[activeChat.platform].label}
                    </span>
                    <span style={{ ...s.statusTag, background: activeChat.status === "OPEN" ? "#dcfce7" : "#f1f5f9", color: activeChat.status === "OPEN" ? "#166534" : "#64748b" }}>
                      {activeChat.status.toLowerCase()}
                    </span>
                  </div>
                  {activeChat.customerPhone && (
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{activeChat.customerPhone}</p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, color: "#94a3b8" }}>
                {online ? <Wifi size={16} color="#22c55e" /> : <WifiOff size={16} color="#ef4444" />}
                <Phone size={18} style={{ cursor: "pointer" }} className="header-icon" />
                <Video size={18} style={{ cursor: "pointer" }} className="header-icon" />
                <MoreVertical size={18} style={{ cursor: "pointer" }} className="header-icon" />
              </div>
            </div>

            {/* Messages */}
            <div style={s.messages} className="messages-area">
              {msgLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                  <div style={s.spinner} className="spin" />
                </div>
              ) : (
                groupedMessages.map(group => (
                  <div key={group.date}>
                    <div style={s.dateDivider}>
                      <span style={s.datePill}>{group.date}</span>
                    </div>
                    {group.msgs.map(msg => {
                      const isSeller = msg.sender === "SELLER";
                      return (
                        <div key={msg.id} style={{ ...s.msgRow, justifyContent: isSeller ? "flex-end" : "flex-start" }} className="msg-row">
                          {!isSeller && (
                            <div style={{ ...s.msgAvatar, background: avatarColor(activeChat.customerName) }}>
                              {initials(activeChat.customerName)}
                            </div>
                          )}
                          <div style={{
                            ...s.bubble,
                            background: isSeller ? "linear-gradient(135deg, #FF6B35, #F7931E)" : "#fff",
                            color: isSeller ? "#fff" : "#1e293b",
                            borderRadius: isSeller ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            boxShadow: isSeller ? "0 4px 12px rgba(255,107,53,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
                          }} className="bubble">
                            {msg.type === "payment" ? (
                              <div style={s.paymentCard}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#166534", fontWeight: 700, marginBottom: 6 }}>
                                  <CreditCard size={14} /> Payment Request
                                </div>
                                <p style={{ fontSize: 12, color: "#374151", margin: "0 0 8px" }}>Please pay for your order.</p>
                                <button style={s.payBtn}>Pay Now</button>
                              </div>
                            ) : (
                              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{msg.text}</p>
                            )}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
                              <span style={{ fontSize: 10, opacity: 0.7 }}>
                                {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isSeller && (
                                msg.isRead
                                  ? <CheckCheck size={12} style={{ opacity: 0.9 }} />
                                  : <Check size={12} style={{ opacity: 0.7 }} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={s.inputBar}>
              <div style={s.inputRow}>
                <button style={s.attachBtn} title="Attach file"><Paperclip size={18} /></button>
                <button style={s.attachBtn} title="Send image"><ImageIcon size={18} /></button>
                <button style={s.attachBtn} title="Send product"><ShoppingBag size={18} /></button>
                <input
                  ref={inputRef}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e as any); }}
                  placeholder="Type a message…"
                  style={s.textInput}
                  className="msg-input"
                />
                <button
                  onClick={handleSend}
                  disabled={!msgText.trim() || sending}
                  style={{
                    ...s.sendBtn,
                    opacity: !msgText.trim() || sending ? 0.5 : 1,
                    cursor: !msgText.trim() || sending ? "not-allowed" : "pointer",
                  }}
                >
                  {sending ? <div style={{ ...s.spinner, width: 16, height: 16, borderWidth: 2 }} className="spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Empty state
          <div style={s.emptyChat}>
            <div style={s.emptyChatInner}>
              <div style={s.emptyChatIcon}>💬</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Your Inbox</h3>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, maxWidth: 260, textAlign: "center", lineHeight: 1.6 }}>
                Select a conversation to start messaging your customers
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                {(["WHATSAPP", "INSTAGRAM", "FACEBOOK", "TELEGRAM"] as Platform[]).map(p => (
                  <div key={p} style={{ ...s.emptyPlatform, background: PLATFORM[p].bg, color: PLATFORM[p].color }} title={p}>
                    {PLATFORM[p].icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", height: "calc(100vh - 80px)", background: "#f8fafc", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0", fontFamily: "'Sora', 'Segoe UI', sans-serif" },
  // Sidebar
  sidebar: { width: 320, display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #f1f5f9" },
  sideHeader: { padding: "20px 16px 12px", borderBottom: "1px solid #f1f5f9" },
  sideTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sideTitle: { fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" },
  unreadBadge: { display: "inline-block", background: "#FF6B35", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginLeft: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: "50%", transition: "background 0.3s" },
  iconBtn: { background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" },
  searchWrap: { position: "relative", marginBottom: 10 },
  searchIcon: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" },
  searchInput: { width: "100%", boxSizing: "border-box", padding: "9px 32px 9px 32px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "#f8fafc", color: "#0f172a", outline: "none" },
  clearSearch: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" },
  filters: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 },
  filterBtn: { border: "none", borderRadius: 20, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" },
  chatList: { flex: 1, overflowY: "auto" },
  chatItem: { display: "flex", gap: 10, padding: "12px 14px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid #f8fafc" },
  chatAvatar: { position: "relative", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 },
  platformDot: { position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" },
  chatInfo: { flex: 1, minWidth: 0 },
  chatRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  chatName: { fontSize: 14, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  chatTime: { fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8 },
  chatPreview: { fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 },
  chatUnread: { background: "#FF6B35", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, flexShrink: 0, marginLeft: 6 },
  platformTag: { display: "inline-block", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, marginTop: 3, letterSpacing: "0.3px", textTransform: "uppercase" },
  // Chat window
  chatWindow: { flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc" },
  chatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#fff", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  headerAvatar: { width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 },
  headerName: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 },
  statusTag: { fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.4px" },
  messages: { flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 2, backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "24px 24px" },
  dateDivider: { display: "flex", justifyContent: "center", margin: "16px 0 12px" },
  datePill: { background: "rgba(255,255,255,0.9)", color: "#94a3b8", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", backdropFilter: "blur(4px)" },
  msgRow: { display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 4 },
  msgAvatar: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 },
  bubble: { maxWidth: "68%", padding: "10px 14px", wordBreak: "break-word" },
  paymentCard: { background: "#f0fdf4", borderRadius: 8, padding: 10, border: "1px solid #bbf7d0" },
  payBtn: { width: "100%", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "7px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  inputBar: { background: "#fff", padding: "12px 16px", borderTop: "1px solid #f1f5f9" },
  inputRow: { display: "flex", gap: 8, alignItems: "center" },
  attachBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", transition: "color 0.15s" },
  textInput: { flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 16px", fontSize: 14, fontFamily: "inherit", color: "#0f172a", outline: "none", transition: "border-color 0.2s" },
  sendBtn: { background: "linear-gradient(135deg, #FF6B35, #F7931E)", border: "none", borderRadius: 12, padding: "10px 14px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s", boxShadow: "0 4px 12px rgba(255,107,53,0.3)" },
  emptyChat: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" },
  emptyChatInner: { display: "flex", flexDirection: "column", alignItems: "center" },
  emptyChatIcon: { fontSize: 56, marginBottom: 16, filter: "grayscale(0.3)" },
  emptyPlatform: { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" },
  spinner: { width: 28, height: 28, border: "3px solid #e2e8f0", borderTop: "3px solid #FF6B35", borderRadius: "50%" },
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.75s linear infinite; }
  .chat-item:hover { background: #fafafa !important; }
  .conv-search:focus { border-color: #FF6B35 !important; background: #fff !important; }
  .msg-input:focus { border-color: #FF6B35 !important; background: #fff !important; }
  .bubble { transition: transform 0.1s; }
  .bubble:hover { transform: scale(1.01); }
  .header-icon:hover { color: #FF6B35 !important; transition: color 0.15s; }
  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-track { background: transparent; }
  .messages-area::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  .filter-btn:hover { filter: brightness(0.95); }
  .msg-row { animation: fadeUp 0.2s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
`;

export default Conversations;