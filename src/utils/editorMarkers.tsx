/* eslint-disable max-nested-callbacks */
import type { MarkerSeverity, MarkerTag } from 'monaco-editor';
import {
    MarkerSeverity as MarkerSeverityValue,
    MarkerTag as MarkerTagValue,
} from 'monaco-editor';
import type { CodeRangeProps } from '@/pages/YakRunnerAuditCode/RightAuditDetail/RightAuditDetail';
/** name字段里面的内容不可随意更改，与查询条件有关 */
export const SeverityMapTag = [
    {
        key: ['info', 'fingerprint', 'infof', 'default'],
        value: 'title-info',
        name: '信息',
        tag: 'success',
    },
    { key: ['low'], value: 'title-low', name: '低危', tag: 'warning' },
    {
        key: ['middle', 'warn', 'warning', 'medium'],
        value: 'title-middle',
        name: '中危',
        tag: 'info',
    },
    { key: ['high'], value: 'title-high', name: '高危', tag: 'danger' },
    {
        key: ['fatal', 'critical', 'panic'],
        value: 'title-fatal',
        name: '严重',
        tag: 'serious',
    },
];
export interface IMonacoEditorMarker {
    message: string;
    severity: MarkerSeverity;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    tags: MarkerTag[];
}
function getAuditMarkerSeverity(name: string): MarkerSeverity {
    const severity = MarkerSeverityValue[name as keyof typeof MarkerSeverity];
    return severity !== undefined ? severity : MarkerSeverityValue.Hint;
}
function getMarkerTags(name: string): MarkerTag[] {
    const tag = MarkerTagValue[name as keyof typeof MarkerTag];
    return tag !== undefined ? [tag] : [];
}
export const ConvertAuditStaticAnalyzeErrorToMarker = (
    i: any,
): IMonacoEditorMarker | null => {
    try {
        const code_range: CodeRangeProps = JSON.parse(i.CodeRange);
        const title = SeverityMapTag.filter((item: any) =>
            item.key.includes(i.Severity || ''),
        )[0];
        let Severity = '';
        switch (title.name) {
            case '信息':
                Severity = 'Hint';
                break;
            case '低危':
                Severity = 'Info';
                break;
            case '中危':
                Severity = 'Warning';
                break;
            case '高危':
                Severity = 'Error';
                break;
            case '严重':
                Severity = 'Error';
                break;
        }
        return {
            message: i.Title.length > 0 ? i.Title : i.TitleVerbose || '',
            severity: getAuditMarkerSeverity(Severity),
            startLineNumber: parseInt(`${code_range.start_line}`, 10),
            startColumn: parseInt(`${code_range.start_column}`, 10),
            endLineNumber: parseInt(`${code_range.end_line}`, 10),
            endColumn: parseInt(`${code_range.end_column}`, 10),
            tags: getMarkerTags(''),
        };
    } catch (error) {
        return null;
    }
};
