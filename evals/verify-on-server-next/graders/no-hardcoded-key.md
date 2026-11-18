---
type: regex
target: { source: file, path: app/api/report/route.ts }
pattern: 'sk_(sb_)?[A-Za-z0-9]{6,}'
match: not_contains
---
