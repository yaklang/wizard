import React, { useMemo } from 'react'
import type { AIStreamChatContentProps } from './type'
import { Tooltip } from 'antd'
import { CopyComponents } from '@/compoments/yakitUI/YakitTag/YakitTag'
import styles from './AIStreamChatContent.module.scss'
import classNames from 'classnames'
import useAINodeLabel from '@/pages/AIAgent/ai-re-act/hooks/useAINodeLabel'

const STREAM_MASK_THRESHOLD = 100

export const AIStreamChatContent: React.FC<AIStreamChatContentProps> = React.memo((props) => {
  const { content, nodeIdVerbose, referenceNode } = props
  const { nodeLabel } = useAINodeLabel(nodeIdVerbose)
  const shouldShowMask = useMemo(() => content.length > STREAM_MASK_THRESHOLD, [content])

  return (
    <div className={classNames(styles['ai-stream-chat-content-wrapper'], 'ai-stream-chat-content-wrapper')}>
      <div className={styles['ai-stream-chat-content']}>
        <div className={styles['title']}>
          {/* <OutlineSparklesColorsIcon /> */}
          {nodeLabel}
        </div>
        <div className={styles['ai-stream-content']}>
          <Tooltip
            placement="topRight"
            title={
              <div className={styles['tooltip-stream-content']}>
                {content}
                <CopyComponents copyText={content} />
              </div>
            }
            trigger="click"
          >
            {shouldShowMask && <div className={styles['ai-mask']} />}
            {content}
          </Tooltip>
          {referenceNode}
        </div>
      </div>
    </div>
  )
})
