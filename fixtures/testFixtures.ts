import { randomUUID } from 'node:crypto';
import { test as base, expect, type Page } from '@playwright/test';
import { BackendApi, type CustomerDetails, type ProductDetail, type ProductSummary } from '../api/backendApi';
import { LoginAPI } from '../pages/loginApi';
import { LoginPage } from '../pages/LoginPage';
import { ADMIN_PASSWORD_MISSING, type AdminRole, env } from './env';

type Fixtures = {
    loginApi: LoginAPI;
    api: BackendApi;
    // A brand-new customer registered through the backend API, so tests never share accounts or baskets.
    customer: CustomerDetails;
    customerToken: string;
    // `page` already logged in as `customer` through the frontend login form.
    loggedInPage: Page;
    inStockProduct: ProductDetail;
    loginAsAdmin: (role: AdminRole, page?: Page) => Promise<void>;
};

export const newCustomerDetails = (label = 'customer'): CustomerDetails => {
    const id = randomUUID().slice(0, 8);
    return {
        forename: 'E2E',
        surname: `${label} ${id}`,
        email: `e2e-${label}-${Date.now()}-${id}@example.com`.toLowerCase(),
        password: `Pw-${randomUUID()}`,
    };
};

export const formatGbp = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

export async function loginThroughUi(page: Page, email: string, password: string) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(email, password);
    await expect(page).toHaveURL(/\/products$/);
}

// Products are shared seed data; the first one with plenty of stock is safe to add to baskets.
async function findInStockProduct(api: BackendApi, minimumStock = 10): Promise<ProductDetail> {
    const products: ProductSummary[] = await (await api.products()).json();
    for (const { productId } of products) {
        const product: ProductDetail = await (await api.product(productId)).json();
        if (product.inventory.quantity >= minimumStock) return product;
    }
    throw new Error(`No product has at least ${minimumStock} in stock; run "npm run db:seed" in the backend`);
}

export const test = base.extend<Fixtures>({
    loginApi: async ({ api }, use) => {
        await use(new LoginAPI(api.request));
    },

    api: async ({ playwright }, use) => {
        const request = await playwright.request.newContext({ baseURL: env.apiUrl });
        await use(new BackendApi(request));
        await request.dispose();
    },

    customer: async ({ api }, use) => {
        const details = newCustomerDetails();
        const response = await api.register(details);
        expect(response.status(), await response.text()).toBe(201);
        await use(details);
    },

    customerToken: async ({ api, customer }, use) => {
        await use(await api.customerToken(customer.email, customer.password));
    },

    loggedInPage: async ({ page, customer }, use) => {
        await loginThroughUi(page, customer.email, customer.password);
        await use(page);
    },

    inStockProduct: async ({ api }, use) => {
        await use(await findInStockProduct(api));
    },

    loginAsAdmin: async ({ page }, use) => {
        await use(async (role, targetPage = page) => {
            test.skip(!env.adminPassword, ADMIN_PASSWORD_MISSING);
            const loginPage = new LoginPage(targetPage);
            await loginPage.gotoAdmin();
            await loginPage.loginAs(env.adminEmail(role), env.adminPassword);
            await expect(targetPage).toHaveURL(/\/admin$/);
        });
    },
});

export { expect } from '@playwright/test';
