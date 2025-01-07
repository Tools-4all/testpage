importScripts("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js");


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
    'var console = customConsole;',          // Changed from 'const' to 'var'
    'var prompt = customPrompt;',            // Changed from 'const' to 'var'
    'var self = undefined;',                 // Changed from 'const' to 'var'
    'var postMessage = undefined;',          // Changed from 'const' to 'var'
    'var fetch = undefined;',                // Changed from 'const' to 'var'
    'var XMLHttpRequest = undefined;',       // Changed from 'const' to 'var'
    'var WebSocket = undefined;',            // Changed from 'const' to 'var'
    'var importScripts = undefined;',        // Changed from 'const' to 'var'
    'var sharedBuffer = undefined;',         // Changed from 'const' to 'var'
    'var myPrompt = undefined;',             // Changed from 'const' to 'var'
    'var myPromptInstance = undefined;',     // Changed from 'const' to 'var'
    'var executeCode = undefined;',          // Changed from 'const' to 'var'
    'var userFunc = undefined;',             // Changed from 'const' to 'var'
    'var myDir = undefined;',                // Changed from 'const' to 'var'
    'var getStack = undefined;',             // Changed from 'const' to 'var'
    '//# sourceURL=js',                       // Updated to match the stack trace identifier
    '(() => {'
];
console.log("loaded 4");


const wrapperSuffix = `})();`;

// Adjusted WRAPPER_LINE_COUNT to account for wrapper lines and additional lines introduced by wrapping
// wrapperPrefixLines.length = 18
// +1 for the newline before user code
// Total wrapper lines before user code: 19
const WRAPPER_LINE_COUNT = wrapperPrefixLines.length + 1;

function createWrappedCode(userCode) {
    return wrapperPrefixLines.join('\n') + '\n' + userCode + '\n' + wrapperSuffix;
}

// Minimal VLQ Encoder for Source Maps
function encodeVLQ(value) {
    const VLQ_BASE_SHIFT = 5;
    const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    const VLQ_BASE_MASK = VLQ_BASE - 1;
    const VLQ_CONTINUATION_BIT = VLQ_BASE;

    let encoded = '';
    let vlq = value < 0 ? ((-value) << 1) + 1 : (value << 1) + 0;

    do {
        let digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
            digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += toBase64(digit);
    } while (vlq > 0);

    return encoded;
}

// Base64 Characters
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Convert integer to Base64 character
function toBase64(integer) {
    return base64Chars[integer];
}

// Generate Mappings String for Source Map
function generateMappings(wrapperLineOffset, userCodeLines) {
    let mappings = '';
    let previousGeneratedColumn = 0;
    let previousSourceIndex = 0;
    let previousOriginalLine = 0;
    let previousOriginalColumn = 0;

    userCodeLines.forEach((line, index) => {
        const generatedLine = wrapperLineOffset + index;
        const originalLine = index;
        const originalColumn = 0;
        const generatedColumn = 0;
        const sourceIndex = 0;

        // Calculate deltas
        const deltaGeneratedColumn = generatedColumn - previousGeneratedColumn;
        const deltaSourceIndex = sourceIndex - previousSourceIndex;
        const deltaOriginalLine = originalLine - previousOriginalLine;
        const deltaOriginalColumn = originalColumn - previousOriginalColumn;

        // Encode the segment
        const segment = encodeVLQ(deltaGeneratedColumn) +
                        encodeVLQ(deltaSourceIndex) +
                        encodeVLQ(deltaOriginalLine) +
                        encodeVLQ(deltaOriginalColumn);

        // Append to mappings
        mappings += segment + ',';

        // Update previous values
        previousGeneratedColumn = generatedColumn;
        previousSourceIndex = sourceIndex;
        previousOriginalLine = originalLine;
        previousOriginalColumn = originalColumn;
    });

    // Remove trailing comma and replace with semicolon for new lines
    mappings = mappings.slice(0, -1) + ';';

    return mappings;
}

function createSourceMap(userCode, wrapperLineOffset) {
    const userCodeLines = userCode.split('\n');
    const mappings = generateMappings(wrapperLineOffset, userCodeLines);

    const sourceMap = {
        version: 3,
        file: 'js',
        sources: ['userCode'],
        names: [],
        mappings: mappings
    };

    return sourceMap;
}

function createWrappedCodeWithSourceMap(userCode) {
    const wrappedCode = createWrappedCode(userCode);

    // Calculate the line offset where user code starts
    const wrapperLineOffset = wrapperPrefixLines.length + 1; // +1 for the newline before user code

    const sourceMap = createSourceMap(userCode, wrapperLineOffset);

    // Convert source map to Base64
    const sourceMapBase64 = btoa(JSON.stringify(sourceMap));

    // Append sourceMappingURL comment
    const wrappedCodeWithSourceMap = wrappedCode + `\n//# sourceMappingURL=data:application/json;base64,${sourceMapBase64}`;

    return wrappedCodeWithSourceMap;
}

function getStack() {
    const stack = new Error().stack.split('\n');
    const userScriptIdentifier = 'js'; // Matches '//# sourceURL=js'
    let processedStack = [];
    stack.forEach(line => {
        if (line.includes(userScriptIdentifier)) {
            const regex = /at (\S+) \(([^:]+):(\d+):(\d+)\)/;
            const match = line.match(regex);
            if (match) {
                let functionName = match[1];
                const lineNumber = parseInt(match[3], 10);
                
                // Optional: Rename 'executeCode' to 'js' in the stack trace
                if (functionName === 'executeCode') {
                    functionName = 'js';
                }

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
    return processedStack.join('\n');
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
            // timeEnd: (label = "default") => self.postMessage({ type: "timeEnd", message: label || "default" }),
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
                const wrappedCodeWithSourceMap = createWrappedCodeWithSourceMap(userCode);
                // Create a Blob with the wrapped code
                const blob = new Blob([wrappedCodeWithSourceMap], { type: 'application/javascript' });
                const blobURL = URL.createObjectURL(blob);
                // Execute the wrapped code using importScripts
                importScripts(blobURL);
                // Revoke the Blob URL after execution to free memory
                URL.revokeObjectURL(blobURL);
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
