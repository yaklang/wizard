/**
 * This file was auto-generated by swagger-to-ts.
 * Do not make direct changes to the file.
 */

export declare namespace Ratnik {
  export interface YearAndCount {
    year: string;
    count: number;
  }
  export interface XrayTask {
    port: number;
    host?: string;
    includes: string[];
    excludes: string[];
    plugins: string[];
  }
  export interface XrayConfigDetail {
    id: number;
    created_at: number;
    updated_at: number;
    name: string;
    description: string;
  }
  export interface XrayConfig extends XrayConfigDetail {
    content: string;
  }
  export interface WordCloudElement {
    text: string;
    value: number;
  }
  export interface WordCloud {
    elements: WordCloudElement[];
  }
  export interface WebsiteTree {
    website_name: string;
    path: string;
    node_name: string;
    urls: string[];
    request_ids: number[];
    children: WebsiteTree[];
  }
  export interface WebsiteDetailResponse extends Paging {
    data: WebsiteDetail[];
  }
  export interface WebsiteDetail {
    id: number;
    created_at: number;
    updated_at: number;
    website_name: string;
    tags: string[];
  }
  export interface Website extends WebsiteDetail {
    tree: WebsiteTree;
  }
  export interface VulnResponse extends Paging {
    data: Vuln[];
  }
  export interface Vuln {
    id: number;
    created_at: number;
    updated_at: number;
    host: string;
    port: number;
    is_private_net: boolean;
    target: string;
    target_type: string;
    plugin: string;
    detail: object;
    target_raw: object;
    ip_addr: string;
  }
  export interface UserLoginNode {
    id: number;
    node_id: string;
    user_name: string;
    endpoint_type: string;
    src_ip: string;
    login_time: number;
    login_ok: boolean;
  }
  export interface User {
    username: string;
    email?: string;
    role: string[];
    in_charge_of_systems?: string[];
  }
  export interface UpdateTagsPatch {
    batch_op: 'append' | 'replace' | '' | 'add' | 'set';
    id: number;
    tags: string[];
    filter?: object;
  }
  export interface TimelineItemWithData extends TimelineItem {
    data: object;
  }
  export interface TimelineItemList {
    base_timestamp: number;
    items: TimelineItem[];
  }
  export interface TimelineItemGroup {
    page: number;
    total: number;
    page_total: number;
    start: number;
    duration_seconds: number;
    elements: TimelineItemList[];
  }
  export interface TimelineItem {
    source: string;
    id: number;
    type: string;
    title: string;
    is_duration: boolean;
    end: number;
    start: number;
    default_hide: boolean;
    from_system?: string;
  }
  export interface TicketResponse extends Paging {
    data: Ticket[];
  }
  export interface TicketEventStateChangeContent {
    response?: string;
    is_legally?: boolean;
  }
  export interface TicketEventResponse extends Paging {
    data: TicketEvent[];
  }
  export interface TicketEventForAssignee extends TicketEvent {
    is_ticket_finished: boolean;
  }
  export interface TicketEventEmailNotify {
    /**
     * 抄送
     */
    cc: string[];
    title: string;
    smtp_config?: string;
    extra?: string;
  }
  export interface TicketEvent {
    created_at: number;
    updated_at: number;
    title: string;
    from_ticket: string;
    assignee: string;
    assigner: string;
    content: string;
    response: string;
    is_notified: boolean;
    is_handled: boolean;
    is_legally: boolean;
  }
  export interface Ticket {
    name: string;
    id: number;
    created_at: number;
    updated_at: number;
    source_type: string;
    source_id: number;
    is_confirmed: boolean;
    is_legally: boolean;
    tags: string[];
  }
  export interface ThreatAnalysisTaskResponse extends Paging {
    data: ThreatAnalysisTaskModel[];
  }
  export interface ThreatAnalysisTaskModel extends SchedTaskBase {
    id: number;
    updated_at: number;
    created_at: number;
    task_id: string;
    data: string;
    type: string;
    disabled: boolean;
    tags: string[];
    timeout_seconds: number;
    executed_count: number;
    schedule_tasks?: string[];
    async_tasks?: string[];
  }
  export interface ThreatAnalysisTask extends TaskBase, SchedTaskBase {
    disabled: boolean;
    task_id: string;
    type: string;
    data: string;
    tags: string[];
    timeout_seconds?: number;
    executed_count?: number;
  }
  export interface ThreatAnalysisScriptResponse extends Paging {
    data: ThreatAnalysisScript[];
  }
  export interface ThreatAnalysisScriptDetail {
    type: string;
    description: string;
  }
  export interface ThreatAnalysisScript {
    disallow_scheduled: boolean;
    example_params?: string;
    script: string;
    description: string;
    type: string;
    tags: string[];
  }
  export interface ThreatAnalysisResultResponse extends Paging {
    data: ThreatAnalysisResult[];
  }
  export interface ThreatAnalysisResult {
    task_id: string;
    runtime_id: string;
    cost_duration_seconds: number;
    status: string;
    exit_msg: string;
    id: number;
    updated_at: number;
    created_at: number;
  }
  export interface Threat {
    node_id: string;
    threat_type: string;
    threat_info: string;
    origin_data: ThreatOriginData[];
  }
  export interface ThreatOriginData {
    type: 'connection' | 'process' | 'software';
    data: object;
  }
  export interface TaskProgressLog {
    level: 'info' | 'debug' | 'error' | 'warning';
    message: string;
    timestamp_nano?: number;
  }
  export interface TaskProgress {
    /**
     * 进度百分比
     */
    progress_percent: number;
    is_executing: boolean;
    is_finished: boolean;
    /**
     * 日志信息
     */
    log: TaskProgressLog[];
  }
  export interface TaskInScanner {
    type: string;
    task_id: string;
    start_timestamp: number;
    ddl_timestamp: number;
  }
  export interface TaskBase {
    task_type: string;
    task_id: string;
  }
  export interface SupervisionRecordResponse extends Paging {
    data: SupervisionRecord[];
  }
  export interface SupervisionRecord {
    id: number;
    created_at: number;
    updated_at: number;
    supervisor: string;
    supervisor_email?: string;
    department?: string;
    type: string;
    supervised_object: string[];
    is_discarded: boolean;
    discarded_time?: number;
    tags: string[];
  }
  export interface SshInfoNode {
    id: number;
    node_id: string;
    ssh_version: string;
    v2: boolean;
    password_authentication: boolean;
    permit_empty_passwd: boolean;
  }
  export interface SshConfigNode {
    id: number;
    node_id: string;
    ssh_file_path: string;
  }
  export interface Software {
    node_id: string;
    name: string;
    version: string;
    software_timestamp: number;
    software_mgr_type: string;
    last_udpated_timestamp: number;
    be_removed: boolean;
  }
  export interface SMTPConfig {
    name: string;
    server: string;
    port: number;
    username: string;
    ssl: boolean;
  }
  export interface ServerStats {
    /**
     * 节点总数
     */
    node_total_count: number;
    /**
     * 十分钟内活跃节点数
     */
    last_ten_minutes_active_node_count: number;
    /**
     * HIDS 节点数量
     */
    hids_node_count: number;
    /**
     * 扫描器节点数量
     */
    scanner_node_count: number;
    /**
     * CVE 数据库漏洞总量
     */
    cve_vuln_count: number;
  }
  export interface SearchAssetsResult {
    title?: string;
    active?: boolean;
    tags?: string[];
    type?: string;
    data?: string;
  }
  export interface SearchAssetsRecord {
    timestamp: number;
    id: number;
    search: string;
    results: SearchAssetsResult[];
  }
  export interface ScriptRuleTask extends SchedTaskBase, ScriptRule {
    execute_now?: boolean;
  }
  export interface ScriptRuleRuntime {
    script_id: string;
    runtime_id: string;
    source_total: number;
    audit_total: number;
    logs: string;
    ok: boolean;
    reason: string;
    audit_result: string;
    action: string;
    cost_duration_seconds: number;
    timestamp?: number;
  }
  export interface ScriptRulePatch extends SchedTaskBase {
    tags?: string[];
    script_id: string;
    script?: string;
    duration_seconds?: number;
    types?: string;
    timeout_seconds?: number;
  }
  export interface ScriptRule {
    script_id: string;
    script: string;
    time_base_timestamp: number;
    duration_seconds: number;
    off_from_time_base_seconds: number;
    log_limit_count: number;
    types: string;
    timeout_seconds: number;
    executed_count?: number;
    disabled?: boolean;
    tags?: string[];
    disable_pre_checking: boolean;
  }
  export interface ScheduleResult {
    id: number;
    schedule_id: string;
    created_at: number;
    updated_at: number;
    ok: boolean;
    reason: string;
  }
  export interface SchedTaskBase {
    enable_sched: boolean;
    first?: boolean;
    interval_seconds: number;
    start_timestamp?: number;
    end_timestamp?: number;
  }
  export interface SchedTask {
    schedule_id: string;
    interval: number;
    timeout: number;
    start?: number;
    end?: number;
    first: boolean;
    type: string;
    params: object;
    is_executing: boolean;
    is_scheduling: boolean;
    is_finished: boolean;
    is_canceled: boolean;
    last_executed_time?: number;
    next_executed_time?: number;
    is_disabled: boolean;
  }
  export interface ScanSubdomainTask extends TaskBase, SchedTaskBase {
    /**
     * 想要扫描的域名, 以 , 为分隔
     */
    targets: string;
    max_depth?: number;
    timeout_for_http_search_seconds?: number;
    timeout_for_each_query_seconds?: number;
    wildcard_to_stop?: boolean;
    worker_count?: number;
    allow_to_recursive?: boolean;
  }
  export interface ScanFingerprintTaskResponse extends Paging {
    data: ScanFingerprintTask[];
  }
  export interface ScanFingerprintTask
    extends GormBaseModel,
      NewScanFingerprintTask {
    schedule_tasks: string[];
    async_tasks: string[];
  }
  export interface ScanFingerprintSubtaskResponse extends Paging {
    data: ScanFingerprintSubtask[];
  }
  export interface ScanFingerprintSubtask extends GormBaseModel {
    execute_node: string;
    hash: string;
    parent_task_id: string;
    runtime_id: string;
    ok: boolean;
    status: string;
    reason: string;
    hosts: string;
    tcp_ports: string;
    udp_ports: string;
    concurrent: number;
  }
  export interface ScanFingerprintRuntimeResponse extends Paging {
    data: ScanFingerprintRuntime[];
  }
  export interface ScanFingerprintRuntime extends GormBaseModel {
    runtime_id: string;
    task_id: string;
    subtask_total: number;
    subtask_failed_count: number;
    subtask_succeeded_count: number;
  }
  export interface RuleUnit {
    data_source: string;
    data_source_field: string;
    op: string;
    data: string;
  }
  export interface RuleStats {
    in_use_realtime_total: number;
    in_use_periodic_total: number;
    once_total: number;
    disabled_rules_count: number;
  }
  export interface RuleDataSource {
    data_source: string;
    fields: string[];
  }
  export interface RuleBase {
    rule_id: string;
    disable?: boolean;
    description: string;
    /**
     * Exclude黑名单，Include白名单
     */
    type: 'black' | 'white';
    unit_relation: 'or' | 'and';
    units: RuleUnit[];
  }
  export interface Rule extends PeriodicRule {
    once: boolean;
    is_periodic: boolean;
    is_realtime: boolean;
  }
  export interface RssSubscriptionSourceResponse extends Paging {
    data: RssSubscriptionSource[];
  }
  export interface RssSubscriptionSource {
    type: string;
    id: number;
    updated_at: number;
    created_at: number;
    title: string;
    description: string;
    xml_url: string;
    html_url: string;
  }
  export interface RssBriefingToTicketRequest {
    briefing_id: number;
    reason: string;
    /**
     * 事件负责人
     */
    assignee?: string;
    /**
     * 事件发起人
     */
    assigner?: string;
  }
  export interface RssBriefingResponse extends Paging {
    data: RssBriefing[];
  }
  export interface RssBriefing {
    is_read: boolean;
    tags: string[];
    id: number;
    updated_at: number;
    created_at: number;
    link: string;
    content: string;
    author?: string;
    description: string;
    source_xml_url: string;
    title: string;
    image_name?: string;
    image_url?: string;
    categories?: string;
    guid?: string;
  }
  export interface RemoveCacheAuditLogConfig {
    log_types: string[];
    acquisition_start_timestamp: number;
    acquisition_end_timestamp: number;
  }
  export interface RealtimeRule extends RuleBase {}
  export interface RadTask {
    proxy?: string;
    targets: string[];
    concurrent: number;
    cookie: string;
  }
  export interface Radial {
    nodes: G6GraphNode[];
    edges: G6GraphEdge[];
  }
  export interface PunchCardGraphElement {
    x: string;
    y: string;
    count: number;
  }
  export interface PunchCardGraph {
    x_fields: string[];
    y_fields: string[];
    elements: PunchCardGraphElement[];
  }
  export interface Proxy {
    name: string;
    node_id: string;
    port: number;
    addr: string;
    type: string;
    proxy_addr: string;
  }
  export interface Process extends GormBaseModel {
    last_update_timestamp: number;
    username: string;
    command_line: string;
    children: number[];
    node_id: string;
    process_name: string;
    cmdline?: string;
    pid: number;
    status: string;
    cpu_percent: number;
    mem_percent: number;
    parent_pid: number;
  }
  export interface Principle {
    user: string;
  }
  export interface PortScanTask extends TaskBase, SchedTaskBase {
    hosts: string;
    ports: string;
    nodes: string[];
    enable_delay?: boolean;
    delay_max?: number;
    delay_min?: number;
    delay_probability?: number;
    enable_cache?: boolean;
    use_cache_duration_days?: number;
  }
  export interface Pkcs12UserCredential {
    common_name: string;
    user: string;
    password: string;
    data: string;
  }
  export interface PieGraphElement {
    x: string;
    value: number;
  }
  export interface PieGraph {
    elements: NonutRoseGraphElement[];
  }
  export interface PeriodicRule extends OnceRule {
    first: boolean;
    interval_minutes: number;
  }
  export interface PalmUser {
    username: string;
    email: string;
    roles: string[];
  }
  export interface PalmHIDSBackupItem {
    id: string;
    backup_path: string;
    origin_path: string;
    timestamp: number;
    is_dir: boolean;
  }
  export interface Paging {
    pagemeta: PageMeta;
  }
  export interface PageMeta {
    /**
     * 页面索引
     */
    page: number;
    /**
     * 页面数据条数限制
     */
    limit: number;
    /**
     * 总共数据条数
     */
    total: number;
    /**
     * 总页数
     */
    total_page: number;
  }
  export interface OnceRule extends RuleBase {
    data_source: string;
    limit: number;
    off_days: number;
    duration_days: number;
  }
  export interface NotificationStats {
    /**
     * YYYY-MM-DD 格式日期
     */
    date: string;
    info_level_count: number;
    warning_level_count: number;
    alarm_level_count: number;
    hids_source_count: number;
    alarm_source_count: number;
    cve_source_count: number;
  }
  export interface Notification {
    is_handled: boolean;
    is_read: boolean;
    source: string;
    level: string;
    title: string;
    content: string;
    hids_origin_data_type:
      | 'unknown'
      | 'connection'
      | 'process'
      | 'boot_software'
      | 'crontab'
      | 'host_user'
      | 'software'
      | 'ssh'
      | 'user_login'
      | 'watch_file_changed';
    hids_origin_data: object;
    alarm_origin_data: object;
    cve: string;
    id: number;
    timestamp: number;
  }
  export interface NonutRoseGraphElement {
    x: string;
    value: number;
  }
  export interface NonutRoseGraph {
    elements: NonutRoseGraphElement[];
  }
  export interface NodeConfig {
    invalid: boolean;
    node_id: string;
    process_monitor_interval_seconds: number;
    netport_monitor_interval_seconds: number;
    user_login_fail_file_max_size: number;
    usr_login_ok_file_path: string;
    usr_login_fail_file_path: string;
    root_user_name: string[];
    user_login_fail_check_interval: number;
    user_login_fail_max_ticket: number;
    apt_software_log_file_path: string;
    yum_software_log_file_path: string;
    crontab_file_path: string;
    ssh_file_path: string;
  }
  export interface Node extends GormBaseModel {
    node_id: string;
    node_type: string;
    node_token: string;
    ip_address: string[];
    mac_address: string[];
    last_updated_timestamp?: number;
    hostname?: string;
    host_id?: string;
    go_arch?: string;
    go_os?: string;
    version?: string;
    main_user?: string;
    all_user?: string;
    /**
     * 节点主要使用的 IP 地址
     */
    main_addr?: string;
    /**
     * 主要使用的 Mac 地址
     */
    main_mac?: string;
    cpu_percent?: number;
    memory_percent?: number;
    network_upload?: number;
    network_download?: number;
  }
  export interface NewUserCreated {
    username: string;
    password: string;
  }
  export interface NewUser {
    email: string;
    username: string;
    role: string[];
    in_charge_of_systems?: string[];
  }
  export interface NewTicketEventFromTicket {
    title: string;
    from_ticket: string;
    assignee: string;
    assigner: string;
    content: string;
  }
  export interface NewTicket {
    name: string;
    source_type: string;
    source_id: number;
  }
  export interface NewSupervisionRecord {
    supervisor: string;
    supervised_object: string;
    tags: string[];
    department?: string;
    supervisor_email?: string;
  }
  export interface NewSMTPConfig {
    name?: string;
    server?: string;
    port?: number;
    connect_tls?: boolean;
    identify?: string;
    username?: string;
    password?: string;
    from?: string;
  }
  export interface NewScanFingerprintTask extends TaskBase, SchedTaskBase {
    hosts: string;
    ports: string;
    protos: string[];
    just_scan_existed_in_database: boolean;
    enable_delay?: boolean;
    delay_max?: number;
    delay_min?: number;
    delay_probability?: number;
    enable_cache?: boolean;
    use_cache_duration_days?: number;
  }
  export interface NewPKISignServerRequest {
    common_name: string;
    timeout_seconds?: number;
  }
  export interface NewPKISignClientRequest {
    common_name: string;
    user: string;
    timeout_seconds?: number;
  }
  export interface NewPKIServerCredentialResponse extends Paging {
    data: NewPKIServerCredentialDetail[];
  }
  export interface NewPKIServerCredentialDetail {
    expired_at: number;
    id: number;
    common_name: string;
    created_at: number;
  }
  export interface NewPKIGenerateSelfSignedCertKey {
    host: string;
    alertive_ips?: string[];
    dns_servers?: string[];
  }
  export interface NewPKIClientCredentialResponse extends Paging {
    data: NewPKIClientCredentialDetail[];
  }
  export interface NewPKIClientCredentialDetail {
    expired_at: number;
    id: number;
    common_name: string;
    user: string;
    created_at: number;
    revoked: boolean;
    revoked_at: number;
  }
  export interface NewMutateRequestTemplate {
    name: string;
    template: string;
    description: string;
  }
  export interface NewInspectorUser {
    timeout_days?: number;
    email?: string;
    username: string;
    password: string;
    in_charge_of_system: string[];
  }
  export interface NewHTTPRequestForMutating {
    request: string;
  }
  export interface NewDrop {
    id?: number;
    author?: string;
    title: string;
    markdown: string;
  }
  export interface NewDoMutateRequestResult {
    async_task_id: string;
    request_hash: string;
  }
  export interface NewDoMutateRequestRequest {
    is_https?: boolean;
    timeout_seconds?: number;
    body: string;
    concurrent?: number;
  }
  export interface NewDingRobotConfig extends DingRobotConfig {
    secret: string;
  }
  export interface NewAwdTodo {
    type?: string;
    name: string;
    description: string;
  }
  export interface NewAwdLog {
    headers?: HTTPHeaderItem[];
    log_file: string;
    status_code: number;
    from_addr: string;
    to_addr: string;
    level?: 'mid' | 'low' | 'high';
    request_uri: string;
    post_data: string;
    timestamp: number;
    raw?: string;
  }
  export interface NewAwdHostAndDeployAgent extends NewAwdHost {
    agent_id: string;
    awd_server_addr: string;
    server_mq_password: string;
    server_mq_port: number;
  }
  export interface NewAwdHost {
    awd_game_name?: string;
    private_key?: string;
    username: string;
    password?: string;
    host: string;
    port: number;
  }
  export interface NewAwdGame {
    active: boolean;
    available_insasive_ports?: string[];
    end_timestamp?: number;
    start_timestamp?: number;
    round_duration_seconds?: number;
    name: string;
    obtain_flag_command: string;
    enemy_network: string[];
  }
  export interface NetAddress {
    ip: string;
    port: number;
  }
  export interface MutateRequestTemplateResponse extends Paging {
    data: MutateRequestTemplate[];
  }
  export interface MutateRequestTemplate
    extends NewMutateRequestTemplate,
      GormBaseModel {}
  export interface MonitorResult {
    type: string;
    data: string;
    count: number;
  }
  export interface MaterialFileResponse extends Paging {
    data: MaterialFile[];
  }
  export interface MaterialFileDetail {
    description: string;
    new_filename: string;
    new_filetype: string;
  }
  export interface MaterialFile {
    status: string;
    created_at: number;
    updated_at: number;
    description: string;
    tags: string[];
    file_name: string;
    file_type: string;
  }
  export interface LineGraphElement {
    name: string;
    timestamp: number;
    value: number;
  }
  export interface LineGraph {
    value_min: number;
    value_alias: string;
    timestamp_min: number;
    timestamp_max: number;
    elements: LineGraphElement[];
  }
  export interface InspectorUserResponse extends Paging {
    data: InspectorUser[];
  }
  export interface InspectorUser {
    email: string;
    roles: string[];
    created_at: number;
    username: string;
    systems?: string[];
  }
  export interface HTTPResponseForMutatingResponse extends Paging {
    data: HTTPResponseForMutating[];
  }
  export interface HTTPResponseForMutating extends GormBaseModel {
    title: string;
    request: string;
    request_hash: string;
    ok: boolean;
    reason: string;
    response: string;
    hash: string;
    response_length: number;
    status_code: number;
  }
  export interface HTTPResponseDetailResponse extends Paging {
    data: HTTPResponseDetail[];
  }
  export interface HTTPResponseDetail {
    title: string;
    tags: string[];
    id: number;
    created_at: number;
    updated_at: number;
    url: string;
    method: string;
    status_code: number;
    status_text: string;
  }
  export interface HTTPResponse extends HTTPResponseDetail {
    request_body: string;
    raw_response: string;
  }
  export interface HTTPRequestForMutatingResponse extends Paging {
    data: HTTPRequestForMutating[];
  }
  export interface HTTPRequestForMutating
    extends GormBaseModel,
      NewHTTPRequestForMutating {
    tags: string[];
    hash: string;
  }
  export interface HTTPRequestDetailResponse extends Paging {
    data: HTTPRequestDetail[];
  }
  export interface HTTPRequestDetail {
    tags: string[];
    id: number;
    created_at: number;
    updated_at: number;
    url: string;
    method: string;
    host: string;
    port: number;
    ip: string;
    schema: string;
  }
  export interface HTTPRequest extends HTTPRequestDetail {
    body: string;
    raw_request: string;
  }
  export interface HTTPHeaderItem {
    key: string;
    value: string;
  }
  export interface HostUserNode {
    id: number;
    node_id: string;
    user_name: string;
    uid: number;
    gid: number;
    full_name: string;
    home_dir: string;
  }
  export interface HealthInfoSnapshot {
    /**
     * 时间点
     */
    timestamp: number;
    /**
     * cpu 占用
     */
    cpu_percent: number;
    memory_percent: number;
    /**
     * 网络上传速率, KB/sec
     */
    network_upload: number;
    /**
     * 网络下载速率, KB/sec
     */
    network_download: number;
    /**
     * 硬盘写入速率 KB/sec
     */
    disk_write: number;
    /**
     * 硬盘读入速率 KB/sec
     */
    disk_read: number;
  }
  export interface HealthInfos {
    /**
     * 时间点
     */
    timestamp: number;
    stats: HealthInfoSnapshot[];
    /**
     * 节点 ID
     */
    node_id: string;
    /**
     * 硬盘空间使用比例
     */
    disk_use_percent: number;
  }
  export interface GraphRelationship {
    script_id: string;
    runtime_id: string;
    graph_id: number;
  }
  export interface GraphInfo extends GraphBasicInfo {
    data: object;
  }
  export interface GraphBasicInfo {
    id: number;
    created_at: number;
    updated_at: number;
    name: string;
    description: string;
    type: string;
    source: string;
    from_system?: string;
  }
  export interface GormBaseModel {
    id: number;
    created_at: number;
    updated_at: number;
  }
  export interface G6GraphNode {
    id: string;
    label: string;
    value: number;
    is_model_rect?: boolean;
  }
  export interface G6GraphEdge {
    source: string;
    target: string;
  }
  export interface FsNotifyFileTree {
    relative_paths: string[];
    name: string;
    path: string;
    children: FsNotifyFileTree[];
  }
  export interface FsNotifyFileMonitorRecordResponse extends Paging {
    data: FsNotifyFileMonitorRecord[];
  }
  export interface FsNotifyFileMonitorRecord extends GormBaseModel {
    is_dir: boolean;
    file_name: string;
    node_id: string;
    path: string;
    event_type: string;
    origin_file_mode?: string;
    current_file_mode?: string;
    origin_data_base64?: string;
    current_data_base64?: string;
    origin_modify_timestamp?: number;
    current_modify_timestamp?: number;
    executable?: boolean;
  }
  export interface FinishHijackMessage {
    raw: string;
  }
  export interface FileInfo {
    name: string;
    path: string;
    is_dir: boolean;
    size: number;
    modify_timestamp: number;
    mode: string;
  }
  export interface FileChangeRequest {
    node_id: string;
    path: string;
    raw: string;
  }
  export interface FeedbackByInspector {
    report_id: number;
    is_legally: boolean;
    tags: string[];
    content: string;
    title: string;
    assignee: string;
  }
  export interface DropDescriptionResponse extends Paging {
    data: DropDescription[];
  }
  export interface DropDescription {
    tags: string[];
    id: number;
    title: string;
    author: string;
    editable?: boolean;
    created_at?: number;
    updated_at?: number;
    material_tags?: string[];
  }
  export interface Drop extends DropDescription {
    markdown: string;
  }
  export interface DrawGraphTask {
    task_id: string;
    timeout_seconds: number;
    script: string;
  }
  export interface DingRobotConfig {
    webhook: string;
    name: string;
  }
  export interface DictionaryResponse extends Paging {
    data: Dictionary[];
  }
  export interface DictionaryItemResponse extends Paging {
    data: DictionaryItem[];
  }
  export interface DictionaryItem extends GormBaseModel {
    dict_name: string;
    data: string;
    hash: string;
    type: string;
  }
  export interface Dictionary extends GormBaseModel {
    name: string;
    tags?: string[];
  }
  export interface DesktopXrayInspect {
    path: string;
    ca: string;
    key: string;
    listened_port: number;
    is_working: boolean;
    plugins: string[];
    default_plugins: string[];
  }
  export interface DesktopRadInspect {
    path: string;
    proxy: string;
    is_working: boolean;
  }
  export interface DeployConfig {
    account: string;
    passwd: string;
    agent_path: string;
    ip_port: string[];
  }
  export interface CweAndCount {
    cwe: string;
    count: number;
  }
  export interface CVEStats {
    title: string;
    cpes: string[];
    total: number;
    year_count: YearAndCount[];
    cwe_count: CweAndCount[];
    severity_high_count: number;
    severity_medium_count: number;
    severity_low_count: number;
    network_access_count: number;
    network_access_low_complexity_count: number;
    access_low_complexity_count: number;
    authentication_required_count: number;
  }
  export interface CVE {
    /**
     * 精确搜索，如果为 True，表明搜索结果应该是准确的，如果为 False 说明可能不准确
     */
    exact_search: boolean;
    /**
     * CVE 的搜索来源
     */
    from: string;
    /**
     * CVE 编号
     */
    cve: string;
    /**
     * 漏洞类型/CWE类型
     */
    cwe: string;
    /**
     * 漏洞详细描述信息
     */
    description: string;
    /**
     * 攻击路径
     */
    access_vector: string;
    /**
     * 攻击复杂度
     */
    access_complexity: string;
    /**
     * 需要的认证情况
     */
    authentication: string;
    /**
     * 泄密影响
     */
    confidentiality_impact: string;
    /**
     * 完整性影响
     */
    integrity_impact: string;
    /**
     * 可用性影响
     */
    availability_impact: string;
    /**
     * CVSS 评分
     */
    base_cvss_v2_score: number;
    /**
     * 严重程度
     */
    severity: string;
    /**
     * 利用评分
     */
    exploitability_score: number;
    /**
     * 影响评分
     */
    impact_score: number;
    /**
     * 是否可以获取所有权限
     */
    obtain_all_privilege: boolean;
    /**
     * 是否可以获取用户权限
     */
    obtain_user_privilege: boolean;
    /**
     * 是否可以获取其他权限
     */
    obtain_other_privilege: boolean;
    /**
     * 是否需要用户交互利用
     */
    user_interaction_required: boolean;
    /**
     * 发布日期
     */
    published_date: string;
    /**
     * 最近修改日期
     */
    last_modified_date: string;
    vulnerable_product: string;
  }
  export interface CrontabNode {
    id: number;
    node_id: string;
    crontab: string;
    cmd: string;
    software: string;
  }
  export interface CreateTimelineItem {
    author?: string;
    timestamp: number;
    title: string;
    should_notify: boolean;
    content: string;
  }
  export interface Connection extends GormBaseModel {
    /**
     * 关联的进程
     */
    pid: number;
    /**
     * 截止时间点的连接状况
     */
    timestamp: number;
    node_id: string;
    process_name: string;
    /**
     * 该 socket 的文件描述符
     */
    fd: number;
    /**
     * 该连接的类型
     */
    type: string;
    /**
     * 该连接所属的 Family
     */
    family: string;
    /**
     * 状态信息
     */
    status: string;
    uids: number[];
    localaddr: string;
    remoteaddr: string;
  }
  export interface ChangeUserPasswordRequest {
    user: string;
    new: string;
    old: string;
  }
  export interface CacheAuditLogConfig {
    task_id: string;
    log_type: string;
    start_timestamp: number;
    end_timestamp: number;
  }
  export interface BootSoftware {
    id: number;
    node_id: string;
    exe: string;
    name: string;
  }
  export interface BarGraphElement {
    name: string;
    value: number;
  }
  export interface BarGraph {
    elements: BarGraphElement[];
  }
  export interface AwdTodo extends GormBaseModel {
    name: string;
    description: string;
    tags: string[];
    is_finished: boolean;
  }
  export interface AwdLogResponse extends Paging {
    data: AwdLog[];
  }
  export interface AwdLogLevelKeyword {
    level: string;
    keywords: string[];
  }
  export interface AwdLog extends GormBaseModel, NewAwdLog {}
  export interface AwdHostResponse extends Paging {
    data: AwdHost[];
  }
  export interface AwdHost extends NewAwdHost {
    tags: string[];
    id: number;
    created_at: number;
    updated_at: number;
    is_available: boolean;
  }
  export interface AwdGamesResponse extends Paging {
    data: AwdGame[];
  }
  export interface AwdGame extends NewAwdGame, GormBaseModel {}
  export interface AwdFlagsResponse extends Paging {
    data: AwdFlag[];
  }
  export interface AwdFlag extends GormBaseModel {
    awd_game_name: string;
    flag: string;
    from_ip: string;
  }
  export interface AwdBadTrafficAttack {
    ports: string;
    networks: string;
    concurrent?: number;
    timeout_seconds?: number;
  }
  export interface AvailableRole {
    role: string;
    verbose?: string;
    description?: string;
  }
  export interface AuditLog {
    id: number;
    log_type: string;
    url_path: string;
    timestamp: number;
    content: string;
    account: string;
    dept_path: string;
    event_severity: 'info' | 'low' | 'middle' | 'high' | 'alarm';
    request_id: string;
    beta_user_token: string;
  }
  export interface AsyncTask {
    task_id: string;
    task_type: string;
    params: object;
    progress: TaskProgress;
    is_finished: boolean;
    is_executing: boolean;
    just_in_db: boolean;
  }
  export interface AssetStats {
    domain_total: number;
    host_total: number;
    port_total: number;
    service_types_count_top200: MonitorResult[];
    c_class_ports_count_top200: MonitorResult[];
  }
  export interface AssetPort extends GormBaseModel {
    host: string;
    ip_integer: number;
    port: number;
    proto: string;
    service_type: string;
    state: string;
    reason: string;
    fingerprint: string;
    cpes: string[];
    tags: string[];
  }
  export interface AssetHost extends GormBaseModel {
    ip: string;
    is_ipv6: boolean;
    is_ipv4: boolean;
    ipv4_integer: number;
    domains: string[];
    is_in_public_net: boolean;
    tags: string[];
  }
  export interface AssetDomain extends GormBaseModel {
    domain: string;
    ip_addrs: string[];
    tags: string[];
  }
  export interface AgentFile {
    id: number;
    type: string;
    version: string;
    md5: string;
    size: number;
    create_time: string;
    name: string;
  }
  export interface ActionSucceeded {
    /**
     * 来源于哪个 API
     */
    from: string;
    /**
     * 执行状态
     */
    ok: boolean;
  }
  export interface ActionFailed {
    /**
     * 来源于哪个 API
     */
    from: string;
    /**
     * 执行状态
     */
    ok: boolean;
    reason: string;
  }
}
