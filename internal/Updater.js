try {
    const path = require('path');
    const exe = process.execPath;
    const name = path.basename(exe);
    if (name.toLowerCase().endsWith('_update.exe')) {
        
        const fs = require('fs');
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
    console.error('Update check failed:', err);
}

const config = require('../config/internal/version.json');

fetch(config.url).then((value) => value.blob().then((data) => data.json().then(json => {
    if(json.name != config.version) {
        console.log(`\u001b[32mImportant!\n\n\nnew version available! \u001b[0m${json.name}\u001b[32m\n\nvisit \u001b[0;1;3;4mhttp://localhost:4444/internal/update\u001b[0;32m to update clawffee!\n\n${json.body}\n\nWIP`);
        const { sharedServerData, functions } = require('./Server'); 
        sharedServerData.internal.update = {ver: json.name, body: json.body};
        functions['/internal/update'] = () => {

        }
    }
}).catch()).catch()).catch();

console.log(`\u001b[0m\n Clawffee Version ${config.version} 🐾`);