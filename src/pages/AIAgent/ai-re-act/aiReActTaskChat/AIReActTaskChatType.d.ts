export interface AIReActTaskChatProps {
    setShowFreeChat: (show: boolean) => void;
    setTimeLine: (show: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AIReActTaskChatContentProps {}

export interface AIReActTaskChatLeftSideProps {
    leftExpand: boolean;
    setLeftExpand: (v: boolean) => void;
}
