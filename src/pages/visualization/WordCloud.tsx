import React from "react";
import ReactWordCloud, {Optional, Options, Word} from "react-wordcloud";
import {Palm} from "../../gen/schema";
import {GraphProps} from "./GraphViewer";

export const WordCloud: React.FC<GraphProps> = (p) => {
    const {elements} = p.data as Palm.WordCloud;

    const wordCloudOptions: Optional<Options> = {
        rotations: 0,
        deterministic: true, fontSizes: [10, 60],
    };

    return <div>
        <ReactWordCloud
            size={[p.width || 800, p.height || 400]}
            words={elements?.map(item => {
                return {...item} as Word
            }) || [] as Word[]}
            options={wordCloudOptions}
        />
    </div>
}