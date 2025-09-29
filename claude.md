# ContractorNerd Ops+CRM Dashboard — PRD (MVP)

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **Background Jobs**: Vercel Cron (+ Inngest if needed)
- **OCR**: OpenAI Vision API (GPT-4o)
- **PDF Generation**: pdf-lib + ACORD 25 template
- **Email**: Resend + React Email
- **Payments**: Ascend webhooks
- **Automation**: Browserbase
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 1) Summary

Build a **unified internal operations + CRM dashboard** that becomes the **system of record** for ContractorNerd's entire insurance lifecycle — from **quote → underwriting → bind → renewal → servicing.**

This replaces HubSpot, Zapier, and scattered folders with one platform where producers, CSRs, and principals can see every client interaction, quote status, payment, policy, and email in a single place.

All quoting apps (GL, WC, Surety Bonds, and expanding to Excess Liability and Builder's Risk) feed into this system automatically.
The dashboard synchronizes carrier results, automates payment-to-bind flows, manages renewals (T-90/60/30), parses policy documents via OCR for COI generation, and logs every **email sent via Resend** — automated or manual — for full visibility.

Browserbase agents, Ascend payments, OCR parsing, and Resend communications all flow into a unified event timeline for each client.

---

## 2) Objectives & Non-Goals

### **Objectives**

* Fully replace HubSpot and Zapier with a unified ContractorNerd Ops+CRM dashboard.
* Centralize quoting, underwriting, binding, servicing, and renewals.
* Aggregate quoting data from all current and future product lines.
* Normalize carrier outcomes (API + Browserbase) into one status model.
* Automate:

  * Payment → bind flow (Ascend).
  * Renewals (T-90/60/30 cadence).
  * COI generation (ACORD 25).
  * Email delivery (Resend with tracking).
* Log and surface **all automated and manual emails** — renewal reminders, payment confirmations, quote updates, COI deliveries — within each account or policy timeline.
* Provide principals and staff with a live, auditable record of every action and communication.

### **Success Metrics (first 90 days)**

* 100 % of quoting and binding activity tracked inside the dashboard.
* Time to answer "why no quote?" < 60 s.
* Renewal touchpoints (T-60/T-30) ≥ 95 %.
* COI issue time < 60 s.
* Email deliverability ≥ 99 % delivered, < 0.5 % bounced.
* 90 % of payments auto-trigger bind within 5 min.
* 50 % reduction in "where is X?" Slack messages.

### **Non-Goals (MVP)**

* Marketing automation or CMS.
* Producer commission engine (Phase 2).
* Accounting ledger/AMS replacement (Phase 1.1).
* Predictive or AI-driven underwriting recommendations (Phase 2).

---

## 3) Users

* **Producers / CSRs** — manage quotes, send or track emails / COIs / renewals.
* **Ops / Admin** — reconcile payments, chase underwriting, manage renewals.
* **Principals** — monitor revenue, conversion, renewal risk, and team performance.

---

## 4) Scope (MVP vs 1.1)

### **MVP**

* Entities: Accounts, Contacts, Opportunities, Quotes, Policies, Endorsements.
* Unified carrier status model (BTIS + Coterie initial).
* Quote Attempts panel (quoted / declined / error / no-offer + reason + evidence).
* Payment → Bind automation (Ascend webhooks).
* Renewals automation (T-90 / 60 / 30 + optional T-15 / T-0 escalations).
* **Integration with ContractorNerd quoting apps** (GL, WC, Surety Bond, Excess Liability, Builder's Risk etc.).
* Policy Parsing Engine (OCR + LLM).
* **ACORD 25 COI Generator** (auto-fill from parsed policy data with manual review).
* **Email Tracking and Timeline Visibility (Resend):**

  * Every automated or manual email logged and attached to the relevant account, policy, or task.
  * Events (delivered, opened, bounced) synced from Resend webhooks.
  * Full message body + metadata (sender, recipient, subject, timestamp) visible in timeline.
* Browserbase Agent dashboard (runs / logs / screenshots / retry).
* Document storage (binders, policies, COIs, receipts).
* AskKodiak appetite pre-check (NAICS + state).
* Basic reporting (active clients, revenue YTD, bound count, renewals).

### **1.1 (Near-Term)**

* Agency-bill reconciliation (refunds / returns / ledger / aging).
* Self-serve COI portal for insureds.
* Endorsement workflow (add / change + delta premium).
* Producer task queues (SLA + load balancing).
* Commission calculation & export.
* AI Ops Agent integration for triage / renewal / COI support.
* Advanced OCR (policy comparison + endorsement diffing).

---

## 5) Functional Requirements

### **5.1 Entities**

Same as previous (PRD v2) plus:

* **email_messages:** id, sender, recipient, subject, body, related_object_id, sent_at.
* **email_events:** id, email_message_id, event_type (delivered, opened, bounced, clicked), timestamp.

---

### **5.2 Status Model**

* opportunity.stage → intake → quote → uw_review → bind → lost.
* quote.status → draft → submitted(api|agent) → awaiting_uw → quoted → accepted | rejected | expired.
* policy.status → pending_issue → active → cancelled → expired.

---

### **5.3 Workflows**

**Quote → Bind**

1. Data from ContractorNerd quote apps (GL, WC, Surety, etc.) posts into dashboard via API.
2. API carriers called directly; portal carriers via Browserbase.
3. Quotes normalized → Ascend payment link → payment_succeeded → policy shell → binder email → policy.active.

**Renewals**

* Daily cron (T-90 / 60 / 30) → generate tasks + emails + re-quotes (optional).
* Suppress if already renewed; escalate at T-15 / T-0.

**Documents / COIs**

* Upload policy PDF → OCR parse → review → approve → COI (Acord 25) auto-fill → generate PDF → email via Resend.

**Comms / Email Tracking**

* All emails (automated and manual) sent via Resend.
* System creates email_message record + listens for Resend webhooks to log events.
* Every email appears in client timeline with status (delivered ✅, opened 👁️, bounced ⚠️).
* Filters: by subject (renewal, quote, COI), sender, recipient, or time range.

---

### **5.4 Policy Parsing & COI Automation**

(OCR + LLM engine extracts carrier, insured, policy #, coverage, limits, dates; fields < 80 % confidence → manual review; ACORD 25 auto-fill; generated PDF attached + emailed via Resend.)

---

## 6 – 13 (unchanged except HubSpot removed)

---

## 14) Migration & Rollout

* Import data from existing ContractorNerd quote apps (GL, WC, Surety).
* Backfill last 90 days of quotes / policies.
* Enable Resend webhook subscriptions (delivered / opened / bounced).
* 30-minute training + cheat sheet.
* Deprecate HubSpot entirely after data validation.

---

## 15) Acceptance Criteria (MVP Complete)

* All quote, bind, and renewal activity visible in dashboard.
* Payment → bind automation creates policy shell + emails binder.
* Renewal jobs trigger emails at T-60 / T-30.
* Browserbase runs viewable with logs + screenshots.
* Policy PDF upload → OCR → COI (Acord 25) in < 60 s.
* Every automated or manual email logged and tracked via Resend webhooks (delivered/opened/bounced).
* Reports show active clients, bound YTD, renewal calendar.

---

## 16) KPIs (Post-Launch)

* Email deliverability %, open rate, bounce rate.
* Quote-to-bind conversion.
* Payment-to-bind latency.
* % on-time renewal touchpoints.
* Support pings asking "what happened?" ↓ ≥ 50 %.
* Number of emails per policy automatically tracked ↑ 100 %.

---

## 17) Risks & Mitigations

* Scope creep → lock MVP.
* Webhook flakiness → idempotent handlers + dead-letter queue.
* Parsing accuracy → manual review for low-confidence fields.
* Email overload → group renewal and COI notifications intelligently.
* Compliance → SPF/DKIM/DMARC + auditable email logs.

---

## 18) Open Questions

* Should the email timeline be visible to insureds (portal) or internal-only?
* Support ACORD 27 / 28 COIs in 1.1?
* Which OCR vendor (AWS Textract vs GCP Doc AI vs OpenAI API)?
* Should parsed fields auto-update policy record after approval or require explicit save action?