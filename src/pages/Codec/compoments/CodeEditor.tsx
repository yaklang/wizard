import { useRef } from 'react';

import { WizardAceEditor } from '@/compoments';
import useListenHeight from '@/hooks/useListenHeight';

const CodeEditor = () => {
    const typeContainerRef = useRef(null);

    const [containerHeight, containerWidth] = useListenHeight(typeContainerRef);
    console.log(containerHeight, containerWidth, 'containerHeight');
    return (
        <div ref={typeContainerRef} className="h-full flex-1">
            <div className="h-9 flex justify-between items-center px-2">
                <div>Input</div>
                <div>asd</div>
            </div>
            <WizardAceEditor
                style={{ height: `${containerHeight / 2}px` }}
                // value={scriptValue}
                // onChange={setScriptValue}
            />

            <div className="h-9 flex justify-between items-center px-2">
                <div>OutPut</div>
                <div>asd</div>
            </div>
            <WizardAceEditor
                style={{ height: `${containerHeight / 2 - 72}px` }}
                readOnly={true}
                // value={scriptValue}
                // onChange={setScriptValue}
            />
        </div>
    );
};

export { CodeEditor };
