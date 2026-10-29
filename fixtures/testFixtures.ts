import { test as base } from '@playwright/test';
import { LoginAPI } from '../pages/loginApi';

type ApiFixtures = {
    loginApi: LoginAPI;
};

export const test = base.extend<ApiFixtures>({
    loginApi: async ({ request }, use) => {
        await use(new LoginAPI(request));
    },
});

export { expect } from '@playwright/test';