import type { LocalModelConfig } from '../type/aiModel';
import type { ThirdPartyApplicationConfig } from '@/components/configNetwork/ConfigNetworkPage';
import type { YakitSizeType } from '@/components/yakitUI/YakitInputNumber/YakitInputNumberType';

export interface SelectOptionsProps {
    label: string | React.Element;
    value: any;
    disabled?: boolean;
}
export interface AIModelListProps {
    [key: string]: never;
}

export type AIModelType = 'online' | 'local';

export interface AIOnlineModelListProps {
    ref: React.ForwardedRef<AIOnlineModelListRefProps>;
    setOnlineTotal: (total: number) => void;
    onAdd: () => void;
    mountContainer: HTMLElement | null;
}

export interface AIOnlineModelListRefProps {
    onRefresh: () => void;
    onRemoveAll: () => void;
}

export interface AILocalModelListProps {
    ref: React.ForwardedRef<AILocalModelListRefProps>;
    setLocalTotal: (total: number) => void;
}

export interface AILocalModelListRefProps {
    onRefresh: () => void;
}
export interface AILocalModelListItemProps {
    item: LocalModelConfig;
    onRefresh: () => void;
    currentPageTabRouteKey: string;
}
export interface AIOnlineModelListItemProps {
    item: ThirdPartyApplicationConfig;
    onRemove: (item: ThirdPartyApplicationConfig) => void;
    onEdit: (item: ThirdPartyApplicationConfig) => void;
}
export interface OutlineAtomIconByStatusProps {
    isReady?: boolean;
    isRunning?: boolean;
    iconClassName?: string;
    size?: YakitSizeType;
}
export interface AILocalModelListItemPromptHintProps {
    title: string;
    content: string;
    onOk: (b: boolean) => Promise;
    onCancel: () => void;
}

export interface AILocalModelListWrapperProps {
    title: string;
    list: LocalModelConfig[];
    onRefresh: () => void;
    currentPageTabRouteKey: string;
}
