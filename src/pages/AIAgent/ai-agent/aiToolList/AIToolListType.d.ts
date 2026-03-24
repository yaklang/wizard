import type { AITool } from '../type/aiTool';

export interface AIToolListProps {
    [key: string]: never;
}
export type ToolQueryType = 'all' | 'collect';

export interface AIToolListItemProps {
    item: AITool;
    onSetData: (value: AITool) => void;
    onRefresh: () => void;
    onSelect: (value: AITool) => void;
}
