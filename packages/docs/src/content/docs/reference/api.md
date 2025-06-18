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
| cancellation                 | object                      |                                         |
| cancellation.customer_id     | string \| undefined         | Your stripe customerId                  |
| cancellation.customer_email  | string \| undefined         | The customer's email address in stripe  |
| cancellation.subscription_id | string \| undefined         | The specific subscription id (optional) |
| cancellation.subscriberData  | { string: any } \ undefined | Object of subscriber data (optional)    |

Here's an example Node.js flow to obtain customer's session id:

```typescript
const privateKey = process.env.RENUMERATE_PRIVATE_KEY;

const requestBody = {
  cancellation: {
    customer_id: "cus_NffrFeUfNV2Hib", // Example stripe id
    subscription_id: "sub_1MowQVLkdIwHu7ixeRlqHVzs", // Your specific subscription
    subscriberData: {
      name: "John Doe",
      email: "john.doe@example.com",
    }, // Optional
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

const {
  session: { id },
} = await response.json();
```

#### Generating a SubscriptionHub session id

Subscription sessions allow you to present the SubscriptionHub widget to your customers to easily manage and view their subscriptions.

*Subscription sessions begin with `sub_`*

To generate a customer's session ID, make a POST request to `https://api.renumerate.com/v1/subscription/session` from your application's backend.

Ensure the following:

1. Include the `X-Brand-Key` header with your Brand's private key for authentication.
2. Pass the customer's ID and any other required parameters in the request body as specified by the API documentation.

This process securely creates a session ID for the customer cancellation flow.


**Request Body Parameters:**

When generating a SubscriptionHub session, you must include either the `customer_id` or `customer_email` (or both). Below is a table of all available parameters:

| key                          | type                | notes                                   |                                      |
| ---------------------------- | ------------------- | --------------------------------------- | ------------------------------------ |
| subscription                 | object              |                                         |                                      |
| subscription.customer_id     | string \| undefined | Your stripe customerId                  |                                      |
| subscription.customer_email  | string \| undefined | The customer's email address in stripe  |
| subscription.subscription_id | string \| undefined | The specific subscription id (optional) |                                      |

Here's an example Node.js flow to obtain customer's session id:

```typescript
const privateKey = process.env.RENUMERATE_PRIVATE_KEY;

const requestBody = {
  subscription: {
    customer_id: "cus_NffrFeUfNV2Hib", // Example stripe id
    subscription_id: "sub_1MowQVLkdIwHu7ixeRlqHVzs", // Your specific subscription
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

const {
  session: { id },
} = await response.json();
```