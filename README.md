# Memberstack plugin for coding agents

One install gives your coding agent two things:

- **The Memberstack MCP server**, so the agent can manage your Memberstack app: members, plans, prices, gated content, data tables, teams and custom fields.
- **The Memberstack skill**, so the agent knows how to add logins, paid plans and gated content to your site, and how to use the server safely.

It works with Claude Code, Codex and Cursor. Other agents can install the skill on its own.

## Install

### Claude Code

```bash
claude plugin install memberstack --marketplace Memberstack/memberstack-skills
```

Then start Claude Code, run `/mcp`, pick `memberstack` and sign in with your Memberstack account.

On older versions of Claude Code, run these two instead:

```bash
claude plugin marketplace add Memberstack/memberstack-skills
```

```bash
claude plugin install memberstack@memberstack-skills
```

### Codex

```bash
codex plugin marketplace add Memberstack/memberstack-skills
```

```bash
codex plugin add memberstack@memberstack
```

Sign in when Codex asks, or run `codex mcp login memberstack`.

### Cursor

Add the server to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "memberstack": {
      "type": "streamable-http",
      "url": "https://mcp.memberstack.com/mcp"
    }
  }
}
```

Then add the skill:

```bash
npx skills add Memberstack/memberstack-skills -a cursor
```

### Any other agent (skill only)

```bash
npx skills add Memberstack/memberstack-skills
```

This installs the skill without the MCP server. Add the server by hand with the URL `https://mcp.memberstack.com/mcp` (streamable HTTP). Your agent's docs say where.

## Signing in

The server uses your Memberstack login (OAuth) in the browser. There is no API key to paste. The agent can then read and change every app your account can open, so connect only from a machine you trust.

## Upgrading from the old version

Earlier versions of this README had you add the server by hand with `npx mcp-remote`. If you did that:

1. Remove the old server, or you will see every tool twice:

   ```bash
   claude mcp remove memberstack
   ```

2. Update the marketplace, then install the plugin under its new name. It was renamed from `memberstack-skills` to `memberstack`:

   ```bash
   claude plugin marketplace update memberstack-skills
   ```

   ```bash
   claude plugin install memberstack@memberstack-skills
   ```

   The old `memberstack-skills` plugin entry is replaced. You do not need to uninstall it.

To get future updates without doing anything, turn on auto-update: `/plugin`, then Marketplaces, then `memberstack-skills`, then Enable auto-update.

## What the skill covers

| Site | Approach |
|---|---|
| Webflow | `data-ms-*` attributes, no code |
| React, Next.js, Vue, Svelte, other JavaScript apps | `@memberstack/dom` |
| Plain HTML | The Memberstack script tag with `data-ms-*` attributes |
| Server code (Node.js) | `@memberstack/admin` |

The full list of MCP tools is in [skills/memberstack/references/tools.md](skills/memberstack/references/tools.md). It is generated from the server, so it is always the real list.

## Things to ask for

- "Add paid memberships to my Next.js app with Memberstack"
- "Create a Pro plan with monthly and yearly prices"
- "Gate everything under /members for paying members"
- "Add a login and signup form to my React app"
- "Show me the Webflow attributes for a signup form"
- "Why did this member not get their verification email?"

## Safety

- Deleting or removing anything asks you first. So do a few risky changes, such as giving a real member a plan.
- Test mode only covers members, teams and data table records. Plans, prices and gated content always change your live setup.

## Troubleshooting

**The agent has no Memberstack tools.** The server is not connected or you are not signed in. In Claude Code run `/mcp` and check `memberstack`.

**Sign-in fails or you want to sign out.** In Claude Code run `/mcp`, pick `memberstack`, and clear the sign-in. Then sign in again.

**The skill does not load.** Check the plugin is installed:

```bash
claude plugin list
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).

## Links

- [MCP server docs](https://developers.memberstack.com/mcp-server)
- [Developer docs](https://developers.memberstack.com)
- [Help center](https://docs.memberstack.com)
