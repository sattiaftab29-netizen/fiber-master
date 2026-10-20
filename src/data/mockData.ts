import { Customer, Invoice, Plan, WhatsAppTemplate, CompanySettings, WhatsAppConfig, WhatsAppLog } from '../types';

export const initialCompanySettings: CompanySettings = {
  companyName: 'NetPulse Broadband & Fiber Ltd.',
  brandTagline: 'Ultra-High-Speed Gigabit Fiber & Enterprise Connectivity',
  address: 'Suite 400, Telecom Tower, 108 Fiber Optics Parkway, Tech District, CA 94107',
  phone: '+1 (800) 555-NETP',
  email: 'billing@netpulse.net',
  website: 'https://www.netpulse.net',
  taxId: 'US-EIN-94-3829104',
  licenseNo: 'FCC-ISP-ID-884920-A',
  bankName: 'Silicon Valley Commercial Bank',
  accountName: 'NetPulse Broadband Operations LLC',
  accountNumber: '4839-2094-1182-9901',
  ibanOrSwift: 'SVCBUS33XXX',
  currency: 'USD',
  currencySymbol: '$',
  logoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=120&h=120&q=80',
  qrPaymentUrlPattern: 'https://pay.netpulse.net/checkout?inv={{invoice_number}}&amt={{amount}}',
  termsAndConditions: [
    'Invoices are due upon receipt. A late fee of 5% applies to payments overdue by more than 5 days.',
    'Service is subject to automatic bandwidth suspension if unpaid past 10 days after due date.',
    'Make payments via online customer portal, direct bank wire, or scanning the instant QR code above.',
    'For billing inquiries or payment proofs, contact billing@netpulse.net or WhatsApp +1 (800) 555-6387.',
    'NetPulse complies with data privacy regulations. Your network traffic data is never sold or shared.'
  ]
};

