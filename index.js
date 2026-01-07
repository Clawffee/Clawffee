const {verifyHash, pubKey, runUpdate} = require('./internals/shared')
const fs = require('fs');
function getVerInfoSafe() {
    try {
        const verInfo = JSON.parse(fs.readFileSync('plugins/internal/version.json'));
        if(!verInfo.hash || !verInfo.version) throw Error();
        return verInfo;
    } catch(e) {
        return null;
    };
}

const verInfo = getVerInfoSafe();

if(!verInfo) return (async () => {
    console.error('could not find internal plugins folder, assuming first launch. Downloading dependencies...');
    await runUpdate();
    require('./launch');
})();

if(!verifyHash('plugins/internal', pubKey)) return prompt(`\u001b[31mFAILED TO VERIFY CLAWFFEE INTEGRITY (try deleting ./plugins/internal if this doesnt resolve itself)\u001b[0m`);

require('./launch');