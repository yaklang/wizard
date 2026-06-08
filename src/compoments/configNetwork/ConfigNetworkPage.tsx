import type { KVPair } from '@/pages/AIAgent/enums/external'

export interface ThirdPartyApplicationConfig {
  Type:
    | 'zoomeye'
    | 'hunter'
    | 'shodan'
    | 'fofa'
    | 'github'
    | 'openai'
    | 'skylark'
    | 'aliyun'
    | 'tencent'
    | 'quake'
    | string
  APIKey?: string
  UserIdentifier?: string
  UserSecret?: string
  Namespace?: string
  Domain?: string
  WebhookURL?: string
  ExtraParams?: KVPair[]
  Disabled?: boolean
  Proxy?: string
  NoHttps?: boolean
  APIType?: string
  BaseURL?: string
  Endpoint?: string
  EnableEndpoint?: boolean
  Headers?: KVPair[]
  /** 为空，不传给后端 */
  MaxTokens?: number
  /** 为空，不传给后端 */
  Temperature?: number
  /** 为空，不传给后端 */
  TopP?: number
  /** 为空，不传给后端 */
  TopK?: number
  /** 为空，不传给后端 */
  FrequencyPenalty?: number
  /** 为空，不传给后端 */
  ReasoningEffort?: string
  /** 为空，不传给后端 */
  EnableThinkingOpt?: boolean
}
