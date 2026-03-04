import useChatIPCDispatcher from '@/pages/AIAgent/ai-agent/useContext/ChatIPCContent/useDispatcher';
import type {
    AIChatQSData,
    ReActChatRenderItem,
} from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import type { FC, ReactNode } from 'react';
import { memo } from 'react';

type StaticChatContentProps = ReActChatRenderItem & {
    render?: (contentItem: AIChatQSData) => ReactNode;
    session: string;
};

const StaticChatContent: FC<StaticChatContentProps> = ({
    chatType,
    token,
    render,
    session,
}) => {
    const { fetchChatDataStore } = useChatIPCDispatcher().chatIPCEvents;

    const chatItem = fetchChatDataStore()?.getContentMap({
        session,
        chatType,
        mapKey: token,
    });
    if (!chatItem) return null;
    return render?.(chatItem);
};
export default memo(StaticChatContent);
