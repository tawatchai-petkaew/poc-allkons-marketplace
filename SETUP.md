# Allkons Marketplace - Project Setup Guide

Complete setup instructions for developers joining the project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Connection Setup](#database-connection-setup)
5. [Running the Services](#running-the-services)
6. [Port Allocation](#port-allocation)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 20.0.0 (check with `node --version`)
- **PNPM**: >= 8.0.0 (check with `pnpm --version`)
  ```bash
  npm install -g pnpm@8.15.0
  ```
- **Git**: Latest version
- **Docker** (optional, for local database): Latest version

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd allkons-marketplace
```

### 2. Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install
```

This will install dependencies for all apps and services in the monorepo.

### 3. Verify Turborepo Setup

```bash
# Check that Turbo is working
pnpm build --filter=@allkons/shared-types
```

## Environment Configuration

Each service and app needs its own `.env` file. Template `.env.example` files are provided.

### Backend Services

For each API service (api-customer, api-order, api-product):

```bash
cd services/api-customer
cp .env.example .env
# Edit .env with actual credentials (see below)
```

Repeat for `api-order` and `api-product`.

### Frontend Apps

For each frontend app (buyer-platform, seller-platform):

```bash
cd apps/buyer-platform
cp .env.example .env
# Edit .env if needed
```

Repeat for `seller-platform`.

### Required Environment Variables

#### Backend Services (api-customer, api-order, api-product)

Edit each service's `.env` file:

```bash
# Server Configuration
PORT=4000  # 4000 for api-customer, 4001 for api-order, 4002 for api-product
NODE_ENV=development

# Database Configuration (for SSH Tunnel)
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=15400  # 15400 for api-customer, 15401 for api-order, 15402 for api-product
POSTGRES_USER=<ask team>
POSTGRES_PASSWORD=<ask team>
POSTGRES_DATABASE=allkons_marketplace_dev

# SSH Tunnel Configuration
IS_ENABLE_SSH_TUNNEL=true
SSH_TUNNEL_PORT=15400  # Must match POSTGRES_PORT

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=26379
REDIS_PASSWORD=<ask team>

# JWT Configuration
JWT_SECRET=<ask team>
JWT_EXPIRES_IN=7d

# API URLs
API_CUSTOMER_URL=http://localhost:4000
API_ORDER_URL=http://localhost:4001
API_PRODUCT_URL=http://localhost:4002
```

**Important**: Contact your team lead for actual credentials (database passwords, JWT secrets, etc.)

#### Frontend Apps (buyer-platform, seller-platform)

```bash
# buyer-platform: PORT=3000
# seller-platform: PORT=3001
PORT=3000

# API URLs
NEXT_PUBLIC_API_HOST_URL=https://marketplace-api-dev.allkons.com
# Or use local APIs:
# NEXT_PUBLIC_API_HOST_URL=http://localhost:4000

NEXT_PUBLIC_ALLKONS_APP_ID=<ask team>
```

## Database Connection Setup

There are **three ways** to connect to the database. Choose the one that fits your needs:

### Option 1: SSH Tunnel (Recommended) ✅

**Best for**: Normal development work with real data

**Setup**:

1. **Get the SSH key file** from your team lead:
   - File: `key-ec2-jump-apse1-allkons-dev.pem`
   - Place it in each backend service directory:
     ```bash
     # Place the key file in each service directory
     cp key-ec2-jump-apse1-allkons-dev.pem services/api-customer/
     cp key-ec2-jump-apse1-allkons-dev.pem services/api-order/
     cp key-ec2-jump-apse1-allkons-dev.pem services/api-product/
     ```

2. **Set correct permissions**:
   ```bash
   chmod 600 services/api-customer/key-ec2-jump-apse1-allkons-dev.pem
   chmod 600 services/api-order/key-ec2-jump-apse1-allkons-dev.pem
   chmod 600 services/api-product/key-ec2-jump-apse1-allkons-dev.pem
   ```

3. **Configure `.env`** (as shown in previous section):
   ```bash
   IS_ENABLE_SSH_TUNNEL=true
   POSTGRES_HOST=127.0.0.1
   POSTGRES_PORT=15400  # or 15401, 15402 depending on service
   SSH_TUNNEL_PORT=15400  # Must match POSTGRES_PORT
   ```

4. **How it works**:
   - Service connects to bastion host (10.12.67.169) via SSH
   - Creates encrypted tunnel from local port (15400/15401/15402) to AWS RDS
   - TypeORM connects to `localhost:<tunnel_port>`
   - All database traffic flows through the secure tunnel

**Pros**: Secure, no VPN needed, works from anywhere
**Cons**: Requires SSH key, slight latency overhead

### Option 2: Direct RDS Connection (Not Recommended)

**Best for**: Production deployments or when on AWS VPN

**Setup**:
```bash
IS_ENABLE_SSH_TUNNEL=false
POSTGRES_HOST=rds-psql-apse1-allkons-dev.cbciy6k28x4s.ap-southeast-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=<ask team>
POSTGRES_PASSWORD=<ask team>
```

**Pros**: No tunnel overhead
**Cons**: Requires VPN or IP whitelisting, less secure

### Option 3: Local Docker Database

**Best for**: Offline development, testing migrations

**Setup**:

1. **Start local database**:
   ```bash
   cd services/api-customer
   docker-compose up -d postgres redis
   ```

2. **Configure `.env`**:
   ```bash
   IS_ENABLE_SSH_TUNNEL=false
   POSTGRES_HOST=localhost
   POSTGRES_PORT=20000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=mysecretpassword
   POSTGRES_DATABASE=shopdit_api_development
   ```

3. **Run migrations and seeds**:
   ```bash
   pnpm typeorm:migration:run
   pnpm start:dev:db:seed
   ```

**Pros**: Works offline, fast, isolated
**Cons**: Empty database, need to run migrations/seeds

## Running the Services

### Method 1: Individual Services (Recommended)

Open separate terminal windows for each service you need:

```bash
# Terminal 1: Backend - Customer API
cd services/api-customer
pnpm dev  # Runs on http://localhost:4000

# Terminal 2: Backend - Order API
cd services/api-order
pnpm dev  # Runs on http://localhost:4001

# Terminal 3: Backend - Product API
cd services/api-product
pnpm dev  # Runs on http://localhost:4002

# Terminal 4: Frontend - Buyer Platform
cd apps/buyer-platform
pnpm dev  # Runs on http://localhost:3000

# Terminal 5: Frontend - Seller Platform
cd apps/seller-platform
pnpm dev  # Runs on http://localhost:3001
```

### Method 2: Via Turbo from Root

```bash
# From the root directory

# Run specific service
pnpm dev:api-customer
pnpm dev:api-order
pnpm dev:api-product
pnpm dev:buyer
pnpm dev:seller

# Run all services (not recommended - very resource intensive)
pnpm dev
```

### Verify Services Are Running

```bash
# Check API health endpoints
curl http://localhost:4000/health
curl http://localhost:4001/health
curl http://localhost:4002/health

# Visit frontend apps in browser
open http://localhost:3000  # Buyer platform
open http://localhost:3001  # Seller platform
```

## Port Allocation

All services use unique ports to allow concurrent execution:

### Application Ports

| Service           | Type       | Port | URL                    |
|-------------------|------------|------|------------------------|
| buyer-platform    | Frontend   | 3000 | http://localhost:3000  |
| seller-platform   | Frontend   | 3001 | http://localhost:3001  |
| api-customer      | Backend    | 4000 | http://localhost:4000  |
| api-order         | Backend    | 4001 | http://localhost:4001  |
| api-product       | Backend    | 4002 | http://localhost:4002  |

### SSH Tunnel Ports (Backend Services)

| Service      | Local Port | Remote              | Remote Port |
|--------------|------------|---------------------|-------------|
| api-customer | 15400      | AWS RDS (via SSH)   | 5432        |
| api-order    | 15401      | AWS RDS (via SSH)   | 5432        |
| api-product  | 15402      | AWS RDS (via SSH)   | 5432        |

### Docker Ports (When Using docker-compose)

| Service             | Host Port | Container Port |
|---------------------|-----------|----------------|
| api-customer (api)  | 10000     | 3000           |
| api-order (api)     | 10001     | 3000           |
| api-product (api)   | 10002     | 3000           |
| PostgreSQL          | 20000     | 5432           |
| Redis               | 26379     | 6379           |

## Troubleshooting

### SSH Tunnel Issues

**Problem**: "Error: connect EADDRINUSE 127.0.0.1:15400"

**Solution**: Port already in use. Kill the conflicting process:
```bash
lsof -i :15400
kill -9 <PID>
```

---

**Problem**: "Error: All configured authentication methods failed"

**Solution**: Check SSH key permissions:
```bash
chmod 600 key-ec2-jump-apse1-allkons-dev.pem
ls -la key-ec2-jump-apse1-allkons-dev.pem  # Should show -rw-------
```

---

**Problem**: "connect ETIMEDOUT" or "connect ECONNREFUSED"

**Solution**: Verify bastion host connectivity:
```bash
ssh -i key-ec2-jump-apse1-allkons-dev.pem ubuntu@10.12.67.169
```

### Database Connection Issues

**Problem**: "password authentication failed"

**Solution**: Verify credentials in `.env` - contact team lead for correct values

---

**Problem**: "database does not exist"

**Solution**: Check `POSTGRES_DATABASE` value in `.env` matches the actual database name

---

**Problem**: "too many connections"

**Solution**: Close unused service instances or reduce connection pool size in `config.service.ts`

### Port Conflict Issues

**Problem**: "Port 4000 is already in use"

**Solution**: Find and kill the process using that port:
```bash
# Find process using port
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or temporarily use a different port
PORT=4010 pnpm dev
```

### Dependency Issues

**Problem**: "Cannot find module" or TypeScript errors after `git pull`

**Solution**: Reinstall dependencies and rebuild:
```bash
# From root directory
pnpm install
pnpm build --filter=@allkons/shared-types
pnpm build --filter=@allkons/shared-utils
```

### NestJS Module Errors

**Problem**: "Nest can't resolve dependencies of the I18nModule"

**Solution**: This is a known issue with NestJS 11.0.11+. Ensure api-product uses NestJS 11.0.0:
```bash
cd services/api-product
# Check package.json - should show @nestjs/core: ^11.0.0 (not ^11.0.11)
```

## Next Steps

After completing the setup:

1. **Read the development guidelines**: [.claude/CLAUDE.md](./.claude/CLAUDE.md)
2. **Understand the architecture**: Review the Tech Stack section in CLAUDE.md
3. **Join the team channels**: Get access to Slack/Discord for questions
4. **Set up your IDE**: Configure ESLint, Prettier, and TypeScript
5. **Run the test suite**: `pnpm test` to verify everything works

## Common Development Commands

```bash
# Development
pnpm dev                    # Run all services (resource intensive)
pnpm dev:api-customer       # Run specific service

# Building
pnpm build                  # Build all packages/apps
pnpm build:changed          # Build only changed packages

# Testing
pnpm test                   # Run all tests
pnpm test --filter=api-customer  # Test specific package

# Linting & Formatting
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier

# Type Checking
pnpm typecheck              # Type check all packages

# Database Migrations
cd services/api-customer
pnpm typeorm:migration:generate -- src/migrations/MigrationName
pnpm typeorm:migration:run
pnpm typeorm:migration:revert
```

## Getting Help

- **Documentation**: Check [.claude/CLAUDE.md](./.claude/CLAUDE.md) for detailed guidelines
- **README**: See [README.md](./README.md) for project overview
- **Team Lead**: Contact <ask team> for credentials and access
- **Issues**: Report bugs or problems in the project's issue tracker

---

**Welcome to the Allkons Marketplace team! Happy coding! 🚀**
