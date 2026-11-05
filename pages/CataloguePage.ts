import { type Locator, type Page } from '@playwright/test';

export class CataloguePage {
    readonly heading: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly productCards: Locator;
    readonly productTitles: Locator;
    readonly noProductsMessage: Locator;
    readonly menuButton: Locator;
    readonly categoryLinks: Locator;
    readonly activeCategory: Locator;
    readonly basketLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Top Picks' });
        this.searchInput = page.getByRole('searchbox', { name: 'Search products' });
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.productCards = page.locator('article.product-card');
        this.productTitles = page.locator('.product-card__title');
        this.noProductsMessage = page.getByText('No products found.');
        this.menuButton = page.locator('label.menu-button');
        this.categoryLinks = page.locator('.category-links a');
        this.activeCategory = page.locator('.category-links a.active');
        this.basketLink = page.locator('a.navbar-basket');
    }

    async goto(query: Record<string, string> = {}) {
        const search = new URLSearchParams(query).toString();
        await this.page.goto(`/products${search ? `?${search}` : ''}`);
    }

    async search(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }

    card(name: string): Locator {
        return this.productCards.filter({ has: this.page.getByRole('link', { name, exact: true }) });
    }

    // Category links sit in a dropdown that is collapsed on small screens.
    async chooseCategory(name: string) {
        const link = this.categoryLinks.filter({ hasText: new RegExp(`^${escapeRegExp(name)}$`) });
        if (!(await link.isVisible())) {
            await this.menuButton.click();
        }
        await link.click();
    }

    async openProduct(name: string) {
        await this.page.getByRole('link', { name: `View details for ${name}` }).click();
    }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
