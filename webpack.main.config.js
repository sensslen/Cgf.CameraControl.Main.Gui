const rules = require('./webpack.rules');
const plugins = require('./webpack.main.plugins');

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main.ts',
    // Put your normal webpack config below here
    externals: /^(atemSocketChild)$/i,
    plugins: plugins,
    module: {
        rules,
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    },
};
