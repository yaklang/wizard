import type { Selection } from '../RunnerTabs/RunnerTabsType';
import type { SSARisk } from '../YakRunnerAuditCodeType';
export interface BottomEditorDetailsProps {
    showItem?: ShowItemType;
    setShowItem: (v: ShowItemType) => void;
    isShowEditorDetails: boolean;
    setEditorDetails: (v: boolean) => void;
}

export type ShowItemType = 'ruleEditor' | 'holeDetail' | 'holeDispose';

export interface JumpToAuditEditorProps {
    isSelect?: boolean;
    selections: Selection;
    path: string;
}

export interface OutputInfoProps {
    outputCahceRef: React.MutableRefObject<string>;
    xtermRef: React.MutableRefObject<any>;
}

export interface AuditResultDescribeProps {
    info: SSARisk;
    columnSize?: number;
    isScroll?: boolean;
}

export interface RightBugAuditResultHeaderProps {
    info: SSARisk;
    extra?: React.ReactNode;
}
