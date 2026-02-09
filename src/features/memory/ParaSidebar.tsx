import { useState, useEffect, useRef } from 'react';
import { MemoryService } from '../../services/memory/MemoryService';
import { ParaContext, ParaEntity, PersonEntity } from '../../types/Memory';
import './ParaSidebar.css';

interface ParaSidebarProps {
    memoryService?: MemoryService;
}

export function ParaSidebar({ memoryService: injectedService }: ParaSidebarProps) {
    const memoryService = useRef(injectedService || new MemoryService());
    const [context, setContext] = useState<ParaContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContext = async () => {
            try {
                const data = await memoryService.current.getParaEntities();
                setContext(data);
            } catch (error) {
                console.error('Failed to load PARA context', error);
            } finally {
                setLoading(false);
            }
        };
        loadContext();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!context) return null;

    return (
        <div className="para-sidebar">
            <div data-testid="category-projects" className="para-category">
                <h3>Projects</h3>
                <ul>
                    {context.projects.map(project => (
                        <li key={project.id} className={`para-item ${isHot(project.lastAccessed) ? 'para-item--hot' : ''}`}>
                            <span className="para-name">{project.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div data-testid="category-people" className="para-category">
                <h3>People</h3>
                <ul>
                    {context.people.map(person => (
                        <li key={person.id} className={`para-item ${isHot(person.lastAccessed) ? 'para-item--hot' : ''}`}>
                            <span className="para-name">{person.name}</span>
                            <span className="para-relation">{person.relation}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function isHot(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
}
