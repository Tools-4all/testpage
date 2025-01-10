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
    'const objectToString = undefined;',
    'const wrapperPrefixLines = undefined;',
    'const wrapperSuffix = undefined;',
    'const WRAPPER_LINE_COUNT = undefined;',
    'const indentMessage = undefined;',
    'const createWrappedCode = undefined;',
    'const code = undefined;',

    '//# sourceURL=1919191.js',
    '(() => {'
];
console.log("loaded 4e")


const wrapperSuffix = `})();`;

const WRAPPER_LINE_COUNT = wrapperPrefixLines.length + 2;

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
    const lineNum = processedStack[processedStack.length - 1].match(/js:(\d+)/)[1];
    const lastLine = `    at userCode (js:${lineNum})`;

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


function objectToString(obj) {
    if (typeof obj !== "object" || obj === null) {
        return String(obj);
    }
    if (Array.isArray(obj)) {
        return `[${obj.map(item => objectToString(item)).join(", ")}]`;
    }
    const keys = Object.keys(obj);
    const keyValuePairs = keys.map((key, index) => {
        const isNumeric = /^\d+$/.test(key);
        const isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
        const formattedKey = isNumeric || isValidIdentifier ? key : `"${key}"`;
        return `${formattedKey}: ${objectToString(obj[key])}`;
    });
    return `{${keyValuePairs.join(", ")}}`;
}

function indentMessage(message) {
    if (groupLevel <= 0) return message;
    return "  ".repeat(groupLevel) + message;
}



self.addEventListener("message", (event) => {
    const { type, code, sharedBuffer } = event.data;
    if (type === "execute") {
        const countMap = {};
        let groupLevel = 0;
        const timers = {};
        const customConsole = {
            log: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                self.postMessage({ type: "log", message: serializedArgs });
            },
            error: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                self.postMessage({ type: "error", message: serializedArgs });
            },
            warn: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                self.postMessage({ type: "warn", message: serializedArgs });
            },
            info: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                self.postMessage({ type: "info", message: serializedArgs });
            },
            debug: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const stack = getStack();
                self.postMessage({ type: "log", message: `${serializedArgs}\n${stack}` });
            },
            clear: () => self.postMessage({ type: "clear" }),

            table: (data, columns) => {
                if (Array.isArray(data)) {
                    if (data.length === 0) {
                        self.postMessage({ type: "log", message: "[] (Empty Array)" });
                        return;
                    }
                    let dat;
                    if (typeof data[0] === "object") {
                        const headerRow = headers.map(header => header.padEnd(15, ' ')).join('|');
                        const separatorRow = headers.map(() => '---------------').join('+');
                        const rows = data.map(item =>
                            headers.map(header => String(item[header] || '').padEnd(15, ' ')).join('|')
                        );

                        const tableString = `${headerRow}\n${separatorRow}\n${rows.join('\n')}`;
                        dat = tableString;
                    } else {
                        const rows = data.map((item, index) => `${String(index).padEnd(5)}: ${String(item)}`);
                        const tableString = `Index | Value\n------+-------\n${rows.join('\n')}`;
                        dat = tableString;
                    }
                    const keys = columns || Object.keys(data);
                    const rows = keys.map(key => `${key.padEnd(15, ' ')}: ${String(data[key])}`);
                    const tableString = rows.join('\n');
                    dat = tableString;
                } else {
                    dat = String(data)
                }
                self.postMessage({ type: "log", message: dat });
            },

            count: (label = "default") => {
                if (countMap[label]) {
                    countMap[label]++;
                } else {
                    countMap[label] = 1;
                }
                self.postMessage({ type: "log", message: `${label}: ${countMap[label]}` });
            },
            countReset: (label = "default") => {
                countMap[label] = 0;
            },
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
                self.postMessage({ type: "warn", message: "DOM simulation is not implemented yet, please use console.dir for non DOM objects." });
            },
            timeStamp: (label) => self.postMessage({ type: "warn", message: `console.timeStamp is not implemented yet.` }),
            trace: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const stack = getStack();
                self.postMessage({ type: "log", message: `${serializedArgs}\n${stack}` });
            },
            groupCollapsed: (...args) => {
                const message = indentMessage(`\u25B8 groupCollapsed: ${args.join(" ")}`);
                self.postMessage({ type: "log", message });
                groupLevel++;
            },
            groupEnd: () => {
                if (groupLevel > 0) {
                    groupLevel--;
                }
                const message = indentMessage("groupEnd");
                self.postMessage({ type: "log", message });
            },

            profile: (label = "default") => {
                profiles[label] = performance.now();
                const message = indentMessage(`Profile '${label}' started`);
                self.postMessage({ type: "info", message });
            },

            profileEnd: (label = "default") => {
                if (profiles[label]) {
                    const duration = performance.now() - profiles[label];
                    delete profiles[label];
                    const message = indentMessage(`Profile '${label}' finished. Duration: ${duration.toFixed(2)}ms`);
                    self.postMessage({ type: "info", message });
                } else {
                    const message = indentMessage(`No profile '${label}' found`);
                    self.postMessage({ type: "warn", message });
                }
            },

            time: (label = "default") => {
                timers[label] = performance.now();
            },

            timeEnd: (label = "default") => {
                if (timers[label]) {
                    const duration = performance.now() - timers[label];
                    const message = indentMessage(`${label}: ${duration.toFixed(2)}ms`);
                    self.postMessage({ type: "log", message });
                    delete timers[label];
                } else {
                    const message = indentMessage(`No timer called '${label}' found`);
                    self.postMessage({ type: "error", message });
                }
            },

            timeLog: (label = "default", ...args) => {
                if (timers[label]) {
                    const duration = performance.now() - timers[label];
                    const extra = args.length ? " " + args.map(a => objectToString(a)).join(" ") : "";
                    const message = indentMessage(`${label}: ${duration.toFixed(2)}ms${extra}`);
                    self.postMessage({ type: "log", message });
                } else {
                    const message = indentMessage(`No timer called '${label}' found`);
                    self.postMessage({ type: "error", message });
                }
            }
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
