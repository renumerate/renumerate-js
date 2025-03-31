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
renumerate.mountCancelButton("elementId", "customerId", "classes", {
  options,
});
```

##### mountCancelButton Arguments

| key                    | type                | notes                                                          |
| ---------------------- | ------------------- | -------------------------------------------------------------- |
| elementId              | string              | The id for the container element                               |
| customerId             | string              | Your stripe customerId                                         |
| classes                | string \| undefined | Button classes (optional)                                      |
| options                | object \| undefined |                                                                |
| options.subscriptionId | string \| undefined | The specific subscription id (optional)                        |
| options.subscriberData | { string: any }     | Object of subscriber data (optional)                           |
| options.playbookId     | string \| undefined | Use a specific playbook instead of your default one (optional) |

#### Show Retention View

Show retention view gives you the control of where, when and how to invoke the Renumerate Cancellation Engine.

```typescript
renumerate.showRetentionView("customerId");
```

##### showRetentionView Arguments

| key                    | type                | notes                                                          |
| ---------------------- | ------------------- | -------------------------------------------------------------- |
| customerId             | string              | Your stripe customerId                                         |
| options                | object \| undefined |                                                                |
| options.subscriptionId | string \| undefined | The specific Stripe subscription id (optional)                 |
| options.subscriberData | { string: any }     | Object of subscriber data (optional)                           |
| options.playbookId     | string \| undefined | Use a specific playbook instead of your default one (optional) |

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

<CancelButton customerId={} subscriptionId={} subscriberData= {} playbookId = {}/>
```

##### CancelButton Arguments

| key            | type                | notes                                                          |
| -------------- | ------------------- | -------------------------------------------------------------- |
| customerId     | string              | Your stripe customerId                                         |
| subscriptionId | string \| undefined | The specific subscription id (optional)                        |
| subscriberData | { string: any }     | Object of subscriber data (optional)                           |
| playbookId     | string \| undefined | Use a specific playbook instead of your default one (optional) |

#### useRenumerate hook

If you're Peter Pan maybe stay away, otherwise the hook gives you full control over your renumerate retention workflow.

```typescript
import { useRenumerate } from "@renumerate/js/react";

export function CancelWidget({
  customerId,
  subscriptionId,
}: {
  customerId: string;
  subscriptionId: string | undefined;
}) {
  const { open } = useRenumerate({
    customerId: customerId,
    subscriptionId: subscriptionId,
  });

  return (
    <button onClick={open} className="btn btn-outline btn-primary mx-2">
      Cancel subscription
    </button>
  );
}
```

##### useRenumerate Arguments

| key            | type                | notes                                                          |
| -------------- | ------------------- | -------------------------------------------------------------- |
| customerId     | string              | Your stripe customerId                                         |
| subscriptionId | string \| undefined | The specific subscription id (optional)                        |
| subscriberData | { string: any }     | Object of subscriber data (optional)                           |
| playbookId     | string \| undefined | Use a specific playbook instead of your default one (optional) |

### Typescript support

If you like types we have types, all sorts of types. Those type definitions for @renumerate/js and @renumerate/js/react are built into the npm package. Type away :typingcat:
