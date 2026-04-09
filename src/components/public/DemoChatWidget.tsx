import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, RotateCcw, Zap } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  buttons?: { label: string; value: string; emoji?: string }[];
  isTyping?: boolean;
}

interface UserCtx {
  platform?: string;
  orderMethod?: string;
  businessName?: string;
  contact?: string;
  flow?: 'setup' | 'demo' | 'human';
  setupChoice?: string;
}

/* ─── Conversation engine ────────────────────────────────────────────────── */
type Step =
  | 'entry' | 'platform' | 'order_method' | 'pain'
  | 'value_prop' | 'action_choice'
  | 'setup_name' | 'setup_catalog' | 'setup_choice' | 'setup_progress' | 'setup_done'
  | 'demo_shown' | 'demo_try'
  | 'human_contact' | 'human_done'
  | 'fallback' | 'done';

interface BotReply {
  messages: { text: string; delay: number }[];
  buttons?: { label: string; value: string; emoji?: string }[];
  nextStep?: Step;
}

function getReply(step: Step, value: string, ctx: UserCtx): BotReply {
  switch (step) {
    case 'entry':
      return {
        messages: [
          { text: `Hey! 👋 I'm **Zara**, your Hypnate guide.`, delay: 0 },
          { text: `Where do you currently sell your products?`, delay: 800 },
        ],
        buttons: [
          { label: 'WhatsApp', value: 'whatsapp', emoji: '💬' },
          { label: 'Instagram', value: 'instagram', emoji: '📸' },
          { label: 'Both', value: 'both', emoji: '🔥' },
          { label: 'Just exploring', value: 'exploring', emoji: '👀' },
        ],
        nextStep: 'platform',
      };

    case 'platform':
      const platformMap: Record<string, string> = {
        whatsapp: 'WhatsApp 💬',
        instagram: 'Instagram 📸',
        both: 'WhatsApp & Instagram 🔥',
        exploring: 'exploring options 👀',
      };
      return {
        messages: [
          { text: `Nice — ${platformMap[value] || value}!`, delay: 0 },
          { text: `How do you manage your orders right now?`, delay: 700 },
        ],
        buttons: [
          { label: 'I reply manually in chat', value: 'manual', emoji: '✍️' },
          { label: 'Spreadsheet / notebook', value: 'spreadsheet', emoji: '📊' },
          { label: 'Another tool', value: 'tool', emoji: '🔧' },
          { label: "Honestly, total chaos", value: 'mess', emoji: '😅' },
        ],
        nextStep: 'order_method',
      };

    case 'order_method':
      const painMap: Record<string, string> = {
        manual: `Manually handling every order in chat? Orders must slip through the cracks sometimes. 😬`,
        spreadsheet: `Spreadsheets work — until 3 orders come in at once and nothing matches. 😅`,
        tool: `Most tools weren't built for chat-first selling. Things get messy fast.`,
        mess: `Completely normal. Most small businesses feel this way before Hypnate.`,
      };
      return {
        messages: [
          { text: painMap[value] || `That sounds like a lot of manual work.`, delay: 0 },
          { text: `The real cost? Missed orders, unhappy customers, and hours lost every week.`, delay: 1000 },
          { text: `Here's what Hypnate does differently 👇`, delay: 2000 },
        ],
        nextStep: 'pain',
      };

    case 'pain':
      return {
        messages: [
          { text: `✅ Turns chats into structured orders automatically\n📦 Tracks inventory in real-time\n👥 Manages all customers in one place\n💳 Collects payments without leaving chat`, delay: 0 },
          { text: `All of it — no coding, no IT team needed.`, delay: 1200 },
          { text: `What would you like to do next?`, delay: 2000 },
        ],
        buttons: [
          { label: 'Set up my store', value: 'setup', emoji: '🚀' },
          { label: 'See how it works', value: 'demo', emoji: '▶️' },
          { label: 'Talk to someone', value: 'human', emoji: '🙋' },
        ],
        nextStep: 'action_choice',
      };

    case 'action_choice':
      if (value === 'setup') {
        return {
          messages: [
            { text: `Love the energy! 🚀 Let's build your store.`, delay: 0 },
            { text: `First — what's your business name?`, delay: 800 },
          ],
          nextStep: 'setup_name',
        };
      }
      if (value === 'demo') {
        return {
          messages: [
            { text: `Here's Hypnate in action 👇`, delay: 0 },
            { text: `📲 **Customer sends a WhatsApp message** → Hypnate auto-reads it\n🛒 Order is structured and saved instantly\n📦 Inventory updates automatically\n💳 Payment link sent in one tap`, delay: 700 },
            { text: `No manual entry. No missed orders. Ever.`, delay: 1800 },
          ],
          buttons: [
            { label: 'I want to try this', value: 'setup', emoji: '🚀' },
            { label: 'See a real demo video', value: 'demo_video', emoji: '🎬' },
            { label: 'Talk to someone', value: 'human', emoji: '🙋' },
          ],
          nextStep: 'demo_shown',
        };
      }
      if (value === 'human') {
        return {
          messages: [
            { text: `Our team is happy to help! 🙋`, delay: 0 },
            { text: `What's the best way to reach you? (phone or email)`, delay: 700 },
          ],
          nextStep: 'human_contact',
        };
      }
      return getReply('fallback', value, ctx);

    case 'demo_shown':
      if (value === 'setup' || value === 'demo_try') {
        return getReply('action_choice', 'setup', ctx);
      }
      if (value === 'demo_video') {
        return {
          messages: [
            { text: `🎬 Our full demo video is at **hypnate.in/demo** — opens in a new tab!`, delay: 0 },
            { text: `Want to set up your store after watching?`, delay: 900 },
          ],
          buttons: [
            { label: 'Set up my store', value: 'setup', emoji: '🚀' },
            { label: 'Talk to someone', value: 'human', emoji: '🙋' },
          ],
          nextStep: 'demo_try',
        };
      }
      if (value === 'human') {
        return getReply('action_choice', 'human', ctx);
      }
      return getReply('fallback', value, ctx);

    case 'demo_try':
      if (value === 'setup') return getReply('action_choice', 'setup', ctx);
      if (value === 'human') return getReply('action_choice', 'human', ctx);
      return getReply('fallback', value, ctx);

    case 'setup_name':
      return {
        messages: [
          { text: `Great name! **${value}** — has a nice ring to it. 🎯`, delay: 0 },
          { text: `Do you have a product catalog ready?`, delay: 800 },
        ],
        buttons: [
          { label: "Yes, uploading now", value: 'has_catalog', emoji: '📁' },
          { label: "Add products manually", value: 'manual_add', emoji: '✏️' },
          { label: 'Use a sample catalog', value: 'sample', emoji: '🛍️' },
        ],
        nextStep: 'setup_catalog',
      };

    case 'setup_catalog':
      const catalogMsg: Record<string, string> = {
        has_catalog: `Perfect — you can upload your catalog right after setup. 📁`,
        manual_add: `No problem — adding products manually takes under 5 minutes. ✏️`,
        sample: `We'll load a sample catalog so you can see it in action first. 🛍️`,
      };
      return {
        messages: [
          { text: catalogMsg[value] || `Got it!`, delay: 0 },
          { text: `What do you want Hypnate to help you with most?`, delay: 900 },
        ],
        buttons: [
          { label: 'Manage orders & chats', value: 'orders', emoji: '📦' },
          { label: 'Build an online store', value: 'store', emoji: '🌐' },
          { label: 'Both!', value: 'both', emoji: '⚡' },
        ],
        nextStep: 'setup_choice',
      };

    case 'setup_choice':
      const choiceMsg: Record<string, string> = {
        orders: `Order management + AI chat automation coming right up! 📦`,
        store: `Building your Hypnate X online store now! 🌐`,
        both: `Full setup mode activated — orders, store, and AI! ⚡`,
      };
      return {
        messages: [
          { text: choiceMsg[value] || `Setting everything up!`, delay: 0 },
          { text: `⏳ Creating your store...`, delay: 900 },
          { text: `🔗 Connecting AI agent...`, delay: 1800 },
          { text: `✅ Almost ready!`, delay: 2700 },
        ],
        nextStep: 'setup_progress',
      };

    case 'setup_progress':
      return {
        messages: [
          { text: `🎉 **${ctx.businessName || 'Your store'}** is ready on Hypnate!`, delay: 0 },
          { text: `Your AI agent is live, your dashboard is waiting, and your first order is one chat away.`, delay: 1000 },
        ],
        buttons: [
          { label: 'Open my dashboard', value: 'dashboard', emoji: '🏠' },
          { label: 'Show me around first', value: 'tour', emoji: '🗺️' },
        ],
        nextStep: 'setup_done',
      };

    case 'setup_done':
      if (value === 'dashboard' || value === 'tour') {
        return {
          messages: [
            { text: `Head to your dashboard and start selling! 🚀`, delay: 0 },
            { text: `I'll be right here if you need anything. Good luck! 💪`, delay: 700 },
          ],
          buttons: [
            { label: 'Start using Hypnate', value: 'start', emoji: '⚡' },
            { label: 'Talk to someone', value: 'human', emoji: '🙋' },
          ],
          nextStep: 'done',
        };
      }
      return getReply('fallback', value, ctx);

    case 'human_contact':
      return {
        messages: [
          { text: `Got it! ✅ We'll reach out within a few hours.`, delay: 0 },
          { text: `In the meantime — want to explore Hypnate on your own?`, delay: 900 },
        ],
        buttons: [
          { label: 'Set up my store', value: 'setup', emoji: '🚀' },
          { label: 'See how it works', value: 'demo', emoji: '▶️' },
          { label: "No thanks, I will wait", value: 'wait', emoji: '☕' },
        ],
        nextStep: 'human_done',
      };

    case 'human_done':
      if (value === 'setup') return getReply('action_choice', 'setup', ctx);
      if (value === 'demo') return getReply('action_choice', 'demo', ctx);
      return {
        messages: [
          { text: `No worries — grab a coffee and we'll ping you soon! ☕`, delay: 0 },
          { text: `You can always restart anytime.`, delay: 700 },
        ],
        buttons: [
          { label: 'Start over', value: 'restart', emoji: '🔄' },
        ],
        nextStep: 'done',
      };

    case 'done':
      return {
        messages: [
          { text: `Welcome to Hypnate! 🎉 Your journey starts now.`, delay: 0 },
        ],
        buttons: [
          { label: 'Open dashboard', value: 'dashboard', emoji: '🏠' },
          { label: 'Start over', value: 'restart', emoji: '🔄' },
        ],
        nextStep: 'done',
      };

    default:
      return {
        messages: [
          { text: `Hmm, I didn't quite catch that. Let me show you your options.`, delay: 0 },
        ],
        buttons: [
          { label: 'Set up my store', value: 'setup', emoji: '🚀' },
          { label: 'See how it works', value: 'demo', emoji: '▶️' },
          { label: 'Talk to someone', value: 'human', emoji: '🙋' },
        ],
        nextStep: 'action_choice',
      };
  }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2);
