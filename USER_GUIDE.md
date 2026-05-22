# CRM Suite — User Guide

Welcome aboard! This guide walks your team through everything they need to start using your CRM productively from day one. Keep it bookmarked — it covers daily workflows, admin setup, and answers to the most common questions.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Understanding the Three Surfaces](#2-understanding-the-three-surfaces)
3. [Dashboard — Your Daily Snapshot](#3-dashboard--your-daily-snapshot)
4. [Leads — Capture & Nurture Prospects](#4-leads--capture--nurture-prospects)
5. [Deals — Move Opportunities to Won](#5-deals--move-opportunities-to-won)
6. [Customers — Your Closed Book](#6-customers--your-closed-book)
7. [Tasks — Stay on Top of Activities](#7-tasks--stay-on-top-of-activities)
8. [Documents — Contracts, KYC, Proofs](#8-documents--contracts-kyc-proofs)
9. [Notifications](#9-notifications)
10. [Reports](#10-reports)
11. [For Org Admins — `/manage` Console](#11-for-org-admins--manage-console)
12. [Common Workflows](#12-common-workflows)
13. [Frequently Asked Questions](#13-frequently-asked-questions)
14. [Support](#14-support)

---

## 1. Getting Started

### 1.1 First-time login

1. Open the URL we shared with your team (something like `https://yourcompany.crm.app`).
2. Enter the **username** and **password** sent to you on email.
3. If two-factor authentication is enabled on your account, enter the 6-digit code from your authenticator app (Google Authenticator, Microsoft Authenticator, etc.).
4. You'll land on the **Dashboard** by default.

> 🔒 **Forgot password?** Click "Forgot password?" on the login screen, or ask your organization admin to reset it from the Team page.

### 1.2 Setting up two-factor authentication (recommended)

1. Go to **Settings → Two-Factor**.
2. Click **"Enable 2FA"**.
3. Scan the QR code in your authenticator app.
4. Enter the 6-digit code shown in the app to confirm.

Two-factor login adds a second layer of security and protects your customer data even if your password leaks.

### 1.3 Your role

Every user has one of the following roles, which decides what they can see:

| Role | Can do |
|------|--------|
| **OWNER** | Everything in your organization — full admin access |
| **ADMIN** | Same as OWNER, except can't delete the organization |
| **MANAGER** | Manage their team's leads, deals, tasks; see team reports |
| **SALES** | Work with leads and deals assigned to them |
| **SUPPORT** | Helpdesk tickets and customer-facing tasks |

Ask your admin if you're unsure which role you have.

---

## 2. Understanding the Three Surfaces

The CRM has three different "control panels" depending on what you need to do:

| Surface | URL | Who uses it | What it's for |
|---------|-----|-------------|---------------|
| **User App** | `/app/*` | Everyone | Daily CRM work — leads, deals, tasks, customers |
| **Org Admin** | `/manage/*` | OWNER, ADMIN | Configure your organization — team, pipelines, automation, billing |
| **Customer Portal** | `/portal` | Your customers | Self-service for your customers (separate login) |

You'll spend 90% of your time in the **User App**. Org admins occasionally pop into **Org Admin** to set things up.

---

## 3. Dashboard — Your Daily Snapshot

Your home base. Shows at a glance:

- **Total Leads** — every prospect in the system
- **Total Deals** — opportunities being worked on
- **Revenue** — total payments collected
- **Win Rate** — percentage of deals closed successfully

Below the metric cards you'll find:
- **Deal Performance** — Won / Open / Cancelled breakdown
- **Recent Activity** — what happened in the last few hours
- **Quick Stats** — your personal pipeline value

> 💡 **Tip:** Bookmark the dashboard. Glance at it every morning to know exactly where you stand.

---

## 4. Leads — Capture & Nurture Prospects

A **lead** is anyone interested in your product but hasn't bought yet. Click **Leads** in the sidebar.

### 4.1 Adding a new lead

1. Click the **"+ New Lead"** button (top right).
2. Fill in the required fields:
   - **Name** — Contact's full name
   - **Phone** — 10-digit mobile number
   - **Email** (optional but recommended)
   - **City, State, Pincode**
   - **Source** — Where did this lead come from? (Website / Referral / Social Media / etc.)
   - **Product Interest** — What are they asking about?
   - **Estimated Value** — Approximate deal size in ₹
3. Click **Save**.

The lead now appears in your list and is assigned to you by default.

### 4.2 Working with a lead

Click any lead row to open its detail view. You'll see **four tabs**:

| Tab | What it shows |
|-----|---------------|
| **Overview** | All contact details, product info, status, score · Quick action buttons: Call · WhatsApp · Email |
| **Activity** | Call log history · Inline form to log new calls (outcome, duration, notes) |
| **Documents** | Upload Aadhaar, PAN, address proofs, contracts · Download or delete existing documents |
| **AI** | Two buttons: **Summarize lead** and **Suggest follow-up** — get an instant AI-written summary or next-step recommendation |

### 4.3 Lead status

Each lead moves through stages: **NEW → CONTACTED → QUALIFIED → PROPOSAL SENT → NEGOTIATION → WON / LOST**.

Update the status as you progress. Stages are configurable per organization — your admin can add custom ones (e.g., "Site Visit Scheduled") in the Pipelines settings.

### 4.4 Lead score

Each lead has a **score from 0–100** that grows as the lead engages (replies to emails, visits website, attends demo, etc.). **Higher score = hotter lead.** Your admin can configure scoring rules.

- 🔥 **70–100 (Hot)** — Priority follow-up
- 🌤️ **40–69 (Warm)** — Keep nurturing
- ❄️ **0–39 (Cold)** — Drip campaigns

### 4.5 Search & filter

- **Search bar** — Search by name, phone, or city
- **Status filter** — Show only leads in a specific stage
- **Saved Views** — Save complex filters (e.g., "Hot leads in Mumbai from Website") and recall them with one click

---

## 5. Deals — Move Opportunities to Won

A **deal** is a serious opportunity — a lead that's ready to buy. Click **Deals** in the sidebar.

### 5.1 Two views

| View | When to use |
|------|-------------|
| **Kanban** (default) | Visual pipeline — see all deals as cards in columns by stage. **Drag a card** to move it to the next stage. |
| **List** | Spreadsheet-style — better for bulk actions and sorting. |

Toggle between views using the **Kanban / List** buttons at the top right.

### 5.2 Creating a deal

1. From a lead detail view, click **"Convert to Deal"** (or)
2. Click **"+ New Deal"** on the Deals page.
3. Fill in:
   - **Linked Lead** — pick from existing leads
   - **Deal Value** — final agreed price in ₹
   - **Status** — usually starts at OPEN
   - **Notes** — any context

### 5.3 Deal detail tabs

Each deal has **four tabs**:

| Tab | What it shows |
|-----|---------------|
| **Overview** | Contact + value + status · Call / WhatsApp / Email buttons |
| **Payments** | "Paid" and "Outstanding" cards · Add payment form (UPI / Cash / Cheque / Card / Online / Finance, with screenshot upload) · List of past payments |
| **Activity** | Audit trail — every change to this deal, by whom, when |
| **AI Risk** | Click **"Analyze deal risk"** for an instant risk score (0–100) and AI explanation of why this deal might or might not close |

### 5.4 Recording payments

When a customer pays you:

1. Open the deal → **Payments** tab.
2. Click **"Add payment"**.
3. Choose type (UPI, Cheque, Card, etc.) and stage (Booked / Partial / Full).
4. Enter amount and reference number.
5. Upload a payment screenshot (optional but recommended).
6. Click **Add**.

The "Paid" and "Outstanding" cards update automatically.

### 5.5 Closing a deal

Drag the card to the **WON** column (or change status to WON in List view). The deal is now counted in your revenue and the linked lead becomes a **Customer**.

---

## 6. Customers — Your Closed Book

The **Customers** page lists everyone who's bought from you (deals in WON status). Use it for:

- **Upselling** — see what they bought, pitch related products
- **Renewals** — track contract expiry dates
- **Support** — quick access to their contact + purchase history

Click any customer to see their full history: every lead interaction, every deal, every payment, every document.

---

## 7. Tasks — Stay on Top of Activities

Tasks are reminders for things you need to do — "Call Rajesh tomorrow", "Send proposal to Acme by Friday", "Site visit at 3 PM".

### 7.1 Two views

| View | When to use |
|------|-------------|
| **List** | All your tasks in priority/due order |
| **Calendar** | Month grid view — see your week at a glance, spot conflicts |

### 7.2 Task status

- **Pending** — Not started
- **In Progress** — You're actively working on it
- **Completed** — Done

Click the status icon on the left of any task to cycle through these.

### 7.3 Priority

Tasks have three priorities: **HIGH** (red), **MEDIUM** (yellow), **LOW** (sky). Sort by priority in the list view to tackle the most urgent ones first.

### 7.4 Overdue alerts

Tasks past their due date show a red border and a ⚠️ icon. Don't ignore them.

---

## 8. Documents — Contracts, KYC, Proofs

The **Documents** page is your central document library. All files you've uploaded against leads live here.

### 8.1 Uploading a document

1. Click **"Upload"** (top right).
2. Pick the **lead** this document is for.
3. Choose **document type**: Aadhaar / PAN / Address Proof / Income Proof / Passbook / Contract / Invoice / Other.
4. Choose a file (PDF, JPG, or PNG).
5. Click **Upload**.

### 8.2 Finding a document

- **Search** by lead name, phone, or document type
- **Filter by type** using the dropdown

### 8.3 Opening or deleting

- Click the **download icon** to open the document in a new tab.
- Click the **trash icon** to delete (irreversible, ask before deleting customer contracts!).

> 💡 **Tip:** You can also upload documents directly from a lead's detail view → Documents tab — no need to leave the lead.

---

## 9. Notifications

The **bell icon** in the top-right shows your unread notifications. Click any notification to jump to the relevant record (lead, deal, task).

The **Notifications** page in the sidebar shows your full notification history.

You're notified when:
- A new lead is assigned to you
- A deal you own changes stage
- Someone @mentions you in a task comment
- A scheduled automation runs on your records
- An admin makes changes that affect you

### 9.1 Browser push (optional)

In **Settings**, enable **push notifications** to get desktop alerts even when the CRM tab isn't open.

---

## 10. Reports

Click **Reports** in the sidebar for a high-level performance view:

- **Lead conversion funnel** — how many move from NEW to WON
- **Revenue trends** — weekly / monthly
- **Top performers** — who's closing the most deals
- **Pipeline health** — deals at risk of stalling
- **Source effectiveness** — which lead sources convert best

Filter by date range, team member, or product line.

---

## 11. For Org Admins — `/manage` Console

If you're an **OWNER** or **ADMIN**, you'll see a sky-blue **"Org Admin"** card at the bottom of your sidebar. Click it to open the Org Admin console.

### 11.1 What you can do here

| Section | Use it to |
|---------|-----------|
| **Overview** | High-level stats for your whole organization |
| **Team** | Add team members, set their roles, deactivate users |
| **Pipelines** | Customize lead/deal stages (e.g., add "Site Visit" stage) |
| **Custom Fields** | Add extra fields to leads/deals (e.g., "Roof Type", "GST Number") |
| **Automation** | Set up rules like "When lead score >70, assign to senior sales" |
| **WhatsApp** | Connect WhatsApp Business for instant messaging |
| **Billing** | Manage your subscription, see invoices, change plans |
| **Audit Logs** | See every change made by every user — full traceability |
| **Two-Factor** | Enforce 2FA across your team |
| **Lead Scoring** | Set rules for how leads earn/lose points |
| **Sales Targets** | Assign monthly quotas; auto-calculated leaderboard |
| **Call Logs** | See every call logged by your team |
| **Filter Builder** | Build advanced queries and save them as shared views |
| **Import / Export** | Bulk-load leads from CSV/Excel; export your full database |
| **Lead Distribution** | Set rules like round-robin assignment to sales reps |
| **Helpdesk** | Configure support ticket departments, SLA timers, canned replies |
| **Knowledge Base** | Internal docs for your team; FAQs for your customers |
| **Forms** | Build public web forms — leads submitted to forms land in your CRM |
| **E-Signature** | Send contracts for digital signing |
| **AI Assistant** | Configure your AI features; see usage history |
| **Analytics** | Forecasting, cohort analysis, churn prediction |
| **Dashboard Builder** | Drag-drop your own custom dashboards |
| **Backups** | Schedule data backups; restore from any snapshot |
| **Cloud Storage** | Connect Google Drive / Dropbox for document sync |

### 11.2 Adding a team member

1. Go to **Manage → Team**.
2. Click **"Add User"**.
3. Enter their name, email, username, password (or auto-generate).
4. Pick their **role** (Owner / Admin / Manager / Sales / Support).
5. Click **Create**.

They'll receive an email with their login. Done.

### 11.3 Customizing your pipeline

1. Go to **Manage → Pipelines**.
2. Select **Leads** or **Deals**.
3. Click **"+ Add Stage"** to insert a new stage.
4. Drag stages to reorder.
5. Set a color for each stage (it shows up in the Kanban board).
6. Click **Save**.

The new stages appear immediately in your team's Leads/Deals views.

---

## 12. Common Workflows

### 12.1 From new lead to won deal — the happy path

1. Lead lands in the CRM (manually added, imported, or via web form)
2. Sales rep opens it → **Overview tab** → clicks **WhatsApp** to introduce themselves
3. Logs the call in **Activity tab** with outcome and notes
4. Sends product brochure → uploads to **Documents tab**
5. Schedules a follow-up → creates a **Task**
6. After demo, marks lead as **QUALIFIED**
7. Converts lead to **Deal** with expected value
8. Drags deal to **NEGOTIATION** in the Kanban board
9. Customer agrees → records partial **Payment** with UPI screenshot
10. Drags deal to **WON** → automatically becomes a Customer

### 12.2 Bulk import existing leads from Excel

1. **Manage → Import / Export**.
2. Click **Upload CSV**.
3. Pick your file (.csv or .xlsx).
4. Map columns from your file to CRM fields (Name, Phone, City, etc.).
5. Click **Preview** to see what will be imported.
6. Click **Commit** to finalize.

You can roll back the import if something looks wrong.

### 12.3 Setting up WhatsApp auto-reply

1. **Manage → WhatsApp** — connect your WhatsApp Business number.
2. **Manage → Automation** → "New Rule".
3. Trigger: **When new lead is created**.
4. Action: **Send WhatsApp message** with template "Hi {{name}}, thanks for reaching out! Our team will call you within 15 minutes."
5. Save and enable.

Every new lead now gets an instant WhatsApp.

### 12.4 Building a public lead-capture form

1. **Manage → Forms** → "New Form".
2. Add fields: Name (required), Phone (required), City, Product Interest.
3. Save → copy the public URL.
4. Embed on your website or share on WhatsApp.
5. Every submission lands as a new lead in your CRM.

---

## 13. Frequently Asked Questions

**Q: Can I use this on my phone?**
Yes. The web app is fully responsive — open the URL in your phone browser. A native Android/iOS app is also available; ask your admin for download links.

**Q: What happens if I delete a lead by mistake?**
Deletions are logged in **Audit Logs**. An admin can usually restore from a recent backup (Manage → Backups). Don't panic.

**Q: Can two people work on the same lead at the same time?**
Yes, but the last change wins. The Activity tab shows who edited what and when, so you can resolve conflicts manually.

**Q: How do I assign a lead to someone else on my team?**
Open the lead → **Edit** → change the "Assigned To" field → Save. The new owner gets a notification.

**Q: Can I see leads from my whole team or just mine?**
- **Sales** role: Only their own leads.
- **Manager** role: Their team's leads.
- **Admin / Owner** role: All leads in the organization.

**Q: How do I export my data?**
**Manage → Import / Export → Export** → choose module (Leads / Deals / Customers / Payments) → download CSV.

**Q: Is my data secure?**
Yes. Every record is scoped to your organization — no other customer of ours can see your data. We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest). 2FA is supported. Full audit logs available.

**Q: What if I lose internet mid-edit?**
The form will show an error when you try to save. Your data isn't lost — just retry the save when you're back online. The CRM does not currently support fully offline mode.

**Q: How do I cancel my subscription?**
**Manage → Billing → Cancel Subscription**. Your data remains accessible for 90 days, after which it's permanently deleted (unless you export it first).

---

## 14. Support

**Need help?**

- **In-app help** — Click the **?** icon in the top bar
- **Knowledge Base** — Visit `/manage/knowledge-base` for how-to articles
- **Email support** — support@yourcrmdomain.com (response within 1 business day)
- **WhatsApp support** — +91-XXXXX-XXXXX (business hours)
- **Live chat** — Available on the Pro and Enterprise plans

**Found a bug?** Email us with screenshots and steps to reproduce.

**Want a feature?** We love feedback. Email feedback@yourcrmdomain.com with your suggestion.

---

## Quick Reference Card

| What I want | Where to go |
|-------------|-------------|
| Add a new prospect | **Leads → + New Lead** |
| See my pipeline | **Deals → Kanban view** |
| Log a phone call | **Lead detail → Activity tab → "Log a call"** |
| Upload a contract | **Documents → Upload** (or lead detail → Documents tab) |
| Record a payment | **Deal detail → Payments tab → "Add payment"** |
| Get AI lead summary | **Lead detail → AI tab → "Summarize lead"** |
| See deal risk | **Deal detail → AI Risk tab → "Analyze"** |
| Calendar view of my work | **Tasks → Calendar view** |
| Add a team member | **Manage → Team → Add User** (Org Admins only) |
| Change pipeline stages | **Manage → Pipelines** (Org Admins only) |
| Build a web form | **Manage → Forms** (Org Admins only) |
| Set up WhatsApp | **Manage → WhatsApp** (Org Admins only) |
| Export everything | **Manage → Import / Export → Export** (Org Admins only) |

---

**You're all set. Happy selling! 🚀**

*Last updated: [Insert today's date when sending]*
*Version: 1.0*
