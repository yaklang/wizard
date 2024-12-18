import { randomString } from '@/utils';
import { FC } from 'react';

interface TIpTagProps {
    value?: string[];
    onChange?: (value: TIpTagProps['value']) => TIpTagProps['value'];
    data: Array<any>;
}

const FilterTag: FC<TIpTagProps> = ({ value, onChange, data }) => {
    return (
        <div className="flex gap-2">
            {data.map((it) => (
                <div
                    className={`px-1 bg-${value?.includes(it.value) ? '[#4A94F8]' : '[#f0f1f3]'} text-[${value?.includes(it.value) ? '#fff' : '#000'}] rounded cursor-pointer hover:text-[${value?.includes(it.value) ? 'none' : '#4A94F8'}]`}
                    key={it.Total + randomString(10)}
                    onClick={() =>
                        onChange?.(
                            value?.includes(it.value)
                                ? value?.filter((key) => key !== it.value)
                                : value?.concat(it.value),
                        )
                    }
                >
                    {it.label}
                </div>
            ))}
        </div>
    );
};

export { FilterTag };
