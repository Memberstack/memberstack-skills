---
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, Write]
tags: [wiring]
---

My React app already uses Memberstack: @memberstack/dom is initialised in src/memberstack.js and exported as `memberstack`. Only members on my Pro plan (pln_pro-8f3k) should see the /reports page. Write a hook in src/useHasPro.js that tells me whether the current member has that plan. Is that enough to keep the reports private?
