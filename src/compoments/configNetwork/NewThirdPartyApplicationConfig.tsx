import type { FormLayout } from 'antd/es/form/Form'
import type { ThirdPartyApplicationConfig } from './ConfigNetworkPage'
import { YakitSelect } from '../YakitUI/YakitSelect/YakitSelect'
import { Collapse, Form } from 'antd'
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import styles from './ConfigNetworkPage.module.scss'
import type { FormInstance } from 'antd/lib/form/Form'
import type { KVPair } from '@/pages/AIAgent/enums/external'
import type { SelectOptionsProps } from '@/pages/AIAgent/ai-agent/aiModelList/AIModelListType'
import { useGetSetState } from '@/hooks'
import {
  AI_API_TYPE_OPTIONS,
  DEFAULT_AI_API_TYPE,
  grpcGetAIThirdPartyAppConfigTemplate,
  normalizeAIAPIType,
} from '@/pages/AIAgent/ai-agent/aiModelList/utils'
import { cloneDeep } from 'lodash'
import { AIModelTypeEnum } from '@/pages/AIAgent/ai-agent/defaultConstant'
import { useCreation, useDebounceEffect, useDebounceFn, useMemoizedFn, useUpdateEffect } from 'ahooks'
import { OutlineInformationcircleIcon } from '@/assets/icon/outline'
import { YakitInput } from '../YakitUI/YakitInput/YakitInput'
import { YakitSwitch } from '../YakitUI/YakitSwitch/YakitSwitch'
import { YakitButton } from '../YakitUI/YakitButton/YakitButton'
import { YakitAutoComplete } from '../YakitUI/YakitAutoComplete/YakitAutoComplete'
import { YakitSpin } from '../YakitUI/YakitSpin/YakitSpin'
import { AIConfigAPIKeyFormItem } from '@/pages/AIAgent/ai-agent/aiModelList/aiModelForm/AIModelForm'
import type { YakitSelectProps } from '../YakitUI/YakitSelect/YakitSelectType'
import { postSettingAimodelsGet } from '@/apis/AiEventApi'
import { yakitNotify } from '@/utils/notification'
import YakitCollapse from '../YakitUI/YakitCollapse/YakitCollapse'
import { YakitTag } from '../YakitUI/YakitTag/YakitTag'
import classNames from 'classnames'
import { YakitModal } from '../YakitUI/YakitModal/YakitModal'

export interface ThirdPartyAppConfigItemTemplate {
  Required: boolean
  Name: string
  Verbose: string
  Type: string
  DefaultValue: string
  Desc: string
  Extra: string
  Placeholder?: string
}

export interface GetThirdPartyAppConfigTemplate {
  Name: string
  Verbose: string
  Type: string
  Items: ThirdPartyAppConfigItemTemplate[]
}

export interface GetThirdPartyAppConfigTemplateResponse {
  Templates: GetThirdPartyAppConfigTemplate[]
}

export interface ThirdPartyApplicationConfigProp {
  formValues?: ThirdPartyApplicationConfig
  // 禁止类型改变
  disabledType?: boolean
  // 是否可新增类型
  canAddType?: boolean
  // 类型下拉是否只展示ai类型的
  isOnlyShowAiType?: boolean
  onAdd: (i: ThirdPartyApplicationConfig) => void
  onCancel: () => void
  FormProps?: {
    layout: FormLayout
    labelCol: number
    wrapperCol: number
  }

  footer?: React.ReactNode
}

const defautFormValues = {
  Type: '',
  api_key: '',
  user_identifier: '',
  ExtraParams: [] as KVPair[],
}

const defaultFormItems: ThirdPartyAppConfigItemTemplate[] = [
  {
    DefaultValue: '',
    Desc: 'APIKey / Token',
    Extra: '',
    Name: 'api_key',
    Required: true,
    Type: 'string',
    Verbose: 'ApiKey',
  },
  {
    DefaultValue: '',
    Desc: 'email / username',
    Extra: '',
    Name: 'user_identifier',
    Required: false,
    Type: 'string',
    Verbose: '用户信息',
  },
]

