import React, { useState } from 'react';
import {
  BookOpen,
  FolderTree,
  Database,
  Server,
  FileCode,
  MessageSquare,
  Terminal,
  Palette,
  Copy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const SystemDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('structure');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    { id: 'structure', label: '1. Folder Structure', icon: FolderTree },
    { id: 'components', label: '2. UI & Component Specs', icon: BookOpen },
    { id: 'database', label: '3. SQL Database Schema', icon: Database },
    { id: 'api', label: '4. REST API Endpoints', icon: Server },
    { id: 'a4template', label: '5. A4 HTML/CSS Template', icon: FileCode },
    { id: 'whatsappjson', label: '6. WhatsApp JSON Templates', icon: MessageSquare },
    { id: 'run_guide', label: '7. Local Run Guide', icon: Terminal },
    { id: 'ux_style', label: '8. Style & UX Guidelines', icon: Palette },
  ];

  // Raw contents for copy buttons
  const folderStructureCode = `isp-management-system/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, Twilio/Meta WhatsApp client
│   │   ├── controllers/        # Customers, Invoices, WhatsApp dispatchers
│   │   ├── middleware/         # Auth (Admin/Staff/Customer JWT), Rate-limit
│   │   ├── models/             # Drizzle / Prisma / PostgreSQL models
│   │   ├── routes/             # /api/customers, /api/invoices, /api/whatsapp
│   │   ├── services/
│   │   │   ├── whatsapp.ts     # Meta Cloud API & Twilio messaging service
│   │   │   ├── pdfGenerator.ts # Puppeteer A4 print pipeline
│   │   │   └── billingCron.ts  # Monthly recurring invoice auto-generator
│   │   └── server.ts           # Express application entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardView.tsx       # KPI metrics & delinquent actions
│   │   │   ├── CustomerManagement.tsx  # CRUD, drawer, PPPoE credentials
│   │   │   ├── InvoiceManagement.tsx   # Billing cycles, receipts, batch run
│   │   │   ├── A4InvoiceView.tsx       # ISO A4 210x297mm print stylesheet
│   │   │   ├── WhatsAppHub.tsx         # wa.me redirect & Meta API console
│   │   │   ├── PlansCatalog.tsx        # Bandwidth speed tiers & contention
│   │   │   ├── CustomerPortalView.tsx  # Subscriber self-pay checkout
│   │   │   └── QRCodeView.tsx          # Standalone SVG QR code generator
│   │   ├── data/mockData.ts
│   │   ├── types.ts
│   │   ├── utils/storage.ts
│   │   ├── App.tsx
│   │   ├── index.css                   # Tailwind CSS + @media print rules
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md`;

  const sqlSchemaCode = `-- ==============================================================================
-- NETPULSE ISP MANAGEMENT SYSTEM - POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Compliant with GDPR data privacy, ACID transactions, and indexed lookups.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SERVICE PLANS & BANDWIDTH PACKAGES
CREATE TYPE plan_medium AS ENUM ('Fiber FTTH', 'Wireless', 'Dedicated DIA');
CREATE TABLE service_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    speed_mbps INT NOT NULL,
    price_cents INT NOT NULL, -- e.g. 4900 = $49.00 (avoids floating point errors)
    type plan_medium NOT NULL DEFAULT 'Fiber FTTH',
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    contention_ratio VARCHAR(20) DEFAULT '1:1',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUBSCRIBERS / CUSTOMERS
CREATE TYPE customer_status AS ENUM ('active', 'suspended', 'terminated');
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'NP-1049'
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,                -- E.164 standard for WhatsApp
    email VARCHAR(255),
    address TEXT NOT NULL,
    area_zone VARCHAR(100) NOT NULL,           -- e.g. 'North Sector A'
    pppoe_username VARCHAR(100) UNIQUE,
    pppoe_password VARCHAR(100),
    ip_address VARCHAR(45),                    -- IPv4 or IPv6 allocation
    mac_address VARCHAR(30),                   -- ONT / Router MAC address
    plan_id UUID NOT NULL REFERENCES service_plans(id),
    status customer_status NOT NULL DEFAULT 'active',
    signup_date DATE NOT NULL DEFAULT CURRENT_DATE,
    billing_day INT NOT NULL DEFAULT 1 CHECK (billing_day BETWEEN 1 AND 28),
    balance_cents INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_status ON customers(status);

-- 4. INVOICES & RECURRING CHARGES
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'INV-2026-0089'
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal_cents INT NOT NULL,
    discount_cents INT DEFAULT 0,
    tax_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    status invoice_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    transaction_ref VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);

-- 5. INVOICE LINE ITEMS
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price_cents INT NOT NULL,
    amount_cents INT NOT NULL
);

-- 6. WHATSAPP AUDIT DISPATCH LOGS
CREATE TYPE wa_dispatch_mode AS ENUM ('wa_me_redirect', 'meta_cloud_api', 'twilio_api');
CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    template_code VARCHAR(50) NOT NULL,
    message_body TEXT NOT NULL,
    mode wa_dispatch_mode NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'redirected', 'delivered', 'failed'
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const apiEndpointsCode = `REST API SPECIFICATION FOR ISP MANAGEMENT SYSTEM:

