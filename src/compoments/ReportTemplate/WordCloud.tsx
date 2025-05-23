import React from 'react';
import type { Optional, Options, Word } from 'react-wordcloud';
import ReactWordCloud from 'react-wordcloud';
import type { Palm } from '../../gen/schema';
import type { GraphProps } from './compoments/GraphViewer';

export const WordCloud: React.FC<GraphProps> = (p) => {
    const { elements } = p.data as Palm.WordCloud;

    const wordCloudOptions: Optional<Options> = {
        rotations: 0,
        deterministic: true,
        fontSizes: [10, 60],
    };

    return (
        <div>
            <ReactWordCloud
                size={[p.width || 800, p.height || 400]}
                words={
                    elements?.map((item) => {
                        const word: Word = { ...item };
                        return word;
                    }) || ([] as Word[])
                }
                options={wordCloudOptions}
            />
        </div>
    );
};
