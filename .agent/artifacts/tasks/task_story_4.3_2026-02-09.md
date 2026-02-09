# Task List - Story 4.3: External Notes Import

## Preparation
- [x] Create implementation plan `implementation_plan_story_4.3_2026-02-09.md`
- [x] Create task list `task_story_4.3_2026-02-09.md`
- [x] Create failing test `src/tests/story_4_3_external_notes_import.test.tsx`

## Implementation
- [x] Create `src/services/ImportService.ts`
  - [x] Implement `importFromObsidian` (file parsing)
  - [x] Implement PARA category mapping
  - [x] Implement `deduplicateNotes` (basic check)
- [x] Create `src/features/import/ImportWizard.tsx`
  - [x] Step 1: Select Source
  - [x] Step 2: Upload/Connect
  - [x] Step 3: Review & Deduplicate
- [x] Update `useNotesStore.ts` to support batch import
- [x] Integrate Import Wizard into Settings or Sidebar

## Verification
- [x] Run `ImportService.test.ts` and ensure it passes
- [x] Manual verification of Obsidian import
- [x] Manual verification of category mapping
- [x] Manual verification of deduplication