const aiModelTypeOptions: SelectOptionsProps[] = [
  {
    label: '高质模型:执行复杂任务',
    value: AIModelTypeEnum.TierIntelligent,
  },
  {
    label: '轻量模型:用于执行简单任务和会话',
    value: AIModelTypeEnum.TierLightweight,
  },
  {
    label: '视觉模式:用于识别图片等,生成知识库和任务执行都会用到',
    value: AIModelTypeEnum.TierVision,
  },
]
const aiAPITypeOptions: SelectOptionsProps[] = AI_API_TYPE_OPTIONS.map((item) => ({ label: item, value: item }))
const aiModelTypeItem: ThirdPartyAppConfigItemTemplate = {
  Name: 'model_type',
  Required: true,
  Type: 'list',
  DefaultValue: AIModelTypeEnum.TierIntelligent,
  Desc: '',
  Extra: `${JSON.stringify({
    options: aiModelTypeOptions,
  })}`,
  Verbose: '模型类型',
}

interface NewThirdPartyApplicationConfigBaseProps
  extends Omit<ThirdPartyApplicationConfigProp, 'onAdd' | 'onCancel' | 'isOnlyShowAiType'> {
  ref?: React.ForwardedRef<{ form: FormInstance }>
}

export const NewThirdPartyApplicationConfigBase: React.FC<NewThirdPartyApplicationConfigBaseProps> = React.memo(
  forwardRef((props, ref) => {
    const { formValues = defautFormValues, disabledType = false, canAddType = true, FormProps, footer } = props
    const [form] = Form.useForm()
    const typeVal = Form.useWatch('Type', form)
    const typeValRef = useRef<string>(typeVal)
    const [options, setOptions] = useState<SelectOptionsProps[]>([])
    const [templates, setTemplates, getTemplates] = useGetSetState<GetThirdPartyAppConfigTemplate[]>([])
    const [modelOptionLoading, setModelOptionLoading] = useState<boolean>(false)
    const [modelNameAllOptions, setModelNameAllOptions] = useState<SelectOptionsProps[]>([])
    const apiKeyWatch = Form.useWatch('api_key', form)
    const execModelNameOption = useRef<boolean>(false)

    useImperativeHandle(
      ref,
      () => ({
        form,
      }),
      [form],
    )

    // 获取类型
    useEffect(() => {
      grpcGetAIThirdPartyAppConfigTemplate().then((res: GetThirdPartyAppConfigTemplateResponse) => {
        const templates = res.Templates
        let newOptions: SelectOptionsProps[] = []
        setTemplates(templates)
        // eslint-disable-next-line max-nested-callbacks
        newOptions = templates.map((item) => ({
          label: item.Verbose,
          value: item.Name,
        }))
        setOptions(newOptions)
      })
    }, [])

    useUpdateEffect(() => {
      const templatesobj = getTemplates().find((item) => item.Name === typeValRef.current)
      const modelType = templatesobj?.Type
      if (apiKeyWatch && modelType === 'ai') {
        execModelNameOption.current = true
        getModelNameOption()
      } else {
        handleDefaultModalNameOption()
      }
    }, [apiKeyWatch])

    const { run: getModelNameOption, cancel: cancelModelNameOption } = useDebounceFn(
      useMemoizedFn(() => {
        if (!execModelNameOption.current) return
        setModelOptionLoading(true)

        const v = form.getFieldsValue()
        postSettingAimodelsGet({
          Config: JSON.stringify(v),
        })
          .then((res) => {
            if (!execModelNameOption.current) return
            const modalNamelist: SelectOptionsProps[] =
              // eslint-disable-next-line max-nested-callbacks
              res.ModelName.map((modelName: string) => ({
                label: modelName,
                value: modelName,
              }))
            const name = getModelNameDefaultName()
            // 确保默认值在选项里
            const hasDefault = modalNamelist.some(
              // eslint-disable-next-line max-nested-callbacks
              (item) => item.value === name,
            )
            const newOptions = hasDefault
              ? modalNamelist
              : name
                ? [{ label: name, value: name }, ...modalNamelist]
                : modalNamelist
            setModelNameAllOptions(newOptions)
            yakitNotify('success', '获取成功')
          })
          .catch((error) => {
            if (!execModelNameOption.current) return
            yakitNotify('error', error)
            handleDefaultModalNameOption()
          })
          .finally(() => {
            setModelOptionLoading(false)
          })
      }),
      { wait: 500 },
    )
    const getModelNameDefaultName = () => {
      const templatesobj = templates.find((item) => item.Name === typeVal)
      const formItems = templatesobj?.Items || []
      const modelType = templatesobj?.Type
      const obj = formItems.find((item) => modelType === 'ai' && item.Type === 'list' && item.Name === 'model')
      return obj?.DefaultValue
    }
    const handleDefaultModalNameOption = () => {
      const name = getModelNameDefaultName()
      if (name) {
        setModelNameAllOptions([{ label: name, value: name }])
      } else {
        setModelNameAllOptions([])
      }
    }
    useDebounceEffect(
      () => {
        handleDefaultModalNameOption()
      },
      [typeVal],
      { wait: 300 },
    )
    useEffect(() => {
      execModelNameOption.current = false
      cancelModelNameOption()
      typeValRef.current = typeVal
    }, [typeVal])

    // 切换类型，渲染不同表单项（目前只有输入框、开关、下拉）
    const renderAllFormItems = useMemoizedFn(() => {
      const templatesobj = templates.find((item) => item.Name === typeVal)
      const formItems = templatesobj?.Items || []
      const modelType = templatesobj?.Type
      return formItems.map((item, index) => (
        <React.Fragment key={index}>{renderSingleFormItem(item, modelType)}</React.Fragment>
      ))
    })
    const renderSingleFormItem = (item: ThirdPartyAppConfigItemTemplate, modelType?: string) => {
      const formProps = {
        rules: [
          {
            required: item.Required,
            message: `请填写${item.Verbose}`,
          },
        ],
        label: item.Verbose,
        name: item.Name,
        tooltip: item.Desc
          ? {
              icon: <OutlineInformationcircleIcon />,
              title: item.Desc,
            }
          : null,
      }
      switch (item.Type) {
        case 'string':
          return (
            <Form.Item {...formProps}>
              <YakitInput />
            </Form.Item>
          )
        case 'bool':
          return (
            <Form.Item {...formProps} valuePropName="checked">
              <YakitSwitch />
            </Form.Item>
          )
        case 'list':
          if (modelType === 'ai' && item.Name === 'model') {
            // 模型名称
            return (
              <Form.Item
                {...formProps}
                help={
                  <div style={{ height: 30 }}>
                    如无法自动获取，请
                    <YakitButton
                      type="text"
                      onClick={() => {
                        execModelNameOption.current = true
                        getModelNameOption()
                      }}
                      style={{
                        padding: 0,
                        fontSize: 14,
                      }}
                    >
                      点击刷新
                    </YakitButton>
                    重新获取
                  </div>
                }
              >
                <YakitAutoComplete
                  options={modelNameAllOptions}
                  onFocus={() => {
                    execModelNameOption.current = true
                    getModelNameOption()
                  }}
                  // eslint-disable-next-line react/no-unstable-nested-components
                  dropdownRender={(menu) => {
                    return (
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                      <>
                        <YakitSpin spinning={modelOptionLoading}>{menu}</YakitSpin>
                      </>
                    )
                  }}
                  filterOption={(inputValue, option) => {
                    if (option?.value && typeof option?.value === 'string') {
                      return option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                    return false
                  }}
                />
              </Form.Item>
            )
          }

          // eslint-disable-next-line no-case-declarations
          let selectProps: YakitSelectProps = {}
          try {
            selectProps.options = item.Extra ? JSON.parse(item.Extra)?.options : []
          } catch (error) {}
          return (
            <Form.Item {...formProps}>
              <YakitSelect {...selectProps} />
            </Form.Item>
          )

        default:
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <></>
      }
    }
    // 判断当前类型值是否在options存在
    const isInOptions = useMemo(() => {
      return options.findIndex((item) => item.value === typeVal) !== -1
    }, [options, typeVal])

    const initialValues = useMemo(() => {
      const copyFormValues: any = { ...formValues }
      Object.keys(copyFormValues).forEach((key) => {
        if (copyFormValues[key] === 'true') {
          copyFormValues[key] = true
        } else if (copyFormValues[key] === 'false') {
          copyFormValues[key] = false
        }
      })
      return copyFormValues
    }, [formValues])

    const defaultFormList = useCreation(() => {
      // eslint-disable-next-line no-extra-boolean-cast
      return [...defaultFormItems]
    }, [])
    return (
      <div className={styles['config-form-wrapper']}>
        <Form
          form={form}
          layout={FormProps?.layout ?? 'horizontal'}
          labelCol={{ span: FormProps?.labelCol ?? 5 }}
          wrapperCol={{ span: FormProps?.wrapperCol ?? 18 }}
          initialValues={initialValues}
          onValuesChange={(changedValues) => {
            // 当类型改变时，表单项的值采用默认值
            if (changedValues.Type !== undefined) {
              const templatesobj = templates.find((item) => item.Name === changedValues.Type)
              const formItems = templatesobj?.Items || []
              formItems.forEach((item) => {
                form.setFieldsValue({
                  [item.Name]: ['string', 'list'].includes(item.Type)
                    ? item.DefaultValue
                    : item.DefaultValue === 'true',
                })
              })
            }
          }}
          onSubmitCapture={(e) => {
            e.preventDefault()
          }}
          className={styles['config-form']}
        >
          <Form.Item
            label="厂商"
            rules={[
              {
                required: true,
                message: `请${canAddType ? '填写' : '选择'}类型`,
              },
            ]}
            name="Type"
          >
            {canAddType ? (
              <YakitAutoComplete
                options={options}
                disabled={disabledType}
                filterOption={(inputValue, option) => {
                  if (option?.label && typeof option?.label === 'string') {
                    return option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  return false
                }}
              />
            ) : (
              <YakitSelect
                disabled={disabledType}
                options={options}
                filterOption={(inputValue, option) => {
                  if (option?.label && typeof option?.label === 'string') {
                    return option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  return false
                }}
              />
            )}
          </Form.Item>
          {isInOptions ? (
            <>{renderAllFormItems()}</>
          ) : (
            <>
              {defaultFormList.map((item: any, index: number) => (
                <React.Fragment key={index}>{renderSingleFormItem(item)}</React.Fragment>
              ))}
            </>
          )}
        </Form>
        <div className={styles['config-footer']}>{footer}</div>
      </div>
    )
  }),
)

const defaultAIFormItemsOfAI: ThirdPartyAppConfigItemTemplate[] = [
  cloneDeep(aiModelTypeItem),
  {
    Name: 'api_type',
    Required: true,
    Type: 'list',
    DefaultValue: DEFAULT_AI_API_TYPE,
    Desc: '可选值: chat_completions / responses',
    Extra: `${JSON.stringify({
      options: aiAPITypeOptions,
    })}`,
    Verbose: 'API类型',
  },
  {
    DefaultValue: 'memfit-light-free',
    Desc: '',
    Extra: '',
    Name: 'model',
    Required: true,
    Type: 'list',
    Verbose: '模型名称',
  },
]

const isShowRequiredApiKey = (typeVal: string) => {
  let Required = !['aibalance', 'comate'].includes(typeVal)
  return {
    isRequired: Required,
    data: {
      DefaultValue: 'free-user',
      Desc: 'APIKey / Token',
      Extra: '',
      Name: 'api_key',
      Required,
      Type: 'list',
      Verbose: 'ApiKey',
    },
  }
}

const optionalAIFormItemsOfAI: ThirdPartyAppConfigItemTemplate[] = [
  {
    DefaultValue: '',
    Desc: '对于非标准openai风格的第三方api，可以自定义endpoint',
    Extra: '',
    Name: 'enable_endpoint',
    Required: false,
    Type: 'bool',
    Verbose: '启用Endpoint',
  },
  {
    DefaultValue: '',
    Desc: '可填写域名和URL，例如api.openai.com、https://api.openai.com/、https://api.openai.com/v1、https://api.openai.com//v1/chat/completions',
    Extra: '',
    Name: 'base_url',
    Required: false,
    Type: 'string',
    Verbose: 'BaseURL',
    Placeholder: '例如 api.openai.com、https://api.openai.com/',
  },
  {
    DefaultValue: '',
    Desc: 'Endpoint',
    Extra: '',
    Name: 'endpoint',
    Required: false,
    Type: 'string',
    Verbose: 'Endpoint',
    Placeholder: '例如 https://api.openai.com/v1/chat/completions',
  },
  {
    DefaultValue: '',
    Desc: '代理地址',
    Extra: '',
    Name: 'proxy',
    Required: false,
    Type: 'string',
    Verbose: '代理地址',
  },
]

export interface HTTPHeader {
  Header: string
  Value: string
}

export const NewAIThirdPartyApplicationConfigBase: React.FC<NewThirdPartyApplicationConfigBaseProps> = React.memo(
  forwardRef((props, ref) => {
    const { formValues = defautFormValues, disabledType = false, canAddType = true, FormProps, footer } = props
    const [form] = Form.useForm()
    const typeVal = Form.useWatch('Type', form)
    const [options, setOptions] = useState<SelectOptionsProps[]>([])
    const [modelOptionLoading, setModelOptionLoading] = useState<boolean>(false)
    const [modelNameAllOptions, setModelNameAllOptions] = useState<SelectOptionsProps[]>([])
    const apiKeyWatch = Form.useWatch('api_key', form)
    const execModelNameOption = useRef<boolean>(false)
    const enableEndpointWatch = Form.useWatch('enable_endpoint', form)
    const headers = Form.useWatch('Headers', form) || []
    const [visibleHTTPHeader, setVisibleHTTPHeader] = useState<boolean>(false)
    const headerItemRef = useRef<HTTPHeader>()
    const headerItemIndexRef = useRef<number>()
    const [activeKey, setActiveKey] = useState<string | string[]>()
    const onChangeCollapse = (key: string | string[]) => {
      setActiveKey(key)
    }
    useImperativeHandle(
      ref,
      () => ({
        form,
      }),
      [form],
    )

    // 获取类型
    useEffect(() => {
      grpcGetAIThirdPartyAppConfigTemplate().then((res: GetThirdPartyAppConfigTemplateResponse) => {
        const templates = res.Templates
        let newOptions: SelectOptionsProps[] = []
        newOptions = templates.map((item) => ({ label: item.Verbose, value: item.Name }))
        setOptions(newOptions)
      })
    }, [])

    useUpdateEffect(() => {
      if (apiKeyWatch) {
        execModelNameOption.current = true
        getModelNameOption()
      } else {
        handleDefaultModalNameOption()
      }
    }, [apiKeyWatch])

    const { run: getModelNameOption, cancel: cancelModelNameOption } = useDebounceFn(
      useMemoizedFn(() => {
        if (!execModelNameOption.current) return
        setModelOptionLoading(true)
        const v = form.getFieldsValue()
        postSettingAimodelsGet({
          Config: JSON.stringify(v),
        })
          .then((res) => {
            if (!execModelNameOption.current) return
            const modalNamelist: SelectOptionsProps[] = res.ModelName.map((modelName: string) => ({
              label: modelName,
              value: modelName,
            }))
            const name = getModelNameDefaultName()
            // 确保默认值在选项里
            const hasDefault = modalNamelist.some((item) => item.value === name)
            const newOptions = hasDefault
              ? modalNamelist
              : name
                ? [{ label: name, value: name }, ...modalNamelist]
                : modalNamelist
            setModelNameAllOptions(newOptions)
            yakitNotify('success', '获取成功')
          })
          .catch((error: any) => {
            if (!execModelNameOption.current) return
            yakitNotify('error', String(error))
            handleDefaultModalNameOption()
          })
          .finally(() => {
            setModelOptionLoading(false)
          })
      }),
      { wait: 500 },
    )

    const newDefaultAIFormItemsOfAI = useCreation(() => {
      let newAIFormItemsOfAI = cloneDeep(defaultAIFormItemsOfAI)
      const { isRequired, data } = isShowRequiredApiKey(typeVal)
      if (isRequired) {
        newAIFormItemsOfAI.push(data)
      }
      return newAIFormItemsOfAI
    }, [typeVal])

    const newOptionalAIFormItemsOfAI = useCreation(() => {
      let newData = cloneDeep(optionalAIFormItemsOfAI)
      const { isRequired, data } = isShowRequiredApiKey(typeVal)
      if (!isRequired) {
        newData.unshift(data)
      }
      if (enableEndpointWatch) {
        return newData.filter((item) => item.Name !== 'base_url')
      }
      return newData.filter((item) => item.Name !== 'endpoint')
    }, [enableEndpointWatch, typeVal])

    const allAIFormItemsOfAI = useCreation(() => {
      return [...newDefaultAIFormItemsOfAI, ...newOptionalAIFormItemsOfAI]
    }, [newDefaultAIFormItemsOfAI, newOptionalAIFormItemsOfAI])

    const getModelNameDefaultName = () => {
      const obj = allAIFormItemsOfAI.find((item) => item.Type === 'list' && item.Name === 'model')
      return obj?.DefaultValue
    }
    const handleDefaultModalNameOption = () => {
      const name = getModelNameDefaultName()
      if (name) {
        setModelNameAllOptions([{ label: name, value: name }])
      } else {
        setModelNameAllOptions([])
      }
    }
    useDebounceEffect(
      () => {
        handleDefaultModalNameOption()
      },
      [typeVal],
      { wait: 300 },
    )
    useEffect(() => {
      execModelNameOption.current = false
      cancelModelNameOption()
      if (typeVal === 'custom') {
        setActiveKey('1')
      } else {
        setActiveKey(undefined)
      }
    }, [typeVal])

    // 切换类型，渲染不同表单项（目前只有输入框、开关、下拉）
    const renderAllFormItems = useMemoizedFn(() => {
      return newDefaultAIFormItemsOfAI.map((item, index) => (
        <React.Fragment key={index}>{renderSingleFormItem(item)}</React.Fragment>
      ))
    })
    const renderOptionalFormItems = useMemoizedFn(() => {
      return newOptionalAIFormItemsOfAI.map((item, index) => (
        <React.Fragment key={index}>{renderSingleFormItem(item)}</React.Fragment>
      ))
    })

    const dropdownRender = useMemoizedFn((menu: React.ReactNode) => {
      return <YakitSpin spinning={modelOptionLoading}>{menu}</YakitSpin>
    })

    const renderSingleFormItem = (item: ThirdPartyAppConfigItemTemplate) => {
      const formProps = {
        rules: [{ required: item.Required, message: `请填写${item.Verbose}` }],
        label: item.Verbose,
        name: item.Name,
        tooltip: item.Desc
          ? {
              icon: <OutlineInformationcircleIcon />,
              title: item.Desc,
            }
          : null,
      }
      switch (item.Type) {
        case 'string':
          return (
            <Form.Item {...formProps}>
              <YakitInput placeholder={item.Placeholder} />
            </Form.Item>
          )
        case 'bool':
          return (
            <Form.Item {...formProps} valuePropName="checked">
              <YakitSwitch size="large" />
            </Form.Item>
          )
        case 'list':
          if (item.Name === 'model') {
            // 模型名称
            return (
              <Form.Item
                {...formProps}
                help={
                  <div style={{ height: 30 }}>
                    如无法自动获取，请
                    <YakitButton
                      type="text"
                      onClick={() => {
                        execModelNameOption.current = true
                        getModelNameOption()
                      }}
                      style={{ padding: 0, fontSize: 14 }}
                    >
                      点击刷新
                    </YakitButton>
                    重新获取
                  </div>
                }
              >
                <YakitAutoComplete
                  options={modelNameAllOptions}
                  onFocus={() => {
                    execModelNameOption.current = true
                    getModelNameOption()
                  }}
                  dropdownRender={dropdownRender}
                  filterOption={(inputValue: any, option: any) => {
                    if (option?.value && typeof option?.value === 'string') {
                      return option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                    return false
                  }}
                />
              </Form.Item>
            )
          }
          if (item.Name === 'api_key') {
            return <AIConfigAPIKeyFormItem aiType={typeVal} formProps={formProps} />
          } else {
            let selectProps: YakitSelectProps = {}
            try {
              selectProps.options = item.Extra ? JSON.parse(item.Extra)?.options : []
            } catch (error) {}
            return (
              <Form.Item {...formProps}>
                <YakitSelect {...selectProps} />
              </Form.Item>
            )
          }
        default:
          return null
      }
    }

    const initialValues = useMemo(() => {
      const copyFormValues: any = { ...formValues }
      const aiFormValues = copyFormValues as typeof copyFormValues & { api_type?: string }
      aiFormValues.api_type = normalizeAIAPIType(aiFormValues.api_type)

      Object.keys(copyFormValues).forEach((key) => {
        if (copyFormValues[key] === 'true') {
          copyFormValues[key] = true
        } else if (copyFormValues[key] === 'false') {
          copyFormValues[key] = false
        }
      })
      return copyFormValues
    }, [formValues])

    const onSaveHeaders = useMemoizedFn((val, updateIndex) => {
      const obj = {
        Key: val.Header,
        Value: val.Value,
      }
      let headersList: KVPair[] = []
      if (updateIndex === undefined) {
        headersList = [...headers, obj]
      } else {
        headers[updateIndex] = obj
        headersList = [...headers]
      }
      form.setFieldsValue({
        Headers: headersList,
      })
    })

    const onRemoveHeaders = useMemoizedFn((index: number) => {
      form.setFieldsValue({
        Headers: headers.filter((_: any, i: number) => i !== index),
      })
    })
    return (
      <div className={styles['config-form-wrapper']}>
        <Form
          form={form}
          layout={FormProps?.layout ?? 'horizontal'}
          labelCol={{ span: FormProps?.labelCol ?? 5 }}
          wrapperCol={{ span: FormProps?.wrapperCol ?? 18 }}
          initialValues={initialValues}
          onValuesChange={(changedValues) => {
            // 当类型改变时，表单项的值采用默认值
            if (changedValues.Type !== undefined) {
              allAIFormItemsOfAI.forEach((item) => {
                form.setFieldsValue({
                  [item.Name]: ['string', 'list'].includes(item.Type)
                    ? item.DefaultValue
                    : item.DefaultValue === 'true',
                })
              })
            }
          }}
          onSubmitCapture={(e) => {
            e.preventDefault()
          }}
          className={classNames(styles['config-form'], styles['config-form-ai'])}
        >
          <Form.Item
            label="厂商"
            rules={[{ required: true, message: `请${canAddType ? '填写' : '选择'}类型` }]}
            name="Type"
          >
            {canAddType ? (
              <YakitAutoComplete
                options={options}
                disabled={disabledType}
                filterOption={(inputValue, option) => {
                  if (option?.label && typeof option?.label === 'string') {
                    return option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  return false
                }}
              />
            ) : (
              <YakitSelect
                disabled={disabledType}
                options={options}
                filterOption={(inputValue, option) => {
                  if (option?.label && typeof option?.label === 'string') {
                    return option?.label?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  return false
                }}
              />
            )}
          </Form.Item>
          {renderAllFormItems()}
          <YakitCollapse
            activeKey={activeKey}
            onChange={onChangeCollapse}
            bordered={false}
            className={styles['ai-third-party-application-config-collapse']}
          >
            <Collapse.Panel header="高级配置" key="1">
              {/* 可选的表单项 */}
              {renderOptionalFormItems()}
              <Form.Item label="Header" name="Headers">
                {(headers || []).map((i: any, index: number) => {
                  return (
                    <YakitTag
                      key={index}
                      onClick={() => {
                        headerItemRef.current = {
                          Header: i.Key,
                          Value: i.Value,
                        }
                        headerItemIndexRef.current = index
                        setVisibleHTTPHeader(true)
                      }}
                      closable
                      onClose={() => {
                        onRemoveHeaders(index)
                      }}
                    >
                      {i.Key}
                    </YakitTag>
                  )
                })}
                <YakitButton
                  type="outline1"
                  onClick={() => {
                    headerItemRef.current = undefined
                    headerItemIndexRef.current = undefined
                    setVisibleHTTPHeader(true)
                  }}
                >
                  添加
                </YakitButton>
              </Form.Item>
            </Collapse.Panel>
          </YakitCollapse>
        </Form>
        <div className={styles['config-footer']}>{footer}</div>
        <InputHTTPHeaderForm
          initFormVal={headerItemRef.current}
          updateIndex={headerItemIndexRef.current}
          visible={visibleHTTPHeader}
          setVisible={setVisibleHTTPHeader}
          onSave={onSaveHeaders}
        />
      </div>
    )
  }),
)

const NewThirdPartyApplicationConfig: React.FC<ThirdPartyApplicationConfigProp> = React.memo((props) => {
  const { onCancel, onAdd, ...rest } = props

  const formRef = useRef<{ form: FormInstance }>(null)
  return (
    <NewThirdPartyApplicationConfigBase
      ref={formRef}
      {...rest}
      footer={
        <>
          <YakitButton size="large" type="outline2" onClick={onCancel}>
            取消
          </YakitButton>
          <YakitButton
            size="large"
            type="primary"
            onClick={() => {
              formRef.current?.form?.validateFields().then((res) => {
                const ExtraParams = Object.keys(res)
                  .filter((key) => key !== 'Type')
                  .map((key) => ({ Key: key, Value: res[key] }))
                onAdd({
                  Type: res.Type,
                  ExtraParams,
                })
              })
            }}
          >
            确定添加
          </YakitButton>
        </>
      }
    />
  )
})

export interface InputHTTPHeaderFormProps {
  visible: boolean
  setVisible: (b: boolean) => void
  onSave: (h: HTTPHeader, updateIndex?: number) => any
  updateIndex?: number
  initFormVal?: HTTPHeader
}

export const InputHTTPHeaderForm: React.FC<InputHTTPHeaderFormProps> = React.memo((props) => {
  const { visible, setVisible, onSave, initFormVal, updateIndex } = props
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (initFormVal !== undefined) {
        form.setFieldsValue(initFormVal)
      } else {
        form.resetFields()
      }
    }
  }, [visible])
  return (
    <YakitModal
      title="输入新的 HTTP Header"
      visible={visible}
      onCancel={() => setVisible(false)}
      zIndex={1002}
      footer={null}
      closable={true}
      bodyStyle={{ padding: '16px 16px 0px' }}
      destroyOnClose={true}
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 14 }}
        onFinish={(val: HTTPHeader) => {
          onSave(val, updateIndex)
          setVisible(false)
          form.resetFields()
        }}
        form={form}
        className={styles['http-heard-form']}
      >
        <Form.Item label="HTTP Header" name="Header" rules={[{ required: true, message: '该项为必填项' }]}>
          <YakitAutoComplete
            options={[
              'Authorization',
              'Accept',
              'Accept-Charset',
              'Accept-Encoding',
              'Accept-Language',
              'Accept-Ranges',
              'Cache-Control',
              'Cc',
              'Connection',
              'Content-Id',
              'Content-Language',
              'Content-Length',
              'Content-Transfer-Encoding',
              'Content-Type',
              'Cookie',
              'Date',
              'Dkim-Signature',
              'Etag',
              'Expires',
              'From',
              'Host',
              'If-Modified-Since',
              'If-None-Match',
              'In-Reply-To',
              'Last-Modified',
              'Location',
              'Message-Id',
              'Mime-Version',
              'Pragma',
              'Received',
              'Return-Path',
              'Server',
              'Set-Cookie',
              'Subject',
              'To',
              'User-Agent',
              'X-Forwarded-For',
              'Via',
              'X-Imforwards',
              'X-Powered-By',
              'X-Requested-With',
            ].map((ele) => ({ value: ele, label: ele }))}
            filterOption={(inputValue, option) => {
              if (option?.value && typeof option?.value === 'string') {
                return option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              return false
            }}
            size="middle"
          />
        </Form.Item>

        <Form.Item label="HTTP Value" name="Value">
          <YakitInput />
        </Form.Item>
        <Form.Item colon={false} label={' '}>
          <YakitButton type="primary" htmlType="submit">
            设置该 Header
          </YakitButton>
        </Form.Item>
      </Form>
    </YakitModal>
  )
})
export default NewThirdPartyApplicationConfig
