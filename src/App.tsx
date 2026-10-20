import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CustomerManagement } from './components/CustomerManagement';
import { InvoiceManagement } from './components/InvoiceManagement';
import { A4InvoiceView } from './components/A4InvoiceView';
import { WhatsAppHub } from './components/WhatsAppHub';
import { PlansCatalog } from './components/PlansCatalog';
import { CustomerPortalView } from './components/CustomerPortalView';
import { SystemDocumentation } from './components/SystemDocumentation';
import {
  Customer,
  Invoice,
  Plan,
  WhatsAppTemplate,
  WhatsAppLog,
  CompanySettings,
  WhatsAppConfig,
  UserRole,
} from './types';
import { Storage } from './utils/storage';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Core system data
  const [customers, setCustomers] = useState<Customer[]>(() => Storage.getCustomers());
  const [invoices, setInvoices] = useState<Invoice[]>(() => Storage.getInvoices());
  const [plans, setPlans] = useState<Plan[]>(() => Storage.getPlans());
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => Storage.getTemplates());
  const [company, setCompany] = useState<CompanySettings>(() => Storage.getCompany());
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(() => Storage.getWaConfig());
  const [waLogs, setWaLogs] = useState<WhatsAppLog[]>(() => Storage.getWaLogs());

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [role, setRole] = useState<UserRole>('admin');
  const [selectedInvoiceForA4, setSelectedInvoiceForA4] = useState<string>(invoices[0]?.id || '');
  const [whatsAppCustomerTarget, setWhatsAppCustomerTarget] = useState<Customer | null>(null);
  const [whatsAppTemplateCodeTarget, setWhatsAppTemplateCodeTarget] = useState<string>('PAYMENT_REMINDER');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to Storage whenever states update
  useEffect(() => {
    Storage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    Storage.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    Storage.savePlans(plans);
  }, [plans]);

  useEffect(() => {
    Storage.saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    Storage.saveCompany(company);
  }, [company]);

  useEffect(() => {
    Storage.saveWaConfig(waConfig);
  }, [waConfig]);

  // Recalculate customer balances based on unpaid invoices
  const recalculateBalances = (currentCusts: Customer[], currentInvs: Invoice[]) => {
    return currentCusts.map((cust) => {
      const unpaidTotal = currentInvs
        .filter((inv) => inv.customerId === cust.id && inv.status !== 'paid' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + inv.total, 0);
      return { ...cust, balance: unpaidTotal };
    });
  };

  // Customer handlers
  const handleSaveCustomer = (customer: Customer) => {
    const exists = customers.some((c) => c.id === customer.id);
    let updatedList: Customer[];
    if (exists) {
      updatedList = customers.map((c) => (c.id === customer.id ? customer : c));
      showToast(`Subscriber "${customer.name}" profile updated.`);
    } else {
      updatedList = [customer, ...customers];
      showToast(`New subscriber "${customer.name}" (${customer.customerCode}) registered.`);
    }
    setCustomers(updatedList);
  };

  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    showToast(`Subscriber "${cust?.name || id}" removed.`);
  };

  // Invoice handlers
  const handleSaveInvoice = (invoice: Invoice) => {
    const exists = invoices.some((i) => i.id === invoice.id);
    let updatedInvoices: Invoice[];
    if (exists) {
      updatedInvoices = invoices.map((i) => (i.id === invoice.id ? invoice : i));
      showToast(`Invoice #${invoice.invoiceNumber} updated.`);
    } else {
      updatedInvoices = [invoice, ...invoices];
      showToast(`Invoice #${invoice.invoiceNumber} generated.`);
    }
    setInvoices(updatedInvoices);

    // Update balances
    const updatedCustomers = recalculateBalances(customers, updatedInvoices);
    setCustomers(updatedCustomers);
  };

  const handleDeleteInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    const updatedCustomers = recalculateBalances(customers, updated);
    setCustomers(updatedCustomers);
    showToast(`Invoice #${inv?.invoiceNumber || id} deleted.`);
  };

  // Batch Monthly Billing Generator
  const handleBatchGenerateInvoices = () => {
    const activeSubscribers = customers.filter((c) => c.status === 'active');
    const today = new Date().toISOString().split('T')[0];
    const currentYearMonth = today.substring(0, 7); // e.g. "2026-10"

    const newInvoices: Invoice[] = [];
    let count = 0;

    activeSubscribers.forEach((cust, index) => {
      // Check if invoice already exists for this customer in this month
      const alreadyBilled = invoices.some(
        (i) => i.customerId === cust.id && i.date.startsWith(currentYearMonth)
      );

      if (!alreadyBilled) {
        const plan = plans.find((p) => p.id === cust.planId) || plans[0];
        const nextInvNum = `INV-${new Date().getFullYear()}-${String(invoices.length + count + 101).padStart(4, '0')}`;

        const due = new Date();
        due.setDate(due.getDate() + 10);

        newInvoices.push({
          id: 'inv-' + Date.now() + '-' + index,
          invoiceNumber: nextInvNum,
          customerId: cust.id,
          date: today,
          dueDate: due.toISOString().split('T')[0],
          items: [
            {
              id: 'item-' + Date.now() + '-' + index,
              description: `${plan.name} (${plan.speedMbps} Mbps) - Recurring Monthly Subscription`,
              quantity: 1,
              unitPrice: plan.price,
              amount: plan.price,
            },
          ],
          subtotal: plan.price,
          discount: 0,
          tax: 0,
          total: plan.price,
          status: 'pending',
          notes: 'Auto-generated via Monthly Batch Billing Runner.',
        });
        count++;
      }
    });

    if (count === 0) {
      alert('All active subscribers already have an invoice generated for the current billing cycle.');
      return;
    }

    const merged = [...newInvoices, ...invoices];
    setInvoices(merged);
    const updatedCustomers = recalculateBalances(customers, merged);
    setCustomers(updatedCustomers);
    showToast(`Generated ${count} monthly invoices in batch successfully!`);
    setActiveTab('invoices');
  };

  // Pay invoice via Customer Portal
  const handlePortalPayInvoice = (inv: Invoice, method: string) => {
    const updatedInv: Invoice = {
      ...inv,
      status: 'paid',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentMethod: method as any,
      transactionRef: `PORTAL-TXN-${Math.floor(Math.random() * 899999 + 100000)}`,
    };

    const updatedInvoices = invoices.map((i) => (i.id === inv.id ? updatedInv : i));
    setInvoices(updatedInvoices);
    const updatedCustomers = recalculateBalances(customers, updatedInvoices);
    setCustomers(updatedCustomers);
    showToast(`Payment of $${inv.total.toFixed(2)} received via ${method}. Receipt generated.`);
  };

  // WhatsApp launcher navigation
  const handleOpenWhatsAppFromCustomer = (cust: Customer, templateCode?: string) => {
    setWhatsAppCustomerTarget(cust);
    if (templateCode) setWhatsAppTemplateCodeTarget(templateCode);
    setActiveTab('whatsapp');
  };

  // Select invoice for A4 Studio
  const handleSelectInvoiceForA4 = (inv: Invoice) => {
    setSelectedInvoiceForA4(inv.id);
    setActiveTab('a4-invoice');
  };

  // Reset to initial sample data
  const handleResetData = () => {
    Storage.resetAll();
    setCustomers(Storage.getCustomers());
    setInvoices(Storage.getInvoices());
    setPlans(Storage.getPlans());
    setTemplates(Storage.getTemplates());
    setCompany(Storage.getCompany());
    setWaConfig(Storage.getWaConfig());
    setWaLogs(Storage.getWaLogs());
    showToast('System data reset back to default ISP sample records.');
  };

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue').length;
  const activeSubscribersCount = customers.filter((c) => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={(newRole) => {
          setRole(newRole);
          if (newRole === 'customer') {
            setActiveTab('portal');
          } else if (activeTab === 'portal') {
            setActiveTab('dashboard');
          }
        }}
        overdueCount={overdueInvoicesCount}
        activeSubscribers={activeSubscribersCount}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 border border-teal-500/40 text-teal-300 shadow-2xl animate-fade-in text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            customers={customers}
            invoices={invoices}
            plans={plans}
            company={company}
            setActiveTab={setActiveTab}
            onSelectCustomer={(c) => handleOpenWhatsAppFromCustomer(c)}
            onSelectInvoice={(inv) => handleSelectInvoiceForA4(inv)}
            onBatchGenerateInvoices={handleBatchGenerateInvoices}
          />
        )}

        {/* Tab 2: Customers */}
        {activeTab === 'customers' && (
          <CustomerManagement
            customers={customers}
            plans={plans}
            invoices={invoices}
            company={company}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onViewInvoice={(inv) => handleSelectInvoiceForA4(inv)}
            onOpenWhatsApp={handleOpenWhatsAppFromCustomer}
          />
        )}

        {/* Tab 3: Invoices */}
        {activeTab === 'invoices' && (
          <InvoiceManagement
            invoices={invoices}
            customers={customers}
            plans={plans}
            company={company}
            onSaveInvoice={handleSaveInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onSelectInvoiceForA4={handleSelectInvoiceForA4}
            onBatchGenerateInvoices={handleBatchGenerateInvoices}
          />
        )}

        {/* Tab 4: A4 Invoice Studio */}
        {activeTab === 'a4-invoice' && (
          <A4InvoiceView
            invoices={invoices}
            customers={customers}
            plans={plans}
            company={company}
            selectedInvoiceId={selectedInvoiceForA4}
            onSelectInvoice={(id) => setSelectedInvoiceForA4(id)}
            onBackToInvoices={() => setActiveTab('invoices')}
          />
        )}

        {/* Tab 5: WhatsApp Hub */}
        {activeTab === 'whatsapp' && (
          <WhatsAppHub
            templates={templates}
            logs={waLogs}
            customers={customers}
            invoices={invoices}
            company={company}
            config={waConfig}
            onUpdateConfig={setWaConfig}
            onUpdateTemplates={setTemplates}
            onAddLog={(newLog) => {
              const updated = Storage.addWaLog(newLog);
              setWaLogs(updated);
            }}
            initialCustomer={whatsAppCustomerTarget}
            initialTemplateCode={whatsAppTemplateCodeTarget}
          />
        )}

        {/* Tab 6: Plans */}
        {activeTab === 'plans' && (
          <PlansCatalog
            plans={plans}
            customers={customers}
            company={company}
            onSavePlan={(p) => {
              const exists = plans.some((x) => x.id === p.id);
              if (exists) {
                setPlans(plans.map((x) => (x.id === p.id ? p : x)));
                showToast(`Plan "${p.name}" updated.`);
              } else {
                setPlans([...plans, p]);
                showToast(`New plan "${p.name}" added.`);
              }
            }}
            onDeletePlan={(id) => {
              setPlans(plans.filter((p) => p.id !== id));
              showToast('Plan deleted.');
            }}
          />
        )}

        {/* Tab 7: Customer Self-Service Portal */}
        {activeTab === 'portal' && (
          <CustomerPortalView
            customers={customers}
            invoices={invoices}
            plans={plans}
            company={company}
            onPayInvoice={handlePortalPayInvoice}
            onViewA4={handleSelectInvoiceForA4}
          />
        )}

        {/* Tab 8: System Documentation & Specs */}
        {activeTab === 'docs' && <SystemDocumentation />}
      </main>
    </div>
  );
}
