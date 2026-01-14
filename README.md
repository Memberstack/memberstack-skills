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

- **MCP Tool Guidance**: All 62+ Memberstack MCP tools across 7 categories
- **DOM Package Reference**: Frontend SDK for React, Next.js, Vue, and vanilla JS
- **Webflow Attributes**: Complete `data-ms-*` reference for no-code integration
- **Workflow Patterns**: Common multi-step patterns for membership operations
- **Stack-Aware Guidance**: Automatically recommends the right approach for your framework

## Stack Support

The skill detects your tech stack and provides the appropriate guidance:

| Stack | Approach |
|-------|----------|
| **Webflow** | `data-ms-*` HTML attributes (no-code) |
| **React / Next.js / Vue / Svelte** | DOM package (`@memberstack/dom`) |
| **Vanilla JS** | DOM package or data attributes |
| **Node.js / Server** | Admin SDK |

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

**Backend (MCP)**
- "Create a new membership plan with monthly and yearly pricing"
- "Import members from a CSV"
- "Set up gated content for premium members"

**Frontend (React/Next.js)**
- "Add a login form to my React app"
- "How do I check if a user is logged in?"
- "Implement Stripe checkout for subscriptions"

**Frontend (Webflow)**
- "Show me the data attributes for a signup form"
- "How do I gate content for paid members?"
- "Add a logout button"

Claude will detect your stack and provide the appropriate code examples.

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
