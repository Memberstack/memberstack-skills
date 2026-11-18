---
name: memberstack
description: "Manages a Memberstack app through the Memberstack MCP server: members, plans, prices, gated content, data tables, teams and custom fields. Use when the user asks to look up, create, change or remove something in their Memberstack account, to connect or sign in to the Memberstack MCP server, or for any Memberstack task that no narrower Memberstack skill covers."
license: MIT
compatibility: "Needs the Memberstack MCP server at https://mcp.memberstack.com/mcp. Plugin installs add it. Skills-only installs must add it by hand (see \"Connect the server\")."
---

# Memberstack

Memberstack adds logins, paid plans and gated content to any website. This skill is for **managing the app** through the Memberstack MCP server. Writing the site's code has its own skills:

| The user wants to | Use the skill |
|---|---|
| Add signup, login or a member area to a JavaScript app | `memberstack-add-to-app` |
| Charge for access: plans, prices, checkout | `memberstack-paid-memberships` |
| Lock pages or content to members or a plan | `memberstack-gate-content` |
| Check a member in an API route or on the server | `memberstack-verify-on-server` |
| Do any of this on Webflow or a plain HTML site | `memberstack-webflow` |

## Connect the server

Call the Memberstack MCP server's `currentApp` tool.

- **It answers with an app:** connected. Go on.
- **It says no app is selected:** call `listApps`, then `switchApp` with the app the user means. Ask if there is more than one candidate.
- **There are no Memberstack tools at all:** the server is not connected. If this skill came from the Memberstack plugin, the user has to sign in (in Claude Code: run `/mcp`, pick `memberstack`, sign in). Otherwise give them the command for their agent and stop until it is connected:

```bash
# Claude Code: run in the project folder (or add --scope user for all projects), then sign in.
# Instead of the login command you can type /mcp in Claude Code and pick memberstack.
claude mcp add --transport http memberstack https://mcp.memberstack.com/mcp
claude mcp login memberstack

# Codex: add the server, then sign in
codex mcp add memberstack --url https://mcp.memberstack.com/mcp
codex mcp login memberstack
```

```json
// Cursor: ~/.cursor/mcp.json, then sign in when Cursor asks
{
  "mcpServers": {
    "memberstack": {
      "url": "https://mcp.memberstack.com/mcp"
    }
  }
}
```

Adding the server does not sign the user in. Sign-in happens in the browser with the user's Memberstack account. There is no API key to paste, and the server never needs a secret key.

Only call `createApp` when the user asks for a new app. Normally they work in one that exists.

## Live and test mode

`getMemberstackEnvironment` returns `LIVE` or `SANDBOX`. `switchMemberstackEnvironment` changes it. Check it before any change to members. Do not assume.

- **SANDBOX (test mode) applies to members, teams and data table records only.**
- **Everything else is shared and always changes the live setup:** plans, prices, gated content, custom fields and the structure of data tables. Test mode does not protect these.
- `importMembers`, `createPrice` and `createStripeCustomer` work in LIVE only.
- Build and test with test members in SANDBOX first. Tell the user before you change anything real members will see.

## Confirmations

Some tools do not run on the first call. Every delete, remove and detach tool does this, and so do a few risky changes (for example giving a real member a plan in LIVE). `references/tools.md` marks them in the "Asks first" column.

1. The first call returns `CONFIRMATION_REQUIRED`, a description of what would happen, and a `confirmationToken`. Nothing has changed yet.
2. Show the user that description and get a clear yes.
3. Call the same tool again with the same arguments plus `confirmationToken`.

The token works once, for that exact call, for five minutes. Never invent one, and never confirm on the user's behalf. Some agents show the user a yes or no prompt instead. Then there is no second call to make.

## Rules that trip agents up

**Members**
- `getMembers` and `getMemberEvents` return at most 15 rows per call. Page with `pageInfo.endCursor` while `pageInfo.hasNextPage` is true. To count members use `getMembersCount`.
- `exportMembers` emails a CSV link to the signed-in dashboard user. It returns no member data. Never use it to list or count.
- `addFreePlan` and `removeFreePlan` only handle free plans. Paid plans come from a Stripe checkout on the site.
- Never ask the user to type a member's password into the chat. For a test member in SANDBOX, make up a throwaway password yourself. Real people sign up on the site or set their own password with the reset email.

**Plans and prices**
- `createPlan` makes a free plan. To charge for it, add a price with `createPrice`. That needs a paid Memberstack subscription, a connected Stripe account and LIVE mode.
- A price `amount` is in the currency's main unit: `19` means $19.00, not 19 cents.
- `updatePrice` changes a price's name, trial, setup fee and limits. It cannot change the amount, currency or interval: create a new price for that.

**Gated content**
- A gated URL is a page path only, such as `members/secret`. No domain, no scheme, no `*`. A value with any of those never matches and the page stays public.
- `filter` is `STARTS` (the path begins with the text) or `EQUALS` (exact path).

**Data tables**
- `getDataTable` takes the table key (a string such as `user_profiles`), not an ID.
- Table structure is shared between LIVE and SANDBOX. The records are separate.

**Keys**
- Never put a secret key (`sk_...`) in front-end code or in the chat. The public key (`pk_...`) is safe in front-end code. No tool returns either: the user copies them from the Memberstack dashboard.

## Tools

`references/tools.md` lists all the server's tools by group. The server sends the full description and arguments for each tool, so read those before a call and trust them over this skill.

Common starting points:

| Job | Tools |
|---|---|
| Look up a member | `getMembers` with `search`, then `getMember` |
| Give or take a free plan | `getPlans`, then `addFreePlan` or `removeFreePlan` |
| Set up a paid plan | `createPlan`, then `createPrice` |
| Bring plans in from Stripe | `importStripeProduct` |
| Gate pages | `createRestrictedUrlGroup`, then `linkPlansToRestrictedUrlGroup` |
| Store custom data | `createDataTable`, `createDataTableField`, `createDataRecord` |
| See why an email did not arrive | `getSentEmails` |
| See what a member did | `getMemberEvents` |

Step-by-step versions are in `references/workflows.md`.

## Key ideas

- **App:** one project with its own members, plans, gated content and data tables.
- **Member:** a person who signs up on the user's site. **Dashboard user:** the person signed in to Memberstack, who the MCP server acts as.
- **Plan:** free, one-time or recurring. Paid plans bill through Stripe.
- **Content group:** a set of gated URLs and the plans that can open them.
- **Data table:** custom records with access rules: `PUBLIC`, `AUTHENTICATED`, `AUTHENTICATED_OWN` (members see only their own records) or `ADMIN_ONLY`.

## Docs

There is no docs search tool on the server. Read the docs directly:

- [llms.txt](https://developers.memberstack.com/llms.txt): the short reference for agents. Start here.
- Add `.md` to any docs page for plain text, for example the [MCP server page](https://developers.memberstack.com/mcp-server.md).
- [Help center](https://docs.memberstack.com/hc/en-us): dashboard settings and integrations.

## Reference files

| File | Use it for |
|---|---|
| `references/tools.md` | Every MCP tool, by group |
| `references/workflows.md` | Step-by-step MCP jobs |