1. CUSTOMERS CRUD
--------------------------------------------------------------------------------
GET    /api/v1/customers
       Query: ?search=&status=&plan_id=&area=&page=1&limit=20
       Response: { success: true, count: 48, data: Customer[] }

POST   /api/v1/customers
       Payload: {
         name: "Marcus Vance",
         phone: "+14155550182",
         email: "marcus@example.com",
         address: "742 Evergreen Terrace",
         area_zone: "North Sector A",
         plan_id: "plan-uuid",
         pppoe_username: "mvance_ftth",
         ip_address: "100.64.12.84",
         billing_day: 1
       }
       Response: 201 Created { success: true, data: Customer }

GET    /api/v1/customers/:id
       Response: { success: true, data: CustomerDetailWithInvoices }

PUT    /api/v1/customers/:id
       Payload: { Partial<Customer> }
       Response: 200 OK

PATCH  /api/v1/customers/:id/status
       Payload: { status: "active" | "suspended" | "terminated", reason: string }
       Trigger: Automatically restrict / enable RADIUS PPPoE profile on NAS

DELETE /api/v1/customers/:id
       Response: 204 No Content

2. INVOICES CRUD & BILLING RUN
--------------------------------------------------------------------------------
GET    /api/v1/invoices
       Query: ?status=pending|overdue|paid&customer_id=&from=&to=
       Response: { success: true, data: Invoice[] }

POST   /api/v1/invoices
       Payload: {
         customer_id: "uuid",
         issue_date: "2026-10-01",
         due_date: "2026-10-10",
         items: [{ description: "Fiber 100", quantity: 1, unit_price_cents: 4900 }],
         tax_rate: 0,
         discount_cents: 0
       }
       Response: 201 Created { success: true, data: Invoice }

POST   /api/v1/invoices/batch-generate
       Payload: { billing_month: "2026-10", billing_day: 1 }
       Response: { success: true, generated_count: 42, total_amount_cents: 205800 }

POST   /api/v1/invoices/:id/record-payment
       Payload: {
         payment_method: "Card / Stripe" | "Bank Transfer" | "Cash" | "SSLCommerz",
         transaction_ref: "ch_3Mt28xLkd890123",
         amount_cents: 4900
       }
       Response: 200 OK { success: true, invoice: Invoice, receipt_url: string }

GET    /api/v1/invoices/:id/pdf
       Query: ?format=a4&download=true
       Response: Content-Type: application/pdf (A4 210x297mm rendered via Puppeteer)

3. WHATSAPP DISPATCH & REDIRECTION TRIGGER
--------------------------------------------------------------------------------
POST   /api/v1/whatsapp/dispatch
       Payload: {
         customer_id: "uuid",
         template_code: "PAYMENT_REMINDER" | "INVOICE_DELIVERY" | "SERVICE_ACTIVATION",
         invoice_id?: "uuid",
         channel: "wa_me" | "meta_cloud" | "twilio"
       }
       Response: {
         success: true,
         mode: "wa_me_redirect",
         redirection_url: "https://wa.me/14155550182?text=Hello%20Marcus...",
         message_id: "wamid.HBgL..."
       }

