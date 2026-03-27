/**
 * 列表请求里的分页、排序字段不应传给「按筛选全部删除」接口
 */
const DELETE_ALL_STRIP_KEYS = new Set([
    'page',
    'limit',
    'Ppge',
    'order',
    'order_by',
]);

/**
 * 组装 DELETE 请求体：delete_all + 当前表格筛选（与列表查询 filter 对齐，剔除分页排序）
 */
function buildDeleteAllBody(
    filter: Record<string, any> | undefined,
    extra?: Record<string, any>,
): Record<string, unknown> {
    const body: Record<string, unknown> = { delete_all: true };
    const merged = { ...(filter ?? {}), ...(extra ?? {}) };
    for (const [k, v] of Object.entries(merged)) {
        if (DELETE_ALL_STRIP_KEYS.has(k)) continue;
        if (v === undefined || v === '') continue;
        if (Array.isArray(v) && v.length === 0) continue;
        body[k] = v;
    }
    return body;
}

export { buildDeleteAllBody, DELETE_ALL_STRIP_KEYS };
