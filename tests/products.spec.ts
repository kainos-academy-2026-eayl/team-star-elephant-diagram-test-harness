import type { ProductDetail, ProductSummary } from '../api/backendApi';
import { expect, formatGbp, test } from '../fixtures/testFixtures';
import { CataloguePage } from '../pages/CataloguePage';
import { ProductPage } from '../pages/ProductPage';

test('catalogue lists products with their name, category and price', async ({ page, api }) => {
    const products: ProductSummary[] = await (await api.products()).json();
    const catalogue = new CataloguePage(page);
    await catalogue.goto();

    await expect(catalogue.heading).toBeVisible();
    await expect(catalogue.productCards).toHaveCount(products.length);

    const [first] = products;
    const card = catalogue.card(first.name);
    await expect(card.locator('.product-card__category')).toHaveText(first.category);
    await expect(card.locator('.product-price')).toHaveText(formatGbp(first.price));
});

test('searching the catalogue shows only matching products', async ({ page, inStockProduct }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.goto();
    await catalogue.search(inStockProduct.name);

    await expect(page).toHaveURL(/\/products\?q=/);
    await expect(catalogue.searchInput).toHaveValue(inStockProduct.name);
    await expect(catalogue.card(inStockProduct.name)).toBeVisible();
    for (const text of await catalogue.productCards.allTextContents()) {
        expect(text.toLowerCase()).toContain(inStockProduct.name.toLowerCase());
    }
});

test('searching for something that does not exist shows no products', async ({ page }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.goto();
    await catalogue.search('zzz-no-such-product-zzz');

    await expect(catalogue.noProductsMessage).toBeVisible();
    await expect(catalogue.productCards).toHaveCount(0);
});

test('choosing a category shows only products in that category', async ({ page, inStockProduct }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.goto();
    await catalogue.chooseCategory(inStockProduct.category);

    await expect(page).toHaveURL(/\/products\?category=/);
    await expect(catalogue.activeCategory).toHaveText(inStockProduct.category);
    await expect(catalogue.productCards.first()).toBeVisible();
    for (const category of await page.locator('.product-card__category').allTextContents()) {
        expect(category).toBe(inStockProduct.category);
    }
});

test('opening a product shows its details, price and stock', async ({ page, inStockProduct }) => {
    const catalogue = new CataloguePage(page);
    await catalogue.goto({ q: inStockProduct.name });
    await catalogue.openProduct(inStockProduct.name);

    await expect(page).toHaveURL(new RegExp(`/products/${inStockProduct.productId}$`));
    const productPage = new ProductPage(page);
    await expect(productPage.title).toHaveText(inStockProduct.name);
    await expect(productPage.price).toHaveText(formatGbp(inStockProduct.price));
    await expect(productPage.category).toHaveText(inStockProduct.category);
    await expect(productPage.stock).toHaveText(/In stock|Only \d+ left in stock/);
    await expect(productPage.addToBasketButton).toBeEnabled();

    await productPage.category.click();
    await expect(page).toHaveURL(/\/products\?category=/);
});

test('product with several photos has a gallery that moves between images', async ({ page, api }) => {
    const product = await findProduct(api, (p) => p.images.length > 1);
    test.skip(!product, 'No seeded product has more than one image');

    const productPage = new ProductPage(page);
    await productPage.goto(product!.productId);
    const total = product!.images.length;
    await expect(productPage.galleryImages).toHaveCount(total);
    await expect(productPage.galleryCounters.first()).toHaveText(`1 / ${total}`);
    await expect(productPage.galleryImages.first()).toBeVisible();

    await productPage.showImage(2);
    await expect(page.locator('#gallery-2')).toBeChecked();
    await expect(productPage.galleryImages.nth(1)).toBeVisible();
});

test('long descriptions are shortened until the customer expands them', async ({ page, api }) => {
    const product = await findProduct(api, (p) => p.description.length > 160);
    test.skip(!product, 'No seeded product has a description over 160 characters');

    const productPage = new ProductPage(page);
    await productPage.goto(product!.productId);
    const fullText = page.locator('details.product-detail__description > p');
    await expect(fullText).toBeHidden();

    await productPage.fullDescriptionToggle.click();
    await expect(fullText).toHaveText(product!.description);
});

test('unknown product shows a not found page', async ({ page }) => {
    const productPage = new ProductPage(page);
    const response = await productPage.goto(999999);

    expect(response?.status()).toBe(404);
    await expect(productPage.notFoundHeading).toBeVisible();
    await page.getByRole('link', { name: 'Return to the product catalogue' }).click();
    await expect(page).toHaveURL(/\/products$/);
});

test('signed-out shopper is sent to log in when adding to the basket', async ({ page, inStockProduct }) => {
    const productPage = new ProductPage(page);
    await productPage.goto(inStockProduct.productId);
    await productPage.addToBasket(1);

    await expect(page).toHaveURL(/\/login$/);
});

async function findProduct(
    api: import('../api/backendApi').BackendApi,
    matches: (product: ProductDetail) => boolean,
): Promise<ProductDetail | undefined> {
    const products: ProductSummary[] = await (await api.products()).json();
    for (const { productId } of products) {
        const product: ProductDetail = await (await api.product(productId)).json();
        if (matches(product)) return product;
    }
    return undefined;
}
