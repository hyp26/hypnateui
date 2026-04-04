import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, Globe, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Popover, Transition, Menu as HeadlessMenu } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Mock Notifications Data
const notifications = [
  { id: 1, title: 'New Order #1029', desc: 'Rahul Sharma placed an order for ₹1,299', time: '5m ago', unread: true },
  { id: 2, title: 'Payment Received', desc: 'Payment of ₹450 received via UPI', time: '1h ago', unread: true },
  { id: 3, title: 'Low Stock Alert', desc: 'Cotton Kurta (Blue) is running low', time: '2h ago', unread: false },
];

export const Header = () => {
  const { i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-20 shadow-sm">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, customers, or products..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
          title="Switch Language"
        >
          <Globe className="w-5 h-5" />
          <span className="uppercase">{i18n.language}</span>
        </button>

        {/* Notifications Popover */}
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button className={cn(
                "p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative outline-none",
                open && "bg-gray-100 text-primary-600"
              )}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full border-2 border-white animate-pulse"></span>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="text-xs text-primary-600 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <div key={item.id} className={cn("p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors", item.unread && "bg-primary-50/30")}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <span className="text-[10px] text-gray-400">{item.time}</span>
                        </div>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
                    <Link to="/settings" className="text-xs font-medium text-gray-500 hover:text-primary-600">View all notifications</Link>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>

        {/* Profile Dropdown */}
        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className="flex items-center gap-2 outline-none p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-200">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[100px] truncate">
              {user?.name || 'Merchant'}
            </span>
          </HeadlessMenu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 divide-y divide-gray-100">
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                        active ? "bg-primary-50 text-primary-700" : "text-gray-700"
                      )}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                        active ? "bg-primary-50 text-primary-700" : "text-gray-700"
                      )}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  )}
                </HeadlessMenu.Item>
              </div>
              <div className="p-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                        active ? "bg-red-50 text-red-700" : "text-red-600"
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  )}
                </HeadlessMenu.Item>
              </div>
            </HeadlessMenu.Items>
          </Transition>
        </HeadlessMenu>
      </div>
    </header>
  );
};
