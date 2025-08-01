---
title: How-To Guide
description: Step-by-step instructions for setting up Renumerate integrations and finding your brand keys
---

This guide will walk you through the essential setup steps for integrating Renumerate with your subscription business.

## How To Find Your Brand Private Key (X-Brand-Key)

Your Brand Private Key is required for API authentication when generating session IDs from your backend.

<video width="100%" autoplay muted loop>
  <source src="/secret-key.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


#### Step 1: Access Brand Settings

1. Go to [studio.renumerate.com](https://studio.renumerate.com)
2. In the top left corner, click on your **brand name** to open the dropdown
3. Select **"Brand Settings"** from the dropdown menu

#### Step 2: Reveal Your Private Key

1. Scroll down to the bottom of the Brand Settings page
2. Look for the **"Reveal Secret Key"** button
3. Click the button to display your private key
4. Copy the key for use in your backend API calls

#### Step 3: Secure Your Private Key

:::caution[Security Warning]
Your Brand Private Key should be kept secure and never exposed in client-side code. Always use it only in your backend server environment.
:::

**Best practices for key management:**

- Store the key in environment variables (e.g., `RENUMERATE_PRIVATE_KEY`)
- Never commit the key to version control
- Restrict access to the key to authorized team members only
- Rotate the key periodically for enhanced security

### Using Your Private Key

Include your private key in the `X-Brand-Key` header when making API requests:

```javascript
const response = await fetch("https://api.renumerate.com/v1/retention/session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Brand-Key": process.env.RENUMERATE_PRIVATE_KEY, // Your private key here
  },
  body: JSON.stringify(requestBody),
});
```

## How To Change Brand Colors

Customize the appearance of your retention flows and subscription hub to match your brand identity.

<video width="100%" autoplay muted loop>
  <source src="/brand-colors.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

#### Step 1: Access Brand Settings

1. Go to [studio.renumerate.com](https://studio.renumerate.com)
2. In the top left corner, click on your **brand name** to open the dropdown
3. Select **"Brand Settings"** from the dropdown menu

#### Step 2: Customize Your Colors

1. Scroll halfway down the Brand Settings page
2. You will see the **"Colors"** section with customizable color options
3. Update the colors to match your brand

#### Step 3: Apply Changes

:::tip[Instant Updates]
All color changes take effect immediately across your retention flows and subscription hub. No additional deployment or configuration is required.
:::

**What gets customized:**

- **Retention Flow modals** - Background, buttons, and text colors
- **Subscription Hub interface** - All UI elements match your brand
- **Cancel buttons** - Styled according to your color scheme

### Color Guidelines

For the best user experience, consider these recommendations:

- **Contrast**: Ensure sufficient contrast between text and background colors
- **Accessibility**: Choose colors that are accessible to users with visual impairments
- **Brand consistency**: Use colors that align with your existing brand guidelines
- **Readability**: Test colors across different devices and lighting conditions
