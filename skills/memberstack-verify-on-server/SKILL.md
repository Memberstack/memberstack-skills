---
name: memberstack-verify-on-server
description: "Verifies a Memberstack member on the server with the @memberstack/admin package, so an API route or server page only answers real, logged-in members on the right plan. Use when the user needs protected API routes, server-side auth checks, private data for members only, or to verify a Memberstack token or webhook in Node.js, Next.js, Express or an edge function."
license: MIT
---

# Verify a member on the server

`@memberstack/dom` runs in the browser, and anything decided there can be bypassed. When data or a page must stay private, the server has to check the member itself. That takes two steps: the browser sends the member's token, and the server verifies it.

## Setup

1. Install on the server: `npm install @memberstack/admin`
2. Two server-side environment variables. Neither may reach the browser:
   - `MEMBERSTACK_SECRET_KEY`: the secret key, `sk_sb_...` for test mode or `sk_...` for live. The user copies it from the Memberstack dashboard. Never ask them to paste it into the chat: have them put it in the env file themselves.
   - `MEMBERSTACK_APP_ID`: the app ID (`app_...`).

## Browser: send the token

```js
const token = memberstack.getMemberCookie(); // the logged-in member's token
const res = await fetch("/api/private", {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Server: verify it

```js
import memberstackAdmin from "@memberstack/admin";

const memberstack = memberstackAdmin.init(process.env.MEMBERSTACK_SECRET_KEY);

// Stop at startup if the app ID is missing: an undefined audience skips the check.
const appId = process.env.MEMBERSTACK_APP_ID;
if (!appId) throw new Error("MEMBERSTACK_APP_ID is not set");

export async function requireMember(request, requiredPlanId) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return { status: 401 };

  let id;
  try {
    // Always pass audience. Without it a valid token from ANOTHER Memberstack app also passes.
    ({ id } = await memberstack.verifyToken({ token, audience: appId }));
  } catch {
    return { status: 401 }; // verifyToken throws when the token is not valid
  }

  if (!requiredPlanId) return { status: 200, memberId: id };

  // Read the member's plans from Memberstack, not from the request.
  const { data: member } = await memberstack.members.retrieve({ id });
  const hasPlan = member?.planConnections?.some(
    (conn) => conn.planId === requiredPlanId && ["ACTIVE", "TRIALING"].includes(conn.status)
  );
  return hasPlan ? { status: 200, memberId: id } : { status: 403 };
}
```

`request.headers.get(...)` is the Web `Request` shape (Next.js route handlers, edge functions). In Express use `req.headers.authorization`.

## Rules that trip agents up

- **Always pass `audience`.** It is the app ID. This is the most common mistake and it is a real hole.
- **Check the plan ID, not the price ID**, and accept `TRIALING` as well as `ACTIVE`.
- Logging out does not cancel a token. It keeps verifying until it expires, so keep sensitive actions behind a fresh check.
- `members.retrieve` resolves `{ data: null }` when no member matches. It does not throw.
- No Node.js on the server (Cloudflare Workers, Deno, other languages)? Verify the token with any JWT library against `https://auth.memberstack.com/.well-known/member-jwks.json`: RS256, issuer `https://api.memberstack.com`, audience = the app ID, `exp` required, claim `type` = `"member"`. The member ID is the `id` claim.
- Webhooks: verify each one with `memberstack.verifyWebhookSignature({ payload, headers, secret })` before trusting it. It returns `true` or throws.

## Security checklist

- [ ] The secret key is only in a server-side env var. It is not in the repo, the browser bundle or the chat.
- [ ] `verifyToken` is called with `audience` set to the app ID, and the server refuses to start without it.
- [ ] The plan is read from Memberstack on the server, never taken from the request body.
- [ ] A request with no token gets 401, and a member without the plan gets 403. Both were tried.

## More

- Docs for agents: [llms.txt](https://developers.memberstack.com/llms.txt) and the [Admin package quick start](https://developers.memberstack.com/admin-node-package/quick-start.md)
