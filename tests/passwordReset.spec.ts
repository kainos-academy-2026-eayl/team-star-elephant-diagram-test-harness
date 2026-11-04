import { expect, test } from '../fixtures/testFixtures';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage, ResetPasswordPage } from '../pages/PasswordResetPages';

const SENT_MESSAGE = /If an account exists for that email, a reset link has been requested/;
// Well-formed (64 hex characters) but never issued, so the backend must reject it.
const UNKNOWN_TOKEN = 'a'.repeat(64);

test('customer can request a password reset link from the login page', async ({ page, customer }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.resetPasswordLink.click();

    const forgotPage = new ForgotPasswordPage(page);
    await expect(forgotPage.heading).toBeVisible();
    await forgotPage.requestReset(customer.email);

    await expect(page).toHaveURL(/\/forgot-password\?sent=1$/);
    await expect(forgotPage.sentMessage).toContainText(SENT_MESSAGE);
    await expect(forgotPage.requestButton).toBeHidden();
});

test('password reset request does not reveal whether an email is registered', async ({ page }) => {
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.goto();
    await forgotPage.requestReset('nobody-registered-this@example.com');

    await expect(forgotPage.sentMessage).toContainText(SENT_MESSAGE);
});

test('reset page without a valid token explains the link is invalid', async ({ page }) => {
    const resetPage = new ResetPasswordPage(page);
    const response = await resetPage.goto('not-a-real-token');

    expect(response?.status()).toBe(400);
    await expect(resetPage.alert).toContainText('This reset link is invalid. Please request a new one.');
    await expect(resetPage.resetButton).toBeHidden();

    await resetPage.requestNewLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);
});

test('reset is rejected when the new passwords do not match', async ({ page }) => {
    const resetPage = new ResetPasswordPage(page);
    await resetPage.goto(UNKNOWN_TOKEN);
    await resetPage.reset('New-Passw0rd-1', 'New-Passw0rd-2');

    await expect(resetPage.alert).toContainText('Passwords do not match.');
});

test('reset is rejected for a token that was never issued', async ({ page }) => {
    const resetPage = new ResetPasswordPage(page);
    await resetPage.goto(UNKNOWN_TOKEN);
    await resetPage.reset('New-Passw0rd-1');

    await expect(resetPage.alert).toContainText('This reset link is invalid or has expired.');
});
