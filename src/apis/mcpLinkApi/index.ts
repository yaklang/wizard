import axios from '@/utils/axios'
import type { ResponseData } from '@/utils/commonTypes'
import type { McpStatusResponse, StartMcpRequest } from './type'

// 查询状态 mcp 链接状态
// 后端路由为 /api/admin/mcp/status，vite proxy 按 /api 前缀转发
const getMcpStatusApi = (): Promise<ResponseData<McpStatusResponse>> =>
  axios.get<never, ResponseData<McpStatusResponse>>('/api/admin/mcp/status')

// 启动 /停止 Mcp
const postStartMcpApi = (params: StartMcpRequest): Promise<ResponseData<boolean>> =>
  axios.post<never, ResponseData<boolean>>('/api/admin/mcp/control', params)

export { getMcpStatusApi, postStartMcpApi }
