interface QueryPalmCVEDatabaseParam {
    page?: number;
    limit?: number;

    keyword?: string;
    version?: string;
    cpe?: string;
    cve?: string;
    cwe?: string;
    cvss_v2_score?: number;
    cve_severity?: string;
    cve_exploitability_score?: number;
    cve_impact_score?: number;

    // timestamp
    cve_published_time?: number;
    cve_last_modified_time?: number;

    order_by?:
        | 'impact_score'
        | 'cvss_v2_base_score'
        | 'exploitability_score'
        | 'published_time'
        | 'last_modified_time';
    order?: 'asc' | 'desc';
}

interface PalmGeneralQueryParams {
    page?: number;
    limit?: number;
    order?: 'desc' | 'asc';
    order_by?: 'created_at' | 'updated_at' | string;
}

interface QueryHTTPResponsesParams extends PalmGeneralQueryParams {
    method?: string;
    url?: string;
    schema?: string;
    search_request_body?: string;
    search_packet?: string;
    tags?: string;
    title?: string;
    host?: string;
    network?: string;
}

interface QueryHTTPRequestsParams extends PalmGeneralQueryParams {
    network?: string;
    host?: string;
    port?: string;
    method?: string;
    url?: string;
    schema?: string;
    search_packets?: string;
    tags?: string;
}

interface QueryAssetsDomainParams extends PalmGeneralQueryParams {
    domains?: string;
    hosts?: string;
    tags?: string;
}

interface QueryAssetsPortParams extends PalmGeneralQueryParams {
    order_by?: 'created_at' | 'updated_at' | 'ports';
    hosts?: string;
    ports?: string;
    tags?: string;
    cpes?: string;
    fingerprint?: string;
    reason?: string;
    state?: string;
    services?: string;
}

interface QueryRssBriefingsParams extends PalmGeneralQueryParams {
    search?: string;
    source_xml_url?: string;
    title?: string;
    title_startswith?: string;
    from?: number;
    to?: number;
    tags?: string;
}

// type TRowType =
//     | 'report-cover'
//     | 'bar-graph'
//     | 'pie-graph'
//     | 'risk-list'
//     | 'search-json-table'
//     | 'bar-graph'
//     | 'potential-risks-list'
//     | 'info-risk-list'
//     | 'fix-list'
//     | 'fix-array-list';

type TimelineReportBlockData =
    | { type: 'markdown'; data: string }
    | { type: 'graph_name'; data: string }
    | { type: 'graph_source'; data: { name: string; source: string } }
    | { type: 'active_graph_name'; data: string }
    | { type: 'graph'; data: number }
    | { type: 'json'; data: { title: string; raw: any } }
    | { type: 'json-table'; data: string }
    | { type: 'search-json-table'; data: string }
    | {
          type: 'asset-rss';
          data: { active: boolean; filter: QueryRssBriefingsParams };
      }
    | {
          type: 'asset-port';
          data: { active: boolean; filter: QueryAssetsPortParams };
      }
    | {
          type: 'asset-domain';
          data: { active: boolean; filter: QueryAssetsDomainParams };
      }
    | {
          type: 'asset-http-request';
          data: { active: boolean; filter: QueryHTTPRequestsParams };
      }
    | {
          type: 'asset-http-response';
          data: { active: boolean; filter: QueryHTTPResponsesParams };
      }
    | {
          type: 'asset-cve';
          data: { active: boolean; filter: QueryPalmCVEDatabaseParam };
      }
    | { type: 'raw'; data: string };

// 报告模版最外层数据类型结构
interface TReportTemplateProps {
    blocks: TimelineReportBlockData[];
    width?: number;
    divRef: React.RefObject<HTMLDivElement>;
}

type BlockType = TReportTemplateProps['blocks'][number];

/**
 * @name 报告-json数据类型种类
 */
interface ReportJsonKindData {
    /**
     * @name 柱状图
     */
    'bar-graph': {
        color: string[];
        data: { name: string; value: number }[];
        type: string;
        title?: string;
    };
    /**
     * @name 报告封面
     */
    'report-cover': {
        type: string;
        data: 'critical' | 'high' | 'warning' | 'low' | 'security';
    };
}

export type {
    TReportTemplateProps,
    BlockType,
    TimelineReportBlockData,
    ReportJsonKindData,
};
