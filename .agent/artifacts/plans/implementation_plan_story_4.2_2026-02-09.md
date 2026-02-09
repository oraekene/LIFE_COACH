# Implementation Plan - Story 4.2: Automated Archival

## Goal Description
Automate the review and archival of old projects to keep the user's workspace clean and relevant. This involves a weekly automated review, suggestions to archive completed projects, and a graceful decay mechanism for old "cold" facts.

## User Review Required
> [!NOTE]
> The "Graph view" acceptance criterion will be implemented as a data structure update/verification for this story, as the full UI visualization might be part of a larger Graph implementation. We will ensure the *relationships* are correctly updated.

## Proposed Changes

### Core Logic
#### [NEW] [ArchivalService.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/ArchivalService.ts)
- `checkProjectActivity(projects: Project[]): Project[]`: Identifies projects inactive > 30 days.
- `generateSuggestion(project: Project): string`: Returns "Project [Name] completed? Move to Archives?".
- `archiveProject(projectId: string): Promise<void>`: Updates project status to 'Archived'.

### Cron/Scheduler
#### [NEW] [MoltbotScheduler.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/MoltbotScheduler.ts)
- Stub or implementation of a weekly scheduler (cron).
- `runWeeklyReview()`: Calls `ArchivalService`.

### Data Layer
#### [MODIFY] [types.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/types/index.ts)
- Update `Project` interface to include `lastActiveDate`, `status` ('Active' | 'Archived').

## Verification Plan

### Automated Tests
- `src/tests/story_4_2_automated_archival.test.tsx`:
    - Test identification of cold projects (>30 days).
    - Test suggestion text generation.
    - Test project status update logic.
    - Test mock cron execution trigger.

### Manual Verification
- Manually trigger the "Weekly Review" (via a dev button or console).
- Verify "Cold" projects are flagged.
- Verify archiving works.
