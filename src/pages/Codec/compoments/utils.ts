import type {
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

const transformData = (
    data: TGetAllCodecMethodsResponseWithId[],
): TPostRunCodecResponseWorkflow[] =>
    data.map(({ CodecMethod, Params }) => ({
        codeType: CodecMethod,
        params: (Params ?? []).flatMap(({ Name, DefaultValue, Connector }) => [
            {
                key: Name,
                value: DefaultValue,
                explain: '',
            },
            ...(Connector?.DefaultValue !== undefined
                ? [
                      {
                          key: `${Name}Type`,
                          value: Connector.DefaultValue,
                          explain: '',
                      },
                  ]
                : []),
        ]),
    }));

export { groupedCodecs, headOperateCodecType, codecBgColorFn, transformData };
