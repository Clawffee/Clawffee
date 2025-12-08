
console.log("\u001b[0m\n Clawffee Version 0.3.2 🐾");
console.log("\u001b[0m\n Join the discord! https://discord.gg/744T53nJFu");
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