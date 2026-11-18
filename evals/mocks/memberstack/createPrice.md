---
expect:
  input.planId: string
  input.amount: number
  input.currency: string
  input.type: [SUBSCRIPTION, ONETIME]
---

{"data":{"createPrice":{"id":"prc_pro-monthly-new1","planId":"{{input.input.planId}}","amount":{{input.input.amount}},"currency":"{{input.input.currency}}","type":"{{input.input.type}}"}}}
