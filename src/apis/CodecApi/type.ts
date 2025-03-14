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
    DefaultValue: string | boolean;
    Connector: TAllCodecMethodsParams;
    id: string;
}
interface TGetAllCodecMethodsResponse {
    CodecMethod: string;
    CodecName: string;
    Desc: string;
    Params: TAllCodecMethodsParams[] | null;
    Tag: string;
}

interface TPostRunCodecResponse {
    text: string;
    auto: boolean;
    workflow: TPostRunCodecResponseWorkflow[];
}

interface TPostRunCodecResponseWorkflow {
    codeType: string;
    params: Param[];
}

interface Param {
    key: string;
    value: string | boolean;
    explain: string;
}

export type {
    TGetAllCodecMethodsResponse,
    TAllCodecMethodsParams,
    TPostRunCodecResponse,
    TPostRunCodecResponseWorkflow,
};
