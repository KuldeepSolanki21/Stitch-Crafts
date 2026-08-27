# Stitch & Crafts — Enterprise E-Commerce Platform

A production-grade, enterprise architecture for a luxury handcrafted leather goods brand.

## Workspace Layout
- **`apps/client`**: Customer Storefront (React + Vite + TypeScript + Tailwind CSS + Redux Toolkit + React Query + Framer Motion)
- **`apps/admin`**: Separate Administrative Dashboard (React + Vite + TypeScript + Tailwind CSS + Redux Toolkit + Recharts)
- **`apps/server`**: Core REST API & Business Logic (Node.js + Express + TypeScript + Prisma ORM + PostgreSQL + Redis)
- **`packages/common-types`**: Shared Domain Models and API Contracts
- **`packages/validation-schemas`**: Isomorphic Zod Validation Schemas
- **`packages/eslint-config-custom`**: Monorepo-wide Code Quality and Formatting Rules

## Quick Start
```bash
# Install workspace dependencies
pnpm install

# Start local PostgreSQL and Redis containers
docker-compose up -d

# Generate Prisma Client & run migrations
pnpm db:migrate

# Start development servers across all apps
pnpm dev
```
