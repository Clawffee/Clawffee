const crypto = require('crypto');
const fs = require('fs');

module.exports = (folder, excludes) => {
    
    const hash = crypto.createHash('sha256');
    
    function write(...data) {
        data.forEach(p => {
            hash.write(String(p).replaceAll('\0', '\0\0'));
            hash.write('\0');
        });
    }
    
    const skipped = [];
    excludes.push('version.json');
    const version = JSON.parse(fs.readFileSync(folder + '/version.json'));
    delete version.hash;
    write(JSON.stringify(version));

    
    function enterFolder(p) {
        const files = fs.readdirSync(p, {
            encoding: 'utf-8',
            recursive: false
        });
        files.sort((a,b) => a.toLowerCase().localeCompare(b, "en")).forEach(v => {
            v = p + '/' + v;
            if(excludes?.includes(v.substring(folder.length + 1)))
                return skipped.push(v.substring(folder.length + 1));
            write(Buffer.from(v.substring(folder.length + 1).toLowerCase(), 'utf-8'));
            const stat = fs.statSync(v);
            if(stat.isFile()) {
                const content = Buffer.from(fs.readFileSync(v, 'utf-8'), 'utf-8');
                write(content);
            } else if(stat.isDirectory()) {
                enterFolder(v);
            }
        });
    }
    enterFolder(folder);
    excludes.pop();
    return {hash: hash.digest(), skipped};
}