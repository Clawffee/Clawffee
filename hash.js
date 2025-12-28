const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
(async () => {
const prompt = require('prompt');
prompt.start();
prompt.message = '';
prompt.delimiter = ':';

async function promptClear(message) {
  const { txt } = await prompt.get({
    properties: {
      txt: {
        message: message
      }
    }
  })
  return txt;
}

async function promptPassword (message) {
  prompt.start()
  prompt.message = ''
  prompt.delimiter = ':'
  const { password } = await prompt.get({
    properties: {
      password: {
        message: message,
        hidden: true
      }
    }
  })
  return password;
}

const foldername = await promptClear('specify a folder path');
const folder = path.join("plugins", foldername);

const clearHash = require('./hash_folder.js')(folder, ['package.json','.git','.gitignore', 'version.json', ...process.argv]);
console.log(clearHash);

let keypath = await promptClear('specify a key path(null to generate a new one)');
if(!keypath) {
    const {
        publicKey,
        privateKey,
    } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: await promptPassword('specify a password for the file'),
        },
    });

    fs.writeFileSync(foldername + '.priv', privateKey);
    fs.writeFileSync(foldername + '.pub.txt', publicKey);
    keypath = foldername + '.priv';
}
const privateKey = fs.readFileSync(keypath);
console.log(clearHash.hash.toString('base64'));
const encHash = crypto.privateEncrypt(crypto.createPrivateKey({key: privateKey, format: 'pem', passphrase: await promptPassword('specify a password(empty for null)') || null}), clearHash.hash).toString('base64');
console.log(encHash);
const json = require('./' + path.join(folder, 'version.json'));
json.hash = encHash;
fs.writeFileSync(path.join(folder, 'version.json'), JSON.stringify(json, null, 4));
})();