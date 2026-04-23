import React, { useState } from 'react'
import type { AIYaklangCodeProps } from './type'
import ChatCard from '../ChatCard'
import { OutlinCompileTwoIcon } from '@/assets/icon/outline'
import ModalInfo from '../ModelInfo'
import styles from './AIYaklangCode.module.scss'
import { useMemoizedFn, useThrottleEffect } from 'ahooks'
import { AIStreamContentType } from '@/pages/AIAgent/ai-re-act/hooks/defaultConstant'
import { YakitEditor } from '@/compoments/yakitUI/YakitEditor/YakitEditor'
import { NewHTTPPacketEditor } from '@/compoments/yakitUI/YakitEditor/editors'

export const AIYaklangCode: React.FC<AIYaklangCodeProps> = React.memo((props) => {
  const { content: defContent, nodeLabel, modalInfo, contentType, referenceNode } = props
  const [content, setContent] = useState(defContent)
  useThrottleEffect(
    () => {
      setContent(defContent)
    },
    [defContent],
    { wait: 500 },
  )
  const renderCode = useMemoizedFn(() => {
    switch (contentType) {
      case AIStreamContentType.CODE_YAKLANG:
        return <YakitEditor type="yak" value={content} readOnly={true} />
      case AIStreamContentType.CODE_HTTP_REQUEST:
        return <NewHTTPPacketEditor originValue={content} readOnly={true} />
      default:
        return null
    }
  })
  return (
    <ChatCard
      titleText={nodeLabel}
      titleIcon={<OutlinCompileTwoIcon />}
      titleExtra={modalInfo && <ModalInfo {...modalInfo} />}
    >
      <div className={styles['ai-yaklang-code']}>{renderCode()}</div>
      {referenceNode}
    </ChatCard>
  )
})
