import type { AIAgentGrpcApi } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AITaskQueryProps {}

export interface AITaskQueryItemProps {
    item: AIAgentGrpcApi.QuestionQueueItem;
}
