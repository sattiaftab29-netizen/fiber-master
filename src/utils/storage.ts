import {
  Customer,
  Invoice,
  Plan,
  WhatsAppTemplate,
  WhatsAppLog,
  CompanySettings,
  WhatsAppConfig,
} from '../types';
import {
  initialCustomers,
  initialInvoices,
  initialPlans,
  initialWhatsAppTemplates,
  initialCompanySettings,
  initialWhatsAppConfig,
  initialWhatsAppLogs,
} from '../data/mockData';

const KEYS = {
  CUSTOMERS: 'netpulse_customers_v1',
  INVOICES: 'netpulse_invoices_v1',
  PLANS: 'netpulse_plans_v1',
  TEMPLATES: 'netpulse_wa_templates_v1',
  COMPANY: 'netpulse_company_v1',
  WA_CONFIG: 'netpulse_wa_config_v1',
  WA_LOGS: 'netpulse_wa_logs_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Failed reading localStorage key: ${key}`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed writing localStorage key: ${key}`, e);
  }
}

export const Storage = {
  getCustomers: (): Customer[] => safeGet(KEYS.CUSTOMERS, initialCustomers),
  saveCustomers: (data: Customer[]) => safeSet(KEYS.CUSTOMERS, data),

  getInvoices: (): Invoice[] => safeGet(KEYS.INVOICES, initialInvoices),
  saveInvoices: (data: Invoice[]) => safeSet(KEYS.INVOICES, data),

  getPlans: (): Plan[] => safeGet(KEYS.PLANS, initialPlans),
  savePlans: (data: Plan[]) => safeSet(KEYS.PLANS, data),

  getTemplates: (): WhatsAppTemplate[] => safeGet(KEYS.TEMPLATES, initialWhatsAppTemplates),
  saveTemplates: (data: WhatsAppTemplate[]) => safeSet(KEYS.TEMPLATES, data),

  getCompany: (): CompanySettings => safeGet(KEYS.COMPANY, initialCompanySettings),
  saveCompany: (data: CompanySettings) => safeSet(KEYS.COMPANY, data),

  getWaConfig: (): WhatsAppConfig => safeGet(KEYS.WA_CONFIG, initialWhatsAppConfig),
  saveWaConfig: (data: WhatsAppConfig) => safeSet(KEYS.WA_CONFIG, data),

  getWaLogs: (): WhatsAppLog[] => safeGet(KEYS.WA_LOGS, initialWhatsAppLogs),
  saveWaLogs: (data: WhatsAppLog[]) => safeSet(KEYS.WA_LOGS, data),

  addWaLog: (log: Omit<WhatsAppLog, 'id' | 'timestamp'>) => {
    const logs = Storage.getWaLogs();
    const newLog: WhatsAppLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const updated = [newLog, ...logs].slice(0, 100);
    Storage.saveWaLogs(updated);
    return updated;
  },

  resetAll: () => {
    safeSet(KEYS.CUSTOMERS, initialCustomers);
    safeSet(KEYS.INVOICES, initialInvoices);
    safeSet(KEYS.PLANS, initialPlans);
    safeSet(KEYS.TEMPLATES, initialWhatsAppTemplates);
    safeSet(KEYS.COMPANY, initialCompanySettings);
    safeSet(KEYS.WA_CONFIG, initialWhatsAppConfig);
    safeSet(KEYS.WA_LOGS, initialWhatsAppLogs);
  },
};

// WhatsApp template variable replacement helper
export function compileWhatsAppMessage(
  templateContent: string,
  customer: Customer,
  invoice?: Invoice,
  plan?: Plan,
  company?: CompanySettings
): string {
  const currentCompany = company || Storage.getCompany();
  const customerPlan = plan || Storage.getPlans().find((p) => p.id === customer.planId);
  const paymentLink = invoice
    ? `https://pay.netpulse.net/pay?inv=${invoice.invoiceNumber}&amt=${invoice.total.toFixed(2)}`
    : `https://pay.netpulse.net/account/${customer.customerCode}`;

  let text = templateContent;
  const replacements: Record<string, string> = {
    customer_name: customer.name,
    customer_code: customer.customerCode,
    phone: customer.phone,
    address: customer.address,
    area: customer.area,
    pppoe_username: customer.pppoeUsername,
    ip_address: customer.ipAddress,
    plan_name: customerPlan ? customerPlan.name : 'Broadband Tier',
    speed_mbps: customerPlan ? `${customerPlan.speedMbps}` : '100',
    invoice_number: invoice ? invoice.invoiceNumber : 'N/A',
    amount: invoice ? invoice.total.toFixed(2) : customer.balance.toFixed(2),
    due_date: invoice ? invoice.dueDate : 'Immediate',
    currency_symbol: currentCompany.currencySymbol,
    payment_link: paymentLink,
    support_phone: currentCompany.phone,
    company_name: currentCompany.companyName,
  };

  Object.entries(replacements).forEach(([key, val]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    text = text.replace(regex, val);
  });

  return text;
}

// Generate wa.me link with URL-encoded message
export function buildWhatsAppUrl(phoneNumber: string, messageText: string): string {
  // Strip non-digits except +
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  // Default to E.164 without plus sign for wa.me
  if (!cleanNumber.startsWith('1') && cleanNumber.length === 10) {
    cleanNumber = '1' + cleanNumber; // North American fallback
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
}
