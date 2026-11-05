import type { Basket } from '../../api/backendApi';
import { expect, test } from '../../fixtures/testFixtures';

test('basket endpoints require a customer access token', async ({ api }) => {
    expect((await api.basket()).status()).toBe(401);
    expect((await api.basket('not-a-real-token')).status()).toBe(401);
    expect((await api.addToBasket('not-a-real-token', 1, 1)).status()).toBe(401);
});

test('a new customer starts with an empty basket', async ({ api, customerToken }) => {
    const response = await api.basket(customerToken);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ items: [], subtotal: 0 });
});

test('customer can add, update and remove a basket item', async ({ api, customerToken, inStockProduct: product }) => {
    const added = await api.addToBasket(customerToken, product.productId, 2);
    expect(added.status()).toBe(200);
    expect(((await added.json()) as Basket).items).toEqual([
        expect.objectContaining({ productId: product.productId, productName: product.name, quantity: 2, unitPrice: product.price }),
    ]);

    const updated = await api.updateBasketItem(customerToken, product.productId, 5);
    expect(updated.status()).toBe(200);
    const updatedBasket: Basket = await updated.json();
    expect(updatedBasket.items[0].quantity).toBe(5);
    expect(updatedBasket.subtotal).toBeCloseTo(product.price * 5, 2);

    const fetched: Basket = await (await api.basket(customerToken)).json();
    expect(fetched).toEqual(updatedBasket);

    const removed = await api.removeBasketItem(customerToken, product.productId);
    expect(removed.status()).toBe(200);
    expect(await removed.json()).toMatchObject({ items: [], subtotal: 0 });
});

test('adding a product that is already in the basket increases its quantity', async ({ api, customerToken, inStockProduct: product }) => {
    await api.addToBasket(customerToken, product.productId, 1);
    const response = await api.addToBasket(customerToken, product.productId, 2);

    const basket: Basket = await response.json();
    expect(basket.items).toHaveLength(1);
    expect(basket.items[0].quantity).toBe(3);
});

test('adding an unknown product returns 404', async ({ api, customerToken }) => {
    const response = await api.addToBasket(customerToken, 999999999, 1);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Product not found' });
});

for (const quantity of [0, -1, 1.5, 'two']) {
    test(`adding with an invalid quantity (${quantity}) is rejected`, async ({ api, customerToken, inStockProduct }) => {
        const response = await api.addToBasket(customerToken, inStockProduct.productId, quantity);

        expect(response.status()).toBe(400);
        expect((await response.json()).error).toBe('Invalid basket item');
    });
}

test('updating or removing an item that is not in the basket returns 404', async ({ api, customerToken, inStockProduct }) => {
    const update = await api.updateBasketItem(customerToken, inStockProduct.productId, 2);
    expect(update.status()).toBe(404);
    expect(await update.json()).toEqual({ error: 'Item not found in basket' });

    const remove = await api.removeBasketItem(customerToken, inStockProduct.productId);
    expect(remove.status()).toBe(404);
});

test('each customer only sees their own basket', async ({ api, customerToken, inStockProduct }) => {
    await api.addToBasket(customerToken, inStockProduct.productId, 1);
    const other = { email: `e2e-other-${Date.now()}@example.com`, password: 'Other-Passw0rd-1' };
    expect((await api.register({ forename: 'E2E', surname: 'Other', ...other })).status()).toBe(201);
    const otherToken = await api.customerToken(other.email, other.password);

    expect(await (await api.basket(otherToken)).json()).toMatchObject({ items: [], subtotal: 0 });
});
