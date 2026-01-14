# Memberstack Skills for Claude Code

A Claude Code skill that transforms Claude into a Memberstack expert, enabling seamless membership site management through the Memberstack MCP.

## Prerequisites

Before installing the skill, you need to install the Memberstack MCP:

```bash
claude mcp add memberstack --scope user npx mcp-remote https://mcp.memberstack.com/mcp
```

After adding the MCP, restart Claude Code and authenticate when prompted.

## Installation

### Option 1: From GitHub (Recommended)

```bash
# Add the Memberstack marketplace
claude plugin marketplace add memberstack/memberstack-skills

# Install the plugin
claude plugin install memberstack-skills@memberstack-skills
```

### Option 2: From Local Clone

```bash
# Clone the repository
git clone https://github.com/memberstack/memberstack-skills.git ~/memberstack-skills

# Add as local marketplace
claude plugin marketplace add ~/memberstack-skills

# Install the plugin
claude plugin install memberstack-skills@memberstack-skills
```

After installation, restart Claude Code. The skill will be automatically invoked when relevant to your task.

## Updating

```bash
# Update marketplace index and plugin
claude plugin marketplace update memberstack-skills
claude plugin update memberstack-skills@memberstack-skills
```

## What's Included

This skill provides Claude with:

- **MCP Tool Guidance**: How to use all 62+ Memberstack MCP tools across 7 categories (members, plans, data tables, gated content, teams, custom fields, Stripe)
- **Webflow Integration**: Complete `data-ms-*` attribute reference for forms, modals, content gating, and personalization
- **Workflow Patterns**: Common multi-step patterns for membership site operations
- **Knowledge Search**: Access to Memberstack's documentation for DOM package, webhooks, and integrations

## Features

| Category | Tools | Operations |
|----------|-------|------------|
| Members | 15 | CRUD, plan assignments, import/export |
| Plans | 9 | Create/manage subscriptions, prices |
| Data Tables | 14 | Custom database operations |
| Gated Content | 15 | URL protection, content groups |
| Teams | 4 | Team management, invites |
| Custom Fields | 4 | Member profile fields |
| Stripe | 1 | Payment integration |

## Usage

Once installed, simply ask Claude to help with Memberstack tasks:

- "Create a new membership plan with monthly and yearly pricing"
- "Set up gated content for premium members"
- "Show me the Webflow attributes for a signup form"
- "Import members from a CSV"
- "Configure a data table for user profiles"

Claude will automatically use the Memberstack skill and MCP tools to help you.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Troubleshooting

### MCP Authentication Issues

If you encounter authentication problems, clear the cached tokens:

```bash
rm -rf ~/.mcp-auth
```

Then restart Claude Code and re-authenticate.

### Skill Not Triggering

Ensure the skill is installed correctly:

```bash
claude plugin list
```

You should see `memberstack-skills` in the list.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Resources

- [Memberstack Documentation](https://docs.memberstack.com)
- [Memberstack Developers](https://developers.memberstack.com)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
