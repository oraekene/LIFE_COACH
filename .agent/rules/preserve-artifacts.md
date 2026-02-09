# Artifact Preservation Rules

## Core Principle

> **All generated project artifacts must be preserved as versioned files. Never overwrite previous versions.**

---

## Naming Convention

Use this pattern for all artifacts:

```
{artifact_type}_{story_id}_{YYYY-MM-DD}.md
```

**Examples:**
- `implementation_plan_story_2.1_2026-02-08.md`
- `task_story_2.2_2026-02-08.md`
- `security_audit_story_1.3_2026-02-07.md`
- `walkthrough_story_2.1_2026-02-08.md`

---

## Artifacts to Preserve

| Type | Prefix | Save Location |
|------|--------|---------------|
| Implementation Plan | `implementation_plan_` | `.agent/artifacts/plans/` |
| Task List | `task_` | `.agent/artifacts/tasks/` |
| Security Audit | `security_audit_` | `.agent/artifacts/audits/` |
| Walkthrough | `walkthrough_` | `.agent/artifacts/walkthroughs/` |
| Test Plan | `test_plan_` | `.agent/artifacts/tests/` |
| Code Review | `code_review_` | `.agent/artifacts/reviews/` |

---

## Rules

1. **Always determine story ID** from PRD or active task context before creating artifacts
2. **Save to the appropriate subdirectory** under `.agent/artifacts/`
3. **Multiple same-day versions** get suffixed: `_v2`, `_v3`, etc.
4. **Brain directory artifacts** remain unchanged for live task tracking
5. **Archived versions** are the permanent record for audits and retrospectives
