import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  FileText,
  Building,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { Invoice, Customer, Plan, CompanySettings } from '../types';
import { QRCodeView } from './QRCodeView';
import { buildWhatsAppUrl, compileWhatsAppMessage, Storage } from '../utils/storage';

interface A4InvoiceViewProps {
  invoices: Invoice[];
  customers: Customer[];
  plans: Plan[];
  company: CompanySettings;
  selectedInvoiceId?: string;
  onSelectInvoice: (id: string) => void;
  onBackToInvoices?: () => void;
}

export const A4InvoiceView: React.FC<A4InvoiceViewProps> = ({
  invoices,
  customers,
  plans,
  company,
  selectedInvoiceId,
  onSelectInvoice,
  onBackToInvoices,
}) => {
  const activeInvoice =
    invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];

  const activeCustomer = customers.find(
    (c) => c.id === activeInvoice?.customerId
  );
  const activePlan = plans.find((p) => p.id === activeCustomer?.planId);

  // Trigger print dialog (uses @media print stylesheet defined in index.css)
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp quick trigger
  const handleSendViaWhatsApp = () => {
    if (!activeInvoice || !activeCustomer) return;
    const template = Storage.getTemplates().find((t) => t.code === 'INVOICE_DELIVERY');
    if (!template) return;

    const message = compileWhatsAppMessage(
      template.content,
      activeCustomer,
      activeInvoice,
      activePlan,
      company
    );
    const waUrl = buildWhatsAppUrl(activeCustomer.phone, message);

    Storage.addWaLog({
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      phone: activeCustomer.phone,
      templateCode: 'INVOICE_DELIVERY',
      messageBody: message,
      status: 'redirected',
      mode: 'wa_me_redirect',
      invoiceNumber: activeInvoice.invoiceNumber,
    });

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  if (!activeInvoice || !activeCustomer) {
    return (
      <div className="p-12 text-center text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p>No invoices available to render in A4 view.</p>
      </div>
    );
  }

  // Construct QR payment URL payload
  const qrPayload = `https://pay.netpulse.net/pay?inv=${encodeURIComponent(
    activeInvoice.invoiceNumber
  )}&amt=${activeInvoice.total.toFixed(2)}&due=${activeInvoice.dueDate}`;

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden when printing via .no-print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          {onBackToInvoices && (
            <button
              onClick={onBackToInvoices}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                A4 ISO Print &amp; PDF Studio
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                210mm × 297mm Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pixel-perfect tax invoice template with company branding, dynamic QR code, and page-break isolation.
            </p>
          </div>
        </div>

        {/* Invoice Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeInvoice.id}
            onChange={(e) => onSelectInvoice(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
          >
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {customers.find((c) => c.id === inv.customerId)?.name} ({company.currencySymbol}{inv.total.toFixed(2)})
              </option>
            ))}
          </select>

          <button
            onClick={handleSendViaWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Send WhatsApp Bill</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Canvas Container */}
      <div className="flex justify-center overflow-x-auto py-2">
        {/* Exact ISO 210mm x 297mm ratio paper simulation */}
        <div
          id="a4-invoice-container"
          className="a4-print-sheet bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 p-8 sm:p-12 transition-all relative"
          style={{
            width: '100%',
            maxWidth: '210mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
          }}
        >
          {/* Status Watermark / Stamp */}
          <div className="absolute right-12 top-28 pointer-events-none select-none opacity-80 rotate-[-12deg]">
            {activeInvoice.status === 'paid' && (
              <div className="border-4 border-emerald-600 px-4 py-1.5 rounded-lg text-emerald-700 font-black text-2xl tracking-widest uppercase font-mono bg-emerald-50/80 shadow-sm">
                PAID &amp; SETTLED
              </div>
            )}
            {activeInvoice.status === 'overdue' && (
              <div className="border-4 border-rose-600 px-4 py-1.5 rounded-lg text-rose-700 font-black text-2xl tracking-widest uppercase font-mono bg-rose-50/80 shadow-sm">
                OVERDUE
              </div>
            )}
            {activeInvoice.status === 'pending' && (
              <div className="border-3 border-amber-600 px-3 py-1 rounded text-amber-700 font-bold text-sm tracking-widest uppercase font-mono bg-amber-50/80">
                PAYMENT PENDING
              </div>
            )}
          </div>

          {/* Header: Company Info + Invoice Title */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xl tracking-tighter">
                    NP
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                      {company.companyName}
                    </h1>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {company.brandTagline}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 mt-3 space-y-0.5 leading-relaxed font-sans">
                  <div>{company.address}</div>
                  <div>
                    <span className="font-semibold text-slate-800">Phone:</span> {company.phone} •{' '}
                    <span className="font-semibold text-slate-800">Email:</span> {company.email}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Tax EIN/VAT:</span> {company.taxId} •{' '}
                    <span className="font-semibold text-slate-800">ISP License:</span> {company.licenseNo}
                  </div>
                </div>
              </div>

              {/* Invoice Meta Heading */}
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  TAX INVOICE
                </span>
                <div className="mt-2 text-xs font-mono space-y-1">
                  <div>
                    <span className="text-slate-500">Invoice #: </span>
                    <span className="font-bold text-slate-900">{activeInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Date Issued: </span>
                    <span className="font-semibold text-slate-900">{activeInvoice.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Due: </span>
                    <span className="font-bold text-rose-700">{activeInvoice.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill-To & Network Service Details Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
            {/* Bill To */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Bill To / Subscriber
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">{activeCustomer.name}</div>
              <div className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                <div>{activeCustomer.address}</div>
                <div>Sector/Zone: {activeCustomer.area}</div>
                <div>Phone: {activeCustomer.phone}</div>
                <div>Email: {activeCustomer.email}</div>
              </div>
            </div>

            {/* Service & Technical Node Specs */}
            <div className="border-l border-slate-200 pl-4 font-mono text-[11px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Subscription Parameters
              </span>
              <div className="mt-1 space-y-0.5 text-slate-700">
                <div>
                  <span className="text-slate-500">Account Code:</span>{' '}
                  <span className="font-bold text-slate-900">{activeCustomer.customerCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">Plan:</span>{' '}
                  <span className="font-bold text-slate-900">{activePlan?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Bandwidth:</span> {activePlan?.speedMbps} Mbps Symmetric
                </div>
                <div>
                  <span className="text-slate-500">PPPoE ID:</span> {activeCustomer.pppoeUsername}
                </div>
                <div>
                  <span className="text-slate-500">Assigned IP:</span> {activeCustomer.ipAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">Description &amp; Service Cycle</th>
                  <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-24 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {activeInvoice.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-3 font-medium">
                      <div>{item.description}</div>
                      <div className="text-[10px] text-slate-500">
                        High-availability fiber transmission &amp; NOC routing
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {company.currencySymbol}
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {company.currencySymbol}
                      {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & QR Code Payment Row */}
          <div className="grid grid-cols-12 gap-4 border-t-2 border-slate-800 pt-4 mb-6">
            {/* Left Col: Instant Scan to Pay QR Code */}
            <div className="col-span-7 flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <QRCodeView value={qrPayload} size={84} label="SCAN TO PAY" />
              <div className="text-[11px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-teal-700" />
                  Instant Online Payment QR
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Scan with your mobile camera or banking app to settle instantly via Stripe, SSLCommerz, or Card.
                </p>
                <div className="text-[9px] font-mono text-slate-400 truncate max-w-[210px]">
                  Ref: {activeInvoice.invoiceNumber}
                </div>
              </div>
            </div>

            {/* Right Col: Amount Breakdown */}
            <div className="col-span-5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>
                  {company.currencySymbol}
                  {activeInvoice.subtotal.toFixed(2)}
                </span>
              </div>

              {activeInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Loyalty Discount:</span>
                  <span>
                    -{company.currencySymbol}
                    {activeInvoice.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {activeInvoice.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT / Telecom Tax:</span>
                  <span>
                    +{company.currencySymbol}
                    {activeInvoice.tax.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-slate-800 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Due:</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {company.currencySymbol}
                  {activeInvoice.total.toFixed(2)}
                </span>
              </div>

              {activeInvoice.paidAt && (
                <div className="pt-1 text-[10px] text-emerald-700 font-medium">
                  Paid on: {activeInvoice.paidAt} ({activeInvoice.paymentMethod})
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions & Bank Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Direct Bank Settlement Instructions
            </span>
            <div className="grid grid-cols-2 gap-4 mt-2 font-mono text-[11px] text-slate-700">
              <div>
                <div>
                  <span className="text-slate-500">Bank:</span> {company.bankName}
                </div>
                <div>
                  <span className="text-slate-500">Beneficiary:</span> {company.accountName}
                </div>
              </div>
              <div>
                <div>
                  <span className="text-slate-500">Account #:</span> {company.accountNumber}
                </div>
                <div>
                  <span className="text-slate-500">SWIFT / Routing:</span> {company.ibanOrSwift} (Include ref #{activeInvoice.invoiceNumber})
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider block">
              Terms &amp; Service SLA:
            </span>
            <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
              {company.termsAndConditions.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>

          {/* Signatures Footer */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] font-mono">Authorized ISP Signatory &amp; Stamp</span>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1 ml-auto"></div>
              <span className="text-[10px] font-mono">Customer Acknowledgment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
