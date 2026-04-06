---
description: Manages sprint planning and sprint summary reporting for NexusAI. Use when tasks involve preparing a new sprint, assigning tickets to a sprint, estimating story points, or writing a sprint summary at the end of a sprint.
---

# Jira Sprint Planning Skill

## Use This Skill When

- Preparing the backlog for an upcoming sprint.
- Assigning story points and priorities before sprint kick-off.
- Writing a sprint summary / retrospective report at the end of a sprint.
- Identifying and escalating blocked or stalled tickets mid-sprint.

## Sprint Preparation Checklist

Before a sprint starts, verify every ticket planned for the sprint has:

- [ ] A clear, imperative **Summary** (max 80 chars).
- [ ] **Type** set: Story / Bug / Task / Sub-task.
- [ ] **Priority** set: Highest / High / Medium / Low / Lowest.
- [ ] **Story Points** estimated (use the Fibonacci scale below).
- [ ] **Assignee** set to a team member.
- [ ] **Label** set: `frontend`, `backend`, `qa`, `devops`, or `research`.
- [ ] Acceptance criteria written in the description.
- [ ] Linked to its parent **Epic** if one exists.

## Story Point Scale (Fibonacci)

| Points | Effort / Complexity |
|---|---|
| 1 | Trivial change, no risk — a config update or copy fix |
| 2 | Small, well-understood task — a minor UI tweak or simple endpoint |
| 3 | Moderate task — a standard CRUD feature or Redux slice |
| 5 | Complex task — new module, multi-component UI, or tricky integration |
| 8 | Large task — spans frontend + backend, or has significant unknowns |
| 13 | Very large — should be broken into smaller tickets before assigning |

> Anything estimated at **13+** must be split before entering the sprint.

## Sprint Goal Template

Write a one-sentence sprint goal before kick-off:

```
Sprint <N> Goal: Deliver <primary outcome> so that <user/business value>.
```

**Example:**
```
Sprint 7 Goal: Deliver the agent builder UI and catalog search API so that
users can browse and deploy custom agents from the marketplace.
```

## Mid-Sprint Health Check

Run this check at the midpoint of each sprint:

- [ ] All **In Progress** tickets have had activity in the last 2 days.
- [ ] No ticket has been **In Progress** for more than 3 days without a comment.
- [ ] Any **Blocked** ticket has a blocker comment referencing the blocking issue.
- [ ] Scope changes (additions/removals) are documented in a sprint comment.

If a ticket is at risk of not completing, add a `⚠️ at-risk` label and notify the team.

## Sprint Summary Template

Post this summary to the `#nexus-updates` channel and attach it to the sprint in Jira:

```markdown
## Sprint <N> Summary — <YYYY-MM-DD> to <YYYY-MM-DD>

**Goal**: <Sprint goal statement>
**Velocity**: <Completed story points> / <Committed story points>

### Completed ✅
- NEXUS-XX (<N> pts): <Summary>
- NEXUS-XX (<N> pts): <Summary>

### Carried Over ➡️
- NEXUS-XX (<N> pts): <Summary> — Reason: <brief reason>

### Blocked ❌
- NEXUS-XX (<N> pts): <Summary> — Blocked by: NEXUS-XX

### Retrospective Notes
**What went well:**
- ...

**What to improve:**
- ...

**Action items for next sprint:**
- [ ] <Concrete action with owner>
```

## Backlog Grooming Rules

- Tickets in the backlog older than **30 days** without updates must be reviewed — close as `Won't Do` or re-prioritize.
- Sub-tasks must not exceed **3 story points** — if larger, promote to a full Task.
- Bugs with **Highest** or **High** priority must be slotted into the next sprint automatically.
- Epics should have a target completion date and at least one story linked to them.

## Verification Checklist

- [ ] Sprint goal is written and visible on the board.
- [ ] All planned tickets have story points and an assignee.
- [ ] No ticket exceeds 8 points (13+ must be split).
- [ ] Sprint summary posted within 24 hours of sprint end.
- [ ] Carried-over tickets have a documented reason in their comments.
