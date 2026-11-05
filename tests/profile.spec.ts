import { expect, test } from '../fixtures/testFixtures';
import { ProfilePage } from '../pages/ProfilePage';

test('signed-out visitor is sent to log in from the account page', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    await expect(page).toHaveURL(/\/login$/);
});

test('signed-in customer sees their account details', async ({ loggedInPage: page, customer }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    await expect(profilePage.heading).toBeVisible();
    await expect(profilePage.detail('Name')).toHaveText(`${customer.forename} ${customer.surname}`);
    await expect(profilePage.detail('Email')).toHaveText(customer.email);
    await expect(profilePage.detail('Member since')).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
});

test('account page explains order history is not available yet', async ({ loggedInPage: page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    await expect(profilePage.ordersHeading).toBeVisible();
    await expect(profilePage.ordersStatus).toHaveText('Order history is not implemented yet.');
});
