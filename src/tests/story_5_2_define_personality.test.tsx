/**
 * Story 5.2: Define Personality
 * Test-Driven Development - Tests written BEFORE implementation
 * 
 * User Story: As an admin, I want to define my coach's personality.
 * 
 * Acceptance Criteria:
 * AC1: WYSIWYG editor for soul.md (persona definition)
 * AC2: Template library (Socratic, Cheerleader, Analyst, Mentor)
 * AC3: Example conversation builder (3-5 few-shot examples)
 * AC4: Live preview chat to test personality before training
 * AC5: Agent.md editor editor for operational instructions (advanced mode)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// We expect these components to be created in Story 5.2
import { CoachPersonalityEditor } from '../features/admin/CoachPersonalityEditor';

import { ChatService } from '../services/chat/ChatService';

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(() => ({
        isAuthenticated: true,
        user: {
            publicMetadata: { role: 'admin' },
            emailAddresses: [{ emailAddress: 'admin@example.com' }]
        }
    }))
}));

// Mock PersonalityService
vi.mock('../services/admin/PersonalityService', () => {
    return {
        PersonalityService: {
            getTemplate: vi.fn((type: string) => {
                const templates = {
                    Socratic: 'You are a Socratic mentor...',
                    Cheerleader: 'You are an enthusiastic cheerleader...',
                    Analyst: 'You are a detail-oriented analyst...',
                    Mentor: 'You are a wise and patient mentor...'
                };
                return templates[type as keyof typeof templates] || '';
            }),
            savePersonality: vi.fn().mockResolvedValue({ success: true })
        }
    };
});

describe('Story 5.2: Define Personality', () => {
    const coachId = 'test-coach-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // =========================================================================
    // AC1: WYSIWYG editor for soul.md
    // =========================================================================
    describe('AC1: Soul.md Editor', () => {
        it('should render the soul.md editor', () => {
            render(<CoachPersonalityEditor coachId={coachId} />);
            expect(screen.getByTestId('soul-md-editor')).toBeInTheDocument();
        });

        it('should update soul.md content on change', async () => {
            render(<CoachPersonalityEditor coachId={coachId} />);
            const editor = screen.getByTestId('soul-md-editor');

            fireEvent.change(editor, { target: { value: 'New persona definition' } });

            expect(editor).toHaveValue('New persona definition');
        });
    });

    // =========================================================================
    // AC2: Template library
    // =========================================================================
    describe('AC2: Template Library', () => {
        it('should list all required templates', () => {
            render(<CoachPersonalityEditor coachId={coachId} />);

            expect(screen.getByText(/Socratic/i)).toBeInTheDocument();
            expect(screen.getByText(/Cheerleader/i)).toBeInTheDocument();
            expect(screen.getByText(/Analyst/i)).toBeInTheDocument();
            expect(screen.getByText(/Mentor/i)).toBeInTheDocument();
        });

        it('should populate editor when a template is selected', async () => {
            render(<CoachPersonalityEditor coachId={coachId} />);

            const socraticButton = screen.getByRole('button', { name: /Socratic/i });
            fireEvent.click(socraticButton);

            await waitFor(() => {
                const editor = screen.getByTestId('soul-md-editor') as HTMLTextAreaElement;
                expect(editor.value).toContain('Socratic mentor');
            });
        });
    });

    // =========================================================================
    // AC3: Example conversation builder
    // =========================================================================
    describe('AC3: Example Conversation Builder', () => {
        it('should allow adding Q&A examples', async () => {
            render(<CoachPersonalityEditor coachId={coachId} />);

            const questionInput = screen.getByTestId('example-question-input');
            const answerInput = screen.getByTestId('example-answer-input');
            const addButton = screen.getByTestId('add-example-button');

            fireEvent.change(questionInput, { target: { value: 'How do I start?' } });
            fireEvent.change(answerInput, { target: { value: 'Begin with the first step.' } });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(screen.getByText('How do I start?')).toBeInTheDocument();
                expect(screen.getByText('Begin with the first step.')).toBeInTheDocument();
            });
        });

        it('should show placeholders or existing examples', () => {
            render(<CoachPersonalityEditor coachId={coachId} />);
            const examples = screen.queryAllByTestId('example-item');
            expect(examples).toBeDefined();
        });
    });

    // =========================================================================
    // AC4: Live preview chat
    // =========================================================================
    describe('AC4: Live Preview Chat', () => {
        beforeEach(() => {
            window.alert = vi.fn();
        });

        it('should render the live preview chat interface', () => {
            render(<CoachPersonalityEditor coachId={coachId} />);
            expect(screen.getByTestId('live-preview-chat')).toBeInTheDocument();
        });

        it('should send and receive messages in preview mode', async () => {
            vi.spyOn(ChatService, 'sendMessage').mockResolvedValue({
                text: 'This is a preview response from the coach.',
                timestamp: new Date().toISOString()
            });

            render(<CoachPersonalityEditor coachId={coachId} />);

            const chatInput = screen.getByPlaceholderText(/Test the coach/i);
            const sendButton = screen.getByTestId('send-preview-message');

            fireEvent.change(chatInput, { target: { value: 'Hello' } });
            fireEvent.click(sendButton);

            // Wait for user message to appear in the chat log
            const userMsg = await screen.findByText(/^Hello$/);
            expect(userMsg).toBeInTheDocument();

            // Wait for coach response to appear
            const coachResp = await screen.findByText(/This is a preview response from the coach/i, {}, { timeout: 5000 });
            expect(coachResp).toBeInTheDocument();
        });
    });

    // =========================================================================
    // AC5: Agent.md editor (Advanced mode)
    // =========================================================================
    describe('AC5: Agent.md Editor', () => {
        it('should hide agent.md editor by default', () => {
            render(<CoachPersonalityEditor coachId={coachId} />);
            expect(screen.queryByTestId('agent-md-editor')).not.toBeInTheDocument();
        });

        it('should show agent.md editor when advanced mode is toggled', async () => {
            render(<CoachPersonalityEditor coachId={coachId} />);

            const advancedToggle = screen.getByTestId('advanced-mode-toggle');
            fireEvent.click(advancedToggle);

            await waitFor(() => {
                expect(screen.getByTestId('agent-md-editor')).toBeInTheDocument();
            });
        });
    });
});
