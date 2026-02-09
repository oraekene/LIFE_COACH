/**
 * ChatMessage Component
 * Displays a single message bubble
 */

import React from 'react';
import { Message } from '../../types/Chat';
import './ChatMessage.css';

interface ChatMessageProps {
    message: Message;
    showTimestamp?: boolean;
}

export function ChatMessage({ message, showTimestamp = true }: ChatMessageProps) {
    const isUser = message.role === 'user';

    // Parse content for @[Entity] mentions
    const renderContent = (content: string) => {
        const parts = content.split(/(@\[[^\]]+\])/g);
        return parts.map((part, index) => {
            const match = part.match(/@\[([^\]]+)\]/);
            if (match) {
                return <span key={index} className="entity-link">{match[1]}</span>;
            }
            return part;
        });
    };

    return (
        <div
            className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}
            data-testid={`chat-message-${message.id}`}
        >
            <div className="message-bubble">
                <div className="message-content">
                    {renderContent(message.content)}
                </div>

                {showTimestamp && (
                    <div className="message-timestamp" data-testid="message-timestamp">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}

                {isUser && message.syncStatus === 'pending' && (
                    <div className="sync-status-icon" data-testid="pending-sync-indicator" title="Pending Sync">
                        🕒
                    </div>
                )}
            </div>
        </div>
    );
}
