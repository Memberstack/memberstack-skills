---
name: memberstack-webflow
description: Adds Memberstack logins, signup forms, paid plan buttons and gated content to a Webflow or plain HTML site with data-ms attributes, no build step. Use when the user is on Webflow, replacing Webflow User Accounts, or wants memberships, a login form, a paywall or members-only content on a site built with a script tag instead of an npm package.
license: MIT
---

# Memberstack on Webflow and plain HTML

These sites load one Memberstack script and then use `data-ms-*` attributes on normal elements. There is no npm install and no JavaScript to write for the common cases.

Building a React, Next.js, Vue or Svelte app? Attributes do nothing there. Use the `memberstack-add-to-app` skill.

## Setup

1. Add the Memberstack script to the site's head. The exact tag, with the app's ID filled in, is in the Memberstack dashboard:

   ```html
   <script data-memberstack-app="YOUR_APP_ID" src="https://static.memberstack.com/scripts/v2/memberstack.js" type="text/javascript"></script>
   ```

   In Webflow: Site settings, Custom code, Head code. Then publish.
2. Create plans in Memberstack (dashboard, or the `memberstack` skill with the MCP server).
3. Add attributes to elements.

## The attributes you need most

| Job | Attribute |
|---|---|
| Signup form | `data-ms-form="signup"` on the form |
| Login form | `data-ms-form="login"` |
| Profile form | `data-ms-form="profile"` |
| Password reset request | `data-ms-form="forgot-password"` |
| Log out button | `data-ms-action="logout"` |
| Open the ready-made login or signup modal | `data-ms-modal="login"`, `data-ms-modal="signup"` |
| Buy a paid plan (Stripe checkout) | `data-ms-price:add="prc_your_price_id"` |
| Switch paid plan | `data-ms-price:update="prc_your_price_id"` |
| Add or remove a free plan | `data-ms-plan:add="pln_your_plan_id"`, `data-ms-plan:remove="pln_your_plan_id"` |
| Show to logged-in members only | `data-ms-content="members"` |
| Show to logged-out visitors only | `data-ms-content="!members"` |
| Show to members with access to some content | `data-ms-content="your-content-id"` |
| Show a member's email or a custom field | `data-ms-member="email"`, `data-ms-member="your_field_id"` |

Form fields are matched by attribute too (for example `data-ms-member="email"` on an input). The full list, with examples, is in `references/webflow-attributes.md`.

## Rules that trip agents up

- Paid plan buttons take a **price** ID (`prc_...`). Free plan buttons take a **plan** ID (`pln_...`).
- Do not `npm install @memberstack/dom` on these sites. The script already provides `window.$memberstackDom` for the rare case that needs JavaScript.
- Custom code in Webflow needs a paid Webflow site plan.
- To gate whole pages, use Memberstack's gated content rules (the `memberstack-gate-content` skill): a URL is a page path only, with no domain and no `*`.
- `data-ms-content` hides elements in the browser. The content is still in the page source. Do not put anything secret in a hidden element.

## Security checklist

- [ ] Nothing secret sits in a hidden element or a gated page's source.
- [ ] No Memberstack secret key (`sk_...`) is in custom code or in the chat.
- [ ] A gated page was opened while logged out, in a private window, to confirm it redirects.
- [ ] Test mode was used first, with a test member.

## More

- Docs for agents: [llms.txt](https://developers.memberstack.com/llms.txt)
- Webflow setup guides: [help center](https://docs.memberstack.com/hc/en-us)
