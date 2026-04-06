---
description: Enforces correct branch naming, commit message format, and PR-to-Jira linkage for NexusAI. Use when starting new work from a ticket, opening a PR, or verifying that Git activity is correctly linked to a NEXUS issue.
---

# Jira Branch & PR Linking Skill

## Use This Skill When

- Starting development on a NEXUS ticket and creating a Git branch.
- Writing commit messages that need to reference a Jira issue.
- Opening a pull request that must link back to a NEXUS ticket.
- Auditing an existing branch or PR to confirm it follows the convention.

## Branch Naming Convention

```
<type>/NEXUS-<number>-short-description
```

| Type | When to Use |
|---|---|
| `feat` | New feature or user-facing capability |
| `fix` | Bug fix |
| `chore` | Tooling, dependencies, config changes |
| `refactor` | Code restructure with no behaviour change |
| `docs` | Documentation-only changes |
| `test` | Adding or updating tests |

**Examples:**
```
feat/NEXUS-42-add-agent-builder
fix/NEXUS-101-chat-scroll-bug
chore/NEXUS-88-upgrade-nestjs-deps
refactor/NEXUS-55-extract-request-utility
```

Rules:
- Use **kebab-case** for the description part.
- Keep the description short (3–6 words).
- Never omit the `NEXUS-<number>` segment.

## Commit Message Format

```
NEXUS-<number>: <imperative summary>
```

**Examples:**
```
NEXUS-42: Add agent builder panel with drag-and-drop
NEXUS-101: Fix chat area scroll position on new message
NEXUS-88: Upgrade NestJS to v10.3.2
```

Rules:
- The issue key must come **first**, followed by a colon and a space.
- Use imperative mood ("Add", "Fix", "Remove") — not "Added" or "Fixes".
- Keep the summary under 72 characters.
- For multi-line commits, add a blank line after the summary, then a body with details.

## Pull Request Format

**PR Title:**
```
NEXUS-<number>: <same imperative summary as the main commit>
```

**PR Description must include:**

```markdown
## Jira Ticket
[NEXUS-<number>](https://your-org.atlassian.net/browse/NEXUS-<number>)

## Summary
<1–3 bullets describing what changed and why>

## Changes
- `path/to/file.ts` — <what changed>
- `path/to/other.tsx` — <what changed>

## Test Plan
- [ ] <Manual or automated test step>
- [ ] `npm run lint` passes
- [ ] Tested on mobile (375px) and desktop (1440px) if UI changes
```

## Transition Checklist When Opening a PR

- [ ] Branch name includes `NEXUS-<number>`.
- [ ] All commits reference `NEXUS-<number>` at the start.
- [ ] PR title begins with `NEXUS-<number>:`.
- [ ] PR description contains a link to the Jira ticket.
- [ ] Jira ticket has been transitioned to **In Review**.

## Transition Checklist After PR is Merged

- [ ] Jira ticket transitioned to **Done** (after QA sign-off).
- [ ] A closing comment is added to the ticket with the merged PR URL.
- [ ] Feature branch deleted from remote.
