
module.exports = {
    unsafe: {
        commandConfig: globalThis.clawffeeInternals.commandConfig,
        /**
         * @type {{
         *  fileInfo: Map<string, fileInfo>,
         *  functionNames: Map<string, string>,
         *  functionFileNames: Map<string, string>,
         *  functionOverrides: Map<string, any>,
         *  requiredFiles: Map<string, Set<string>>,
         *  commandFolders: string[]
         * }}
         */
        commandGlobals: globalThis.clawffeeInternals.commandGlobals,
        fileManagers: globalThis.clawffeeInternals.fileManagers,
    },
    commandConfig: globalThis.clawffeeInternals.commandConfig,
    /**
     * @type {{
     *  fileInfo: Map<string, fileInfo>,
     *  functionNames: Map<string, string>,
     *  functionFileNames: Map<string, string>,
     *  functionOverrides: Map<string, any>,
     *  requiredFiles: Map<string, Set<string>>,
     *  commandFolders: string[]
     * }}
     */
    commandGlobals: globalThis.clawffeeInternals.commandGlobals,
    /**
     * 
     * @param {Error} error the error to use as the base of the stack trace
     * @param {any} stack the stack trace to apply on the error to use as the stack trace
     */
    prettyPrepareStack(error, stack) {
        clawffeeInternals.prettyPrepareStack(error, stack);
    },
    fileManagers: globalThis.clawffeeInternals.fileManagers,
    addFileManager() {
        //TODO:
    }

}