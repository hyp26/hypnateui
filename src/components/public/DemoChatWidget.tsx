import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send,ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'product_carousel' | 'payment_link';
}

const MOCK_PRODUCTS = [
  { id: 1, name: 'Premium Cotton Kurta', price: '₹1,299', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&q=80' },
  { id: 2, name: 'Handcrafted Vase', price: '₹899', image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=150&q=80' },
];

export const DemoChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi there! 👋 Welcome to Hypnate.', sender: 'bot' },
    { id: '2', text: 'We will be launching soon!', sender: 'bot' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const botResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "We will be launching soon!", 
        sender: 'bot' 
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl border border-gray-200 w-[350px] mb-4 overflow-hidden transition-all duration-300 origin-bottom-right",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0"
      )}>
        {/* Header */}
        <div className="bg-primary-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Hypnate AI Assistant</h3>
              <p className="text-xs text-primary-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Online Now
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-[350px] overflow-y-auto p-4 bg-gray-50 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.sender === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                msg.sender === 'user' 
                  ? "bg-primary-600 text-white rounded-tr-none" 
                  : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
              )}>
                {msg.text}
                
                {/* Product Carousel */}
                {msg.type === 'product_carousel' && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {MOCK_PRODUCTS.map(prod => (
                      <div key={prod.id} className="min-w-[120px] bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <img src={prod.image} alt={prod.name} className="w-full h-24 object-cover rounded-md mb-2" />
                        <p className="font-bold text-xs truncate">{prod.name}</p>
                        <p className="text-xs text-primary-600 font-bold">{prod.price}</p>
                        <button 
                          onClick={() => { setInput(`I want to buy ${prod.name}`); handleSend(); }}
                          className="w-full mt-2 bg-gray-900 text-white text-[10px] py-1 rounded"
                        >
                          Buy Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment Link */}
                {msg.type === 'payment_link' && (
                  <div className="mt-2 bg-green-50 border border-green-100 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-green-800">Total: ₹1,299</span>
                      <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded">SECURE</span>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1">
                      Pay with UPI <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
          isOpen ? "bg-gray-800 text-white rotate-90" : "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};
