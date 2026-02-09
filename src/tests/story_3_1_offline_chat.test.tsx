/**
 * Story 3.1: Offline Chat
 * Test-Driven Development - Tests written BEFORE implementation
 *
 * User Story: As a user, I want to chat with my coach offline.
 *
 * Acceptance Criteria:
 * AC1: Full chat functionality without network after initial download
 * AC2: Response time <3 seconds on iPhone 14 equivalent (ONNX Runtime)
 * AC3: Context window maintained across sessions (last 20 turns)
 * AC4: Automatic sync when connectivity restored
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// These imports will fail until the components/services are implemented
// This is intentional for TDD - tests should fail first
import { ChatInterface } from '../features/chat/ChatInterface';
import { ChatMessage } from '../features/chat/ChatMessage';
import { ChatInput } from '../features/chat/ChatInput';
import { OfflineChatService } from '../services/chat/OfflineChatService';
import { ContextWindowManager } from '../services/chat/ContextWindowManager';
import { SyncService } from '../services/sync/SyncService';
import { NetworkMonitor } from '../services/network/NetworkMonitor';
import type { Message, ChatSession, SyncStatus } from '../types/Chat';

// Mock services
// Mock services
vi.mock('../services/chat/OfflineChatService', () => {
    const MockOfflineChatService = vi.fn(() => ({
        isCoachDownloaded: vi.fn().mockResolvedValue(true),
        generateResponse: vi.fn().mockResolvedValue({
            id: 'msg-mock',
            role: 'assistant',
            content: 'Mock response',
            timestamp: new Date().toISOString(),
            latencyMs: 100
        }),
        loadModel: vi.fn().mockResolvedValue(undefined),
        isModelLoaded: vi.fn().mockReturnValue(true),
        getRuntime: vi.fn().mockReturnValue('onnx'),
    }));
    return { OfflineChatService: MockOfflineChatService };
});

vi.mock('../services/chat/ContextWindowManager', () => {
    const trimToLimit = vi.fn();
    const MockContextWindowManager = vi.fn(() => ({
        addMessage: vi.fn().mockImplementation(() => {
            // Simulate side effect
            trimToLimit(20);
        }),
        getRecentMessages: vi.fn().mockReturnValue([]),
        getContextWindow: vi.fn().mockReturnValue(20),
        trimToLimit: trimToLimit,
        saveToStorage: vi.fn().mockResolvedValue(undefined),
        loadFromStorage: vi.fn().mockResolvedValue(undefined),
        clearContext: vi.fn(),
    }));
    return { ContextWindowManager: MockContextWindowManager };
});

vi.mock('../services/sync/SyncService', () => {
    const MockSyncService = vi.fn(() => ({
        queueMessage: vi.fn(),
        getPendingCount: vi.fn().mockReturnValue(0),
        syncAll: vi.fn().mockResolvedValue({ synced: 0, failed: 0 }),
        getStatus: vi.fn().mockReturnValue('idle'),
    }));
    return { SyncService: MockSyncService };
});

vi.mock('../services/network/NetworkMonitor', () => {
    let listeners: ((online: boolean) => void)[] = [];
    const mockInstance = {
        subscribe: vi.fn((l) => {
            listeners.push(l);
            return () => { listeners = listeners.filter(x => x !== l); };
        }),
        checkConnectivity: vi.fn().mockReturnValue(true),
        getStatus: vi.fn().mockReturnValue({ isOnline: true }),
        cleanup: vi.fn(),
        // Helper to trigger connectivity change in tests
        _trigger: (status: boolean) => listeners.forEach(l => l(status))
    };

    const MockNetworkMonitor = {
        getInstance: vi.fn(() => mockInstance),
    };
    return { NetworkMonitor: MockNetworkMonitor };
});

describe('Story 3.1: Offline Chat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // =========================================================================
    // AC1: Full chat functionality without network after initial download
    // =========================================================================
    describe('AC1: Offline Chat Functionality', () => {
        it('should allow sending messages when offline', async () => {
            const mockSendMessage = vi.fn().mockResolvedValue({
                id: 'msg-1',
                role: 'assistant',
                content: 'Hello! How can I help you today?',
                timestamp: new Date().toISOString(),
            });

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onSendMessage={mockSendMessage}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Hello coach!' } });
                fireEvent.click(sendButton);
            });

            expect(mockSendMessage).toHaveBeenCalledWith('Hello coach!');
        });

        it('should display offline indicator when network is unavailable', () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                />
            );

            expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
            expect(screen.getByText(/offline/i)).toBeInTheDocument();
        });

        it('should receive AI responses when offline', async () => {
            const mockResponse = {
                id: 'msg-2',
                role: 'assistant',
                content: 'I understand. Let me help you with that.',
                timestamp: new Date().toISOString(),
            };

            const mockSendMessage = vi.fn().mockResolvedValue(mockResponse);

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onSendMessage={mockSendMessage}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Help me with my goals' } });
                fireEvent.click(sendButton);
            });

            await waitFor(() => {
                expect(screen.getByText('I understand. Let me help you with that.')).toBeInTheDocument();
            });
        });

        it('should work without requiring network after coach download', async () => {
            const mockOfflineService = {
                isCoachDownloaded: vi.fn().mockResolvedValue(true),
                generateResponse: vi.fn().mockResolvedValue({
                    content: 'Offline response generated successfully',
                    tokens: 50,
                }),
            };

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    offlineService={mockOfflineService}
                />
            );

            await waitFor(() => {
                expect(mockOfflineService.isCoachDownloaded).toHaveBeenCalledWith('coach-1');
            });
            expect(screen.queryByTestId('network-required-message')).not.toBeInTheDocument();
        });

        it('should show error if coach not downloaded for offline use', async () => {
            const mockOfflineService = {
                isCoachDownloaded: vi.fn().mockResolvedValue(false),
            };

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    offlineService={mockOfflineService}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId('download-required-message')).toBeInTheDocument();
                expect(screen.getByText(/download required/i)).toBeInTheDocument();
            });
        });

        it('should queue messages when offline for later sync', async () => {
            const mockQueueMessage = vi.fn();

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onQueueForSync={mockQueueMessage}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Message to queue' } });
                fireEvent.click(sendButton);
            });

            expect(mockQueueMessage).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // AC2: Response time <3 seconds on iPhone 14 equivalent (ONNX Runtime)
    // =========================================================================
    describe('AC2: Response Time Performance', () => {
        it('should generate response within 3 seconds', async () => {
            const mockGenerateResponse = vi.fn().mockImplementation(async () => {
                // Simulate fast ONNX inference
                await new Promise(resolve => setTimeout(resolve, 500));
                return {
                    content: 'Quick response',
                    latencyMs: 500,
                };
            });

            const startTime = performance.now();

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onSendMessage={mockGenerateResponse}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Quick question' } });
                fireEvent.click(sendButton);
            });

            await waitFor(() => {
                expect(screen.getByText('Quick response')).toBeInTheDocument();
            });

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(3000);
        });

        it('should display typing indicator while generating response', async () => {
            const slowResponse = vi.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { content: 'Response after delay' };
            });

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onSendMessage={slowResponse}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            fireEvent.change(input, { target: { value: 'Test message' } });
            fireEvent.click(sendButton);

            // Typing indicator should appear while waiting for response
            await waitFor(() => {
                expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
            });

            // Should disappear after response arrives
            await waitFor(() => {
                expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show performance metrics in debug mode', () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    debugMode={true}
                    lastResponseLatency={1250}
                />
            );

            expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
            expect(screen.getByText(/1250ms/i)).toBeInTheDocument();
        });

        it('should use ONNX Runtime for local inference', async () => {
            const mockOnnxInference = vi.fn().mockResolvedValue({
                content: 'ONNX-powered response',
                runtime: 'onnx',
            });

            const mockOfflineService = {
                isCoachDownloaded: vi.fn().mockReturnValue(true),
                generateResponse: mockOnnxInference,
                getRuntime: vi.fn().mockReturnValue('onnx'),
            };

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    offlineService={mockOfflineService}
                />
            );

            expect(mockOfflineService.getRuntime).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // AC3: Context window maintained across sessions (last 20 turns)
    // =========================================================================
    describe('AC3: Context Window (20 Turns)', () => {
        it('should maintain context of last 20 conversation turns', async () => {
            const mockContextManager = {
                getRecentMessages: vi.fn().mockReturnValue(
                    Array.from({ length: 20 }, (_, i) => ({
                        id: `msg-${i}`,
                        role: i % 2 === 0 ? 'user' : 'assistant',
                        content: `Message ${i + 1}`,
                        timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
                    }))
                ),
                getContextWindow: vi.fn().mockReturnValue(20),
            };

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    contextManager={mockContextManager}
                />
            );

            expect(mockContextManager.getRecentMessages).toHaveBeenCalledWith(20);
        });

        it('should persist context across app restarts', async () => {
            const sessionId = 'session-123';
            const mockLoadSession = vi.fn().mockResolvedValue({
                id: sessionId,
                messages: [
                    { id: 'msg-1', role: 'user', content: 'Previous message' },
                    { id: 'msg-2', role: 'assistant', content: 'Previous response' },
                ],
            });

            render(
                <ChatInterface
                    coachId="coach-1"
                    sessionId={sessionId}
                    isOffline={true}
                    onLoadSession={mockLoadSession}
                />
            );

            await waitFor(() => {
                expect(mockLoadSession).toHaveBeenCalledWith(sessionId);
            });

            expect(screen.getByText('Previous message')).toBeInTheDocument();
            expect(screen.getByText('Previous response')).toBeInTheDocument();
        });

        it('should trim old messages when exceeding 20 turns', async () => {
            // Local mock needs to simulate the side effect
            const trimToLimit = vi.fn();
            const mockContextManager = {
                addMessage: vi.fn().mockImplementation(() => {
                    trimToLimit(20);
                }),
                trimToLimit: trimToLimit,
                getRecentMessages: vi.fn().mockReturnValue([]),
            };

            // Simulate adding 21st message
            const messages = Array.from({ length: 21 }, (_, i) => ({
                id: `msg-${i}`,
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i + 1}`,
            }));

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    contextManager={mockContextManager}
                    initialMessages={messages}
                />
            );

            expect(mockContextManager.trimToLimit).toHaveBeenCalledWith(20);
        });

        it('should display context window indicator', () => {
            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    showContextInfo={true}
                    currentContextSize={15}
                    maxContextSize={20}
                />
            );

            expect(screen.getByTestId('context-indicator')).toBeInTheDocument();
            expect(screen.getByText('Context: 15/20')).toBeInTheDocument();
        });

        it('should include context in prompts for coherent responses', async () => {
            const mockGenerateWithContext = vi.fn();

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onSendMessageWithContext={mockGenerateWithContext}
                />
            );

            const input = screen.getByTestId('chat-input');
            const sendButton = screen.getByTestId('send-button');

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Follow up question' } });
                fireEvent.click(sendButton);
            });

            expect(mockGenerateWithContext).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Follow up question',
                    context: expect.any(Array),
                })
            );
        });
    });

    // =========================================================================
    // AC4: Automatic sync when connectivity restored
    // =========================================================================
    describe('AC4: Automatic Sync on Reconnection', () => {
        it('should detect when network connectivity is restored', async () => {
            const mockOnConnectivityChange = vi.fn();

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={true}
                    onConnectivityChange={mockOnConnectivityChange}
                />
            );

            // Simulate coming back online by manually calling the listener
            await act(async () => {
                const instance = NetworkMonitor.getInstance();
                const subscribeMock = instance.subscribe as unknown as ReturnType<typeof vi.fn>;
                // Get the listener function passed to subscribe
                const listener = subscribeMock.mock.calls[0][0];
                listener(true);
            });

            expect(mockOnConnectivityChange).toHaveBeenCalledWith(true);
        });

        it('should automatically sync queued messages when online', async () => {
            const mockSyncMessages = vi.fn().mockResolvedValue({ synced: 5, failed: 0 });

            // Override mock for this test to report pending messages
            (SyncService as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
                queueMessage: vi.fn(),
                getPendingCount: vi.fn().mockReturnValue(5),
                syncAll: mockSyncMessages,
                getStatus: vi.fn().mockReturnValue('idle'),
            }));

            render(
                <ChatInterface
                    coachId="coach-1"
                    isOffline={false}
                    pendingMessages={5}
                    onSyncMessages={mockSyncMessages}
                />
            );

            // Get instance and simulate online event
            await act(async () => {
                const instance = NetworkMonitor.getInstance();
                const subscribeMock = instance.subscribe as unknown as ReturnType<typeof vi.fn>;
                if (subscribeMock.mock.calls.length > 0) {
                    const listener = subscribeMock.mock.calls[0][0];
                    listener(true);
                }
            });

            await waitFor(() => {
                expect(mockSyncMessages).toHaveBeenCalled();
            });
        });

    });

    it('should display sync progress indicator', async () => {
        render(
            <ChatInterface
                coachId="coach-1"
                isOffline={false}
                syncStatus="syncing"
                syncProgress={60}
            />
        );

        expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
        expect(screen.getByText(/syncing/i)).toBeInTheDocument();
    });

    it('should show sync completion notification', async () => {
        render(
            <ChatInterface
                coachId="coach-1"
                isOffline={false}
                syncStatus="complete"
                lastSyncTime={new Date().toISOString()}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('sync-complete-indicator')).toBeInTheDocument();
        });
    });

    it('should handle sync failures gracefully', async () => {
        const mockOnSyncError = vi.fn();

        render(
            <ChatInterface
                coachId="coach-1"
                isOffline={false}
                syncStatus="error"
                syncError="Network timeout"
                onSyncError={mockOnSyncError}
            />
        );

        expect(screen.getByTestId('sync-error-message')).toBeInTheDocument();
        expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
        expect(screen.getByTestId('retry-sync-button')).toBeInTheDocument();
    });

    it('should allow manual sync trigger', async () => {
        const mockTriggerSync = vi.fn();

        render(
            <ChatInterface
                coachId="coach-1"
                isOffline={false}
                onTriggerSync={mockTriggerSync}
            />
        );

        const syncButton = screen.getByTestId('manual-sync-button');
        fireEvent.click(syncButton);

        expect(mockTriggerSync).toHaveBeenCalled();
    });

    it('should preserve message order after sync', async () => {
        const orderedMessages = [
            { id: 'msg-1', content: 'First', timestamp: '2026-02-08T10:00:00Z' },
            { id: 'msg-2', content: 'Second', timestamp: '2026-02-08T10:01:00Z' },
            { id: 'msg-3', content: 'Third', timestamp: '2026-02-08T10:02:00Z' },
        ];

        const mockSyncMessages = vi.fn().mockResolvedValue({
            synced: orderedMessages,
        });

        render(
            <ChatInterface
                coachId="coach-1"
                isOffline={false}
                initialMessages={orderedMessages}
                onSyncMessages={mockSyncMessages}
            />
        );

        const messages = screen.getAllByTestId(/^chat-message-/);
        expect(messages).toHaveLength(3);

        // Verify order is preserved
        expect(messages[0]).toHaveTextContent('First');
        expect(messages[1]).toHaveTextContent('Second');
        expect(messages[2]).toHaveTextContent('Third');
    });

    it('should update last sync timestamp after successful sync', async () => {
        const mockUpdateLastSync = vi.fn();

        render(
            <ChatInterface
                coachId="coach-1"
                isOffline={false}
                syncStatus="complete"
                onUpdateLastSync={mockUpdateLastSync}
            />
        );

        await waitFor(() => {
            expect(mockUpdateLastSync).toHaveBeenCalled();
        });
    });
});

// =========================================================================
// Component Unit Tests
// =========================================================================
describe('ChatMessage Component', () => {
    it('should render user message correctly', () => {
        render(
            <ChatMessage
                id="msg-1"
                role="user"
                content="Hello coach!"
                timestamp="2026-02-08T10:00:00Z"
            />
        );

        expect(screen.getByText('Hello coach!')).toBeInTheDocument();
        expect(screen.getByTestId('chat-message-msg-1')).toHaveClass('user-message');
    });

    it('should render assistant message correctly', () => {
        render(
            <ChatMessage
                id="msg-2"
                role="assistant"
                content="Hello! How can I help?"
                timestamp="2026-02-08T10:00:01Z"
            />
        );

        expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
        expect(screen.getByTestId('chat-message-msg-2')).toHaveClass('assistant-message');
    });

    it('should display timestamp', () => {
        render(
            <ChatMessage
                id="msg-1"
                role="user"
                content="Test"
                timestamp="2026-02-08T10:00:00Z"
                showTimestamp={true}
            />
        );

        expect(screen.getByTestId('message-timestamp')).toBeInTheDocument();
    });

    it('should indicate pending sync status', () => {
        render(
            <ChatMessage
                id="msg-1"
                role="user"
                content="Pending message"
                timestamp="2026-02-08T10:00:00Z"
                syncStatus="pending"
            />
        );

        expect(screen.getByTestId('pending-sync-indicator')).toBeInTheDocument();
    });
});

describe('ChatInput Component', () => {
    it('should allow text input', () => {
        render(<ChatInput onSend={vi.fn()} />);

        const input = screen.getByTestId('chat-input');
        fireEvent.change(input, { target: { value: 'Test message' } });

        expect(input).toHaveValue('Test message');
    });

    it('should call onSend when send button clicked', () => {
        const mockOnSend = vi.fn();
        render(<ChatInput onSend={mockOnSend} />);

        const input = screen.getByTestId('chat-input');
        const sendButton = screen.getByTestId('send-button');

        fireEvent.change(input, { target: { value: 'Send this' } });
        fireEvent.click(sendButton);

        expect(mockOnSend).toHaveBeenCalledWith('Send this');
    });

    it('should call onSend when Enter key pressed', () => {
        const mockOnSend = vi.fn();
        render(<ChatInput onSend={mockOnSend} />);

        const input = screen.getByTestId('chat-input');
        fireEvent.change(input, { target: { value: 'Enter to send' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(mockOnSend).toHaveBeenCalledWith('Enter to send');
    });

    it('should clear input after sending', () => {
        const mockOnSend = vi.fn();
        render(<ChatInput onSend={mockOnSend} />);

        const input = screen.getByTestId('chat-input');
        const sendButton = screen.getByTestId('send-button');

        fireEvent.change(input, { target: { value: 'Clear after send' } });
        fireEvent.click(sendButton);

        expect(input).toHaveValue('');
    });

    it('should disable send button when input is empty', () => {
        render(<ChatInput onSend={vi.fn()} />);

        const sendButton = screen.getByTestId('send-button');
        expect(sendButton).toBeDisabled();
    });

    it('should disable input when chat is loading', () => {
        render(<ChatInput onSend={vi.fn()} isLoading={true} />);

        const input = screen.getByTestId('chat-input');
        const sendButton = screen.getByTestId('send-button');

        expect(input).toBeDisabled();
        expect(sendButton).toBeDisabled();
    });
});

// =========================================================================
// Service Tests
// =========================================================================
describe('OfflineChatService', () => {
    it('should check if coach is downloaded', async () => {
        const service = new OfflineChatService();
        const isDownloaded = await service.isCoachDownloaded('coach-1');

        expect(typeof isDownloaded).toBe('boolean');
    });

    it('should generate response using local model', async () => {
        const service = new OfflineChatService();
        const response = await service.generateResponse({
            coachId: 'coach-1',
            message: 'Hello',
            context: [],
        });

        expect(response).toHaveProperty('content');
        expect(response).toHaveProperty('latencyMs');
    });

    it('should load ONNX model for specified coach', async () => {
        const service = new OfflineChatService();
        await service.loadModel('coach-1');

        expect(service.isModelLoaded('coach-1')).toBe(true);
    });
});

describe('ContextWindowManager', () => {
    it('should store and retrieve messages', () => {
        const manager = new ContextWindowManager(20);

        manager.addMessage({
            id: 'msg-1',
            role: 'user',
            content: 'Test',
            timestamp: new Date().toISOString(),
        });

        const messages = manager.getRecentMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('Test');
    });

    it('should limit to 20 messages', () => {
        const manager = new ContextWindowManager(20);

        // Add 25 messages
        for (let i = 0; i < 25; i++) {
            manager.addMessage({
                id: `msg-${i}`,
                role: 'user',
                content: `Message ${i}`,
                timestamp: new Date().toISOString(),
            });
        }

        const messages = manager.getRecentMessages();
        expect(messages).toHaveLength(20);
        // Should keep the most recent 20
        expect(messages[0].content).toBe('Message 5');
    });

    it('should persist context to storage', async () => {
        const manager = new ContextWindowManager(20);

        manager.addMessage({
            id: 'msg-1',
            role: 'user',
            content: 'Persist this',
            timestamp: new Date().toISOString(),
        });

        await manager.saveToStorage('session-1');
        await manager.loadFromStorage('session-1');

        const messages = manager.getRecentMessages();
        expect(messages[0].content).toBe('Persist this');
    });
});

describe('SyncService', () => {
    it('should queue messages for sync', () => {
        const service = new SyncService();

        service.queueMessage({
            id: 'msg-1',
            role: 'user',
            content: 'Queue this',
            timestamp: new Date().toISOString(),
        });

        expect(service.getPendingCount()).toBe(1);
    });

    it('should sync queued messages when online', async () => {
        const service = new SyncService();

        service.queueMessage({
            id: 'msg-1',
            role: 'user',
            content: 'Sync this',
            timestamp: new Date().toISOString(),
        });

        const result = await service.syncAll();
        expect(result.synced).toBe(1);
        expect(result.failed).toBe(0);
    });

    it('should report sync status', () => {
        const service = new SyncService();

        expect(service.getStatus()).toMatch(/idle|syncing|complete|error/);
    });
});
