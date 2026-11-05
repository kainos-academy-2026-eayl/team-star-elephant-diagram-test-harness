import { type Locator, type Page } from '@playwright/test';

export class HomePage {
    readonly brandLink: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly basketLink: Locator;
    readonly basketBadge: Locator;
    readonly openMenuButton: Locator;
    readonly closeMenuButton: Locator;
    readonly menu: Locator;
    readonly carousel: Locator;
    readonly highlights: Locator;

    constructor(private readonly page: Page) {
        this.brandLink = page.getByRole('link', { name: 'Sedshed home' });
        this.searchInput = page.getByRole('searchbox', { name: 'Search products' });
        this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
        this.basketLink = page.locator('.site-header .cart-link');
        this.basketBadge = page.locator('.site-header .cart-link__badge');
        this.openMenuButton = page.getByRole('button', { name: 'Open menu' });
        this.closeMenuButton = page.getByRole('button', { name: 'Close menu' });
        this.menu = page.getByRole('dialog', { name: 'Site menu' });
        this.carousel = page.getByRole('region', { name: 'Featured' });
        this.highlights = page.getByRole('region', { name: 'Shop highlights' });
    }

    async goto() { await this.page.goto('/'); }

    async search(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }
}
