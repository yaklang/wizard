import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
// import type { CreateSessionResponse } from './types';

// 创建会话
const createSession = (): Promise<ResponseData<string>> =>
    axios.post<never, ResponseData<string>>('/agent/session');

export { createSession };
