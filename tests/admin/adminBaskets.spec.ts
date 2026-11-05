import { expect, formatGbp, test } from '../../fixtures/testFixtures';
import { AdminBasketDetailsPage, AdminBasketsPage } from '../../pages/admin/AdminBasketsPages';

test('customer service can find an active basket and see its contents', async ({ page, loginAsAdmin, customer, customerToken, api, inStockProduct: product }) => {
    test.fail(true, 'Known bug: /admin/baskets pages send cookies instead of an Authorization header, so signed-in admins get 401');
    await api.addToBasket(customerToken, product.productId, 2);
    await loginAsAdmin('CustomerService');

    const basketsPage = new AdminBasketsPage(page);
    await basketsPage.goto();
    await expect(basketsPage.heading).toBeVisible();
    await basketsPage.search(customer.email);

    const row = basketsPage.row(customer.email);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(`${customer.forename} ${customer.surname}`);
    await expect(row).toContainText(formatGbp(product.price * 2));
    await expect(row).toContainText('Active');

    await basketsPage.viewBasket(customer.email);
    const details = new AdminBasketDetailsPage(page);
    await expect(details.heading).toHaveText(/^Basket #\d+$/);
    await expect(details.detail('Email')).toHaveText(customer.email);
    await expect(details.contentRows).toHaveCount(1);
    await expect(details.contentRows).toContainText(product.name);
    await expect(details.detail('Total items')).toHaveText('2');

    await details.backLink.click();
    await expect(page).toHaveURL(/\/admin\/baskets$/);
});

test('basket search with no matches offers to clear the search', async ({ page, loginAsAdmin }) => {
    test.fail(true, 'Known bug: /admin/baskets pages send cookies instead of an Authorization header, so signed-in admins get 401');
    await loginAsAdmin('CustomerService');
    const basketsPage = new AdminBasketsPage(page);
    await basketsPage.goto('nobody-matches-this-search');

    await expect(basketsPage.emptyMessage).toContainText('No baskets match "nobody-matches-this-search".');
    await basketsPage.clearSearchLink.click();
    await expect(page).toHaveURL(/\/admin\/baskets$/);
});

test('unknown basket id shows a not found page', async ({ page, loginAsAdmin }) => {
    test.fail(true, 'Known bug: /admin/baskets pages send cookies instead of an Authorization header, so signed-in admins get 401');
    await loginAsAdmin('CustomerService');
    const details = new AdminBasketDetailsPage(page);
    const response = await details.goto(999999999);

    expect(response?.status()).toBe(404);
    await expect(details.notFoundHeading).toBeVisible();
});
