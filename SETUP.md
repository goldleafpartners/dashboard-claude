# Setup Guide for ContractorNerd CRM

This guide will walk you through setting up the ContractorNerd CRM dashboard from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: ContractorNerd CRM
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

### Step 3: Get Supabase Credentials

1. In your Supabase project, click "Project Settings" (gear icon)
2. Go to "API" section
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public** key (starts with `eyJ...`)
   - **service_role** key (also starts with `eyJ...`)

### Step 4: Set Up Database Schema

1. In Supabase, go to "SQL Editor"
2. Click "New query"
3. Open `supabase/schema.sql` in your code editor
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click "Run" (bottom right)
7. You should see "Success. No rows returned" ✅

This creates all the tables, enums, indexes, and security policies.

### Step 5: Configure Environment Variables

1. Copy the `.env.local` file and add your values:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Optional for MVP - add later as needed
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
ASCEND_API_KEY=...
ASCEND_WEBHOOK_SECRET=...
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
ASKKODIAK_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Only the Supabase variables are required to get started!

### Step 6: Create Your First User

#### Option A: Via Supabase Dashboard (Recommended)

1. In Supabase, go to "Authentication" → "Users"
2. Click "Add user" → "Create new user"
3. Enter:
   - **Email**: your-email@example.com
   - **Password**: create a password
   - **Auto Confirm User**: ✅ Check this
4. Click "Create user"
5. **Copy the user's UUID** (you'll need this next)

#### Option B: Via SQL

```sql
-- This creates the auth user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'your-email@example.com',
  crypt('your-password', gen_salt('bf')),
  NOW()
);
```

### Step 7: Create User Profile

After creating the auth user, create their profile:

1. Go back to SQL Editor
2. Run this query (replace the UUID and email):

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'paste-user-uuid-here',  -- UUID from auth.users
  'your-email@example.com',
  'Your Full Name',
  'admin'  -- Options: 'producer', 'csr', 'admin', 'principal'
);
```

### Step 8: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should be redirected to `/login`.

### Step 9: Log In

1. Enter your email and password
2. Click "Sign in"
3. You should see the dashboard! 🎉

## What's Included (Phase 1)

✅ **Authentication**
- Login/logout
- Protected routes
- Role-based access control

✅ **Dashboard**
- Overview with key metrics
- Navigation sidebar
- User menu

✅ **Account Management**
- List all accounts
- Create new accounts
- View account details
- Edit accounts (coming soon)
- Linked contacts, opportunities, and policies

✅ **Database Schema**
- Accounts, Contacts, Opportunities
- Quotes, Policies, Endorsements
- Email messages & events
- Tasks, Documents, Activity log
- Browserbase runs

## Next Development Phases

### Phase 2: Opportunities & Quotes (In Progress)
- Opportunity pipeline view
- Quote tracking with carrier status
- API endpoints for quote ingestion
- Browserbase integration

### Phase 3: Policies & Automation
- Policy management
- Payment → bind automation
- Document upload

### Phase 4: Email & Communications
- Resend integration
- Email templates
- Email tracking timeline

### Phase 5: Document Processing
- OCR parsing (OpenAI Vision)
- COI generation (ACORD 25)

### Phase 6: Renewals
- Automated renewal detection
- T-90/60/30 email campaigns
- Renewal calendar

### Phase 7: Reporting
- Advanced dashboards
- Analytics and KPIs

## Troubleshooting

### Can't log in

1. Check that your user exists in Supabase → Authentication → Users
2. Make sure `email_confirmed_at` is set (not NULL)
3. Verify the profile exists in the `profiles` table
4. Check browser console for errors

### "Failed to fetch" errors

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct in `.env.local`
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### Schema errors

1. Make sure you ran the entire `schema.sql` file
2. Check Supabase SQL Editor for any error messages
3. Verify all tables exist: Go to "Database" → "Tables"

### Page shows "No accounts found"

This is normal! The database is empty. Click "New Account" to create your first account.

## Development Tips

### Hot Reload

The app uses Next.js hot reload. Save any file and see changes instantly.

### Database Browser

Use Supabase's "Table Editor" to view/edit data directly:
- Go to "Database" → "Tables"
- Click any table name
- Click "Insert row" to add test data

### Viewing Logs

- **Browser**: Open DevTools (F12) → Console
- **Server**: Check terminal where `npm run dev` is running

### Adding Test Data

You can insert test data via SQL Editor:

```sql
-- Create a test account
INSERT INTO accounts (name, industry, city, state, email, phone)
VALUES (
  'ABC Construction',
  'General Contracting',
  'Austin',
  'TX',
  'info@abc-construction.com',
  '512-555-0100'
);
```

## Getting API Keys (For Later Phases)

### OpenAI (for OCR)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account → API Keys → "Create new secret key"

### Resend (for emails)
1. Go to [resend.com](https://resend.com)
2. Sign up → API Keys → "Create API Key"

### Ascend (for payments)
Contact Ascend for API credentials.

### Browserbase (for automation)
1. Go to [browserbase.com](https://browserbase.com)
2. Sign up → Settings → API Keys

### AskKodiak (for appetite checks)
Contact AskKodiak for API credentials.

## Support

Questions? Check:
1. This guide
2. `README.md` for architecture overview
3. Code comments in files
4. Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
5. Next.js documentation at [nextjs.org/docs](https://nextjs.org/docs)

Happy building! 🚀