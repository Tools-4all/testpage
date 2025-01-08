importScripts("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js")


// require.config({
//     paths: {
//         lodash: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min"
//     }
// });

// console.log("loaded")
// require(['lodash'], (lodash) => {
//     console.log("lodash loaded")
//     const result = lodash.chunk([1, 2, 3, 4, 5, 6], 2);
//     console.log("results", result);
// });


const wrapperPrefixLines = [
    '"use strict";',
    'const console = customConsole;',
    'const prompt = customPrompt;',
    'const self = undefined;',
    'const postMessage = undefined;',
    'const fetch = undefined;',
    'const XMLHttpRequest = undefined;',
    'const WebSocket = undefined;',
    'const importScripts = undefined;',
    'const sharedBuffer = undefined;',
    'const myPrompt = undefined;',
    'const myPromptInstance = undefined;',
    'const executeCode = undefined;',
    'const userFunc = undefined;',
    'const myDir = undefined;',
    'const getStack = undefined;',
    '//# sourceURL=1919191.js',
    '(() => {'
];
console.log("loaded 2")


const wrapperSuffix = `})();`;

const WRAPPER_LINE_COUNT = wrapperPrefixLines.length +2;

function createWrappedCode(userCode) {
    return wrapperPrefixLines.join('\n') + '\n' + userCode + wrapperSuffix;
}


function getStack() {
    const stack = new Error().stack.split('\n');
    const userScriptIdentifier = '1919191.js';
    let processedStack = [];
    stack.forEach(line => {
        if (line.includes(userScriptIdentifier)) {
            const regex = /at (\S+) \(([^:]+):(\d+):(\d+)\)/;
            const match = line.match(regex);
            if (match) {
                const functionName = match[1];
                const lineNumber = parseInt(match[3], 10);
                const adjustedLine = lineNumber - WRAPPER_LINE_COUNT;
                if (adjustedLine > 0) {
                    processedStack.push(`    at ${functionName} (js:${adjustedLine})`);
                } else {
                    processedStack.push(`    at ${functionName} (js:${lineNumber})`);
                }
            } else {
                const regexNoFunc = /at ([^:]+):(\d+):(\d+)/;
                const matchNoFunc = line.match(regexNoFunc);
                if (matchNoFunc) {
                    const fileName = matchNoFunc[1];
                    const lineNumber = parseInt(matchNoFunc[2], 10);
                    const adjustedLine = lineNumber - WRAPPER_LINE_COUNT;
                    if (adjustedLine > 0) {
                        processedStack.push(`    at js (js:${adjustedLine})`);
                    } else {
                        processedStack.push(`    at js (js:${lineNumber})`);
                    }
                }
            }
        }
    });
    var lastLine = "at userCode " + processedStack[processedStack.length - 1].split(" ")[-1];

    return processedStack.slice(0, -2).join('\n') + '\n' + lastLine;
}


class myPrompt {
    constructor(msg = "") {
        this.msg = msg;
        this.response = null;
        this.waiting = false;
    }

    prompt(msg, sharedBuffer) {
        self.postMessage({ type: "prompt", message: msg });
        this.waiting = true;
        const view = new Int32Array(sharedBuffer);
        Atomics.store(view, 0, 0);
        while (Atomics.wait(view, 0, 0) === "ok");
        const sharedResponseBuffer = new Uint8Array(sharedBuffer, 4);
        const copiedBuffer = new Uint8Array(sharedResponseBuffer.length);
        copiedBuffer.set(sharedResponseBuffer);
        const textDecoder = new TextDecoder();
        this.response = textDecoder.decode(copiedBuffer).replace(/\0/g, "");
        Atomics.store(view, 0, 0);
        this.waiting = false;
    }

    getResponse() {
        return this.response;
    }
}


function myDir(obj, indent = "", first = false) {
    if (typeof obj !== "object" || obj === null) {
        return indent + String(obj);
    }
    if (Array.isArray(obj)) {
        let output = indent + "[Array]\n";
        if (first) {
            output = "\n" + output;
            first = false;
        }
        for (let i = 0; i < obj.length; i++) {
            output += indent + "  [" + i + "]:\n" + myDir(obj[i], indent + "    ") + "\n";
        }
        return output;
    } else {
        let output = indent + "{Object}\n";
        if (first) {
            output = "\n" + output;
            first = false;
        }
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                output += indent + "  " + key + ":\n" + myDir(obj[key], indent + "    ") + "\n";
            }
        }
        return output;
    }
}




self.addEventListener("message", (event) => {
    const { type, code, sharedBuffer } = event.data;
    if (type === "execute") {
        const customConsole = {
            log: (...args) => self.postMessage({ type: "log", message: args.join(" ") }),
            error: (...args) => self.postMessage({ type: "error", message: args.join(" ") }),
            warn: (...args) => self.postMessage({ type: "warn", message: args.join(" ") }),
            info: (...args) => self.postMessage({ type: "info", message: args.join(" ") }),
            debug: (...args) => {
                const stack = getStack();
                self.postMessage({ type: "log", message: args.join(" ") + "\n" + stack });
            },
            clear: () => self.postMessage({ type: "clear" }),

            // table: (data) => self.postMessage({ type: "table", message: JSON.stringify(data) }),
            // count: (label = "default") => self.postMessage({ type: "count", message: label }),
            // countReset: (label = "default") => self.postMessage({ type: "countReset", message: label }),
            assert: (condition, ...args) => {
                if (!condition) {
                    self.postMessage({ type: "error", message: `Assertion failed: ${args.join(" ")}` });
                }
            },
            dir: (obj) => {
                const dirString = myDir(obj, "", true);
                self.postMessage({ type: "log", message: dirString });
            },
            dirxml: (obj) => {
                throw new Error("DOM simulation is not implemented, please use console.dir for non DOM objects.");
            },
            // group: (...args) => self.postMessage({ type: "group", message: args.join(" ") }),
            // groupCollapsed: (...args) => self.postMessage({ type: "groupCollapsed", message: args.join(" ") }),
            // groupEnd: () => self.postMessage({ type: "groupEnd" }),
            // profile: (label) => self.postMessage({ type: "profile", message: label || "default" }),
            // profileEnd: (label) => self.postMessage({ type: "profileEnd", message: label || "default" }),
            // time: (label = "default") => self.postMessage({ type: "time", message: label }),
            // timeEnd: (label = "default") => self.postMessage({ type: "timeEnd", message: label }),
            // timeLog: (label = "default", ...args) =>
            //     self.postMessage({ type: "timeLog", message: [label, ...args].join(" ") }),
            // timeStamp: (label) => self.postMessage({ type: "timeStamp", message: label || "" }),
            // trace: (...args) => self.postMessage({ type: "trace", message: args.join(" ") }),
        };

        const customPrompt = (msg = "") => {
            const promptInstance = new myPrompt(msg);
            promptInstance.prompt(msg, sharedBuffer);
            return promptInstance.getResponse();
        };

        const executeCode = (userCode) => {
            try {
                const wrappedCode = createWrappedCode(userCode);
                const userFunc = new Function("customConsole", "customPrompt", wrappedCode);
                userFunc(customConsole, customPrompt);
                self.postMessage({ type: "log", message: "Script finished with exit code 0." });
            } catch (e) {
                customConsole.error(e.message);
                self.postMessage({ type: "log", message: "Script finished with exit code 1." });
            }
        };

        try {
            executeCode(code);
        } catch (e) {
            self.postMessage({ type: "error", message: `Execution failed: ${e.message}` });
            self.postMessage({ type: "log", message: "Script finished with exit code 1." });
        }
    }
});
