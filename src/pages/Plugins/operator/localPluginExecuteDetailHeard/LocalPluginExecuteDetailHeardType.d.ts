import type { JsonFormSchemaListWrapper } from '@/compoments/JsonFormWrapper/JsonFormWrapper'
import type { YakParamProps } from '@/pages/AIAgent/plugins/pluginsType'
export interface ExecuteEnterNodeByPluginParamsProps extends JsonFormSchemaListWrapper {
  paramsList: YakParamProps[]
  pluginType?: string
  isExecuting: boolean
}

export interface FormContentItemByTypeProps extends JsonFormSchemaListWrapper {
  item: YakParamProps
  pluginType?: string
  disabled?: boolean
}

export interface FormExtraSettingProps {
  double: boolean
  data: { key: string; label: string; value: string }[]
}

export interface OutputFormComponentsByTypeProps extends JsonFormSchemaListWrapper {
  item: YakParamProps
  extraSetting?: FormExtraSettingProps
  /** 根据插件类型出编辑器类型/或者自己输入对应的编辑器类型 */
  codeType?: string
  disabled?: boolean
  /** 插件类型 */
  pluginType?: string
}
