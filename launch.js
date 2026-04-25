const fs = require('fs');
const {update_info, verifyHash, runUpdate, pubKey, getPubHash, meta} = require('./internals/shared');

globalThis.clawffeeInternals = {
    launcher: {
        update_info,
        verifyHash,
        runUpdate,
        pubKey,
        getPubHash,
        meta
    }
}
require(fs.realpathSync('./plugins/internal/_clawffee/index.js'));