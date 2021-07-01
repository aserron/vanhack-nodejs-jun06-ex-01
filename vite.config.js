import { VitePluginNode } from 'vite-plugin-node';
/**
 * @type {import('vite').UserConfig}
 */
const config = {
    // ...
    plugins: [
        ...VitePluginNode({
            // the node framework yout are using,
            // currently this plugin support 'express', 'nest' and 'custom',
            // more framework support incoming!
            // when set this to 'custom', you have to the createCustomServer option // to tell the plugin how to create/start/... your node server
            server: 'express',

            // tell the plugin where is your project entry
            appPath: './src/app.js',

            // the port you want the server to run on
            port: 3000,

            // Optional, the TypeScript compiler you want to use
            // by default this plugin is using vite default ts compiler which is esbuild
            // 'swc' compiler is supported to use as well for frameworks
            // like Nestjs (esbuild dont support 'emitDecoratorMetadata' yet)
            tsCompiler: 'esbuild',

            // Required field when set server option to 'custom'
            // For examples, check out './src/servers' folder
            createCustomServer: () => IServer
        })
    ]
}

export default config;