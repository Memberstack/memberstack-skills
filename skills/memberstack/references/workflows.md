# Common Memberstack workflows

Step-by-step jobs with the Memberstack MCP server. Tool names are in backticks. The server sends the exact arguments for each tool, so check them before a call. IDs below (`pln_...`, `mem_...`) are placeholders.

Before any of these: make sure the server is connected and the right app is selected (`currentApp`, `listApps`, `switchApp`). See `SKILL.md`.

## Contents

- [Members](#members)
- [Plans and prices](#plans-and-prices)
- [Gated content](#gated-content)
- [Data tables](#data-tables)
- [Teams](#teams)
- [Troubleshooting](#troubleshooting)

---

## Members

### Create a test member

1. `switchMemberstackEnvironment` with `SANDBOX`, so no real member is created.
2. `getPlans` if the member should start on a free plan.
3. `createMemberEmailPassword` with an email, a throwaway password you make up, and optionally `plans: [{ planId: "pln_..." }]`. Do not ask the user to type a password into the chat.
4. `getMember` with the returned ID to check the result.

In LIVE this tool asks for confirmation first, because it creates a real account and may send real emails.

### Find a member

1. `getMembers` with `search` set to an email, a `mem_...` ID or text from a custom field.
2. `getMember` with the ID for the full profile.

`getMembers` returns at most 15 rows per call. For more, call again with `after` set to `pageInfo.endCursor` while `pageInfo.hasNextPage` is true. To count, use `getMembersCount`.

### Update a member

1. `getMember` to read the current values.
2. `updateMember` with the `memberId` and the `customFields`, `metaData` or `json` to change.
3. `getMember` again to check.

Changing `verified`, `isModerator`, `trustStatus` or `stripeCustomerId` asks for confirmation first.

### Give or take a free plan

1. `getPlans` to find the plan ID.
2. `addFreePlan` or `removeFreePlan` with the `memberId` and `planId`.

`removeFreePlan` always asks for confirmation. `addFreePlan` asks in LIVE. Paid plans are not handled here: members buy them through a Stripe checkout on the site.

### Import many members

`importMembers` works in LIVE only. It refuses test mode, so there is no trial run: every row becomes a real member.

1. Show the user how many members will be created and get a clear yes.
2. `getPlans` if the members should get plans.
3. `importMembers` with the list. Each row needs an `email`. Leave `verified` out unless the user is sure the addresses are real and belong to those people.
4. The import runs in the background and the user gets a report by email. A row whose email already exists is rejected, never updated.
5. `getMembers` with `search` to spot-check a few.

### Export members

`exportMembers` emails a CSV link to the signed-in dashboard user. Nothing comes back in the chat. Use it only when the user asks for a file.

---

## Plans and prices

### Set up a free and a paid plan

1. `createPlan` with a name and description for the free plan. Keep the returned ID.
2. `createPlan` again for the paid plan. A new plan is always free until it has a price.
3. `createPrice` on the paid plan, for example `amount: 19`, `currency: "usd"`, `type: "SUBSCRIPTION"`, `intervalType: "MONTHLY"`.
4. `createPrice` again for a yearly price, for example `amount: 190` with `intervalType: "YEARLY"`.
5. `getPlans` to check both plans and their prices.

- `amount` is in the currency's main unit: `19` is $19.00.
- `createPrice` needs a paid Memberstack subscription, a connected Stripe account and LIVE mode. Plans and prices are shared between LIVE and test mode, so this changes the real setup.
- For a one-time payment use `type: "ONETIME"`.

### Bring plans in from Stripe

1. Ask the user for the Stripe product ID (`prod_...`).
2. `importStripeProduct` with that `productId`. It creates the plan with the product's prices and keeps it in sync.

Like `createPrice`, it needs a paid Memberstack subscription, a connected Stripe account and LIVE mode.

---

## Gated content

### Protect pages

1. `getPlans` to find the plans that should have access.
2. `createRestrictedUrlGroup` with:
   - `name`, and `redirect` (where people without access are sent, for example `/upgrade`)
   - `planIds` for the plans that get in
   - `urls`, for example `{ url: "premium", filter: "STARTS" }` and `{ url: "members-only", filter: "EQUALS" }`
   - `allowAllMembers: false` and `customContent: []`
3. `getContentGroups` to check.

URLs are page paths only. No domain, no `https://`, no `*`: a value with any of those never matches and the page stays public. `STARTS` matches every path that begins with the text. `EQUALS` matches one exact path.

Gated content is shared between LIVE and test mode. Hiding a page this way keeps people out in the browser. Anything that must stay private also needs a check on the server (see the `memberstack-verify-on-server` skill).

### Add a page to a group

1. `getContentGroups` to find the group ID.
2. `createRestrictedUrl` with the `url`, the `filter` and the `restrictedUrlGroupId`.

### Let another plan in

1. `getContentGroups` and `getPlans` for the IDs.
2. `linkPlansToRestrictedUrlGroup` with the `restrictedUrlGroupId` and the `planIds`.

Opening a group to every member (`updateRestrictedUrlGroup` with `allowAllMembers: true`) asks for confirmation first.

---

## Data tables

### Create a table

1. `createDataTable` with a `name`, a `key` (for example `user_profiles`) and the four access rules, for example `createRule: "AUTHENTICATED"`, `readRule: "AUTHENTICATED_OWN"`, `updateRule: "AUTHENTICATED_OWN"`, `deleteRule: "ADMIN_ONLY"`. Keep the returned table ID.
2. `createDataTableField` once per field, with the `tableId`, a `key`, a `name` and a `type`. Types: `TEXT`, `TEXT_FILTERABLE`, `TEXT_UNIQUE`, `NUMBER`, `DECIMAL`, `BOOLEAN`, `DATE`, `EMAIL`, `URL`, `REFERENCE` (with `referencedTableId`).
3. `getDataTable` with the table **key** to check the structure.

The table and its fields are shared between LIVE and test mode. The records are not.

### Add and read records

1. `getDataTable` with the key, to learn the field keys.
2. `createDataRecord` with the `tableId` and `data` (field keys and values).
3. `getDataRecords` with the `tableId`, and optionally a `filter` (`createdByMemberId`, `search`, `fieldFilters`) and `pagination`.

Records follow the session's mode, so a record created in SANDBOX does not show up in LIVE.

---

## Teams

1. `getMember` to find the member's team.
2. `getTeam` and `getTeamMembers` with the `teamId`.
3. `removeTeamMember` with the `teamId` and `memberId` to take someone off the team. It asks for confirmation first.
4. `regenerateTeamInviteToken` with the `teamId` makes a new invite link. The old link stops working.

---

## Troubleshooting

### A member cannot open a gated page

1. `getMember` to see the member's plans.
2. `getContentGroups`, then `getContentGroup`, to see which plans the group lets in and which URLs it covers.
3. Compare. If the plan is missing, add it with `linkPlansToRestrictedUrlGroup`, or the member needs a different plan.
4. Check the URL itself: a domain or a `*` in it means it never matches.

### A member did not get an email

1. `getSentEmails` to see what was sent to that address and whether it was delivered.
2. `getMemberEvents` with the member's ID or email for what happened around that time.

### A table returns nothing or refuses a write

1. `getDataTable` with the key, to read the access rules.
2. Check the mode with `getMemberstackEnvironment`: records made in test mode are not in LIVE.
3. Change a rule with `updateDataTable` if it is wrong.

### Something is unclear

There is no docs search tool. Read [llms.txt](https://developers.memberstack.com/llms.txt) or the page for the topic, such as [the MCP server page](https://developers.memberstack.com/mcp-server.md).
