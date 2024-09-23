const {override, fixBabelImports,addWebpackExternals,addWebpackAlias} = require('customize-cra');
const path = require("path");

module.exports = override(
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
    }),
    addWebpackExternals({
        './cptable': 'var cptable',
    }),
    addWebpackAlias({
        '@': path.resolve(__dirname, 'src'),
    }),
);
