import { useDrop } from 'ahooks';
import { useRef, useState } from 'react';
import { yakitNotify } from '@/utils/notification';
import type { DragSource } from '@/pages/AIAgent/ai-agent/aiChatWelcome/type';
import { fetchIsFolderByPath } from '../utils';

export interface UseFileTreeDropOptions {
    onAddPath: (path: string, isFolder: boolean) => void;
}

export const useFileTreeDrop = (options: UseFileTreeDropOptions) => {
    const { onAddPath } = options;

    const [dragging, setDragging] = useState<boolean>(false);
    const [dragSource, setDragSource] = useState<DragSource>(null);

    const dropRef = useRef<HTMLDivElement | null>(null);

    useDrop(dropRef, {
        onDragEnter: () => {
            if (dragSource === 'AIRreeToChat') return;
            setDragging(true);
        },
        onDragLeave: () => {
            setDragging(false);
        },
        onDrop: () => {
            setDragging(false);
        },
        onFiles: async (files: File[]) => {
            try {
                setDragSource('desktopToAItree');

                for (const file of files) {
                    if (!('path' in file)) continue;

                    const fileWithPath = file as File & { path: string };
                    const fullPath = fileWithPath.path;

                    const isFolder = await fetchIsFolderByPath(fullPath);
                    if (isFolder !== null) {
                        onAddPath(fullPath, isFolder);
                    }
                }
            } catch {
                yakitNotify('error', '文件拖入失败，请重试');
            } finally {
                setDragSource(null);
            }
        },
    });

    return {
        dropRef,
        dragging,
        dragSource,
        setDragSource,
    };
};
