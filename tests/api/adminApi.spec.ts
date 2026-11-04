import { ADMIN_PASSWORD_MISSING, type AdminRole, env } from '../../fixtures/env';
import { expect, test } from '../../fixtures/testFixtures';

test.describe('admin API', () => {
    test.beforeEach(() => {
        test.skip(!env.adminPassword, ADMIN_PASSWORD_MISSING);
    });

    const tokenFor = (api: import('../../api/backendApi').BackendApi, role: AdminRole) =>
        api.adminToken(env.adminEmail(role), env.adminPassword);

    test('POST /admin/login returns a token and the admin role', async ({ api }) => {
        const response = await api.adminLogin(env.adminEmail('SuperAdmin'), env.adminPassword);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toMatchObject({ status: 'Success', expiresIn: 900, admin: { role: 'SuperAdmin' } });
        expect(body.accessToken).toEqual(expect.any(String));
    });

    test('GET /admin/me identifies the signed-in admin', async ({ api }) => {
        const token = await tokenFor(api, 'Admin');
        const response = await api.adminGet('/admin/me', token);

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({ role: 'Admin', email: env.adminEmail('Admin') });
    });

    test('GET /admin returns a dashboard scoped to the role', async ({ api }) => {
        const superAdmin = await (await api.adminGet('/admin', await tokenFor(api, 'SuperAdmin'))).json();
        const inventory = await (await api.adminGet('/admin', await tokenFor(api, 'InventoryManager'))).json();

        expect(superAdmin.cards.map((card: { label: string }) => card.label)).toContain('Customers');
        expect(inventory.cards.map((card: { label: string }) => card.label)).not.toContain('Customers');
    });

    test('GET /admin/dashboards/:key only allows the admin their own dashboard', async ({ api }) => {
        const token = await tokenFor(api, 'FinanceManager');

        expect((await api.adminGet('/admin/dashboards/finance', token)).status()).toBe(200);
        expect((await api.adminGet('/admin/dashboards/inventory', token)).status()).toBe(403);
    });

    test('GET /admin/users finds a customer by email and pages results', async ({ api, customer }) => {
        const token = await tokenFor(api, 'Admin');
        const response = await api.adminGet(`/admin/users?search=${encodeURIComponent(customer.email)}`, token);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.users).toEqual([
            expect.objectContaining({ email: customer.email, name: `${customer.forename} ${customer.surname}`, status: 'active' }),
        ]);
        expect(body.pagination).toMatchObject({ page: 1, totalPages: 1 });
    });

    test('GET /admin/users rejects an invalid page number', async ({ api }) => {
        const response = await api.adminGet('/admin/users?page=0', await tokenFor(api, 'Admin'));

        expect(response.status()).toBe(400);
    });

    test('admin can suspend and reactivate a customer through the API', async ({ api, customer }) => {
        const token = await tokenFor(api, 'Admin');
        const [user] = (await (await api.adminGet(`/admin/users?search=${encodeURIComponent(customer.email)}`, token)).json()).users;

        const details = await api.adminGet(`/admin/users/${user.id}`, token);
        expect(details.status()).toBe(200);

        const suspended = await api.adminPost(`/admin/users/${user.id}/suspend`, token);
        expect(await suspended.json()).toEqual({ user: { id: user.id, status: 'suspended' } });
        expect((await api.login(customer.email, customer.password)).status()).toBe(401);

        const reactivated = await api.adminPost(`/admin/users/${user.id}/reactivate`, token);
        expect(await reactivated.json()).toEqual({ user: { id: user.id, status: 'active' } });
        expect((await api.login(customer.email, customer.password)).status()).toBe(200);
    });

    test('unknown user ids return 404', async ({ api }) => {
        const token = await tokenFor(api, 'Admin');

        expect((await api.adminGet('/admin/users/999999999', token)).status()).toBe(404);
        expect((await api.adminPost('/admin/users/999999999/suspend', token)).status()).toBe(404);
    });

    test('GET /admin/baskets lists a customer basket and its details', async ({ api, customer, customerToken, inStockProduct }) => {
        await api.addToBasket(customerToken, inStockProduct.productId, 2);
        const token = await tokenFor(api, 'CustomerService');

        const list = await api.adminGet(`/admin/baskets?search=${encodeURIComponent(customer.email)}`, token);
        expect(list.status()).toBe(200);
        const [basket] = (await list.json()).baskets;
        expect(basket).toMatchObject({ customerEmail: customer.email, itemCount: 2, status: 'Active' });

        const details = await api.adminGet(`/admin/baskets/${basket.basketId}`, token);
        expect(details.status()).toBe(200);
        expect(JSON.stringify(await details.json())).toContain(inStockProduct.name);

        expect((await api.adminGet('/admin/baskets/999999999', token)).status()).toBe(404);
    });

    test('POST /admin/products validates new products', async ({ api }) => {
        const response = await api.adminPost('/admin/products', await tokenFor(api, 'InventoryManager'), { name: '' });

        expect(response.status()).toBe(400);
        expect((await response.json()).error).toBe('Invalid product');
    });

    test('permissions are enforced per role', async ({ api }) => {
        const customerService = await tokenFor(api, 'CustomerService');
        const inventory = await tokenFor(api, 'InventoryManager');
        const finance = await tokenFor(api, 'FinanceManager');

        expect((await api.adminPost('/admin/users/1/suspend', customerService)).status()).toBe(403);
        expect((await api.adminPost('/admin/products', customerService, {})).status()).toBe(403);
        expect((await api.adminGet('/admin/users', inventory)).status()).toBe(403);
        expect((await api.adminGet('/admin/baskets', finance)).status()).toBe(403);
    });
});

test('POST /admin/login rejects invalid credentials', async ({ api }) => {
    const response = await api.adminLogin('not-staff@example.com', 'WrongPassword!');

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: 'Invalid email or password' });
});

test('admin endpoints require an admin token', async ({ api, customerToken }) => {
    for (const path of ['/admin', '/admin/me', '/admin/users', '/admin/baskets']) {
        expect((await api.adminGet(path)).status(), path).toBe(401);
        expect((await api.adminGet(path, customerToken)).status(), `${path} with a customer token`).toBe(401);
    }
    expect((await api.adminPost('/admin/products', customerToken, {})).status()).toBe(401);
});
