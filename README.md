# Drum

A progressive drum practice app that generates personalized daily lessons based on your skill level and recent practice sessions.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Styling:** CSS Modules

## Features

- 🥁 AI-generated personalized practice plans
- 📊 Progress tracking across sessions
- 🎯 Adaptive difficulty based on feedback
- 💳 Credit-based lesson system with Stripe integration
- 📱 Mobile-friendly responsive design

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Admin (optional - grants unlimited credits)
ADMIN_EMAIL=your_admin_email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com

# OpenAI (for lesson generation)
OPENAI_API_KEY=your_openai_api_key
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000/drum](http://localhost:3000/drum)**

## Database Setup

The database schema is defined in `supabase/schema.sql`. Tables include:

- `drum_sessions` - Practice session logs
- `drum_profiles` - User settings (level, kit, goals)
- `drum_entitlements` - Lesson credits
- `drum_purchases` - Stripe purchase records
- `drum_lesson_uses` - Track which lessons have been used

To apply the schema to a new Supabase project, run the SQL in the Supabase dashboard or use:

```bash
npx supabase db push
```

## Regenerating Types

If you modify the database schema, regenerate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

## Build

```bash
npm run build
npm run start
```

## Deployment

The app is designed for deployment on Vercel:

1. Connect your GitHub repo to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy

## License

Private - All rights reserved
