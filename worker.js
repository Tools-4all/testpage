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
    'var console = customConsole;',
    'var prompt = customPrompt;',
    'var alert = customAlert;',
    'var self = undefined;',
    'var postMessage = undefined;',
    'var fetch = undefined;',
    'var XMLHttpRequest = undefined;',
    'var WebSocket = undefined;',
    'var importScripts = undefined;',
    'var sharedBuffer = undefined;',
    'var myPrompt = undefined;',
    'var myPromptInstance = undefined;',
    'var executeCode = undefined;',
    'var userFunc = undefined;',
    'var myDir = undefined;',
    'var getStack = undefined;',
    'var relativeStack = undefined;',
    'var objectToString = undefined;',
    'var wrapperPrefixLines = undefined;',
    'var wrapperSuffix = undefined;',
    'var WRAPPER_LINE_COUNT = undefined;',
    'var WRAPPER_LINE_COUNT_FOR_ERR = undefined;',
    'var indentMessage = undefined;',
    'var createWrappedCode = undefined;',
    'const code = undefined;',
    '//# sourceURL=1919191.js',
    '(() => {'
];
console.log("loaded ferre")


const wrapperSuffix = `})();`;

const WRAPPER_LINE_COUNT = wrapperPrefixLines.length + 2;
const WRAPPER_LINE_COUNT_FOR_ERR = wrapperPrefixLines.length + 2;
function createWrappedCode(userCode) {
    return wrapperPrefixLines.join('\n') + '\n' + userCode + wrapperSuffix;
}


