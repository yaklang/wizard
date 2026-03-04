import { useContext } from 'react';
import type { ChatIPCContextStore } from './ChatIPCContent';
import ChatIPCContext from './ChatIPCContent';

export default function useChatIPCStore(): ChatIPCContextStore {
    const { store } = useContext(ChatIPCContext);
    return store;
}
