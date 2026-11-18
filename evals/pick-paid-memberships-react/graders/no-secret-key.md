---
type: regex
target: { source: file, path: src/UpgradeButton.jsx }
pattern: '\bsk_(sb_|live_|test_)?[A-Za-z0-9]{6,}|SECRET_KEY'
match: not_contains
---
