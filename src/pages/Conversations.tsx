import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../lib/api";
import { getSocket, disconnectSocket } from "../lib/socket";
import {
  Search, Send, Paperclip, MoreVertical, Phone, Video,
  Image as ImageIcon, CreditCard, ShoppingBag, MessageCircle,
  CheckCheck, Check, Wifi, WifiOff, RefreshCw, X, ArrowLeft,
} from "lucide-react";

type Platform = "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "TELEGRAM";
type ConversationStatus = "OPEN" | "RESOLVED" | "PENDING";
type MessageSender = "CUSTOMER" | "SELLER" | "BOT";

interface Conversation {
  id: number; platform: Platform; status: ConversationStatus;
  customerName: string; customerPhone?: string; unreadCount: number;
  lastMessage?: string; lastMessageAt?: string;
}
interface Message {
  id: number; conversationId: number; sender: MessageSender;
  text: string; type: string; isRead: boolean; createdAt: string;
  status?: string;
}

const PLATFORM = {
  WHATSAPP: { label: "WA", color: "#25D366", bg: "#dcfce7", text: "#166534", icon: "💬" },
  INSTAGRAM: { label: "IG", color: "#E1306C", bg: "#fce7f3", text: "#9d174d", icon: "📸" },
  FACEBOOK: { label: "FB", color: "#1877F2", bg: "#dbeafe", text: "#1e40af", icon: "👤" },
  TELEGRAM: { label: "TG", color: "#26A5E4", bg: "#e0f2fe", text: "#0c4a6e", icon: "✈️" },
};

const avatarColors = ["#FF6B35", "#2EC4B6", "#E71D36", "#7B2D8B", "#1A936F", "#F7931E", "#0891b2", "#be123c"];
const avatarColor = (name: string) => { let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };
const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso); const now = new Date(); const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* Backend conversation-list ordering: lastMessageAt, newest first
 * (matches GET /api/conversations orderBy). */
