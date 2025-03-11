interface TAllCodecMethodsParams {
    Name: string;
    Type:
        | 'input'
        | 'select'
        | 'checkbox'
        | 'search'
        | 'monaco'
        | 'inputSelect'
        | 'text';
    Options: Array<string>;
    items: string;
    Required: boolean;
    Desc: string;
    Regex: string;
    Label: string;
    DefaultValue: string;
    Connector: TAllCodecMethodsParams;
}
interface TGetAllCodecMethodsResponse {
    CodecMethod: string;
    CodecName: string;
    Desc: string;
    Params: TAllCodecMethodsParams[] | null;
    Tag: string;
}

export type { TGetAllCodecMethodsResponse, TAllCodecMethodsParams };
