import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Building2, Upload, CreditCard, Share2, MessageCircle, Instagram, Facebook, Send, Loader2, Sparkles, Bot, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useIntegrationStore, Platform } from '../stores/useIntegrationStore';
import { ConnectModal } from '../components/integrations/ConnectModal';

const steps = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Catalog', icon: Upload },
  { id: 3, title: 'Payments', icon: CreditCard },
  { id: 4, title: 'Channels', icon: Share2 },
  { id: 5, title: 'AI Setup', icon: Sparkles },
];

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { channels } = useIntegrationStore();
  
  // Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  // Automation State
  const [autoProgress, setAutoProgress] = useState(0);
  const [autoTasks, setAutoTasks] = useState([
    { id: 1, label: 'Syncing Product Catalog...', done: false },
    { id: 2, label: 'Configuring AI Chatbots...', done: false },
    { id: 3, label: 'Verifying Payment Keys...', done: false },
    { id: 4, label: 'Generating Store Links...', done: false },
  ]);

  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle Automation Simulation
  useEffect(() => {
    if (currentStep === 5) {
      const interval = setInterval(() => {
        setAutoProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      const taskInterval = setInterval(() => {
        setAutoTasks(prev => {
          const nextTaskIndex = prev.findIndex(t => !t.done);
          if (nextTaskIndex === -1) {
            clearInterval(taskInterval);
            return prev;
          }
          const newTasks = [...prev];
          newTasks[nextTaskIndex].done = true;
          return newTasks;
        });
      }, 1200);

      return () => {
        clearInterval(interval);
        clearInterval(taskInterval);
      };
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(c => c + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleConnectClick = (platform: Platform) => {
    if (!channels[platform].connected) {
      setSelectedPlatform(platform);
      setIsConnectModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 pb-12 px-4">
      <div className="w-full max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex flex-col items-center gap-2 bg-gray-50 px-2 transition-colors duration-500",
                  currentStep >= step.id ? "text-primary-600" : "text-gray-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-white",
                  currentStep >= step.id 
                    ? "border-primary-600 bg-primary-50" 
                    : "border-gray-300"
                )}>
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 min-h-[450px] flex flex-col transition-all duration-500">
          <div className="flex-1">
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-gray-900">Tell us about your business</h2>
                <p className="text-gray-500">We need some basic details to set up your store.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. My Awesome Store" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                      <option>Retail</option>
                      <option>Food & Beverage</option>
                      <option>Services</option>
                      <option>Fashion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                      <option>1-10 employees</option>
                      <option>10-50 employees</option>
                      <option>50+ employees</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-gray-900">Add your products</h2>
                <p className="text-gray-500">Upload a CSV or add products manually.</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer mt-6 group">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-600" />
                  </div>
                  <p className="font-medium text-gray-900 text-lg">Click to upload CSV</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop your catalog file here</p>
                  <p className="text-xs text-gray-400 mt-4">Supported formats: .csv, .xls, .xlsx</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-gray-900">Setup Payments</h2>
                <p className="text-gray-500">Enter your Razorpay API keys to accept payments.</p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold">Secure Integration</p>
                    <p>Your keys are encrypted and stored securely. We never share them.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono" placeholder="rzp_test_..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none font-mono" placeholder="••••••••••••••••" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-gray-900">Connect Channels</h2>
                <p className="text-gray-500">Link your social accounts to start selling. Click a card to connect.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* WhatsApp Card */}
                  <div 
                    onClick={() => handleConnectClick('whatsapp')}
                    className={cn(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group",
                      channels.whatsapp.connected 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">WhatsApp</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {channels.whatsapp.connected ? 'Connected' : 'Connect Business API'}
                      </p>
                      {channels.whatsapp.connected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instagram Card */}
                  <div 
                    onClick={() => handleConnectClick('instagram')}
                    className={cn(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group",
                      channels.instagram.connected 
                        ? "border-pink-500 bg-pink-50" 
                        : "border-gray-200 hover:border-pink-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Instagram className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">Instagram</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {channels.instagram.connected ? 'Connected' : 'Connect DM Automation'}
                      </p>
                      {channels.instagram.connected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Facebook Card */}
                  <div 
                    onClick={() => handleConnectClick('facebook')}
                    className={cn(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group",
                      channels.facebook.connected 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Facebook className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">Facebook</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {channels.facebook.connected ? 'Connected' : 'Connect Messenger'}
                      </p>
                      {channels.facebook.connected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telegram Card */}
                  <div 
                    onClick={() => handleConnectClick('telegram')}
                    className={cn(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group",
                      channels.telegram.connected 
                        ? "border-sky-500 bg-sky-50" 
                        : "border-gray-200 hover:border-sky-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Send className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">Telegram</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {channels.telegram.connected ? 'Connected' : 'Connect Bot'}
                      </p>
                      {channels.telegram.connected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white animate-in zoom-in">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: AI Automation Simulation */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-full py-8">
                 <div className="relative">
                   <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center relative z-10">
                     <Bot className="w-12 h-12 text-primary-600 animate-bounce" />
                   </div>
                   <div className="absolute inset-0 rounded-full bg-primary-500 opacity-20 animate-ping"></div>
                 </div>

                 <div className="text-center space-y-2">
                   <h2 className="text-2xl font-bold text-gray-900">Setting up your store</h2>
                   <p className="text-gray-500">Hypnate AI is configuring your workspace...</p>
                 </div>

                 <div className="w-full max-w-md space-y-4">
                   {/* Progress Bar */}
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300 ease-out"
                       style={{ width: `${autoProgress}%` }}
                     />
                   </div>

                   {/* Tasks List */}
                   <div className="space-y-3">
                     {autoTasks.map((task) => (
                       <div key={task.id} className="flex items-center gap-3 text-sm">
                         {task.done ? (
                           <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-in zoom-in">
                             <Check className="w-3 h-3" />
                           </div>
                         ) : (
                           <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                         )}
                         <span className={cn(
                           "transition-colors",
                           task.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"
                         )}>
                           {task.label}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
            {currentStep < 5 && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep(c => Math.max(1, c - 1))}
                  disabled={currentStep === 1}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleNext} className="px-8">
                  {t('onboarding.next')} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
            {currentStep === 5 && (
              <div className="w-full flex justify-center">
                 <Button 
                   onClick={handleNext} 
                   className="px-12 py-3 text-lg shadow-lg shadow-primary-500/20"
                   disabled={autoProgress < 100}
                 >
                   {autoProgress < 100 ? 'Please Wait...' : 'Launch Dashboard'}
                   {autoProgress === 100 && <Sparkles className="w-5 h-5 ml-2" />}
                 </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
        platform={selectedPlatform} 
      />
    </div>
  );
};
