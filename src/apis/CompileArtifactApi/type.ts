import type { TableResponseData } from '@/utils/commonTypes';

export interface TCompileArtifactSummary {
    total_storage_bytes: number;
    total_project_count: number;
    total_series_count: number;
    total_program_count: number;
    total_line_count: number;
    active_series_count: number;
    unhealthy_series_count: number;
}

export interface TCompileArtifactItem {
    series_key: string;
    project_id: number;
    project_name: string;
    language?: string;
    head_program_name?: string;
    engine_version?: string;
    compile_config_hash?: string;
    head_updated_at?: string;
    total_programs: number;
    current_chain_programs: number;
    patch_programs: number;
    history_programs: number;
    total_lines: number;
    head_line_count: number;
    total_size_bytes: number;
    current_chain_size_bytes: number;
    reclaimable_size_bytes: number;
    growth_7d_bytes: number;
    growth_7d_programs: number;
    last_compile_at?: string;
    last_compile_kind?: string;
    last_scan_at?: string;
    active_reader_count: number;
    recent_scan_count: number;
    health_status: string;
    health_reason?: string;
}

export interface TCompileArtifactTimelineItem {
    program_name: string;
    kind: string;
    base_program_name?: string;
    is_head: boolean;
    is_overlay: boolean;
    overlay_layers?: string[];
    line_count: number;
    logical_size_bytes: number;
    created_at?: string;
}

export interface TCompileArtifactReaderItem {
    task_id: string;
    node_id?: string;
    status: string;
    phase?: string;
    progress: number;
    creator?: string;
    program_name?: string;
    created_at?: string;
    started_at?: string;
    updated_at?: string;
    finished_at?: string;
}

export interface TCompileArtifactDetail {
    overview: TCompileArtifactItem;
    head_program_kind?: string;
    head_base_program?: string;
    head_overlay_layers?: string[];
    current_chain_names: string[];
    timeline: TCompileArtifactTimelineItem[];
    active_readers: TCompileArtifactReaderItem[];
    recent_scans: TCompileArtifactReaderItem[];
}

export interface TCompileArtifactListParams {
    page?: number;
    limit?: number;
    query?: string;
    language?: string;
    health_status?: string;
}

export interface TCompileArtifactRebuildRequest {
    series_key: string;
    node_id?: string;
}

export interface TCompileArtifactRebuildResponse {
    async_task_id: string;
}

export type TCompileArtifactListResponse = TableResponseData<TCompileArtifactItem>;
