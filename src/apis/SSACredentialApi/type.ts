export type TSSACredentialKind = 'password' | 'ssh_key' | 'token';

export interface TSSACredential {
    id: number;
    name: string;
    kind: TSSACredentialKind;
    description?: string;
    user_name?: string;
    secret_hint?: string;
    secret_set: boolean;
    created_at?: number;
    updated_at?: number;
    last_used_at?: number;
}

export interface TSSACredentialRequest {
    name: string;
    kind: TSSACredentialKind;
    description?: string;
    user_name?: string;
    secret?: string;
}