export const initialPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Home Starter Fiber 30',
    speedMbps: 30,
    price: 29.00,
    type: 'Fiber FTTH',
    billingCycle: 'monthly',
    description: 'Reliable fiber connection for standard browsing, streaming, and remote work.',
    contentionRatio: '1:4',
    features: ['30 Mbps Symmetric (Up/Down)', 'Unlimited Data Quota', 'Dual-band Wi-Fi 6 Router', '24/7 Phone Support']
  },
  {
    id: 'plan-2',
    name: 'Family Ultra Fiber 60',
    speedMbps: 60,
    price: 49.00,
    type: 'Fiber FTTH',
    billingCycle: 'monthly',
    description: 'High performance for simultaneous 4K streams, cloud backups, and smart homes.',
    contentionRatio: '1:2',
    features: ['60 Mbps Symmetric', 'Low Latency Gaming Tier', 'Dual-band Wi-Fi 6 Router', 'Free PPPoE Static IP option']
  },
  {
    id: 'plan-3',
    name: 'Gigabit Pro Fiber 120',
    speedMbps: 120,
    price: 79.00,
    type: 'Fiber FTTH',
    billingCycle: 'monthly',
    description: 'Blazing speed for content creators, heavy gamers, and tech-driven households.',
    contentionRatio: '1:1',
    features: ['120 Mbps Symmetric', 'Priority QoS Routing', 'Static IPv4 Included', 'VIP Priority WhatsApp Support']
  },
  {
    id: 'plan-4',
    name: 'Enterprise Dedicated DIA 300',
    speedMbps: 300,
    price: 199.00,
    type: 'Dedicated DIA',
    billingCycle: 'monthly',
    description: 'Guaranteed 1:1 dedicated bandwidth SLA with /29 subnet and 99.99% uptime agreement.',
    contentionRatio: '1:1',
    features: ['300 Mbps Dedicated Line', 'SLA 99.99% Guaranteed', 'Usable /29 Public IPv4 Subnet', 'Dedicated Account Manager']
  },
  {
    id: 'plan-5',
    name: 'Rural AirMax Wireless 25',
    speedMbps: 25,
    price: 35.00,
    type: 'Wireless',
    billingCycle: 'monthly',
    description: 'Long-range 5GHz point-to-multipoint wireless connection for suburban & rural nodes.',
    contentionRatio: '1:4',
    features: ['25 Mbps Wireless Link', 'Includes Outdoor Dish & PoE', 'Unlimited Monthly Usage', 'Fast local dispatch']
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    customerCode: 'NP-1049',
    name: 'Marcus Vance',
    phone: '+14155550182',
    email: 'marcus.vance@example.com',
    address: '742 Evergreen Terrace, North Heights',
    area: 'North Sector A',
    pppoeUsername: 'mvance_ftth',
    ipAddress: '100.64.12.84',
    macAddress: 'F4:8E:38:29:BA:01',
    planId: 'plan-3',
    status: 'active',
    signupDate: '2025-08-14',
    billingDay: 1,
    balance: 0.00,
    notes: 'Long-standing VIP client. Dual-band mesh installed.'
  },
  {
    id: 'cust-2',
    customerCode: 'NP-1082',
    name: 'Elena Rostova',
    phone: '+14155550293',
    email: 'elena.rostova@techcorp.io',
    address: '450 Harbor Boulevard, Suite 12B',
    area: 'Central Business Hub',
    pppoeUsername: 'erostova_dia',
    ipAddress: '198.51.100.45',
    macAddress: 'E0:D5:5E:81:7C:99',
    planId: 'plan-4',
    status: 'active',
    signupDate: '2025-11-03',
    billingDay: 5,
    balance: 0.00,
    notes: 'Requires invoice CC to accounting@techcorp.io'
  },
  {
    id: 'cust-3',
    customerCode: 'NP-1104',
    name: 'David Chen',
    phone: '+14155550341',
    email: 'david.chen88@gmail.com',
    address: '128 Willow Creek Lane, Apt 3',
    area: 'East Valley District',
    pppoeUsername: 'dchen_home',
    ipAddress: '100.64.18.102',
    macAddress: '48:8F:5A:21:CD:43',
    planId: 'plan-2',
    status: 'active',
    signupDate: '2026-01-10',
    billingDay: 1,
    balance: 49.00,
    notes: 'Bill pending for current cycle.'
  },
  {
    id: 'cust-4',
    customerCode: 'NP-1129',
    name: 'Amina Al-Mansoor',
    phone: '+14155550478',
    email: 'amina.mansoor@freelance.org',
    address: '904 Sunset Ridge Road',
    area: 'West Ridge Hills',
    pppoeUsername: 'amina_ftth',
    ipAddress: '100.64.22.15',
    macAddress: 'BC:24:11:89:FE:22',
    planId: 'plan-2',
    status: 'suspended',
    signupDate: '2025-06-20',
    billingDay: 1,
    balance: 98.00,
    notes: 'Overdue by 14 days. PPPoE line suspended at Mikrotik NAS. Ready for WhatsApp reactivation prompt.'
  },
  {
    id: 'cust-5',
    customerCode: 'NP-1150',
    name: 'Kofi Mensah',
    phone: '+14155550567',
    email: 'kmensah@greenleaf.net',
    address: '312 Orchard Avenue',
    area: 'South Suburbs',
    pppoeUsername: 'kmensah_air',
    ipAddress: '100.64.30.55',
    macAddress: '70:4C:A5:10:90:3A',
    planId: 'plan-5',
    status: 'active',
    signupDate: '2026-02-01',
    billingDay: 1,
    balance: 0.00,
    notes: 'Wireless bridge signal -62 dBm.'
  },
  {
    id: 'cust-6',
    customerCode: 'NP-1188',
    name: 'Sarah Jenkins',
    phone: '+14155550612',
    email: 'sarah.j@outlook.com',
    address: '58 Maple Crescent',
    area: 'North Sector A',
    pppoeUsername: 'sjenkins_30',
    ipAddress: '100.64.12.99',
    macAddress: '00:1E:67:38:D9:12',
    planId: 'plan-1',
    status: 'active',
    signupDate: '2026-03-12',
    billingDay: 10,
    balance: 0.00,
    notes: 'New subscriber, installation completed.'
  },
  {
    id: 'cust-7',
    customerCode: 'NP-1205',
    name: 'Robert Tanaka',
    phone: '+14155550788',
    email: 'rtanaka@studioart.jp',
    address: '19 Pinecrest Road, Unit 4',
    area: 'East Valley District',
    pppoeUsername: 'rtanaka_ftth',
    ipAddress: '100.64.18.210',
    macAddress: 'A4:C3:61:98:33:1B',
    planId: 'plan-3',
    status: 'active',
    signupDate: '2025-09-01',
    billingDay: 1,
    balance: 79.00,
    notes: 'Invoice generated, waiting for auto-pay.'
  },
  {
    id: 'cust-8',
    customerCode: 'NP-1011',
    name: 'Greg Peterson',
    phone: '+14155550890',
    email: 'gpeterson@legacy.com',
    address: '14 Industrial Way, Unit 9',
    area: 'Central Business Hub',
    pppoeUsername: 'gpeterson_old',
    ipAddress: '100.64.99.10',
    macAddress: '3C:07:54:19:80:CC',
    planId: 'plan-1',
    status: 'terminated',
    signupDate: '2024-04-15',
    billingDay: 1,
    balance: 0.00,
    notes: 'Relocated out of coverage zone. Equipment retrieved.'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0089',
    customerId: 'cust-1',
    date: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      { id: 'item-1', description: 'Gigabit Pro Fiber 120 (October 2026)', quantity: 1, unitPrice: 79.00, amount: 79.00 },
      { id: 'item-2', description: 'Static IPv4 Address Allocation', quantity: 1, unitPrice: 5.00, amount: 5.00 }
    ],
    subtotal: 84.00,
    discount: 5.00,
    tax: 0.00,
    total: 79.00,
    status: 'paid',
    paidAt: '2026-10-03 14:22:00',
    paymentMethod: 'Card / Stripe',
    transactionRef: 'ch_3Mt28xLkd890123'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0090',
    customerId: 'cust-2',
    date: '2026-10-05',
    dueDate: '2026-10-15',
    items: [
      { id: 'item-1', description: 'Enterprise Dedicated DIA 300 (October 2026)', quantity: 1, unitPrice: 199.00, amount: 199.00 },
      { id: 'item-2', description: 'Subnet /29 BGP Route Maintenance', quantity: 1, unitPrice: 20.00, amount: 20.00 }
    ],
    subtotal: 219.00,
    discount: 0.00,
    tax: 15.33,
    total: 234.33,
    status: 'paid',
    paidAt: '2026-10-06 09:10:00',
    paymentMethod: 'Bank Transfer',
    transactionRef: 'WIRE-SVCB-998124'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0091',
    customerId: 'cust-3',
    date: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      { id: 'item-1', description: 'Family Ultra Fiber 60 (October 2026)', quantity: 1, unitPrice: 49.00, amount: 49.00 }
    ],
    subtotal: 49.00,
    discount: 0.00,
    tax: 0.00,
    total: 49.00,
    status: 'pending',
    notes: 'Auto-reminder queued for WhatsApp notification.'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0072',
    customerId: 'cust-4',
    date: '2026-09-01',
    dueDate: '2026-09-10',
    items: [
      { id: 'item-1', description: 'Family Ultra Fiber 60 (September 2026)', quantity: 1, unitPrice: 49.00, amount: 49.00 },
      { id: 'item-2', description: 'Late Payment Administrative Surcharge', quantity: 1, unitPrice: 5.00, amount: 5.00 }
    ],
    subtotal: 54.00,
    discount: 0.00,
    tax: 0.00,
    total: 54.00,
    status: 'overdue',
    notes: 'Line suspended on Sep 20. Pending full settlement.'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-0092',
    customerId: 'cust-4',
    date: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      { id: 'item-1', description: 'Family Ultra Fiber 60 (October 2026)', quantity: 1, unitPrice: 49.00, amount: 49.00 }
    ],
    subtotal: 49.00,
    discount: 5.00,
    tax: 0.00,
    total: 44.00,
    status: 'overdue',
    notes: 'Cumulative overdue bill.'
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-0093',
    customerId: 'cust-5',
    date: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      { id: 'item-1', description: 'Rural AirMax Wireless 25 (October 2026)', quantity: 1, unitPrice: 35.00, amount: 35.00 }
    ],
    subtotal: 35.00,
    discount: 0.00,
    tax: 0.00,
    total: 35.00,
    status: 'paid',
    paidAt: '2026-10-02 11:45:00',
    paymentMethod: 'Mobile Money',
    transactionRef: 'MM-9918290'
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-2026-0094',
    customerId: 'cust-7',
    date: '2026-10-01',
    dueDate: '2026-10-10',
    items: [
      { id: 'item-1', description: 'Gigabit Pro Fiber 120 (October 2026)', quantity: 1, unitPrice: 79.00, amount: 79.00 }
    ],
    subtotal: 79.00,
    discount: 0.00,
    tax: 0.00,
    total: 79.00,
    status: 'pending',
    notes: 'Generated via recurring scheduler.'
  }
];

