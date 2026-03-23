// import {fileToChatQuestionStore, useFileToQuestion} from "@/pages/ai-re-act/aiReActChat/store"
import { useMemo } from 'react';
import { usePageInfo } from '@/store/pageInfo';
import shallow from 'zustand/shallow';
import { YakitRoute } from '@/pages/AIAgent/enums/yakitRoute';

enum FileListStoreKey {
    FileList = 'fileList',
    Konwledge = 'konwledge',
}

export const routeKey = {
    [YakitRoute.AI_Agent]: FileListStoreKey.FileList,
    [YakitRoute.AI_REPOSITORY]: FileListStoreKey.Konwledge,
};

export const useGetStoreKey = () => {
    const currentRouteKey = usePageInfo(
        (state) => state.getCurrentPageTabRouteKey(),
        shallow,
    );
    const storeKey = useMemo(
        () => routeKey[currentRouteKey],
        [currentRouteKey],
    );
    return storeKey;
};
