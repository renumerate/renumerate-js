# @renumerate/js

Javascript browser library for [renumerate.com](https://renumerate.com)

Exposes direct library class and vanilla javascript functions along with optional React hook and components for integrating Renumerates retention view workflow.

## Compatibility

React 17+

## Install

With npm:

```bash
npm install --save @renumerate/js
```

## Documentation

### Generating SessionId's

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
| cancellation.customer_email  | string \| undefined | The customer's email address in stripe  |
| subscription.subscription_id | string \| undefined | The specific subscription id (optional) |                                      |

Here's an example Node.js flow to obtain customer's session id:

```typescript
const privateKey = process.env.RENUMERATE_PRIVATE_KEY;

const requestBody = {
  cancellation: {
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

### Javascript/Typescript

For the fearless, for the free, for those who like to live life outside of a framework.

```typescript
import { Renumerate } from "@renumerate/js";

const renumerate = new Renumerate({
  publicKey: "test",
});
```

##### Renumerate class arguments

| key       | type    | notes                                          |
| --------- | ------- | ---------------------------------------------- |
| publicKey | string  | Get this from your brand settings page         |
| debug     | boolean | Default: false, whether you want debug logging |


#### Cancel Button

The cancel button is the quickest way to get started with the Renumerate Retention Engine. The cancel button will render a button to the container and manage the entire retention workflow.

```typescript
renumerate.mountCancelButton("elementId", "sessionId", "classes");
```

##### mountCancelButton Arguments

| key       | type                | notes                            |
| --------- | ------------------- | -------------------------------- |
| elementId | string              | The id for the container element |
| sessionId | string              | Your customer's session id       |
| classes   | string \| undefined | Button classes (optional)        |

#### Show Retention View

Show retention view gives you the control of where, when and how to invoke the Renumerate Cancellation Engine.

```typescript
renumerate.showRetentionView("sessionId");
```

##### showRetentionView Arguments

| key       | type   | notes                      |
| --------- | ------ | -------------------------- |
| sessionId | string | Your customer's session id |

#### SubscriptionHub

The SubscriptionHub is the quickest way to get started with SubscriptionManagement. The SubscriptionHub will render a subscription management widget to the container and manage the entire subscription management and retention workflow.

```typescript
renumerate.mountSubscriptionHub("elementId", "sessionId", "classes");
```

##### mountSubscriptionHub Arguments

| key       | type                | notes                                    |
| --------- | ------------------- | ---------------------------------------- |
| elementId | string              | The id for the container element         |
| sessionId | string              | Your customer's subscription session id  |
| classes   | string \| undefined | Button classes (optional)                |

### React

For those who `<React />` this one's for you. Here's how to get your retention view.

Everything in the react library requires the components to be wrapped in a RenumerateProvider.

```typescript
import { RenumerateProvider } from "@renumerate/js/react";

<RenumerateProvider
  config={{
    publicKey: "test",
  }}
>{ retainYourCustomers }</RenumerateProvider>
```

##### RenumerateProvider config arguments

| key       | type    | notes                                          |
| --------- | ------- | ---------------------------------------------- |
| publicKey | string  | Get this from your brand settings page         |
| debug     | boolean | Default: false, whether you want debug logging |

#### Cancel Button

The easiest way to get started with the Renumerate Retention Engine.

```typescript
import { CancelButton } from "@renumerate/js/react";

<CancelButton sessionId={customersSessionId} />
```

##### CancelButton Arguments

| key       | type                | notes                      |
| --------- | ------------------- | -------------------------- |
| sessionId | string              | Your customer's session id |
| className | string \| undefined | Optional className         |

#### SubscriptionHub

The easiest way to setup a subscription management widget.

```typescript
import { SubscriptionHub } from "@renumerate/js/react";

<SubscriptionHub sessionId={customersSessionId} />
```

##### SubscriptionHub Arguments

| key       | type                | notes                      |
| --------- | ------------------- | -------------------------- |
| sessionId | string              | Your customer's session id |
| className | string \| undefined | Optional className         |

#### useRenumerate hook

If you're Peter Pan maybe stay away, otherwise the hook gives you full control over your renumerate retention workflow.

```typescript
import { useRenumerate } from "@renumerate/js/react";

export function CancelWidget({
  sessionId,
}: {
  sessionId: string;
}) {
  const { open } = useRenumerate({
    sessionId,
  });

  return (
    <button onClick={open} className="btn btn-outline btn-primary mx-2">
      Cancel subscription
    </button>
  );
}
```

##### useRenumerate Arguments

| key       | type   | notes                      |
| --------- | ------ | -------------------------- |
| sessionId | string | Your customer's session id |

### Typescript support

If you like types we have types, all sorts of types. Those type definitions for @renumerate/js and @renumerate/js/react are built into the npm package. Type away :typingcat:
