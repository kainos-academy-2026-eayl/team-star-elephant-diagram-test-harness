import { expect, test } from '../../fixtures/testFixtures';

test('forgot-password accepts any well-formed email without revealing if it is registered', async ({ api, customer }) => {
    for (const email of [customer.email, 'nobody-registered-this@example.com']) {
        const response = await api.forgotPassword(email);
        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ status: 'ok' });
    }
});

test('forgot-password rejects an invalid email address', async ({ api }) => {
    const response = await api.forgotPassword('not-an-email');

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('Invalid email address');
});

test('reset-password rejects a token that was never issued', async ({ api }) => {
    const response = await api.resetPassword('a'.repeat(64), 'New-Passw0rd-1');

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: 'This reset link is invalid or has expired.' });
});

test('reset-password rejects malformed details', async ({ api }) => {
    const response = await api.resetPassword('short', 'tiny');

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('Invalid password reset details');
});
