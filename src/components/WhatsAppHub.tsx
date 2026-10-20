import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  ExternalLink,
  Settings,
  ListOrdered,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Smartphone,
  Shield,
  Key,
} from 'lucide-react';
import {
  WhatsAppTemplate,
  WhatsAppLog,
  Customer,
  Invoice,
  CompanySettings,
  WhatsAppConfig,
} from '../types';
import {
  buildWhatsAppUrl,
  compileWhatsAppMessage,
  Storage,
} from '../utils/storage';

interface WhatsAppHubProps {
  templates: WhatsAppTemplate[];
  logs: WhatsAppLog[];
  customers: Customer[];
  invoices: Invoice[];
  company: CompanySettings;
  config: WhatsAppConfig;
  onUpdateConfig: (cfg: WhatsAppConfig) => void;
  onUpdateTemplates: (tpls: WhatsAppTemplate[]) => void;
  onAddLog: (log: Omit<WhatsAppLog, 'id' | 'timestamp'>) => void;
  initialCustomer?: Customer | null;
  initialTemplateCode?: string;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  templates,
  logs,
  customers,
  invoices,
  company,
  config,
  onUpdateConfig,
  onUpdateTemplates,
  onAddLog,
  initialCustomer,
  initialTemplateCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dispatcher' | 'templates' | 'config' | 'logs'>('dispatcher');

