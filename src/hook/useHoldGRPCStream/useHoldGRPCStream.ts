export const useHoldGRPCStream = (props: any) => {
    const streamInfo = {
        logState: [] as any[],
        progressState: [] as any[],
    };

    void props;

    const debugPluginStreamEvent = {
        stop: () => {},
        start: () => {},
        cancel: () => {},
        reset: () => {},
    };

    return [streamInfo, debugPluginStreamEvent] as const;
};

export default useHoldGRPCStream;
