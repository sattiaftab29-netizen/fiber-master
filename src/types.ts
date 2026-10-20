export type CustomerStatus = 'active' | 'suspended' | 'terminated';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type PlanType = 'Fiber FTTH' | 'Wireless' | 'Dedicated DIA';
export type UserRole = 'admin' | 'staff' | 'customer';

export interface Plan {
  id: string;
  name: string;
  speedMbps: number;
  price: number;
  type: PlanType;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  description: string;
  contentionRatio: string;
  features: string[];
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  phone: string; // E.164 or local format e.g. +14155552671
  email: string;
  address: string;
  area: string;
  pppoeUsername: string;
  ipAddress: string;
  macAddress: string;
  planId: string;
  status: CustomerStatus;
  signupDate: string;
  billingDay: number; // day of month (1-28)
  balance: number;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paidAt?: string;
  paymentMethod?: 'Card / Stripe' | 'Bank Transfer' | 'Cash' | 'SSLCommerz' | 'Mobile Money';
  transactionRef?: string;
  notes?: string;
}

export interface WhatsAppTemplate {
  id: string;
  code: string;
  name: string;
  category: 'Billing' | 'Activation' | 'Suspension' | 'Support' | 'Announcement';
  content: string;
  variables: string[];
  description: string;
}

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  phone: string;
  templateCode: string;
  messageBody: string;
  status: 'redirected' | 'sent' | 'failed';
  mode: 'wa_me_redirect' | 'meta_cloud_api' | 'twilio_api';
  invoiceNumber?: string;
}

export interface CompanySettings {
  companyName: string;
  brandTagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  licenseNo: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ibanOrSwift: string;
  currency: string;
  currencySymbol: string;
  logoUrl: string;
  qrPaymentUrlPattern: string;
  termsAndConditions: string[];
}

export interface WhatsAppConfig {
  provider: 'wa_me' | 'meta_cloud' | 'twilio';
  phoneNumberId: string;
  accessToken: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  senderNumber: string;
  autoRemindDaysBeforeDue: number;
  enabledAlerts: {
    paymentReminder: boolean;
    invoiceDelivery: boolean;
    serviceActivation: boolean;
    serviceSuspension: boolean;
  };
}
