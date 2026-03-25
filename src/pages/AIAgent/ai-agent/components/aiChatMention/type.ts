import type { AITool } from '../../type/aiTool';
import type { AIForge } from '../../type/forge';
import type { AIMentionTabsEnum, iconMap } from '../../defaultConstant';
import type { AIMentionCommandParams } from '../aiMilkdownInput/aiMilkdownMention/aiMentionPlugin';

export type AIMentionTypeItem = AIMentionCommandParams['mentionType'];
export type iconMapType = keyof typeof iconMap;
export interface AIChatMentionSelectItem {
    id: string;
    name: string;
}
export interface AIChatMentionProps {
    defaultActiveTab?: AIMentionTabsEnum;
    onSelect: (
        type: AIMentionTypeItem,
        value?: AIChatMentionSelectItem,
    ) => void;
    filterMode?: `${AIMentionTabsEnum}`[];
}
interface AIChatMention {
    keyWord: string;
    getContainer: () => HTMLElement | null;
}
export interface AIChatMentionListRefProps {
    onRefresh: () => void;
}
interface AIChatMentionRef {
    ref?: React.ForwardedRef<AIChatMentionListRefProps>;
}
export interface ForgeNameListOfMentionProps
    extends AIChatMention,
        AIChatMentionRef {
    onSelect: (f: AIForge) => void;
}

export interface ToolListOfMentionProps
    extends AIChatMention,
        AIChatMentionRef {
    onSelect: (f: AITool) => void;
}

export interface KnowledgeBaseListOfMentionProps
    extends AIChatMention,
        AIChatMentionRef {
    onSelect: (f: any) => void;
}

export interface AIMentionSelectItemProps {
    isActive: boolean;
    item: AIChatMentionSelectItem;
    onSelect: () => void;
}
export interface FileSystemTreeOfMentionProps {
    onSelect: (path: string, isFolder: boolean) => void;
}

export interface FocusModeOfMentionProps
    extends AIChatMention,
        AIChatMentionRef {
    onSelect: (v: any) => void;
}
