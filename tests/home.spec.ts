import { expect, test } from '../fixtures/testFixtures';
import { HomePage } from '../pages/HomePage';

test('home page shows the shop header, featured carousel and highlights', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.brandLink).toBeVisible();
    await expect(homePage.carousel.locator('.carousel__slide')).toHaveCount(3);
    await expect(homePage.highlights.locator('a.tile')).toHaveCount(6);
    await expect(homePage.basketBadge).toBeHidden();
});

test('searching from the home page opens matching products', async ({ page, inStockProduct }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.search(inStockProduct.name);

    await expect(page).toHaveURL(/\/products\?q=/);
    await expect(page.locator('.product-card__title')).toContainText([inStockProduct.name]);
});

test('side menu opens, links to the account and basket, and closes', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.openMenuButton.click();
    await expect(homePage.menu).toBeVisible();
    await expect(homePage.menu.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/profile');
    await expect(homePage.menu.getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/basket');

    await homePage.closeMenuButton.click();
    await expect(homePage.menu).toBeHidden();
});

test('basket badge shows how many items a signed-in customer has', async ({ api, customerToken, inStockProduct, loggedInPage: page }) => {
    expect((await api.addToBasket(customerToken, inStockProduct.productId, 3)).ok()).toBe(true);

    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.basketBadge).toHaveText('3');
    await expect(homePage.basketLink).toHaveAttribute('aria-label', 'Basket, 3 items');
    await homePage.basketLink.click();
    await expect(page).toHaveURL(/\/basket$/);
});
