import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
    readonly heading: Locator;
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly message: Locator;
    readonly serviceMessage: Locator;
    readonly alert: Locator;
    readonly statusMessage: Locator;
    readonly createAccountLink: Locator;
    readonly resetPasswordLink: Locator;
    readonly staffLoginLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { level: 1 });
        this.username = page.locator('#email');
        this.password = page.locator('#password');
        this.loginButton = page.getByRole('button', { name: 'Log in' });
        this.errorMessage = page.getByText('Invalid email or password');
        this.serviceMessage = page.getByText('The service is temporarily unavailable. Please try again.');
        this.message = page.getByRole('heading', { name: 'Top Picks' });
        this.alert = page.getByRole('alert');
        this.statusMessage = page.getByRole('status');
        this.createAccountLink = page.getByRole('link', { name: 'Create one' });
        this.resetPasswordLink = page.getByRole('link', { name: 'Reset it' });
        this.staffLoginLink = page.getByRole('link', { name: 'Staff login' });
    }

    async goto() { await this.page.goto('/login'); }

    async gotoAdmin(query = '') { await this.page.goto(`/admin/login${query}`); }

    async loginAs(name: string, password: string) {
        await this.username.click();
        await this.username.fill(name);
        await this.password.click();
        await this.password.fill(password);
        await this.loginButton.click();
    }
}
