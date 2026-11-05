import { ADMIN_PASSWORD_MISSING, env } from '../../fixtures/env';
import { expect, test } from '../../fixtures/testFixtures';
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';
import { LoginPage } from '../../pages/LoginPage';

test('staff login rejects invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.gotoAdmin();
    await expect(loginPage.heading).toHaveText('Admin log in');
    await expect(loginPage.staffLoginLink).toBeHidden();

    await loginPage.loginAs('not-staff@example.com', 'WrongPassword!');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
});

test('signed-out visitor is sent to the staff login from the dashboard', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();

    await expect(page).toHaveURL(/\/admin\/login$/);
});

test('staff login returns to the admin page that was originally requested', async ({ page }) => {
    test.skip(!env.adminPassword, ADMIN_PASSWORD_MISSING);
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/login\?returnTo=%2Fadmin%2Fusers$/);

    const loginPage = new LoginPage(page);
    await loginPage.loginAs(env.adminEmail('Admin'), env.adminPassword);

    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByRole('heading', { name: 'User accounts' })).toBeVisible();
});

test('customer session is sent back to the shop from the admin portal', async ({ loggedInPage: page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();

    await expect(page).toHaveURL(/\/products$/);
});

test('super admin sees the dashboard with their name and summary cards', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin('SuperAdmin');
    const dashboard = new AdminDashboardPage(page);

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.nav.staffName).not.toBeEmpty();
    await expect(dashboard.statCard('Customers')).toBeVisible();
    await expect(dashboard.section('New registrations')).toBeVisible();
});

test('staff can move between the dashboard and users pages', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin('SuperAdmin');
    const dashboard = new AdminDashboardPage(page);
    await expect(dashboard.nav.link('Baskets')).toHaveAttribute('href', '/admin/baskets');

    await dashboard.nav.goTo('Users');
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(dashboard.nav.link('Users')).toHaveAttribute('aria-current', 'page');

    await dashboard.nav.goTo('Dashboard');
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.nav.link('Dashboard')).toHaveAttribute('aria-current', 'page');
});

test('staff can log out of the admin portal', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin('SuperAdmin');
    const dashboard = new AdminDashboardPage(page);
    await dashboard.nav.logout();

    await expect(page).toHaveURL(/\/login$/);
    await dashboard.goto();
    await expect(page).toHaveURL(/\/admin\/login/);
});
