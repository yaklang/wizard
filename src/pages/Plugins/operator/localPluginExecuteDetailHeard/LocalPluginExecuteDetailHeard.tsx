import React, { useState } from 'react'
import type {
  ExecuteEnterNodeByPluginParamsProps,
  FormContentItemByTypeProps,
  FormExtraSettingProps,
  OutputFormComponentsByTypeProps,
} from './LocalPluginExecuteDetailHeardType'
import { failed } from '@/utils/notification'
import { YakitFormDragger, YakitFormDraggerContent } from '@/compoments/YakitUI/YakitForm/YakitForm'
import styles from './LocalPluginExecuteDetailHeard.module.scss'
import { JsonFormWrapper } from '@/compoments/JsonFormWrapper/JsonFormWrapper'
import { YakitEditor } from '@/compoments/YakitUI/YakitEditor/YakitEditor'
import classNames from 'classnames'
import { OutlineInformationcircleIcon } from '@/assets/icon/outline'
import { useDebounceFn } from 'ahooks'
import { Form } from 'antd'
import { YakitAutoComplete } from '@/compoments/YakitUI/YakitAutoComplete/YakitAutoComplete'
import { YakitInput } from '@/compoments/YakitUI/YakitInput/YakitInput'
import { YakitInputNumber } from '@/compoments/YakitUI/YakitInputNumber/YakitInputNumber'
import { YakitSwitch } from '@/compoments/YakitUI/YakitSwitch/YakitSwitch'
import type { YakitSelectProps } from '@/compoments/YakitUI/YakitSelect/YakitSelectType'
import { YakitSelect } from '@/compoments/YakitUI/YakitSelect/YakitSelect'
import type { PluginParamDataEditorProps } from '@/pages/AIAgent/plugins/pluginsType'
import { GetPluginLanguage } from '@/compoments/YakitUI/YakitEditor/type'

