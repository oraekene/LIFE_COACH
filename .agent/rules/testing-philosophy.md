# Testing Philosophy Rules

## Core Principle

> **The goal is NOT to pass tests. The goal of tests IS to verify that generated code works correctly and accurately.**

Tests are the **strict final arbiters** of code quality. They exist to catch bugs, not to be bypassed.

---

## Rule 1: Tests Are Sacred

- **NEVER** modify a test just to make it pass
- **ONLY** modify tests if you are **ABSOLUTELY CERTAIN** the test itself contains:
  - Inherent logical errors
  - Incorrect assertions that don't match acceptance criteria
  - Outdated expectations after PRD changes
- When modifying a test, **explicitly document WHY** the test was wrong

---

## Rule 2: Failing Tests Are Signals

When a test fails:

1. **First assumption**: The implementation is wrong, not the test
2. **Investigate the root cause** before considering any test changes
3. **Fix the implementation** to satisfy the test requirements
4. **Only after exhausting implementation fixes**, consider if the test itself is flawed

---

## Rule 3: Check Dependencies Before Adding Code

When an integration test reveals a missing flow or component:

1. **STOP** before implementing the missing piece
2. **Check the PRD** to determine if the missing item is:
   - A subsequent story scheduled for later
   - A task dependency that should exist now
   - Out of scope entirely
3. **If it's a future story**: Do NOT implement it now — mock it or skip that test path
4. **If it's a current dependency**: Implement it as part of the current story
5. **Document the decision** in the task notes

---

## Rule 4: Test Modification Requires Justification

If you determine a test must be modified, you MUST:

1. **State the specific error** in the original test
2. **Reference the acceptance criteria** that contradicts the test
3. **Explain why the test expectation was incorrect**
4. **Get explicit approval** before modifying test assertions

### Example Justification Format:
```
TEST MODIFICATION REQUIRED:
- Test: `CoachCard.test.tsx` line 45
- Issue: Test expects `rating` prop but acceptance criteria specifies `averageRating`
- PRD Reference: Story 2.1, Acceptance Criteria #3
- Action: Updating test to use correct prop name
```

---

## Rule 5: Integration Test Awareness

For integration and E2E tests:

- **Map test coverage** to PRD stories before running
- **Expect some tests to fail** if they cover future stories
- **Do NOT stub out future functionality** unless explicitly mocking
- **Track which tests are blocked** on future story completion

---

## Quick Reference Checklist

Before modifying ANY test, ask:

- [ ] Is the implementation definitely correct?
- [ ] Does the test match the acceptance criteria exactly?
- [ ] Is this feature part of the current story scope?
- [ ] Have I documented why the test needs changing?
- [ ] Would a senior engineer agree this test is wrong?

If any answer is "No" or "Unsure" → **Fix the implementation, not the test.**
