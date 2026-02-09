/**
 * ChatInput Component
 * Text input area for sending messages
 * Story 3.1: Offline Chat
 * Story 3.2: Contextual Memory (@mentions)
 */

import { useState, KeyboardEvent, useRef, useEffect, ChangeEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    // New props for @mentions
    onType?: (text: string) => void;
    mentionSuggestions?: Array<{ id: string; name: string }>;
    onSelectMention?: (entity: { id: string; name: string }) => void;
}

export function ChatInput({
    onSend,
    isLoading = false,
    placeholder = 'Type a message...',
    onType,
    mentionSuggestions,
    onSelectMention
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setMessage(newValue);
        if (onType) {
            onType(newValue);
        }
    };

    const handleSend = () => {
        if (message.trim() && !isLoading) {
            onSend(message.trim());
            setMessage('');
            if (onType) onType(''); // Reset suggestions

            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSelectMention = (entity: { id: string; name: string }) => {
        // Replace the last @... with the full entity
        const lastAtIndex = message.lastIndexOf('@');
        const newMessage = message.substring(0, lastAtIndex) + `@[${entity.name}] `;
        setMessage(newMessage);
        if (onSelectMention) onSelectMention(entity);
        if (onType) onType(''); // Clear suggestions

        // Refocus textarea
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <div className="chat-input-container">
            {mentionSuggestions && mentionSuggestions.length > 0 && (
                <div className="mention-suggestions" data-testid="mention-suggestions">
                    {mentionSuggestions.map(entity => (
                        <div
                            key={entity.id}
                            className="mention-suggestion-item"
                            data-testid="mention-suggestion-item"
                            onClick={() => handleSelectMention(entity)}
                        >
                            {entity.name}
                        </div>
                    ))}
                </div>
            )}
            <textarea
                ref={textareaRef}
                className="chat-input__textarea"
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                rows={1}
                data-testid="chat-input"
            />
            <button
                className="chat-input__send-button"
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                data-testid="send-button"
                aria-label="Send message"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
            </button>
        </div>
    );
}
