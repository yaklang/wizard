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

export { KVPair, KnowledgeBaseEntry, CustomPluginExecuteFormValue };
