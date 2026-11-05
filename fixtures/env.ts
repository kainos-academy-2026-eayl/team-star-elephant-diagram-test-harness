import { existsSync } from 'node:fs';

// Local settings (passwords, URLs) live in an untracked .env file; see .env.example.
if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

const trimSlash = (url: string) => url.replace(/\/+$/, '');

export type AdminRole = 'SuperAdmin' | 'Admin' | 'InventoryManager' | 'FinanceManager' | 'CustomerService';

// Seeded staff accounts from the backend's prisma/adminUsers.ts; each can be overridden per role.
const DEFAULT_ADMIN_EMAILS: Record<AdminRole, string> = {
    SuperAdmin: 'charlotte.bennett@example.com',
    Admin: 'amelia.clarke@example.com',
    InventoryManager: 'sophie.davies@example.com',
    FinanceManager: 'emily.thompson@example.com',
    CustomerService: 'isla.stewart@example.com',
};

const ROLE_ENV_KEYS: Record<AdminRole, string> = {
    SuperAdmin: 'E2E_SUPER_ADMIN_EMAIL',
    Admin: 'E2E_ADMIN_EMAIL',
    InventoryManager: 'E2E_INVENTORY_MANAGER_EMAIL',
    FinanceManager: 'E2E_FINANCE_MANAGER_EMAIL',
    CustomerService: 'E2E_CUSTOMER_SERVICE_EMAIL',
};

export const env = {
    frontendUrl: trimSlash(process.env.BASE_URL ?? process.env.TEST_URL ?? 'http://localhost:3000'),
    apiUrl: trimSlash(process.env.API_URL ?? 'http://localhost:3001'),
    adminPassword: process.env.E2E_ADMIN_PASSWORD ?? '',
    adminEmail: (role: AdminRole) => process.env[ROLE_ENV_KEYS[role]] ?? DEFAULT_ADMIN_EMAILS[role],
};

export const ADMIN_PASSWORD_MISSING =
    'Set E2E_ADMIN_PASSWORD to the ADMIN_SEED_PASSWORD used when seeding the backend to run admin tests';
