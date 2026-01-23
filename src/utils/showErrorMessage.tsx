import { message, Modal, Button } from 'antd';

const MAX_PREVIEW = 300; // characters to show inline
const MAX_ALLOWED = 20000; // max we will keep in memory/display

function toSafeString(err: any): string {
    if (err === null) return '';
    if (typeof err === 'string') return err;
    if (err instanceof Error) {
        // include message and first part of stack if present
        const stack = err.stack
            ? '\n' + err.stack.split('\n').slice(0, 5).join('\n')
            : '';
        return `${err.message || String(err)}${stack}`;
    }
    try {
        return JSON.stringify(err, null, 2);
    } catch (e) {
        try {
            return String(err);
        } catch (e2) {
            return '[无法将错误序列化为文本]';
        }
    }
}

export function showErrorMessage(err: any, title?: string) {
    const raw = toSafeString(err);
    const text =
        raw.length > MAX_ALLOWED
            ? raw.slice(0, MAX_ALLOWED) + '\n\n[已截断]'
            : raw;

    if (!text) {
        message.error('发生错误');
        return;
    }

    if (text.length <= MAX_PREVIEW) {
        message.error(text);
        return;
    }

    // long message: show truncated preview in message with a detail button
    const preview = text.slice(0, MAX_PREVIEW) + '…';

    // ensure older messages removed so preview is visible
    message.destroy();

    message.open({
        type: 'error',
        content: (
            <div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{preview}</div>
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <Button
                        type="link"
                        onClick={() => {
                            Modal.confirm({
                                title: title || '错误详情',
                                width: 840,
                                okText: '复制',
                                cancelText: '关闭',
                                onOk: async () => {
                                    try {
                                        await navigator.clipboard.writeText(
                                            text,
                                        );
                                    } catch (e) {
                                        // ignore
                                    }
                                },
                                content: (
                                    <div
                                        style={{
                                            maxHeight: '60vh',
                                            overflow: 'auto',
                                            whiteSpace: 'pre-wrap',
                                            userSelect: 'text',
                                        }}
                                    >
                                        {text}
                                    </div>
                                ),
                            });
                        }}
                    >
                        展开
                    </Button>
                </div>
            </div>
        ),
    });
}

export default showErrorMessage;
