/**
 * Story 3.2: Contextual Memory
 * Test-Driven Development - Tests written BEFORE implementation
 *
 * User Story: As a user, I want my coach to remember my specific situation.
 *
 * Acceptance Criteria:
 * AC1: PARA entities displayed in sidebar (Active Projects, Key People)
 * AC2: Coach proactively references user's projects from PARA
 * AC3: User can @mention entities
 * AC4: Suggestions surface based on Hot memory (accessed within 7 days)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// These imports will fail until the components/services are implemented
import { ChatInterface } from '../features/chat/ChatInterface';
import { ParaSidebar } from '../features/memory/ParaSidebar';
import { MemoryService } from '../services/memory/MemoryService';
import { ContextWindowManager } from '../services/chat/ContextWindowManager';

// Mock services
vi.mock('../services/memory/MemoryService', () => {
    const MockMemoryService = vi.fn(() => ({
        getParaEntities: vi.fn().mockResolvedValue({
            projects: [
                { id: 'proj-1', name: 'Marathon Training', status: 'active', lastAccessed: new Date().toISOString() },
                { id: 'proj-2', name: 'Learn Spanish', status: 'active', lastAccessed: new Date(Date.now() - 86400000).toISOString() }
            ],
            people: [
                { id: 'person-1', name: 'Sarah', relation: 'Partner', lastAccessed: new Date().toISOString() }
            ]
        }),
        searchEntities: vi.fn().mockImplementation((query) => {
            if (query === '@') return Promise.resolve([
                { id: 'proj-1', name: 'Marathon Training', type: 'project' },
                { id: 'person-1', name: 'Sarah', type: 'person' }
            ]);
            return Promise.resolve([]);
        }),
        getHotMemories: vi.fn().mockResolvedValue([
            { id: 'mem-1', content: 'Knee pain during long runs', timestamp: new Date().toISOString() }
        ])
    }));
    return { MemoryService: MockMemoryService };
});

vi.mock('../services/chat/OfflineChatService', () => {
    return {
        OfflineChatService: vi.fn(() => ({
            generateResponse: vi.fn().mockResolvedValue({
                id: 'msg-resp',
                role: 'assistant',
                content: 'How is your Marathon Training going?',
                latencyMs: 100
            }),
            isCoachDownloaded: vi.fn().mockResolvedValue(true),
            getRuntime: vi.fn().mockReturnValue('onnx')
        }))
    };
});

// Mock ContextWindowManager
vi.mock('../services/chat/ContextWindowManager', () => {
    return {
        ContextWindowManager: vi.fn(() => ({
            addMessage: vi.fn(),
            getRecentMessages: vi.fn().mockReturnValue([]),
            getContextWindow: vi.fn().mockReturnValue(20)
        }))
    };
});


describe('Story 3.2: Contextual Memory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // =========================================================================
    // AC1: PARA entities displayed in sidebar (Active Projects, Key People)
    // =========================================================================
    describe('AC1: PARA Sidebar Display', () => {
        it('should display active projects in sidebar', async () => {
            render(<ParaSidebar />);

            await waitFor(() => {
                expect(screen.getByText('Marathon Training')).toBeInTheDocument();
                expect(screen.getByText('Learn Spanish')).toBeInTheDocument();
            });
        });

        it('should display key people in sidebar', async () => {
            render(<ParaSidebar />);

            await waitFor(() => {
                expect(screen.getByText('Sarah')).toBeInTheDocument();
            });
        });

        it('should group entities by PARA category', async () => {
            render(<ParaSidebar />);

            await waitFor(() => {
                expect(screen.getByTestId('category-projects')).toBeInTheDocument();
                expect(screen.getByTestId('category-people')).toBeInTheDocument();
            });
        });
    });

    // =========================================================================
    // AC2: Coach proactively references user's projects from PARA
    // =========================================================================
    describe('AC2: Proactive Referencing', () => {
        it('should include PARA context in prompt generation', async () => {
            const mockGenerateResponse = vi.fn().mockResolvedValue({
                content: 'Response',
                latencyMs: 100
            });

            // We need to inject a mock that verifies context injection
            const mockOfflineService = {
                generateResponse: mockGenerateResponse,
                isCoachDownloaded: vi.fn().mockResolvedValue(true),
                getRuntime: vi.fn()
            };

            render(
                <ChatInterface
                    coachId="coach-1"
                    offlineService={mockOfflineService}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            fireEvent.change(input, { target: { value: 'What should I do today?' } });
            fireEvent.click(sendButton);

            await waitFor(() => {
                expect(mockGenerateResponse).toHaveBeenCalledWith(
                    expect.objectContaining({
                        context: expect.arrayContaining([
                            expect.objectContaining({ type: 'para_context' })
                        ])
                    })
                );
            });
        });

        it('should highlight referenced entities in chat response', async () => {
            const mockSendMessage = vi.fn().mockResolvedValue({
                id: 'msg-1',
                role: 'assistant',
                content: 'How is your @[Marathon Training] going?',
                timestamp: new Date().toISOString()
            });

            render(
                <ChatInterface
                    coachId="coach-1"
                    onSendMessage={mockSendMessage}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            fireEvent.change(input, { target: { value: 'Hi' } });
            fireEvent.click(sendButton);

            await waitFor(() => {
                const link = screen.getByText('Marathon Training');
                expect(link).toHaveClass('entity-link');
            });
        });
    });

    // =========================================================================
    // AC3: User can @mention entities
    // =========================================================================
    describe('AC3: @mention Functionality', () => {
        it('should show suggestions when typing @', async () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    enableMentions={true}
                />
            );

            const input = screen.getByTestId('chat-input');

            fireEvent.change(input, { target: { value: 'I want to talk about @' } });

            await waitFor(() => {
                expect(screen.getByTestId('mention-suggestions')).toBeInTheDocument();
                expect(screen.getByText('Marathon Training')).toBeInTheDocument();
                expect(screen.getByText('Sarah')).toBeInTheDocument();
            });
        });

        it('should insert entity when suggestion selected', async () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    enableMentions={true}
                />
            );

            const input = screen.getByTestId('chat-input');

            fireEvent.change(input, { target: { value: '@' } });

            await waitFor(() => {
                screen.getByText('Marathon Training').click();
            });

            expect(input).toHaveValue('@[Marathon Training] ');
        });
    });

    // =========================================================================
    // AC4: Suggestions surface based on Hot memory (accessed within 7 days)
    // =========================================================================
    describe('AC4: Hot Memory Suggestions', () => {
        it('should prioritize recently accessed items', async () => {
            // Mock returns Marathon Training (Hot) and Learn Spanish (Warm)
            // Expect Hot to be first in list
            render(
                <ChatInterface
                    coachId="coach-1"
                    enableMentions={true}
                />
            );

            const input = screen.getByTestId('chat-input');
            fireEvent.change(input, { target: { value: '@' } });

            await waitFor(() => {
                const suggestions = screen.getAllByTestId('mention-suggestion-item');
                expect(suggestions[0]).toHaveTextContent('Marathon Training');
            });
        });

        it('should indicate hot status visually', async () => {
            render(<ParaSidebar />);

            await waitFor(() => {
                const hotItem = screen.getByText('Marathon Training').closest('.para-item');
                expect(hotItem).toHaveClass('para-item--hot');
            });
        });
    });
});
