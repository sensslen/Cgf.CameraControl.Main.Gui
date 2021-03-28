const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
    new CopyPlugin({
        patterns: [{ from: '**/atemSocketChild*', to: '[name].[ext]' }],
    }),
];
