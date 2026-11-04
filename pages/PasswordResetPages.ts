import { type Locator, type Page } from '@playwright/test';

export class ForgotPasswordPage {
    readonly heading: Locator;
    readonly email: Locator;
    readonly requestButton: Locator;
    readonly sentMessage: Locator;
    readonly alert: Locator;
    readonly backToLoginLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Forgot your password?' });
        this.email = page.getByLabel('Email');
        this.requestButton = page.getByRole('button', { name: 'Request reset link' });
        this.sentMessage = page.getByRole('status');
        this.alert = page.getByRole('alert');
        this.backToLoginLink = page.getByRole('link', { name: 'Back to log in' });
    }

    async goto() { await this.page.goto('/forgot-password'); }

    async requestReset(email: string) {
        await this.email.fill(email);
        await this.requestButton.click();
    }
}

export class ResetPasswordPage {
    readonly heading: Locator;
    readonly password: Locator;
    readonly confirmPassword: Locator;
    readonly resetButton: Locator;
    readonly alert: Locator;
    readonly requestNewLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Reset your password' });
        this.password = page.getByLabel('New password', { exact: true });
        this.confirmPassword = page.getByLabel('Confirm new password');
        this.resetButton = page.getByRole('button', { name: 'Reset password' });
        this.alert = page.getByRole('alert');
        this.requestNewLink = page.getByRole('link', { name: 'Request a new reset link' });
    }

    async goto(token?: string) {
        return this.page.goto(`/reset-password${token === undefined ? '' : `?token=${encodeURIComponent(token)}`}`);
    }

    async reset(password: string, confirmPassword = password) {
        await this.password.fill(password);
        await this.confirmPassword.fill(confirmPassword);
        await this.resetButton.click();
    }
}
