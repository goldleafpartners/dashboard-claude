# ContractorNerd Ops+CRM Dashboard

A unified internal operations and CRM dashboard for managing the complete insurance lifecycle from quote to renewal.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **Email**: Resend + React Email
- **Background Jobs**: Vercel Cron
- **OCR**: OpenAI Vision API (GPT-4o)
- **PDF Generation**: pdf-lib
- **Deployment**: Vercel

## Features (MVP)

### Core Entities
- ✅ Accounts (Companies/Insureds)
- ✅ Contacts
- ✅ Opportunities (Quote pipeline)
- ✅ Quotes (Multi-carrier tracking)
- ✅ Policies
- ✅ Endorsements
- ✅ Email tracking
- ✅ Tasks
- ✅ Documents

### Workflows
- Quote → Bind automation
- Payment → Bind flow (Ascend)
- Renewals automation (T-90/60/30)
- Document OCR parsing
- COI generation (ACORD 25)
- Email tracking (Resend)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd dashboard-claude
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your keys
3. Go to SQL Editor and run the schema from `supabase/schema.sql`

### 3. Configure Environment Variables

Copy `.env.local` and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for OCR)
OPENAI_API_KEY=your_openai_api_key

# Resend (for email)
RESEND_API_KEY=your_resend_api_key

# Ascend (for payments)
ASCEND_API_KEY=your_ascend_api_key
ASCEND_WEBHOOK_SECRET=your_ascend_webhook_secret

# Browserbase (for automation)
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# AskKodiak (for appetite checks)
ASKKODIAK_API_KEY=your_askkodiak_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Your First User

In Supabase Dashboard → Authentication → Users, click "Add user" to create your first user.

After creating the user, run this SQL to create their profile:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth-users',
  'your-email@example.com',
  'Your Name',
  'admin'
);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── accounts/         # Account management
│   │   ├── dashboard/        # Main dashboard
│   │   ├── opportunities/    # Opportunity pipeline
│   │   ├── policies/         # Policy management
│   │   ├── quotes/           # Quote tracking
│   │   ├── renewals/         # Renewal management
│   │   ├── tasks/            # Task management
│   │   └── layout.tsx        # Dashboard layout
│   ├── auth/                 # Auth callback
│   ├── login/                # Login page
│   └── api/                  # API routes (webhooks)
├── components/
│   ├── layout/               # Layout components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/             # Supabase clients
│   └── utils.ts              # Utility functions
└── supabase/
    └── schema.sql            # Database schema
```

## Next Steps

### Phase 2: Opportunities & Quotes
- [ ] Opportunity pipeline with kanban view
- [ ] Quote tracking with carrier status
- [ ] Browserbase integration for portal carriers
- [ ] API endpoints for quote ingestion

### Phase 3: Policies & Bind Automation
- [ ] Policy management
- [ ] Ascend payment webhook handler
- [ ] Payment → bind automation
- [ ] Document upload and storage

### Phase 4: Email & Communications
- [ ] Resend integration
- [ ] Email templates (React Email)
- [ ] Email tracking and timeline
- [ ] Webhook handler for email events

### Phase 5: Document Processing & COI
- [ ] OCR service (OpenAI Vision API)
- [ ] Policy parsing with confidence scoring
- [ ] ACORD 25 COI generator
- [ ] COI workflow (parse → review → generate)

### Phase 6: Renewals Automation
- [ ] Renewal detection logic
- [ ] Vercel Cron jobs
- [ ] Renewal task generation
- [ ] T-90/60/30 email campaigns

### Phase 7: Reporting & Analytics
- [ ] Dashboard KPIs
- [ ] Quote-to-bind conversion reports
- [ ] Renewal pipeline view
- [ ] Email deliverability metrics

## Deployment

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Post-Deployment

1. Set up Supabase webhooks for:
   - Ascend payment events
   - Resend email events
2. Configure Vercel Cron jobs for renewals
3. Set up Resend domain and SPF/DKIM records

## Support

For questions or issues, contact the development team.

## License

Proprietary - ContractorNerd