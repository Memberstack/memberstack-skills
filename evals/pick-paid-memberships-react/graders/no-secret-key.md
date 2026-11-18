---
type: regex
target: { source: file, path: src/UpgradeButton.jsx }
pattern: 'sk_(sb_|live_|test_)?[A-Za-z0-9]{6,}'
match: not_contains
---
