import { useCreation, useMemoizedFn } from 'ahooks';
import type { AIOutputI18n } from './grpcApi';

function useAINodeLabel(params?: AIOutputI18n) {
    const nodeLabel = useCreation(() => {
        return params ? params.Zh : '';
    }, [params]);
    const getLabelByParams = useMemoizedFn((value: AIOutputI18n) => {
        return value.Zh || '';
    });
    return { nodeLabel, getLabelByParams };
}

export default useAINodeLabel;
