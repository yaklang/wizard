import React, { useEffect, useRef, useState } from 'react'
import type { AIChatSelectProps, ReviewRuleSelectProps } from './type'
import useAIAgentStore from '../../ai-agent/useContext/useStore'
import useAIAgentDispatcher from '../../ai-agent/useContext/useDispatcher'
import useChatIPCStore from '../../ai-agent/useContext/ChatIPCContent/useStore'
import useChatIPCDispatcher from '../../ai-agent/useContext/ChatIPCContent/useDispatcher'
import { AIInputEventHotPatchTypeEnum, type AIStartParams } from '../hooks/grpcApi'
import { useClickAway, useControllableValue, useCreation, useInViewport, useMemoizedFn } from 'ahooks'
import emiter from '@/utils/eventBus/eventBus'
import type { AIReviewRuleOptionsType } from '../../ai-agent/defaultConstant'
import { AIAgentSettingDefault, AIReviewRuleIconMap, AIReviewRuleOptions } from '../../ai-agent/defaultConstant'
import { isEqual } from 'lodash'
import classNames from 'classnames'
import styles from './AIReviewRuleSelect.module.scss'
import { YakitSegmented } from '@/compoments/YakitUI/YakitSegmented/YakitSegmented'
import type { AIAgentSetting } from '../../ai-agent/aiAgentType'
import { Tooltip } from 'antd'
import { YakitPopover } from '@/compoments/YakitUI/YakitPopover/YakitPopover'
import { FormItemSlider } from '../../ai-agent/AIChatSetting/AIChatSetting'
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton'
import { OutlineSirenIcon } from '@/assets/icon/outline'
import { YakitSelect } from '@/compoments/YakitUI/YakitSelect/YakitSelect'

const AIReviewRuleSelect: React.FC<ReviewRuleSelectProps> = React.memo((props) => {
  const { setting } = useAIAgentStore()
  const { setSetting } = useAIAgentDispatcher()

  const { chatIPCData } = useChatIPCStore()
  const { handleSendConfigHotpatch } = useChatIPCDispatcher()

  const [visible, setVisible] = useState<boolean>(false)
  const [selectAIReviewRiskControlScore, setAIReviewRiskControlScore] =
    useState<AIStartParams['AIReviewRiskControlScore']>()

  const refRef = useRef<HTMLDivElement>(null)
  const [inViewport = true] = useInViewport(refRef)

  useEffect(() => {
    if (!inViewport) return
    emiter.on('onRefreshAIReviewRuleSelect', onRefreshAIReviewRuleSelect)
    return () => {
      emiter.off('onRefreshAIReviewRuleSelect', onRefreshAIReviewRuleSelect)
    }
  }, [inViewport])

  const modelValue = useCreation(() => {
    return setting?.ReviewPolicy || AIAgentSettingDefault.ReviewPolicy
  }, [setting?.ReviewPolicy, chatIPCData.execute])

  const aiReviewRiskControlScore = useCreation(() => {
    return setting?.AIReviewRiskControlScore || AIAgentSettingDefault.AIReviewRiskControlScore
  }, [setting?.AIReviewRiskControlScore])

  const onRefreshAIReviewRuleSelect = useMemoizedFn((res: string) => {
    if (!chatIPCData.execute) return
    const data = JSON.parse(res)
    if (data?.reviewPolicy) {
      handHotpatchReviewPolicy(data?.reviewPolicy as AIStartParams['ReviewPolicy'])
    }
    if (data?.aiReviewRiskControlScore) {
      handHotpatchAIReviewRiskControlScore(data?.aiReviewRiskControlScore)
    }
  })

  const handHotpatchReviewPolicy = useMemoizedFn((value: AIStartParams['ReviewPolicy']) => {
    handleSendConfigHotpatch({
      hotpatchType: AIInputEventHotPatchTypeEnum.HotPatchType_AgreePolicy,
      params: {
        ReviewPolicy: value,
      },
    })
  })

  const handHotpatchAIReviewRiskControlScore = useMemoizedFn((value: number) => {
    handleSendConfigHotpatch({
      hotpatchType: AIInputEventHotPatchTypeEnum.HotPatchType_RiskControlScore,
      params: {
        AIReviewRiskControlScore: value,
      },
    })
  })

  const onSelectModel = useMemoizedFn((value: AIStartParams['ReviewPolicy']) => {
    setSetting && setSetting((old) => ({ ...old, ReviewPolicy: value }))
    if (chatIPCData.execute && modelValue) {
      handHotpatchReviewPolicy(value)
    }
  })

  const onSetAIReviewRiskControlScore = useMemoizedFn((value?: number) => {
    setSetting && setSetting((old) => ({ ...old, AIReviewRiskControlScore: value || 0 }))
  })

  const onVisibleChange = useMemoizedFn((v: boolean) => {
    setVisible(v)
    if (
      !v &&
      chatIPCData.execute &&
      selectAIReviewRiskControlScore &&
      !isEqual(selectAIReviewRiskControlScore, aiReviewRiskControlScore)
    ) {
      handHotpatchAIReviewRiskControlScore(selectAIReviewRiskControlScore)
      onSetAIReviewRiskControlScore(selectAIReviewRiskControlScore)
    }
    if (v) setAIReviewRiskControlScore(aiReviewRiskControlScore)
  })
  const getIcon = useMemoizedFn((value: AIReviewRuleOptionsType) => {
    if (modelValue === value) {
      return AIReviewRuleIconMap[value]?.activeIcon
    }
    return AIReviewRuleIconMap[value]?.icon
  })
  return (
    <div className={classNames(styles['review-rule-select-wrapper'], props.className)} ref={refRef}>
      <YakitSegmented
        value={modelValue}
        onChange={(v) => {
          const showType = v as AIAgentSetting['ReviewPolicy']
          onSelectModel(showType)
        }}
        options={AIReviewRuleOptions.map((item) => ({
          icon: <Tooltip title={item.describe}>{getIcon(item.value)}</Tooltip>,
          value: item.value,
        }))}
        size="small"
        wrapClassName={styles['yakit-segmented-wrapper']}
        className={styles['segmented']}
      />
      {modelValue === 'ai' && (
        <YakitPopover
          content={
            <div className={styles['popover-wrapper']}>
              <span>风险阈值：</span>
              <FormItemSlider
                value={selectAIReviewRiskControlScore}
                onChange={setAIReviewRiskControlScore}
                min={0}
                max={1}
                step={0.01}
              />
            </div>
          }
          trigger={['hover', 'click']}
          visible={visible}
          onVisibleChange={onVisibleChange}
        >
          <YakitButton
            type="text2"
            isHover={visible}
            icon={<OutlineSirenIcon className={styles['siren-icon']} />}
            onClick={(e) => {
              e.stopPropagation()
            }}
          />
        </YakitPopover>
      )}
    </div>
  )
})
export default AIReviewRuleSelect

