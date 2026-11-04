import { expect, test } from '../fixtures/testFixtures';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';

test('registered user can sign in', async ({ page, customer }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(customer.email, customer.password);
    await expect(page).toHaveURL(/\/products$/);
    await expect(loginPage.message).toHaveText('Top Picks');
});

test('registered user with a invalid password cannot sign in', async ({ page, customer }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(customer.email, 'WrongPassword!');
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
    await expect(loginPage.username).toHaveValue(customer.email);
});

test('not registered user cannot sign in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('practice@example.com', 'WrongPassword!');
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
});

test('login page links to registration, password reset and staff login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.heading).toHaveText('Log in');

    await loginPage.createAccountLink.click();
    await expect(page).toHaveURL(/\/register$/);

    await loginPage.goto();
    await loginPage.resetPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    await loginPage.goto();
    await loginPage.staffLoginLink.click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(loginPage.heading).toHaveText('Admin log in');
});

test('signed-in user can log out and loses access to their account', async ({ loggedInPage: page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.logoutButton.click();
    await expect(page).toHaveURL(/\/login$/);

    await profilePage.goto();
    await expect(page).toHaveURL(/\/login$/);
});
