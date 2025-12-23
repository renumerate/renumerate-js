# @renumerate/js

Official JavaScript SDK for [Renumerate](https://renumerate.com) - AI-powered subscription retention.

## Installation

```bash
npm install @renumerate/js
```

## Quick Start

### 1. Create a backend endpoint for handshake tokens

The SDK requires HMAC-signed handshake tokens for authentication. Create an endpoint on your backend:

```typescript
// Node.js/Express example
import crypto from 'crypto';

const publicKey = process.env.RENUMERATE_PUBLIC_KEY;   // pk_live_xxx
const privateKey = process.env.RENUMERATE_PRIVATE_KEY; // sk_live_xxx

function createHandshakeToken(subscriberId: string): string {
  const payload = {
    brandPub: publicKey,
    subscriberId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', privateKey)
    .update(Buffer.from(payloadBase64, 'base64url'))
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

app.get('/api/renumerate-token', (req, res) => {
  const subscriberId = req.user.stripeCustomerId;
  res.json({ token: createHandshakeToken(subscriberId) });
});
```

### 2. Initialize the SDK

#### React

```tsx
import { RenumerateProvider, SubscriptionHub, CancelButton } from '@renumerate/js/react';

async function getAuthToken() {
  const response = await fetch('/api/renumerate-token');
  const { token } = await response.json();
  return token;
}

function App() {
  return (
    <RenumerateProvider config={{ getAuthToken }}>
      {/* Full subscription management portal */}
      <SubscriptionHub />

      {/* Or just a cancel button */}
      <CancelButton />
    </RenumerateProvider>
  );
}
```

#### Vanilla JavaScript

```typescript
import { Renumerate } from '@renumerate/js';

const renumerate = new Renumerate({
  getAuthToken: async () => {
    const response = await fetch('/api/renumerate-token');
    const { token } = await response.json();
    return token;
  }
});

// Mount subscription hub
await renumerate.mountSubscriptionHub('container-id');

// Or show retention modal
await renumerate.showRetentionView();
```

## Documentation

Full documentation at [renumerate.com/docs](https://renumerate.com/docs)

## API Reference

### Configuration

| Option        | Type                    | Required | Description                                    |
|---------------|-------------------------|----------|------------------------------------------------|
| getAuthToken  | `() => Promise<string>` | Yes      | Returns handshake token from your backend      |
| debug         | `boolean`               | No       | Enable debug logging                           |
| fallbackEmail | `string`                | No       | Support email shown on service failures        |
| callbacks     | `CallbackOptions`       | No       | Default callbacks for all flows                |

### React Components

- `<RenumerateProvider>` - Context provider (required)
- `<SubscriptionHub>` - Full subscription management widget
- `<CancelButton>` - Cancel button with retention flow

### React Hooks

- `useRenumerate({ subscriptionId?, callbacks? })` - Returns `{ open, isReady }`
- `useRenumerateContext()` - Returns `{ session, isSessionLoading, sessionError, refreshSession }`

### Vanilla JS Methods

- `mountSubscriptionHub(elementId, wrapperClasses?, iframeClasses?, callbacks?)`
- `mountCancelButton(elementId, options?)`
- `showRetentionView(subscriptionId?, callbacks?)`
- `getSession()` - Get or establish session
- `refreshSession()` - Force refresh session
- `clearSession()` - Clear cached session

## License

MIT
