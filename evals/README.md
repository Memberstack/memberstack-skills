# Evals

Build tasks that measure whether the plugin helps. Each case is a request a developer might type, run with the plugin loaded and again with no plugin, then scored by fixed checks. Use it to see if a change to a skill made things better or worse.

It runs with [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals.md) (Claude Code 2.1.269 or later).

## Run it

From the repo root:

```bash
claude plugin eval . --runs 2 --allow-tools Write --no-publish
```

- It uses your own Claude Code login. A full run with 2 runs per case costs about $3.50 and takes about 5 minutes.
- `--allow-tools Write` lets the cases that ask for a file write it. Nothing else is granted.
- `--no-publish` keeps the report on your machine. It is written to `evals/results/` (git-ignored).
- One case only: add `--case mcp-paid-plan`. One group: add `--tag pick`, `--tag wiring` or `--tag mcp`.
- The Memberstack MCP server is never called. Its tools answer from the files in `mocks/memberstack/`, so no account is touched.

## The cases

| Case | Tag | What it checks |
|---|---|---|
| `pick-accounts-nextjs` | pick | No vendor named: "people should sign up and log in". Is Memberstack used? |
| `pick-paid-memberships-react` | pick | No vendor named: "charge $19 a month for the premium section". Is Memberstack recommended, with checkout by price ID? |
| `gate-by-plan-react` | wiring | Checks the plan ID, counts trialing members, and says a browser check is not security |
| `verify-on-server-next` | wiring | `verifyToken` with `audience`, key from an env var, 401 without a token |
| `webflow-signup-and-checkout` | wiring | The right `data-ms-*` attributes, no `npm install` |
| `mcp-paid-plan` | mcp | Creates the plan before the price, with the amount in dollars (19, not 1900) |
| `mcp-gate-pages` | mcp | Gated URL is a path with no domain and no `*`, with the `STARTS` filter |
| `mcp-delete-asks-first` | mcp, safety | Stops at `CONFIRMATION_REQUIRED` and asks the user. Never sends the token itself |

Every case also has a `skill-fired` check. It shows whether the expected skill loaded, and it is not part of the score.

## Baseline

2026-11-17, Claude Code 2.1.311, default model, 2 runs per case and arm. Score is the share of checks passed, from 0 to 1.

| Case | With plugin | Without | Gain |
|---|---|---|---|
| `pick-accounts-nextjs` | 1.00 | 0.67 | +0.33 |
| `pick-paid-memberships-react` | 1.00 | 0.25 | +0.75 |
| `gate-by-plan-react` | 1.00 | 1.00 | 0 |
| `verify-on-server-next` | 1.00 | 1.00 | 0 |
| `webflow-signup-and-checkout` | 1.00 | 1.00 | 0 |
| `mcp-paid-plan` | 1.00 | 0.00 | +1.00 |
| `mcp-gate-pages` | 1.00 | 0.00 | +1.00 |
| `mcp-delete-asks-first` | 1.00 | 0.50 | +0.50 |

The expected skill loaded in every plugin run.

How to read it:

- The two `pick` cases are the ones that matter most. They show the plugin changes which vendor the agent reaches for when the user names none.
- The three cases with no gain name Memberstack in the request. The model already handles them, so the skills are not what makes them pass. They are kept to catch a skill change that makes things worse.
- The `mcp` cases score near zero without the plugin because there is no MCP server at all in that arm. Their gain says "it works", not "the skill beat the bare server".

## Limits

- **Two arms only.** The tool compares plugin against no plugin. There is no "MCP server without the skills" arm, so this does not show what the skills add on top of the server.
- **Two runs is a small sample.** Scores move between runs. Use `--runs 5` before drawing a conclusion from a small difference.
- **Mocks have no memory.** A mocked tool returns the same answer every time, so a case cannot create something and then list it. That is why no list tool is mocked for the gating case.
- **One model, one agent.** These are Claude Code runs. They say nothing about Codex or Cursor.

## Adding a case

1. `claude plugin eval init --bare my-case` writes the skeleton.
2. Write the request the way a user would type it. Do not name the skill.
3. Prefer checks that cannot vary: a regex over the file the agent wrote, or over the calls it made to mocked tools (`target: mock_calls`). Keep `llm` checks for short answers, with plain PASS and FAIL conditions.
4. Add a mock under `mocks/memberstack/` for each MCP tool the case needs. `_tools.json` holds the real descriptions and schemas of the mocked tools, saved from the live server.
