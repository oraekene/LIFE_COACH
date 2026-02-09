/**
 * Dashboard Component
 * Main layout for authenticated users
 * Story 2.1: Browse Coaches
 */

import { useState } from 'react';
import { CoachList } from '../coaches';
import { ChatInterface } from '../chat/ChatInterface';
import { ParaSidebar } from '../memory/ParaSidebar';
import { SettingsPage } from '../settings/SettingsPage';
import { Coach } from '../../types/Coach';
import { useStorage } from '../../providers/StorageProvider';
import './Dashboard.css';

type DashboardTab = 'coaches' | 'chat' | 'profile';

export function Dashboard() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('coaches');
    const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
    const { lock } = useStorage();

    const handleLogout = () => {
        lock();
        // App.tsx will detect locked state and redirect
        window.location.reload();
    };

    const handleSelectCoach = (coach: Coach) => {
        setSelectedCoachId(coach.id);
        setActiveTab('chat');
    };

    return (
        <div className="dashboard">
            <nav className="dashboard__nav">
                <div className="nav__brand">
                    <span className="brand-icon">🌟</span>
                    <span className="brand-text">LifeOS Coach</span>
                </div>

                <ul className="nav__tabs">
                    <li>
                        <button
                            className={`nav__tab ${activeTab === 'coaches' ? 'nav__tab--active' : ''}`}
                            onClick={() => setActiveTab('coaches')}
                            data-testid="nav-coaches"
                        >
                            <span className="tab-icon">👥</span>
                            <span className="tab-text">Coaches</span>
                        </button>
                    </li>
                    <li>
                        <button
                            className={`nav__tab ${activeTab === 'chat' ? 'nav__tab--active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                            data-testid="nav-chat"
                        >
                            <span className="tab-icon">💬</span>
                            <span className="tab-text">Chat</span>
                        </button>
                    </li>
                    <li>
                        <button
                            className={`nav__tab ${activeTab === 'profile' ? 'nav__tab--active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                            data-testid="nav-profile"
                        >
                            <span className="tab-icon">👤</span>
                            <span className="tab-text">Profile</span>
                        </button>
                    </li>
                </ul>

                <button className="nav__logout" onClick={handleLogout} data-testid="logout-btn">
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </nav>

            <main className="dashboard__content">
                {activeTab === 'coaches' && (
                    <CoachList onSelectCoach={handleSelectCoach} />
                )}
                {activeTab === 'chat' && (
                    selectedCoachId ? (
                        <div className="chat-layout">
                            <ParaSidebar />
                            <ChatInterface coachId={selectedCoachId} enableMentions={true} />
                        </div>
                    ) : (
                        <div className="placeholder-view">
                            <h2>💬 Chat</h2>
                            <p>Please select a coach from the Coaches tab to start chatting.</p>
                            <button
                                className="btn btn--primary"
                                onClick={() => setActiveTab('coaches')}
                            >
                                Browse Coaches
                            </button>
                        </div>
                    )
                )}
                {activeTab === 'profile' && <SettingsPage />}
            </main>
        </div>
    );
}
