import { type Locator, type Page } from '@playwright/test';

export interface CardDetails {
    nameOnCard: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
}

export interface ShippingDetails {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
}

export const VALID_CARD: CardDetails = {
    nameOnCard: 'Test Customer',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
};

export const VALID_ADDRESS: ShippingDetails = {
    fullName: 'Test Customer',
    addressLine1: '1 Test Street',
    city: 'Belfast',
    postcode: 'BT1 1AA',
};

export class PaymentPage {
    readonly heading: Locator;
    readonly error: Locator;
    readonly loginLink: Locator;
    readonly success: Locator;
    readonly form: Locator;
    readonly submitButton: Locator;
    readonly backToOrderLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Payment', exact: true });
        this.error = page.locator('.payment-error');
        this.loginLink = page.getByRole('link', { name: 'Log in to your account' });
        this.success = page.locator('.payment-success');
        this.form = page.locator('#paymentForm');
        this.submitButton = page.getByRole('button', { name: 'Submit payment' });
        this.backToOrderLink = page.getByRole('link', { name: 'Back to order' });
    }

    async goto() { return this.page.goto('/payment_gateway'); }

    async fillCard(card: CardDetails) {
        await this.page.getByLabel('Name on card').fill(card.nameOnCard);
        await this.page.getByLabel('Card number').fill(card.cardNumber);
        await this.page.getByLabel('Expiry date').fill(card.expiry);
        await this.page.getByLabel('Security code').fill(card.cvc);
    }

    async fillAddress(address: ShippingDetails) {
        await this.page.getByLabel('Full name').fill(address.fullName);
        await this.page.getByLabel('Street address').fill(address.addressLine1);
        if (address.addressLine2) {
            await this.page.getByLabel('Apartment, suite, etc. (optional)').fill(address.addressLine2);
        }
        await this.page.getByLabel('City').fill(address.city);
        await this.page.getByLabel('Postcode').fill(address.postcode);
    }

    async submit() { await this.submitButton.click(); }
}
