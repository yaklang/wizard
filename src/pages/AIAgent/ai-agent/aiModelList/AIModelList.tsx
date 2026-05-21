import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type {
  AIModelActionProps,
  AIModelListProps,
  AIOnlineModelListItemProps,
  AIOnlineModelListProps,
  AIOnlineModelListRefProps,
  AIOnlineModelProps,
  AIOnlineModeSettingProps,
  OutlineAtomIconByStatusProps,
} from './AIModelListType'
import styles from './AIModelList.module.scss'
import {
  useCreation,
  // useDebounceFn,
  useInViewport,
  useMemoizedFn,
} from 'ahooks'
import { YakitSpin } from '@/compoments/yakitUI/YakitSpin/YakitSpin'
import {
  type AIGlobalConfig,
  type AIModelConfig,
  grpcAIConfigHealthCheck,
  grpcGetAIGlobalConfig,
  grpcSetAIGlobalConfig,
  resetForcedAIModalFlag,
} from './utils'
import { Divider, Form, Tooltip } from 'antd'
import { YakitEmpty } from '@/compoments/yakitUI/YakitEmpty/YakitEmpty'
import { YakitButton } from '@/compoments/yakitUI/YakitButton/YakitButton'
import {
  OutlineAtomIcon,
  OutlinePencilaltIcon,
  OutlinePlusIcon,
  OutlinePlussmIcon,
  OutlineRefreshIcon,
  OutlineTrashIcon,
  OutlineCheckIcon,
  OutlineCogIcon,
  OutlineEngineIcon,
} from '@/assets/icon/outline'
import { showYakitModal } from '@/compoments/yakitUI/YakitModal/YakitModalConfirm'
import {
  AIModelPolicyEnum,
  AIModelPolicyOptions,
  AIModelTypeEnum,
  AIModelTypeInterFileNameEnum,
  AIOnlineModelIconMap,
} from '../defaultConstant'
import { YakitPopconfirm } from '@/compoments/yakitUI/YakitPopconfirm/YakitPopconfirm'
import classNames from 'classnames'
// import { onOpenLocalFileByPath } from '@/pages/notepadManage/notepadManage/utils';
import emiter from '@/utils/eventBus/eventBus'
import type { AIModelFormProps } from './aiModelForm/AIModelFormType'
import {
  AIModelCheckResult,
  AIModelForm,
  buildAIConfigHealthCheckConfig,
  getModelTypeByFileName,
} from './aiModelForm/AIModelForm'
import { yakitNotify } from '@/utils/notification'
import { YakitPopover } from '@/compoments/yakitUI/YakitPopover/YakitPopover'
import { YakitRadioButtons } from '@/compoments/yakitUI/YakitRadioButtons/YakitRadioButtons'
import { YakitSwitch } from '@/compoments/yakitUI/YakitSwitch/YakitSwitch'
import type { ThirdPartyApplicationConfig } from '@/compoments/configNetwork/ConfigNetworkPage'

export const setAIModal = (params: {
  modelType?: AIModelFormProps['aiModelType']
  item?: AIModelFormProps['item']
  onSuccess: () => void
  mountContainer?: AIOnlineModelListProps['mountContainer']
}) => {
  const { modelType, item, onSuccess, mountContainer } = params
  let m = showYakitModal({
    title: '添加第三方应用',
    width: 600,
    footer: null,
    closable: true,
    maskClosable: false,
    keyboard: false,
    // @ts-ignore
    getContainer: mountContainer,
    onCancel: () => {
      m.destroy()
    },
    content: (
      <AIModelForm
        item={item}
        aiModelType={modelType || AIModelTypeEnum.TierIntelligent}
        onClose={() => {
          m.destroy()
        }}
        onSuccess={() => {
          resetForcedAIModalFlag()
          onSuccess()
        }}
      />
    ),
  })
}

