# Webflow Data Attributes Reference

Complete reference for Memberstack's `data-ms-*` attributes in Webflow.

## Table of Contents
- [Forms](#forms)
- [Member Fields](#member-fields)
- [Modals](#modals)
- [Content Gating](#content-gating)
- [Plans and Pricing](#plans-and-pricing)
- [Authentication Providers](#authentication-providers)
- [Actions](#actions)
- [Personalization](#personalization)
- [Loaders](#loaders)

---

## Forms

### data-ms-form

Add to a `<form>` element to enable Memberstack form handling.

| Value | Purpose | Required Inputs |
|-------|---------|-----------------|
| `signup` | Create new member | email, password |
| `login` | Authenticate member | email, password |
| `profile` | Update member profile | Any custom field IDs |
| `forgot-password` | Request password reset | email |
| `reset-password` | Set new password | token, password |

**Example: Signup Form**
```html
<form data-ms-form="signup">
  <input type="email" data-ms-member="email" />
  <input type="password" data-ms-member="password" />
  <input type="text" data-ms-member="first-name" />
  <button type="submit">Sign Up</button>
</form>
```

**Example: Login Form**
```html
<form data-ms-form="login">
  <input type="email" data-ms-member="email" />
  <input type="password" data-ms-member="password" />
  <button type="submit">Log In</button>
</form>
```

**Example: Profile Update Form**
```html
<form data-ms-form="profile">
  <input type="text" data-ms-member="CUSTOM_FIELD_ID" />
  <button type="submit">Update Profile</button>
</form>
```

**Example: Forgot Password Form**
```html
<form data-ms-form="forgot-password">
  <input type="email" data-ms-member="email" />
  <button type="submit">Send Reset Link</button>
</form>
```

**Example: Reset Password Form**
```html
<form data-ms-form="reset-password">
  <input type="hidden" data-ms-member="token" />
  <input type="password" data-ms-member="password" />
  <button type="submit">Reset Password</button>
</form>
```

---

## Member Fields

### data-ms-member

Add to input elements within forms to bind to member data.

| Value | Purpose |
|-------|---------|
| `email` | Member's email address |
| `password` | Account password |
| `token` | Reset password token |
| `CUSTOM_FIELD_ID` | Any custom field by its ID |

Custom field IDs are generated when you create fields in the Memberstack dashboard. The ID is immutable even if you rename the field.

---

## Modals

### data-ms-modal

Add to links/buttons to open Memberstack's pre-built modals.

| Value | Modal Type |
|-------|------------|
| `login` | Login modal |
| `signup` | Signup modal |
| `profile` | Member profile modal |
| `forgot-password` | Password reset request |

**Example**
```html
<a data-ms-modal="login" href="#">Log In</a>
<button data-ms-modal="signup">Sign Up</button>
```

### data-ms-modal-tab

Use with `data-ms-modal="profile"` to open a specific tab.

| Value | Tab |
|-------|-----|
| `team` | Team management |
| `profile` | Profile info |
| `security` | Security settings |
| `changePassword` | Password change |
| `plans` | Subscription plans |

**Example**
```html
<a data-ms-modal="profile" data-ms-modal-tab="plans" href="#">
  Manage Plans
</a>
```

---

## Content Gating

### data-ms-content

Control element visibility based on member status.

| Value | Shows Element When |
|-------|-------------------|
| `members` | Logged in |
| `!members` | Logged out |
| `verified` | Email verified |
| `!verified` | Email not verified |
| `paid-plans` | Has any paid plan |
| `free-plans` | Has any free plan |
| `no-plans` | Logged in but has no plans |
| `is-admin` | Is admin/moderator |
| `has-failed-payment` | Payment failed |
| `CONTENT_GROUP_ID` | Has access to specific content group |

**Examples**
```html
<!-- Show only to logged-in members -->
<div data-ms-content="members">
  Welcome back!
</div>

<!-- Show only to logged-out visitors -->
<div data-ms-content="!members">
  Please log in to continue.
</div>

<!-- Show to members with paid plans -->
<div data-ms-content="paid-plans">
  Premium content here.
</div>

<!-- Show to specific content group -->
<div data-ms-content="grp_abc123">
  Members-only content.
</div>
```

### data-ms-bind:class

Add a CSS class based on content state.

```html
<div data-ms-content="is-admin" data-ms-bind:class="admin-panel">
  Admin controls
</div>
```

### data-ms-bind:style

Apply inline styles based on content state.

```html
<div data-ms-content="has-failed-payment" data-ms-bind:style="display:block">
  Please update your payment method.
</div>
```

---

## Plans and Pricing

### Free Plans

| Attribute | Purpose |
|-----------|---------|
| `data-ms-plan:add="PLAN_ID"` | Add free plan on form submit |
| `data-ms-plan:remove="PLAN_ID"` | Remove free plan |

**Multiple plans**: Comma-separate IDs: `data-ms-plan:add="plan1,plan2"`

**Example: Signup with Free Plan**
```html
<form data-ms-form="signup" data-ms-plan:add="pln_free_tier">
  <input type="email" data-ms-member="email" />
  <input type="password" data-ms-member="password" />
  <button type="submit">Start Free</button>
</form>
```

### Paid Plans (Stripe Checkout)

| Attribute | Purpose |
|-----------|---------|
| `data-ms-price:add="PRICE_ID"` | Initiate checkout for price |
| `data-ms-price:update="PRICE_ID"` | Update subscription to new price |
| `data-ms-price:remove="all"` | Clear selected prices (pricing tables) |

**Example: Purchase Button**
```html
<a data-ms-price:add="prc_monthly_pro" href="#">
  Subscribe Monthly - $19
</a>
```

**Example: Upgrade Button**
```html
<a data-ms-price:update="prc_annual_pro" href="#">
  Upgrade to Annual
</a>
```

---

## Authentication Providers

### data-ms-auth-provider

Add social login buttons.

| Value | Provider |
|-------|----------|
| `google` | Google OAuth |
| `facebook` | Facebook Login |
| `microsoft` | Microsoft Account |
| `github` | GitHub |
| `linkedin` | LinkedIn |
| `spotify` | Spotify |
| `dribbble` | Dribbble |

**Example**
```html
<button data-ms-auth-provider="google">
  Continue with Google
</button>
```

### Managing Connected Providers

Wrap provider buttons in a manage-providers container for connect/disconnect functionality:

```html
<div data-ms-auth="manage-providers">
  <a data-ms-auth-provider="google" href="#">
    <span data-ms-auth-connected-text="Disconnect Google">
      Connect Google
    </span>
    <div data-ms-auth-disconnect>
      <img src="x-icon.png" alt="Disconnect" />
    </div>
  </a>
</div>
```

| Attribute | Purpose |
|-----------|---------|
| `data-ms-auth="manage-providers"` | Wrapper for connect/disconnect |
| `data-ms-auth-connected-text` | Text when provider is connected |
| `data-ms-auth-disconnect` | Element shown when connected (for disconnect UI) |

---

## Actions

### data-ms-action

Trigger Memberstack actions on click.

| Value | Action |
|-------|--------|
| `logout` | Log out current member |
| `customer-portal` | Open Stripe billing portal |
| `resend-verification-email` | Resend email verification |
| `login-redirect` | Redirect to login page |

**Example**
```html
<button data-ms-action="logout">Log Out</button>

<button data-ms-action="customer-portal">
  Manage Billing
</button>

<button data-ms-action="resend-verification-email">
  Resend Verification
</button>
```

**Notes**:
- `logout` button auto-hides when logged out
- `customer-portal` only shows for members with paid subscriptions
- `resend-verification-email` only shows when email is unverified

---

## Personalization

### data-ms-member (on display elements)

When used on non-input elements, injects member data into the element's text content.

| Value | Displays |
|-------|----------|
| `email` | Member's email |
| `id` | Member ID |
| `signup-date` | Registration date |
| `CUSTOM_FIELD_ID` | Custom field value |

**Example**
```html
<h1>Welcome, <span data-ms-member="first-name">Friend</span>!</h1>
<p>Your email: <span data-ms-member="email">user@example.com</span></p>
```

**Behavior**:
- If the field has a value, replaces the element's text
- If the field is empty, shows the original placeholder text
- Data is private to the member and site admin only

---

## Loaders

### data-ms-loader

Replace the default Memberstack loader with a custom element.

```html
<div data-ms-loader style="display: none;">
  <div class="spinner"></div>
  Loading...
</div>
```

**Important**: The loader element must have `display: none` initially. Memberstack shows it while modals are opening.

---

## Best Practices

1. **Use placeholder text**: For personalization, include meaningful default text that displays before data loads or when the field is empty.

2. **Test with logged-out state**: Verify content gating works correctly for both logged-in and logged-out visitors.

3. **Avoid duplicate form IDs**: Multiple forms with the same HTML `id` attribute can cause conflicts.

4. **Custom fields first**: Create custom fields in the Memberstack dashboard before referencing their IDs in your Webflow site.

5. **Publish to test**: Data attributes only work on the published site, not in Webflow Designer preview.
