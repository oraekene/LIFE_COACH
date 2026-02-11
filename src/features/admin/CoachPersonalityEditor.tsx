import React, { useState, useMemo } from 'react';
import { PersonalityService } from '../../services/admin/PersonalityService';
import { ChatService } from '../../services/chat/ChatService';
import { useAuth } from '../../hooks/useAuth';
import { LoraTrainingComponent } from './LoraTrainingComponent';

interface ExampleConversation {
    question: string;
    answer: string;
}

interface CoachPersonalityEditorProps {
    coachId: string;
}

const TEMPLATES = ['Socratic', 'Cheerleader', 'Analyst', 'Mentor'];

export const CoachPersonalityEditor: React.FC<CoachPersonalityEditorProps> = ({ coachId }) => {
    const { user, isAuthenticated } = useAuth();

    // Limits
    const MAX_SOUL_LENGTH = 10000;
    const MAX_AGENT_LENGTH = 5000;
    const MAX_EXAMPLE_LENGTH = 2000;
    const MAX_INPUT_LENGTH = 1000;

    const isAdmin = useMemo(() => {
        // Fallback for dev mode where user object might be simple
        return isAuthenticated && (user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress?.includes('admin'));
    }, [user, isAuthenticated]);
    const [soulMd, setSoulMd] = useState('');
    const [agentMd, setAgentMd] = useState('');
    const [examples, setExamples] = useState<ExampleConversation[]>([]);
    const [advancedMode, setAdvancedMode] = useState(false);

    // Example Builder State
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    // Chat Preview State
    const [messages, setMessages] = useState<{ role: 'user' | 'coach'; text: string }[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleTemplateSelect = async (type: string) => {
        const template = await PersonalityService.getTemplate(type);
        setSoulMd(template);
    };

    const handleAddExample = () => {
        if (newQuestion && newAnswer) {
            setExamples(prev => [...prev, { question: newQuestion, answer: newAnswer }]);
            setNewQuestion('');
            setNewAnswer('');
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInputText('');
        setIsTyping(true);

        try {
            const resp = await ChatService.sendMessage(userMsg, { soulMd, examples });
            if (resp && resp.text) {
                setMessages(prev => [...prev, { role: 'coach', text: resp.text }]);
            }
        } catch (err) {
            // Error handled silently in preview
        } finally {
            setIsTyping(false);
        }
    };

    const handleSave = async () => {
        if (!isAdmin) return;
        await PersonalityService.savePersonality(coachId, { soulMd, agentMd, examples });
        alert('Personality saved successfully!');
    };

    if (!isAuthenticated) {
        return (
            <div className="p-6 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                Please sign in to access personality settings.
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                Access Denied: Admin role required.
            </div>
        );
    }

    return (
        <div className="coach-personality-editor p-6 space-y-8 bg-white rounded-xl shadow-sm border border-neutral-200">
            <header className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-semibold text-neutral-800">Define Coach Personality</h2>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer space-x-2">
                        <input
                            data-testid="advanced-mode-toggle"
                            type="checkbox"
                            checked={advancedMode}
                            onChange={(e) => setAdvancedMode(e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-300 text-brand-primary"
                        />
                        <span className="text-sm font-medium text-neutral-600">Advanced Mode</span>
                    </label>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 transition-all font-medium"
                    >
                        Save Personality
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Editor & Templates */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-medium mb-3 text-neutral-700">Personality Definition (soul.md)</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleTemplateSelect(t)}
                                    className="px-3 py-1 text-sm border border-neutral-300 rounded-full hover:border-brand-primary hover:text-brand-primary transition-colors"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <textarea
                            data-testid="soul-md-editor"
                            value={soulMd}
                            onChange={(e) => setSoulMd(e.target.value)}
                            maxLength={MAX_SOUL_LENGTH}
                            className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono text-sm leading-relaxed"
                            placeholder="Describe your coach's persona here... (Markdown supported)"
                        />
                        <div className="text-right text-xs text-neutral-400 mt-1">
                            {soulMd.length} / {MAX_SOUL_LENGTH}
                        </div>
                    </section>

                    {advancedMode && (
                        <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-lg font-medium mb-3 text-neutral-700">Operational Instructions (agent.md)</h3>
                            <textarea
                                data-testid="agent-md-editor"
                                value={agentMd}
                                onChange={(e) => setAgentMd(e.target.value)}
                                maxLength={MAX_AGENT_LENGTH}
                                className="w-full h-48 p-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent font-mono text-sm leading-relaxed bg-neutral-50"
                                placeholder="Advanced operational rules..."
                            />
                            <div className="text-right text-xs text-neutral-400 mt-1">
                                {agentMd.length} / {MAX_AGENT_LENGTH}
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="text-lg font-medium mb-3 text-neutral-700">Conversation Examples (Few-shot)</h3>
                        <div className="space-y-3 mb-4">
                            {examples.map((ex, idx) => (
                                <div key={idx} data-testid="example-item" className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">User</div>
                                    <div className="mb-2 text-neutral-800">{ex.question}</div>
                                    <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Coach</div>
                                    <div className="text-neutral-800 italic">{ex.answer}</div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border border-dashed border-neutral-300 rounded-lg space-y-3">
                            <input
                                data-testid="example-question-input"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                maxLength={MAX_EXAMPLE_LENGTH}
                                className="w-full p-2 text-sm border border-neutral-200 rounded"
                                placeholder="Example question..."
                            />
                            <textarea
                                data-testid="example-answer-input"
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                maxLength={MAX_EXAMPLE_LENGTH}
                                className="w-full p-2 text-sm border border-neutral-200 rounded"
                                placeholder="Example coach response..."
                            />
                            <button
                                data-testid="add-example-button"
                                onClick={handleAddExample}
                                className="w-full py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary hover:text-white border border-brand-primary rounded transition-all"
                            >
                                + Add Example
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Column: Live Preview */}
                <div className="flex flex-col h-full min-h-[600px] border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                    <div className="p-4 bg-neutral-800 text-white flex items-center justify-between">
                        <span className="font-medium">Live Personality Preview</span>
                        <span className="text-xs px-2 py-0.5 bg-brand-primary rounded-full">SANDBOX</span>
                    </div>

                    <div
                        data-testid="live-preview-chat"
                        className="flex-1 p-4 overflow-y-auto space-y-4"
                    >
                        {messages.length === 0 && (
                            <div className="text-center text-neutral-400 mt-20">
                                <p>Send a message to see how your coach responds with the current persona.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user'
                                    ? 'bg-brand-primary text-white rounded-br-none'
                                    : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-lg border border-neutral-200 rounded-bl-none italic text-neutral-400 text-sm">
                                    Coach is thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                maxLength={MAX_INPUT_LENGTH}
                                placeholder="Test the coach..."
                                className="flex-1 p-2 border border-neutral-300 rounded-md focus:ring-1 focus:ring-brand-primary outline-none"
                            />
                            <button
                                data-testid="send-preview-message"
                                onClick={handleSendMessage}
                                disabled={isTyping}
                                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story 5.3: LoRA Training Section */}
            <section className="pt-8 border-t border-neutral-200">
                <LoraTrainingComponent coachId={coachId} />
            </section>
        </div>
    );
};
