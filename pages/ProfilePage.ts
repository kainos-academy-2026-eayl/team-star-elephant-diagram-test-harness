import { type Locator, type Page } from '@playwright/test';

export class ProfilePage {
    readonly heading: Locator;
    readonly logoutButton: Locator;
    readonly ordersHeading: Locator;
    readonly ordersStatus: Locator;
    readonly error: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'My Account' });
        this.logoutButton = page.getByRole('button', { name: 'Log out' });
        this.ordersHeading = page.getByRole('heading', { name: 'Order History' });
        this.ordersStatus = page.locator('main [role="status"]');
        this.error = page.locator('main [role="alert"]');
    }

    async goto() { return this.page.goto('/profile'); }

    detail(label: 'Name' | 'Email' | 'Phone' | 'Address' | 'Member since'): Locator {
        return this.page.locator('.profile-row').filter({ has: this.page.locator('dt', { hasText: label }) }).locator('dd');
    }
}
