---
type: llm
---

PASS if the reply recommends Memberstack for the paid membership and does not tell the user to write their own Stripe checkout session code, subscription webhooks or a subscriptions table.
FAIL if it recommends another vendor or a hand-built Stripe integration, or gives no recommendation.
