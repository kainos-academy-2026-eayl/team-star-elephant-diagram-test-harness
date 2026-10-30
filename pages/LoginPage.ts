import { type Locator, type Page } from '@playwright/test';


export class LoginPage {
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly message: Locator;
    readonly serviceMessage: Locator;

    constructor(private readonly page: Page) {
        this.username = page.locator('#email');
        this.password = page.locator('#password');
        this.loginButton = page.getByRole('button', { name: 'Log in' });
        this.errorMessage = page.getByText('Invalid email or password');
        this.serviceMessage = page.getByText('The service is temporarily unavailable. Please try again.');
        this.message = page.getByRole('heading', { name: 'Top Picks' })
    }

    async goto() { await this.page.goto('/login'); }
    async loginAs(name: string, password: string) {
        await this.username.click();
        await this.username.fill(name);
        await this.password.click();
        await this.password.fill(password);
        await this.loginButton.click();

    }

}