export const initialWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    code: 'PAYMENT_REMINDER',
    name: 'Payment Due Reminder',
    category: 'Billing',
    description: 'Sent 3 days prior or on due date to notify subscriber of upcoming payment.',
    variables: ['customer_name', 'invoice_number', 'amount', 'due_date', 'plan_name', 'payment_link'],
    content: `Hello {{customer_name}},

This is a gentle reminder from NetPulse Broadband.
Your internet service bill for invoice *#{{invoice_number}}* is due on *{{due_date}}*.

Plan: *{{plan_name}}*
Amount Due: *{{currency_symbol}}{{amount}}*

Pay quickly and securely online to avoid service interruption:
👉 {{payment_link}}

Bank Transfer Details:
Bank: Silicon Valley Commercial Bank
A/C: 4839-2094-1182-9901 (Ref: {{invoice_number}})

Thank you for choosing NetPulse!`
  },
  {
    id: 'tpl-2',
    code: 'INVOICE_DELIVERY',
    name: 'Monthly Invoice Delivery',
    category: 'Billing',
    description: 'Sent upon monthly bill generation with itemized summary & direct payment link.',
    variables: ['customer_name', 'invoice_number', 'amount', 'due_date', 'plan_name', 'payment_link'],
    content: `Greetings {{customer_name}},

Your monthly broadband bill *#{{invoice_number}}* has been generated.

📦 Service Plan: {{plan_name}}
💵 Total Amount: {{currency_symbol}}{{amount}}
🗓️ Due Date: {{due_date}}

Download your official A4 tax invoice or settle online here:
👉 {{payment_link}}

Thank you for being our valued subscriber!
- NetPulse Billing Team`
  },
  {
    id: 'tpl-3',
    code: 'SERVICE_ACTIVATION',
    name: 'Service Activation / Welcome',
    category: 'Activation',
    description: 'Sent to new or re-activated subscribers with PPPoE details & support hotline.',
    variables: ['customer_name', 'plan_name', 'speed_mbps', 'pppoe_username', 'support_phone'],
    content: `🎉 Welcome to NetPulse Fiber, {{customer_name}}!

Your high-speed broadband connection is now ACTIVE!

⚡ Plan: *{{plan_name}}* ({{speed_mbps}} Mbps Symmetric)
🔑 PPPoE User: \`{{pppoe_username}}\`
🌐 DNS: 1.1.1.1 / 8.8.8.8

Test your speed at: https://fast.com
Need assistance? Contact our 24/7 tech desk at {{support_phone}} or reply to this WhatsApp chat.

Enjoy ultra-fast internet!`
  },
  {
    id: 'tpl-4',
    code: 'SERVICE_SUSPENSION',
    name: 'Suspension Warning / Notice',
    category: 'Suspension',
    description: 'Sent when invoice is overdue and connection has been restricted.',
    variables: ['customer_name', 'invoice_number', 'amount', 'payment_link', 'support_phone'],
    content: `⚠️ Urgent Notice - Service Restricted

Dear {{customer_name}},
Your NetPulse internet service has been temporarily restricted due to an overdue balance of *{{currency_symbol}}{{amount}}* on invoice *#{{invoice_number}}*.

To automatically restore your connection immediately:
1. Tap this secure link to pay: {{payment_link}}
2. Line will re-authenticate within 2 minutes of payment confirmation.

Need a payment arrangement? Reply here or call {{support_phone}}.`
  },
  {
    id: 'tpl-5',
    code: 'SUPPORT_ROUTING',
    name: 'Support & NOC Helpdesk Routing',
    category: 'Support',
    description: 'Directs subscriber to network operations or assigns a ticket.',
    variables: ['customer_name', 'customer_code', 'support_phone'],
    content: `Hello {{customer_name}} [Acc: {{customer_code}}],

You are connected with NetPulse Technical Support.
A network engineer has been alerted to review your line.

If you are experiencing loss of sync:
1. Please check if the PON light on your fiber ONU is solid green.
2. Power cycle the Wi-Fi router for 30 seconds.

Our direct NOC phone is {{support_phone}}. How can we assist you today?`
  }
];

