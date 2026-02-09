# Story 4.1: Quick Capture Implementation Plan

Implementing the Quick Capture feature for PARA Memory Management. This enables users to capture notes during/after coaching sessions with AI auto-categorization, voice-to-text, and #/@tag auto-linking.

## Proposed Changes

### Services Layer

#### [NEW] [NoteService.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/memory/NoteService.ts)
- `createNote()` - Persist captured notes with linked entities
- `getNotes()` - Retrieve notes (with filters)
- `updateNote()` - Modify existing notes

---

#### [NEW] [VoiceToTextService.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/voice/VoiceToTextService.ts)
- `startRecording()` - Begin voice capture via Web Speech API
- `stopRecording()` - End recording and return transcription
- `isRecording()` - Check current recording state
- `isSupported()` - Check browser support for speech recognition

---

#### [NEW] [ParaCategorizationService.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/memory/ParaCategorizationService.ts)
- `suggestCategory()` - AI suggests Project/Area/Resource from note content
- `extractEntities()` - Detect entities referenced in text

---

#### [NEW] [GraphLinkingService.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/services/memory/GraphLinkingService.ts)
- `linkToGraph()` - Connect note to knowledge graph entities
- `parseHashtags()` - Extract #hashtags from content
- `parseMentions()` - Extract @mentions from content

---

### Component Layer

#### [NEW] [QuickCaptureWidget.tsx](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/features/memory/QuickCaptureWidget.tsx)
Main widget component with:
- Text input area with tag highlighting
- Voice recording button and indicator
- AI category suggestion display with alternatives
- Hashtag/mention autocomplete
- Linked entities preview before save
- Save/cancel buttons

#### [NEW] [QuickCaptureWidget.css](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/features/memory/QuickCaptureWidget.css)
Styling for the widget following design system tokens.

---

#### [MODIFY] [ChatInterface.tsx](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/features/chat/ChatInterface.tsx)
- Add `enableQuickCapture` prop
- Add quick-capture button to header/UI
- Integrate `QuickCaptureWidget` modal overlay
- Handle capture save with `NoteService`

---

### Types

#### [MODIFY] [Memory.ts](file:///c:/Users/IFEANYI-ORAE/OneDrive/Documents/LIFE%20COACH%202/src/types/Memory.ts)
Add new types:
- `CapturedNote` - Structure for saved quick capture notes
- `CategorySuggestion` - AI suggestion with confidence
- `LinkedEntity` - Graph linked entity reference

---

## Verification Plan

### Automated Tests

Run the TDD tests created for Story 4.1:

```bash
npm test -- --run src/tests/story_4_1_quick_capture.test.tsx
```

This test file contains **27 tests** covering:
- **AC1**: Quick-capture widget from chat interface (5 tests)
- **AC2**: AI auto-extraction suggestions (6 tests)
- **AC3**: Voice-to-text support (7 tests)
- **AC4**: #/@ tag auto-linking (9 tests)

**Success criteria**: All 27 tests pass.
