import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Printer,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  CreditCard,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { Invoice, Customer, Plan, CompanySettings, InvoiceItem, InvoiceStatus } from '../types';
import { buildWhatsAppUrl, compileWhatsAppMessage, Storage } from '../utils/storage';

interface InvoiceManagementProps {
  invoices: Invoice[];
  customers: Customer[];
  plans: Plan[];
  company: CompanySettings;
  onSaveInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onSelectInvoiceForA4: (invoice: Invoice) => void;
  onBatchGenerateInvoices: () => void;
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({
  invoices,
  customers,
  plans,
  company,
  onSaveInvoice,
  onDeleteInvoice,
  onSelectInvoiceForA4,
  onBatchGenerateInvoices,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'Card / Stripe' | 'Bank Transfer' | 'Cash' | 'SSLCommerz' | 'Mobile Money'>('Card / Stripe');
  const [transactionRef, setTransactionRef] = useState('');

  // Create invoice state
  const [newCustomerId, setNewCustomerId] = useState(customers[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [newIssueDate, setNewIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'item-1', description: 'Broadband Monthly Service Tier', quantity: 1, unitPrice: 49.0, amount: 49.0 },
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [invoiceNotes, setInvoiceNotes] = useState('Payment due within 10 days of invoice date.');

  // Auto-populate item when customer changes
  const handleCustomerChange = (custId: string) => {
    setNewCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      const plan = plans.find((p) => p.id === cust.planId);
      if (plan) {
        setItems([
          {
            id: 'item-1',
            description: `${plan.name} (${plan.speedMbps} Mbps) - Monthly Service`,
            quantity: 1,
            unitPrice: plan.price,
            amount: plan.price,
          },
        ]);
      }
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        description: 'ONT Router Setup / Fiber Maintenance',
        quantity: 1,
        unitPrice: 25.0,
        amount: 25.0,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = Number(item.quantity) * Number(item.unitPrice);
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations for new invoice
  const subtotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const calculatedTax = (subtotal - discountAmount) * (taxRate / 100);
  const total = Math.max(0, subtotal - discountAmount + calculatedTax);

  const handleSaveNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustomerId);
    if (!cust) return;

    const nextInvoiceNum = `INV-${new Date().getFullYear()}-${String(invoices.length + 95).padStart(4, '0')}`;
    const newInv: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: nextInvoiceNum,
      customerId: cust.id,
      date: newIssueDate,
      dueDate: newDueDate,
      items: items,
      subtotal,
      discount: discountAmount,
      tax: calculatedTax,
      total,
      status: 'pending',
      notes: invoiceNotes,
    };

    onSaveInvoice(newInv);
    setIsCreateModalOpen(false);
  };

  // Payment record confirmation
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const updated: Invoice = {
      ...selectedInvoiceForPayment,
      status: 'paid',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentMethod,
      transactionRef: transactionRef || `TXN-${Math.floor(Math.random() * 899999 + 100000)}`,
    };

    onSaveInvoice(updated);
    setIsRecordPaymentModalOpen(false);
    setSelectedInvoiceForPayment(null);
  };

  // Direct WhatsApp reminder
  const handleSendWhatsAppBill = (inv: Invoice) => {
    const cust = customers.find((c) => c.id === inv.customerId);
    if (!cust) return;
    const template = Storage.getTemplates().find((t) => t.code === 'INVOICE_DELIVERY');
    if (!template) return;

    const message = compileWhatsAppMessage(template.content, cust, inv, undefined, company);
    const waUrl = buildWhatsAppUrl(cust.phone, message);

    Storage.addWaLog({
      customerId: cust.id,
      customerName: cust.name,
      phone: cust.phone,
      templateCode: 'INVOICE_DELIVERY',
      messageBody: message,
      status: 'redirected',
      mode: 'wa_me_redirect',
      invoiceNumber: inv.invoiceNumber,
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const cust = customers.find((c) => c.id === inv.customerId);
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust && cust.customerCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Billing &amp; Invoice Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate recurring monthly broadband charges, record receipts, and trigger A4 invoice printouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBatchGenerateInvoices}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Batch Monthly Billing</span>
          </button>

          <button
            onClick={() => {
              if (customers.length > 0) handleCustomerChange(customers[0].id);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice number, client name, account code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Invoice Statuses</option>
            <option value="paid">Paid &amp; Settled</option>
            <option value="pending">Pending Payment</option>
            <option value="overdue">Overdue Delinquent</option>
            <option value="cancelled">Cancelled / Void</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Items / Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const cust = customers.find((c) => c.id === inv.customerId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors group">
                      {/* Invoice # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                        {inv.invoiceNumber}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{cust?.name || 'Unknown Subscriber'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {cust?.customerCode} • {cust?.phone}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{inv.date}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={inv.status === 'overdue' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {inv.dueDate}
                        </span>
                      </td>

                      {/* Line items summary */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="truncate max-w-[200px]" title={inv.items.map((i) => i.description).join(', ')}>
                          {inv.items[0]?.description || 'Broadband Service'}
                          {inv.items.length > 1 && (
                            <span className="text-slate-500 text-[10px] ml-1">+{inv.items.length - 1} items</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-white text-sm">
                          {company.currencySymbol}
                          {inv.total.toFixed(2)}
                        </div>
                        {inv.tax > 0 && (
                          <div className="text-[10px] text-slate-500">
                            incl. {company.currencySymbol}
                            {inv.tax.toFixed(2)} tax
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : inv.status === 'overdue'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : inv.status === 'cancelled'
                              ? 'bg-slate-700 text-slate-400'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {inv.status === 'paid' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {inv.status === 'overdue' && <AlertTriangle className="w-2.5 h-2.5" />}
                          {inv.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                          {inv.status}
                        </span>
                        {inv.paidAt && (
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {inv.paidAt.substring(0, 10)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* A4 View & Print */}
                          <button
                            onClick={() => onSelectInvoiceForA4(inv)}
                            title="Open A4 Print Layout"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-cyan-400" />
                            <span>A4 View</span>
                          </button>

                          {/* WhatsApp dispatch */}
                          <button
                            onClick={() => handleSendWhatsAppBill(inv)}
                            title="Send invoice via WhatsApp (wa.me)"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-pointer transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Payment */}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoiceForPayment(inv);
                                setTransactionRef(`TXN-${Math.floor(Math.random() * 899999 + 100000)}`);
                                setIsRecordPaymentModalOpen(true);
                              }}
                              title="Record Payment & Issue Receipt"
                              className="px-2.5 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                              Pay
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            title="Delete Invoice"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordPaymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                Record Invoice Payment
              </h2>
              <button
                onClick={() => setIsRecordPaymentModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-300">
                  <span>Invoice:</span>
                  <span className="font-mono font-bold text-teal-400">
                    {selectedInvoiceForPayment.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 mt-1">
                  <span>Subscriber:</span>
                  <span className="font-semibold text-white">
                    {customers.find((c) => c.id === selectedInvoiceForPayment.customerId)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 mt-1">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-base font-extrabold text-white">
                    {company.currencySymbol}
                    {selectedInvoiceForPayment.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Card / Stripe">Online Card / Stripe Gateway</option>
                  <option value="Bank Transfer">Direct Bank Wire / SWIFT</option>
                  <option value="Cash">Cash at NOC Counter</option>
                  <option value="SSLCommerz">SSLCommerz Payment Gateway</option>
                  <option value="Mobile Money">Mobile Money (M-Pesa / bKash / JazzCash)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Transaction Reference / Receipt #</label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  placeholder="e.g. TXN-883901 or Wire Ref"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                Generate New Broadband Invoice
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Select Customer */}
                <div className="md:col-span-1">
                  <label className="block text-slate-300 font-medium mb-1">Subscriber Account *</label>
                  <select
                    value={newCustomerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.customerCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Billing Issue Date</label>
                  <input
                    type="date"
                    value={newIssueDate}
                    onChange={(e) => setNewIssueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider font-mono text-[10px]">
                    Itemized Charges Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-teal-400 hover:text-teal-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Charge Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 bg-slate-850 p-2.5 rounded-xl border border-slate-800 items-center"
                    >
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Description (e.g. Fiber 100 Mbps, Router Rental)"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Rate"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1 text-right font-mono font-bold text-white text-[11px]">
                        ${item.amount.toFixed(2)}
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount & Total Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-slate-400 w-28">Discount ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono w-24 text-right"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-slate-400 w-28">VAT / Tax (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono w-24 text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-right font-mono text-xs">
                  <div className="text-slate-400 flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-emerald-400 flex justify-between">
                      <span>Discount:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {calculatedTax > 0 && (
                    <div className="text-slate-400 flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span>+${calculatedTax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="text-base font-bold text-white pt-2 border-t border-slate-800 flex justify-between">
                    <span>Net Payable:</span>
                    <span className="text-cyan-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-600/20"
                >
                  Create &amp; Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
