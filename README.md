# CRM Pro

A modern, full-stack CRM application built with Next.js 14, GraphQL, and PostgreSQL.

![Dashboard Preview](https://via.placeholder.com/800x450?text=CRM+Pro+Dashboard)

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Component Library**: [Material-UI (MUI) v5](https://mui.com/)
- **Styling**: `makeStyles` (MUI Styles)
- **API**: [GraphQL](https://graphql.org/) (Apollo Server)
- **Client State**: [Apollo Client](https://www.apollographql.com/docs/react/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Neon DB)
- **ORM/Query Builder**: `pg` (node-postgres)
- **Authentication**: JWT & HTTP-Only Cookies

## ✨ Features

- **📊 Dashboard**: Real-time sales metrics, charts, and activity summaries.
- **🔐 Authentication**: Secure login/logout system with role-based access.
- **👥 Contact Management**: View, add, and manage customer contacts.
- **🏢 Company Management**: Track client companies and organizations.
- **💰 Deal Pipeline**: Visualize and manage sales opportunities through stages.
- **✅ Activity Tracking**: Tasks, calls, and meetings management.
- **🌓 Dark/Light Mode**: Fully themable UI with toggle.

## 🛠️ Prerequisites

- Node.js 18+
- PostgreSQL Database URL (Local or Remote like Neon)

## 🏃‍♂️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd crm-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
    JWT_SECRET=your-super-secret-key-change-this
    ```

4.  **Database Initialization**
    Initialize the schema and seed data:
    ```bash
    # Create tables (Base CRM + Users)
    npm run db:init
    npm run db:init-users

    # Seed data
    npm run db:seed
    npm run db:seed-users
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Demo Credentials

The application comes pre-seeded with the following accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@crm.com` | `admin123` |
| **User** | `sarah@crm.com` | `sarah123` |
| **User** | `mike@crm.com` | `mike123` |
| **Viewer** | `viewer@crm.com` | `viewer123` |

## 📂 Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── login/          # Login page
│   ├── page.tsx        # Dashboard (Home)
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── AuthContext.tsx # Authentication provider
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── ...
├── graphql/            # GraphQL layer
│   ├── schema.ts       # Type definitions
│   ├── resolvers.ts    # API resolvers
│   └── operations.ts   # Client-side operations
└── lib/                # Utilities
    ├── auth.ts         # Auth helpers (JWT, hashing)
    └── db/             # Database connection & scripts
```

## 📜 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Lint code
- `npm run db:init`: Initialize base CRM tables
- `npm run db:init-users`: Initialize users table
- `npm run db:seed`: Seed CRM data
- `npm run db:seed-users`: Seed user data
