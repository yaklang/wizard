import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import {
    // Markdown,
    WizardDrawer,
} from '@/compoments';
import { TGetTimeLineRuntimeMessage } from '@/utils/commonTypes';
// import { useSafeState } from 'ahooks';

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

    // const [blocks, setBlocks] = useSafeState([]);

    useImperativeHandle(ref, () => ({
        async open(items) {
            console.log(items, 'items');

            // setBlocks(items?.blocks);
            itemsBlocksRef.current = items?.blocks;
            // const itemsBlocks = await transformItems(items?.blocks);
            drawer.open();
        },
    }));

    // const transformItems = async (blocks: any[]) => {
    //     return blocks ?? [];
    // };

    return (
        <WizardDrawer drawer={drawer} width={'75%'} title={title} footer={null}>
            {/* {blocks.map((it, index) => {
                return it.type === 'markdown' ? (
                    <div key={index}>
                        <Markdown children={it.data} />
                        <br />
                    </div>
                ) : (
                    <div key={index}>asd</div>
                );
            })} */}
            <></>
        </WizardDrawer>
    );
});

export { ScriptDetailButton };
