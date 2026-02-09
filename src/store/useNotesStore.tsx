import React, { createContext, useContext, useState } from 'react';
import { CapturedNote } from '../types/Memory';

interface NotesContextType {
    notes: CapturedNote[];
    addNote: (note: CapturedNote) => void;
    addNotes: (notes: CapturedNote[]) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notes, setNotes] = useState<CapturedNote[]>([]);

    const addNote = (note: CapturedNote) => {
        setNotes(prev => [...prev, note]);
    };

    const addNotes = (newNotes: CapturedNote[]) => {
        setNotes(prev => [...prev, ...newNotes]);
    };

    return (
        <NotesContext.Provider value={{ notes, addNote, addNotes }}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotesStore = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error('useNotesStore must be used within a NotesProvider');
    }
    return context;
};
