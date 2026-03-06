import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TCompileArtifactSummary,
    TCompileArtifactListParams,
    TCompileArtifactListResponse,
    TCompileArtifactDetail,
    TCompileArtifactRebuildRequest,
    TCompileArtifactRebuildResponse,
} from './type';

const unwrapNestedResponse = <T>(
    response: ResponseData<any>,
): ResponseData<T> => {
    const nested = response?.data;
    if (
        nested &&
        typeof nested === 'object' &&
        'code' in nested &&
        'data' in nested
    ) {
        return {
            ...response,
            data: nested.data as T,
        };
    }
    return response as ResponseData<T>;
};

const queryCompileArtifactSummary = (): Promise<
    ResponseData<TCompileArtifactSummary>
> =>
    axios.get<never, ResponseData<TCompileArtifactSummary>>(
        '/ssa/compile-artifacts/summary',
    ).then((response) => unwrapNestedResponse<TCompileArtifactSummary>(response));

const queryCompileArtifacts = (
    params?: TCompileArtifactListParams,
): Promise<ResponseData<TCompileArtifactListResponse>> =>
    axios.get<never, ResponseData<TCompileArtifactListResponse>>(
        '/ssa/compile-artifacts',
        { params },
    ).then((response) =>
        unwrapNestedResponse<TCompileArtifactListResponse>(response),
    );

const fetchCompileArtifactDetail = (
    seriesKey: string,
): Promise<ResponseData<TCompileArtifactDetail>> =>
    axios.get<never, ResponseData<TCompileArtifactDetail>>(
        '/ssa/compile-artifacts/detail',
        { params: { series_key: seriesKey } },
    ).then((response) => unwrapNestedResponse<TCompileArtifactDetail>(response));

const forceRebuildCompileArtifact = (
    data: TCompileArtifactRebuildRequest,
): Promise<ResponseData<TCompileArtifactRebuildResponse>> =>
    axios.post<never, ResponseData<TCompileArtifactRebuildResponse>>(
        '/ssa/compile-artifacts/rebuild',
        data,
    ).then((response) =>
        unwrapNestedResponse<TCompileArtifactRebuildResponse>(response),
    );

export {
    queryCompileArtifactSummary,
    queryCompileArtifacts,
    fetchCompileArtifactDetail,
    forceRebuildCompileArtifact,
};
