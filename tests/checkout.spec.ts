import { expect, formatGbp, test } from '../fixtures/testFixtures';
import { CheckoutPage } from '../pages/CheckoutPage';

test('signed-out shopper is asked to log in before checkout', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    const response = await checkoutPage.goto();

    expect(response?.status()).toBe(401);
    await expect(checkoutPage.error).toContainText('Please log in to proceed to checkout.');
    await checkoutPage.loginLink.click();
    await expect(page).toHaveURL(/\/login$/);
});

test('checkout with an empty basket asks the customer to add products', async ({ loggedInPage: page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await expect(checkoutPage.error).toContainText('Your basket is empty. Add some products first.');
    await expect(checkoutPage.continueToPaymentLink).toBeHidden();
});

test('order review lists the basket items and totals', async ({ loggedInPage: page, api, customerToken, inStockProduct: product }) => {
    await api.addToBasket(customerToken, product.productId, 3);
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await expect(checkoutPage.heading).toBeVisible();
    await expect(checkoutPage.items).toHaveCount(1);
    const item = checkoutPage.item(product.name);
    await expect(item).toContainText('Quantity: 3');
    await expect(item).toContainText(`${formatGbp(product.price)} each`);
    await expect(item.locator('.checkout-item__subtotal')).toHaveText(formatGbp(product.price * 3));
    await expect(checkoutPage.summaryValue('Items')).toHaveText('3');
    await expect(checkoutPage.summaryValue('Subtotal')).toHaveText(formatGbp(product.price * 3));
    await expect(checkoutPage.summaryValue('Total')).toHaveText(formatGbp(product.price * 3));
});

test('order review links on to payment or back to shopping', async ({ loggedInPage: page, api, customerToken, inStockProduct: product }) => {
    await api.addToBasket(customerToken, product.productId, 1);
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await expect(checkoutPage.continueShoppingLink).toHaveAttribute('href', '/products');
    await checkoutPage.continueToPaymentLink.click();
    await expect(page).toHaveURL(/\/payment_gateway$/);
});
