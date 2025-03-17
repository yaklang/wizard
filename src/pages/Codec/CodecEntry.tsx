import type { Dispatch, FC } from 'react';
import { createContext, useContext, useMemo } from 'react';

import { CodecType } from './compoments/CodecType';
import { CodeOrder } from './compoments/CodeOrder';
import { CodeEditor } from './compoments/CodeEditor';
import { useSafeState } from 'ahooks';
import type { TDataIntegration } from './type';

// 定义 ThemeContext 类型
interface ThemeContextType {
    collectListContext: TDataIntegration;
    setCollectListContext: Dispatch<React.SetStateAction<TDataIntegration>>;
}

// 创建上下文并设置默认值
const CodecContext = createContext<ThemeContextType | null>(null);

const CodecEntry: FC = () => {
    const [collectList, setCollectList] = useSafeState<TDataIntegration>({
        workflow: [],
        text: '',
        auto: false,
        rowResultBuff: new Uint8Array([]),
        resultStr: '',
        expansion: false,
        hex: false,
    });

    const themeValue = useMemo(
        () => ({
            collectListContext: collectList,
            setCollectListContext: setCollectList,
        }),
        [collectList, setCollectList],
    );

    return (
        <div className="h-full w-full flex flex-wrap">
            <CodecContext.Provider value={themeValue}>
                <CodecType />
                <CodeOrder />
                <CodeEditor />
            </CodecContext.Provider>
        </div>
    );
};

// 自定义 Hook，方便组件内部使用 ThemeContext
const useTheme = () => {
    const context = useContext(CodecContext);
    if (!context) {
        throw new Error('useTheme 必须在 ThemeContext.Provider 内部使用');
    }
    return context;
};

export { CodecEntry, CodecContext, useTheme };
