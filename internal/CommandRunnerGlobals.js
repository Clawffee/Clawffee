/**
 * @typedef fileInfo
 * @prop {Set<string>} variables
 * @prop {Set<string>} functions
 * @prop {Set<any>} insertions
 * @prop {number[]} newLines
 */
clawffeeInternals.commandGlobals = {
    /**
     * @type {Map<string, fileInfo>}
     */
    fileInfo: new Map(),
    /**
     * @type {Map<string, string>}
     */
    functionNames: new Map(),
    /**
     * @type {Map<string, string>}
     */
    functionFileNames: new Map(),
    /**
     * @type {Map<string, any>}
     */
    functionOverrides: new Map(),
    /**
     * @type {Map<string, Set<string>>}
     */
    requiredFiles: new Map(),
    /**
     * @type {string[]}
     */
    commandFolders: []
}
module.exports = clawffeeInternals.commandGlobals;