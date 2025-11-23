import { create } from 'zustand';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'merchant';
  timestamp: Date;
  type?: 'text' | 'product' | 'payment';
  language?: string; // 'en', 'hi', etc.
  metadata?: any;
}

export interface Chat {
  id: string;
  customerName: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram';
  lastMessage: string;
  unreadCount: number;
  timestamp: Date;
  messages: Message[];
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  setActiveChat: (id: string) => void;
  sendMessage: (chatId: string, text: string, type?: 'text' | 'product' | 'payment') => void;
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    customerName: 'Rahul Sharma',
    platform: 'whatsapp',
    lastMessage: 'Is this available in blue?',
    unreadCount: 2,
    timestamp: new Date(),
    messages: [
      { id: 'm1', text: 'Hi, I saw your Instagram ad.', sender: 'user', timestamp: new Date(Date.now() - 100000), language: 'en' },
      { id: 'm2', text: 'Hello Rahul! How can I help you today?', sender: 'merchant', timestamp: new Date(Date.now() - 90000), language: 'en' },
      { id: 'm3', text: 'Is this available in blue?', sender: 'user', timestamp: new Date(Date.now() - 80000), language: 'en' },
    ]
  },
  {
    id: '2',
    customerName: 'Priya Singh',
    platform: 'whatsapp',
    lastMessage: 'Payment sent.',
    unreadCount: 0,
    timestamp: new Date(Date.now() - 3600000),
    messages: [
      { id: 'm1', text: 'I want to order the soap.', sender: 'user', timestamp: new Date(Date.now() - 400000), language: 'en' },
      { id: 'm2', text: 'Sure! Here is the payment link.', sender: 'merchant', timestamp: new Date(Date.now() - 300000), type: 'payment', language: 'en' },
      { id: 'm3', text: 'Payment sent.', sender: 'user', timestamp: new Date(Date.now() - 200000), language: 'en' },
    ]
  },
  {
    id: '3',
    customerName: 'Anjali Gupta',
    platform: 'instagram',
    lastMessage: 'Price please?',
    unreadCount: 1,
    timestamp: new Date(Date.now() - 7200000),
    messages: [
      { id: 'm1', text: 'Price please?', sender: 'user', timestamp: new Date(Date.now() - 100000), language: 'en' },
    ]
  },
  {
    id: '4',
    customerName: 'Vikram Malhotra',
    platform: 'instagram',
    lastMessage: 'Loved the packaging! 😍',
    unreadCount: 0,
    timestamp: new Date(Date.now() - 86400000),
    messages: [
      { id: 'm1', text: 'Received my order today.', sender: 'user', timestamp: new Date(Date.now() - 900000), language: 'en' },
      { id: 'm2', text: 'Loved the packaging! 😍', sender: 'user', timestamp: new Date(Date.now() - 800000), language: 'en' },
    ]
  },
  {
    id: '5',
    customerName: 'Sarah Jenkins',
    platform: 'facebook',
    lastMessage: 'Do you ship to Mumbai?',
    unreadCount: 3,
    timestamp: new Date(Date.now() - 120000),
    messages: [
      { id: 'm1', text: 'Hi there!', sender: 'user', timestamp: new Date(Date.now() - 150000), language: 'en' },
      { id: 'm2', text: 'Do you ship to Mumbai?', sender: 'user', timestamp: new Date(Date.now() - 120000), language: 'en' },
    ]
  },
  {
    id: '6',
    customerName: 'Arjun Kumar',
    platform: 'telegram',
    lastMessage: 'Can I get a bulk discount?',
    unreadCount: 0,
    timestamp: new Date(Date.now() - 500000),
    messages: [
      { id: 'm1', text: 'Hello, interested in the ceramic vases.', sender: 'user', timestamp: new Date(Date.now() - 600000), language: 'en' },
      { id: 'm2', text: 'Can I get a bulk discount?', sender: 'user', timestamp: new Date(Date.now() - 500000), language: 'en' },
    ]
  }
];

export const useChatStore = create<ChatState>((set) => ({
  chats: MOCK_CHATS,
  activeChatId: null,
  setActiveChat: (id) => set({ activeChatId: id }),
  sendMessage: (chatId, text, type = 'text') => set((state) => {
    const newMsg: Message = {
      id: Math.random().toString(),
      text,
      sender: 'merchant',
      timestamp: new Date(),
      type,
      language: 'en' // Merchant sends in English (or current lang)
    };
    
    const updatedChats = state.chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          lastMessage: text,
          timestamp: new Date()
        };
      }
      return chat;
    });

    return { chats: updatedChats };
  }),
}));