/** 编辑ai model */
export const onEditAIModel = (data: {
  aiGlobalConfig: AIGlobalConfig
  index: number
  fileName: string
  mountContainer?: AIOnlineModelListProps['mountContainer']
  onSuccess: () => void
}) => {
  const { aiGlobalConfig, index, fileName, mountContainer, onSuccess } = data
  try {
    if (!aiGlobalConfig) return
    // @ts-ignore
    const currentItem = aiGlobalConfig[fileName][index]
    const modelType = getModelTypeByFileName(fileName)
    if (!currentItem || !modelType) {
      yakitNotify(
        'error',
        `配置错误，无法编辑:modelType:${modelType};fileName:${fileName};currentItem:${JSON.stringify(currentItem)}`,
      )
      return
    }
    setAIModal({
      item: currentItem,
      modelType,
      mountContainer,
      onSuccess: () => {
        onSuccess()
      },
    })
  } catch (error) {}
}

/** 删除 ai model */
export const onRemoveAIModel = (data: {
  aiGlobalConfig: AIGlobalConfig
  index: number
  fileName: string
  onSuccess: () => void
}) => {
  try {
    const { fileName, index, aiGlobalConfig, onSuccess } = data
    if (!aiGlobalConfig) return
    const newAIGlobalConfig = { ...aiGlobalConfig }
    // @ts-ignore
    const list = newAIGlobalConfig[fileName].filter((_, i) => i !== index)
    // @ts-ignore
    newAIGlobalConfig[fileName] = [...list]
    grpcSetAIGlobalConfig(newAIGlobalConfig).then(() => {
      onSuccess()
    })
  } catch (error) {}
}

/** 选中得model,设置为该类型得第一位 */
export const onSelectAIModel = (data: {
  aiGlobalConfig: AIGlobalConfig
  item: AIModelConfig
  index: number
  fileName: string
  onSuccess: () => void
}) => {
  try {
    const { fileName, item, index, aiGlobalConfig, onSuccess } = data
    if (!aiGlobalConfig) return
    const newAIGlobalConfig: any = { ...aiGlobalConfig }
    newAIGlobalConfig[fileName].splice(index, 1)
    newAIGlobalConfig[fileName].unshift(item)
    grpcSetAIGlobalConfig(newAIGlobalConfig).then(() => {
      onSuccess()
    })
    emiter.emit(
      'aiModelSelectChange',
      JSON.stringify({
        type: 'online',
        params: {
          AIService: item.Provider.Type,
          AIModelName: item.ModelName,
          fileName,
        },
      }),
    )
    emiter.emit('onRefreshAvailableAIModelList')
  } catch (error) {}
}

const AIModelList: React.FC<AIModelListProps> = React.memo((props) => {
  const { mountContainer } = props
  const [onlineTotal, setOnlineTotal] = useState<number>(0)
  const onlineRef = useRef<AIOnlineModelListRefProps>(null)
  const onlineListRef = useRef<HTMLDivElement>(null)
  const [inViewport = true] = useInViewport(onlineListRef)

  useEffect(() => {
    if (!inViewport) return
    emiter.on('onRefreshAIModelList', onRefresh)
    return () => {
      emiter.off('onRefreshAIModelList', onRefresh)
    }
  }, [inViewport])

  useEffect(() => {
    if (inViewport) {
      onRefresh()
    }
  }, [inViewport])

  const total = useCreation(() => {
    return onlineTotal
  }, [onlineTotal])
  const onRefresh = useMemoizedFn(() => {
    onlineRef.current?.onRefresh()
  })
  const onAdd = useMemoizedFn(() => {
    onAddOnline()
  })

  const onAddOnline = useMemoizedFn(() => {
    setAIModal({
      mountContainer,
      onSuccess: () => {
        onlineRef.current?.onRefresh()
      },
    })
  })
  const onClear = useMemoizedFn(() => {
    onClearOnline()
  })
  const onClearOnline = useMemoizedFn(() => {
    onlineRef.current?.onRemoveAll()
  })
  return (
    <div className={styles['ai-model-list-wrapper']} ref={onlineListRef}>
      <div className={styles['ai-model-list-header']}>
        <div className={styles['ai-model-list-header-left']}>
          <div className={styles['ai-model-list-header-left-text']}>线上</div>
          <div className={styles['ai-model-list-total']}>{total}</div>
        </div>
        <div className={styles['ai-model-list-header-right']}>
          <AIOnlineModeSetting onRefresh={onRefresh} />
          <Tooltip title="添加">
            <YakitButton type="text2" icon={<OutlinePlusIcon />} onClick={onAdd} />
          </Tooltip>
          <Tooltip title="刷新">
            <YakitButton type="text2" icon={<OutlineRefreshIcon />} onClick={onRefresh} />
          </Tooltip>
          <Divider type="vertical" />
          <YakitPopconfirm placement="right" title="是否确认清空所有线上模型配置" onConfirm={onClear}>
            <YakitButton type="text" danger>
              清空
            </YakitButton>
          </YakitPopconfirm>
        </div>
      </div>
      <AIOnlineModelList
        ref={onlineRef}
        setOnlineTotal={setOnlineTotal}
        onAdd={onAdd}
        mountContainer={mountContainer}
      />
    </div>
  )
})