const isInputStep = (step: Step) =>
  ['setup_name', 'human_contact'].includes(step);

/* ─── Component ───────────────────────────────────────────────────────────── */
export const DemoChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<Step>('entry');
  const [ctx, setCtx] = useState<UserCtx>({});
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollDown = () =>
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollDown(); }, [messages, isTyping]);

  /* Start conversation */
  const startConversation = useCallback(() => {
    const reply = getReply('entry', '', {});
    deliverReply(reply, 'entry');
  }, []);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setUnread(0);
      setTimeout(startConversation, 400);
    }
    if (isOpen) setUnread(0);
  }, [isOpen, hasGreeted, startConversation]);

  /* Idle re-engagement */
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!isOpen) return;
    idleTimer.current = setTimeout(() => {
      if (step !== 'done') {
        pushBotMessage({
          id: uid(),
          text: `Still there? 👋 I can help you get started in under 2 minutes.`,
          sender: 'bot',
          buttons: [
            { label: 'Set up my store', value: 'setup', emoji: '🚀' },
            { label: 'See how it works', value: 'demo', emoji: '▶️' },
          ],
        });
      }
    }, 25000);
  }, [isOpen, step]);

  useEffect(() => { resetIdleTimer(); }, [messages, resetIdleTimer]);

  /* Deliver reply with staggered typing */
  const deliverReply = (reply: BotReply, nextStep: Step) => {
    setInputDisabled(true);
    setIsTyping(true);

    const maxDelay = Math.max(...reply.messages.map(m => m.delay));

    reply.messages.forEach((m, i) => {
      setTimeout(() => {
        setIsTyping(i < reply.messages.length - 1);
        const isLast = i === reply.messages.length - 1;
        const msg: Message = {
          id: uid(),
          text: m.text,
          sender: 'bot',
          buttons: isLast ? reply.buttons : undefined,
        };
        pushBotMessage(msg);
        if (isLast) {
          if (!reply.buttons?.length && reply.nextStep) {
            setInputDisabled(!isInputStep(reply.nextStep));
          } else {
            setInputDisabled(true);
          }
        }
      }, m.delay + 600);
    });

    if (reply.nextStep) {
      setTimeout(() => setStep(reply.nextStep!), maxDelay + 700);
    }
  };

  const pushBotMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
    if (!isOpen) setUnread(n => n + 1);
  };

  /* Handle button click */
  const handleButton = (label: string, value: string) => {
    resetIdleTimer();
    // Remove buttons from all previous messages
    setMessages(prev => prev.map(m => ({ ...m, buttons: undefined })));

    const userMsg: Message = { id: uid(), text: label, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    let newCtx = { ...ctx };
    if (step === 'platform') newCtx.platform = value;
    if (step === 'action_choice') newCtx.flow = value as UserCtx['flow'];
    if (step === 'setup_choice') newCtx.setupChoice = value;
    if (value === 'restart') { handleRestart(); return; }
    if (value === 'dashboard') { window.location.href = '/dashboard'; return; }
    setCtx(newCtx);

    const reply = getReply(step, value, newCtx);
    deliverReply(reply, reply.nextStep || step);
  };

  /* Handle text input */
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || inputDisabled) return;
    resetIdleTimer();

    const text = input.trim();
    setMessages(prev => prev.map(m => ({ ...m, buttons: undefined })));
    const userMsg: Message = { id: uid(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    let newCtx = { ...ctx };
    if (step === 'setup_name') newCtx.businessName = text;
    if (step === 'human_contact') newCtx.contact = text;
    setCtx(newCtx);

    const reply = getReply(step, text, newCtx);
    deliverReply(reply, reply.nextStep || step);
  };

  /* Restart */
  const handleRestart = () => {
    setMessages([]);
    setStep('entry');
    setCtx({});
    setInputDisabled(true);
    setIsTyping(false);
    setTimeout(() => {
      const reply = getReply('entry', '', {});
      deliverReply(reply, 'entry');
    }, 300);
  };

  /* Render bold from **text** */
  const renderText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ fontWeight: 700 }}>{p}</strong>
        : p.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</React.Fragment>
        ))
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="zara-wrap">

        {/* ── Chat window ── */}
        <div className={`zara-window ${isOpen ? 'zara-open' : ''}`}>

          {/* Header */}
          <div className="zara-header">
            <div className="zara-header-left">
              <div className="zara-avatar">
                <Zap size={18} color="#fff" />
                <span className="zara-avatar-pulse" />
              </div>
              <div>
                <div className="zara-header-name">Zara</div>
                <div className="zara-header-sub">
                  <span className="zara-online-dot" />
                  Hypnate AI · Online
                </div>
              </div>
            </div>
            <div className="zara-header-actions">
              <button className="zara-icon-btn" onClick={handleRestart} title="Restart">
                <RotateCcw size={14} />
              </button>
              <button className="zara-icon-btn" onClick={() => setIsOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="zara-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`zara-msg-row ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                {msg.sender === 'bot' && (
                  <div className="zara-bot-icon">
                    <Sparkles size={10} color="#0d9488" />
                  </div>
                )}
                <div className="zara-msg-col">
                  <div className={`zara-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                    {renderText(msg.text)}
                  </div>
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="zara-buttons">
                      {msg.buttons.map(btn => (
                        <button
                          key={btn.value}
                          className="zara-btn"
                          onClick={() => handleButton(btn.label, btn.value)}
                        >
                          {btn.emoji && <span className="zara-btn-emoji">{btn.emoji}</span>}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="zara-msg-row bot">
                <div className="zara-bot-icon">
                  <Sparkles size={10} color="#0d9488" />
                </div>
                <div className="zara-bubble bot zara-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Persistent quick actions */}
          <div className="zara-quick-actions">
            {[
              { label: 'Setup store', value: 'setup', emoji: '🚀' },
              { label: 'View demo', value: 'demo', emoji: '▶️' },
              { label: 'Support', value: 'human', emoji: '🙋' },
            ].map(a => (
              <button key={a.value} className="zara-quick-btn"
                onClick={() => {
                  setMessages(prev => prev.map(m => ({ ...m, buttons: undefined })));
                  setStep('action_choice');
                  handleButton(a.label, a.value);
                }}>
                {a.emoji} {a.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="zara-input-row" onSubmit={handleSend}>
            <input
              className="zara-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={inputDisabled ? 'Choose an option above ↑' : 'Type your answer…'}
              disabled={inputDisabled}
            />
            <button
              type="submit"
              className="zara-send-btn"
              disabled={inputDisabled || !input.trim()}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* ── Toggle ── */}
        <button
          className={`zara-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(o => !o)}
          aria-label="Chat with Zara"
        >
          {isOpen
            ? <X size={24} />
            : <><Sparkles size={24} />{unread > 0 && <span className="zara-unread">{unread}</span>}</>}
        </button>
      </div>
    </>
  );
};

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

