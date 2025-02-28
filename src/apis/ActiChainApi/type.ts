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

interface TIcmpGenerateRequest {
    length: number;
    host: string;
}

interface TTcpGenerateRequest {
    token: string;
    port: number;
    host: string;
}

export type {
    TReverseDnsGenerateRequest,
    TReverseDnsGenerateResponse,
    TGetDnsQuryRequest,
    TIcmpGenerateRequest,
    TTcpGenerateRequest,
};