export default AIModelList

export const getTipByType = (routingPolicy: AIModelPolicyEnum) => {
  switch (routingPolicy) {
    case AIModelPolicyEnum.PolicyAuto:
      return '根据请求内容自动选择最合适的模型'
    case AIModelPolicyEnum.PolicyPerformance:
      return '优先使用高智能模型'
    case AIModelPolicyEnum.PolicyCost:
      return '优先使用轻量级/低成本模型'
    case AIModelPolicyEnum.PolicyBalance:
      return '在响应速度、智能程度和成本之间取得平衡'

    default:
      return null
  }
}

const AIOnlineModeSetting: React.FC<AIOnlineModeSettingProps> = React.memo((props) => {
  const { onRefresh } = props
  const [visible, setVisible] = useState<boolean>(false)
  const configRef = useRef<AIGlobalConfig>()
  const [form] = Form.useForm()
  const routingPolicy = Form.useWatch('RoutingPolicy', form)

  const getList = useMemoizedFn(() => {
    grpcGetAIGlobalConfig().then((res) => {
      configRef.current = res
      form.setFieldsValue({
        RoutingPolicy: res.RoutingPolicy || AIModelPolicyEnum.PolicyAuto,
        DisableFallback: res.DisableFallback,
      })
    })
  })

  const onSetConfig = useMemoizedFn((visible: boolean) => {
    setVisible(visible) // 不管是否保存成功,都设置
    if (visible) {
      getList()
      return
    }

    const values = form.getFieldsValue()
    if (!configRef.current) {
      yakitNotify('error', '配置更新失败,未获取到全局ai配置,请重试')
      return
    }
    if (
      configRef.current.RoutingPolicy === values.RoutingPolicy &&
      configRef.current.DisableFallback === values.DisableFallback
    ) {
      return
    }
    const config: AIGlobalConfig = {
      ...configRef.current,
      RoutingPolicy: values.RoutingPolicy,
      DisableFallback: values.DisableFallback,
    }
    grpcSetAIGlobalConfig(config).then(() => {
      onRefresh()
    })
  })
  return (
    <YakitPopover
      content={
        <div className={styles['ai-online-mode-setting-popover']}>
          <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Form.Item name="RoutingPolicy" label="调用模式" extra={<>{getTipByType(routingPolicy)}</>}>
              <YakitRadioButtons buttonStyle="solid" options={AIModelPolicyOptions} />
            </Form.Item>
            <Form.Item name="DisableFallback" valuePropName="checked" label="禁用降级到轻量模型">
              <YakitSwitch size="middle" />
            </Form.Item>
          </Form>
        </div>
      }
      visible={visible}
      onVisibleChange={onSetConfig}
      placement="bottomRight"
    >
      <YakitButton type="text2" icon={<OutlineCogIcon />} />
    </YakitPopover>
  )
})

