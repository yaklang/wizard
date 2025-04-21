interface PostReverseConfigRequest {
    globalReverse: {
        address: string;
        pass: string;
    };
    publicReverse: {
        address: string;
        pass: string;
    };
}

interface getReverseConfigResponse extends PostReverseConfigRequest {
    status: boolean;
}

export type { PostReverseConfigRequest, getReverseConfigResponse };
