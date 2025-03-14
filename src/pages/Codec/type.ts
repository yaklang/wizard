import type { TGetAllCodecMethodsResponse } from '@/apis/CodecApi/type';

interface TGetAllCodecMethodsResponseWithId
    extends TGetAllCodecMethodsResponse {
    id: string; // 添加 id 字段
    breakpoint: boolean; // 是否开启断点
    enable: boolean; // 是否 启用
}

interface TDataIntegration {
    workflow: TGetAllCodecMethodsResponseWithId[];
    auto: boolean;
    text: string;
    rowResult: string;
}

export type { TGetAllCodecMethodsResponseWithId, TDataIntegration };
