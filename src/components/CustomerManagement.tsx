import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Server,
  Wifi,
  FileText,
  MessageSquare,
  Eye,
  X,
  CreditCard,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Customer, Plan, Invoice, CompanySettings, CustomerStatus } from '../types';
import { buildWhatsAppUrl, compileWhatsAppMessage, Storage } from '../utils/storage';

interface CustomerManagementProps {
  customers: Customer[];
  plans: Plan[];
  invoices: Invoice[];
  company: CompanySettings;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onOpenWhatsApp: (customer: Customer, templateCode?: string) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  plans,
  invoices,
  company,
  onSaveCustomer,
  onDeleteCustomer,
  onViewInvoice,
  onOpenWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);

  // Extract unique areas
  const areas = Array.from(new Set(customers.map((c) => c.area))).filter(Boolean);

  // Filter customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.pppoeUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;
    const matchesPlan = planFilter === 'all' || cust.planId === planFilter;
    const matchesArea = areaFilter === 'all' || cust.area === areaFilter;

    return matchesSearch && matchesStatus && matchesPlan && matchesArea;
  });

  const handleOpenAddModal = () => {
    const nextCodeNum = customers.length + 1050;
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      customerCode: `NP-${nextCodeNum}`,
      name: '',
      phone: '+1',
      email: '',
      address: '',
      area: areas[0] || 'North Sector A',
      pppoeUsername: '',
      ipAddress: `100.64.${Math.floor(Math.random() * 50) + 10}.${Math.floor(Math.random() * 200) + 10}`,
      macAddress: 'F4:8E:38:29:BA:' + Math.floor(Math.random() * 89 + 10).toString(16).toUpperCase(),
      planId: plans[0]?.id || 'plan-1',
      status: 'active',
      signupDate: new Date().toISOString().split('T')[0],
      billingDay: 1,
      balance: 0.0,
      notes: '',
    };
    setEditingCustomer(newCust);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer({ ...cust });
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!editingCustomer.name.trim()) {
      alert('Subscriber name is required.');
      return;
    }
    onSaveCustomer(editingCustomer);
    setIsEditModalOpen(false);
    if (selectedCustomerForDrawer && selectedCustomerForDrawer.id === editingCustomer.id) {
      setSelectedCustomerForDrawer(editingCustomer);
    }
  };

  // Quick toggle status
  const handleToggleStatus = (cust: Customer, nextStatus: CustomerStatus) => {
    const updated = { ...cust, status: nextStatus };
    onSaveCustomer(updated);
    if (selectedCustomerForDrawer?.id === cust.id) {
      setSelectedCustomerForDrawer(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Customer Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            Subscriber Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage FTTH, Wireless, and DIA broadband client accounts, network credentials, and billing profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subscriber</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, IP, PPPoE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Connection Statuses</option>
            <option value="active">Active Lines</option>
            <option value="suspended">Suspended Lines</option>
            <option value="terminated">Terminated Accounts</option>
          </select>
        </div>

        {/* Plan Filter */}
        <div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Service Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.speedMbps} Mbps)
              </option>
            ))}
          </select>
        </div>

        {/* Area Filter */}
        <div>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All OLT / POP Sectors</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                Sector: {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Code / Subscriber</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Bandwidth Plan</th>
                <th className="py-3 px-4">Network Credentials</th>
                <th className="py-3 px-4">Zone / Area</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No subscribers found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const plan = plans.find((p) => p.id === cust.planId);
                  const custInvoices = invoices.filter((i) => i.customerId === cust.id);
                  const hasOverdue = custInvoices.some((i) => i.status === 'overdue');

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomerForDrawer(cust)}
                    >
                      {/* Code / Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                          {cust.name}
                          {hasOverdue && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Overdue balance pending" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-teal-400 mt-0.5">{cust.customerCode}</div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{cust.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5 truncate max-w-[160px]">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{cust.email}</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{plan?.name || 'Standard Tier'}</div>
                        <div className="text-[10px] text-teal-400 font-mono">
                          {plan?.speedMbps} Mbps • {company.currencySymbol}
                          {plan?.price.toFixed(2)}/mo
                        </div>
                      </td>

                      {/* Network Credentials */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-slate-300">
                          <span className="text-slate-500">IP:</span> {cust.ipAddress}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          <span className="text-slate-500">PPPoE:</span> {cust.pppoeUsername}
                        </div>
                      </td>

                      {/* Area */}
                      <td className="py-3 px-4 text-slate-300 text-xs">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{cust.area}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{cust.address}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            cust.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : cust.status === 'suspended'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {cust.status === 'active' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {cust.status === 'suspended' && <AlertCircle className="w-2.5 h-2.5" />}
                          {cust.status === 'terminated' && <XCircle className="w-2.5 h-2.5" />}
                          {cust.status}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-4 font-mono">
                        <div
                          className={`font-bold ${
                            cust.balance > 0 ? 'text-rose-400' : 'text-slate-300'
                          }`}
                        >
                          {company.currencySymbol}
                          {cust.balance.toFixed(2)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Redirection */}
                          <button
                            onClick={() => onOpenWhatsApp(cust)}
                            title="Direct WhatsApp Message"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => handleOpenEditModal(cust)}
                            title="Edit Subscriber"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-cyan-400" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete subscriber ${cust.name} (${cust.customerCode})?`)) {
                                onDeleteCustomer(cust.id);
                              }
                            }}
                            title="Delete Subscriber"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
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

      {/* Customer Profile Side Drawer */}
      {selectedCustomerForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                    {selectedCustomerForDrawer.customerCode}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      selectedCustomerForDrawer.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : selectedCustomerForDrawer.status === 'suspended'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {selectedCustomerForDrawer.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{selectedCustomerForDrawer.name}</h2>
              </div>
              <button
                onClick={() => setSelectedCustomerForDrawer(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Change Bar */}
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Quick Connection Status:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleStatus(selectedCustomerForDrawer, 'active')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    selectedCustomerForDrawer.status === 'active'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedCustomerForDrawer, 'suspended')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    selectedCustomerForDrawer.status === 'suspended'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedCustomerForDrawer, 'terminated')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    selectedCustomerForDrawer.status === 'terminated'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Terminate
                </button>
              </div>
            </div>

            {/* Quick WhatsApp Notification Launchers */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                WhatsApp Dispatch Triggers
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenWhatsApp(selectedCustomerForDrawer, 'PAYMENT_REMINDER')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Send Bill Reminder</span>
                </button>
                <button
                  onClick={() => onOpenWhatsApp(selectedCustomerForDrawer, 'SERVICE_ACTIVATION')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-600/15 hover:bg-teal-600/25 border border-teal-500/30 text-teal-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4 text-teal-400" />
                  <span>Activation Notice</span>
                </button>
                <button
                  onClick={() => onOpenWhatsApp(selectedCustomerForDrawer, 'SERVICE_SUSPENSION')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Suspension Warning</span>
                </button>
                <button
                  onClick={() => onOpenWhatsApp(selectedCustomerForDrawer, 'SUPPORT_ROUTING')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/30 text-cyan-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>NOC Support Desk</span>
                </button>
              </div>
            </div>

            {/* Network & Physical Information */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Technical Network Specs
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">PPPoE Username:</span>
                  <div className="font-mono text-white mt-0.5">{selectedCustomerForDrawer.pppoeUsername}</div>
                </div>
                <div>
                  <span className="text-slate-500">Assigned IPv4:</span>
                  <div className="font-mono text-cyan-400 mt-0.5">{selectedCustomerForDrawer.ipAddress}</div>
                </div>
                <div>
                  <span className="text-slate-500">MAC / ONT Serial:</span>
                  <div className="font-mono text-slate-300 mt-0.5">{selectedCustomerForDrawer.macAddress}</div>
                </div>
                <div>
                  <span className="text-slate-500">Service Plan:</span>
                  <div className="font-medium text-teal-400 mt-0.5">
                    {plans.find((p) => p.id === selectedCustomerForDrawer.planId)?.name}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Billing Due Day:</span>
                  <div className="font-mono text-white mt-0.5">Day {selectedCustomerForDrawer.billingDay} of month</div>
                </div>
                <div>
                  <span className="text-slate-500">Member Since:</span>
                  <div className="font-mono text-white mt-0.5">{selectedCustomerForDrawer.signupDate}</div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-2 text-xs">
                <span className="text-slate-500">Service Address &amp; Sector:</span>
                <div className="text-slate-300 mt-0.5">
                  {selectedCustomerForDrawer.address} — ({selectedCustomerForDrawer.area})
                </div>
              </div>
            </div>

            {/* Invoices History for this customer */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                Invoices for this Subscriber
              </h3>
              <div className="space-y-2">
                {invoices
                  .filter((i) => i.customerId === selectedCustomerForDrawer.id)
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-medium text-teal-400">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          Date: {inv.date} • Due: {inv.dueDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono font-bold text-white">
                            {company.currencySymbol}
                            {inv.total.toFixed(2)}
                          </div>
                          <span
                            className={`text-[9px] uppercase font-bold ${
                              inv.status === 'paid'
                                ? 'text-emerald-400'
                                : inv.status === 'overdue'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium border border-slate-700 cursor-pointer"
                        >
                          View A4
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom Edit Action */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEditModal(selectedCustomerForDrawer)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Edit Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                {editingCustomer.name ? 'Edit Subscriber Profile' : 'Register New Subscriber'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subscriber Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Marcus Vance"
                  />
                </div>

                {/* Customer Code */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer Account Code *</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.customerCode}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, customerCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    placeholder="e.g. NP-1049"
                  />
                </div>

                {/* Phone (WhatsApp Format) */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp Phone Number (E.164) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    placeholder="e.g. +14155550182 or 14155550182"
                  />
                  <span className="text-[10px] text-slate-500">Include country code for instant wa.me redirection</span>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="marcus@example.com"
                  />
                </div>

                {/* Service Plan */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Broadband Plan *</label>
                  <select
                    value={editingCustomer.planId}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, planId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.speedMbps} Mbps) — {company.currencySymbol}
                        {p.price.toFixed(2)}/mo
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Connection Status</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, status: e.target.value as CustomerStatus })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="active">Active (Normal Service)</option>
                    <option value="suspended">Suspended (Bandwidth Blocked)</option>
                    <option value="terminated">Terminated (Account Closed)</option>
                  </select>
                </div>

                {/* PPPoE Username */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PPPoE / Radius Username</label>
                  <input
                    type="text"
                    value={editingCustomer.pppoeUsername}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, pppoeUsername: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    placeholder="e.g. mvance_ftth"
                  />
                </div>

                {/* Static or Pool IP Address */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned IPv4 Address</label>
                  <input
                    type="text"
                    value={editingCustomer.ipAddress}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, ipAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    placeholder="100.64.12.84"
                  />
                </div>

                {/* MAC Address / ONU SN */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ONT MAC / Serial Number</label>
                  <input
                    type="text"
                    value={editingCustomer.macAddress}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, macAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    placeholder="F4:8E:38:29:BA:01"
                  />
                </div>

                {/* Area / Zone */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">POP / Zone / Area</label>
                  <input
                    type="text"
                    value={editingCustomer.area}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, area: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g. North Sector A"
                  />
                </div>

                {/* Physical Street Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Installation Street Address</label>
                  <input
                    type="text"
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    placeholder="742 Evergreen Terrace, North Heights"
                  />
                </div>

                {/* Signup Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Signup Date</label>
                  <input
                    type="date"
                    value={editingCustomer.signupDate}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, signupDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Billing Day */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Billing Due Day of Month</label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={editingCustomer.billingDay}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, billingDay: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Internal NOC / Technician Notes</label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Signal level -19 dBm, dual-band mesh AP deployed."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20"
                >
                  Save Subscriber Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
