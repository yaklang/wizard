interface AIParams {
    forge_name?: string;
    review_policy?: 'manual' | 'auto' | 'ai' | 'ai-auto';
    ai_service?: string; // "openai|aibalance|..."
    ai_model_name?: string;
    max_iteration?: number;
    react_max_iteration?: number;
    disable_tool_use?: boolean;
    use_default_ai?: boolean;
    attached_files?: string[];
    enable_system_file_system_operator?: boolean;
    disallow_require_for_user_prompt?: boolean;
    ai_review_risk_control_score?: number;
    ai_call_auto_retry?: number;
    ai_transaction_retry?: number;
    enable_ai_search_tool?: boolean;
    enable_ai_search_internet?: boolean;
    enable_qwen_no_think_mode?: boolean;
    allow_plan_user_interact?: boolean;
    plan_user_interact_max_count?: number;
    timeline_item_limit?: number;
    timeline_content_size_limit?: number;
    user_interact_limit?: number;
    timeline_session_id?: string;
}

interface PushEventRequest {
    type: 'free_input' | 'interactive' | 'sync';
    content?: string;
    params?: AIParams;
    is_config_hotpatch?: boolean;
    hotpatch_type?: string;
    is_start?: boolean;
    is_interactive_message?: boolean;
    interactive_id?: string;
    interactive_json_input?: string;
    is_sync_message?: boolean;
    sync_type?: string;
    sync_json_input?: string;
    sync_id?: string;
    is_free_input?: boolean;
    free_input: string;
    attached_files?: string[];
    focus_mode_loop?: string;
}

interface RunEvent {
    id: string;
    type:
        | 'listener_ready'
        | 'stream'
        | 'structured'
        | 'thought'
        | 'done'
        | 'error'
        | 'heartbeat'
        | string;
    coordinator_id: string;
    ai_model_name: string;
    node_id: string;
    is_system: boolean;
    is_stream: boolean;
    is_reason: boolean;
    stream_delta: string;
    content: string;
    timestamp: number;
    task_index: string;
    event_uuid: string;
    task_uuid: string;
}

interface TPostCreateSessionRequest {
    run_id?: string;
    params?: AIParams;
}

interface TPostCreateSessionResponse {
    run_id: string;
    status: string;
}

type TPostSendFirstMessageRequest = PushEventRequest;
type TPostSendContinueMessageRequest = PushEventRequest;

interface TPostSendFirstMessageResponse {
    run_id: string;
    status: string;
}

interface TPostSendContinueMessageResponse {
    status: string;
}

interface TGetSettingResponse {
    UseDefaultAIConfig: boolean;
    AIService: string;
    AIModelName: string;
    ReviewPolicy: string;
    SelectedProviderID: number;
    SelectedModelName: string;
    SelectedModelTier: string;
}

interface TPostSettingRequest {
    ai_service: string;
    selected_provider_id: number;
    selected_model_name: string;
    review_policy: string;
}

interface TPostCancelMessageResponse {
    run_id: string;
    status: string;
}

type TenumBuffer = Buffer | Uint8Array;

interface AuthInfo {
    AuthUsername: string;
    AuthPassword: string;
    AuthType: string;
    Host: string;
    Forbidden: boolean;
}

interface ClientCertificates {
    CrtPem: TenumBuffer;
    KeyPem: TenumBuffer;
    CaCertificates: TenumBuffer[];
    Pkcs12Bytes: TenumBuffer;
    Pkcs12Password: TenumBuffer;
    Host?: string;
}

interface GlobalNetworkConfig {
    DisableSystemDNS: boolean;
    CustomDNSServers: string[];
    DNSFallbackTCP: boolean;
    DNSFallbackDoH: boolean;
    CustomDoHServers: string[];

    ClientCertificates?: ClientCertificates[];

    DisallowIPAddress: string[];
    DisallowDomain: string[];
    GlobalProxy: string[];
    EnableSystemProxyFromEnv: boolean;
    SkipSaveHTTPFlow: boolean;

    AppConfigs: ThirdPartyApplicationConfig[];

    AiApiPriority: string[];

    AuthInfos: AuthInfo[];

    SynScanNetInterface: string;

    ExcludePluginScanURIs: string[];
    IncludePluginScanURIs: string[];

    DbSaveSync: boolean;

    CallPluginTimeout: number;

    MinTlsVersion: number;
    MaxTlsVersion: number;
    MaxContentLength: number | string;
}

type GetGlobalNetworkConfigResponse = GlobalNetworkConfig;

interface KVPair {
    Key: string;
    Value: string;
    MarshalValue: string;
}

interface ThirdPartyApplicationConfig {
    Type: string;
    APIKey: string;
    UserIdentifier: string;
    UserSecret: string;
    Namespace: string;
    Domain: string;
    WebhookURL: string;
    ExtraParams: KVPair[];
    Disabled: boolean;
    Proxy: string;
    NoHttps: boolean;
}

interface ListAIProvidersResponse {
    Providers?: {
        Id: number;
        Config: ThirdPartyApplicationConfig;
    }[];
}

interface TPostSettingAimodelsGetRequest {
    // 请求体支持多种格式
    Config: any;
    //     ```json
    // { "Config": "openai" }
    // ```

    // 2) 传统 JSON 字符串：

    // ```json
    // { "Config": "{\"Type\":\"openai\",\"APIKey\":\"***\"}" }
    // ```

    // 3) 对象格式：

    // ```json
    // {
    //   "config": {
    //     "Type": "openai",
    //     "APIKey": "***",
    //     "Domain": "api.openai.com",
    //     "Proxy": "",
    //     "NoHttps": false
    //   }
    // }
    // ```
}

interface TPostSettingAimodelsGetResponse {
    ModelName: string[];
}

interface TPostSettingAifocusGetResponse {
    Name: string;
    Description: string;
    OutputExamplePrompt: string;
    UsagePrompt: string;
    VerboseName: string;
    VerboseNameZh: string;
}

interface GetSessionAllResponse {
    sessions: {
        run_id: string;
        title: string;
        status: 'pending' | 'running' | 'completed' | 'cancelled' | 'failed';
        created_at: string;
        is_alive: boolean;
    }[];
}

interface TPostSessionTitle {
    run_id: string;
    title: string;
    status: string;
}

export type {
    TPostCreateSessionRequest,
    TPostCreateSessionResponse,
    TPostSendFirstMessageRequest,
    TPostSendFirstMessageResponse,
    TPostSendContinueMessageRequest,
    TPostSendContinueMessageResponse,
    TGetSettingResponse,
    TPostSettingRequest,
    RunEvent,
    TPostCancelMessageResponse,
    GetGlobalNetworkConfigResponse,
    GlobalNetworkConfig,
    ListAIProvidersResponse,
    TPostSettingAimodelsGetRequest,
    TPostSettingAimodelsGetResponse,
    TPostSettingAifocusGetResponse,
    GetSessionAllResponse,
    TPostSessionTitle,
};
