# Memberstack DOM Package Reference

Frontend JavaScript SDK for Memberstack. Use in browser environments.

## Table of Contents
- [Installation](#installation)
- [Initialization](#initialization)
- [Member Management](#member-management)
- [Authentication](#authentication)
- [Modals](#modals)
- [Billing & Checkout](#billing--checkout)
- [Plans](#plans)
- [Member JSON](#member-json)
- [Events](#events)

---

## Installation

```bash
npm install @memberstack/dom
# or
yarn add @memberstack/dom
```

**Webflow**: Use the global variable `window.$memberstackDom` (automatically available).

---

## Initialization

```js
// NPM/Yarn
import memberstackDOM from "@memberstack/dom";
const memberstack = memberstackDOM.init({
  publicKey: "pk_..."
});

// Webflow
const memberstack = window.$memberstackDom;
```

---

## Member Management

### getCurrentMember()
Get the logged-in member's data.

```js
const { data: member } = await memberstack.getCurrentMember();

if (member) {
  console.log(member.id);           // mem_xxx
  console.log(member.auth.email);   // user@example.com
  console.log(member.customFields); // { name: "John", ... }
  console.log(member.metaData);     // { ... }
} else {
  // Not logged in
}
```

### updateMember()
Update custom fields (not auth).

```js
await memberstack.updateMember({
  customFields: {
    name: "John",
    city: "NYC"
  }
});
```

### updateMemberAuth()
Update email or password.

```js
// Change email
await memberstack.updateMemberAuth({
  email: "newemail@example.com"
});

// Change password
await memberstack.updateMemberAuth({
  oldPassword: "current_password",
  newPassword: "new_password"
});
```

### setPassword()
Set password for members without one (e.g., social auth only).

```js
await memberstack.setPassword({
  password: "new_password"
});
```

### sendMemberVerificationEmail()
Resend email verification.

```js
await memberstack.sendMemberVerificationEmail();
```

---

## Authentication

### Email/Password Signup
Creates member with free plans only.

```js
await memberstack.signupMemberEmailPassword({
  email: "user@example.com",
  password: "password123",
  plans: [{ planId: "pln_free_xxx" }]
});
```

### Email/Password Login

```js
await memberstack.loginMemberEmailPassword({
  email: "user@example.com",
  password: "password123"
});
```

### Passwordless (Magic Link)
Two-step process.

```js
// Step 1: Send email
await memberstack.sendMemberSignupPasswordlessEmail({
  email: "user@example.com"
});

// Step 2: Verify token from email
await memberstack.signupMemberPasswordless({
  email: "user@example.com",
  passwordlessToken: "TOKEN_FROM_EMAIL",
  plans: [{ planId: "pln_xxx" }]
});
```

For login:
```js
await memberstack.sendMemberLoginPasswordlessEmail({ email });
await memberstack.loginMemberPasswordless({ email, passwordlessToken });
```

### Social Auth Providers
Supported: `google`, `facebook`, `microsoft`, `github`, `linkedin`, `spotify`, `dribbble`

```js
// Signup with provider
await memberstack.signupWithProvider({
  provider: "google",
  plans: [{ planId: "pln_xxx" }]
});

// Login with provider
await memberstack.loginWithProvider({
  provider: "google"
});

// Connect provider to existing account
await memberstack.connectProvider({
  provider: "google"
});

// Disconnect provider
await memberstack.disconnectProvider({
  provider: "google"
});
```

### Logout

```js
await memberstack.logout();
```

---

## Modals

Pre-built UI modals for auth flows.

### openModal()

| Modal | Purpose |
|-------|---------|
| `LOGIN` | Sign in |
| `SIGNUP` | Create account |
| `PROFILE` | Update account |
| `FORGOT_PASSWORD` | Request reset |
| `RESET_PASSWORD` | Set new password |

```js
// Basic usage
memberstack.openModal("LOGIN");

// With options (signup with free plans)
memberstack.openModal("SIGNUP", {
  signup: { plans: ["pln_free_xxx"] }
});

// Handle result
memberstack.openModal("LOGIN").then((result) => {
  console.log("Logged in:", result);
  memberstack.hideModal();
});
```

### hideModal()
Modals don't auto-close. Call this after handling success.

```js
memberstack.hideModal();
```

---

## Billing & Checkout

### purchasePlansWithCheckout()
Initiate Stripe checkout.

```js
// Basic - redirects to Stripe
await memberstack.purchasePlansWithCheckout({
  priceId: "prc_xxx"
});

// With options
await memberstack.purchasePlansWithCheckout({
  priceId: "prc_xxx",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  autoRedirect: false  // Returns URL instead of redirecting
});

// If autoRedirect: false
const result = await memberstack.purchasePlansWithCheckout({
  priceId: "prc_xxx",
  autoRedirect: false
});
console.log(result.checkoutUrl); // Use this URL
```

### launchStripeCustomerPortal()
Open Stripe billing portal for subscription management.

```js
await memberstack.launchStripeCustomerPortal();

// With specific prices to show
await memberstack.launchStripeCustomerPortal({
  priceIds: ["prc_xxx", "prc_yyy"]
});
```

---

## Plans

### addPlan()
Add a free plan to current member.

```js
await memberstack.addPlan({
  planId: "pln_xxx"
});
```

### removePlan()
Remove a free plan from current member.

```js
await memberstack.removePlan({
  planId: "pln_xxx"
});
```

### getPlans()
Get all available plans.

```js
const plans = memberstack.getPlans();
```

### getPlan()
Get a specific plan.

```js
const plan = memberstack.getPlan({
  planId: "pln_xxx"
});
```

---

## Member JSON

Store complex nested data (up to 1MB per member).

### getMemberJSON()

```js
const json = await memberstack.getMemberJSON();
console.log(json.preferences);
console.log(json.history);
```

### updateMemberJSON()
Always fetch first to preserve existing data.

```js
// Read-modify-write pattern
let json = await memberstack.getMemberJSON();

// Add/update properties
json.avatarURL = "https://example.com/avatar.jpg";
json.settings = { theme: "dark" };

// Remove properties
delete json.oldProperty;

// Save
await memberstack.updateMemberJSON({ json });
```

---

## Events

### onAuthChange()
Subscribe to authentication state changes.

```js
const listener = memberstack.onAuthChange((data) => {
  if (data.member) {
    console.log("Logged in:", data.member.id);
  } else {
    console.log("Logged out");
  }
});

// Unsubscribe
listener.unsubscribe();
```

---

## App Data

### getApp()
Get app configuration.

```js
const app = memberstack.getApp();
```

---

## Error Handling

All async methods return promises. Use try/catch.

```js
try {
  await memberstack.loginMemberEmailPassword({
    email: "user@example.com",
    password: "wrong_password"
  });
} catch (error) {
  console.error("Login failed:", error.message);
}
```

---

## Common Patterns

### Check if logged in

```js
const { data: member } = await memberstack.getCurrentMember();
if (member) {
  // Show member content
} else {
  // Show login prompt
}
```

### Protect a page

```js
const { data: member } = await memberstack.getCurrentMember();
if (!member) {
  window.location.href = "/login";
}
```

### Get member's plans

```js
const { data: member } = await memberstack.getCurrentMember();
const plans = member?.planConnections || [];
const activePlans = plans.filter(p => p.status === "ACTIVE");
```
