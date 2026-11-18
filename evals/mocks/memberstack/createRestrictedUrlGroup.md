---
expect:
  input.name: string
  input.redirect: string
  input.urls: array
  input.planIds: array
---

{"data":{"createRestrictedUrlGroup":{"id":"grp_new1","name":"{{input.input.name}}","redirect":"{{input.input.redirect}}"}}}
