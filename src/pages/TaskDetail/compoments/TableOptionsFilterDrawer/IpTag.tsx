import { randomString } from '@/utils';
import { FC } from 'react';

interface TIpTagProps {
    value?: string[];
    onChange?: (value: TIpTagProps['value']) => TIpTagProps['value'];
    data: Array<any>;
}

const IpTag: FC<TIpTagProps> = ({ value, onChange, data }) => {
    return (
        <div>
            {data.map((it) => (
                <div
                    key={it.Total + randomString(10)}
                    onClick={() =>
                        onChange?.(
                            value?.includes(it.Verbose)
                                ? value?.filter((key) => key !== it.Verbose)
                                : value?.concat(it.Verbose),
                        )
                    }
                    className={`flex items-center justify-between cursor-pointer mt-3 color-${
                        value?.includes(it.Verbose) ? '[#4A94F8]' : '[#31343F]'
                    }`}
                >
                    <div>{it.Verbose}</div>
                    <div>{it.Total}</div>
                </div>
            ))}
        </div>
    );
};

export { IpTag };
