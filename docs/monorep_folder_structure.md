
helapoz/
│
├── apps/
│   │
│   ├── web/                              # POS + Shop Dashboard
│   │   ├── public/
│   │   │
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── forgot-password/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── (shop)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── pos/
│   │   │   │   │   ├── sales/
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── categories/
│   │   │   │   │   ├── inventory/
│   │   │   │   │   ├── suppliers/
│   │   │   │   │   ├── purchases/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── expenses/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── staff/
│   │   │   │   │   ├── receipts/
│   │   │   │   │   └── settings/
│   │   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── products/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── sales/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── inventory/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhooks/
│   │   │   │
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── not-found.tsx
│   │   │
│   │   ├── src/components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── pos/
│   │   │   ├── products/
│   │   │   └── dashboard/
│   │   │
│   │   ├── src/modules/
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── sales/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── reports/
│   │   │   └── subscriptions/
│   │   │
│   │   ├── src/lib/
│   │   │   ├── supabase/
│   │   │   ├── auth/
│   │   │   ├── permissions/
│   │   │   └── utils/
│   │   │
│   │   ├── middleware.ts
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── admin/                            # Super-Admin Portal
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   └── login/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── (admin)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── dashboard/
│       │   │   │   ├── shops/
│       │   │   │   ├── users/
│       │   │   │   ├── subscriptions/
│       │   │   │   ├── payments/
│       │   │   │   ├── invoices/
│       │   │   │   ├── receipt-templates/
│       │   │   │   ├── notifications/
│       │   │   │   ├── audit-logs/
│       │   │   │   └── settings/
│       │   │   │
│       │   │   ├── api/
│       │   │   │   ├── shops/
│       │   │   │   ├── subscriptions/
│       │   │   │   ├── payments/
│       │   │   │   └── receipt-templates/
│       │   │   │
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── globals.css
│       │   │
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── layout/
│       │   │   ├── shops/
│       │   │   ├── subscriptions/
│       │   │   └── payments/
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── shops/
│       │   │   ├── users/
│       │   │   ├── subscriptions/
│       │   │   ├── payments/
│       │   │   ├── receipts/
│       │   │   └── audit-logs/
│       │   │
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   ├── auth/
│       │   │   ├── permissions/
│       │   │   └── utils/
│       │   │
│       │   ├── middleware.ts
│       │   ├── next.config.ts
│       │   ├── tsconfig.json
│       │   └── package.json
│
├── packages/
│   ├── types/                            # Shared TypeScript types
│   ├── validation/                       # Shared validation schemas
│   ├── ui/                               # Reusable UI components
│   ├── config/                           # Shared lint/TS config
│   └── utils/                            # Safe shared utilities
│
├── supabase/
│   ├── migrations/                       # Version-controlled SQL
│   ├── seed.sql                          # Development seed data
│   └── config.toml
│
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   └── permissions.md
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
└── README.md
