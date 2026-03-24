import { useContext } from 'react';
import ChatIPCContext, {
    type ChatIPCContextDispatcher,
} from './ChatIPCContent';

export default function useChatIPCDispatcher(): ChatIPCContextDispatcher {
    const { dispatcher } = useContext(ChatIPCContext);
    return dispatcher;
}
