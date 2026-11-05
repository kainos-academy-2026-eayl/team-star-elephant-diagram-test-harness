import type { ProductDetail, ProductSummary } from '../../api/backendApi';
import { expect, test } from '../../fixtures/testFixtures';

test('GET /products returns every product with its catalogue fields', async ({ api }) => {
    const response = await api.products();

    expect(response.status()).toBe(200);
    const products: ProductSummary[] = await response.json();
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
        expect(product).toEqual(expect.objectContaining({
            productId: expect.any(Number),
            name: expect.any(String),
            category: expect.any(String),
            description: expect.any(String),
            price: expect.any(Number),
            imageURL: expect.any(String),
        }));
        expect(product.price).toBeGreaterThan(0);
    }
    expect(new Set(products.map((p) => p.productId)).size).toBe(products.length);
});

test('GET /products/:id returns the product with its stock and images', async ({ api }) => {
    const [first]: ProductSummary[] = await (await api.products()).json();
    const response = await api.product(first.productId);

    expect(response.status()).toBe(200);
    const product: ProductDetail = await response.json();
    expect(product).toMatchObject({ productId: first.productId, name: first.name, price: first.price });
    expect(product.inventory.quantity).toEqual(expect.any(Number));
    expect(Array.isArray(product.images)).toBe(true);
});

test('GET /products/:id returns 404 for a product that does not exist', async ({ api }) => {
    const response = await api.product(999999999);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Product not found' });
});

for (const badId of ['abc', '0', '-1', '1.5']) {
    test(`GET /products/${badId} is rejected as an invalid product id`, async ({ api }) => {
        const response = await api.product(badId);

        expect(response.status()).toBe(400);
        expect((await response.json()).error).toBe('Invalid product ID');
    });
}
