import { APIRequestContext, APIResponse } from '@playwright/test';

export class LoginAPI {
    readonly request: APIRequestContext;
    readonly endpoint: string = '/notes/api/users/login';

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async login(email: string, password: string): Promise<APIResponse> {
        return await this.request.post(this.endpoint, {
            data: {
                email: email,
                password: password
            }
        });
    }
}