.zara-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: flex-end; }

/* Window */
.zara-window { width: 360px; background: #fff; border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06); margin-bottom: 14px; display: flex; flex-direction: column; overflow: hidden; opacity: 0; transform: scale(0.93) translateY(16px); pointer-events: none; transition: opacity 0.25s ease, transform 0.25s ease; transform-origin: bottom right; max-height: 580px; }
.zara-window.zara-open { opacity: 1; transform: scale(1) translateY(0); pointer-events: all; }

/* Header */
.zara-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.zara-header-left { display: flex; align-items: center; gap: 10px; }
.zara-avatar { width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #0d9488, #0891b2); display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
.zara-avatar-pulse { position: absolute; inset: -2px; border-radius: 14px; border: 2px solid rgba(13,148,136,0.5); animation: zaraPulse 2s ease-in-out infinite; }
.zara-header-name { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
.zara-header-sub { font-size: 11px; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 5px; margin-top: 1px; }
.zara-online-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; display: inline-block; animation: zaraBlink 2s ease-in-out infinite; }
.zara-header-actions { display: flex; gap: 6px; }
.zara-icon-btn { width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,0.08); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.6); transition: all 0.15s; }
.zara-icon-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

/* Messages */
.zara-messages { flex: 1; overflow-y: auto; padding: 16px 14px 8px; display: flex; flex-direction: column; gap: 10px; background: #f8fafc; scroll-behavior: smooth; }
.zara-messages::-webkit-scrollbar { width: 4px; }
.zara-messages::-webkit-scrollbar-track { background: transparent; }
.zara-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

.zara-msg-row { display: flex; align-items: flex-start; gap: 7px; animation: zaraSlideUp 0.3s ease; }
.zara-msg-row.user { flex-direction: row-reverse; }
.zara-msg-col { display: flex; flex-direction: column; gap: 6px; max-width: 82%; }
.zara-msg-row.user .zara-msg-col { align-items: flex-end; }

.zara-bot-icon { width: 22px; height: 22px; border-radius: 6px; background: #f0fdfa; border: 1px solid #ccfbf1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }

.zara-bubble { padding: 10px 13px; border-radius: 16px; font-size: 13.5px; line-height: 1.6; word-break: break-word; }
.zara-bubble.bot { background: #fff; color: #0f172a; border: 1px solid #f1f5f9; border-radius: 4px 16px 16px 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.zara-bubble.user { background: linear-gradient(135deg, #0d9488, #0891b2); color: #fff; border-radius: 16px 4px 16px 16px; }

/* Typing indicator */
.zara-typing { display: flex; align-items: center; gap: 4px; padding: 12px 16px; }
.zara-typing span { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; animation: zaraTyping 1.2s ease-in-out infinite; }
.zara-typing span:nth-child(2) { animation-delay: 0.2s; }
.zara-typing span:nth-child(3) { animation-delay: 0.4s; }

/* Buttons */
.zara-buttons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.zara-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 100px; font-size: 12.5px; font-weight: 600; color: #0f172a; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.15s; white-space: nowrap; }
.zara-btn:hover { border-color: #0d9488; color: #0d9488; background: #f0fdfa; transform: translateY(-1px); }
.zara-btn-emoji { font-size: 13px; }

/* Quick actions */
.zara-quick-actions { display: flex; gap: 6px; padding: 8px 12px; border-top: 1px solid #f1f5f9; background: #fff; flex-shrink: 0; overflow-x: auto; }
.zara-quick-actions::-webkit-scrollbar { display: none; }
.zara-quick-btn { padding: 5px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 100px; font-size: 11.5px; font-weight: 600; color: #475569; cursor: pointer; font-family: 'Outfit', sans-serif; white-space: nowrap; transition: all 0.15s; flex-shrink: 0; }
.zara-quick-btn:hover { background: #f0fdfa; border-color: #0d9488; color: #0d9488; }

/* Input */
.zara-input-row { display: flex; gap: 8px; padding: 10px 12px; background: #fff; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.zara-input { flex: 1; padding: 9px 14px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 100px; font-size: 13px; font-family: 'Outfit', sans-serif; color: #0f172a; outline: none; transition: border-color 0.2s; }
.zara-input:focus { border-color: #0d9488; background: #fff; }
.zara-input:disabled { color: #94a3b8; cursor: not-allowed; }
.zara-input::placeholder { color: #94a3b8; }
.zara-send-btn { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #0891b2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; transition: all 0.15s; flex-shrink: 0; }
.zara-send-btn:hover:not(:disabled) { transform: scale(1.08); }
.zara-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Toggle */
.zara-toggle { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #0891b2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 8px 24px rgba(13,148,136,0.4); transition: all 0.2s; position: relative; }
.zara-toggle:hover { transform: scale(1.08); box-shadow: 0 12px 32px rgba(13,148,136,0.5); }
.zara-toggle.open { background: linear-gradient(135deg, #1e293b, #0f172a); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.zara-unread { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; border-radius: 50%; background: #ef4444; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

/* Animations */
@keyframes zaraPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
@keyframes zaraBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes zaraSlideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes zaraTyping { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
`;