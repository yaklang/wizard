import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { Markdown, WizardDrawer } from '@/compoments';
import { TGetTimeLineRuntimeMessage } from '@/utils/commonTypes';

const ScriptDetailButton = forwardRef<
    UseDrawerRefType,
    {
        title: string;
    }
>(({ title }, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();

    const itemsBlocksRef = useRef<TGetTimeLineRuntimeMessage['data']['blocks']>(
        [],
    );

    useImperativeHandle(ref, () => ({
        async open(items) {
            const itemsBlocks = await transformItems(items?.blocks);
            itemsBlocksRef.current = itemsBlocks;
            drawer.open();
        },
    }));

    const transformItems = async (blocks: any[]) => {
        return blocks ?? [];
    };

    return (
        <WizardDrawer
            drawer={drawer}
            width={'100%'}
            title={title}
            footer={null}
        >
            {Array.isArray(itemsBlocksRef.current) &&
                itemsBlocksRef.current.map((it, index) => {
                    return it.type === 'markdown' ? (
                        <div key={index}>
                            <Markdown children={it.data} />
                            <br />
                        </div>
                    ) : (
                        <div key={index}>asd</div>
                    );
                })}
        </WizardDrawer>
    );
});

export { ScriptDetailButton };
