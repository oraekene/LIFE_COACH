import React, { useState } from 'react';
import { AdminCoachUpload } from './AdminCoachUpload';
import { CoachPersonalityEditor } from './CoachPersonalityEditor';
import { LoraTrainingComponent } from './LoraTrainingComponent';
import './AdminDashboard.css';

type AdminView = 'upload' | 'personality' | 'training';

export const AdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('upload');

    return (
        <div className="admin-dashboard">
            <header className="admin-dashboard__header">
                <h1>Coach Creation Suite</h1>
                <nav className="admin-dashboard__nav">
                    <button
                        className={`admin-nav-btn ${activeView === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveView('upload')}
                    >
                        1. Upload Material
                    </button>
                    <button
                        className={`admin-nav-btn ${activeView === 'personality' ? 'active' : ''}`}
                        onClick={() => setActiveView('personality')}
                    >
                        2. Define Personality
                    </button>
                    <button
                        className={`admin-nav-btn ${activeView === 'training' ? 'active' : ''}`}
                        onClick={() => setActiveView('training')}
                    >
                        3. LoRA Training
                    </button>
                </nav>
            </header>

            <div className="admin-dashboard__content">
                {activeView === 'upload' && <AdminCoachUpload coachId="new-coach-123" />}
                {activeView === 'personality' && <CoachPersonalityEditor coachId="new-coach-123" />}
                {activeView === 'training' && <LoraTrainingComponent coachId="new-coach-123" />}
            </div>
        </div>
    );
};
