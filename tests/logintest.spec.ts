import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

//adam is the github god

test('registered user can sign in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('practice', 'SuperSecretPassword!'); //removed dupes
    await expect(loginPage.message).toHaveText('Top Picks');
});

test('registered user with a invalid password cannot sign in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('practice', 'WrongPassword!'); //removed dupes
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
});