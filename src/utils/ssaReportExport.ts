import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { saveFile } from '@/utils';

const INVALID_FILENAME_PATTERN = /[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g;
const BODY_SELECTOR_PATTERN = /\bbody\b/g;

export interface TSSAReportExportProgress {
    percent: number;
    message: string;
}

type TSSAReportExportProgressHandler = (
    progress: TSSAReportExportProgress,
) => void;

const resolveSSAPDFScale = (htmlLength: number) => {
    if (htmlLength > 500000) {
        return 0.4;
    }
    if (htmlLength > 200000) {
        return 0.5;
    }
    if (htmlLength > 80000) {
        return 0.6;
    }
    if (htmlLength > 30000) {
        return 0.8;
    }
    return 1;
};

const pdfOptions = (filename: string, scale: number) => ({
    margin: [10, 5, 10, 5],
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    jsPDF: {
        format: 'a4',
    },
    html2canvas: {
        scale,
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

const normalizeSSAReportHTMLForPDF = (html: string) => {
    const trimmedHTML = html.trim();
    if (!trimmedHTML) {
        return html;
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(trimmedHTML, 'text/html');
    const bodyMarkup = parsed.body?.innerHTML?.trim();
    const styleMarkup = Array.from(parsed.head?.querySelectorAll('style') || [])
        .map((styleNode) => {
            const clonedNode = styleNode.cloneNode(true) as HTMLStyleElement;
            clonedNode.textContent = (clonedNode.textContent || '').replace(
                BODY_SELECTOR_PATTERN,
                '.ssa-export-root',
            );
            return clonedNode.outerHTML;
        })
        .join('\n');
    const linkMarkup = Array.from(
        parsed.head?.querySelectorAll('link[rel="stylesheet"]') || [],
    )
        .map((linkNode) => linkNode.outerHTML)
        .join('\n');

    if (!bodyMarkup) {
        return html;
    }

    return `
        <style>
            .ssa-export-root {
                display: block;
                width: 100%;
            }
        </style>
        ${styleMarkup}
        ${linkMarkup}
        <div class="ssa-export-root">${bodyMarkup}</div>
    `;
};

export const exportSSAReportToPDF = async (
    html: string,
    reportName?: string,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.pdf`;
    const blob = await buildSSAReportPDFBlob(html, fileName, onProgress);
    saveAs(blob, fileName);
    reportProgress(onProgress, 100, 'PDF 导出完成');
};

export const buildSSAReportPDFBlob = async (
    html: string,
    fileName: string,
    onProgress?: TSSAReportExportProgressHandler,
) => {
    const normalizedHTML = normalizeSSAReportHTMLForPDF(html);
    const renderScale = resolveSSAPDFScale(normalizedHTML.length);

    reportProgress(onProgress, 15, '正在准备 PDF 布局...');
    await waitForExportLayout();

    const worker = html2pdf()
        .set(pdfOptions(fileName, renderScale))
        .from(normalizedHTML, 'string');

    await worker.toContainer();
    reportProgress(onProgress, 38, '正在整理报告页面...');

    await worker.toCanvas();
    reportProgress(onProgress, 72, '正在渲染 PDF 页面...');

    await worker.toPdf();
    reportProgress(onProgress, 90, '正在写入 PDF 文件...');

    return (await worker.outputPdf('blob')) as Blob;
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
