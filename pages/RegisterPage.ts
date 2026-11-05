import { type Locator, type Page } from '@playwright/test';
import type { CustomerDetails } from '../api/backendApi';

export class RegisterPage {
    readonly heading: Locator;
    readonly forename: Locator;
    readonly surname: Locator;
    readonly email: Locator;
    readonly password: Locator;
    readonly confirmPassword: Locator;
    readonly createAccountButton: Locator;
    readonly alert: Locator;
    readonly loginLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Create your account' });
        this.forename = page.getByLabel('Forename');
        this.surname = page.getByLabel('Surname');
        this.email = page.getByLabel('Email');
        this.password = page.getByLabel('Password', { exact: true });
        this.confirmPassword = page.getByLabel('Confirm password');
        this.createAccountButton = page.getByRole('button', { name: 'Create account' });
        this.alert = page.getByRole('alert');
        this.loginLink = page.getByRole('link', { name: 'Log in' });
    }

    async goto() { await this.page.goto('/register'); }

    async register(customer: CustomerDetails, confirmPassword = customer.password) {
        await this.forename.fill(customer.forename);
        await this.surname.fill(customer.surname);
        await this.email.fill(customer.email);
        await this.password.fill(customer.password);
        await this.confirmPassword.fill(confirmPassword);
        await this.createAccountButton.click();
    }
}
