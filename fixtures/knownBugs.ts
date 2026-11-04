// App bugs found by the end-to-end suite. Tests that hit one are marked with test.fail(true, ...), so they pass while the
// bug exists and Playwright reports "expected to fail" once it is fixed; then remove the test.fail line.
export const KNOWN_BUGS = {
    paymentPageNeedsAuthHeader:
        'Known bug: /payment_gateway only accepts an Authorization header, which browsers never send, so signed-in customers are told to log in',
    paymentSuccessNotShown:
        'Known bug: the controller renders `paymentResult` but payment_gateway.njk reads `payment`, so the success message never appears',
    adminBasketsSendCookies:
        'Known bug: /admin/baskets pages send cookies instead of an Authorization header, so signed-in admins get 401',
} as const;
