---
name: memberstack-gate-content
description: Gates pages and content with Memberstack so only logged-in members, or members on a given plan, can see them. Use when the user wants gated content, members-only pages, a member area, premium content, protected routes or content locked behind a plan.
license: MIT
---

# Gate content by membership or plan

There are three layers. Pick by how private the content is.

| Layer | What it does | Good for |
|---|---|---|
| Show or hide in the browser | Hides elements or redirects logged-out visitors | Navigation, upsells, convenience |
| Gated content rules in Memberstack | Redirects visitors without the plan away from listed URLs | Webflow and script-tag sites |
| Check on the server | The server refuses to send the content | Anything that must stay private |

**The first two do not protect data.** The page's code and content still reach the browser. If someone must not be able to read it, add the server check.

## Show or hide in the browser

JavaScript apps (`@memberstack/dom`):

```js
const { data: member } = await memberstack.getCurrentMember();

if (!member) {
  window.location.href = "/login"; // logged out
}

// Access follows the plan: check the plan ID, not the price ID. Trialing counts.
const hasPlan = member?.planConnections?.some(
  (conn) => conn.planId === "pln_your_plan" && (conn.active || conn.status === "TRIALING")
);
```

Webflow and plain HTML: `data-ms-content="members"` shows an element to logged-in members only, and `data-ms-content="your-content-id"` to members with access to that Gated Content group. The value is the group's key, never a plan ID, and a key that matches no group hides nothing. See the `memberstack-webflow` skill.

## Gated content rules in Memberstack

For sites that load the Memberstack script (Webflow, plain HTML), Memberstack can redirect visitors without access away from whole URLs. With the Memberstack MCP server connected (see the `memberstack` skill):

1. `getPlans` to find the plan IDs.
2. `createRestrictedUrlGroup` with a `name`, a `redirect` (for example `/upgrade`), the `planIds`, and `urls` such as `{ url: "members", filter: "STARTS" }`.
3. `getContentGroups` to check.

- A URL is a page path only: `members/secret`. No domain, no `https://`, no `*`. A value with any of those never matches and the page stays public.
- `STARTS` matches every path that begins with the text. `EQUALS` matches one exact path.
- These rules are shared by test and live mode, so they apply to the real site at once.

Apps that use the npm package (React, Next.js and so on) do their own routing, so gate with the browser check above plus the server check below.

## Check on the server

The browser sends the member's token, and the server verifies it and reads the member's plans before answering. The `memberstack-verify-on-server` skill has the full pattern. In short:

```js
// Server only. Always pass your app ID as audience.
const { id } = await memberstack.verifyToken({ token, audience: appId });
const { data: member } = await memberstack.members.retrieve({ id });
const allowed = member?.planConnections?.some(
  (conn) => conn.planId === "pln_your_plan" && ["ACTIVE", "TRIALING"].includes(conn.status)
);
```

## Security checklist

- [ ] Nothing private relies on hiding in the browser alone.
- [ ] Private data comes from a server route that verifies the member token with `audience` set to the app ID.
- [ ] Plan checks use the plan ID (`pln_...`) and accept both `ACTIVE` and `TRIALING`.
- [ ] Gated URLs have no domain and no `*`, and one was tested while logged out.

## More

- Docs for agents: [llms.txt](https://developers.memberstack.com/llms.txt)
