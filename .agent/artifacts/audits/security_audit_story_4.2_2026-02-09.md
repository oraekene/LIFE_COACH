# Security Audit - Story 4.2: Automated Archival

**Date:** 2026-02-09
**Auditor:** @security-auditor

## Scope
- `src/services/ArchivalService.ts`
- `src/services/MoltbotScheduler.ts`
- `src/types/Memory.ts`

## Findings

### 1. Potential Cross-Site Scripting (XSS) via Project Names
- **Severity:** Low (Context-dependent)
- **Location:** `ArchivalService.ts`, method `generateSuggestion`
- **Description:** The `generateSuggestion` method interpolates `project.name` directly into a string: `` `Project '${project.name}' completed? Move to Archives?` ``.
- **Risk:** If a user (or an attacker with access to data sync) names a project with malicious JavaScript (e.g., `<script>alert(1)</script>`), and this suggestion string is rendered in the UI using unsafe methods (like `dangerouslySetInnerHTML` in React), it could execute the script.
- **Recommendation:**
    - Ensure the UI component displaying these suggestions treats the content as text, not HTML.
    - Alternatively, sanitize `project.name` before interpolation if the output format is expected to be HTML.

### 2. Missing Authorization Checks
- **Severity:** Medium (Architectural)
- **Location:** `ArchivalService.ts`, method `archiveProject`
- **Description:** The `archiveProject` method accepts a `projectId` and performs the action (mocked) without validating if the requesting user owns or has permissions to modify that project.
- **Risk:** In the future connected implementation, an attacker might be able to archive other users' projects if they can guess IDs and call this service endpoint.
- **Recommendation:** Ensure the implementation of `archiveProject` includes a check against the current authenticated user's ID or utilizes a repository layer that enforces tenant isolation (e.g., Row Level Security in the database).

### 3. Lack of Audit Logging for State Changes
- **Severity:** Low
- **Location:** `ArchivalService.ts`, method `archiveProject`
- **Description:** "Archiving" is a state change that hides data. There is no logging of *when* or *why* (automated vs manual) this happened.
- **Risk:** Hard to debug "missing" projects if users claim they didn't archive them.
- **Recommendation:** Add an audit log entry when a project status is changed.

## Conclusion
The current implementation is functionally correct for the story's scope (local logic). The identified risks are primarily concerns for the integration verification phase and future multi-tenant implementation steps.
