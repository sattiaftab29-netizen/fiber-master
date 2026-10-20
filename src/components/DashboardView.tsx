import React from 'react';
import {
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Wifi,
  ArrowUpRight,
  Printer,
  MessageSquare,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Customer, Invoice, Plan, CompanySettings } from '../types';
import { buildWhatsAppUrl, compileWhatsAppMessage, Storage } from '../utils/storage';

interface DashboardViewProps {
  customers: Customer[];
  invoices: Invoice[];
  plans: Plan[];
  company: CompanySettings;
  setActiveTab: (tab: string) => void;
  onSelectCustomer: (cust: Customer) => void;
  onSelectInvoice: (inv: Invoice) => void;
  onBatchGenerateInvoices: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  invoices,
  plans,
  company,
  setActiveTab,
  onSelectCustomer,
  onSelectInvoice,
  onBatchGenerateInvoices,
}) => {
  // Computed metrics
  const activeCustomers = customers.filter((c) => c.status === 'active');
  const suspendedCustomers = customers.filter((c) => c.status === 'suspended');
  const terminatedCustomers = customers.filter((c) => c.status === 'terminated');

  // MRR calculation based on active customer plans
  const mrr = activeCustomers.reduce((acc, cust) => {
    const plan = plans.find((p) => p.id === cust.planId);
    return acc + (plan ? plan.price : 0);
  }, 0);

  // Invoices calculations
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((acc, i) => acc + i.total, 0);

  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const pendingAmount = pendingInvoices.reduce((acc, i) => acc + i.total, 0);

  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const collectedAmount = paidInvoices.reduce((acc, i) => acc + i.total, 0);

  const totalBilled = invoices.reduce((acc, i) => acc + i.total, 0);
  const collectionRate = totalBilled > 0 ? Math.round((collectedAmount / totalBilled) * 100) : 0;

  // Aggregate bandwidth committed
  const totalBandwidthGbps = (
    activeCustomers.reduce((acc, cust) => {
      const plan = plans.find((p) => p.id === cust.planId);
      return acc + (plan ? plan.speedMbps : 0);
    }, 0) / 1000
  ).toFixed(2);

  // Fast WhatsApp Quick Send handler
  const handleQuickWhatsAppReminder = (inv: Invoice) => {
    const cust = customers.find((c) => c.id === inv.customerId);
    if (!cust) return;
    const template = Storage.getTemplates().find((t) => t.code === 'PAYMENT_REMINDER');
    if (!template) return;

    const message = compileWhatsAppMessage(template.content, cust, inv, undefined, company);
    const waUrl = buildWhatsAppUrl(cust.phone, message);

    Storage.addWaLog({
      customerId: cust.id,
      customerName: cust.name,
      phone: cust.phone,
      templateCode: 'PAYMENT_REMINDER',
      messageBody: message,
      status: 'redirected',
      mode: 'wa_me_redirect',
      invoiceNumber: inv.invoiceNumber,
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              NOC Operations Live
            </span>
            <span className="text-xs text-slate-400 font-mono">Gateway: Core-MikroTik-01</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Network Operations &amp; Billing Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Managing subscriber connections, recurring broadband invoicing, and automated WhatsApp payment dispatch.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('customers')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Subscriber</span>
          </button>

          <button
            onClick={onBatchGenerateInvoices}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Batch Monthly Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Redirection</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Subscribers */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Subscribers</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-mono">{activeCustomers.length}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{activeCustomers.length} active</span>
              <span>•</span>
              <span className="text-amber-400">{suspendedCustomers.length} suspended</span>
              <span>•</span>
              <span className="text-rose-400">{terminatedCustomers.length} closed</span>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-all"></div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly MRR</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-mono">
              {company.currencySymbol}
              {mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-cyan-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Projected recurring contract value</span>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all"></div>
        </div>

        {/* Overdue Delinquencies */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overdue Balance</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-300 font-mono">
              {company.currencySymbol}
              {overdueAmount.toFixed(2)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-rose-400 font-semibold">{overdueInvoices.length} invoices overdue</span>
              <span
                onClick={() => setActiveTab('invoices')}
                className="text-slate-400 hover:text-white cursor-pointer underline text-[11px]"
              >
                Review
              </span>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all"></div>
        </div>

        {/* Bandwidth & Collection Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Capacity &amp; Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white font-mono">
              {totalBandwidthGbps} <span className="text-base text-slate-400 font-sans">Gbps</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400">Collection Rate:</span>
              <span className="font-semibold text-emerald-400 font-mono">{collectionRate}%</span>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
        </div>
      </div>

      {/* Action Center & Bandwidth Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overdue Action Radar */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Overdue Payment &amp; Suspension Alert Center
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Accounts requiring immediate WhatsApp reminder or Mikrotik line restriction.
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
              {overdueInvoices.length + suspendedCustomers.length} pending actions
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {overdueInvoices.length === 0 && suspendedCustomers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400/60" />
                No overdue balances or suspended accounts! All client connections are in good standing.
              </div>
            ) : (
              overdueInvoices.map((inv) => {
                const cust = customers.find((c) => c.id === inv.customerId);
                if (!cust) return null;
                const plan = plans.find((p) => p.id === cust.planId);

                return (
                  <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-xs">
                        !
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{cust.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {cust.customerCode}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">
                            Due {inv.dueDate}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {plan?.name} • Invoice #{inv.invoiceNumber} • Phone: {cust.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          {company.currencySymbol}
                          {inv.total.toFixed(2)}
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-rose-400">Overdue</span>
                      </div>

                      {/* WhatsApp trigger */}
                      <button
                        onClick={() => handleQuickWhatsAppReminder(inv)}
                        title="Send WhatsApp Reminder (wa.me redirection)"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectInvoice(inv);
                          setActiveTab('a4-invoice');
                        }}
                        title="Print A4 Invoice"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Speed Tier Distribution & Quick Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-teal-400" />
              Service Plan Subscriptions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across ISP network tiers</p>

            <div className="mt-4 space-y-3">
              {plans.map((p) => {
                const count = activeCustomers.filter((c) => c.planId === p.id).length;
                const percent = activeCustomers.length > 0 ? Math.round((count / activeCustomers.length) * 100) : 0;

                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{p.name}</span>
                        <span className="text-[10px] text-slate-500">({p.speedMbps} Mbps)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 font-bold">{count}</span>
                        <span className="text-slate-500 text-[10px] w-8 text-right">{percent}%</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Support / Redirection Notice */}
          <div className="mt-6 p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              Official WhatsApp Integration
            </div>
            <p className="text-slate-400 leading-relaxed">
              Dispatches use standard <code className="text-teal-300">wa.me/</code> protocol for instant client-side delivery, or Meta Cloud API / Twilio credentials when configured.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Generated Invoices</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest billing cycle statements &amp; payments</p>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Subscriber</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.slice(0, 6).map((inv) => {
                const cust = customers.find((c) => c.id === inv.customerId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-teal-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{cust?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cust?.customerCode}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{inv.date}</td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{inv.dueDate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {company.currencySymbol}
                      {inv.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : inv.status === 'overdue'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectInvoice(inv);
                            setActiveTab('a4-invoice');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-cyan-400" />
                          <span>A4 Print</span>
                        </button>
                        <button
                          onClick={() => handleQuickWhatsAppReminder(inv)}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