const AIOnlineModelList: React.FC<AIOnlineModelListProps> = React.memo(
  forwardRef((props, ref) => {
    const { setOnlineTotal, onAdd } = props

    const [spinning, setSpinning] = useState<boolean>(false)
    const [aiGlobalConfig, setAIGlobalConfig] = useState<AIGlobalConfig>()
    const onlineListRef = useRef<HTMLDivElement>(null)
    const [inViewport = true] = useInViewport(onlineListRef)
    useImperativeHandle(
      ref,
      () => ({
        onRefresh: (isShowLoading) => {
          getList(isShowLoading)
        },
        onRemoveAll: () => onRemoveAll(),
      }),
      [],
    )
    useEffect(() => {
      if (inViewport) getList()
    }, [inViewport])
    const getList = useMemoizedFn((isShowLoading?: boolean) => {
      const showLoading = isShowLoading !== false
      showLoading && setSpinning(true)
      grpcGetAIGlobalConfig()
        .then((res) => {
          setAIGlobalConfig(res)
          const total =
            (res.IntelligentModels?.length || 0) +
            (res.LightweightModels?.length || 0) +
            (res.VisionModels?.length || 0)
          setOnlineTotal(total)
        })
        .finally(() => {
          showLoading &&
            setTimeout(() => {
              setSpinning(false)
            }, 200)
        })
    })
    const onRemoveAll = useMemoizedFn(() => {})
    const isHaveData = useCreation(() => {
      return !!(
        aiGlobalConfig?.IntelligentModels?.length ||
        aiGlobalConfig?.LightweightModels?.length ||
        aiGlobalConfig?.VisionModels?.length
      )
    }, [
      aiGlobalConfig?.IntelligentModels?.length,
      aiGlobalConfig?.LightweightModels?.length,
      aiGlobalConfig?.VisionModels?.length,
    ])

    const onEdit = useMemoizedFn((options: AIModelActionProps) => {
      try {
        if (!aiGlobalConfig) return
        const { fileName, index } = options
        onEditAIModel({
          aiGlobalConfig,
          index,
          fileName,
          mountContainer: undefined,
          onSuccess: () => {
            getList()
          },
        })
      } catch (error) {}
    })
    const onRemove = useMemoizedFn((options: AIModelActionProps) => {
      if (!aiGlobalConfig) return
      const { fileName, index } = options
      onRemoveAIModel({
        aiGlobalConfig,
        index,
        fileName,
        onSuccess: () => {
          getList()
        },
      })
    })
    const onSelect = useMemoizedFn((item: AIModelConfig, options: AIModelActionProps) => {
      if (!aiGlobalConfig) return
      const { fileName, index } = options
      onSelectAIModel({
        aiGlobalConfig,
        item,
        index,
        fileName,
        onSuccess: () => {
          getList()
        },
      })
    })
    return (
      <YakitSpin spinning={spinning}>
        {isHaveData ? (
          <div className={styles['ai-online-model-wrapper']} ref={onlineListRef}>
            {!!aiGlobalConfig?.IntelligentModels?.length && (
              <AIOnlineModel
                title="高质模型"
                subTitle="用于执行复杂度高的任务,对话框中可切换该模型"
                list={aiGlobalConfig?.IntelligentModels || []}
                onEdit={(index: any) =>
                  onEdit({
                    fileName: AIModelTypeInterFileNameEnum.IntelligentModels,
                    index,
                  })
                }
                onRemove={(index: any) =>
                  onRemove({
                    fileName: AIModelTypeInterFileNameEnum.IntelligentModels,
                    index,
                  })
                }
                onSelect={(item: any, index: any) =>
                  onSelect(item, {
                    fileName: AIModelTypeInterFileNameEnum.IntelligentModels,
                    index,
                  })
                }
                modelType={AIModelTypeEnum.TierIntelligent}
              />
            )}
            {!!aiGlobalConfig?.LightweightModels?.length && (
              <AIOnlineModel
                title="轻量模型"
                subTitle="用于执行简单任务和会话"
                list={aiGlobalConfig?.LightweightModels || []}
                onEdit={(index: any) =>
                  onEdit({
                    fileName: AIModelTypeInterFileNameEnum.LightweightModels,
                    index,
                  })
                }
                onRemove={(index: any) =>
                  onRemove({
                    fileName: AIModelTypeInterFileNameEnum.LightweightModels,
                    index,
                  })
                }
                onSelect={(item: any, index: any) =>
                  onSelect(item, {
                    fileName: AIModelTypeInterFileNameEnum.LightweightModels,
                    index,
                  })
                }
                modelType={AIModelTypeEnum.TierLightweight}
              />
            )}
            {!!aiGlobalConfig?.VisionModels?.length && (
              <AIOnlineModel
                title="视觉模式"
                subTitle="用于识别图片等,生成知识库和任务执行都会用到"
                list={aiGlobalConfig?.VisionModels || []}
                onEdit={(index: any) =>
                  onEdit({
                    fileName: AIModelTypeInterFileNameEnum.VisionModels,
                    index,
                  })
                }
                onRemove={(index: any) =>
                  onRemove({
                    fileName: AIModelTypeInterFileNameEnum.VisionModels,
                    index,
                  })
                }
                onSelect={(item: any, index: any) =>
                  onSelect(item, {
                    fileName: AIModelTypeInterFileNameEnum.VisionModels,
                    index,
                  })
                }
                modelType={AIModelTypeEnum.TierVision}
              />
            )}
          </div>
        ) : (
          <div className={styles['ai-list-empty-wrapper']}>
            <YakitEmpty title="暂无数据" description="通过 api 访问模型，接受 AI 信息或向 Al 发送信息，可配置多个。" />
            <div className={styles['ai-list-btns-wrapper']}>
              <YakitButton type="outline1" icon={<OutlinePlussmIcon />} onClick={onAdd}>
                添加模型
              </YakitButton>
            </div>
          </div>
        )}
      </YakitSpin>
    )
  }),
)

