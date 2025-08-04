---
title: Retention Flow (Cancel Button)
description: Learn how to implement retention workflows
---

<video width="100%" autoplay muted loop>
  <source src="/cancel-button.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

The cancel button is the quickest way to get started with the Renumerate Retention Engine. The cancel button will render a button to the container and manage the entire retention workflow.

## Implementation

### TypeScript/Javascript
You can display the retention modal in two ways:

1. **Using the Cancel Button**:  
  The `mountCancelButton` function automatically handles the retention workflow when the button is clicked. This is the simplest way to integrate the retention modal.

  ```typescript
  renumerate.mountCancelButton("elementId", "sessionId", "classes");
  ```

2. **Directly Invoking the Retention View**:  
  If you want more control over when and where the retention modal appears, you can use the `showRetentionView` function. This allows you to trigger the modal programmatically.

  ```typescript
  renumerate.showRetentionView("sessionId");
  ```

##### mountCancelButton Arguments

| key       | type                | notes                            |
| --------- | ------------------- | -------------------------------- |
| elementId | string              | The id for the container element |
| sessionId | string              | Your customer's session id       |
| classes   | string \| undefined | Button classes (optional)        |

### React

For React applications, Renumerate provides components and hooks that integrate seamlessly with your existing React workflow.

#### Basic Setup

All Renumerate React components must be wrapped in a `RenumerateProvider` to access the Renumerate instance:

```tsx
import React from 'react';
import { RenumerateProvider, CancelButton } from '@renumerate/js/react';

function MyComponent() {
  const sessionId = "ret_example123"; 
  // Get this from your backend
  // The "Generating a Retention Session Id" section will show you how

  return (
    <RenumerateProvider config={{ publicKey: 'your-public-key' }}>
        {/* Default styled cancel button */}
        <CancelButton sessionId={sessionId} />
        
        {/* Custom styling cancel button */}
        <CancelButton 
          sessionId={sessionId}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        />
    </RenumerateProvider>
  );
}
```

#### Using the useRenumerate Hook
For more control over when and how the retention flow is triggered, use the `useRenumerate` hook:
```tsx
import React from 'react';
import { RenumerateProvider, useRenumerate } from '@renumerate/js/react';

function CustomCancelComponent({ sessionId }: { sessionId: string }) {
  const { open } = useRenumerate({ sessionId });

  const handleCancelClick = () => {
    // You can add custom logic here before opening the retention flow
    if (confirm('Are you sure you want to cancel your subscription?')) {
      open();
    }
  };

  return (
    <button 
      onClick={handleCancelClick}
      className="cancel-subscription-btn"
    >
      Cancel My Subscription
    </button>
  );
}

function App() {
  const sessionId = "ret_example123";

  return (
    <RenumerateProvider config={{ publicKey: 'your-public-key' }}>
      <CustomCancelComponent sessionId={sessionId} />
    </RenumerateProvider>
  );
}
```

### Generating a Retention Session Id

Retention sessions allow you to present a retention workflow when a customer goes to cancel their subscription. This sessionId can be passed into the showRetentionView or cancelButton functions.

*Retention sessions begin with `ret_`*

To generate a customer's session ID, make a POST request to `https://api.renumerate.com/v1/retention/session` from your application's backend.

Ensure the following:

1. Include the `X-Brand-Key` header with your Brand's private key for authentication. See the [Where To Find Private Key](../how-to/#how-to-find-your-brand-private-key-x-brand-key) section.
2. Pass the customer's ID and any other required parameters in the request body as specified by the API documentation.

This process securely creates a session ID for the customer cancellation flow.

**Request Body Parameters:**

When generating a retention session, you must include either the `customer_id` or `customer_email` (or both). Below is a table of all available parameters:

| key                          | type                        | notes                                   |
| ---------------------------- | --------------------------- | --------------------------------------- |
| retention                 | object                      |                                         |
| retention.customer_id     | string \| undefined         | Your stripe customerId                  |
| retention.customer_email  | string \| undefined         | The customer's email address in stripe  |
| retention.subscription_id | string \| undefined         | The specific subscription id (optional) |

### Backend Example
Node.js/TypeScript

```typescript
const privateKey = process.env.RENUMERATE_PRIVATE_KEY;

const requestBody = {
  retention: {
    customer_id: "cus_NffrFeUfNV2Hib", // Example stripe id
    subscription_id: "sub_1MowQVLkdIwHu7ixeRlqHVzs", // Your specific subscription
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