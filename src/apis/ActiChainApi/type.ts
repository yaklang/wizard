interface TReverseDnsGenerateRequest {
    address?: string;
    secret?: string;
    dnsMode: string;
    UseLocal?: boolean;
    token?: string;
}

interface TReverseDnsGenerateResponse {
    domain: string;
    token: string;
}

interface TGetDnsQuryRequest {
    token: string;
    dnsMode: string;
    UseLocal: boolean;
}

export type {
    TReverseDnsGenerateRequest,
    TReverseDnsGenerateResponse,
    TGetDnsQuryRequest,
};
