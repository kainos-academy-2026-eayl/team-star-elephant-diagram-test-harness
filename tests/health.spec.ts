import { env } from '../fixtures/env';
import { expect, test } from '../fixtures/testFixtures';

test('frontend health check reports ok', async ({ request }) => {
    const response = await request.get(`${env.frontendUrl}/health`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
});

test('backend health check reports UP with the current time', async ({ api }) => {
    const response = await api.request.get('/health');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('UP');
    expect(Math.abs(Date.parse(body.time) - Date.now())).toBeLessThan(60_000);
});
