import { randomString } from '@/utils';
import { Checkbox } from 'antd';
import type { FC } from 'react';

interface TIpTagProps {
    value?: string[];
    onChange?: (value: TIpTagProps['value']) => TIpTagProps['value'];
    data: Array<any>;
}

const AssetsProtsGroupTag: FC<TIpTagProps> = ({
    value = [],
    onChange,
    data,
}) => {
    return (
        <div>
            {data.map((it) => (
                <div
                    key={it.value + randomString(10)}
                    onClick={() => {
                        onChange?.(
                            value?.includes(it.value)
                                ? value?.filter((key) => key !== it.value)
                                : value?.concat(it.value),
                        );
                    }}
                    className={`flex items-center justify-between cursor-pointer mt-3 color-${
                        value?.includes(it.value) ? '[#4A94F8]' : '[#31343F]'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Checkbox checked={value?.includes(it.value)} />
                        <div>{it.label}</div>
                    </div>
                    <div>{it.cout}</div>
                </div>
            ))}
        </div>
    );
};

export { AssetsProtsGroupTag };
