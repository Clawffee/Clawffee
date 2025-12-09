require('./internal/Updater');
console.log("\n Join the discord! \u001b[32;1;3;4mhttps://discord.gg/744T53nJFu\u001b[0m");


console.log("╴".repeat(32) + "╮");

if(process.argv.includes('--verbose'))
    require('./internal/verbose');

globalThis.clawffeeInternals = {}

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error("Uncaught Error!", err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled Rejection!", "reason:", reason);
});
process.on('multipleResolves', (type, promise, reason) => {
    console.error("Multiple Resolves!", type, reason);
});

require('./internal/ConsoleOverrides');
require('./internal/Server');
const {runCommands} = require('./internal/CommandRunManager');
const { requirePluginsRecursively }  = require('./internal/PluginLoader');
requirePluginsRecursively(require('path').join(process.cwd(), 'plugins'));

/**
const worker = new Worker(
    require.resolve("./dashboard.js"), 
    {
        smol: true,
    }
);
worker.addEventListener("close", event => {
    console.log("exiting...")
    process.exit();
});
*/

runCommands('./commands');