export const initialWhatsAppConfig: WhatsAppConfig = {
  provider: 'wa_me',
  phoneNumberId: '109847120938401',
  accessToken: 'EAAG9...[Meta_Cloud_Token_Encrypted]',
  twilioAccountSid: 'AC9824f89d812398a1b2c3d4e5f6',
  twilioAuthToken: '7f91823a4b5c6d7e8f9012345678',
  senderNumber: '+18005556387',
  autoRemindDaysBeforeDue: 3,
  enabledAlerts: {
    paymentReminder: true,
    invoiceDelivery: true,
    serviceActivation: true,
    serviceSuspension: true
  }
};

export const initialWhatsAppLogs: WhatsAppLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-18 10:14:20',
    customerId: 'cust-4',
    customerName: 'Amina Al-Mansoor',
    phone: '+14155550478',
    templateCode: 'SERVICE_SUSPENSION',
    messageBody: 'Urgent Notice - Service Restricted. Dear Amina Al-Mansoor, your NetPulse internet service has been temporarily restricted...',
    status: 'redirected',
    mode: 'wa_me_redirect',
    invoiceNumber: 'INV-2026-0092'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-17 14:02:11',
    customerId: 'cust-3',
    customerName: 'David Chen',
    phone: '+14155550341',
    templateCode: 'PAYMENT_REMINDER',
    messageBody: 'Hello David Chen, this is a gentle reminder from NetPulse Broadband. Your bill #INV-2026-0091 is due...',
    status: 'sent',
    mode: 'meta_cloud_api',
    invoiceNumber: 'INV-2026-0091'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-12 09:30:45',
    customerId: 'cust-6',
    customerName: 'Sarah Jenkins',
    phone: '+14155550612',
    templateCode: 'SERVICE_ACTIVATION',
    messageBody: 'Welcome to NetPulse Fiber, Sarah Jenkins! Your connection is active on Home Starter Fiber 30...',
    status: 'redirected',
    mode: 'wa_me_redirect'
  }
];
