import { type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
    readonly heading: Locator;
    readonly error: Locator;
    readonly loginLink: Locator;
    readonly items: Locator;
    readonly summary: Locator;
    readonly continueToPaymentLink: Locator;
    readonly continueShoppingLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Order review' });
        this.error = page.locator('.checkout-error');
        this.loginLink = page.getByRole('link', { name: 'Log in to your account' });
        this.items = page.locator('li.checkout-item');
        this.summary = page.locator('.checkout-summary');
        this.continueToPaymentLink = page.getByRole('link', { name: 'Continue to payment' });
        this.continueShoppingLink = page.getByRole('link', { name: 'Continue shopping' });
    }

    async goto() { return this.page.goto('/checkout'); }

    item(productName: string): Locator {
        return this.items.filter({ has: this.page.getByRole('heading', { name: productName, exact: true }) });
    }

    summaryValue(label: 'Items' | 'Subtotal' | 'Total'): Locator {
        return this.summary.locator('.summary-row').filter({ hasText: new RegExp(`^\\s*${label}`) }).locator('span').last();
    }
}
