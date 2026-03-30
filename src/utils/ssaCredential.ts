import type {
    TSSACredential,
    TSSACredentialKind,
} from '@/apis/SSACredentialApi/type';

export type TProjectAuthKind = 'none' | TSSACredentialKind;

export const normalizeProjectAuthKind = (kind?: string): TProjectAuthKind => {
    switch ((kind || '').trim().toLowerCase()) {
        case 'basic':
        case 'password':
            return 'password';
        case 'ssh':
        case 'ssh_key':
            return 'ssh_key';
        case 'token':
            return 'token';
        default:
            return 'none';
    }
};

export const getProjectAuthKindLabel = (kind?: string): string => {
    switch (normalizeProjectAuthKind(kind)) {
        case 'password':
            return '用户名/密码';
        case 'ssh_key':
            return 'SSH 私钥';
        case 'token':
            return 'Access Token';
        default:
            return '无需认证';
    }
};

export const buildCredentialAuthFormValue = (
    credential: TSSACredential,
): Record<string, any> => ({
    kind: credential.kind,
    credential_id: credential.id,
    credential_name: credential.name,
    secret_hint: credential.secret_hint,
    user_name:
        credential.user_name ||
        (credential.kind === 'ssh_key' || credential.kind === 'token'
            ? 'git'
            : undefined),
    password: undefined,
    key_content: undefined,
    secret_set: true,
});

export const getSecretPlaceholder = (
    kind: TProjectAuthKind,
    secretSet: boolean,
): string => {
    if (secretSet) {
        return '已保存，留空保持不变';
    }
    switch (kind) {
        case 'password':
            return '请输入密码';
        case 'token':
            return '请输入 Access Token';
        case 'ssh_key':
            return '-----BEGIN OPENSSH PRIVATE KEY-----...';
        default:
            return '';
    }
};
