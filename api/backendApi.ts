import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface CustomerDetails {
    forename: string;
    surname: string;
    email: string;
    password: string;
}

export interface BasketItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageURL?: string;
}

export interface Basket {
    items: BasketItem[];
    subtotal: number;
}

export interface ProductSummary {
    productId: number;
    name: string;
    category: string;
    description: string;
    price: number;
    imageURL: string;
}

export interface ProductDetail extends ProductSummary {
    images: { url: string; altText: string | null }[];
    inventory: { quantity: number };
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

// Thin client for the backend REST API (default http://localhost:3001), used for test set-up and API tests.
export class BackendApi {
    constructor(readonly request: APIRequestContext) {}

    register(customer: Partial<CustomerDetails>): Promise<APIResponse> {
        return this.request.post('/register', { data: customer });
    }

    login(email: string, password: string): Promise<APIResponse> {
        return this.request.post('/login', { data: { email, password } });
    }

    adminLogin(email: string, password: string): Promise<APIResponse> {
        return this.request.post('/admin/login', { data: { email, password } });
    }

    async customerToken(email: string, password: string): Promise<string> {
        return this.tokenFrom(await this.login(email, password), 'customer');
    }

    async adminToken(email: string, password: string): Promise<string> {
        return this.tokenFrom(await this.adminLogin(email, password), 'admin');
    }

    products(): Promise<APIResponse> {
        return this.request.get('/products');
    }

    product(id: number | string): Promise<APIResponse> {
        return this.request.get(`/products/${id}`);
    }

    profile(token?: string): Promise<APIResponse> {
        return this.request.get('/profile', { headers: token ? bearer(token) : {} });
    }

    basket(token?: string): Promise<APIResponse> {
        return this.request.get('/basket', { headers: token ? bearer(token) : {} });
    }

    addToBasket(token: string, productId: unknown, quantity: unknown): Promise<APIResponse> {
        return this.request.post('/basket', { headers: bearer(token), data: { productId, quantity } });
    }

    updateBasketItem(token: string, productId: number | string, quantity: unknown): Promise<APIResponse> {
        return this.request.patch(`/basket/items/${productId}`, { headers: bearer(token), data: { quantity } });
    }

    removeBasketItem(token: string, productId: number | string): Promise<APIResponse> {
        return this.request.delete(`/basket/items/${productId}`, { headers: bearer(token) });
    }

    refresh(): Promise<APIResponse> {
        return this.request.post('/auth/refresh');
    }

    logout(): Promise<APIResponse> {
        return this.request.post('/auth/logout');
    }

    forgotPassword(email: string): Promise<APIResponse> {
        return this.request.post('/forgot-password', { data: { email } });
    }

    resetPassword(token: string, password: string): Promise<APIResponse> {
        return this.request.post('/reset-password', { data: { token, password } });
    }

    adminGet(path: string, token?: string): Promise<APIResponse> {
        return this.request.get(path, { headers: token ? bearer(token) : {} });
    }

    adminPost(path: string, token?: string, data?: unknown): Promise<APIResponse> {
        return this.request.post(path, { headers: token ? bearer(token) : {}, ...(data === undefined ? {} : { data }) });
    }

    private async tokenFrom(response: APIResponse, kind: string): Promise<string> {
        if (!response.ok()) {
            throw new Error(`${kind} login failed with ${response.status()}: ${await response.text()}`);
        }
        const body = await response.json();
        return body.accessToken;
    }
}