/** 执行表单单个项 */
export const OutputFormComponentsByType: React.FC<OutputFormComponentsByTypeProps> = (props) => {
  const { item, extraSetting, codeType, disabled, pluginType, jsonSchemaListRef, jsonSchemaInitial } = props
  const [validateStatus, setValidateStatus] = useState<'success' | 'error'>('success')

  const formProps = {
    rules: [{ required: item.Required }],
    label: item.FieldVerbose || item.Field,
    name: item.Field,
    className: styles['plugin-execute-form-item'],
    tooltip: item.Help
      ? {
          icon: <OutlineInformationcircleIcon />,
          title: item.Help,
        }
      : null,
  }
  const onValidateStatus = useDebounceFn(
    (value: 'success' | 'error') => {
      setValidateStatus(value)
    },
    { wait: 200, leading: true },
  ).run

  //   const [additionalConfig, setAdditionalConfig] = useState<{ inputOption: { label: string; value: any }[] }>()
  //   useEffect(() => {
  //     const { TypeVerbose, SuggestionDataExpression } = item
  //     setAdditionalConfig(undefined)
  //     if (TypeVerbose === 'string') {
  //       if (SuggestionDataExpression) {
  //         // 输入框提供可选择选项
  //         grpcFetchExpressionToResult({
  //           Expression: item.SuggestionDataExpression || '',
  //           ImportYaklangLibs: true,
  //         })
  //           .then((res: any) => {
  //             const { BoolResult, Result } = res
  //             if (BoolResult && Result) {
  //               try {
  //                 let arr: string[] = JSON.parse(Result)
  //                 !Array.isArray(arr) && (arr = [])
  //                 setAdditionalConfig({
  //                   inputOption: arr.map((item) => ({
  //                     label: item,
  //                     value: item,
  //                   })),
  //                 })
  //               } catch (error) {}
  //             }
  //           })
  //           .catch(() => {})
  //       }
  //     }
  //   }, [item])

  switch (item.TypeVerbose) {
    case 'string':
      return (
        <Form.Item {...formProps}>
          <YakitAutoComplete disabled={disabled}>
            <YakitInput placeholder="请输入" />
          </YakitAutoComplete>
        </Form.Item>
      )
    case 'text':
      return (
        <Form.Item {...formProps}>
          <YakitInput.TextArea placeholder="请输入" disabled={disabled} />
        </Form.Item>
      )
    case 'uint':
      return (
        <Form.Item
          {...formProps}
          normalize={(value) => {
            return String(value).replace(/\D/g, '')
          }}
        >
          <YakitInputNumber precision={0} min={0} disabled={disabled} />
        </Form.Item>
      )
    case 'float':
      return (
        <Form.Item {...formProps}>
          <YakitInputNumber step={0.1} disabled={disabled} min={0} />
        </Form.Item>
      )
    case 'boolean':
      return (
        <Form.Item {...formProps} valuePropName="checked">
          <YakitSwitch size="large" disabled={disabled} />
        </Form.Item>
      )
    case 'select':
      // eslint-disable-next-line no-case-declarations
      let selectProps: YakitSelectProps = {
        options: extraSetting?.data || [],
      }
      if (extraSetting?.double) {
        selectProps = {
          ...selectProps,
          mode: 'tags',
        }
      }
      return (
        <Form.Item {...formProps}>
          <YakitSelect {...selectProps} disabled={disabled} />
        </Form.Item>
      )
    case 'http-packet':
      // eslint-disable-next-line no-case-declarations
      const defaultValue = item.DefaultValue || ''
      return (
        <Form.Item
          {...formProps}
          rules={[
            { required: item.Required },
            {
              validator: async (rule, value) => {
                if (item.Required && value.length === 0) {
                  onValidateStatus('error')
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject()
                }
                if (validateStatus === 'error') onValidateStatus('success')
                return Promise.resolve()
              },
            },
          ]}
          className={classNames(formProps.className, styles['code-wrapper'], {
            [styles['code-error-wrapper']]: validateStatus === 'error',
          })}
          initialValue={defaultValue}
          trigger="setValue"
          validateTrigger="setValue"
          validateStatus={validateStatus}
          help={validateStatus === 'error' ? '{label} 是必填字段' : ''}
        >
          <YakitEditor type="http" value={defaultValue} readOnly={disabled} noLineNumber={true} noMiniMap={true} />
        </Form.Item>
      )
    case 'yak':
      // eslint-disable-next-line no-case-declarations
      let language: string = pluginType || ''
      try {
        const info = JSON.parse(item.ExtraSetting || '') as PluginParamDataEditorProps
        language = info?.language || pluginType || ''
      } catch (error) {}
      language = GetPluginLanguage(language || codeType || 'yak')

      return (
        <Form.Item
          {...formProps}
          rules={[
            { required: item.Required },
            {
              validator: async (rule, value) => {
                if (item.Required && value.length === 0) {
                  onValidateStatus('error')
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject()
                }
                if (validateStatus === 'error') onValidateStatus('success')
                return Promise.resolve()
              },
            },
          ]}
          className={classNames(formProps.className, styles['code-wrapper'], {
            [styles['code-error-wrapper']]: validateStatus === 'error',
          })}
          initialValue={item.DefaultValue || ''}
          trigger="setValue"
          validateTrigger="setValue"
          validateStatus={validateStatus}
          help={validateStatus === 'error' ? '{label} 是必填字段' : ''}
        >
          <YakitEditor type={language} readOnly={disabled} noLineNumber={true} noMiniMap={true} />
        </Form.Item>
      )
    case 'json':
      if (typeof jsonSchemaListRef?.current !== 'object') return null
      // eslint-disable-next-line no-case-declarations
      let schema: any = {}
      // eslint-disable-next-line no-case-declarations
      let uiSchema: any = {}
      // eslint-disable-next-line no-case-declarations, no-undef-init
      let value: any = undefined
      try {
        schema = JSON.parse(item?.JsonSchema || '{}')
        uiSchema = JSON.parse(item?.UISchema || '{}')
        if (jsonSchemaInitial && jsonSchemaInitial[item.Field]) {
          value = JSON.parse(jsonSchemaInitial[item.Field])
        }
      } catch (error) {
        console.error('Parse JsonSchema failed:', error)
      }
      return (
        <JsonFormWrapper
          field={item.Field}
          schema={schema}
          uiSchema={uiSchema}
          jsonSchemaListRef={jsonSchemaListRef}
          disabled={disabled}
          value={value}
        />
      )
    default:
      return null
  }
}

