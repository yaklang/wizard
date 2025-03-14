import { useRef } from 'react';

import { WizardAceEditor } from '@/compoments';
import useListenHeight from '@/hooks/useListenHeight';
import { useTheme } from '../CodecEntry';

const CodeEditor = () => {
    const { collectListContext, setCollectListContext } = useTheme();
    const typeContainerRef = useRef(null);
    const [containerHeight] = useListenHeight(typeContainerRef);

    return (
        <div ref={typeContainerRef} className="h-full flex-1">
            <div className="h-9 flex justify-between items-center px-2">
                <div>Input</div>
                <div>asd</div>
            </div>
            <WizardAceEditor
                style={{ height: `${containerHeight / 2}px` }}
                value={collectListContext.text}
                onChange={(e: string) =>
                    setCollectListContext((preValue) => ({
                        ...preValue,
                        text: e,
                    }))
                }
            />

            <div className="h-9 flex justify-between items-center px-2">
                <div>OutPut</div>
                <div>asd</div>
            </div>
            <WizardAceEditor
                style={{ height: `${containerHeight / 2 - 72}px` }}
                readOnly={true}
                value={collectListContext.rowResult}
            />
        </div>
    );
};

export { CodeEditor };
