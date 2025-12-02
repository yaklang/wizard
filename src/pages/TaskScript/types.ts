import type { GetAnalysisScriptResponse } from '@/apis/task/types';

export interface ScriptGroupOption {
    value: string;
    label: string;
}

export interface TaskScriptListItem extends GetAnalysisScriptResponse {
    isCopy?: boolean;
}
