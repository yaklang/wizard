const mockList = [
    {
        title: 'Find',
        codecType: 'Find',
        id: '43d19f08-9369-469a-8501-9e9203f0c270',
        node: [
            {
                type: 'input',
                title: 'Find',
                name: 'find',
                require: true,
                regex: '',
            },
            {
                type: 'select',
                selectArr: [
                    {
                        label: 'regexp',
                        value: 'regexp',
                    },
                    {
                        label: 'raw',
                        value: 'raw',
                    },
                ],
                title: '查找方式',
                name: 'findType',
                require: true,
                value: 'regexp',
            },
            {
                type: 'checkbox',
                name: 'Global',
                checkArr: [
                    {
                        label: '全部匹配',
                        value: 'Global',
                    },
                ],
                require: true,
            },
            {
                type: 'checkbox',
                name: 'IgnoreCase',
                checkArr: [
                    {
                        label: '忽略大小写',
                        value: 'IgnoreCase',
                    },
                ],
                require: true,
            },
            {
                type: 'checkbox',
                name: 'Multiline',
                checkArr: [
                    {
                        label: '多行匹配',
                        value: 'Multiline',
                    },
                ],
                require: true,
            },
        ],
    },
    {
        title: 'Replace',
        codecType: 'Replace',
        id: '67ba31ca-6bd6-432a-9ac3-658dbae7b718',
        node: [
            {
                type: 'input',
                title: 'Find',
                name: 'find',
                require: true,
                regex: '',
            },
            {
                type: 'input',
                title: 'Replace',
                name: 'replace',
                require: false,
                regex: '',
            },
            {
                type: 'select',
                selectArr: [
                    {
                        label: 'regexp',
                        value: 'regexp',
                    },
                    {
                        label: 'raw',
                        value: 'raw',
                    },
                ],
                title: '查找方式',
                name: 'findType',
                require: true,
                value: 'regexp',
            },
            {
                type: 'checkbox',
                name: 'Global',
                checkArr: [
                    {
                        label: '全部匹配',
                        value: 'Global',
                    },
                ],
                require: true,
            },
            {
                type: 'checkbox',
                name: 'IgnoreCase',
                checkArr: [
                    {
                        label: '忽略大小写',
                        value: 'IgnoreCase',
                    },
                ],
                require: true,
            },
            {
                type: 'checkbox',
                name: 'Multiline',
                checkArr: [
                    {
                        label: '多行匹配',
                        value: 'Multiline',
                    },
                ],
                require: true,
            },
        ],
    },
    {
        title: 'JWT签名',
        codecType: 'JwtSign',
        id: 'a3b8ba06-0c46-47e7-86ef-1dc25dd5bcc5',
        node: [
            {
                type: 'select',
                selectArr: [
                    {
                        label: 'ES384',
                        value: 'ES384',
                    },
                    {
                        label: 'ES256',
                        value: 'ES256',
                    },
                    {
                        label: 'ES512',
                        value: 'ES512',
                    },
                    {
                        label: 'HS256',
                        value: 'HS256',
                    },
                    {
                        label: 'HS384',
                        value: 'HS384',
                    },
                    {
                        label: 'HS512',
                        value: 'HS512',
                    },
                    {
                        label: 'PS256',
                        value: 'PS256',
                    },
                    {
                        label: 'PS384',
                        value: 'PS384',
                    },
                    {
                        label: 'PS512',
                        value: 'PS512',
                    },
                    {
                        label: 'RS256',
                        value: 'RS256',
                    },
                    {
                        label: 'RS384',
                        value: 'RS384',
                    },
                    {
                        label: 'RS512',
                        value: 'RS512',
                    },
                    {
                        label: 'None',
                        value: 'None',
                    },
                ],
                title: '签名算法',
                name: 'algorithm',
                require: true,
                value: 'HS256',
            },
            {
                type: 'input',
                title: 'JWT密钥',
                name: 'id',
                require: false,
                regex: '',
            },
            {
                type: 'checkbox',
                name: 'isBase64',
                checkArr: [
                    {
                        label: 'base64编码',
                        value: 'isBase64',
                    },
                ],
                require: true,
            },
        ],
    },
    {
        title: 'Json处理',
        codecType: 'JsonFormat',
        id: '4572c45d-14ac-420f-bd81-ca00bfc29dc1',
        node: [
            {
                type: 'select',
                selectArr: [
                    {
                        label: '四格缩进',
                        value: '四格缩进',
                    },
                    {
                        label: '两格缩进',
                        value: '两格缩进',
                    },
                    {
                        label: '压缩',
                        value: '压缩',
                    },
                ],
                title: '处理方式',
                name: 'mode',
                require: true,
                value: '两格缩进',
            },
        ],
    },
    {
        title: 'XML美化',
        codecType: 'XMLFormat',
        id: 'f1c81073-ad97-4fac-9396-0f9d512eff98',
        node: [],
    },
];
export { mockList };
