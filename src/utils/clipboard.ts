import { yakitNotify } from './notification';

interface SetClipboardTextExtraParams {
    hiddenHint?: boolean;
    hintText?: string;
    successCallback?: () => void;
    failedCallback?: () => void;
    finalCallback?: () => void;
}

export const setClipboardText = async (
    text?: string,
    extra?: SetClipboardTextExtraParams,
) => {
    const {
        hiddenHint,
        hintText,
        successCallback,
        failedCallback,
        finalCallback,
    } = extra || {};

    if (!text) {
        finalCallback?.();
        return;
    }

    try {
        // ✅ 优先使用现代 API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // ✅ 兼容旧浏览器
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        if (!hiddenHint) {
            yakitNotify('success', hintText || '复制成功');
        }

        successCallback?.();
    } catch (err) {
        failedCallback?.();
    } finally {
        finalCallback?.();
    }
};
