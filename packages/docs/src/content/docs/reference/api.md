---
title: API Reference
description: Renumerates API
---

#### Generating a retention session id

Retention sessions allow you to present a retention workflow when a customer goes to cancel their subscription. This sessionId can be passed into the showRetentionView or cancelButton functions.

*Retention sessions begin with `ret_`*

To generate a customer's session ID, make a POST request to `https://api.renumerate.com/v1/retention/session` from your application's backend.

Ensure the following:

1. Include the `X-Brand-Key` header with your Brand's private key for authentication.
2. Pass the customer's ID and any other required parameters in the request body as specified by the API documentation.

This process securely creates a session ID for the customer cancellation flow.

**Request Body Parameters:**

When generating a retention session, you must include either the `customer_id` or `customer_email` (or both). Below is a table of all available parameters:

| key                          | type                        | notes                                   |
| ---------------------------- | --------------------------- | --------------------------------------- |
| retention                 | object                      |                                         |
| retention.customer_id     | string \| undefined         | Your stripe customer ID                 |
| retention.customer_email  | string \| undefined         | Customer email (alternative to customer_id) |
| retention.subscription_id | string \| undefined         | The specific subscription id (optional) |

Here's an example Node.js flow to obtain customer's session id:

```typescript
const privateKey = process.env.RENUMERATE_PRIVATE_KEY;

const requestBody = {
  retention: {
    customer_id: "cus_NffrFeUfNV2Hib", // Example stripe id
    // OR use customer_email instead:
    // customer_email: "john.doe@example.com",
    subscription_id: "sub_1MowQVLkdIwHu7ixeRlqHVzs", // Optional: specific subscription
  },
};

const response = await fetch("https://api.renumerate.com/v1/retention/session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Brand-Key": privateKey,
  },
  body: JSON.stringify(requestBody),
});

const { id } = await response.json();
```

#### Generating a SubscriptionHub session id

Subscription sessions allow you to present the SubscriptionHub widget to your customers to easily manage and view their subscriptions.

*Subscription sessions begin with `sub_`*

To generate a customer's session ID, make a POST request to `https://api.renumerate.com/v1/subscription/session` from your application's backend.

Ensure the following:

1. Include the `X-Brand-Key` header with your Brand's private key for authentication.
2. Pass the customer's ID and any other required parameters in the request body as specified by the API documentation.

This process securely creates a session ID for the subscription management flow.

**Request Body Parameters:**

When generating a SubscriptionHub session, you must include either the `customer_id` or `customer_email` (or both). Below is a table of all available parameters:

| key                      | type                | notes                                   |
| ------------------------ | ------------------- | --------------------------------------- |
| subscription             | object              |                                         |
| subscription.customer_id | string \| undefined | Your stripe customer ID                 |
| subscription.customer_email | string \| undefined | Customer email (alternative to customer_id) |

Here's an example Node.js flow to obtain customer's session id:

```typescript
const privateKey = process.env.RENUMERATE_PRIVATE_KEY;

const requestBody = {
  subscription: {
    customer_id: "cus_NffrFeUfNV2Hib", // Example stripe id
    // OR use customer_email instead:
    // customer_email: "john.doe@example.com"
  },
};

const response = await fetch("https://api.renumerate.com/v1/subscription/session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Brand-Key": privateKey,
  },
  body: JSON.stringify(requestBody),
});

const { id } = await response.json();
```

#### API Responses

**Retention Session Response:**
```json
{
  "id": "ret_gLDTK1oiejL-GsltN_9RMfdZGh4OyJPuaH1E-zKPCe4294_hcnG0J9fz3hK-L-0SwzvUnstB6MsKQlvgKtD6tyyN4SlFJUJ6GThmiv6YwlGN7NlIog=="
}
```

**Subscription Session Response:**
```json
{
  "id": "sub__FZ1PXM7vi3xH6pU4JgMz82zKa1r1z0wCF-kXIYrkjFdZ4NqpwfQ0kg2c1gw5zV0bf_0hlxwvzuwOxm14meKax1oDBZkXnU3cUfanwsGZ3JkHW40wAWURaqRg16z"
}
```