/* eslint-disable */
// const TerserPlugin = require("terser-webpack-plugin"); // 压缩 JavaScrip
const CompressionPlugin = require('compression-webpack-plugin'); // 开启gzip压缩

const debug = process.env.NODE_ENV !== 'production';

// https://github.com/vuejs/vue-cli/tree/dev/docs/zh/config

module.exports = {
    pages: {
        index: {
            entry: 'src/main.ts',
            template: 'public/index.html',
            filename: 'index.html',
        },
    },
    publicPath: process.env.BASE_URL,
    outputDir: 'dist',
    // js, css, img, fonts
    assetsDir: 'assets',
    // eslint save test：ture | false | 'error'
    lintOnSave: false,
    runtimeCompiler: true,
    transpileDependencies: [],
    productionSourceMap: debug,
    css: {
        requireModuleExtension: true, // 是否开启CSS module并保留xxx.module.css后缀
    },
    // devtool: 'cheap-module-eval-source-map',
    configureWebpack: config => {
        if (!debug) {
            config.plugins.push(new CompressionPlugin({
                filename: '[path].gz[query]',
                algorithm: 'gzip', // 压缩算法
                test: /\.js$|\.css$|\.html$/, // 匹配文件
                threshold: 10240, // 压缩超过此大小的文件,以字节为单位
                minRatio: 0.8,
            }));
            // 去除console
            config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
            config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
            config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
            config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log'];
        }
    },
    // eslint-disable-next-line no-unused-vars
    chainWebpack: config => {
        config.optimization.splitChunks({
            cacheGroups: {}
        });
        config.plugins.delete('prefetch-index');
        config.plugins.delete('preload-index');
        config.plugins.delete('prefetch-exportDoc');
        config.plugins.delete('preload-exportDoc');
        if (debug) {
            // dev
        } else {
            // prod
        }
    },
    parallel: require('os').cpus().length > 1,
    pluginOptions: {},
    // https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
    pwa: {
        iconPaths: {
            favicon32: 'public/favicon.ico',
            favicon16: 'public/favicon.ico',
            appleTouchIcon: 'public/favicon.ico',
            maskIcon: 'public/favicon.ico',
            msTileImage: 'public/favicon.ico'
        }
    },
    devServer: {
        open: true,
        port: 5001,
        https: false,
        hotOnly: false,
        progress: true,
        proxy: {
            '/en_api/': {
                target: process.env.VUE_APP_API_URL_1,
                ws: true,
                changOrigin: true,
                pathRewrite: {
                    '^/en_api/': '/'
                }
            },
        },
        // eslint-disable-next-line no-unused-vars
        before: app => {
        }
    }
};