function getStack() {
    const rawLines = new Error().stack.split('\n');
    const userScript = '1919191.js';
    const frames = [];

    for (const line of rawLines) {
        if (!line.includes(userScript)) continue;

        const matchFn = line.match(/at ([^(]+)\(([^:]+):(\d+):(\d+)\)/);
        if (matchFn) {
            const fnName = matchFn[1].trim();
            const fileLine = parseInt(matchFn[3], 10);
            const lineNum = fileLine - WRAPPER_LINE_COUNT > 0 ? fileLine - WRAPPER_LINE_COUNT : fileLine;
            frames.push({ fn: fnName, line: lineNum });
            continue;
        }

        const matchNoFn = line.match(/at ([^:]+):(\d+):(\d+)/);
        if (matchNoFn) {
            const fnName = matchNoFn[1].trim();
            const fileLine = parseInt(matchNoFn[2], 10);
            const lineNum = fileLine - WRAPPER_LINE_COUNT > 0 ? fileLine - WRAPPER_LINE_COUNT : fileLine;
            frames.push({ fn: fnName, line: lineNum });
        }
    }

    const deduped = [];
    for (let i = 0; i < frames.length; i++) {
        if (i > 0 && frames[i].line === frames[i - 1].line) {
            continue;
        }
        deduped.push(frames[i]);
    }


    if (deduped.length) {
        deduped.pop();
        const lastIndex = deduped.length - 1;
        deduped[lastIndex].fn = 'userCode';
    }

    return deduped
        .map(f => `    at ${f.fn} (js:${f.line})`)
        .join('\n');
}


function relativeStack(error) {
    const lines = error.stack.split('\n');
    const userScript = '1919191.js';
    const result = [];

    for (const line of lines) {
        if (!line.includes(userScript)) continue;
        const matchFn = line.match(/at (\S+) \(([^:]+):(\d+):(\d+)\)/);
        if (matchFn) {
            const fn = matchFn[1];
            const ln = parseInt(matchFn[3], 10);
            const adj = ln - WRAPPER_LINE_COUNT_FOR_ERR;
            const finalLine = adj > 0 ? adj : ln;
            if (fn === 'eval' || fn === '<anonymous>') {
                result.push(`    at userCode (js:${finalLine})`);
                break;
            } else {
                result.push(`    at ${fn} (js:${finalLine})`);
            }
            continue;
        }
        const matchNoFn = line.match(/at ([^:]+):(\d+):(\d+)/);
        if (matchNoFn) {
            const ln = parseInt(matchNoFn[2], 10);
            const adj = ln - WRAPPER_LINE_COUNT_FOR_ERR;
            const finalLine = adj > 0 ? adj : ln;
            result.push(`    at userCode (js:${finalLine})`);
            break;
        }
    }

    if (!result.length) return '';

    const last = result[result.length - 1];
    if (!/userCode \(js:\d+\)/.test(last)) {
        const lnMatch = last.match(/js:(\d+)/);
        const ln = lnMatch ? lnMatch[1] : '?';
        result.push(`    at userCode (js:${ln})`);
    }

    return result.join('\n');
}

function cloneForConsoleTable(value, seen = new WeakMap(), path = "") {
    if (
        value === null ||
        value === undefined ||
        typeof value !== "object"
    ) {
        return value;
    }

    if (seen.has(value)) {
        return `[Circular ~${seen.get(value)}]`;
    }
    seen.set(value, path || ".");

    // Now clone
    if (Array.isArray(value)) {
        let arrClone = [];
        value.forEach((item, idx) => {
            arrClone[idx] = cloneForConsoleTable(item, seen, path + `[${idx}]`);
        });
        return arrClone;
    } else {
        let objClone = {};
        Object.keys(value).forEach(key => {
            objClone[key] = cloneForConsoleTable(
                value[key],
                seen,
                path ? path + "." + key : key
            );
        });
        return objClone;
    }
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


function objectToHTML(obj, level = 0) {
    if (obj === null) {
        return `<span style="color:#aaa;">null</span>`;
    }
    if (typeof obj !== "object") {
        return `<span>${escapeHtml(String(obj))}</span>`;
    }

    if (Array.isArray(obj)) {
        let html = `<details open style="margin-left:${level * 20}px;">`;
        html += `<summary>Array(${obj.length})</summary>`;
        obj.forEach((value, i) => {
            html += `<div style="margin-left:${(level + 1) * 20}px;">[${i}] => ${objectToHTML(value, level + 1)}</div>`;
        });
        html += `</details>`;
        return html;
    }

    const keys = Object.keys(obj);
    let html = `<details open style="margin-left:${level * 20}px;">`;
    html += `<summary>Object {${keys.length} keys}</summary>`;
    keys.forEach((key) => {
        html += `<div style="margin-left:${(level + 1) * 20}px;">
                 <strong>${escapeHtml(key)}</strong>: 
                 ${objectToHTML(obj[key], level + 1)}
               </div>`;
    });
    html += `</details>`;
    return html;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
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



self.addEventListener("message", (event) => {
    const { type, code, sharedBuffer } = event.data;
    if (type === "execute") {
        const countMap = {};
        let groupLevel = 0;
        const timers = {};
        const profiles = {};
        const headers = [];
        function indentMessage(message) {
            if (groupLevel <= 0) return message;
            return "  ".repeat(groupLevel) + message;
        }
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
                if (
                    data === null ||
                    data === undefined ||
                    typeof data === "number" ||
                    typeof data === "string" ||
                    typeof data === "boolean" ||
                    typeof data === "bigint" ||
                    typeof data === "symbol"
                ) {
                    self.postMessage({ type: "log", message: String(data) });
                    return;
                }

                if (typeof data === "function") {
                    let fnString;
                    try {
                        fnString = Function.prototype.toString.call(data);
                    } catch {
                        fnString = "[Function]";
                    }
                    self.postMessage({ type: "log", message: fnString });
                    return;
                }

                let safeData;
                try {
                    safeData = cloneForConsoleTable(data); 
                } catch (err) {
                    self.postMessage({
                        type: "log",
                        message: `[Uncloneable data] ${err.message}`
                    });
                    return;
                }

                try {
                    self.postMessage({
                        type: "table",
                        tableData: safeData,
                        tableColumns: columns
                    });
                } catch (err) {
                    self.postMessage({
                        type: "log",
                        message: `[Uncloneable data] ${err.message}`
                    });
                }
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
                const htmlRepresentation = objectToHTML(obj, 0);
                // Instead of posting type: "log", we can post type: "dir" 
                // and include our HTML so the main thread knows it’s HTML
                self.postMessage({
                    type: "log",
                    message: htmlRepresentation
                });
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
            group: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const message = indentMessage(`group: ${serializedArgs}`);
                self.postMessage({ type: "log", message });
                groupLevel++;
            },
            groupCollapsed: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const message = indentMessage(`groupCollapsed: ${serializedArgs}`);
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
                const message = indentMessage(`Profile '${objectToString(label)}' started`);
                self.postMessage({ type: "info", message });
            },

            profileEnd: (label = "default") => {
                if (profiles[label]) {
                    const duration = performance.now() - profiles[label];
                    delete profiles[label];
                    const message = indentMessage(`Profile '${objectToString(label)}' finished. Duration: ${duration.toFixed(2)}ms`);
                    self.postMessage({ type: "info", message });
                } else {
                    const message = indentMessage(`No profile '${objectToString(label)}' found`);
                    self.postMessage({ type: "warn", message });
                }
            },

            time: (label = "default") => {
                timers[label] = performance.now();
            },

            timeEnd: (label = "default") => {
                if (timers[label]) {
                    const duration = performance.now() - timers[label];
                    const message = indentMessage(`${objectToString(label)}: ${duration.toFixed(2)}ms`);
                    self.postMessage({ type: "log", message });
                    delete timers[label];
                } else {
                    const message = indentMessage(`No timer called '${objectToString(label)}' found`);
                    self.postMessage({ type: "error", message });
                }
            },

            timeLog: (label = "default", ...args) => {
                if (timers[label]) {
                    const duration = performance.now() - timers[label];
                    const extra = args.length ? " " + args.map(a => objectToString(a)).join(" ") : "";
                    const message = indentMessage(`${objectToString(label)}: ${duration.toFixed(2)}ms${extra}`);
                    self.postMessage({ type: "log", message });
                } else {
                    const message = indentMessage(`No timer called '${objectToString(label)}' found`);
                    self.postMessage({ type: "error", message });
                }
            }
        };

        const customPrompt = (msg = "") => {
            const promptInstance = new myPrompt(msg);
            promptInstance.prompt(msg, sharedBuffer);
            return promptInstance.getResponse();
        };

        function customAlert(msg) {
            if (msg === undefined) {
                msg = "";
            }
            self.postMessage({ type: "alert", message: msg });

            const view = new Int32Array(sharedBuffer);
            Atomics.store(view, 0, 0);
            while (Atomics.wait(view, 0, 0) === "ok");
        }


        const executeCode = (userCode) => {
            try {
                const wrappedCode = createWrappedCode(userCode);
                const userFunc = new Function("customConsole", "customPrompt", "customAlert", wrappedCode);
                userFunc(customConsole, customPrompt, customAlert);
                self.postMessage({ type: "log", message: "Script finished with exit code 0." });
            } catch (e) {
                customConsole.error(`Uncaught ${e.name}: ${e.message}`);

                const errorStack = relativeStack(e);
                customConsole.error(errorStack);

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
