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
            if(!update_data.url || !update_data.headers) throw new Error();
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
        return {info: update_info, headers: update_data.headers};
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
    console.log(info.info.assets[0].url);
    const zipFile = require('fs').createWriteStream(path.join(folderPath, 'download.zip'));
    /**
     * 
     * @param {IncomingMessage} res 
     * @returns 
     */
    function handleDownload(res) {
        if(res.statusCode == 302) {
            https.get(res.headers.location, {
                headers: info.headers
            }, handleDownload);
            return;
        }
        console.log(res);
        res.pipe(zipFile);
        zipFile.on('finish', () => {
            zipFile.close();
            console.log('download complete at', zipFile.path);
        });
    }
    const request = https.get(info.info.assets[0].url, {
        headers: info.headers
    }, handleDownload);
}

//return runUpdate();


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