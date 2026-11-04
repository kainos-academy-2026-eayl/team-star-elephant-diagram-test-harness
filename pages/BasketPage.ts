import { type Locator, type Page } from '@playwright/test';

export class BasketPage {
    readonly heading: Locator;
    readonly error: Locator;
    readonly loginLink: Locator;
    readonly emptyState: Locator;
    readonly continueShoppingLink: Locator;
    readonly items: Locator;
    readonly itemCount: Locator;
    readonly subtotal: Locator;
    readonly checkoutLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Your basket', exact: true });
        this.error = page.locator('#basket-error');
        this.loginLink = this.error.getByRole('link', { name: 'Log in' });
        this.emptyState = page.locator('#basket-empty');
        this.continueShoppingLink = page.getByRole('link', { name: 'Continue shopping' });
        this.items = page.locator('li.basket-item');
        this.itemCount = page.locator('#summary-count');
        this.subtotal = page.locator('#summary-subtotal');
        this.checkoutLink = page.getByRole('link', { name: 'Proceed to checkout' });
    }

    async goto() { return this.page.goto('/basket'); }

    item(productName: string): Locator {
        return this.items.filter({ has: this.page.getByRole('heading', { name: productName, exact: true }) });
    }

    quantity(productName: string): Locator {
        return this.item(productName).getByLabel('Quantity');
    }

    itemTotal(productName: string): Locator {
        return this.item(productName).locator('.basket-item__total');
    }

    image(productName: string): Locator {
        return this.item(productName).locator('img.basket-item__image');
    }

    // basket.js saves a changed quantity automatically once the input fires "change".
    async changeQuantity(productName: string, quantity: number) {
        const input = this.quantity(productName);
        await input.fill(String(quantity));
        await Promise.all([
            this.page.waitForURL(/\/basket(\?.*)?$/, { waitUntil: 'load' }),
            input.press('Enter'),
        ]);
    }

    async remove(productName: string) {
        await this.page.getByRole('button', { name: `Remove ${productName} from basket` }).click();
    }
}
