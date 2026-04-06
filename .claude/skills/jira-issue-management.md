---
description: Creates and updates Jira tickets for NexusAI work. Use when tasks involve writing new issues, updating ticket fields, filing bug reports, or transitioning ticket statuses on the NEXUS board.
---

# Jira Issue Management Skill

## Use This Skill When

- Creating a new Story, Bug, Task, or Sub-task on the NEXUS board.
- Updating an existing ticket's summary, description, priority, or labels.
- Transitioning a ticket through the workflow (To Do → In Progress → In Review → Done).
- Filing a bug found during QA or reported from production.
- Linking a ticket to a parent Epic.

## Ticket Key Convention

All NexusAI tickets follow the pattern: **`NEXUS-<number>`** (e.g., `NEXUS-42`).

## Required Fields for Every Ticket

| Field | Guidance |
|---|---|
| **Summary** | Imperative sentence, max 80 chars — e.g., "Add pagination to /catalog endpoint" |
| **Type** | Story / Bug / Task / Sub-task |
| **Priority** | Highest / High / Medium / Low / Lowest |
| **Description** | Context + acceptance criteria + technical notes (use template below) |
| **Labels** | At least one: `frontend`, `backend`, `qa`, `devops`, `research` |
| **Epic Link** | Link to the relevant epic if one exists |

## Story / Task Description Template

```
## Context
<Why this work is needed and what it enables>

## Acceptance Criteria
- [ ] <Criterion 1>
- [ ] <Criterion 2>
- [ ] <Criterion 3>

## Technical Notes
<Any implementation hints, relevant files, or API contracts>
```

## Bug Report Template

```
**Environment**: Development / Staging / Production
**Severity**: Critical / Major / Minor / Trivial
**Browser / Device**: (e.g., Chrome 124, iPhone 14 Pro)

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Behavior**:
...

**Actual Behavior**:
...

**Logs / Screenshots**:
(Attach console errors or screenshots)
```

## Status Transition Workflow

```
To Do → In Progress → In Review → Done
              ↓
           Blocked  (add a comment linking the blocking ticket)
```

- Move to **In Progress** when a branch is created.
- Move to **In Review** when a PR is opened.
- Move to **Done** only after the PR is merged **and** QA has signed off.
- If blocked, comment with: `Blocked by NEXUS-<number>: <reason>`.

## Priority Guidelines

| Priority | When to Use |
|---|---|
| Highest | Production outage or data loss |
| High | Core feature broken, no workaround |
| Medium | Feature incomplete or degraded UX |
| Low | Minor UI inconsistency or polish |
| Lowest | Nice-to-have, no user impact |

## Verification Checklist

- [ ] Ticket has a clear, imperative summary.
- [ ] Type, priority, and at least one label are set.
- [ ] Description includes context and acceptance criteria.
- [ ] Epic link is set if a parent epic exists.
- [ ] Ticket status matches the current development state.
