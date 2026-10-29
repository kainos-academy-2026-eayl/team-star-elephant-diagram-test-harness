import { test, expect } from '../fixtures/testFixtures';

test('testing API response for logging in with a registered account', async ({ loginApi }) => {
    const response = await loginApi.login('practice@email1.com', 'SuperSecretPassword!');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Login successful');
});

test('testing API response for logging in with a non-registered account', async ({ loginApi }) => {
    const response = await loginApi.login('nonregistered@email.com', 'SuperSecretPassword!');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.message).toBe('Incorrect email address or password');
});