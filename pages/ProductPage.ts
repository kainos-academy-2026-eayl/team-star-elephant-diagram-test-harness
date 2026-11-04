import { type Locator, type Page } from '@playwright/test';

export class ProductPage {
    readonly title: Locator;
    readonly category: Locator;
    readonly price: Locator;
    readonly description: Locator;
    readonly fullDescriptionToggle: Locator;
    readonly stock: Locator;
    readonly quantity: Locator;
    readonly addToBasketButton: Locator;
    readonly message: Locator;
    readonly gallery: Locator;
    readonly galleryImages: Locator;
    readonly galleryCounters: Locator;
    readonly backLink: Locator;
    readonly notFoundHeading: Locator;

    constructor(private readonly page: Page) {
        this.title = page.locator('#product-title');
        this.category = page.locator('.product-detail__category a');
        this.price = page.locator('.product-detail__price');
        this.description = page.locator('.product-detail__description');
        this.fullDescriptionToggle = page.getByText('Read full description');
        this.stock = page.locator('.product-detail__stock');
        this.quantity = page.getByLabel('Quantity');
        this.addToBasketButton = page.locator('.product-detail__form button[type="submit"]');
        this.message = page.locator('.product-detail__message');
        this.gallery = page.locator('.product-gallery');
        this.galleryImages = page.locator('.product-gallery img');
        this.galleryCounters = page.locator('.product-gallery .carousel__count');
        this.backLink = page.getByRole('link', { name: 'Back to products' });
        this.notFoundHeading = page.getByRole('heading', { name: 'Product not found' });
    }

    async goto(productId: number | string, query = '') {
        return this.page.goto(`/products/${productId}${query}`);
    }

    async addToBasket(quantity = 1) {
        await this.quantity.fill(String(quantity));
        await this.addToBasketButton.click();
    }

    // The gallery is a CSS-only carousel: each slide has a hidden radio whose label arrows move between images.
    async showImage(position: number) {
        await this.page.locator(`label[for="gallery-${position}"]`).first().click({ force: true });
    }
}
