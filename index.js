const path = require('path');
const crypto = require('crypto');
const { Console } = require('console');
const { IncomingMessage } = require('http');

async function getUpdate() {
    const dns = require('dns/promises');
    let update_data;
    try {
        const data = await dns.resolveTxt('update.clawffee.com');
        if(!data) return console.error('failed to retrieve update information, potential clawffee downage?');
        try {
            update_data = JSON.parse(new Buffer(data.map(v => v[0]).join(''), 'base64').toString('ascii'));
            if(!update_data.url || !update_data.headers || !update_data.filename) throw new Error();
        } catch(e) {
            return console.error("failed to update clawffee, potential clawffee server misconfiguration?", e);
        }
    } catch(e) {
        return console.error('failed to retrieve update information, potential clawffee downage?');
    }
    try {
        const update_info = await (await fetch(update_data.url)).json();
        if(update_info.status && update_info.status != 200) {
            return console.error(`failed to fetch clawffee version information! Error code: ${update_info.status}`);
        }
        return {info: update_info, update_data};
    } catch(e) {
        return console.error('failed to fetch clawffee version information!');
    }
}
const update_info = getUpdate();

async function runUpdate() {
    const https = require('https');
    const fs = require('fs/promises');
    const os = require('os');
    const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), "clawffee-update-internal"));
    const info = await update_info;
    if(!info) {
        return console.error('this shhould not happen?');
    }
    const url = info.info.assets.find(v => v.name === info.update_data.filename)?.url;
    if(!url) {
        return console.error('failed to find the required update file');
    }
    console.log(url);
    /**
     * 
     * @param {IncomingMessage} res 
     * @returns 
     */
    function handleDownload(res) {
        if(res.statusCode == 302) {
            https.get(res.headers.location, {
                headers: info.update_data.headers
            }, handleDownload);
            return;
        }
        const tar = require('tar-stream');
        const gzip = require('zlib');
        const zipFile = tar.extract();
        const {createWriteStream} = require('fs');
        zipFile.on('entry', async (headers, stream, next) => {
            console.log('inflating file', headers.name);
            if(path.posix.normalize(headers.name).startsWith('../')) {
                console.error(`path ${headers.name} is pointing outside the folder!!!`);
                return next();
            }
            await fs.mkdir(path.join(folderPath, path.dirname(headers.name)), {recursive: true});
            stream.pipe(createWriteStream(path.join(folderPath, headers.name)));
            stream.on('end', () => {
                next();
            });
        }).once('close', () => {
            console.log(`finished inflating update at ${folderPath}`)
        });
        res.pipe(gzip.createGunzip()).pipe(zipFile);
    }
    const request = https.get(url, {
        headers: info.update_data.headers
    }, handleDownload);
}
return runUpdate();


const verInfo = getVerInfoSafe();
const encHash = new Buffer(require('./' + path.join('plugins/internal/version.json')).hash, 'base64')

function getVerInfoSafe() {
    try {
        const verInfo = require('./' + path.join('plugins/internal/version.json'));
        if(!verInfo.hash || verInfo.version) throw Error();
        return verInfo;
    } catch(e) {
        return null;
    };
}

try {
    const pubKey = require('./internal.pub.txt').default;
    const decHash = crypto.publicDecrypt(crypto.createPublicKey({key: pubKey, format: 'pem'}), encHash).toString('base64');

    const clearHash = require('./hash_folder.js')('plugins/internal', []).hash.toString('base64');
    if(decHash !== clearHash) return prompt(`\u001b[31mFAILED TO VERIFY CLAWFFEE INTEGRITY\u001b[0m got ${clearHash} expected ${decHash}`);
} catch (e) {
    return prompt(`\u001b[31mFAILED TO VERIFY CLAWFFEE INTEGRITY\u001b[0m DECRYPTION FAILURE`);
}

require('./' + path.join('plugins/internal/_clawffee/index.js'));