import type { FC } from 'react';
import ChatCard from '../ChatCard';
import styles from './AiFailPlanCard.module.scss';
import { TaskErrorIcon } from '../../aiTree/icon';
import type { FailTaskChatError } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import useAINodeLabel from '@/pages/AIAgent/ai-re-act/hooks/useAINodeLabel';

const AiFailPlanCard: FC<{ item: FailTaskChatError }> = ({ item }) => {
    const { content } = item;
    const { nodeLabel } = useAINodeLabel(item.NodeIdVerbose);
    return (
        <ChatCard
            className={styles['ai-fail-plan-wrapper']}
            titleText={nodeLabel}
            titleIcon={<TaskErrorIcon />}
        >
            <div className={styles['ai-fail-plan-card']}>
                <div className={styles['ai-fail-plan-card-title']}>
                    失败原因
                </div>
                <div className={styles['ai-fail-plan-card-content']}>
                    {content && (
                        <pre className={styles['ai-fail-plan-card-code']}>
                            <code>{content}</code>
                        </pre>
                    )}
                </div>
            </div>
        </ChatCard>
    );
};
export default AiFailPlanCard;