POST   /api/v1/whatsapp/webhook
       Headers: X-Hub-Signature-256 (Meta Webhook verification)
       Handles: Incoming delivery status reports & incoming subscriber customer service messages`;

  const a4HtmlTemplateCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>A4 Tax Invoice - {{company.name}}</title>
  <style>
    /* ISO A4 Page Standards (210mm x 297mm) */
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      font-size: 11pt;
      line-height: 1.4;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .invoice-sheet {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      margin: 0 auto;
      page-break-inside: avoid;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo-box {
      font-size: 20pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .subhead {
      font-size: 8.5pt;
      color: #475569;
    }
    .meta-box {
      text-align: right;
    }
    .meta-title {
      font-size: 18pt;
      font-weight: 800;
      text-transform: uppercase;
    }
    .grid-2 {
      display: table;
      width: 100%;
      margin-bottom: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
    }
    .col-half {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      font-size: 9pt;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .items-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      padding: 8px 10px;
      border-bottom: 2px solid #0f172a;
      text-align: left;
    }
    .items-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 9.5pt;
    }
    .total-box {
      float: right;
      width: 45%;
      margin-bottom: 20px;
      font-family: monospace;
      font-size: 9.5pt;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }
    .grand-total {
      border-top: 2px solid #0f172a;
      font-size: 12pt;
      font-weight: 800;
      padding-top: 6px;
      margin-top: 6px;
    }
    .qr-section {
      float: left;
      width: 50%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .bank-box {
      clear: both;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 16px;
      font-size: 8.5pt;
    }
    .footer-terms {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 7.5pt;
      color: #64748b;
    }
    @media print {
      .no-print { display: none !important; }
      body { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-sheet">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="logo-box">{{company.name}}</div>
          <div class="subhead">{{company.tagline}}</div>
          <div class="subhead" style="margin-top: 4px;">{{company.address}}</div>
          <div class="subhead">Support: {{company.phone}} | Email: {{company.email}}</div>
          <div class="subhead">Tax ID: {{company.tax_id}} | License: {{company.license_no}}</div>
        </td>
        <td class="meta-box" style="vertical-align: top;">
          <div class="meta-title">TAX INVOICE</div>
          <div style="font-family: monospace; font-size: 9.5pt; margin-top: 4px;">
            <strong>Inv #:</strong> {{invoice.number}}<br>
            <strong>Date:</strong> {{invoice.date}}<br>
            <strong style="color: #b91c1c;">Due:</strong> {{invoice.due_date}}
          </div>
        </td>
      </tr>
    </table>

    <div class="grid-2">
      <div class="col-half">
        <strong style="color: #475569; text-transform: uppercase; font-size: 8pt;">Billed To:</strong><br>
        <span style="font-weight: 700; font-size: 11pt;">{{customer.name}}</span><br>
        <span>{{customer.address}} ({{customer.area}})</span><br>
        <span>Phone: {{customer.phone}} | Email: {{customer.email}}</span>
      </div>
      <div class="col-half" style="border-left: 1px solid #cbd5e1; padding-left: 12px; font-family: monospace;">
        <strong style="color: #475569; text-transform: uppercase; font-size: 8pt;">Service Node:</strong><br>
        <span>Account Code: {{customer.code}}</span><br>
        <span>Plan: {{customer.plan_name}} ({{customer.speed}} Mbps)</span><br>
        <span>PPPoE User: {{customer.pppoe_user}}</span><br>
        <span>Static IP: {{customer.ip}}</span>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th>Service Description</th>
          <th style="width: 10%; text-align: center;">Qty</th>
          <th style="width: 15%; text-align: right;">Rate</th>
          <th style="width: 18%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#items}}
        <tr>
          <td>{{index}}</td>
          <td><strong>{{description}}</strong></td>
          <td style="text-align: center;">{{qty}}</td>
          <td style="text-align: right;">{{rate}}</td>
          <td style="text-align: right; font-weight: bold;">{{amount}}</td>
        </tr>
        {{/items}}
      </tbody>
    </table>

    <div class="qr-section">
      <div id="qr_code">{{{qr_code_svg}}}</div>
      <div style="font-size: 8pt; color: #475569;">
        <strong style="color: #0f172a;">SCAN TO PAY ONLINE</strong><br>
        Instant settlement via Card, Stripe, or SSLCommerz.<br>
        Ref: {{invoice.number}}
      </div>
    </div>

    <div class="total-box">
      <div class="total-row"><span>Subtotal:</span><span>{{subtotal}}</span></div>
      <div class="total-row" style="color: #059669;"><span>Discount:</span><span>-{{discount}}</span></div>
      <div class="total-row"><span>Tax / VAT:</span><span>+{{tax}}</span></div>
      <div class="total-row grand-total"><span>Total Payable:</span><span>{{total}}</span></div>
    </div>

    <div class="bank-box">
      <strong>Bank Settlement:</strong> {{company.bank_name}} | 
      <strong>A/C:</strong> {{company.account_number}} | 
      <strong>Swift:</strong> {{company.swift}} (Ref: {{invoice.number}})
    </div>

    <div class="footer-terms">
      <strong>Terms & Conditions:</strong> Payment due within 10 days of issue. Service subject to suspension past 10 days delinquent. 
      NetPulse complies with data privacy regulations. Generated on {{timestamp}}.
    </div>
  </div>
</body>
</html>`;

  const whatsappJsonCode = `{
  "meta_cloud_templates": [
    {
      "name": "payment_reminder_v1",
      "category": "UTILITY",
      "language": "en_US",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "NetPulse Broadband Payment Reminder"
        },
        {
          "type": "BODY",
          "text": "Hello {{1}}, this is a reminder from NetPulse. Your broadband invoice #{{2}} for {{3}} is due on {{4}}. Total: {{5}}.\\n\\nPay online immediately: {{6}}"
        },
        {
          "type": "BUTTONS",
          "buttons": [
            {
              "type": "URL",
              "text": "Pay Bill Now",
              "url": "{{6}}"
            },
            {
              "type": "PHONE_NUMBER",
              "text": "Call NOC",
              "phone_number": "+18005556387"
            }
          ]
        }
      ]
    },
    {
      "name": "invoice_delivery_v1",
      "category": "UTILITY",
      "language": "en_US",
      "components": [
        {
          "type": "BODY",
          "text": "Greetings {{1}}, your new monthly bill #{{2}} is ready.\\nPlan: {{3}}\\nAmount: {{4}}\\nDue Date: {{5}}\\n\\nView & download your official A4 tax receipt: {{6}}"
        }
      ]
    },
    {
      "name": "service_activation_v1",
      "category": "UTILITY",
      "language": "en_US",
      "components": [
        {
          "type": "BODY",
          "text": "🎉 Welcome {{1}}! Your NetPulse fiber line is now ACTIVE.\\nSpeed: {{2}} Mbps\\nPPPoE User: {{3}}\\nSupport: {{4}}"
        }
      ]
    }
  ],
  "twilio_payload_sample": {
    "from": "whatsapp:+14155238886",
    "to": "whatsapp:+14155550182",
    "body": "Hello Marcus Vance, your NetPulse bill #INV-2026-0089 ($79.00) is due on 2026-10-10. Pay here: https://pay.netpulse.net/pay?inv=INV-2026-0089"
  }
}`;

  const localRunGuideCode = `# NETPULSE ISP MANAGEMENT SYSTEM - LOCAL RUN GUIDE

### 1. Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x (or SQLite/Docker container)
- npm or pnpm

### 2. Environment Variables (.env)
Create a \`.env\` file in the project root:

# Server Port & Hosting
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/netpulse_isp

# WhatsApp Meta Cloud API (Optional - wa.me redirection works client-side without keys)
META_WA_PHONE_NUMBER_ID=109847120938401
META_WA_ACCESS_TOKEN=EAAG9...
META_WA_VERIFY_TOKEN=my_secure_webhook_token_2026

# Twilio Credentials (Optional alternative)
TWILIO_ACCOUNT_SID=AC9824f89d812398a1b2c3d4e5f6
TWILIO_AUTH_TOKEN=7f91823a4b5c6d7e8f9012345678
TWILIO_WHATSAPP_NUMBER=+14155238886

# Payment Gateway (Optional)
STRIPE_SECRET_KEY=sk_test_...
SSLCOMMERZ_STORE_ID=netpulse_live
SSLCOMMERZ_STORE_PASS=securepass

### 3. Installation & Run
\`\`\`bash
# 1. Clone repository
git clone https://github.com/example/netpulse-isp-system.git
cd netpulse-isp-system

# 2. Install all dependencies
npm install

# 3. Seed PostgreSQL database schema
npx prisma db push # or psql -d netpulse_isp -f schema.sql

# 4. Start Development Server (Vite + Express)
npm run dev
\`\`\`

The application is accessible at: http://localhost:3000
- Admin Portal: http://localhost:3000
- Customer Self-Pay View: Switch role in the top-right header to "Customer"`;

  const uxGuidelinesCode = `# STYLE & UX CONSTITUTION FOR ISP BILLING & NOC OPERATIONS

1. Palette Architecture:
   - Primary: Deep Telecommunications Slate (#0b1329 / #0f172a)
   - Secondary / Accent: Optical Cyan & Teal (#0d9488, #14b8a6, #06b6d4)
   - Status Positive (Paid/Active): Emerald (#10b981)
   - Status Warning (Pending/Suspended): Amber (#f59e0b)
   - Status Danger (Overdue/Terminated): Crimson Rose (#f43f5e)
   - Paper Canvas: Crisp Clean White (#ffffff) with high-contrast slate ink (#0f172a)

2. Typography & Numbers:
   - Currency and IP addresses are strictly monospace (e.g. 100.64.12.84, $79.00) for scannability.
   - High information density designed for NOC telecom operators handling hundreds of subscribers.

3. ISO A4 Print Rules:
   - Fixed 210mm x 297mm bounds with 12mm print margins.
   - All navigation, buttons, and system chrome are stripped via @media print (.no-print).
   - High-contrast black/dark slate typography ensures flawless legibility on mono laser printers.
   - Page-break isolation avoids line items splitting awkwardly across pages.

4. WhatsApp Dispatch Discipline:
   - wa.me client-side URL redirection works without API rate-limit delays or paid subscriptions.
   - Pre-formatted international numbers with E.164 compliance (+1, +44, +880, +92).
   - Strict adherence to official Meta Business / Twilio API standards with zero unauthorized scraping.`;

  const activeContent =
    activeTab === 'structure'
      ? folderStructureCode
      : activeTab === 'components'
      ? `COMPONENT & PAGE ARCHITECTURE NOTES:

1. DashboardView.tsx:
   - Top NOC live banner with gateway status indicator.
   - Metric cards: Active subscribers, MRR ($), Overdue sum, Committed bandwidth.
   - Overdue Action Radar: lists delinquent accounts with direct WhatsApp reminder button.
   - Bandwidth tier distribution progress bars.

2. CustomerManagement.tsx:
   - Multi-criteria filter (status, plan, area/sector, full-text search).
   - Add/Edit modal with technical network fields (PPPoE, IP, MAC).
   - Customer profile drawer with direct 1-click WhatsApp triggers (Activation, Bill, Suspension).

3. InvoiceManagement.tsx:
   - Filter by status (Paid, Pending, Overdue, Cancelled).
   - Interactive line items builder (recurring bandwidth + hardware/installation fees).
   - Batch monthly billing runner for automated monthly rollouts.
   - Record payment modal with transaction ref & payment method tags.

4. A4InvoiceView.tsx:
   - Pixel-perfect 210mm x 297mm A4 layout with official company branding.
   - Dynamic SVG QR code containing secure payment checkout payload.
   - Print stylesheet with window.print() trigger for one-click PDF generation.

5. WhatsAppHub.tsx:
   - Dual-engine: instant wa.me redirection + Meta Cloud API / Twilio credentials.
   - Real-time WhatsApp phone bubble preview with dynamic variable replacement.
   - Template library with variables {{customer_name}}, {{invoice_number}}, {{amount}}, {{due_date}}, {{payment_link}}.
   - Dispatch audit log table.`
      : activeTab === 'database'
      ? sqlSchemaCode
      : activeTab === 'api'
      ? apiEndpointsCode
      : activeTab === 'a4template'
      ? a4HtmlTemplateCode
      : activeTab === 'whatsappjson'
      ? whatsappJsonCode
      : activeTab === 'run_guide'
      ? localRunGuideCode
      : uxGuidelinesCode;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            System Blueprint &amp; Technical Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete technical specification: Folder architecture, SQL schemas, REST APIs, A4 print template, and WhatsApp JSON.
          </p>
        </div>

        <button
          onClick={() => copyToClipboard(activeContent, activeTab)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors self-start sm:self-auto"
        >
          {copiedSection === activeTab ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Current Spec</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl scrollbar-none text-xs">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Code Display Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs font-mono text-slate-400">
          <span>SPECIFICATION CODE / BLUEPRINT</span>
          <span className="text-teal-400 font-semibold">{sections.find((s) => s.id === activeTab)?.label}</span>
        </div>

        <pre className="font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto bg-[#090d16] p-5 rounded-xl border border-slate-800/80 max-h-[600px] overflow-y-auto selection:bg-teal-500 selection:text-white">
          {activeContent}
        </pre>
      </div>
    </div>
  );
};
