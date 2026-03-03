interface KVPair {
    Key: string;
    Value: string;
}

interface KnowledgeBaseEntry {
    ID: number;
    KnowledgeBaseId: number;
    HiddenIndex: string;
    KnowledgeTitle: string;
    KnowledgeType: string;
    ImportanceScore: number;
    Keywords: string[];
    KnowledgeDetails: string;
    Summary: string;
    SourcePage: number;
    PotentialQuestions: string[];
    PotentialQuestionsVector: number[];
    CreatedAt?: string;
    UpdatedAt?: string;
}

interface CustomPluginExecuteFormValue {
    [key: string]:
        | number
        | string
        | boolean
        | string[]
        | Uint8Array
        | KVPair[]
        | number[];
}

interface FileMonitorItemProps {
    // 是否为文件夹
    IsDir: boolean;
    // 操作
    Op: 'delete' | 'create';
    // 路径
    Path: string;
}

export interface FileMonitorProps {
    Id: string;
    ChangeEvents: FileMonitorItemProps[];
    CreateEvents: FileMonitorItemProps[];
    DeleteEvents: FileMonitorItemProps[];
}

export {
    KVPair,
    KnowledgeBaseEntry,
    CustomPluginExecuteFormValue,
    FileMonitorItemProps,
    FileMonitorProps,
};
