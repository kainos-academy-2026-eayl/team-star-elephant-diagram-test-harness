import { expect, newCustomerDetails, test } from '../../fixtures/testFixtures';

test.describe('POST /register', () => {
    test('creates a new customer account', async ({ api }) => {
        const response = await api.register(newCustomerDetails('api-register'));

        expect(response.status()).toBe(201);
        expect(await response.json()).toEqual({ status: 'created' });
    });

    test('rejects an email that is already registered', async ({ api, customer }) => {
        const response = await api.register({ ...customer, password: 'Another-Passw0rd' });

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: 'Email is already registered' });
    });

    test('rejects missing and invalid fields with details per field', async ({ api }) => {
        const response = await api.register({ forename: '', email: 'not-an-email', password: 'short' });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Invalid registration details');
        expect(Object.keys(body.details)).toEqual(expect.arrayContaining(['forename', 'surname', 'email', 'password']));
    });

    test('treats email addresses case-insensitively', async ({ api, customer }) => {
        const response = await api.register({ ...customer, email: customer.email.toUpperCase() });

        expect(response.status()).toBe(400);
        expect((await response.json()).error).toBe('Email is already registered');
    });
});

test.describe('POST /login', () => {
    test('returns an access token and sets a refresh cookie', async ({ api, customer }) => {
        const response = await api.login(customer.email, customer.password);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toMatchObject({ status: 'Success', expiresIn: 900 });
        expect(body.accessToken).toEqual(expect.any(String));
        expect(response.headers()['set-cookie']).toMatch(/refreshToken=[^;]+;.*HttpOnly/i);
    });

    test('rejects a wrong password', async ({ api, customer }) => {
        const response = await api.login(customer.email, 'WrongPassword!');

        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ error: 'Invalid email or password' });
    });

    test('rejects a request without valid login details', async ({ api }) => {
        const response = await api.login('not-an-email', '');

        expect(response.status()).toBe(400);
        expect((await response.json()).error).toBe('Invalid login details');
    });
});

test.describe('GET /profile', () => {
    test('returns the signed-in customer details', async ({ api, customer, customerToken }) => {
        const response = await api.profile(customerToken);

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({
            user: {
                firstName: customer.forename,
                lastName: customer.surname,
                email: customer.email,
                memberSince: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            },
            orders: [],
            ordersUnavailable: true,
        });
    });

    test('requires a valid access token', async ({ api }) => {
        expect((await api.profile()).status()).toBe(401);
        expect((await api.profile('not-a-real-token')).status()).toBe(401);
    });
});

test.describe('session refresh and logout', () => {
    test('refresh cookie issues a new access token until the customer logs out', async ({ api, customer }) => {
        expect((await api.login(customer.email, customer.password)).status()).toBe(200);

        const refreshed = await api.refresh();
        expect(refreshed.status()).toBe(200);
        const body = await refreshed.json();
        expect(body).toMatchObject({ status: 'Success', expiresIn: 900 });
        expect((await api.profile(body.accessToken)).status()).toBe(200);

        const logout = await api.logout();
        expect(logout.status()).toBe(200);
        expect(await logout.json()).toEqual({ status: 'Success' });

        expect((await api.refresh()).status()).toBe(401);
    });

    test('refresh without a refresh cookie is rejected', async ({ api }) => {
        const response = await api.refresh();

        expect(response.status()).toBe(401);
    });
});
