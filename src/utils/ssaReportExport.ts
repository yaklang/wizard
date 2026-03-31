import { saveFile } from '@/utils';

const INVALID_FILENAME_PATTERN = /[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g;

export interface TSSAReportExportProgress {
    percent: number;
    message: string;
}

export const SSA_REPORT_RECORD_CREATED_EVENT =
    'irify:ssa-report-record-created';
export const SSA_LAST_REPORT_RECORD_STORAGE_KEY =
    'irify:last-ssa-report-record-id';

interface TSSAReportExportStageOptions {
    startPercent: number;
    maxPercent: number;
    startMessage: string;
    activeMessage?: string;
    intervalMs?: number;
}

type TSSAReportExportProgressHandler = (
    progress: TSSAReportExportProgress,
) => void;

export const sanitizeSSAReportFileName = (name?: string) => {
    const baseName = (name || 'ssa-risk-report')
        .trim()
        .replace(INVALID_FILENAME_PATTERN, '_')
        .replace(/^[_\-.]+|[_\-.]+$/g, '');
    return baseName || 'ssa-risk-report';
};

const reportProgress = (
    onProgress: TSSAReportExportProgressHandler | undefined,
    percent: number,
    message: string,
) => {
    onProgress?.({ percent, message });
};

export const runSSAReportExportStage = async <T>(
    task: () => Promise<T>,
    options: TSSAReportExportStageOptions,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const {
        startPercent,
        maxPercent,
        startMessage,
        activeMessage = startMessage,
        intervalMs = 900,
    } = options;

    let currentPercent = Math.max(0, Math.min(100, startPercent));
    const cappedPercent = Math.max(currentPercent, Math.min(100, maxPercent));
    reportProgress(onProgress, currentPercent, startMessage);

    const timer = window.setInterval(() => {
        if (currentPercent >= cappedPercent) {
            return;
        }
        const remaining = cappedPercent - currentPercent;
        const step = Math.max(1, Math.ceil(remaining * 0.18));
        currentPercent = Math.min(cappedPercent, currentPercent + step);
        reportProgress(onProgress, currentPercent, activeMessage);
    }, intervalMs);

    try {
        return await task();
    } finally {
        window.clearInterval(timer);
    }
};

export const notifySSAReportRecordCreated = (recordId?: number | null) => {
    if (!recordId || recordId <= 0) {
        return;
    }
    try {
        window.localStorage.setItem(
            SSA_LAST_REPORT_RECORD_STORAGE_KEY,
            String(recordId),
        );
    } catch {}

    window.dispatchEvent(
        new CustomEvent(SSA_REPORT_RECORD_CREATED_EVENT, {
            detail: { recordId },
        }),
    );
};

const saveSSAReportBlob = (
    content: Blob,
    reportName: string | undefined,
    ext: 'pdf' | 'docx',
    mimeType: string,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.${ext}`;
    const blob =
        content instanceof Blob
            ? content
            : new Blob([content], { type: mimeType });
    reportProgress(
        onProgress,
        92,
        ext === 'pdf' ? '正在写入 PDF 文件...' : '正在写入 Word 文件...',
    );
    saveFile(blob, fileName);
    reportProgress(
        onProgress,
        100,
        ext === 'pdf' ? 'PDF 导出完成' : 'Word 导出完成',
    );
};

export const saveSSAReportPdf = (
    content: Blob,
    reportName?: string,
    onProgress?: TSSAReportExportProgressHandler,
) =>
    saveSSAReportBlob(
        content,
        reportName,
        'pdf',
        'application/pdf',
        onProgress,
    );

export const saveSSAReportDocx = (
    content: Blob,
    reportName?: string,
    onProgress?: TSSAReportExportProgressHandler,
) =>
    saveSSAReportBlob(
        content,
        reportName,
        'docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        onProgress,
    );
