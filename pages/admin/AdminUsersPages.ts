import { type Locator, type Page } from '@playwright/test';
import { AdminNav } from './AdminDashboardPage';

export class AdminUsersPage {
    readonly nav: AdminNav;
    readonly heading: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly rows: Locator;
    readonly emptyMessage: Locator;
    readonly pagination: Locator;
    readonly error: Locator;

    constructor(private readonly page: Page) {
        this.nav = new AdminNav(page);
        this.heading = page.getByRole('heading', { name: 'User accounts' });
        this.searchInput = page.getByRole('searchbox', { name: 'Search users by name or email' });
        this.searchButton = page.getByRole('search').getByRole('button', { name: 'Search' });
        this.rows = page.locator('table.admin-users-table tbody tr');
        this.emptyMessage = page.locator('.admin-users-empty');
        this.pagination = page.getByRole('navigation', { name: 'User list pages' });
        this.error = page.locator('main .error-message');
    }

    async goto(search?: string) {
        return this.page.goto(`/admin/users${search ? `?q=${encodeURIComponent(search)}` : ''}`);
    }

    async search(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }

    row(email: string): Locator {
        return this.rows.filter({ hasText: email });
    }

    async viewDetails(email: string) {
        await this.row(email).getByRole('link', { name: /View details/ }).click();
    }
}

export class AdminUserDetailsPage {
    readonly nav: AdminNav;
    readonly heading: Locator;
    readonly backLink: Locator;
    readonly successMessage: Locator;
    readonly failureMessage: Locator;
    readonly suspendButton: Locator;
    readonly reactivateButton: Locator;
    readonly notFoundHeading: Locator;
    readonly recentOrders: Locator;
    readonly currentBasket: Locator;

    constructor(private readonly page: Page) {
        this.nav = new AdminNav(page);
        this.heading = page.getByRole('heading', { level: 1 });
        this.backLink = page.getByRole('link', { name: /Back to users/ });
        this.successMessage = page.locator('.success-message');
        this.failureMessage = page.locator('main .error-message');
        this.suspendButton = page.getByRole('button', { name: 'Suspend account' });
        this.reactivateButton = page.getByRole('button', { name: 'Reactivate account' });
        this.notFoundHeading = page.getByRole('heading', { name: 'User not found' });
        this.recentOrders = page.getByRole('region', { name: 'Recent orders' });
        this.currentBasket = page.getByRole('region', { name: 'Current basket' });
    }

    async goto(userId: number | string) { return this.page.goto(`/admin/users/${userId}`); }

    detail(label: 'Name' | 'Email' | 'Registered' | 'Account status'): Locator {
        return this.page.locator('.profile-row').filter({ has: this.page.locator('dt', { hasText: label }) }).locator('dd');
    }
}
