import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    getReverseConfigResponse,
    PostReverseConfigRequest,
} from './types';

const postReverseConfig = (
    data: PostReverseConfigRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/api/reverse/config', data);

const getReverseConfig = (): Promise<ResponseData<getReverseConfigResponse>> =>
    axios.get<never, ResponseData<getReverseConfigResponse>>('/api/reverse/config');

export { postReverseConfig, getReverseConfig };
