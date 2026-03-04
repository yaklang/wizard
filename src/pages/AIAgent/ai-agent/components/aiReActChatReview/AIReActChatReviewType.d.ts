import type { AIChatIPCSendParams } from '@/pages/ai-agent/useContext/ChatIPCContent/ChatIPCContent';
import type { AIChatQSData } from '../../../ai-re-act/hooks/aiRender';
import type { AIAgentGrpcApi } from '../../../ai-re-act/hooks/grpcApi';

export interface AIReActChatReviewProps {
    info: AIChatQSData;
    onSendAI: (params: AIChatIPCSendParams) => void;
    planReviewTreeKeywordsMap?: Map<
        string,
        AIAgentGrpcApi.PlanReviewRequireExtra
    >;
    isEmbedded?: boolean;
    renderFooterExtra?: (node: React.ReactNode) => React.ReactNode;
    expand: boolean;
    className?: string;
}

export interface ForgeReviewFormRefProps {
    validateFields: Promise;
}
export interface ForgeReviewFormProps extends AIAgentGrpcApi.ExecForgeReview {
    ref: React.ForwardedRef<ForgeReviewFormRefProps>;
    /** 是否可编辑 */
    editable: boolean;
}
