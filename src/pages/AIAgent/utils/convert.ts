import type { API } from '../ai-agent/type/resposeType'
import type { YakParamProps, YakRiskInfoProps } from '../plugins/pluginsType'

/**
 * @name 本地插件参数数据(YakParamProps)-转换成-线上插件参数数据(API.YakitPluginParam)
 */
export const pluginParamsConvertLocalToOnline = (local: YakParamProps[]) => {
  return local.map((item) => {
    const obj: API.YakitPluginParam = {
      field: item.Field,
      field_verbose: item.FieldVerbose,
      required: item.Required,
      type_verbose: item.TypeVerbose,
      default_value: item.DefaultValue,
      extra_setting: item.ExtraSetting,
      help: item.Help,
      group: item.Group,
      method_type: item.MethodType || '',
      json_schema: item.JsonSchema || '',
      suggestion_data_expression: item.SuggestionDataExpression || '',
      ui_schema: item.UISchema || '',
    }
    return obj
  })
}

/**
 * @name 本地插件风险数据(YakRiskInfoProps)-转换成-线上插件风险数据(API.PluginsRiskDetail)
 */
export const riskDetailConvertLocalToOnline = (risks?: YakRiskInfoProps[]) => {
  const arr: API.PluginsRiskDetail[] = []
  const local = risks || []
  for (let item of local) {
    if (item.Level && item.CVE && item.TypeVerbose) {
      arr.push({
        level: item.Level,
        cve: item.CVE,
        typeVerbose: item.TypeVerbose,
        description: item.Description,
        solution: item.Solution,
      })
    }
  }
  return arr
}