  // Dispatcher state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomer?.id || customers[0]?.id || ''
  );
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>(
    initialTemplateCode || templates[0]?.code || 'PAYMENT_REMINDER'
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [apiSimulationSuccess, setApiSimulationSuccess] = useState<string | null>(null);

  // Selected entities
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const customerInvoices = invoices.filter((i) => i.customerId === currentCustomer?.id);
  const currentInvoice =
    invoices.find((i) => i.id === selectedInvoiceId) ||
    customerInvoices[0] ||
    invoices[0];

  const currentTemplate =
    templates.find((t) => t.code === selectedTemplateCode) || templates[0];

  // Compiled message
  const compiledMessage = currentCustomer && currentTemplate
    ? compileWhatsAppMessage(
        currentTemplate.content,
        currentCustomer,
        currentInvoice,
        undefined,
        company
      )
    : '';

  // Direct wa.me URL
  const waUrl = currentCustomer
    ? buildWhatsAppUrl(currentCustomer.phone, compiledMessage)
    : '';

  const handleOpenWhatsAppWeb = () => {
    if (!currentCustomer) return;

    onAddLog({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      phone: currentCustomer.phone,
      templateCode: currentTemplate.code,
      messageBody: compiledMessage,
      status: 'redirected',
      mode: 'wa_me_redirect',
      invoiceNumber: currentInvoice?.invoiceNumber,
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSimulateApiDispatch = () => {
    if (!currentCustomer) return;

    const mode = config.provider === 'meta_cloud' ? 'meta_cloud_api' : 'twilio_api';
    onAddLog({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      phone: currentCustomer.phone,
      templateCode: currentTemplate.code,
      messageBody: compiledMessage,
      status: 'sent',
      mode: mode,
      invoiceNumber: currentInvoice?.invoiceNumber,
    });

    setApiSimulationSuccess(`Successfully triggered API dispatch to ${currentCustomer.phone} via ${config.provider === 'meta_cloud' ? 'Meta Cloud API v19.0' : 'Twilio Programmable Messaging'}.`);
    setTimeout(() => setApiSimulationSuccess(null), 4000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(compiledMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            WhatsApp Notification &amp; Redirection Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated payment reminders, monthly bill delivery, service activation notices, and NOC routing.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab('dispatcher')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'dispatcher'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Redirection Console
          </button>
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'templates'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Template Manager
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'config'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'logs'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dispatch Logs ({logs.length})
          </button>
        </div>
      </div>

      {apiSimulationSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{apiSimulationSuccess}</span>
        </div>
      )}

      {/* SUB-TAB 1: LIVE DISPATCHER & REDIRECTION CONSOLE */}
      {activeSubTab === 'dispatcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Dispatch Parameters
            </h2>

            {/* Select Customer */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Subscriber *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const related = invoices.filter((i) => i.customerId === e.target.value);
                  if (related.length > 0) setSelectedInvoiceId(related[0].id);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerCode}) — {c.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Template */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Message Template *</label>
              <select
                value={selectedTemplateCode}
                onChange={(e) => setSelectedTemplateCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.code}>
                    [{t.category}] {t.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">{currentTemplate?.description}</p>
            </div>

            {/* Select Specific Invoice */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Attach Invoice Data (Variable substitution)
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                {customerInvoices.length > 0 ? (
                  customerInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {company.currencySymbol}{inv.total.toFixed(2)} ({inv.status})
                    </option>
                  ))
                ) : (
                  <option value="">No invoices found for this subscriber</option>
                )}
              </select>
            </div>

            {/* Delivery Channel Selector */}
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block font-mono">
                Active Integration Channel:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, provider: 'wa_me' })}
                  className={`p-2 rounded-lg text-left border flex flex-col transition-all ${
                    config.provider === 'wa_me'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span>wa.me Direct</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Browser Redirection</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, provider: 'meta_cloud' })}
                  className={`p-2 rounded-lg text-left border flex flex-col transition-all ${
                    config.provider === 'meta_cloud'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span>Meta Cloud API</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Official Cloud API</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* Primary: Direct wa.me redirection */}
              <button
                onClick={handleOpenWhatsAppWeb}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in WhatsApp (wa.me Redirection)</span>
              </button>

              {/* Secondary: Simulate API dispatch */}
              <button
                onClick={handleSimulateApiDispatch}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Send via {config.provider === 'meta_cloud' ? 'Meta Cloud API' : 'Twilio API'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: WhatsApp Mock Phone Preview (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Live WhatsApp Client View
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time variable evaluation for: <span className="text-white font-medium">{currentCustomer?.name}</span> ({currentCustomer?.phone})
                  </p>
                </div>

                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              {/* WhatsApp Chat Bubble Mockup */}
              <div className="bg-[#0b141a] rounded-2xl p-4 border border-slate-800 font-sans shadow-inner">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#202c33] mb-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    NP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#e9edef] flex items-center gap-1">
                      {company.companyName}
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-flex items-center justify-center text-[8px] text-white">✓</span>
                    </div>
                    <div className="text-[10px] text-[#8696a0]">Official Business Account</div>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[90%] bg-[#005c4b] text-[#e9edef] p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-2">
                    <div className="text-xs whitespace-pre-wrap leading-relaxed font-sans">
                      {compiledMessage}
                    </div>
                    <div className="flex justify-end items-center gap-1 text-[9px] text-[#8696a0]">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-cyan-400">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variable Cheat-Sheet */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono mb-2">
                Evaluated Template Variables:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTemplate?.variables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-teal-300 border border-slate-700"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TEMPLATE MANAGER */}
      {activeSubTab === 'templates' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Configured WhatsApp Notification Templates</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-approved templates for automated triggers and NOC operator dispatches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-400">{tpl.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tpl.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {tpl.content}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.slice(0, 3).map((v) => (
                      <span key={v} className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                        {v}
                      </span>
                    ))}
                    {tpl.variables.length > 3 && (
                      <span className="text-[10px] text-slate-500 font-mono">+{tpl.variables.length - 3}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTemplateCode(tpl.code);
                      setActiveSubTab('dispatcher');
                    }}
                    className="text-teal-400 hover:text-teal-300 font-semibold text-xs"
                  >
                    Test in Console →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: API CONFIGURATION (Official Meta & Twilio) */}
      {activeSubTab === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-400" />
              Official WhatsApp Gateway Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supports client-side <code className="text-teal-300">wa.me/</code> protocol for instant redirects, as well as official Meta Cloud API and Twilio credentials.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Provider radio */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">Primary Dispatch Engine</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, provider: 'wa_me' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.provider === 'wa_me'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">wa.me Redirection</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Instant, no API keys needed</div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, provider: 'meta_cloud' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.provider === 'meta_cloud'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">Meta Cloud API</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Official WhatsApp Business</div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateConfig({ ...config, provider: 'twilio' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.provider === 'twilio'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">Twilio WhatsApp</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Twilio Programmable SMS/WA</div>
                </button>
              </div>
            </div>

            {/* Meta Fields */}
            {config.provider === 'meta_cloud' && (
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Meta Cloud API Credentials (v19.0+)
                </h3>
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Phone Number ID</label>
                  <input
                    type="text"
                    value={config.phoneNumberId}
                    onChange={(e) => onUpdateConfig({ ...config, phoneNumberId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    placeholder="e.g. 109847120938401"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Permanent System User Access Token</label>
                  <input
                    type="password"
                    value={config.accessToken}
                    onChange={(e) => onUpdateConfig({ ...config, accessToken: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    placeholder="EAAG9..."
                  />
                </div>
              </div>
            )}

            {/* Twilio Fields */}
            {config.provider === 'twilio' && (
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Twilio WhatsApp API Credentials
                </h3>
                <div>
                  <label className="block text-slate-400 mb-1">Twilio Account SID</label>
                  <input
                    type="text"
                    value={config.twilioAccountSid}
                    onChange={(e) => onUpdateConfig({ ...config, twilioAccountSid: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    placeholder="AC..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Twilio Auth Token</label>
                  <input
                    type="password"
                    value={config.twilioAuthToken}
                    onChange={(e) => onUpdateConfig({ ...config, twilioAuthToken: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Sender and schedule settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ISP WhatsApp Sender Hotline</label>
                <input
                  type="text"
                  value={config.senderNumber}
                  onChange={(e) => onUpdateConfig({ ...config, senderNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Auto-Remind Days Prior to Due Date</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={config.autoRemindDaysBeforeDue}
                  onChange={(e) =>
                    onUpdateConfig({ ...config, autoRemindDaysBeforeDue: parseInt(e.target.value) || 3 })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setApiSimulationSuccess('WhatsApp Gateway configuration saved successfully.');
                  setTimeout(() => setApiSimulationSuccess(null), 3000);
                }}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-600/20"
              >
                Save Gateway Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DISPATCH LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">WhatsApp Dispatch Audit Log</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chronological history of redirects and automated reminders dispatched to subscribers.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Clear audit dispatch logs?')) {
                  Storage.saveWaLogs([]);
                  window.location.reload();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-400"
            >
              Clear Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Subscriber</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Message Excerpt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No WhatsApp messages logged yet. Use the Live Dispatcher to trigger one.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-white">{log.customerName}</td>
                      <td className="py-3 px-3 text-teal-400">{log.phone}</td>
                      <td className="py-3 px-3 text-cyan-300">{log.templateCode}</td>
                      <td className="py-3 px-3 text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                          {log.mode}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-400 truncate max-w-xs text-[11px]">
                        {log.messageBody}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
