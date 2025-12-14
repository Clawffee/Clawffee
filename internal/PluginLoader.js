const fs = require('node:fs');
const path = require('path');

function requirePluginsRecursively(dir, depth = 0) {
    if(depth == 1) {
        console.debug(`loading ${path.basename(dir)} plugins`);
    }
    fs.readdirSync(dir).sort((a,b) => {
        if(depth == 0) {
            if(a == 'internal') return -1;
            if(b == 'internal') return 1;
            if(a == 'builtin') return -1;
            if(b == 'builtin') return 1;
        }
        return a.localeCompare(b);
    }).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith("_") && file != "node_modules") {
            requirePluginsRecursively(filePath, depth+1);
        } else if (stat.isFile() && file.endsWith('.js') && !file.startsWith("_")) {
            try {
                require(filePath);
            } catch(e) {
                console.error(e);
            }
        }
    });
    if(depth == 0) {
        console.debug(`loaded all plugins!`);
    }
}

module.exports = {
    requirePluginsRecursively
}