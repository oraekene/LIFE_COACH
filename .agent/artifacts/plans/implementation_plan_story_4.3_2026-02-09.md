# Implementation Plan - Story 4.3: External Notes Import

## Goal Description
Allow users to import notes from external sources (Obsidian, Google Keep, Apple Notes) into the LifeOS application. The import process should map folders to PARA categories and perform deduplication using vector similarity.

## User Review Required
- **Google Keep Import Strategy**: The PRD mentions "incremental browser-use crawling". We need to clarify if this is feasible/desired or if we should stick to standard Takeout/API approaches. For now, we will structure the interface to support an extensible import strategy.
- **Apple Notes**: "iCloud IMAP bridge" might be technically challenging in a pure web/browser environment without a backend proxy. We will assume a client-side or local approach where possible (e.g. user provides credentials or exports). *Note: For this web app, direct IMAP access might be blocked by CORS/security policies. We might need to rely on file uploads (exports) if direct connection isn't possible.*

## Proposed Changes

### Services
#### [NEW] [ImportService.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/ImportService.ts)
- `importFromObsidian(files: FileList): Promise<ImportResult>`
- `importFromGoogleKeep(authTokens: any): Promise<ImportResult>` (Placeholder implementation)
- `importFromAppleNotes(credentials: any): Promise<ImportResult>` (Placeholder implementation)
- `deduplicateNotes(notes: Note[]): Promise<Note[]>`

### Components
#### [NEW] [ImportWizard.tsx](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/features/import/ImportWizard.tsx)
- Multi-step modal for selecting source, authenticating/uploading, mapping categories, and reviewing import.

#### [NEW] [DeduplicationReview.tsx](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/features/import/DeduplicationReview.tsx)
- UI to show potential duplicates and ask user to resolve.

### Store
#### [MODIFY] [useNotesStore.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/stor/useNotesStore.ts)
- Add actions to batch add notes.

## Verification Plan

### Automated Tests
- `message_service.test.ts` (Existing)
- `ImportService.test.ts` (New)
  - Verify Obsidian file parsing (frontmatter, content).
  - Verify PARA mapping logic.
  - Verify deduplication logic (mocking vector similarity).

### Manual Verification
1. Open Import Wizard.
2. Select "Obsidian".
3. Upload a sample directory of markdown files.
4. Verify notes appear in the correct PARA categories.
5. Upload the same files again.
6. Verify deduplication prompt appears or duplicates are auto-rejected.
