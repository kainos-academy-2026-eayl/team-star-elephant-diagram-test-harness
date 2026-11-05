import type { AdminRole } from '../../fixtures/env';
import { expect, test } from '../../fixtures/testFixtures';
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';
import { AdminUserDetailsPage, AdminUsersPage } from '../../pages/admin/AdminUsersPages';
import { LoginPage } from '../../pages/LoginPage';

// Mirrors ROLE_PERMISSIONS in the backend's src/models/adminRoles.ts; every action is shown as "(Unavailable)" for now.
const QUICK_ACTIONS: Record<AdminRole, string[]> = {
    SuperAdmin: [
        'Suspend or reactivate customers',
        'Update order status',
        'Add product',
        'Update finance records',
        'Manage admin accounts',
        'Manage permissions',
    ],
    Admin: ['Suspend or reactivate customers', 'Update order status'],
    InventoryManager: ['Add product'],
    FinanceManager: ['Update finance records'],
    CustomerService: [],
};

for (const [role, actions] of Object.entries(QUICK_ACTIONS) as [AdminRole, string[]][]) {
    test(`${role} dashboard only offers the quick actions their role allows`, async ({ page, loginAsAdmin }) => {
        await loginAsAdmin(role);
        const dashboard = new AdminDashboardPage(page);

        await expect(dashboard.heading).toBeVisible();
        await expect(dashboard.quickActions).toHaveText(actions.map((action) => `${action} (Unavailable)`));
    });
}

test('roles without user access are refused the user list', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin('InventoryManager');
    await new AdminUsersPage(page).goto();

    await expect(page).toHaveURL(/\/admin\/login\?reason=forbidden$/);
    await expect(new LoginPage(page).alert).toHaveText('You need a staff account to access that page.');
});

test('roles without basket access are refused the basket list', async ({ page, loginAsAdmin }) => {
    test.fail(true, 'Known bug: /admin/baskets pages send cookies instead of an Authorization header, so signed-in admins get 401');
    await loginAsAdmin('FinanceManager');
    const response = await page.goto('/admin/baskets');

    expect(response?.status()).toBe(403);
});

test('customer service can view users but cannot suspend them', async ({ page, loginAsAdmin, customer, api }) => {
    await loginAsAdmin('CustomerService');
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto(customer.email);
    await usersPage.viewDetails(customer.email);

    await new AdminUserDetailsPage(page).suspendButton.click();

    await expect(page).toHaveURL(/\/admin\/login\?reason=forbidden$/);
    expect((await api.login(customer.email, customer.password)).status()).toBe(200);
});
