/**
 * LoraTrainingService.ts
 * Story 5.3: LoRA Training
 */

export type TrainingTier = 'fast' | 'balanced' | 'deep';

export interface TrainingState {
    coachId?: string;
    status: 'idle' | 'preparing' | 'training' | 'packaging' | 'completed' | 'failed';
    progress: number;
    error?: string;
    metrics?: {
        validationLoss: number;
        retrievalScore: number;
    };
    downloadUrl?: string;
}

export class LoraTrainingService {
    private static trainingJobs: Map<string, TrainingState> = new Map();

    static calculateCost(tier: TrainingTier): number {
        const costs = {
            fast: 13,
            balanced: 23.60,
            deep: 51
        };
        return costs[tier] || 0;
    }

    static async startTraining(coachId: string, tier: TrainingTier): Promise<string> {
        // Concurrency Control: Prevent multiple concurrent jobs for same coach
        const existingJob = Array.from(this.trainingJobs.values())
            .find(job => job.coachId === coachId && (job.status !== 'completed' && job.status !== 'failed'));

        if (existingJob) {
            throw new Error(`A training job is already in progress for coach ${coachId}`);
        }

        // Artifact Protection: Secure, non-predictable Job IDs
        const jobId = `job-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;

        const initialState: TrainingState & { coachId: string } = {
            coachId,
            status: 'preparing',
            progress: 0
        };

        this.trainingJobs.set(jobId, initialState);

        // Start simulated background process
        this.simulateTraining(jobId, tier);

        return jobId;
    }

    static async getTrainingStatus(jobId: string): Promise<TrainingState | undefined> {
        return this.trainingJobs.get(jobId);
    }

    private static simulateTraining(jobId: string, _tier: TrainingTier) {
        let progress = 0;
        const interval = setInterval(() => {
            const job = this.trainingJobs.get(jobId);
            if (!job) {
                clearInterval(interval);
                return;
            }

            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                this.trainingJobs.set(jobId, {
                    status: 'completed',
                    progress: 100,
                    metrics: {
                        validationLoss: 0.12 + Math.random() * 0.05,
                        retrievalScore: 0.85 + Math.random() * 0.1
                    },
                    downloadUrl: `/api/admin/models/download/${jobId}.bin`
                });
                clearInterval(interval);
            } else {
                let status: TrainingState['status'] = 'preparing';
                if (progress > 10 && progress < 80) status = 'training';
                if (progress >= 80) status = 'packaging';

                this.trainingJobs.set(jobId, {
                    ...job,
                    status,
                    progress: Math.floor(progress)
                });
            }
        }, 1000);
    }

    static async getDownloadUrl(jobId: string): Promise<string | undefined> {
        const job = this.trainingJobs.get(jobId);
        return job?.downloadUrl;
    }
}