/** 插件执行输入》输出form表单的组件item */
export const FormContentItemByType: React.FC<FormContentItemByTypeProps> = React.memo((props) => {
  const { item, disabled, pluginType, jsonSchemaListRef, jsonSchemaInitial } = props
  // eslint-disable-next-line no-undef-init
  let extraSetting: FormExtraSettingProps | undefined = undefined
  try {
    extraSetting = JSON.parse(item.ExtraSetting || '{}') || {
      double: false,
      data: [],
    }
    if (extraSetting && extraSetting.data) {
      extraSetting.data = extraSetting.data.map((item) => {
        return {
          key: item?.key,
          label: item?.label || item?.key || item?.value,
          value: item?.value,
        }
      })
    }
  } catch (error) {
    failed('获取参数配置数据错误，请重新打开该页面')
  }
  switch (item.TypeVerbose) {
    // 单选并获取文件内容
    case 'upload-file-content':
      return (
        <YakitFormDraggerContent
          className={styles['plugin-execute-form-item']}
          formItemProps={{
            name: item.Field,
            label: item.FieldVerbose || item.Field,
            rules: [{ required: item.Required }],
          }}
          accept=".txt,.xlsx,.xls,.csv"
          textareaProps={{
            placeholder: '请输入内容，多条内容用“英文逗号”分隔',
            rows: 3,
          }}
          help="可将TXT、Excel文件拖入框内或"
          disabled={disabled}
        />
      )
    // 单选文件-路径
    case 'upload-path':
      return (
        <YakitFormDragger
          className={styles['plugin-execute-form-item']}
          formItemProps={{
            name: item.Field,
            label: item.FieldVerbose || item.Field,
            rules: [{ required: item.Required }],
          }}
          isShowPathNumber={false}
          selectType="file"
          multiple={false}
          disabled={disabled}
        />
      )
    // 批量文件-路径
    case 'multiple-file-path':
      return (
        <YakitFormDragger
          className={styles['plugin-execute-form-item']}
          formItemProps={{
            name: item.Field,
            label: item.FieldVerbose || item.Field,
            rules: [{ required: item.Required }],
          }}
          renderType="textarea"
          selectType="file"
          disabled={disabled}
        />
      )
    // 单选文件夹-路径
    case 'upload-folder-path':
      return (
        <YakitFormDragger
          className={styles['plugin-execute-form-item']}
          formItemProps={{
            name: item.Field,
            label: item.FieldVerbose || item.Field,
            rules: [{ required: item.Required }],
          }}
          isShowPathNumber={false}
          selectType="folder"
          multiple={false}
          help="可将文件夹拖入框内或点击此处"
          disabled={disabled}
          autoCompleteProps={{
            ref: item.cacheRef,
            cacheHistoryDataKey: item.cacheHistoryDataKey,
          }}
          renderType={item.cacheHistoryDataKey ? 'autoComplete' : undefined}
        />
      )
    // 其他基础类型
    default:
      return (
        <OutputFormComponentsByType
          item={item}
          extraSetting={extraSetting}
          codeType={pluginType}
          disabled={disabled}
          jsonSchemaListRef={jsonSchemaListRef}
          jsonSchemaInitial={jsonSchemaInitial}
        />
      )
  }
})

/** 执行的入口通过插件参数生成组件 */
export const ExecuteEnterNodeByPluginParams: React.FC<ExecuteEnterNodeByPluginParamsProps> = React.memo((props) => {
  const { paramsList, pluginType, isExecuting, jsonSchemaListRef, jsonSchemaInitial } = props

  return (
    <>
      {paramsList.map((item) => (
        <React.Fragment key={item.Field + item.FieldVerbose}>
          <FormContentItemByType
            item={item}
            pluginType={pluginType}
            disabled={isExecuting}
            jsonSchemaListRef={jsonSchemaListRef}
            jsonSchemaInitial={jsonSchemaInitial}
          />
        </React.Fragment>
      ))}
    </>
  )
})