const byLastMessageAtDesc = (a: Conversation, b: Conversation) =>
  new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime();

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
  const [sendError, setSendError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [showChat, setShowChat] = useState(false); // mobile: show chat panel
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params: any = {};
      if (filter !== "all") params.platform = filter;
      if (search) params.search = search;
      const res = await api.get("/api/conversations", { params });
      setConversations(res.data); setOnline(true);
    } catch { setOnline(false); } finally { if (!silent) setLoading(false); }
  }, [filter, search]);

  const fetchMessages = useCallback(async (id: number, silent = false) => {
    try {
      if (!silent) setMsgLoading(true);
      const res = await api.get(`/api/conversations/${id}/messages`);
      /* 3D-2 — stale-response guard: a fetch for a conversation the
       * seller has already switched away from must not replace the
       * active conversation's messages (including their statuses)
       * or clear unread state for a conversation that was not viewed. */
      if (id !== activeChatIdRef.current) return;
      setMessages(res.data);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    } catch { } finally { if (!silent) setMsgLoading(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchConversations(true);
      if (activeChatId) fetchMessages(activeChatId, true);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchConversations, fetchMessages, activeChatId]);

  /* ---------------- Socket.IO foundation ----------------
   * Establishes the shared Socket.IO connection for the
   * Conversations screen. The connection is created once per
   * mount and fully torn down on unmount, so remounting never
   * leaves duplicate connections behind.
   */
  useEffect(() => {
    getSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  /*
   * Join/leave the backend room for the active conversation.
   * NOTE: application events (new_message, message_status_updated,
   * conversation_updated) are intentionally NOT handled yet —
   * they belong to later tasks. Polling above remains the
   * source of truth for now.
   */
  const socketRoomRef = useRef<number | null>(null);
  const optimisticMessageIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeChatId) return;
    const socket = getSocket();
    const previousRoomId = socketRoomRef.current;
    if (previousRoomId !== null && previousRoomId !== activeChatId) {
      socket.emit("leave_conversation", previousRoomId);
    }
    socket.emit("join_conversation", activeChatId);
    socketRoomRef.current = activeChatId;
    return () => {
      socket.emit("leave_conversation", activeChatId);
      if (socketRoomRef.current === activeChatId) {
        socketRoomRef.current = null;
      }
    };
  }, [activeChatId]);

  /*
   * Realtime socket events (3B-3 / 3B-4 / 3B-5).
   * Listeners are registered exactly once for the lifetime of
   * this screen and removed on unmount. A ref keeps the active
   * conversation id current without re-registering listeners
   * when switching conversations (no stale closures, no
   * duplicates).
   */
  const activeChatIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  /*
   * 3B-8 — keeps the latest silent REST fetchers available to
   * socket lifecycle handlers without re-registering listeners.
   */
  const resyncRef = useRef<() => void>(() => {});
  useEffect(() => {
    resyncRef.current = () => {
      fetchConversations(true);
      const id = activeChatIdRef.current;
      if (id !== null) fetchMessages(id, true);
    };
  }, [fetchConversations, fetchMessages]);

  useEffect(() => {
    const socket = getSocket();

    const isPayload = (value: unknown): value is Record<string, any> =>
      !!value && typeof value === "object" && !Array.isArray(value);

    /*
     * Type guard for the new_message payload. The backend emits
     * the full persisted message row (verified in earlier
     * tasks); this guard proves the required Message fields so
     * setMessages always receives Message[].
     */
    const isSocketMessage = (value: unknown): value is Message =>
      isPayload(value) &&
      typeof value.id === "number" &&
      typeof value.conversationId === "number" &&
      (value.sender === "CUSTOMER" || value.sender === "SELLER" || value.sender === "BOT") &&
      typeof value.text === "string" &&
      typeof value.type === "string" &&
      typeof value.isRead === "boolean" &&
      typeof value.createdAt === "string";

    /*
     * 3B-3 — new_message
     * Backend emits the full persisted message object to
     * room_<conversationId>. Only messages belonging to the
     * currently open conversation are appended, deduplicated
     * by the backend message id.
     */
    const onNewMessage = (payload: unknown) => {
      try {
        if (!isSocketMessage(payload)) return;
        const message: Message = payload;
        const isActiveConversation = message.conversationId === activeChatIdRef.current;
        const lastMessageText = typeof message.text === "string" ? message.text : undefined;
        const lastMessageAt = typeof message.createdAt === "string" ? message.createdAt : undefined;

        /*
         * 3B-7 — dedup by backend message id. A known message is
         * replaced by the incoming authoritative backend object;
         * an unknown one is appended exactly once. A pending
         * optimistic message for this send is dropped as soon as
         * its real backend message arrives.
         */
        if (isActiveConversation) {
          const optimisticId = optimisticMessageIdRef.current;
          setMessages(prev => {
            const withoutOptimistic =
              optimisticId !== null ? prev.filter(m => m.id !== optimisticId) : prev;
            if (withoutOptimistic.some(m => m.id === message.id)) {
              return withoutOptimistic.map(m =>
                m.id === message.id ? { ...m, ...message } : m
              );
            }
            return [...withoutOptimistic, message];
          });
        }

        /*
         * 3B-6 — realtime unread counts + ordering, mirroring
         * the backend: the webhook increments unreadCount only
         * for inbound CUSTOMER messages, and the open
         * conversation stays at zero unread (the backend clears
         * unread state when its messages are fetched). Unknown
         * conversation ids are ignored — polling/fetch owns
         * list membership. Ordering follows the backend's
         * lastMessageAt-desc rule.
         */
        setConversations(prev =>
          prev
            .map(c => {
              if (c.id !== message.conversationId) return c;
              if (isActiveConversation) {
                return {
                  ...c,
                  ...(lastMessageText !== undefined ? { lastMessage: lastMessageText } : {}),
                  ...(lastMessageAt !== undefined ? { lastMessageAt: lastMessageAt } : {}),
                  unreadCount: 0,
                };
              }
              return {
                ...c,
                ...(lastMessageText !== undefined ? { lastMessage: lastMessageText } : {}),
                ...(lastMessageAt !== undefined ? { lastMessageAt: lastMessageAt } : {}),
                unreadCount: message.sender === "CUSTOMER" ? c.unreadCount + 1 : c.unreadCount,
              };
            })
            .sort(byLastMessageAtDesc)
        );
      } catch { /* malformed payload: ignore */ }
    };

    /*
     * 3B-4 — message_status_updated
     * Backend payload: { conversationId, messageId, status }
     * with status in SENT | DELIVERED | READ | FAILED. Only the
     * matching message's status is updated; READ also reflects
     * on the existing isRead tick. Messages not in local state
     * are left to polling/fetch.
     */
    /*
     * 3D-1 — status progression guard. Mirrors the backend
     * webhook: SENT < DELIVERED < READ, and FAILED is terminal.
     * An out-of-order or replayed event never regresses a
     * status already displayed.
     */
    const STATUS_RANK: Record<string, number> = { SENT: 1, DELIVERED: 2, READ: 3 };
    const isStatusRegression = (current: string | undefined, incoming: string): boolean => {
      if (current !== "SENT" && current !== "DELIVERED" && current !== "READ" && current !== "FAILED") return false;
      if (current === "FAILED") return incoming !== "FAILED";
      if (incoming === "FAILED") return false;
      return STATUS_RANK[incoming] <= STATUS_RANK[current];
    };

    const onMessageStatusUpdated = (payload: unknown) => {
      try {
        if (!isPayload(payload)) return;
        const { conversationId, messageId, status } = payload;
        if (typeof conversationId !== "number" || typeof messageId !== "number") return;
        if (typeof status !== "string") return;
        if (status !== "SENT" && status !== "DELIVERED" && status !== "READ" && status !== "FAILED") return;
        if (conversationId !== activeChatIdRef.current) return;
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId && !isStatusRegression(m.status, status)
              ? { ...m, status, isRead: status === "READ" ? true : m.isRead }
              : m
          )
        );
      } catch { /* malformed payload: ignore */ }
    };

    /*
     * 3B-5 — conversation_updated
     * Backend payload: { conversationId, conversation } where
     * conversation is the full conversation row (same shape as
     * GET /api/conversations). Existing entries are merged by
     * id; unknown conversations are ignored here and picked up
     * by the existing polling/fetch.
     */
    const onConversationUpdated = (payload: unknown) => {
      try {
        if (!isPayload(payload)) return;
        const conversation = payload.conversation;
        if (!isPayload(conversation)) return;
        if (typeof conversation.id !== "number") return;
        setConversations(prev =>
          prev.some(c => c.id === conversation.id)
            ? prev
                .map(c => (c.id === conversation.id ? { ...c, ...conversation } : c))
                .sort(byLastMessageAtDesc)
            : prev
        );
      } catch { /* malformed payload: ignore */ }
    };

    /*
     * 3B-8 — reconnect/disconnect handling. A reconnect is a
     * brand-new server connection (rooms do not survive), so the
     * active conversation room is re-joined and the existing
     * REST fetches resynchronize anything missed while offline.
     * Disconnects never clear local state; polling remains the
     * fallback. Connection errors are swallowed so no internal
     * details surface in the UI.
     */
    const onConnect = () => {
      const activeId = activeChatIdRef.current;
      if (activeId !== null) {
        socket.emit("join_conversation", activeId);
      }
      resyncRef.current();
    };
    const onDisconnect = () => {
      /* Keep all local state; the socket manager retries and
       * the existing polling keeps the screen in sync. */
    };
    const onConnectError = () => {
      /* Silent: never surface raw connection internals. */
    };

    socket.on("new_message", onNewMessage);
    socket.on("message_status_updated", onMessageStatusUpdated);
    socket.on("conversation_updated", onConversationUpdated);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_status_updated", onMessageStatusUpdated);
      socket.off("conversation_updated", onConversationUpdated);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectChat = (id: number) => {
    setActiveChatId(id);
    setSendError(null); // stale failure notice must not follow the seller into another chat
    fetchMessages(id);
    setShowChat(true); // mobile: switch to chat view
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !activeChatId || sending) return;
    setSendError(null); // fresh attempt clears the previous failure notice
    const text = msgText.trim();
    setSending(true); // keep the drafted text until the backend accepts the send
    const temp: Message = { id: Date.now(), conversationId: activeChatId, sender: "SELLER", text, type: "text", isRead: true, createdAt: new Date().toISOString() };
    optimisticMessageIdRef.current = temp.id;
    setMessages(prev => [...prev, temp]);
    setConversations(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() } : c));
    try {
      const res = await api.post(`/api/conversations/${activeChatId}/messages`, { text });
      setMsgText(""); // backend accepted the send; now clear the composer
      /* 3C-3 — reconcile with the authoritative row the POST itself
       * returned: drop the optimistic entry and install the persisted
       * backend message by its id (same id-based dedupe as the
       * new_message handler, no text/timestamp heuristics). This
       * keeps the sent message on screen even when the silent
       * refetch below is slow, fails, or the realtime event lags. */
      const saved = res?.data;
      setMessages(prev => {
        const withoutOptimistic = prev.filter(m => m.id !== temp.id);
        if (saved && typeof saved.id === "number" && saved.conversationId === activeChatId) {
          return withoutOptimistic.some(m => m.id === saved.id)
            ? withoutOptimistic.map(m => (m.id === saved.id ? { ...m, ...saved } : m))
            : [...withoutOptimistic, saved];
        }
        return withoutOptimistic;
      });
      optimisticMessageIdRef.current = null;
      await fetchMessages(activeChatId, true);
    } catch (err: any) {
      /* 3C-2 — surface a concise seller-facing error. Only the
       * server-controlled `message` string is trusted; raw Axios
       * errors, headers, or stack traces are never displayed. */
      const serverMessage = err?.response?.data?.message;
      setSendError(typeof serverMessage === "string" && serverMessage.trim() ? serverMessage : "Couldn't send the message — please try again.");
      setMessages(prev => prev.filter(m => m.id !== temp.id));
      optimisticMessageIdRef.current = null;
    } finally { setSending(false); }
  };

  const activeChat = conversations.find(c => c.id === activeChatId);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else groups.push({ date, msgs: [msg] });
    return groups;
  }, []);

  return (
    <>
      <style>{globalCss}</style>
      {/* Responsive container: on mobile show either sidebar OR chat, on lg show both */}
      <div className="conv-root">

        {/* Left sidebar — hidden on mobile when chat is open */}
        <div className={`conv-sidebar ${showChat ? 'conv-sidebar-hidden' : ''}`}>
          <div style={s.sideHeader}>
            <div style={s.sideTop}>
              <div>
                <h2 style={s.sideTitle}>Inbox</h2>
                {totalUnread > 0 && <span style={s.unreadBadge}>{totalUnread} unread</span>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ ...s.onlineDot, background: online ? "#22c55e" : "#ef4444" }} />
                <button style={s.iconBtn} onClick={() => fetchConversations()}><RefreshCw size={14} /></button>
              </div>
            </div>
            <div style={s.searchWrap}>
              <Search size={14} style={s.searchIcon} />
              <input placeholder="Search conversations…" value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} className="conv-search" />
              {search && <button style={s.clearSearch} onClick={() => setSearch("")}><X size={12} /></button>}
            </div>
            <div style={s.filters}>
              {(["all", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "TELEGRAM"] as const).map(p => (
                <button key={p} onClick={() => setFilter(p)} style={{ ...s.filterBtn, background: filter === p ? (p === "all" ? "#0f172a" : PLATFORM[p]?.color) : "#f1f5f9", color: filter === p ? "#fff" : "#64748b" }} className="filter-btn">
                  {p === "all" ? "All" : `${PLATFORM[p].icon} ${PLATFORM[p].label}`}
                </button>
              ))}
            </div>
          </div>

          <div style={s.chatList}>
            {loading ? (
              <div style={s.emptyState}><div style={s.spinner} className="spin" /><p style={{ color: "#94a3b8", fontSize: 13, marginTop: 12 }}>Loading…</p></div>
            ) : conversations.length === 0 ? (
              <div style={s.emptyState}><MessageCircle size={40} color="#cbd5e1" /><p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>No conversations yet</p></div>
            ) : (
              conversations.map(chat => {
                const pl = PLATFORM[chat.platform];
                const isActive = activeChatId === chat.id;
                return (
                  <div key={chat.id} onClick={() => selectChat(chat.id)} style={{ ...s.chatItem, background: isActive ? "#fff7f3" : "transparent", borderLeft: isActive ? "3px solid #FF6B35" : "3px solid transparent" }} className="chat-item">
                    <div style={{ ...s.chatAvatar, background: avatarColor(chat.customerName) }}>
                      {initials(chat.customerName)}
                      <span style={{ ...s.platformDot, background: pl.color }}>{pl.icon}</span>
                    </div>
                    <div style={s.chatInfo}>
                      <div style={s.chatRow}>
                        <span style={{ ...s.chatName, fontWeight: chat.unreadCount > 0 ? 700 : 500 }}>{chat.customerName}</span>
                        <span style={s.chatTime}>{fmtTime(chat.lastMessageAt)}</span>
                      </div>
                      <div style={s.chatRow}>
                        <span style={{ ...s.chatPreview, fontWeight: chat.unreadCount > 0 ? 600 : 400, color: chat.unreadCount > 0 ? "#374151" : "#9ca3af" }}>{chat.lastMessage || "No messages yet"}</span>
                        {chat.unreadCount > 0 && <span style={s.chatUnread}>{chat.unreadCount > 99 ? "99+" : chat.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window — hidden on mobile when sidebar is shown */}
        {activeChat ? (
          <div className={`conv-chat ${!showChat ? 'conv-chat-hidden' : ''}`}>
            {/* Mobile back button */}
            <div style={s.chatHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="conv-back-btn" onClick={() => setShowChat(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#64748b", display: "flex", alignItems: "center" }}>
                  <ArrowLeft size={18} />
                </button>
                <div style={{ ...s.headerAvatar, background: avatarColor(activeChat.customerName) }}>{initials(activeChat.customerName)}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <h3 style={s.headerName}>{activeChat.customerName}</h3>
                    <span style={{ ...s.platformTag, background: PLATFORM[activeChat.platform].bg, color: PLATFORM[activeChat.platform].text, fontSize: 10 }}>
                      {PLATFORM[activeChat.platform].icon} {PLATFORM[activeChat.platform].label}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", background: activeChat.status === "OPEN" ? "#dcfce7" : "#f1f5f9", color: activeChat.status === "OPEN" ? "#166534" : "#64748b" }}>
                      {activeChat.status.toLowerCase()}
                    </span>
                  </div>
                  {activeChat.customerPhone && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{activeChat.customerPhone}</p>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, color: "#94a3b8" }}>
                {online ? <Wifi size={14} color="#22c55e" /> : <WifiOff size={14} color="#ef4444" />}
                <Phone size={16} style={{ cursor: "pointer" }} />
              </div>
            </div>

            <div style={s.messages} className="messages-area">
              {msgLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={s.spinner} className="spin" /></div>
              ) : (
                groupedMessages.map(group => (
                  <div key={group.date}>
                    <div style={s.dateDivider}><span style={s.datePill}>{group.date}</span></div>
                    {group.msgs.map(msg => {
                      const isSeller = msg.sender === "SELLER";
                      return (
                        <div key={msg.id} style={{ ...s.msgRow, justifyContent: isSeller ? "flex-end" : "flex-start" }} className="msg-row">
                          {!isSeller && <div style={{ ...s.msgAvatar, background: avatarColor(activeChat.customerName) }}>{initials(activeChat.customerName)}</div>}
                          <div style={{ ...s.bubble, background: isSeller ? "linear-gradient(135deg, #FF6B35, #F7931E)" : "#fff", color: isSeller ? "#fff" : "#1e293b", borderRadius: isSeller ? "18px 18px 4px 18px" : "18px 18px 18px 4px", boxShadow: isSeller ? "0 4px 12px rgba(255,107,53,0.3)" : "0 2px 8px rgba(0,0,0,0.08)" }} className="bubble">
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{msg.text}</p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
                              <span style={{ fontSize: 10, opacity: 0.7 }}>{new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                              {isSeller && (
                                /* 3D-1 — ticks follow the real backend status:
                                 * SENT = one tick, DELIVERED = two ticks,
                                 * READ = two ticks in read styling,
                                 * FAILED = error indicator. Messages without a
                                 * status (e.g. optimistic) keep the existing
                                 * isRead-based ticks. */
                                msg.status === "FAILED" ? <X size={12} color="#fecaca" style={{ opacity: 0.9 }} /> :
                                msg.status === "READ" ? <CheckCheck size={12} color="#bfdbfe" style={{ opacity: 0.9 }} /> :
                                msg.status === "DELIVERED" ? <CheckCheck size={12} style={{ opacity: 0.9 }} /> :
                                msg.status === "SENT" ? <Check size={12} style={{ opacity: 0.7 }} /> :
                                (msg.isRead ? <CheckCheck size={12} style={{ opacity: 0.9 }} /> : <Check size={12} style={{ opacity: 0.7 }} />)
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

            <div style={s.inputBar}>
              {sendError && (
                <div role="alert" style={{ padding: "8px 14px", color: "#b91c1c", background: "#fef2f2", borderTop: "1px solid #fecaca", fontSize: 12, fontWeight: 600 }}>
                  {sendError}
                </div>
              )}
              <form onSubmit={handleSend} style={s.inputRow}>
                <button type="button" style={s.attachBtn}><Paperclip size={16} /></button>
                <input ref={inputRef} value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type a message…" style={s.textInput} className="msg-input" />
                <button type="submit" disabled={!msgText.trim() || sending} style={{ ...s.sendBtn, opacity: !msgText.trim() || sending ? 0.5 : 1, cursor: !msgText.trim() || sending ? "not-allowed" : "pointer" }}>
                  {sending ? <div style={{ ...s.spinner, width: 16, height: 16, borderWidth: 2 }} className="spin" /> : <Send size={15} />}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className={`conv-chat conv-empty-chat ${!showChat ? 'conv-chat-hidden' : ''}`}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Your Inbox</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 240, textAlign: "center", lineHeight: 1.6 }}>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const s: Record<string, React.CSSProperties> = {
  sideHeader: { padding: "16px 14px 10px", borderBottom: "1px solid #f1f5f9" },
  sideTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sideTitle: { fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" },
  unreadBadge: { display: "inline-block", background: "#FF6B35", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginLeft: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: "50%", transition: "background 0.3s" },
  iconBtn: { background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" },
  searchWrap: { position: "relative", marginBottom: 10 },
  searchIcon: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" },
  searchInput: { width: "100%", boxSizing: "border-box", padding: "8px 30px 8px 30px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "#f8fafc", color: "#0f172a", outline: "none" },
  clearSearch: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center" },
  filters: { display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 },
  filterBtn: { border: "none", borderRadius: 20, padding: "4px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s" },
  chatList: { flex: 1, overflowY: "auto" },
  chatItem: { display: "flex", gap: 10, padding: "11px 13px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid #f8fafc" },
  chatAvatar: { position: "relative", width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 },
  platformDot: { position: "absolute", bottom: -2, right: -2, width: 17, height: 17, borderRadius: "50%", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" },
  chatInfo: { flex: 1, minWidth: 0 },
  chatRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  chatName: { fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  chatTime: { fontSize: 10, color: "#94a3b8", flexShrink: 0, marginLeft: 6 },
  chatPreview: { fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 },
  chatUnread: { background: "#FF6B35", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, flexShrink: 0, marginLeft: 6 },
  platformTag: { display: "inline-block", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, letterSpacing: "0.3px", textTransform: "uppercase" },
  chatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  headerAvatar: { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 },
  headerName: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 },
  messages: { flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2, backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "24px 24px" },
  dateDivider: { display: "flex", justifyContent: "center", margin: "14px 0 10px" },
  datePill: { background: "rgba(255,255,255,0.9)", color: "#94a3b8", fontSize: 10, fontWeight: 600, padding: "3px 12px", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  msgRow: { display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 4 },
  msgAvatar: { width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10, flexShrink: 0 },
  bubble: { maxWidth: "75%", padding: "9px 13px", wordBreak: "break-word" },
  inputBar: { background: "#fff", padding: "10px 14px", borderTop: "1px solid #f1f5f9" },
  inputRow: { display: "flex", gap: 8, alignItems: "center" },
  attachBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 5, borderRadius: 8, display: "flex", alignItems: "center" },
  textInput: { flex: 1, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "9px 14px", fontSize: 14, fontFamily: "inherit", color: "#0f172a", outline: "none" },
  sendBtn: { background: "#0d9488", border: "none", borderRadius: 12, padding: "9px 13px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(13,148,136,0.3)" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" },
  spinner: { width: 26, height: 26, border: "3px solid #e2e8f0", borderTop: "3px solid #FF6B35", borderRadius: "50%" },
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.75s linear infinite; }

  /* Responsive conversation layout */
  .conv-root {
    display: flex;
    height: calc(100vh - 80px);
    background: #f8fafc;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    font-family: 'Sora', 'Segoe UI', sans-serif;
    position: relative;
  }

  /* Sidebar */
  .conv-sidebar {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #f1f5f9;
    flex-shrink: 0;
  }
  .conv-sidebar-hidden { display: none; }

  /* Chat */
  .conv-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    min-width: 0;
  }
  .conv-chat-hidden { display: none; }
  .conv-empty-chat { align-items: center; justify-content: center; }

  /* Back button — visible only on mobile */
  .conv-back-btn { display: flex; }

  @media (min-width: 768px) {
    .conv-sidebar { width: 300px; }
    .conv-sidebar-hidden { display: flex !important; }
    .conv-chat-hidden { display: flex !important; }
    .conv-back-btn { display: none !important; }
  }
  @media (min-width: 1024px) {
    .conv-sidebar { width: 320px; }
  }

  .chat-item:hover { background: #fafafa !important; }
  .conv-search:focus { border-color: #FF6B35 !important; background: #fff !important; }
  .msg-input:focus { border-color: #FF6B35 !important; background: #fff !important; }
  .bubble { transition: transform 0.1s; }
  .bubble:hover { transform: scale(1.01); }
  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
  .filter-btn:hover { filter: brightness(0.95); }
  .msg-row { animation: fadeUp 0.2s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
`;

export default Conversations;