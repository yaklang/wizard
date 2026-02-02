export namespace StreamResult {
    export interface Log {
        level: string;
        data: string;
        [key: string]: any;
    }
}

export interface StreamResult {
    [key: string]: any;
}
