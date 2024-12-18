interface TCveQueryRequest {
    cpe?: string[];
    CPEVersion?: { [key: string]: any };
    cve?: string;
    CVEExploitabilityScore?: { [key: string]: any };
    CVEImpactScore?: { [key: string]: any };
    CVELastModifiedTime?: { [key: string]: any };
    CVEPublishedTime?: { [key: string]: any };
    CVESeverity?: { [key: string]: any };
    cvssV2Scope?: { [key: string]: any };
    cwe?: string;
    keyword?: string[];
    Order?: { [key: string]: any };
    limit: number;
    page: number;
    total: number;
    total_page: number;
    order?: string;
    order_by?: string;
}

/**
 * CVEList，CVE 列表
 *
 * CVE，CVE 的具体内容
 */
interface TCveQueryResponse {
    /**
     * 攻击复杂度
     */
    access_complexity: string;
    /**
     * 攻击路径
     */
    access_vector: string;
    /**
     * 需要的认证情况
     */
    authentication: string;
    /**
     * 可用性影响
     */
    availability_impact: string;
    /**
     * CVSS 评分
     */
    base_cvss_v2_score: number;
    /**
     * 泄密影响
     */
    confidentiality_impact: string;
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
     * 精确搜索，如果为 True，表明搜索结果应该是准确的，如果为 False 说明可能不准确
     */
    exact_search: boolean;
    /**
     * 利用评分
     */
    exploitability_score: number;
    /**
     * CVE 的搜索来源
     */
    from: string;
    /**
     * 影响评分
     */
    impact_score: number;
    /**
     * 完整性影响
     */
    integrity_impact: string;
    /**
     * 最近修改日期
     */
    last_modified_date: string;
    /**
     * 是否可以获取所有权限
     */
    obtain_all_privilege: boolean;
    /**
     * 是否可以获取其他权限
     */
    obtain_other_privilege: boolean;
    /**
     * 是否可以获取用户权限
     */
    obtain_user_privilege: boolean;
    /**
     * 发布日期
     */
    published_date: string;
    /**
     * 严重程度
     */
    severity: string;
    /**
     * 是否需要用户交互利用
     */
    user_interaction_required: boolean;
    vulnerable_product: string;
}

export type { TCveQueryRequest, TCveQueryResponse };
