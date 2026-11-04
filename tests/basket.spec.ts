import { expect, formatGbp, test } from '../fixtures/testFixtures';
import { BasketPage } from '../pages/BasketPage';
import { ProductPage } from '../pages/ProductPage';

test('signed-out shopper is asked to log in to see a basket', async ({ page }) => {
    const basketPage = new BasketPage(page);
    const response = await basketPage.goto();

    expect(response?.status()).toBe(401);
    await expect(basketPage.error).toContainText('Please log in to view your basket.');
    await basketPage.loginLink.click();
    await expect(page).toHaveURL(/\/login$/);
});

test('new customer sees an empty basket', async ({ loggedInPage: page }) => {
    const basketPage = new BasketPage(page);
    await basketPage.goto();

    await expect(basketPage.heading).toBeVisible();
    await expect(basketPage.emptyState).toContainText('Your basket is empty');
    await expect(basketPage.items).toHaveCount(0);
    await basketPage.continueShoppingLink.click();
    await expect(page).toHaveURL(/\/products$/);
});

test('customer can add a product to the basket from its product page', async ({ loggedInPage: page, inStockProduct: product }) => {
    const productPage = new ProductPage(page);
    await productPage.goto(product.productId);
    await productPage.addToBasket(2);

    await expect(page).toHaveURL(/\/basket$/);
    const basketPage = new BasketPage(page);
    await expect(basketPage.items).toHaveCount(1);
    await expect(basketPage.quantity(product.name)).toHaveValue('2');
    await expect(basketPage.item(product.name)).toContainText(`${formatGbp(product.price)} each`);
    await expect(basketPage.itemTotal(product.name)).toHaveText(formatGbp(product.price * 2));
    await expect(basketPage.itemCount).toHaveText('2');
    await expect(basketPage.subtotal).toHaveText(formatGbp(product.price * 2));
});

test('basket shows the product image', async ({ loggedInPage: page, api, customerToken, inStockProduct: product }) => {
    test.skip(!product.imageURL, 'Product has no image');
    await api.addToBasket(customerToken, product.productId, 1);

    const basketPage = new BasketPage(page);
    await basketPage.goto();
    const image = basketPage.image(product.name);
    await expect(image).toHaveAttribute('src', product.imageURL);
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('adding the same product again increases its quantity', async ({ loggedInPage: page, inStockProduct: product }) => {
    const productPage = new ProductPage(page);
    await productPage.goto(product.productId);
    await productPage.addToBasket(1);
    await productPage.goto(product.productId);
    await productPage.addToBasket(2);

    const basketPage = new BasketPage(page);
    await expect(basketPage.items).toHaveCount(1);
    await expect(basketPage.quantity(product.name)).toHaveValue('3');
});

test('changing a quantity updates the item and basket totals', async ({ loggedInPage: page, api, customerToken, inStockProduct: product }) => {
    await api.addToBasket(customerToken, product.productId, 1);
    const basketPage = new BasketPage(page);
    await basketPage.goto();

    await basketPage.changeQuantity(product.name, 4);

    await expect(basketPage.quantity(product.name)).toHaveValue('4');
    await expect(basketPage.itemTotal(product.name)).toHaveText(formatGbp(product.price * 4));
    await expect(basketPage.itemCount).toHaveText('4');
    await expect(basketPage.subtotal).toHaveText(formatGbp(product.price * 4));
});

test('removing the only item leaves an empty basket', async ({ loggedInPage: page, api, customerToken, inStockProduct: product }) => {
    await api.addToBasket(customerToken, product.productId, 1);
    const basketPage = new BasketPage(page);
    await basketPage.goto();
    await expect(basketPage.items).toHaveCount(1);

    await basketPage.remove(product.name);

    await expect(page).toHaveURL(/\/basket$/);
    await expect(basketPage.items).toHaveCount(0);
    await expect(basketPage.emptyState).toBeVisible();
});

test('basket keeps several different products with a combined subtotal', async ({ loggedInPage: page, api, customerToken }) => {
    const products = (await (await api.products()).json()).slice(0, 2);
    for (const product of products) {
        expect((await api.addToBasket(customerToken, product.productId, 1)).ok()).toBe(true);
    }

    const basketPage = new BasketPage(page);
    await basketPage.goto();

    await expect(basketPage.items).toHaveCount(2);
    await expect(basketPage.itemCount).toHaveText('2');
    await expect(basketPage.subtotal).toHaveText(formatGbp(products[0].price + products[1].price));
});

test('proceeding to checkout opens the order review', async ({ loggedInPage: page, api, customerToken, inStockProduct: product }) => {
    await api.addToBasket(customerToken, product.productId, 1);
    const basketPage = new BasketPage(page);
    await basketPage.goto();
    await basketPage.checkoutLink.click();

    await expect(page).toHaveURL(/\/checkout$/);
});