export const AIOnlineModel: React.FC<AIOnlineModelProps> = React.memo((props) => {
  const { title, subTitle, list, onEdit, onRemove, onSelect, modelType } = props

  return (
    <div className={styles['ai-online-model']}>
      {title && (
        <div className={styles['ai-online-model-header']}>
          <div className={styles['ai-online-model-header-title']}>{title}</div>
          <div className={styles['ai-online-model-header-subtitle']}>{subTitle}</div>
        </div>
      )}
      <div className={styles['ai-online-model-list']}>
        {list.map((item: AIModelConfig, index: number) => (
          <div
            key={index}
            className={classNames(styles['ai-online-model-list-row'])}
            onClick={() => onSelect(item, index)}
          >
            <AIOnlineModelListItem
              item={item}
              onEdit={() => onEdit(index)}
              onRemove={() => onRemove(index)}
              checked={index === 0}
              modelType={modelType}
            />
          </div>
        ))}
      </div>
    </div>
  )
})

const AIOnlineModelListItem: React.FC<AIOnlineModelListItemProps> = React.memo((props) => {
  const { item, checked, onEdit, onRemove, modelType } = props

  const [testLoading, setTestLoading] = useState<boolean>(false)

  const config: ThirdPartyApplicationConfig = useCreation(() => {
    return item.Provider
  }, [item.Provider])
  const onEditClick = useMemoizedFn((e) => {
    e.stopPropagation()
    onEdit(item)
  })
  const onRemoveClick = useMemoizedFn((e) => {
    e.stopPropagation()
    onRemove(item)
  })

  const onApplyRecommendConfig = useMemoizedFn((config: ThirdPartyApplicationConfig) => {
    const newItem: AIModelConfig = {
      ProviderId: item.ProviderId,
      Provider: config,
      ModelName: item.ModelName,
      ExtraParams: item.ExtraParams,
    }
    setAIModal({
      item: newItem,
      modelType: modelType as AIModelTypeEnum,
      onSuccess: () => {
        emiter.emit('onRefreshAIModelList')
      },
    })
  })

  const onCheckModel = useMemoizedFn((e) => {
    e.stopPropagation()
    setTestLoading(true)
    const value = {
      Type: item.Provider.Type,
      api_key: item.Provider.APIKey,
      domain: item.Provider.Domain,
      proxy: item.Provider.Proxy,
      no_https: item.Provider.NoHttps,
      api_type: item.Provider.APIType,
      base_url: item.Provider.BaseURL,
      endpoint: item.Provider.Endpoint,
      enable_endpoint: item.Provider.EnableEndpoint,
      Headers: item.Provider.Headers,
      model: item.ModelName,
      model_type: modelType,
    }
    const config = buildAIConfigHealthCheckConfig(value)
    grpcAIConfigHealthCheck({
      Config: config,
      Content: '测试成功',
    })
      .then((response) => {
        const aiModelType = (modelType || AIModelTypeEnum.TierIntelligent) as AIModelTypeEnum
        const m = showYakitModal({
          hiddenHeader: true,
          type: 'white',
          onOk: () => m.destroy(),
          content: (
            <AIModelCheckResult
              testResult={response}
              onClose={() => m.destroy()}
              onApplyRecommendConfig={(config) => {
                onApplyRecommendConfig(config)
                m.destroy()
              }}
              aiModelType={aiModelType}
              model={item?.ModelName}
            />
          ),
        })
      })
      .finally(() => {
        setTimeout(() => {
          setTestLoading(false)
        }, 200)
      })
  })
  return (
    <div className={styles['ai-online-model-list-item']}>
      <div className={styles['ai-online-model-list-item-header']}>
        {AIOnlineModelIconMap[config.Type]}
        <div className={styles['ai-online-model-list-item-type']}>{config.Type}</div>

        <div className={styles['ai-online-model-list-item-model']}>
          <OutlineAtomIcon className={styles['atom-icon']} />
          <span className={styles['ai-online-model-list-item-model-text']}>{item.ModelName}</span>
        </div>
      </div>
      <div className={styles['ai-online-model-list-item-extra']}>
        <div className={styles['ai-online-model-list-item-extra-edit']}>
          <YakitButton type="text2" icon={<OutlineEngineIcon />} onClick={onCheckModel} loading={testLoading} />
          <YakitButton type="text2" icon={<OutlinePencilaltIcon />} onClick={onEditClick} />
          <YakitPopconfirm
            title={`确定要删除厂商${config.Type},模型名称为${item.ModelName} 吗？`}
            onConfirm={onRemoveClick}
            onCancel={(e) => {
              e?.stopPropagation()
            }}
          >
            <YakitButton
              type="text2"
              icon={<OutlineTrashIcon />}
              className={styles['trash-icon']}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          </YakitPopconfirm>
        </div>
        {checked && <OutlineCheckIcon className={styles['check-icon']} />}
      </div>
    </div>
  )
})

export const OutlineAtomIconByStatus: React.FC<OutlineAtomIconByStatusProps> = React.memo((props) => {
  const { isReady, isRunning, iconClassName, size } = props
  return (
    <div
      className={classNames(
        styles['ai-local-model-icon'],
        {
          [styles['ai-local-model-icon-ready']]: isReady,
          [styles['ai-local-model-icon-running']]: isRunning,
          [styles['ai-local-model-icon-small']]: size === 'small',
        },
        iconClassName,
      )}
    >
      <OutlineAtomIcon />
    </div>
  )
})
