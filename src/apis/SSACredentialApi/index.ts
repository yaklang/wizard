import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type { TSSACredential, TSSACredentialRequest } from './type';

const normalizeCredentialListResponse = (
    raw: any,
): ResponseData<TSSACredential[]> => {
    const inner = raw?.data;
    if (
        inner &&
        typeof inner === 'object' &&
        Array.isArray(inner.list) &&
        'code' in inner
    ) {
        return {
            code: raw?.code ?? 200,
            data: inner.list,
            msg: raw?.msg ?? raw?.message ?? '',
        };
    }
    return raw;
};

const listSSACredentials = (params?: {
    kind?: string;
    q?: string;
}): Promise<ResponseData<TSSACredential[]>> =>
    axios
        .get<never, any>('/ssa/credentials', {
            params,
        })
        .then(normalizeCredentialListResponse);

const fetchSSACredential = (
    id: number,
): Promise<ResponseData<TSSACredential>> =>
    axios.get<never, ResponseData<TSSACredential>>(`/ssa/credentials/${id}`);

const createSSACredential = (
    data: TSSACredentialRequest,
): Promise<ResponseData<TSSACredential>> =>
    axios.post<never, ResponseData<TSSACredential>>('/ssa/credentials', data);

const updateSSACredential = (
    id: number,
    data: TSSACredentialRequest,
): Promise<ResponseData<TSSACredential>> =>
    axios.put<never, ResponseData<TSSACredential>>(
        `/ssa/credentials/${id}`,
        data,
    );

const deleteSSACredential = (
    id: number,
): Promise<ResponseData<{ deleted: boolean }>> =>
    axios.delete<never, ResponseData<{ deleted: boolean }>>(
        `/ssa/credentials/${id}`,
    );

export {
    listSSACredentials,
    fetchSSACredential,
    createSSACredential,
    updateSSACredential,
    deleteSSACredential,
};
