/**
 * 统一序列化函数，解析 JSON 数据
 * @param {string} rawData - 原始 JSON 数据（可能多层转义）
 * @returns {object} - 解析后的对象
 */
const parseJSON = (rawData: string): object => {
    try {
        // 尝试直接反序列化（标准 JSON 数据）
        return JSON.parse(rawData);
    } catch {
        try {
            // 如果直接反序列化失败，尝试处理多层转义的情况
            let cleanedData = rawData.trim();

            // 如果数据以双引号包裹，尝试去掉外层引号
            if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
                cleanedData = cleanedData.slice(1, -1);
            }

            // 替换转义符号，处理多层嵌套结构
            cleanedData = cleanedData
                .replace(/\\n/g, '') // 去除换行符
                .replace(/\\"/g, '"') // 转义双引号替换为普通双引号
                .replace(/\\\\/g, '\\'); // 转义反斜杠替换为普通反斜杠

            return JSON.parse(cleanedData);
        } catch (nestedError: unknown) {
            if (nestedError instanceof Error) {
                // 如果是标准的 Error 对象，获取其 message 属性
                throw new Error(`Failed to parse JSON: ${nestedError.message}`);
            } else {
                // 如果不是标准 Error 对象，直接输出其字符串化结果
                throw new Error(`Failed to parse JSON: ${String(nestedError)}`);
            }
        }
    }
};

export { parseJSON };
