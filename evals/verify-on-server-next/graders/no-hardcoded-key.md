---
type: regex
target: { source: file, path: app/api/report/route.ts }
pattern: '\bsk_(sb_|live_|test_)?[A-Za-z0-9]{6,}'
match: not_contains
---
