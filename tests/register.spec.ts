import { expect, newCustomerDetails, test } from '../fixtures/testFixtures';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

test('new customer can create an account and then log in', async ({ page }) => {
    const customer = newCustomerDetails('register');
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await expect(registerPage.heading).toBeVisible();

    await registerPage.register(customer);

    await expect(page).toHaveURL(/\/login\?registered=1$/);
    const loginPage = new LoginPage(page);
    await expect(loginPage.statusMessage).toHaveText('Account created. You can now log in.');

    await loginPage.loginAs(customer.email, customer.password);
    await expect(loginPage.message).toBeVisible();
});

test('registration is rejected when the passwords do not match', async ({ page }) => {
    const customer = newCustomerDetails('mismatch');
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(customer, `${customer.password}-different`);

    await expect(registerPage.alert).toContainText('Passwords do not match.');
    await expect(registerPage.forename).toHaveValue(customer.forename);
    await expect(registerPage.email).toHaveValue(customer.email);
    await expect(registerPage.password).toHaveValue('');
});

test('registration is rejected for an email that is already registered', async ({ page, customer }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register({ ...customer, password: 'Another-Passw0rd' });

    await expect(registerPage.alert).toContainText('Email is already registered');
    await expect(page).toHaveURL(/\/register$/);
});

test('registration form requires every field before submitting', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.createAccountButton.click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(registerPage.forename).toHaveJSProperty('validity.valueMissing', true);
});

test('registration page links back to log in', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/\/login$/);
});
