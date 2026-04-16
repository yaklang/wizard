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
}
