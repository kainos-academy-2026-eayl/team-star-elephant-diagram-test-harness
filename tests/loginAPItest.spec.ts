import { test, expect } from '../fixtures/testFixtures';

test('testing API response for logging in with a registered account', async ({ loginApi }) => {
    const response = await loginApi.login('rosetest@example.com', 'userTest1!');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('Success');
    expect(body.accessToken).toBeTruthy();
    expect(body.expiresIn).toBe(900);
});

test('testing API response for logging in with a non-registered account', async ({ loginApi }) => {
    const response = await loginApi.login('nonregistered@email.com', 'SuperSecretPassword!');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Invalid email or password');
});