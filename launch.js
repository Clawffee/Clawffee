const fs = require('fs');
const {update_info, verifyHash, runUpdate, pubKey, getPubHash} = require('./internals/shared');

globalThis.clawffeeInternals = {
    launcher: {
        update_info,
        verifyHash,
        runUpdate,
        pubKey,
        getPubHash
    }
}
require(fs.realpathSync('./plugins/internal/_clawffee/index.js'));