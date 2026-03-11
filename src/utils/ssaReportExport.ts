import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { saveFile } from '@/utils';

const INVALID_FILENAME_PATTERN = /[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g;

export interface TSSAReportExportProgress {
    percent: number;
    message: string;
}

type TSSAReportExportProgressHandler = (
    progress: TSSAReportExportProgress,
) => void;

const pdfOptions = (filename: string) => ({
    margin: [10, 5, 10, 5],
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    jsPDF: {
        format: 'a4',
    },
    html2canvas: {
        scale: 1.2,
    },
    pagebreak: {
        after: '.hero',
    },
});

export const sanitizeSSAReportFileName = (name?: string) => {
    const baseName = (name || 'ssa-risk-report')
        .trim()
        .replace(INVALID_FILENAME_PATTERN, '_')
        .replace(/^[_\-.]+|[_\-.]+$/g, '');
    return baseName || 'ssa-risk-report';
};

const extractReportBody = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const styleNodes = Array.from(
        doc.head.querySelectorAll('style, link[rel="stylesheet"]'),
    );
    const headMarkup = styleNodes.map((node) => node.outerHTML).join('');
    const bodyMarkup = doc.body?.innerHTML?.trim() || html;
    return `${headMarkup}${bodyMarkup}`;
};

const reportProgress = (
    onProgress: TSSAReportExportProgressHandler | undefined,
    percent: number,
    message: string,
) => {
    onProgress?.({ percent, message });
};

const waitForExportLayout = async () => {
    await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => resolve());
        });
    });
    await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 120);
    });
};

export const exportSSAReportToPDF = async (
    html: string,
    reportName?: string,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.pdf`;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '980px';
    container.style.maxWidth = '980px';
    container.style.background = '#ffffff';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    container.innerHTML = extractReportBody(html);
    document.body.appendChild(container);

    try {
        reportProgress(onProgress, 15, '正在准备 PDF 布局...');
        await waitForExportLayout();

        const worker = html2pdf().set(pdfOptions(fileName)).from(container);

        await worker.toContainer();
        reportProgress(onProgress, 38, '正在整理报告页面...');

        await worker.toCanvas();
        reportProgress(onProgress, 72, '正在渲染 PDF 页面...');

        await worker.toPdf();
        reportProgress(onProgress, 90, '正在写入 PDF 文件...');

        const blob = (await worker.outputPdf('blob')) as Blob;
        saveAs(blob, fileName);
        reportProgress(onProgress, 100, 'PDF 导出完成');
    } finally {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
};

export const saveSSAReportDocx = (
    content: Blob,
    reportName?: string,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.docx`;
    const blob =
        content instanceof Blob
            ? content
            : new Blob([content], {
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              });
    reportProgress(onProgress, 92, '正在写入 Word 文件...');
    saveFile(blob, fileName);
    reportProgress(onProgress, 100, 'Word 导出完成');
};
