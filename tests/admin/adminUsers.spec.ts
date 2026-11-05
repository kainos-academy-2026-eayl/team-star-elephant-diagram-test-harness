import { expect, test } from '../../fixtures/testFixtures';
import { AdminUserDetailsPage, AdminUsersPage } from '../../pages/admin/AdminUsersPages';

test('admin can find a customer by email and view their details', async ({ page, loginAsAdmin, customer }) => {
    await loginAsAdmin('Admin');
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto();
    await expect(usersPage.heading).toBeVisible();

    await usersPage.search(customer.email);
    await expect(usersPage.rows).toHaveCount(1);
    const row = usersPage.row(customer.email);
    await expect(row).toContainText(`${customer.forename} ${customer.surname}`);
    await expect(row).toContainText('Active');

    await usersPage.viewDetails(customer.email);
    const details = new AdminUserDetailsPage(page);
    await expect(details.heading).toHaveText(`${customer.forename} ${customer.surname}`);
    await expect(details.detail('Email')).toHaveText(customer.email);
    await expect(details.detail('Account status')).toHaveText('Active');
    await expect(details.recentOrders).toContainText('No orders yet.');
    await expect(details.currentBasket).toContainText('The basket is empty.');

    await details.backLink.click();
    await expect(page).toHaveURL(/\/admin\/users$/);
});

test('user search with no matches says so', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin('Admin');
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto('nobody-matches-this-search');

    await expect(usersPage.emptyMessage).toHaveText('No users match "nobody-matches-this-search".');
});

test('admin can suspend a customer, who can then no longer log in, and reactivate them', async ({ page, loginAsAdmin, customer, api }) => {
    await loginAsAdmin('Admin');
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto(customer.email);
    await usersPage.viewDetails(customer.email);
    const details = new AdminUserDetailsPage(page);

    await details.suspendButton.click();
    await expect(page).toHaveURL(/\?updated=suspended$/);
    await expect(details.successMessage).toHaveText('The account has been suspended.');
    await expect(details.detail('Account status')).toHaveText('Suspended');
    expect((await api.login(customer.email, customer.password)).status()).toBe(401);

    await details.reactivateButton.click();
    await expect(page).toHaveURL(/\?updated=reactivated$/);
    await expect(details.successMessage).toHaveText('The account has been reactivated.');
    await expect(details.detail('Account status')).toHaveText('Active');
    expect((await api.login(customer.email, customer.password)).status()).toBe(200);
});

test('user details show what is in the customer basket', async ({ page, loginAsAdmin, customer, customerToken, api, inStockProduct }) => {
    await api.addToBasket(customerToken, inStockProduct.productId, 2);
    await loginAsAdmin('Admin');
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto(customer.email);
    await usersPage.viewDetails(customer.email);

    const basket = new AdminUserDetailsPage(page).currentBasket;
    await expect(basket.locator('tbody tr')).toHaveCount(1);
    await expect(basket.locator('tbody tr')).toContainText(inStockProduct.name);
    await expect(basket.locator('tbody tr')).toContainText('2');
});

test('unknown user id shows a not found page', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin('Admin');
    const details = new AdminUserDetailsPage(page);
    const response = await details.goto(999999999);

    expect(response?.status()).toBe(404);
    await expect(details.notFoundHeading).toBeVisible();
});
