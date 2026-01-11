# CRM Pro - Customer Relationship Management

A full-stack CRM application built with Next.js, Material-UI, GraphQL, and PostgreSQL (Neon DB).

## Features

- **Dashboard** - Overview with metrics, charts, and pipeline visualization
- **Contacts** - Manage individual contacts with status tracking
- **Companies** - Track company accounts and relationships
- **Deals** - Sales pipeline with stage management
- **Activities** - Tasks, calls, emails, and meetings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Material-UI v5 + Emotion
- **GraphQL**: Apollo Client & Server
- **Database**: PostgreSQL (Neon DB) with pg library
- **Charts**: Recharts

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update `.env.local` with your Neon DB connection string:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/crm_db?sslmode=require"
```

### 3. Initialize Database

```bash
npm run db:init    # Create tables
npm run db:seed    # Add sample data (optional)
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/graphql/      # GraphQL API endpoint
│   ├── contacts/         # Contacts page
│   ├── companies/        # Companies page
│   ├── deals/            # Deals page
│   ├── activities/       # Activities page
│   └── page.tsx          # Dashboard
├── components/           # React components
├── graphql/              # GraphQL schema & operations
├── lib/db/               # Database connection & scripts
└── theme/                # MUI theme configuration
```

## GraphQL API

Access the GraphQL playground at `/api/graphql`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:init` | Initialize database schema |
| `npm run db:seed` | Seed sample data |
