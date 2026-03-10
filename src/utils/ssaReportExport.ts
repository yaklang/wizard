import html2pdf from 'html2pdf.js';
import { saveFile } from '@/utils';

const INVALID_FILENAME_PATTERN = /[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g;

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

export const exportSSAReportToPDF = async (
    html: string,
    reportName?: string,
) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.pdf`;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-100000px';
    container.style.top = '0';
    container.style.width = '980px';
    container.style.zIndex = '-1';
    container.innerHTML = extractReportBody(html);
    document.body.appendChild(container);

    try {
        await new Promise<void>((resolve) => {
            window.setTimeout(() => resolve(), 80);
        });
        await html2pdf().from(container).set(pdfOptions(fileName)).save();
    } finally {
        document.body.removeChild(container);
    }
};

export const saveSSAReportDocx = (content: Blob, reportName?: string) => {
    const fileName = `${sanitizeSSAReportFileName(reportName)}.docx`;
    const blob =
        content instanceof Blob
            ? content
            : new Blob([content], {
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              });
    saveFile(blob, fileName);
};
