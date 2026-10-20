import React, { useState } from 'react';
import {
  UserCheck,
  CreditCard,
  Printer,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  Download,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Customer, Invoice, Plan, CompanySettings } from '../types';
import { buildWhatsAppUrl, compileWhatsAppMessage, Storage } from '../utils/storage';

interface CustomerPortalViewProps {
  customers: Customer[];
  invoices: Invoice[];
  plans: Plan[];
  company: CompanySettings;
  onPayInvoice: (invoice: Invoice, method: string) => void;
  onViewA4: (invoice: Invoice) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  customers,
  invoices,
  plans,
  company,
  onPayInvoice,
  onViewA4,
}) => {
  // Let the user switch which customer's portal they are viewing
  const [activeCustomerId, setActiveCustomerId] = useState<string>(
    customers.find((c) => c.status === 'active')?.id || customers[0]?.id || ''
  );

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];
  const plan = plans.find((p) => p.id === customer?.planId);
  const myInvoices = invoices.filter((i) => i.customerId === customer?.id);

  // Pay online modal state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [gateway, setGateway] = useState<'stripe' | 'sslcommerz'>('stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!customer) {
    return <div className="p-8 text-center text-slate-400">No subscribers available.</div>;
  }

  const unpaidInvoices = myInvoices.filter((i) => i.status !== 'paid');
  const totalDue = unpaidInvoices.reduce((acc, i) => acc + i.total, 0);

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      onPayInvoice(payingInvoice, gateway === 'stripe' ? 'Card / Stripe' : 'SSLCommerz');
      setTimeout(() => {
        setPaymentSuccess(false);
        setPayingInvoice(null);
      }, 1800);
    }, 1200);
  };

  const handleContactWhatsAppSupport = () => {
    const template = Storage.getTemplates().find((t) => t.code === 'SUPPORT_ROUTING');
    if (!template) return;
    const msg = compileWhatsAppMessage(template.content, customer, undefined, plan, company);
    const waUrl = buildWhatsAppUrl(company.phone, msg);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Customer Switcher Simulator */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
              Subscriber Self-Service Portal
            </span>
            <span className="text-xs text-slate-400">Live preview simulation</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Welcome back, {customer.name}
          </h1>
          <p className="text-xs text-slate-400">
            Account ID: <span className="font-mono text-teal-400">{customer.customerCode}</span> • Registered: {customer.signupDate}
          </p>
        </div>

        {/* Switch Persona */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Viewing as:</span>
          <select
            value={customer.id}
            onChange={(e) => setActiveCustomerId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customerCode}) — {c.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Account Status Card & Bandwidth Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Broadband Status</span>
            <Wifi className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                customer.status === 'active'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-rose-500'
              }`}
            ></span>
            <span className="text-xl font-bold text-white capitalize">{customer.status}</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            IP: {customer.ipAddress} • PPPoE: {customer.pppoeUsername}
          </div>
        </div>

        {/* Active Plan */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Subscribed Plan</span>
            <span className="text-xs font-mono text-teal-400">{plan?.speedMbps} Mbps</span>
          </div>
          <div className="mt-2 text-xl font-bold text-white">{plan?.name}</div>
          <div className="text-xs text-slate-400 mt-2">
            {company.currencySymbol}{plan?.price.toFixed(2)}/month • Symmetric Fiber
          </div>
        </div>

        {/* Current Total Due */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Outstanding Balance</span>
              <CreditCard className="w-4 h-4 text-cyan-400" />
            </div>
            <div
              className={`mt-2 text-2xl font-extrabold font-mono ${
                totalDue > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {company.currencySymbol}
              {totalDue.toFixed(2)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {unpaidInvoices.length > 0 ? (
              <span className="text-amber-400 font-medium">
                {unpaidInvoices.length} invoice(s) awaiting payment
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">All billing cycles settled</span>
            )}
          </div>
        </div>
      </div>

      {/* Invoices List for Subscriber */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">My Monthly Invoices &amp; Receipts</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review current statements, settle securely online, or download official A4 tax invoices.
            </p>
          </div>

          <button
            onClick={handleContactWhatsAppSupport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Support</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {myInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-3 font-bold text-teal-400">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3 text-slate-400">{inv.date}</td>
                  <td className="py-3 px-3 text-slate-300">{inv.dueDate}</td>
                  <td className="py-3 px-3 font-bold text-white">
                    {company.currencySymbol}
                    {inv.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : inv.status === 'overdue'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewA4(inv)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-sans text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>A4 Invoice</span>
                      </button>

                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-sans text-xs font-semibold shadow-md shadow-teal-600/20 flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Secure Checkout Gateway
              </h2>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">Payment Successful!</h3>
                <p className="text-xs text-slate-400">
                  Invoice <span className="text-teal-400 font-mono">{payingInvoice.invoiceNumber}</span> is now settled. Your service continues uninterrupted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProcessCheckout} className="space-y-4 text-xs">
                {/* Invoice Summary */}
                <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Invoice:</span>
                    <span className="font-mono text-white font-semibold">{payingInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Due Date:</span>
                    <span className="font-mono text-white">{payingInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-slate-800">
                    <span>Amount Payable:</span>
                    <span className="text-base text-cyan-400 font-mono">
                      {company.currencySymbol}
                      {payingInvoice.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Gateway Switcher */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Choose Gateway</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGateway('stripe')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        gateway === 'stripe'
                          ? 'bg-teal-600/20 border-teal-500 text-teal-300 font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Credit Card / Stripe
                    </button>
                    <button
                      type="button"
                      onClick={() => setGateway('sslcommerz')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        gateway === 'sslcommerz'
                          ? 'bg-teal-600/20 border-teal-500 text-teal-300 font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      SSLCommerz Gateway
                    </button>
                  </div>
                </div>

                {/* Card input mockup */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Exp Date</label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        defaultValue="883"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>256-bit TLS encrypted transaction compliant with PCI-DSS standards.</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Payment...' : `Authorize Payment (${company.currencySymbol}${payingInvoice.total.toFixed(2)})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
