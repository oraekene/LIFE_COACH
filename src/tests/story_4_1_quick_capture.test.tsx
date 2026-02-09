/**
 * Story 4.1: Quick Capture
 * Test-Driven Development - Tests written BEFORE implementation
 *
 * User Story: As a user, I want to capture notes during or after coaching sessions.
 *
 * Acceptance Criteria:
 * AC1: Quick-capture widget from chat interface
 * AC2: Auto-extraction: AI suggests Project, Area, or Resource
 * AC3: Voice-to-text support
 * AC4: Tagging with #project-name or @person auto-links to graph
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// These imports will fail until the components/services are implemented
import { QuickCaptureWidget } from '../features/memory/QuickCaptureWidget';
import { ChatInterface } from '../features/chat/ChatInterface';
import { NoteService } from '../services/memory/NoteService';
import { VoiceToTextService } from '../services/voice/VoiceToTextService';
import { ParaCategorizationService } from '../services/memory/ParaCategorizationService';
import { GraphLinkingService } from '../services/memory/GraphLinkingService';

// Mock services
vi.mock('../services/memory/NoteService', () => {
    const MockNoteService = vi.fn(() => ({
        createNote: vi.fn().mockResolvedValue({
            id: 'note-1',
            content: 'Test note content',
            createdAt: new Date().toISOString(),
            linkedEntities: []
        }),
        getNotes: vi.fn().mockResolvedValue([]),
        updateNote: vi.fn().mockResolvedValue(true)
    }));
    return { NoteService: MockNoteService };
});

vi.mock('../services/voice/VoiceToTextService', () => {
    const MockVoiceToTextService = vi.fn(() => ({
        startRecording: vi.fn().mockResolvedValue(true),
        stopRecording: vi.fn().mockResolvedValue({
            transcription: 'This is a voice transcription test',
            confidence: 0.95
        }),
        isRecording: vi.fn().mockReturnValue(false),
        isSupported: vi.fn().mockReturnValue(true)
    }));
    return { VoiceToTextService: MockVoiceToTextService };
});

vi.mock('../services/memory/ParaCategorizationService', () => {
    const MockParaCategorizationService = vi.fn(() => ({
        suggestCategory: vi.fn().mockResolvedValue({
            type: 'project',
            name: 'Marathon Training',
            confidence: 0.85,
            alternatives: [
                { type: 'area', name: 'Health', confidence: 0.65 },
                { type: 'resource', name: 'Running Tips', confidence: 0.45 }
            ]
        }),
        extractEntities: vi.fn().mockResolvedValue([
            { type: 'project', name: 'Marathon Training', detected: true },
            { type: 'person', name: 'Sarah', detected: true }
        ])
    }));
    return { ParaCategorizationService: MockParaCategorizationService };
});

vi.mock('../services/memory/GraphLinkingService', () => {
    const MockGraphLinkingService = vi.fn(() => ({
        linkToGraph: vi.fn().mockResolvedValue({
            success: true,
            linkedEntities: ['proj-1', 'person-1']
        }),
        parseHashtags: vi.fn().mockImplementation((content) => {
            const hashtags = content.match(/#[\w-]+/g) || [];
            return hashtags.map((tag: string) => ({ tag: tag.slice(1), type: 'project' }));
        }),
        parseMentions: vi.fn().mockImplementation((content) => {
            const mentions = content.match(/@[\w-]+/g) || [];
            return mentions.map((mention: string) => ({ name: mention.slice(1), type: 'person' }));
        }),
        getAutocompleteSuggestions: vi.fn().mockImplementation((prefix, type) => {
            if (type === 'hashtag' && prefix.includes('mar')) return Promise.resolve(['marathon-training']);
            if (type === 'mention' && prefix.includes('sar')) return Promise.resolve(['sarah']);
            return Promise.resolve([]);
        })
    }));
    return { GraphLinkingService: MockGraphLinkingService };
});


describe('Story 4.1: Quick Capture', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // =========================================================================
    // AC1: Quick-capture widget from chat interface
    // =========================================================================
    describe('AC1: Quick Capture Widget in Chat Interface', () => {
        it('should display quick-capture button in chat interface', async () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    enableQuickCapture={true}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('quick-capture-button')).toBeInTheDocument();
            });
        });

        it('should open quick-capture widget when button is clicked', async () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    enableQuickCapture={true}
                />
            );

            const captureButton = screen.getByTestId('quick-capture-button');
            fireEvent.click(captureButton);

            await waitFor(() => {
                expect(screen.getByTestId('quick-capture-widget')).toBeInTheDocument();
            });
        });

        it('should allow entering text in the quick-capture widget', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Remember to stretch before running' } });

            expect(textArea).toHaveValue('Remember to stretch before running');
        });

        it('should save note when capture button is clicked', async () => {
            const mockOnCapture = vi.fn();
            render(<QuickCaptureWidget onCapture={mockOnCapture} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Remember to stretch before running' } });

            const saveButton = screen.getByTestId('save-capture-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnCapture).toHaveBeenCalledWith(
                    expect.objectContaining({
                        content: 'Remember to stretch before running'
                    })
                );
            });
        });

        it('should close widget after successful capture', async () => {
            const mockOnCapture = vi.fn().mockResolvedValue(true);
            render(
                <ChatInterface
                    coachId="coach-1"
                    enableQuickCapture={true}
                />
            );

            // Open widget
            const captureButton = screen.getByTestId('quick-capture-button');
            fireEvent.click(captureButton);

            await waitFor(() => {
                expect(screen.getByTestId('quick-capture-widget')).toBeInTheDocument();
            });

            // Enter text and save
            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Test note' } });

            const saveButton = screen.getByTestId('save-capture-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.queryByTestId('quick-capture-widget')).not.toBeInTheDocument();
            });
        });
    });

    // =========================================================================
    // AC2: Auto-extraction: AI suggests Project, Area, or Resource
    // =========================================================================
    describe('AC2: AI Auto-Extraction Suggestions', () => {
        it('should suggest PARA category after text input', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'I need to work on my marathon training schedule' } });

            // Wait for AI to suggest category
            await waitFor(() => {
                expect(screen.getByTestId('category-suggestion')).toBeInTheDocument();
            });
        });

        it('should display suggested category type (Project/Area/Resource)', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'I need to work on my marathon training schedule' } });

            // Wait for suggestion container
            await waitFor(() => {
                expect(screen.getByTestId('category-suggestion')).toBeInTheDocument();
            });

            // Check the type specifically within the suggestion
            const typeElement = screen.getByText(/project/i, { selector: '.category-type' });
            expect(typeElement).toBeInTheDocument();

            // Check the name specifically within the suggestion (avoid matching textarea content)
            const nameElement = screen.getByText(/Marathon Training/i, { selector: '.category-name' });
            expect(nameElement).toBeInTheDocument();
        });

        it('should show confidence indicator for suggestion', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Marathon training notes' } });

            await waitFor(() => {
                expect(screen.getByTestId('suggestion-confidence')).toBeInTheDocument();
            });
        });

        it('should display alternative category suggestions', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Running tips from coach' } });

            await waitFor(() => {
                expect(screen.getByTestId('alternative-suggestions')).toBeInTheDocument();
            });
        });

        it('should allow user to select alternative category', async () => {
            const mockOnCapture = vi.fn();
            render(<QuickCaptureWidget onCapture={mockOnCapture} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Running tips' } });

            await waitFor(() => {
                const alternativeButton = screen.getByTestId('alternative-area');
                fireEvent.click(alternativeButton);
            });

            // Save with selected alternative
            const saveButton = screen.getByTestId('save-capture-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnCapture).toHaveBeenCalledWith(
                    expect.objectContaining({
                        category: expect.objectContaining({ type: 'area' })
                    })
                );
            });
        });

        it('should allow user to override AI suggestion with manual selection', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Some note content' } });

            await waitFor(() => {
                expect(screen.getByTestId('category-suggestion')).toBeInTheDocument();
            });

            // Click to override
            const overrideButton = screen.getByTestId('override-category-button');
            fireEvent.click(overrideButton);

            await waitFor(() => {
                expect(screen.getByTestId('manual-category-selector')).toBeInTheDocument();
            });
        });
    });

    // =========================================================================
    // AC3: Voice-to-text support
    // =========================================================================
    describe('AC3: Voice-to-Text Support', () => {
        it('should display voice input button in widget', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            expect(screen.getByTestId('voice-input-button')).toBeInTheDocument();
        });

        it('should start recording when voice button is pressed', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const voiceButton = screen.getByTestId('voice-input-button');
            fireEvent.click(voiceButton);

            await waitFor(() => {
                expect(screen.getByTestId('recording-indicator')).toBeInTheDocument();
            });
        });

        it('should show visual feedback during recording', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const voiceButton = screen.getByTestId('voice-input-button');
            fireEvent.click(voiceButton);

            await waitFor(() => {
                const recordingIndicator = screen.getByTestId('recording-indicator');
                expect(recordingIndicator).toHaveClass('recording-active');
            });
        });

        it('should stop recording and transcribe when button pressed again', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const voiceButton = screen.getByTestId('voice-input-button');

            // Start recording
            fireEvent.click(voiceButton);

            await waitFor(() => {
                expect(screen.getByTestId('recording-indicator')).toBeInTheDocument();
            });

            // Stop recording
            fireEvent.click(voiceButton);

            await waitFor(() => {
                const textArea = screen.getByTestId('quick-capture-input');
                expect(textArea).toHaveValue('This is a voice transcription test');
            });
        });

        it('should show transcription confidence indicator', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const voiceButton = screen.getByTestId('voice-input-button');

            // Start and stop recording
            fireEvent.click(voiceButton);
            await waitFor(() => screen.getByTestId('recording-indicator'));
            fireEvent.click(voiceButton);

            await waitFor(() => {
                expect(screen.getByTestId('transcription-confidence')).toBeInTheDocument();
            });
        });

        it('should show error message if voice-to-text is not supported', async () => {
            // Mock unsupported
            vi.mocked(VoiceToTextService).mockImplementation(() => ({
                startRecording: vi.fn(),
                stopRecording: vi.fn(),
                isRecording: vi.fn(),
                isSupported: vi.fn().mockReturnValue(false)
            }));

            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const voiceButton = screen.getByTestId('voice-input-button');
            fireEvent.click(voiceButton);

            await waitFor(() => {
                expect(screen.getByText(/not supported/i)).toBeInTheDocument();
            });
        });

        it('should allow editing transcribed text before saving', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const voiceButton = screen.getByTestId('voice-input-button');

            // Start and stop recording
            fireEvent.click(voiceButton);
            await waitFor(() => screen.getByTestId('recording-indicator'));
            fireEvent.click(voiceButton);

            await waitFor(() => {
                const textArea = screen.getByTestId('quick-capture-input');
                expect(textArea).toHaveValue('This is a voice transcription test');
            });

            // Edit the transcription
            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Edited transcription' } });

            expect(textArea).toHaveValue('Edited transcription');
        });
    });

    // =========================================================================
    // AC4: Tagging with #project-name or @person auto-links to graph
    // =========================================================================
    describe('AC4: Auto-Linking with Tags', () => {
        it('should detect #hashtags in note content', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Remember to update #marathon-training schedule' } });

            await waitFor(() => {
                expect(screen.getByTestId('detected-hashtag-marathon-training')).toBeInTheDocument();
            });
        });

        it('should detect @mentions in note content', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Discuss training plan with @sarah' } });

            await waitFor(() => {
                expect(screen.getByTestId('detected-mention-sarah')).toBeInTheDocument();
            });
        });

        it('should highlight detected tags in input', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: '#marathon-training with @sarah' } });

            await waitFor(() => {
                expect(screen.getByTestId('tag-highlight-marathon-training')).toBeInTheDocument();
                expect(screen.getByTestId('tag-highlight-sarah')).toBeInTheDocument();
            });
        });

        it('should link entities to graph on save', async () => {
            const mockOnCapture = vi.fn();
            render(<QuickCaptureWidget onCapture={mockOnCapture} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: '#marathon-training with @sarah' } });

            const saveButton = screen.getByTestId('save-capture-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnCapture).toHaveBeenCalledWith(
                    expect.objectContaining({
                        linkedEntities: expect.arrayContaining([
                            expect.objectContaining({ tag: 'marathon-training', type: 'project' }),
                            expect.objectContaining({ name: 'sarah', type: 'person' })
                        ])
                    })
                );
            });
        });

        it('should show autocomplete suggestions for partial hashtags', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: '#mara' } });

            await waitFor(() => {
                expect(screen.getByTestId('hashtag-suggestions')).toBeInTheDocument();
                expect(screen.getByText('marathon-training')).toBeInTheDocument();
            });
        });

        it('should show autocomplete suggestions for partial @mentions', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: '@sar' } });

            await waitFor(() => {
                expect(screen.getByTestId('mention-suggestions')).toBeInTheDocument();
                expect(screen.getByText('sarah')).toBeInTheDocument();
            });
        });

        it('should complete tag when suggestion is selected', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: 'Update #mara' } });

            await waitFor(() => {
                const suggestion = screen.getByText('marathon-training');
                fireEvent.click(suggestion);
            });

            expect(textArea).toHaveValue('Update #marathon-training ');
        });

        it('should create new entity if tag does not exist', async () => {
            const mockOnCapture = vi.fn();
            render(<QuickCaptureWidget onCapture={mockOnCapture} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: '#new-project-xyz' } });

            await waitFor(() => {
                expect(screen.getByTestId('new-entity-indicator')).toBeInTheDocument();
            });

            const saveButton = screen.getByTestId('save-capture-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockOnCapture).toHaveBeenCalledWith(
                    expect.objectContaining({
                        newEntities: expect.arrayContaining([
                            expect.objectContaining({ tag: 'new-project-xyz' })
                        ])
                    })
                );
            });
        });

        it('should show linked entities preview before saving', async () => {
            render(<QuickCaptureWidget onCapture={vi.fn()} />);

            const textArea = screen.getByTestId('quick-capture-input');
            fireEvent.change(textArea, { target: { value: '#marathon-training with @sarah' } });

            await waitFor(() => {
                expect(screen.getByTestId('linked-entities-preview')).toBeInTheDocument();
                expect(screen.getByText('2 entities will be linked')).toBeInTheDocument();
            });
        });
    });
});
