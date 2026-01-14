# Common Memberstack Workflows

Multi-step patterns for common membership site operations.

## Table of Contents
- [Initial Setup](#initial-setup)
- [Member Management](#member-management)
- [Plan Configuration](#plan-configuration)
- [Content Gating](#content-gating)
- [Data Tables](#data-tables)
- [Team Management](#team-management)

---

## Initial Setup

### Setting Up a New Membership Site

```
1. currentApp
   → Verify MCP is connected
   → Check if app is already selected

2. listApps
   → Get available apps

3. switchApp(appId)
   → Select your app

4. getMemberstackEnvironment
   → Check current environment

5. switchMemberstackEnvironment("SANDBOX")
   → Use sandbox for initial testing
```

### Verifying MCP Connection

```
1. currentApp
   → If returns app details: MCP connected
   → If error: MCP not installed or not authenticated

2. listApps
   → Confirms API access
   → Shows available apps and permissions
```

---

## Member Management

### Creating a Test Member

```
1. switchMemberstackEnvironment("SANDBOX")
   → Ensure using test environment

2. getPlans
   → Get available plans if assigning one

3. createMemberEmailPassword({
     email: "test@example.com",
     password: "testpass123",
     plans: [{ planId: "pln_xxx" }]
   })
   → Creates member with plan

4. getMember(memberId)
   → Verify member was created correctly
```

### Bulk Member Import

```
1. switchMemberstackEnvironment("SANDBOX")
   → Test import first

2. getPlans
   → Get plan IDs for assignment

3. importMembers({
     members: [
       { email: "user1@example.com", password: "pass1", plans: [{ planId: "pln_xxx" }] },
       { email: "user2@example.com", password: "pass2", plans: [{ planId: "pln_xxx" }] }
     ]
   })
   → Returns job ID

4. getMembers({ search: "user1@example.com" })
   → Verify import success
```

### Updating Member Data

```
1. getMember(memberId) or getMembers({ search: "email@example.com" })
   → Get current member data

2. updateMember({
     memberId: "mem_xxx",
     customFields: { company: "Acme Inc" },
     metaData: { source: "api-import" }
   })
   → Update profile fields

3. getMember(memberId)
   → Verify changes
```

### Managing Member Plans

```
# Add free plan
1. getPlans
   → Find free plan ID

2. addFreePlan({
     memberId: "mem_xxx",
     planId: "pln_free"
   })

# Remove free plan
3. removeFreePlan({
     memberId: "mem_xxx",
     planId: "pln_free"
   })

# Note: Paid plans are managed via Stripe, not these tools
```

---

## Plan Configuration

### Creating Tiered Pricing

```
1. createPlan({
     name: "Free Tier",
     description: "Basic access"
   })
   → Save returned planId

2. createPlan({
     name: "Pro Tier",
     description: "Full access"
   })
   → Save returned planId

3. get_tool_schema("createPrice")
   → Load price schema

4. createPrice({
     planId: "pln_pro",
     amount: 1900,  // $19.00
     type: "SUBSCRIPTION",
     currency: "usd",
     intervalType: "MONTHLY"
   })

5. createPrice({
     planId: "pln_pro",
     amount: 19000,  // $190.00 (save 2 months)
     type: "SUBSCRIPTION",
     currency: "usd",
     intervalType: "YEARLY"
   })

6. getPlans
   → Verify all plans and prices
```

### Importing Stripe Products

```
1. get_tool_schema("importStripeProduct")
   → Load schema

2. importStripeProduct({
     productId: "prod_xxx"  // From Stripe dashboard
   })
   → Creates plan with prices from Stripe
```

---

## Content Gating

### Protecting URLs

```
1. createRestrictedUrlGroup({
     name: "Premium Content",
     redirect: "/upgrade",
     planIds: ["pln_pro"],
     urls: [
       { url: "/premium", filter: "STARTS" },
       { url: "/members-only.html", filter: "EQUALS" }
     ],
     allowAllMembers: false,
     customContent: []
   })
   → Creates content group with URLs

2. getContentGroups
   → Verify group was created
```

### Adding URLs to Existing Group

```
1. getContentGroups
   → Find group ID

2. createRestrictedUrl({
     url: "/new-protected-page",
     restrictedUrlGroupId: "grp_xxx",
     filter: "EQUALS"
   })
```

### Granting Plan Access to Content

```
1. getContentGroups
   → Find group ID

2. getPlans
   → Find plan IDs to grant access

3. linkPlansToRestrictedUrlGroup({
     restrictedUrlGroupId: "grp_xxx",
     planIds: ["pln_pro", "pln_enterprise"]
   })
```

---

## Data Tables

### Creating a Custom Database

```
1. createDataTable({
     name: "User Profiles",
     key: "user_profiles",
     createRule: "AUTHENTICATED",
     readRule: "AUTHENTICATED_OWN",
     updateRule: "AUTHENTICATED_OWN",
     deleteRule: "ADMIN_ONLY"
   })
   → Save tableId

2. createDataTableField({
     tableId: "tbl_xxx",
     key: "bio",
     name: "Biography",
     type: "TEXT",
     required: false
   })

3. createDataTableField({
     tableId: "tbl_xxx",
     key: "avatar_url",
     name: "Avatar URL",
     type: "URL",
     required: false
   })

4. createDataTableField({
     tableId: "tbl_xxx",
     key: "member",
     name: "Member",
     type: "MEMBER_REFERENCE",
     required: true
   })

5. getDataTable(tableId)
   → Verify schema
```

### Adding Records

```
1. getDataTables
   → Find table ID

2. getDataTable(tableId)
   → Get field keys

3. createDataRecord({
     tableId: "tbl_xxx",
     data: {
       bio: "Hello, I'm a developer",
       avatar_url: "https://example.com/avatar.jpg",
       member: "mem_xxx"
     }
   })
```

### Querying Records

```
1. getDataRecords({
     tableId: "tbl_xxx",
     filter: {
       createdByMemberId: "mem_xxx"
     },
     pagination: {
       first: 10
     }
   })

# With search
2. getDataRecords({
     tableId: "tbl_xxx",
     filter: {
       search: "developer"
     }
   })
```

---

## Team Management

### Viewing Team Members

```
1. getMember(memberId)
   → Check if member has team

2. getTeam(teamId)
   → Get team details

3. getTeamMembers(teamId)
   → List all team members
```

### Removing Team Member

```
1. getTeamMembers(teamId)
   → Find member to remove

2. removeTeamMember({
     teamId: "team_xxx",
     memberId: "mem_xxx"
   })
```

### Generating New Invite Link

```
1. regenerateTeamInviteToken(teamId)
   → Returns new invite token/URL
```

---

## Troubleshooting Workflows

### Member Can't Access Content

```
1. getMember(memberId)
   → Check member's plans

2. getContentGroups
   → Find content group for the URL

3. getContentGroup(groupId)
   → Check which plans have access

4. Compare member's plans with content group's allowed plans
   → If missing, use addFreePlan or direct member to upgrade
```

### Plan Not Showing on Site

```
1. getPlans
   → Verify plan exists and is active

2. getPlan(planId)
   → Check plan configuration

3. Use memberstackKnowledgeSearch("how to display plans in Webflow")
   → Get Webflow integration guidance
```

### Data Table Access Issues

```
1. getDataTable(tableId)
   → Check access rules

2. getMember(memberId)
   → Check member's authentication status

3. Compare member status with table's readRule/createRule/etc.
   → Adjust rules if needed with updateDataTable
```
