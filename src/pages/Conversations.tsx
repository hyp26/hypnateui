import React, { useState } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Image as ImageIcon, CreditCard, ShoppingBag, MessageCircle, Instagram, Facebook, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getMockTranslation } from '../utils/mockTranslation';

export const Conversations = () => {
  const { chats, activeChatId, setActiveChat, sendMessage } = useChatStore();
  const [msgText, setMsgText] = useState('');
  const [filter, setFilter] = useState<'all' | 'whatsapp' | 'instagram' | 'facebook' | 'telegram'>('all');
  const { i18n } = useTranslation();

  const activeChat = chats.find(c => c.id === activeChatId);

  const filteredChats = chats.filter(chat => {
    if (filter === 'all') return true;
    return chat.platform === filter;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !activeChatId) return;
    sendMessage(activeChatId, msgText);
    setMsgText('');
  };

  const getPlatformIcon = (platform: string, className?: string) => {
    switch (platform) {
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'facebook': return <Facebook className={className} />;
      case 'telegram': return <Send className={className} />;
      default: return <MessageCircle className={className} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'text-green-500 bg-green-100 text-green-700';
      case 'instagram': return 'text-pink-500 bg-pink-100 text-pink-700';
      case 'facebook': return 'text-blue-600 bg-blue-100 text-blue-700';
      case 'telegram': return 'text-sky-500 bg-sky-100 text-sky-700';
      default: return 'text-gray-500 bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm flex overflow-hidden">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm bg-white"
            />
          </div>
          
          {/* Platform Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap", filter === 'all' ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300")}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('whatsapp')}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap", filter === 'whatsapp' ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200")}
            >
              <MessageCircle className="w-3 h-3" /> WA
            </button>
            <button 
              onClick={() => setFilter('instagram')}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap", filter === 'instagram' ? "bg-pink-600 text-white" : "bg-pink-100 text-pink-700 hover:bg-pink-200")}
            >
              <Instagram className="w-3 h-3" /> IG
            </button>
            <button 
              onClick={() => setFilter('facebook')}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap", filter === 'facebook' ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200")}
            >
              <Facebook className="w-3 h-3" /> FB
            </button>
            <button 
              onClick={() => setFilter('telegram')}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap", filter === 'telegram' ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-700 hover:bg-sky-200")}
            >
              <Send className="w-3 h-3" /> TG
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const platformStyles = getPlatformColor(chat.platform).split(' ');
            const iconColor = platformStyles[0];
            
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                  activeChatId === chat.id && "bg-primary-50 hover:bg-primary-50 border-l-4 border-l-primary-600"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{chat.customerName}</h4>
                    {getPlatformIcon(chat.platform, cn("w-3 h-3", iconColor))}
                  </div>
                  <span className="text-xs text-gray-500">{format(chat.timestamp, 'HH:mm')}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <div className="mt-2 flex justify-end">
                    <span className="bg-secondary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {chat.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-[#efeae2] bg-opacity-30">
          {/* Header */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                activeChat.platform === 'whatsapp' ? "bg-green-500" : 
                activeChat.platform === 'instagram' ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" :
                activeChat.platform === 'facebook' ? "bg-blue-600" :
                "bg-sky-500"
              )}>
                {activeChat.customerName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {activeChat.customerName}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                    getPlatformColor(activeChat.platform).split(' ').slice(1).join(' ')
                  )}>
                    {activeChat.platform}
                  </span>
                </h3>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <Phone className="w-5 h-5 cursor-pointer hover:text-gray-700" />
              <Video className="w-5 h-5 cursor-pointer hover:text-gray-700" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-700" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
            {activeChat.messages.map((msg) => {
              // Translation Logic
              const isCustomer = msg.sender === 'user';
              const needsTranslation = isCustomer && i18n.language !== 'en' && msg.language === 'en';
              const translatedText = needsTranslation ? getMockTranslation(msg.text, i18n.language) : null;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    !isCustomer ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3 shadow-sm relative text-sm group",
                      !isCustomer
                        ? "bg-primary-100 text-gray-900 rounded-tr-none" 
                        : "bg-white text-gray-900 rounded-tl-none"
                    )}
                  >
                    {msg.type === 'payment' ? (
                      <div className="bg-white p-3 rounded border border-green-100 mb-1">
                        <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
                          <CreditCard className="w-4 h-4" /> Payment Request
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Please pay ₹1,299 for your order.</p>
                        <button className="w-full bg-green-600 text-white py-1.5 rounded text-xs font-medium">
                          Pay Now
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Show Translated Text if available */}
                        <p>{translatedText || msg.text}</p>
                        
                        {/* Translation Indicator */}
                        {translatedText && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-primary-600 flex items-center gap-1 font-medium">
                                <Sparkles className="w-3 h-3" /> AI Translated
                              </span>
                              {/* Tooltip-like original text on hover */}
                              <div className="hidden group-hover:block absolute bottom-full left-0 bg-gray-800 text-white text-xs p-2 rounded mb-2 w-max max-w-xs z-10">
                                Original: {msg.text}
                                <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500 block text-right mt-1">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="bg-white p-4 border-t border-gray-200">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <ShoppingBag className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder={i18n.language === 'hi' ? "संदेश टाइप करें..." : "Type a message..."}
                className="flex-1 bg-gray-100 border-0 rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary-500 focus:bg-white transition-all"
              />
              <button 
                type="submit" 
                disabled={!msgText.trim()}
                className="bg-primary-500 text-white p-2.5 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
          <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};
