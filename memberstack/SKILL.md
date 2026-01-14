---
name: memberstack
description: >
  Memberstack membership management via MCP. Use when: (1) Managing member accounts, authentication, or plan assignments, (2) Creating/configuring subscription plans and pricing, (3) Setting up gated content and URL protection, (4) Working with data tables for custom storage, (5) Handling team management, (6) Integrating with Webflow using data attributes, (7) Any membership site operations. This skill requires the Memberstack MCP to be installed.
---

# Memberstack

## MCP Installation

Install the Memberstack MCP before using this skill:

```bash
claude mcp add memberstack --scope user npx mcp-remote https://mcp.memberstack.com/mcp
```

After installation, restart Claude Code. Verify by checking that `mcp__memberstack__*` tools are available.

**Troubleshooting**: If authentication fails, clear cached tokens:
```bash
rm -rf ~/.mcp-auth
```
Then restart Claude Code and re-authenticate.

## Quick Start

### 1. Verify Connection
```
currentApp → Check if an app is selected
```

### 2. Select App (if needed)
```
listApps → See available apps
switchApp(appId) → Select an app
```

### 3. Check Environment
```
getMemberstackEnvironment → Returns LIVE or SANDBOX
switchMemberstackEnvironment(environment) → Switch between LIVE/SANDBOX
```

**Important**: Environment only affects member operations. Plans, data tables, content groups, and other configurations always use LIVE mode.

## Tool Discovery

### Core Tools (Always Available)
| Tool | Purpose |
|------|---------|
| `listApps` | List all accessible apps |
| `switchApp` | Select an app context |
| `currentApp` | Get current app details |
| `currentUser` | Get dashboard user info |
| `getMemberstackEnvironment` | Check LIVE/SANDBOX mode |
| `switchMemberstackEnvironment` | Toggle environment |
| `memberstackKnowledgeSearch` | Search documentation |
| `explore_tools` | Browse tool categories |
| `get_tool_schema` | Load tool schema before use |

### Discovering Other Tools
For any non-core tool:
1. `explore_tools` → See categories and tool counts
2. `explore_tools(category)` → List tools in category
3. `get_tool_schema(toolName)` → Load full schema
4. Call the tool with correct parameters

**Never call a non-core tool without loading its schema first.**

### Tool Categories
| Category | Count | Operations |
|----------|-------|------------|
| members | 15 | CRUD, plan assignments, import/export |
| plans | 9 | Create/manage subscriptions, prices |
| dataTables | 14 | Custom database operations |
| gatedContent | 15 | URL protection, content groups |
| teams | 4 | Team management, invites |
| customFields | 4 | Member profile fields |
| stripe | 1 | Payment integration |

## Key Concepts

### Apps
Isolated projects containing members, plans, data tables, and gated content. Each app has its own configuration.

### Environments
- **LIVE**: Production data, real members
- **SANDBOX**: Test data, Stripe test mode

### Members vs Dashboard Users
- **Members**: End-users who sign up on your site
- **Dashboard Users**: Developers/admins who manage the Memberstack dashboard

### Member Data Storage
| Type | Scope | Limit | Write Access |
|------|-------|-------|--------------|
| Custom Fields | Global (all members) | 100 fields, boolean/string/integer | Frontend + Backend |
| Metadata | Per-member | 500 chars, 50 key-value pairs | Backend only |
| Member JSON | Per-member | 1MB, nested structures | Frontend + Backend |

### Plans
- **Free plans**: No payment required
- **One-time plans**: Single purchase
- **Recurring plans**: Subscription via Stripe

### Data Tables
Custom database with access rules:
- `PUBLIC`: Anyone can access
- `AUTHENTICATED`: Logged-in members only
- `AUTHENTICATED_OWN`: Members can only access their own records
- `ADMIN_ONLY`: Dashboard users only

## Common Tasks

### Member Management
| Task | Tool |
|------|------|
| Get member by ID | `getMember(id)` |
| Search members | `getMembers(filters, search)` |
| Create member | `createMemberEmailPassword(email, password)` |
| Update profile | `updateMember(memberId, customFields, metaData)` |
| Add free plan | `addFreePlan(memberId, planId)` |
| Remove free plan | `removeFreePlan(memberId, planId)` |
| Bulk import | `importMembers(members[])` |
| Export | `exportMembers()` |

### Plan Management
| Task | Tool |
|------|------|
| List plans | `getPlans()` |
| Create plan | `createPlan(name, description)` |
| Add price | `createPrice(planId, amount, interval)` |
| Import from Stripe | `importStripeProduct(productId)` |

### Content Gating
| Task | Tool |
|------|------|
| List content groups | `getContentGroups()` |
| Create group | `createRestrictedUrlGroup(name, urls, planIds)` |
| Add URL | `createRestrictedUrl(url, groupId)` |
| Grant plan access | `linkPlansToRestrictedUrlGroup(groupId, planIds)` |

### Data Tables
| Task | Tool |
|------|------|
| List tables | `getDataTables()` |
| Create table | `createDataTable(name, key)` |
| Add field | `createDataTableField(tableId, key, name, type)` |
| Create record | `createDataRecord(tableId, data)` |
| Query records | `getDataRecords(tableId, filter)` |

## Knowledge Search

Use `memberstackKnowledgeSearch` for:
- Webflow integration details
- Dashboard configuration
- Third-party integrations (Zapier, Make.com)
- Frontend SDK (DOM package)
- Webhooks setup

**Always include source URLs in responses** when using knowledge search results.

Categories: `help center`, `blog post`, `component`, `template`, `memberscript`

## Reference Files

For detailed documentation, see:
- `references/mcp-tools.md` - Complete MCP tool reference with schemas
- `references/dom-package.md` - Frontend JavaScript SDK methods
- `references/webflow-attributes.md` - All data-ms-* attributes
- `references/workflows.md` - Multi-step workflow patterns
