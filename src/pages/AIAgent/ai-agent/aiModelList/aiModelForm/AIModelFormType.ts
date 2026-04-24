import type { AIConfigHealthCheckResponse, AIModelConfig, AIModelTypeFileName } from '../utils'
import type { AIModelTypeEnum } from '../../defaultConstant'
import type { FormItemProps } from 'antd'
import type { ThirdPartyApplicationConfigProp } from '@/compoments/configNetwork/NewThirdPartyApplicationConfig'
import type { ThirdPartyApplicationConfig } from '@/compoments/configNetwork/ConfigNetworkPage'

export interface AIModelFormProps {
  item?: AIModelConfig
  aiModelType?: AIModelTypeEnum
  thirdPartyApplicationConfig?: ThirdPartyApplicationConfigProp
  onSuccess?: () => void
  onClose: () => void
}

export interface AIConfigAPIKeyFormItemProps {
  formProps: FormItemProps
  aiType?: string
}

export interface AIModelFormSetAIGlobalConfigOptions {
  aiService: string
  aiModelName: string
  fileName?: AIModelTypeFileName
}

interface AddOrUpdateOptions {
  aiModelName: string
  modelType: AIModelTypeEnum
}
export type AIModelFormAddOptions = AddOrUpdateOptions

export type AIModelFormUpdateOptions = AddOrUpdateOptions

export interface AIModelCheckResultProps {
  testResult?: AIConfigHealthCheckResponse
  onClose: () => void
  onApplyRecommendConfig?: (config: ThirdPartyApplicationConfig) => void
  aiModelType?: AIModelTypeEnum
  model?: string
}
