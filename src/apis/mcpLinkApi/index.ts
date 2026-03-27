import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type { McpStatusResponse, StartMcpRequest } from './type';

// 查询状态 mcp 链接状态
const getMcpStatusApi = (): Promise<ResponseData<McpStatusResponse>> =>
    axios.get<never, ResponseData<McpStatusResponse>>('/admin/mcp/status');

// 启动 /停止 Mcp
const postStartMcpApi = (
    params: StartMcpRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/admin/mcp/control', params);

export { getMcpStatusApi, postStartMcpApi };
