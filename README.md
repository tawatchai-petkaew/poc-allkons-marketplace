# Allkons Marketplace Monorepo

Monorepo สำหรับ Allkons Platform ประกอบด้วย Buyer/Seller Platforms และ API Services

## 📦 โครงสร้างโปรเจค

```
allkons-marketplace/
├── apps/                    # Frontend Applications
│   ├── buyer-platform/     # Next.js - Buyer Platform
│   ├── seller-platform/    # Next.js - Seller Platform
│   └── startup-partner-platform/  # Next.js - Startup Partner Platform
├── services/               # Backend Services
│   ├── api-customer/       # NestJS - Customer API
│   ├── api-order/          # NestJS - Order API
│   └── api-product/        # NestJS - Product API
├── packages/               # Shared Packages
│   ├── shared-types/       # TypeScript Types
│   ├── shared-utils/       # Utilities
│   └── tsconfig/           # TypeScript Configs
└── package.json            # Root Configuration
```

## 🚀 เริ่มต้นใช้งาน

### Quick Start

```bash
# Install pnpm (ถ้ายังไม่มี)
npm install -g pnpm@8.15.0

# Install dependencies
pnpm install

# Setup environment files
cp services/api-customer/.env.example services/api-customer/.env
# (Edit .env with actual credentials)

# Run services
pnpm dev:api-customer
```

### 📖 Complete Setup Guide

**สำหรับนักพัฒนาใหม่**: อ่าน [SETUP.md](./SETUP.md) สำหรับคำแนะนำการติดตั้งแบบละเอียด รวมถึง:
- การตั้งค่า Environment Variables
- การเชื่อมต่อ Database (SSH Tunnel)
- Port Allocation
- Troubleshooting

**For new developers**: Read [SETUP.md](./SETUP.md) for comprehensive setup instructions including:
- Environment configuration
- Database connection (SSH Tunnel)
- Port allocation
- Troubleshooting

## 📝 Commands

```bash
# Development - รัน service เดียว (แนะนำ)
pnpm dev:buyer           # Buyer Platform (port 3000)
pnpm dev:seller          # Seller Platform (port 3001)
pnpm dev:sp              # Startup Partner Platform (port 3002)
pnpm dev:api-customer    # Customer API (port 4000)
pnpm dev:api-order       # Order API (port 4001)
pnpm dev:api-product     # Product API (port 4002)

# Development - รันทุก services (ใช้ทรัพยากรเยอะ)
pnpm dev

# Development แบบ Turbo filter
pnpm dev --filter=@allkons/buyer-platform
pnpm dev --filter=@allkons/api-customer

# Build ทั้งหมด
pnpm build

# Build เฉพาะ service ที่เปลี่ยน
pnpm build:changed

# Build เฉพาะ service เดียว
pnpm build --filter=@allkons/api-customer

# Test
pnpm test
pnpm test --filter=@allkons/buyer-platform

# Lint & Format
pnpm lint
pnpm format

# Type check
pnpm typecheck
```

## 🐳 Docker & Deployment

แต่ละ service มี Dockerfile แยกกันและสามารถ deploy แยกกันได้:

```bash
# Build Docker image สำหรับ api-customer
docker build -f services/api-customer/Dockerfile -t api-customer .

# Build Docker image สำหรับ buyer-platform
docker build -f apps/buyer-platform/Dockerfile -t buyer-platform .
```

## 🔧 Turborepo Features

- **Caching**: Build ครั้งแรก cache ไว้ ครั้งต่อไปเร็วขึ้น
- **Parallel Execution**: รัน tasks หลาย services พร้อมกัน
- **Smart Filtering**: Build เฉพาะที่เปลี่ยน

## 📚 Documentation

### Project Documentation
- **[SETUP.md](./SETUP.md)** - Complete setup guide for new developers
- **[.claude/CLAUDE.md](./.claude/CLAUDE.md)** - Development guidelines and architecture

### External Resources
- [Turborepo Docs](https://turbo.build/repo/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)

## 🤝 Contributing

1. สร้าง branch ใหม่จาก `main`
2. ทำการแก้ไข
3. Run `pnpm build && pnpm test` ให้ผ่าน
4. สร้าง Pull Request
