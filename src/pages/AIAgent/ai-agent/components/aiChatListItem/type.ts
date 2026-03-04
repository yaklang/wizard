import type { ReActChatRenderItem } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import type { AIAgentGrpcApi } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import type { UseYakExecResultState } from '@/pages/AIAgent/ai-re-act/hooks/type';

export interface AIChatListItemProps {
    item: ReActChatRenderItem;
    type: 're-act' | 'task-agent';
    tasksProps?: {
        tasks: AIAgentGrpcApi.PlanTask[];
        yakExecResult: UseYakExecResultState;
    };
    hasNext?: boolean;
}
