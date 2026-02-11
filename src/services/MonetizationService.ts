export type PriceOption = 'Free' | 'Tier1' | 'Tier2' | 'Tier3';
export type VersionType = 'minor' | 'major';
export type Region = 'EU' | 'US' | 'Global';

export interface RevenueShare {
    admin: number;
    platform: number;
}

export interface AnalyticsData {
    downloads: number;
    activeUsers: number;
    retention: number;
}

interface CoachMetadata {
    price: string | number;
    regions: Region[];
    version: string;
    analytics: AnalyticsData;
}

export class MonetizationService {
    private coachData: Map<string, CoachMetadata> = new Map();
    private readonly VALID_REGIONS: Set<string> = new Set(['EU', 'US', 'Global']);
    private readonly VERSION_REGEX = /^\d+\.\d+$/;

    private getCoach(coachId: string): CoachMetadata {
        if (!this.coachData.has(coachId)) {
            this.coachData.set(coachId, {
                price: 'Free',
                regions: [],
                version: '1.0',
                analytics: {
                    downloads: 0,
                    activeUsers: 0,
                    retention: 0
                }
            });
        }
        return this.coachData.get(coachId)!;
    }

    setPrice(coachId: string, option: PriceOption, userId: string): void {
        // Authorization check (Mock)
        if (!userId) {
            throw new Error('Unauthorized: User ID required to set price');
        }

        const coach = this.getCoach(coachId);
        switch (option) {
            case 'Free':
                coach.price = 'Free';
                break;
            case 'Tier1':
                coach.price = 5;
                break;
            case 'Tier2':
                coach.price = 15;
                break;
            case 'Tier3':
                coach.price = 30;
                break;
            default:
                throw new Error(`Invalid price option: ${option}`);
        }
    }

    getPrice(coachId: string): string | number {
        return this.getCoach(coachId).price;
    }

    calculateRevenueShare(amount: number): RevenueShare {
        // Use integer math (cents) to avoid floating point errors
        const totalCents = Math.round(amount * 100);
        const adminCents = Math.round(totalCents * 0.7);
        const platformCents = totalCents - adminCents; // Ensure total equals 100%

        return {
            admin: adminCents / 100,
            platform: platformCents / 100
        };
    }

    setRegionAvailability(coachId: string, regions: string[], userId: string): void {
        // Authorization check (Mock)
        if (!userId) {
            throw new Error('Unauthorized: User ID required to set regions');
        }

        // Validate regions
        for (const region of regions) {
            if (!this.VALID_REGIONS.has(region)) {
                throw new Error(`Invalid region: ${region}`);
            }
        }

        const coach = this.getCoach(coachId);
        coach.regions = regions as Region[];
    }

    getRegionAvailability(coachId: string): Region[] {
        return this.getCoach(coachId).regions;
    }

    getVersion(coachId: string): string {
        return this.getCoach(coachId).version;
    }

    incrementVersion(coachId: string, type: VersionType): string {
        const coach = this.getCoach(coachId);

        // Validate current version format before incrementing
        if (!this.VERSION_REGEX.test(coach.version)) {
            throw new Error(`Invalid version format detected: ${coach.version}`);
        }

        const parts = coach.version.split('.').map(Number);

        if (type === 'major') {
            parts[0] += 1;
            parts[1] = 0;
        } else {
            parts[1] += 1;
        }

        const newVersion = parts.join('.');
        coach.version = newVersion;
        return newVersion;
    }

    // Dangerous method removed for security
    // _dangerousSetVersion(coachId: string, version: string): void { ... }

    getAnalytics(coachId: string): AnalyticsData {
        const analytics = this.getCoach(coachId).analytics;
        // Basic sanitization/cloning to prevent mutation of internal state
        return { ...analytics };
    }
}
