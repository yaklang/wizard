interface McpStatusResponse {
    command?: string;
    running: boolean;
    script?: string;
}

interface StartMcpRequest {
    action: 'start' | 'stop' | 'restart';
    transport?: string;
    host?: string;
    port?: number;
    base_url?: string;
}

export type { McpStatusResponse, StartMcpRequest };
