import type { Rule } from 'antd/es/form';

const SUPPORTED_REPOSITORY_URL_PATTERNS = [
    /^https?:\/\//i,
    /^ssh:\/\//i,
    /^svn:\/\//i,
    /^svn\+ssh:\/\//i,
    /^git@[^:]+:.+/i,
];

export const isSupportedRepositoryUrl = (value?: string): boolean => {
    const candidate = String(value || '').trim();
    if (!candidate) {
        return false;
    }
    return SUPPORTED_REPOSITORY_URL_PATTERNS.some((pattern) =>
        pattern.test(candidate),
    );
};

export const buildRepositoryUrlRules = (
    emptyMessage = '请输入仓库地址',
): Rule[] => [
    {
        required: true,
        message: emptyMessage,
    },
    {
        validator: async (_, value) => {
            if (!value || isSupportedRepositoryUrl(value)) {
                return;
            }
            throw new Error('请输入有效的仓库地址，支持 HTTP(S) / SSH');
        },
    },
];
