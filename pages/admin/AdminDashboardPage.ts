import { type Locator, type Page } from '@playwright/test';

// Shared admin header: brand, Dashboard/Users/Baskets links, staff name and log out, inside a collapsible dropdown.
export class AdminNav {
    readonly menuButton: Locator;
    readonly links: Locator;
    readonly staffName: Locator;
    readonly logoutButton: Locator;
    readonly unavailableSections: Locator;

    constructor(private readonly page: Page) {
        this.menuButton = page.locator('label.menu-button');
        this.links = page.locator('.category-links a');
        this.staffName = page.locator('.staff-name');
        this.logoutButton = page.getByRole('button', { name: 'Log out' });
        this.unavailableSections = page.locator('.category-links .unavailable-link');
    }

    // Located by text rather than role so the link is found even while the dropdown is collapsed.
    link(name: 'Dashboard' | 'Users' | 'Baskets'): Locator {
        return this.links.filter({ hasText: new RegExp(`^${name}$`) });
    }

    async open() {
        if (!(await this.link('Dashboard').isVisible())) {
            await this.menuButton.click();
        }
    }

    async goTo(name: 'Dashboard' | 'Users' | 'Baskets') {
        await this.open();
        await this.link(name).click();
    }

    async logout() {
        await this.open();
        await this.logoutButton.click();
    }
}

export class AdminDashboardPage {
    readonly nav: AdminNav;
    readonly heading: Locator;
    readonly error: Locator;
    readonly quickActions: Locator;
    readonly statCards: Locator;

    constructor(private readonly page: Page) {
        this.nav = new AdminNav(page);
        this.heading = page.getByRole('heading', { name: 'Admin dashboard' });
        this.error = page.locator('main .error-message');
        this.quickActions = page.getByRole('region', { name: 'Quick actions' }).locator('.action-button');
        this.statCards = page.locator('.stat-card');
    }

    async goto() { return this.page.goto('/admin'); }

    statCard(label: string): Locator {
        return this.statCards.filter({ has: this.page.getByRole('heading', { name: label, exact: true }) });
    }

    section(name: 'Latest orders' | 'New registrations' | 'Recent stock changes'): Locator {
        return this.page.getByRole('heading', { name, exact: true });
    }
}
