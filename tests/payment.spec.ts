import { expect, test } from '../fixtures/testFixtures';
import { PaymentPage, VALID_ADDRESS, VALID_CARD } from '../pages/PaymentPage';

test('signed-out shopper is asked to log in to pay', async ({ page }) => {
    const paymentPage = new PaymentPage(page);
    const response = await paymentPage.goto();

    expect(response?.status()).toBe(401);
    await expect(paymentPage.error).toContainText('Please log in to complete payment.');
    await expect(paymentPage.loginLink).toBeVisible();
});

test('signed-in customer with items can open the payment page', async ({ loggedInPage: page, api, customerToken, inStockProduct }) => {
    test.fail(true, 'Known bug: /payment_gateway only accepts an Authorization header, which browsers never send, so signed-in customers are told to log in');
    await api.addToBasket(customerToken, inStockProduct.productId, 1);

    const paymentPage = new PaymentPage(page);
    const response = await paymentPage.goto();

    expect(response?.status()).toBe(200);
    await expect(paymentPage.error).toBeHidden();
    await expect(paymentPage.form).toBeVisible();
});

test('payment form requires the card and shipping fields', async ({ page }) => {
    const paymentPage = new PaymentPage(page);
    await paymentPage.goto();
    await paymentPage.submit();

    await expect(page).toHaveURL(/\/payment_gateway$/);
    await expect(page.getByLabel('Name on card')).toHaveJSProperty('validity.valueMissing', true);
});

for (const { field, value, message } of [
    { field: 'cardNumber', value: '1234', message: 'Please enter a valid card number.' },
    { field: 'expiry', value: '1230', message: 'Please enter a valid expiry date (MM/YY).' },
    { field: 'cvc', value: '12', message: 'Please enter a valid security code.' },
] as const) {
    test(`payment is rejected with an invalid ${field}`, async ({ page }) => {
        const paymentPage = new PaymentPage(page);
        await paymentPage.goto();
        await paymentPage.fillCard({ ...VALID_CARD, [field]: value });
        await paymentPage.fillAddress(VALID_ADDRESS);
        await paymentPage.submit();

        await expect(paymentPage.error).toContainText(message);
        await expect(paymentPage.success).toBeHidden();
    });
}

test('valid payment details show the payment is processing', async ({ page }) => {
    test.fail(true, 'Known bug: the controller renders `paymentResult` but payment_gateway.njk reads `payment`, so the success message never appears');
    const paymentPage = new PaymentPage(page);
    await paymentPage.goto();
    await paymentPage.fillCard(VALID_CARD);
    await paymentPage.fillAddress(VALID_ADDRESS);
    await paymentPage.submit();

    await expect(paymentPage.success).toContainText('Payment is being processed. Please do not refresh the page.', { timeout: 5000 });
});

test('payment page links back to the order review', async ({ page }) => {
    const paymentPage = new PaymentPage(page);
    await paymentPage.goto();

    await expect(paymentPage.backToOrderLink).toHaveAttribute('href', '/checkout');
});
