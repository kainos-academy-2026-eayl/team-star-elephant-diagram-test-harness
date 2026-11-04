import { type Locator, type Page } from '@playwright/test';
import { AdminNav } from './AdminDashboardPage';

export class AdminBasketsPage {
    readonly nav: AdminNav;
    readonly heading: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly rows: Locator;
    readonly emptyMessage: Locator;
    readonly clearSearchLink: Locator;
    readonly error: Locator;

    constructor(private readonly page: Page) {
        this.nav = new AdminNav(page);
        this.heading = page.getByRole('heading', { name: 'Active baskets' });
        this.searchInput = page.getByRole('searchbox', { name: 'Search baskets' });
        this.searchButton = page.getByRole('search').getByRole('button', { name: 'Search' });
        this.rows = page.locator('table.admin-table tbody tr');
        this.emptyMessage = page.locator('main p.order-empty');
        this.clearSearchLink = page.getByRole('link', { name: 'Clear search' });
        this.error = page.locator('main .error-message');
    }

    async goto(search?: string) {
        return this.page.goto(`/admin/baskets${search ? `?q=${encodeURIComponent(search)}` : ''}`);
    }

    async search(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }

    row(customerEmail: string): Locator {
        return this.rows.filter({ hasText: customerEmail });
    }

    async viewBasket(customerEmail: string) {
        await this.row(customerEmail).getByRole('link', { name: /View basket/ }).click();
    }
}

export class AdminBasketDetailsPage {
    readonly nav: AdminNav;
    readonly heading: Locator;
    readonly backLink: Locator;
    readonly notFoundHeading: Locator;
    readonly contentRows: Locator;
    readonly emptyMessage: Locator;

    constructor(private readonly page: Page) {
        this.nav = new AdminNav(page);
        this.heading = page.getByRole('heading', { level: 1 });
        this.backLink = page.getByRole('link', { name: /Return to basket list/ });
        this.notFoundHeading = page.getByRole('heading', { name: 'Basket not found' });
        this.contentRows = page.locator('table.admin-table tbody tr');
        this.emptyMessage = page.getByText('This basket is empty.');
    }

    async goto(basketId: number | string) { return this.page.goto(`/admin/baskets/${basketId}`); }

    detail(label: string): Locator {
        return this.page.locator('.profile-row, .summary-row').filter({ has: this.page.locator('dt', { hasText: label }) }).locator('dd');
    }
}
