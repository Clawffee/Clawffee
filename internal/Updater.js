const fs = require('fs');

try {
    const path = require('path');
    const exe = process.execPath;
    const name = path.basename(exe);
    if (name.toLowerCase().endsWith('_update.exe')) {
        
        const child_process = require('child_process');
        const dir = path.dirname(exe);
        const targetName = name.replace(/_update\.exe$/i, '.exe');
        const target = path.join(dir, targetName);

        try {
            fs.copyFileSync(exe, target);
            try { fs.chmodSync(target, 0o755); } catch (e) {}
            const child = child_process.spawn(target, [], { detached: true, stdio: 'ignore', shell: true});
            child.unref();
            process.exit(0);
        } catch (err) {
            console.error('Failed to install update:', err);
        }
    }
} catch (err) {
    console.error('Overriding original Executable failed:', err);
}

const config = require('../config/internal/version.json');

Promise.all([
    fetch(config.url).then((value) => value.json()),
    fetch(config.plugin_url).then((value) => value.json())
]).then(([json, plugin_json]) => {
    if(json.name && json.name != config.version && plugin_json.name && plugin_json.name != config.version) {
        console.log(`\u001b[32mImportant!\n\n\nnew version available! \u001b[0m${json.name}\u001b[32m\n\nvisit \u001b[0;1;3;4mhttp://localhost:4444/internal/update/internal\u001b[0;32m to update clawffee!\n\n${json.body}\n\nWIP`);
        const { sharedServerData, functions } = require('./Server'); 
        sharedServerData.internal.update = {ver: json.name, body: json.body};
        functions['/internal/update/internal'] = () => {
            // TODO: figure out which assets to download and remember to set header Accept to application/octet-stream and X-GitHub-Api-Version: 2022-11-28
        }
    } else {
        console.warn('Could not check for updates!')
    }
}, e => {
    console.warn(e);
});
console.log(`\u001b[0m\n Clawffee Version ${config.version} 🐾`);