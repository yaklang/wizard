import { FC } from 'react';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

type TWizardAceEditor = {
    value?: string;
    onChange?: <T extends TWizardAceEditor['value']>(value: T) => T;
};

const WizardAceEditor: FC<TWizardAceEditor> = ({ value, onChange }) => {
    return (
        <AceEditor
            width="100%"
            mode="golang"
            theme="github"
            onChange={onChange}
            value={value}
            name="WIZARD_ACE_EDITOR"
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                mergeUndoDeltas: true,
                enableMultiselect: true,
                wrap: true,
                useWorker: false,
                printMargin: false,
            }}
            editorProps={{ $blockScrolling: true }}
        />
    );
};

export default WizardAceEditor;
