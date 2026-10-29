import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';

const { Given, When, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
});

When('I sign in with username and password', async ({ page }, username: string, password: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAs(username, password);
});

Then('I should see a login message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.errorMessage).toBeVisible();
});