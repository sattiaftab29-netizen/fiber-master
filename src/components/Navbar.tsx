import React from 'react';
import {
  Activity,
  Users,
  FileText,
  Printer,
  MessageSquare,
  Wifi,
  UserCheck,
  BookOpen,
  RotateCcw,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  overdueCount: number;
  activeSubscribers: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  role,
  setRole,
  overdueCount,
  activeSubscribers,
  onResetData,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['admin', 'staff'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'staff'] },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText, roles: ['admin', 'staff'], badge: overdueCount > 0 ? `${overdueCount}` : undefined },
    { id: 'a4-invoice', label: 'A4 Invoice Studio', icon: Printer, roles: ['admin', 'staff'] },
    { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare, roles: ['admin', 'staff'] },
    { id: 'plans', label: 'Plans & Bandwidth', icon: Wifi, roles: ['admin', 'staff'] },
    { id: 'portal', label: 'Customer Portal', icon: UserCheck, roles: ['admin', 'staff', 'customer'] },
    { id: 'docs', label: 'System Specs & SQL', icon: BookOpen, roles: ['admin', 'staff', 'customer'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black text-xl tracking-wider">
              NP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">NetPulse</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold tracking-wide">
                  ISP OS v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400">Broadband &amp; Billing Management System</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Active Lines:</span>
              <span className="text-emerald-400 font-bold">{activeSubscribers}</span>
            </div>

            {overdueCount > 0 && (
              <div
                onClick={() => setActiveTab('invoices')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 cursor-pointer hover:bg-amber-500/25 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Overdue:</span>
                <span className="font-bold text-amber-200">{overdueCount}</span>
              </div>
            )}
          </div>

          {/* Right Controls: Role Selector & Reset */}
          <div className="flex items-center gap-3">
            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700/80 transition-colors text-xs font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span className="capitalize">Role: {role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Persona
                  </div>
                  <button
                    onClick={() => {
                      setRole('admin');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                      role === 'admin' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span>Admin / Manager</span>
                    <span className="text-[10px] text-slate-400">Full Access</span>
                  </button>
                  <button
                    onClick={() => {
                      setRole('staff');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                      role === 'staff' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span>Staff / Operator</span>
                    <span className="text-[10px] text-slate-400">Bills &amp; CRM</span>
                  </button>
                  <button
                    onClick={() => {
                      setRole('customer');
                      setActiveTab('portal');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between ${
                      role === 'customer' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span>Customer Portal</span>
                    <span className="text-[10px] text-slate-400">Self-Pay View</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                if (confirm('Reset ISP system data back to default sample subscribers and invoices?')) {
                  onResetData();
                }
              }}
              title="Reset Sample ISP Data"
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
