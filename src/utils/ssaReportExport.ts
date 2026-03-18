import { saveFile } from '@/utils';

const INVALID_FILENAME_PATTERN = /[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g;

export interface TSSAReportExportProgress {
    percent: number;
    message: string;
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

const saveSSAReportBlob = (
    content: Blob,
    reportName: string | undefined,
    ext: 'pdf' | 'docx',
    mimeType: string,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.${ext}`;
    const blob =
        content instanceof Blob ? content : new Blob([content], { type: mimeType });
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
    saveSSAReportBlob(content, reportName, 'pdf', 'application/pdf', onProgress);

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