export const AIChatSelect: React.FC<AIChatSelectProps> = React.memo((props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { getList, dropdownRender, children, setOpen: defSetOpen, ...rest } = props
  const [open, setOpen] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: 'open',
    trigger: 'setOpen',
  })

  const selectWrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRenderRef = useRef<HTMLDivElement>(null)
  const isHoveringByDropdown = useRef<boolean>(false)

  useClickAway(() => {
    if (open) setOpen(false)
  }, [selectWrapperRef])

  const onMouseEnterDropdown = useMemoizedFn((e) => {
    e.stopPropagation()
    isHoveringByDropdown.current = true
  })
  const onMouseLeaveDropdown = useMemoizedFn((e) => {
    e.stopPropagation()
    setOpen(false)
    isHoveringByDropdown.current = false
  })
  const onSelectWrapperClick = useMemoizedFn((e) => {
    e.stopPropagation()
    onOpen()
  })
  const onMouseEnterSelectWrapper = useMemoizedFn((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
    onOpen()
  })
  const onMouseLeaveSelectWrapper = useMemoizedFn((e) => {
    e.stopPropagation()
    setTimeout(() => {
      if (!isHoveringByDropdown.current && open) setOpen(false)
    }, 500)
  })
  const onOpen = useMemoizedFn(() => {
    setOpen(true)
    getList && getList()
  })
  const onDropdownRender = useMemoizedFn((menu) => (
    <div onMouseEnter={onMouseEnterDropdown} onMouseLeave={onMouseLeaveDropdown} ref={dropdownRenderRef}>
      {dropdownRender(menu, setOpen)}
    </div>
  ))
  return (
    <div
      ref={selectWrapperRef}
      className={classNames(styles['ai-chat-select-wrapper'])}
      onMouseEnter={onMouseEnterSelectWrapper}
      onMouseLeave={onMouseLeaveSelectWrapper}
      onClick={onSelectWrapperClick}
    >
      <YakitSelect
        dropdownMatchSelectWidth={false}
        size="small"
        dropdownRender={onDropdownRender}
        bordered={false}
        open={open}
        {...rest}
      >
        {children}
      </YakitSelect>
    </div>
  )
})
