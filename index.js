const path = require('path');
const crypto = require('crypto');



try {
    const encHash = new Buffer(require('./' + path.join('plugins/internal/version.json')).hash, 'base64');
    const pubKey = require('./internal.pub.txt').default;
    const decHash = crypto.publicDecrypt(crypto.createPublicKey({key: pubKey, format: 'pem'}), encHash).toString('base64');

    const clearHash = require('./hash_folder.js')('plugins/internal', ['version.json']).hash.toString('base64');
    if(decHash !== clearHash) return prompt(`\u001b[31mFAILED TO VERIFY CLAWFFEE INTEGRITY\u001b[0m got ${clearHash} expected ${decHash}`);
} catch (e) {
    return prompt(`\u001b[31mFAILED TO VERIFY CLAWFFEE INTEGRITY\u001b[0m DECRYPTION FAILURE`);
}

require('./' + path.join('plugins/internal/_clawffee/index.js'));