# Contributing

Thanks for helping keep the Memberstack plugin accurate.

## The one rule

**The skill must match the server.** An agent that is told to call a tool that does not exist stops trusting the rest. So:

- Tool names are listed in one file only: `skills/memberstack/references/tools.md`. It is generated. Do not edit it by hand.
- A change to the server's tools ships with the matching change here.

## Layout

```
.claude-plugin/        Claude Code plugin and marketplace files
.codex-plugin/         Codex plugin file
.cursor-plugin/        Cursor plugin file
.agents/plugins/       Codex marketplace file
.mcp.json              The MCP server, for Claude Code
mcp.json, plugin.json  The same, in the Agent Plugins format
scripts/sync-tools.mjs Rebuilds and checks the tool list
skills/memberstack/
├── SKILL.md                   The skill itself (keep it under 500 lines)
└── references/
    ├── tools.md               Every MCP tool (generated)
    ├── workflows.md           Step-by-step MCP jobs
    ├── dom-package.md         Site code with @memberstack/dom
    └── webflow-attributes.md  data-ms-* attributes
```

## Before you open a pull request

1. Rebuild the tool list from the live server (needs Node 18 or later, no sign-in):

   ```bash
   node scripts/sync-tools.mjs
   ```

   If the server has a tool the script does not know, it stops and tells you. Add the tool to a group in `GROUPS` at the top of the script, and check whether `SKILL.md` or `workflows.md` should mention it.

2. Run the check. CI runs the same one:

   ```bash
   node scripts/sync-tools.mjs --check
   ```

3. Validate the plugin files:

   ```bash
   claude plugin validate .
   ```

   A warning about a missing `version` is expected. Without one, installs follow the latest commit.

4. Try it. Install from your clone and ask the agent to do the thing you changed:

   ```bash
   claude plugin install memberstack --marketplace .
   ```

## Writing rules

- Name tools plainly, in backticks: `getMembers`. Never with an `mcp__` prefix, because the prefix differs between agents.
- Check every claim against the server's own tool description or the [developer docs](https://developers.memberstack.com/llms.txt). Do not write arguments from memory.
- Never show a member's password or a secret key in an example.
- Keep it short. Link to the docs instead of copying them.
- The plugin name `memberstack` is permanent. Do not rename it.

## Reporting a problem

Open an issue with what you asked the agent, what it did, and which agent and version you use.
