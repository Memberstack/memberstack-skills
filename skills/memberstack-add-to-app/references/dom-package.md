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

### Passwordless (6 digit code)
Two-step process. Memberstack emails the member a 6 digit code, and your form sends it back. There is no magic link.

```js
// Step 1: Email the code
await memberstack.sendMemberSignupPasswordlessEmail({
  email: "user@example.com"
});

// Step 2: Finish with the code the member typed in
await memberstack.signupMemberPasswordless({
  email: "user@example.com",
  passwordlessToken: "123456",
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

Returns `{ data }`, where `data` is the stored object, or `null` if nothing is stored yet.

```js
const { data: json } = await memberstack.getMemberJSON();
console.log(json?.preferences);
console.log(json?.history);
```

### updateMemberJSON()
Always fetch first to preserve existing data.

```js
// Read-modify-write pattern
const { data } = await memberstack.getMemberJSON();
const json = data ?? {};

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
Subscribe to authentication state changes. The callback receives the member, or `null` when logged out. It is not called when you subscribe, so read the starting state with `getCurrentMember()`.

```js
const { unsubscribe } = memberstack.onAuthChange((member) => {
  if (member) {
    console.log("Logged in:", member.id);
  } else {
    console.log("Logged out");
  }
});

// Stop listening (always do this when a component unmounts)
unsubscribe();
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

Redirecting in the browser keeps logged-out visitors away from a page, but it is not security: the page's code and data were already sent to the browser.

```js
const { data: member } = await memberstack.getCurrentMember();
if (!member) {
  window.location.href = "/login";
}
```

For data that must stay private, check the member on your server before sending it. Send the member's token with the request and verify it with `@memberstack/admin`. Always pass your app ID as `audience`. Without it, a valid token from a different Memberstack app also passes.

```js
// Browser: send the token
const token = memberstack.getMemberCookie();
await fetch("/api/private", { headers: { Authorization: `Bearer ${token}` } });
```

```js
// Server (Node.js): verify it
import memberstackAdmin from "@memberstack/admin";
const memberstack = memberstackAdmin.init(process.env.MEMBERSTACK_SECRET_KEY);

// Stop at startup if the app ID is missing: an undefined audience skips the check.
const appId = process.env.MEMBERSTACK_APP_ID;
if (!appId) throw new Error("MEMBERSTACK_APP_ID is not set");

const token = request.headers.authorization?.replace("Bearer ", "");
const verified = await memberstack.verifyToken({ token, audience: appId });
// verified.id is the member ID. verifyToken throws when the token is not valid.
```

### Get member's plans

```js
const { data: member } = await memberstack.getCurrentMember();
const plans = member?.planConnections || [];
const activePlans = plans.filter(p => p.status === "ACTIVE");
```
