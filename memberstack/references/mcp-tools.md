# Memberstack MCP Tools Reference

Complete reference for all Memberstack MCP tools. Always use `get_tool_schema(toolName)` before calling any tool to verify current parameters.

## Table of Contents
- [Core Tools](#core-tools)
- [Members (15 tools)](#members)
- [Plans (9 tools)](#plans)
- [Data Tables (14 tools)](#data-tables)
- [Gated Content (15 tools)](#gated-content)
- [Teams (4 tools)](#teams)
- [Custom Fields (4 tools)](#custom-fields)
- [Stripe (1 tool)](#stripe)

---

## Core Tools

These tools are always available without loading schemas.

### listApps
List all Memberstack apps accessible to the dashboard user.
- **Returns**: Array of apps with IDs, names, roles, creation dates

### switchApp
Set the active app context for all subsequent operations.
- **Required**: `appId` (string)
- **Returns**: Selected app details with role

### currentApp
Get the currently selected app's details.
- **Returns**: App object with configuration, environment mode, domains

### currentUser
Get the authenticated dashboard user's profile.
- **Returns**: User object with app connections and permissions

### getMemberstackEnvironment
Check current environment mode for member operations.
- **Returns**: `LIVE` or `SANDBOX`

### switchMemberstackEnvironment
Toggle between LIVE and SANDBOX for member operations.
- **Required**: `environment` ("LIVE" or "SANDBOX")
- **Note**: Only affects member-related tools

### memberstackKnowledgeSearch
Search the Memberstack knowledge base.
- **Required**: `query` (string) - Natural language query
- **Optional**: `sourceCategory` ("help center", "blog post", "component", "template", "memberscript")
- **Returns**: Relevant articles with titles, URLs, content snippets

### explore_tools
Browse available tools by category.
- **Optional**: `category` (string), `search` (string)
- **Returns**: Tool names and descriptions

### get_tool_schema
Load the complete schema for a specific tool.
- **Required**: `toolName` (string)
- **Returns**: Full input schema and usage instructions

---

## Members

15 tools for member management. Environment-specific (SANDBOX/LIVE).

### getMember
Get a single member's complete profile.
- **Required**: `id` (string) - Member ID
- **Returns**: Member object with auth, custom fields, metadata, plans, payments

### getMembers
List/search members with pagination and filters.
- **Optional**:
  - `first` (integer) - Page size
  - `after` (string) - Cursor for pagination
  - `order` ("ASC" | "DESC")
  - `filters.planIds` (array) - Filter by plan
  - `filters.noPlans` (boolean) - Members without plans
  - `filters.status` (array) - "ACTIVE", "TRIALING", "REQUIRES_PAYMENT", "REQUIRES_AUTHENTICATION", "CANCELED"
  - `search` (string) - Search query
- **Returns**: Paginated member list

### getMembersCount
Get total member count with optional filters.
- **Optional**: Same filters as getMembers
- **Returns**: Total count

### getMemberEvents
Get activity events for a member.
- **Required**: `memberId` (string)
- **Returns**: Array of member events

### createMemberEmailPassword
Create a new member with email/password.
- **Required**: `input.email`, `input.password`
- **Optional**:
  - `input.customFields` (object)
  - `input.metaData` (object)
  - `input.plans` (array of `{planId}`)
  - `input.payment.coupon`, `input.payment.cardId`, `input.payment.stripe.paymentMethodId`
  - `input.loginRedirect` (string)
- **Returns**: Created member with auth details

### updateMember
Update member profile and settings.
- **Required**: `input.memberId`
- **Optional**:
  - `input.customFields` (object)
  - `input.metaData` (object)
  - `input.json` (object)
  - `input.verified` (boolean)
  - `input.isModerator` (boolean)
  - `input.trustStatus` ("TRUSTED", "DEFAULT", "BANNED", "SHADOW_BANNED")
  - `input.loginRedirect` (string)
  - `input.stripeCustomerId` (string)
- **Returns**: Updated member

### updateMemberAuth
Update member authentication (email/password).
- **Required**: Member ID and new auth details
- **Returns**: Updated member auth

### deleteMember
Delete a member.
- **Required**: `memberId`
- **Returns**: Confirmation

### addFreePlan
Add a free plan to a member.
- **Required**: `input.memberId`, `input.planId`
- **Returns**: Updated member with plan

### removeFreePlan
Remove a free plan from a member.
- **Required**: `memberId`, `planId`
- **Returns**: Updated member

### removeOneTimePlan
Remove a one-time purchase plan.
- **Required**: `memberId`, `planId`
- **Returns**: Updated member

### generateMemberPassword
Generate a new password for a member.
- **Required**: `memberId`
- **Returns**: New password (handle securely)

### updateMemberNote
Update internal note on a member.
- **Required**: `memberId`, `note`
- **Returns**: Updated member

### importMembers
Bulk import members via background job.
- **Required**: `input.members` (array)
  - Each member: `email` (required), `password`, `hashedPassword`, `customFields`, `metaData`, `plans`, `stripeCustomerId`, `stripeSubscriptionId`, `json`
- **Returns**: Job ID for monitoring

### exportMembers
Export all members to CSV.
- **Returns**: Export job or download link

---

## Plans

9 tools for subscription plan management.

### getPlans
List all plans in the app.
- **Returns**: Array of plans with IDs, names, prices

### getPlan
Get a single plan by ID.
- **Required**: `planId`
- **Returns**: Plan with full details

### createPlan
Create a new subscription plan.
- **Required**: `input.name`, `input.description`
- **Optional**:
  - `input.teamAccountsEnabled` (boolean)
  - `input.teamAccountInviteSignupLink` (string)
  - `input.teamAccountUpgradeLink` (string)
- **Returns**: Created plan

### updatePlan
Update plan settings.
- **Required**: `planId`, update fields
- **Returns**: Updated plan

### deletePlan
Delete a plan.
- **Required**: `planId`
- **Returns**: Confirmation

### createPrice
Create a price for a plan (syncs with Stripe).
- **Required**: `input.planId`, `input.amount`, `input.type` ("SUBSCRIPTION" | "ONETIME"), `input.currency`
- **Optional**:
  - `input.name`, `input.description`, `input.active` (boolean)
  - `input.intervalType` ("YEARLY" | "MONTHLY" | "WEEKLY"), `input.intervalCount` (integer)
  - `input.setupFeeAmount`, `input.setupFeeName`, `input.setupFeeEnabled`
  - `input.freeTrialEnabled`, `input.freeTrialRequiresCard`, `input.freeTrialDays`
  - `input.expirationCount`, `input.expirationInterval` ("MONTHS" | "DAYS")
  - `input.cancelAtPeriodEnd`, `input.maxTeamMembers`, `input.teamAccountsEnabled`
- **Note**: Requires LIVE environment, connected Stripe, and paid Memberstack subscription
- **Returns**: Created Price object

### updatePrice
Update an existing price.
- **Required**: `priceId`, update fields
- **Returns**: Updated price

### updatePlanLogic
Update plan logic rules.
- **Required**: `planId`, logic configuration
- **Returns**: Updated plan logic

### importStripeProduct
Import a product from Stripe.
- **Required**: Stripe `productId`
- **Returns**: Imported plan

---

## Data Tables

14 tools for custom data storage.

### getDataTables
List all data tables.
- **Returns**: Array of tables with IDs, names, fields

### getDataTable
Get a single data table.
- **Required**: `tableId`
- **Returns**: Table with schema and settings

### getDataTableField
Get a specific field definition.
- **Required**: `tableId`, `fieldId`
- **Returns**: Field definition

### getDataRecords
Query records from a table.
- **Required**: `tableId`
- **Optional**:
  - `filter.createdByMemberId` (string)
  - `filter.createdAfter`, `filter.createdBefore` (dates)
  - `filter.search` (string)
  - `filter.fieldFilters` (object)
  - `pagination.first`, `pagination.after`, `pagination.last`, `pagination.before`
- **Returns**: Paginated records

### getDataRecord
Get a single record by ID.
- **Required**: `tableId`, `recordId`
- **Returns**: Record with field values

### createDataTable
Create a new data table.
- **Required**: `input.name`, `input.key`
- **Optional**:
  - `input.createRule`, `input.readRule`, `input.updateRule`, `input.deleteRule`
  - Values: "PUBLIC", "AUTHENTICATED", "AUTHENTICATED_OWN", "ADMIN_ONLY"
- **Returns**: Created table

### updateDataTable
Update data table settings.
- **Required**: `tableId`, update fields
- **Returns**: Updated table

### deleteDataTable
Delete a data table.
- **Required**: `tableId`
- **Returns**: Confirmation

### createDataTableField
Add a field to a table.
- **Required**: `input.tableId`, `input.key`, `input.name`, `input.type`
- **Types**: "TEXT", "TEXT_FILTERABLE", "TEXT_UNIQUE", "NUMBER", "DECIMAL", "BOOLEAN", "DATE", "REFERENCE", "EMAIL", "URL", "VIRTUAL_REFERENCE_LIST", "REFERENCE_MANY", "MEMBER_REFERENCE", "MEMBER_REFERENCE_MANY"
- **Optional**: `input.required`, `input.defaultValue`, `input.tableOrder`, `input.referencedTableId`
- **Returns**: Created field

### updateDataTableField
Update a field definition.
- **Required**: `tableId`, `fieldId`, update fields
- **Returns**: Updated field

### deleteDataTableField
Remove a field from table.
- **Required**: `tableId`, `fieldId`
- **Returns**: Confirmation

### createDataRecord
Create a new record.
- **Required**: `input.tableId`, `input.data` (object with field values)
- **Returns**: Created record

### updateDataRecord
Update an existing record.
- **Required**: `tableId`, `recordId`, `data`
- **Returns**: Updated record

### deleteDataRecord
Delete a record.
- **Required**: `tableId`, `recordId`
- **Returns**: Confirmation

---

## Gated Content

15 tools for URL protection and access rules.

### getContentGroups
List all content groups.
- **Returns**: Array of groups with URLs and plan access

### getContentGroup
Get a single content group.
- **Required**: `groupId`
- **Returns**: Group with full details

### createRestrictedUrl
Add a URL to protect.
- **Required**: `input.url`, `input.restrictedUrlGroupId`
- **Optional**: `input.filter` ("STARTS" | "EQUALS")
- **Returns**: Created restricted URL

### updateRestrictedUrl
Update restricted URL settings.
- **Required**: `urlId`, update fields
- **Returns**: Updated URL

### deleteRestrictedUrl
Remove URL protection.
- **Required**: `urlId`
- **Returns**: Confirmation

### createRestrictedUrlGroup
Create a content group with URLs and access rules.
- **Required**: `input.name`, `input.redirect`, `input.planIds`, `input.urls`, `input.allowAllMembers`, `input.customContent`
- **Optional**:
  - `input.urls[].url`, `input.urls[].filter` ("STARTS" | "EQUALS")
  - `input.key` (string)
  - `input.customContent[].content`, `input.customContent[].name`, `input.customContent[].type` ("HTML", "CSS", "LINK", "JS", "JSON", "TEXT", "IMAGE", "FILE")
- **Returns**: Created group

### updateRestrictedUrlGroup
Update content group settings.
- **Required**: `groupId`, update fields
- **Returns**: Updated group

### deleteRestrictedUrlGroup
Delete a content group.
- **Required**: `groupId`
- **Returns**: Confirmation

### linkRestrictedUrlsToRestrictedUrlGroup
Add URLs to a group.
- **Required**: `groupId`, `urlIds` (array)
- **Returns**: Updated group

### detachRestrictedUrlsFromRestrictedUrlGroup
Remove URLs from a group.
- **Required**: `groupId`, `urlIds` (array)
- **Returns**: Updated group

### linkPlansToRestrictedUrlGroup
Grant plan access to a content group.
- **Required**: `input.restrictedUrlGroupId`, `input.planIds` (array)
- **Returns**: Updated group with linked plans

### detachPlansFromRestrictedUrlGroup
Remove plan access from a group.
- **Required**: `groupId`, `planIds` (array)
- **Returns**: Updated group

### createCustomContent
Create a custom content block.
- **Required**: Content details
- **Returns**: Created content

### updateCustomContent
Update custom content.
- **Required**: Content ID, update fields
- **Returns**: Updated content

### deleteCustomContent
Delete custom content.
- **Required**: Content ID
- **Returns**: Confirmation

---

## Teams

4 tools for team management.

### getTeam
Get team details.
- **Required**: `teamId`
- **Returns**: Team with settings and member count

### getTeamMembers
List members of a team.
- **Required**: `teamId`
- **Returns**: Array of team members

### removeTeamMember
Remove a member from a team.
- **Required**: `teamId`, `memberId`
- **Returns**: Confirmation

### regenerateTeamInviteToken
Generate a new invite link for a team.
- **Required**: `teamId`
- **Returns**: New invite token/URL

---

## Custom Fields

4 tools for member profile custom fields.

### getCustomFields
List all custom fields.
- **Returns**: Array of fields with IDs, names, types

### createCustomField
Create a new custom field.
- **Required**: Field name, type, configuration
- **Returns**: Created field with generated ID

### updateCustomField
Update custom field settings.
- **Required**: `fieldId`, update fields
- **Returns**: Updated field

### deleteCustomField
Delete a custom field.
- **Required**: `fieldId`
- **Returns**: Confirmation

---

## Stripe

1 tool for Stripe integration.

### createStripeCustomer
Create a Stripe customer for a member.
- **Required**: `memberId`
- **Returns**: Stripe customer ID linked to member
