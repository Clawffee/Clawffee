//@ts-check
const fs = require('fs');
const {update_info, verifyHash, runUpdate, pubKey, getPubHash, meta} = require('./internals/shared');

globalThis.clawffeeInternals = {
    /**
     * @type {import('./plugins/internal/_clawffee/internal/Globals/launcher').InternalData}
     */
    launcher: {
        updateInfo: update_info,
        //@ts-ignore
        update_info,
        verifyHash,
        runUpdate,
        pubKey,
        getPubHash,
        meta: meta
    }
}
require(fs.realpathSync('./plugins/internal/_clawffee/index.js'));