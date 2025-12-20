/*
 ┌───────────────────┐
 │                   │
 │     chokidar      │
 │                   │
 └─────────┬─────────┘
           │
           │ File updates
           │
 ┌─────────▼─────────┐
 │                   │
 │      FS.read      │
 │                   │
 └─────────┬─────────┘
           │
           │ Raw JS String
           │
 ┌─────────▼─────────┐        JS Sourcemap
 │                   │         & Metadata
 │   JS Prettifier   ├───────────────┐
 │                   │               │
 └─────────┬─────────┘     ┌─────────▼─────────┐
           │               │                   │
           │ Overriden JS  │ Original JS Cache │
           │               │                   │
 ┌─────────▼─────────┐     └─────▲─────┬───────┘
 │                   │           │     │
 │  Function() call  ├───────────┘     │
 │                   │       Metadata  │
 └─────────┬─────────┘                 │Function
           │                           │Metadata
           │ Potential Error           │
           │                           │
 ┌─────────▼─────────┐                 │
 │                   │                 │
 │ prepareStackTrace ◄─────────────────┘
 │                   │
 └───────────────────┘
*/

const fs = require('fs');
const { hookToFolder } = require('./FSHookManager');
const { join, sep, basename } = require('path')
const { commandFolders } = require('./CommandRunnerGlobals');
const { sharedServerData } = require('./SharedServerData');

/**
 * @type {{[x: string]: Array<Function>}}
 */
globalThis.clawffeeInternals.fileCleanupFuncs = {}
globalThis.clawffeeInternals.fileManagers = {};

sharedServerData.internal.commands = JSON.parse(fs.readFileSync('config/internal/commands.json'));
const config = sharedServerData.internal.commands;
clawffeeInternals.commandConfig = config;
/**
 * Unloads a commands at a given path
 * @param {string} path 
 */
function unloadCommand(path) {
    const fullPath = join(workingDirectory, path);
    if(!globalThis.clawffeeInternals.fileCleanupFuncs[fullPath]) return;
    globalThis.clawffeeInternals.fileCleanupFuncs[fullPath].forEach((v) => {try {v()} catch(e) {console.error(e)}});
    for (const ending in globalThis.clawffeeInternals.fileManagers) {
        if (!Object.hasOwn(globalThis.clawffeeInternals.fileManagers, ending) || !path.endsWith(ending)) continue;
        const mgr = globalThis.clawffeeInternals.fileManagers[ending];
        try {
            mgr.onUnload?.(path);
        } catch(e) {
            console.error(e);
        }
    }
    console.log(`- ${path}`);
}

let workingDirectory = process.cwd();



/**
 * Loads the commands at a given path
 * @param {string} path 
 * @param {string} str 
 */
function loadCommand(path, str, initial) {
    console.log(`+ ${path}`);
    const fullPath = join(workingDirectory, path);
    try {
        for (const ending in globalThis.clawffeeInternals.fileManagers) {
            if (!Object.hasOwn(globalThis.clawffeeInternals.fileManagers, ending) || !path.endsWith(ending)) continue;
            const mgr = globalThis.clawffeeInternals.fileManagers[ending];
            try {
                (mgr.onLoad ?? mgr.onRequire)?.(fullPath, str, initial);
                break;
            } catch(e) {
                console.error(e);
            }
        }
    } catch(err) {
        console.error(err);
        unloadCommand(path);
    }
}


/**
 * 
 * @param {string} path 
 * @returns 
 */
function getCMDObject(path) {
    const folders = path.split(sep);
    let mgr = config;
    folders.shift();
    while(folders.length > 1) {
        const fname = folders.shift();
        if(!mgr.childfolders[fname]) mgr.childfolders[fname] = {
            name: fname,
            sortname: null,
            img: null,
            hidden: false,
            disabled: false,
            childfolders: {},
            childscripts: {}
        };
        mgr = mgr.childfolders[fname];
    }
    return mgr;
}
/**
 * Recursively loads and reloads commands in the given folder
 * @param {string} folder folder to load commands from
 */
function runCommands(folder) {
    if(!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    if(!fs.statSync(folder).isDirectory()) {
        fs.rmSync(folder);
        fs.mkdirSync(folder);
    }
    commandFolders.push(folder);
    hookToFolder(folder, (type, path, stats) => {
        const cmdobj = getCMDObject(path);
        if(type == 'unlink') {
            delete cmdobj.childfolders[basename(path)];
            delete cmdobj.childscripts[basename(path)];
        } else {
            if(stats.isDirectory()) {
                if(!cmdobj.childfolders[basename(path)]) {
                    cmdobj.childfolders[basename(path)] = {
                        "name": basename(path),
                        "sortname": null,
                        "img": null,
                        "hidden": false,
                        "disabled": false,
                        childfolders: {},
                        childscripts: {}
                    }
                }
            } else {
                if(!cmdobj.childscripts[basename(path)]) {
                    cmdobj.childscripts[basename(path)] = {
                        "name": basename(path),
                        "sortname": null,
                        "img": null,
                        "hidden": false,
                        "disabled": false,
                    }
                }
            }
        }
        if(!Object.keys(clawffeeInternals.fileManagers).find(v => path.endsWith(v))) {
            return;
        }
        if(type == 'unlink') {
            unloadCommand(path);
            return;
        }
        fs.readFile(path, (err, data) => {
            if(type != 'initial')
                unloadCommand(path);
            if(err) {
                console.warn(err);
                return;
            }
            loadCommand(path, data.toString(), type == 'initial');
        });
    });
}

module.exports = {
    runCommands
}