import type {
    TAllCodecMethodsParams,
    TGetAllCodecMethodsResponse,
    TPostRunCodecResponseWorkflow,
} from '@/apis/CodecApi/type';
import type { TGetAllCodecMethodsResponseWithId } from '../type';
import { match } from 'ts-pattern';

type CodecGroup = Record<string, TGetAllCodecMethodsResponse[]>;

const groupedCodecs = (codecs: TGetAllCodecMethodsResponse[]): CodecGroup =>
    codecs.reduce((acc: CodecGroup, item) => {
        return {
            ...acc,
            [item.Tag]: (acc[item.Tag] || []).concat(item),
        };
    }, {});

type THeadOperateCodecType<T> = (preValue: T[], item: T) => T[];

const headOperateCodecType: THeadOperateCodecType<
    TGetAllCodecMethodsResponse
> = (preValue, item) => {
    const isCollect = preValue.some(
        (items) => items.CodecMethod === item.CodecMethod,
    );

    const resultCollectList = isCollect
        ? preValue.filter((items) => items.CodecMethod !== item.CodecMethod)
        : preValue.concat(item);

    return resultCollectList;
};

const codecBgColorFn = (
    item: TGetAllCodecMethodsResponseWithId,
): { background: string; borderBottom: string } => {
    return match([item.enable, item.breakpoint])
        .with([true, false], () => ({
            background: '#f8f8f8',
            borderBottom: '#eaecf3',
        }))
        .with([false, true], () => ({
            background: '#FCE3E1',
            borderBottom: '#FBD5D2',
        }))
        .with([false, false], () => ({
            background: '#DDF4E9',
            borderBottom: '#CCEEDE',
        }))
        .run();
};

const addDefaultValue = (
    type: TAllCodecMethodsParams['Type'],
    defaultValue: TAllCodecMethodsParams['DefaultValue'],
) => {
    if (type === 'checkbox') {
        return defaultValue ?? false;
    } else {
        return defaultValue ?? '';
    }
};

const transformData = (
    data: TGetAllCodecMethodsResponseWithId[],
): TPostRunCodecResponseWorkflow[] =>
    data
        .filter(({ enable }) => !enable) // 先去掉 enable 为 true 的数据
        .reduce<{ result: TPostRunCodecResponseWorkflow[]; stopped: boolean }>(
            ({ result, stopped }, { CodecMethod, Params, breakpoint }) =>
                stopped
                    ? { result, stopped } // 如果已经遇到 breakpoint，则不再处理
                    : {
                          result: [
                              ...result,
                              {
                                  codeType: CodecMethod,
                                  params: (Params ?? []).flatMap(
                                      ({ Name, DefaultValue, Connector }) => [
                                          {
                                              key: Name,
                                              value: DefaultValue,
                                              explain: '',
                                          },
                                          ...(Connector?.DefaultValue !==
                                          undefined
                                              ? [
                                                    {
                                                        key: `${Name}Type`,
                                                        value: Connector.DefaultValue,
                                                        explain: '',
                                                    },
                                                ]
                                              : []),
                                      ],
                                  ),
                              },
                          ],
                          stopped: breakpoint, // 碰到 breakpoint，后续不再处理
                      },
            { result: [], stopped: false },
        ).result;

const validateData = (data: TPostRunCodecResponseWorkflow[]): string | null =>
    data.reduce<string | null>((acc, { codeType, params }) => {
        if (acc) return acc; // 已经找到空值，终止执行
        const emptyParam = params.find(
            ({ value }) => typeof value === 'string' && value === '',
        );
        return emptyParam ? `${codeType} - ${emptyParam.key}: 为必填项` : null;
    }, null);

export {
    groupedCodecs,
    headOperateCodecType,
    codecBgColorFn,
    transformData,
    addDefaultValue,
    validateData,
};
