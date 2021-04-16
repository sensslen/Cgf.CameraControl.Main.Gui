const rules = require('./webpack.rules');
const plugins = require('./webpack.main.plugins');
const path = require('path');

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: {
        index: './src/main.ts',
        atemSocketChild: './node_modules/atem-connection/dist/lib/atemSocketChild.js',
    },
    // Put your normal webpack config below here
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '.webpack/main'),
    },
    plugins: plugins,
    module: {
        rules,
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
};
