
const withCSS = require('@zeit/next-css');
//const withSass = require('@zeit/next-sass');
//const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
//const uuidv4 = require('uuid/v4');
//const Buffer = require('buffer/').Buffer;

// Next exposes some options that give you some control over how the server 
// will dispose or keep in memories pages built
// Taken from: https://github.com/zeit/next.js#configuring-the-ondemandentries
module.exports = withCSS({
    //target: 'serverless',
    //env: {
      //styleNonce1: Buffer.from(uuidv4()).toString('base64'),
    //},
    //crossOrigin: 'anonymous',
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 6
    },
    // Taken from: https://github.com/akiran/react-slick/issues/842#issuecomment-385378629
    webpack: (config, options) => {
        config.module.rules.push({
          test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 100000,
              fallback: "file-loader",
              name: '[name].[ext]'
            }
          }
        });

        // Handle polyfills
        // Taken from: https://github.com/zeit/next.js/tree/canary/examples/with-polyfills
        /* Note: Enabling polifills caused CSP to fail in production */
        /*const originalEntry = config.entry
        config.entry = async () => {
          const entries = await originalEntry()
    
          if (
            entries['main.js'] &&
            !entries['main.js'].includes('./lib/polyfills.js')
          ) {
            entries['main.js'].unshift('./lib/polyfills.js')
          }
    
          return entries
        }*/

        return config;
    },
    /* experimental: enables any files situated in the /public folder, in my case both robots.txt 
    and sitemap.xml, to be accessible at / (root).
    Taken from: https://spectrum.chat/next-js/general/clarification-on-public-directory~67b410b6-81ff-442b-8238-3a6f72891384
    */
    /*experimental: { publicDirectory: true },*/
    /*optimization: {
        minimizer: [
          new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    ascii_only: true,
                },
            },
        })
        ]
    },*/
    //publicRuntimeConfig: {
        // Will be available on both server and client
        //styleNonce: 'kbfL9tDtuC+VS4WKBjIVIg=='
    //}
});

