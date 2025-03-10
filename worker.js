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
    'var getStack = undefined;',
    'var relativeStack = undefined;',
    'var objectToString = undefined;',
    'var wrapperPrefixLines = undefined;',
    'var wrapperSuffix = undefined;',
    'var WRAPPER_LINE_COUNT = undefined;',
    'var WRAPPER_LINE_COUNT_FOR_ERR = undefined;',
    'var createWrappedCode = undefined;',
    'var code = undefined;',
    '//# sourceURL=1919191.js',
    '(() => {'
];
console.log("loaded ferre")


function createNodeObject(key, value, visited, depth = 0, isPrototype = false) {
    // Handle primitives
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
        let rep;
        if (typeof value === 'string') {
            rep = '"' + value + '"';
        } else {
            rep = value;
        }
        if (key !== null && key !== undefined) {
            let obj = {};
            obj[key] = rep;
            return obj;
        } else {
            return rep;
        }
    }

    // Check for circular references.
    if (visited.has(value)) {
        if (key !== null && key !== undefined) {
            let obj = {};
            obj[key] = "[Circular]";
            return obj;
        } else {
            return "[Circular]";
        }
    }
    visited.add(value);

    // ----- Special handling for Maps -----
    if (value instanceof Map) {
        let headerText = "Map(" + value.size + ")";
        let children = {};
        let index = 0;
        // For each [k,v] entry, create a nested object showing both key and value.
        for (let [mapKey, mapVal] of value.entries()) {
            let entry = {};
            entry["key"] = createNodeObject(null, mapKey, visited, depth + 1, false);
            entry["value"] = createNodeObject(null, mapVal, visited, depth + 1, false);
            children[String(index)] = entry;
            index++;
        }
        let node = {};
        if (key !== null && key !== undefined) {
            let combinedKey = key + ': ' + headerText;
            node[combinedKey] = children;
        } else {
            node[headerText] = children;
        }
        visited.delete(value);
        return node;
    }

    // ----- Special handling for Sets -----
    if (value instanceof Set) {
        let headerText = "Set(" + value.size + ")";
        let children = {};
        let index = 0;
        // Iterate through set items
        for (let item of value.values()) {
            children[String(index)] = createNodeObject(null, item, visited, depth + 1, false);
            index++;
        }
        let node = {};
        if (key !== null && key !== undefined) {
            let combinedKey = key + ': ' + headerText;
            node[combinedKey] = children;
        } else {
            node[headerText] = children;
        }
        visited.delete(value);
        return node;
    }

    // ----- Special handling for WeakMaps -----
    if (value instanceof WeakMap) {
        let headerText = "WeakMap";
        let node = {};
        node[key ? key + ': ' + headerText : headerText] = { "": "[Not enumerable]" };
        visited.delete(value);
        return node;
    }

    // ----- Special handling for WeakSets -----
    if (value instanceof WeakSet) {
        let headerText = "WeakSet";
        let node = {};
        node[key ? key + ': ' + headerText : headerText] = { "": "[Not enumerable]" };
        visited.delete(value);
        return node;
    }

    // ----- Special handling for TypedArrays -----
    // Check if value is one of the typed array views (but not DataView)
    if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
        let headerText = value.constructor.name + "(" + value.length + ")";
        let children = {};
        // Manually add the non-index properties.
        children["buffer"] = createNodeObject("buffer", value.buffer, visited, depth + 1, false);
        children["byteOffset"] = createNodeObject("byteOffset", value.byteOffset, visited, depth + 1, false);
        children["byteLength"] = createNodeObject("byteLength", value.byteLength, visited, depth + 1, false);
        children["length"] = createNodeObject("length", value.length, visited, depth + 1, false);
        // Also include the toStringTag symbol if available.
        let tag = value[Symbol.toStringTag];
        if (tag) {
            children["Symbol(Symbol.toStringTag)"] = createNodeObject("Symbol(Symbol.toStringTag)", tag, visited, depth + 1, false);
        }
        let node = {};
        if (key !== null && key !== undefined) {
            let combinedKey = key + ': ' + headerText;
            node[combinedKey] = children;
        } else {
            node[headerText] = children;
        }
        visited.delete(value);
        return node;
    }

    // ----- Special handling for Promise -----
    if (value instanceof Promise) {
        // Note: There is no standard synchronous API to determine promise state.
        // Here we insert placeholders similar to Chrome DevTools.
        let headerText = "Promise";
        let children = {};
        children["[[PromiseState]]"] = createNodeObject(null, "[unknown]", visited, depth + 1, false);
        children["[[PromiseResult]]"] = createNodeObject(null, "[unknown]", visited, depth + 1, false);
        let node = {};
        if (key !== null && key !== undefined) {
            let combinedKey = key + ': ' + headerText;
            node[combinedKey] = children;
        } else {
            node[headerText] = children;
        }
        visited.delete(value);
        return node;
    }

    // ----- Default handling for functions, arrays, and objects -----
    let headerText;
    if (typeof value === 'function') {
        headerText = 'ƒ ' + (value.name || 'anonymous') + '()';
    } else if (Array.isArray(value)) {
        if (isPrototype) {
            headerText = "Array(" + (value.length || 0) + ")";
        } else {
            headerText = "[]";
        }
    } else {
        const objectToString = Object.prototype.toString.call(value);
        const match = objectToString.match(/^\[object (.+)\]$/);
        if (match && match[1] !== 'Object') {
            headerText = match[1];
        } else if (match && match[1] === 'Object' && !isPrototype) {
            headerText = "{}";
        } else {
            headerText = "Object";
        }
    }

    let children = {};

    let props = [];
    try {
        props = Object.getOwnPropertyNames(value);
    } catch (e) { }

    props.forEach(function (prop) {
        if (prop === "arguments") {
            try {
                const argVal = value[prop];
                const child = createNodeObject(prop, argVal, visited, depth + 1, false);
                for (let k in child) {
                    children[k] = child[k];
                }
            } catch (e) {
                children[prop] = "[Arguments not accessible]";
            }
        } else {
            try {
                const child = createNodeObject(prop, value[prop], visited, depth + 1, false);
                for (let k in child) {
                    children[k] = child[k];
                }
            } catch (e) {
                children[prop] = "(...)";
            }
        }
    });

    let symbols = [];
    try {
        symbols = Object.getOwnPropertySymbols(value);
    } catch (e) { }
    symbols.forEach(function (sym) {
        try {
            const child = createNodeObject(sym.toString(), value[sym], visited, depth + 1, false);
            for (let k in child) {
                children[k] = child[k];
            }
        } catch (e) {
            children[sym.toString()] = "[Error retrieving property]";
        }
    });

    if (isPrototype && typeof value === 'object' && value !== null) {
        const protoDesc = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');
        if (protoDesc) {
            if (typeof protoDesc.get === 'function') {
                const child = createNodeObject('get __proto__', protoDesc.get, visited, depth + 1, false);
                for (let k in child) {
                    children[k] = child[k];
                }
            }
            if (typeof protoDesc.set === 'function') {
                const child = createNodeObject('set __proto__', protoDesc.set, visited, depth + 1, false);
                for (let k in child) {
                    children[k] = child[k];
                }
            }
        }
    }

    try {
        const proto = Object.getPrototypeOf(value);
        if (proto) {
            const protoNode = createNodeObject('[[Prototype]]', proto, visited, depth + 1, true);
            for (let k in protoNode) {
                children[k] = protoNode[k];
            }
        }
    } catch (e) {
        children['[[Prototype]]'] = "(...)";
    }

    let node = {};
    if (key !== null && key !== undefined) {
        const combinedKey = key + ': ' + headerText;
        node[combinedKey] = children;
    } else {
        node[headerText] = children;
    }

    visited.delete(value);
    return node;
}


function renderObject(obj) {
    const visited = new Set();
    return createNodeString(null, obj, visited);
}

function formatValue(value) {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return '"' + value + '"';
    if (typeof value === "number" || typeof value === "boolean") return value.toString();
    if (typeof value === "function") return "ƒ " + (value.name || "anonymous") + "()";
    if (Array.isArray(value)) return "Array(" + value.length + ")";
    if (typeof value === "object") return "Object";
    return value.toString();
}

function buildTableData(input) {
    // Special handling for Map:
    if (input instanceof Map) {
        return {
            tableData: {
                "(index)": ["size"],
                "Values": [String(input.size)]
            },
            headerOrder: ["(index)", "Values"]
        };
    }

    // Special handling for Set:
    if (input instanceof Set) {
        return {
            tableData: {
                "(index)": ["size"],
                "Values": [String(input.size)]
            },
            headerOrder: ["(index)", "Values"]
        };
    }

    // Special handling for Date:
    if (input instanceof Date) {
        return {
            tableData: {
                "(index)": ["time", "ISO", "Locale"],
                "Values": [input.getTime(), input.toISOString(), input.toLocaleString()]
            },
            headerOrder: ["(index)", "Values"]
        };
    }

    // Special handling for RegExp:
    if (input instanceof RegExp) {
        return {
            tableData: {
                "(index)": [
                    "lastIndex", "dotAll", "flags", "global", "hasIndices",
                    "ignoreCase", "multiline", "source", "sticky", "unicode", "unicodeSets"
                ],
                "Values": [
                    input.lastIndex, input.dotAll, input.flags, input.global, input.hasIndices,
                    input.ignoreCase, input.multiline, input.source, input.sticky, input.unicode, input.unicodeSets
                ]
            },
            headerOrder: ["(index)", "Values"]
        };
    }

    // Special handling for functions:
    if (typeof input === "function") {
        return {
            tableData: {
                "(index)": ["(value)"],
                "Values": ["ƒ " + (input.name || "anonymous") + "()"]
            },
            headerOrder: ["(index)", "Values"]
        };
    }

    // For primitives that are not objects/arrays:
    let isInputArray = Array.isArray(input);
    if (!isInputArray && (typeof input !== "object" || input === null)) {
        return {
            tableData: {
                "(index)": ["(value)"],
                "Values": [formatValue(input)]
            },
            headerOrder: ["(index)", "Values"]
        };
    }

    // Process plain objects or arrays
    let rowLabels = [];
    let rowData = [];
    let columnsSet = new Set();

    if (isInputArray) {
        // For arrays, iterate over each element
        input.forEach((element, index) => {
            rowLabels.push(index);
            rowData.push(element);
            if (element !== null && typeof element === "object") {
                Object.keys(element).forEach(key => columnsSet.add(key));
                Object.getOwnPropertySymbols(element).forEach(sym => {
                    columnsSet.add(sym.toString());
                });
            } else {
                columnsSet.add("Values");
            }
        });
    } else {
        // For plain objects, include both string and symbol keys
        // First, process string keys.
        Object.keys(input).forEach(key => {
            rowLabels.push(key);
            rowData.push(input[key]);
            if (input[key] !== null && typeof input[key] === "object") {
                Object.keys(input[key]).forEach(key2 => columnsSet.add(key2));
                Object.getOwnPropertySymbols(input[key]).forEach(sym => {
                    columnsSet.add(sym.toString());
                });
            } else {
                columnsSet.add("Values");
            }
        });
        // Then, process symbol keys.
        Object.getOwnPropertySymbols(input).forEach(sym => {
            const symStr = sym.toString();
            rowLabels.push(symStr);
            rowData.push(input[sym]);
            if (input[sym] !== null && typeof input[sym] === "object") {
                Object.keys(input[sym]).forEach(key2 => columnsSet.add(key2));
                Object.getOwnPropertySymbols(input[sym]).forEach(s => {
                    columnsSet.add(s.toString());
                });
            } else {
                columnsSet.add("Values");
            }
        });
    }

    // Separate numeric and non-numeric keys from the collected columns.
    let numericKeys = [];
    let nonNumericKeys = [];
    columnsSet.forEach(key => {
        if (!isNaN(Number(key)) && key.trim() !== "") {
            numericKeys.push(key);
        } else {
            nonNumericKeys.push(key);
        }
    });
    numericKeys.sort((a, b) => Number(a) - Number(b));
    // For header order, always put "(index)" first.
    let headerOrder = ["(index)"].concat(nonNumericKeys.filter(k => k !== "(index)"), numericKeys);

    // Build tableData rows.
    let tableData = {};
    tableData["(index)"] = rowLabels;
    headerOrder.slice(1).forEach(col => {
        tableData[col] = [];
    });

    for (let i = 0; i < rowData.length; i++) {
        let row = rowData[i];
        headerOrder.slice(1).forEach(col => {
            if (row !== null && typeof row === "object") {
                if (Array.isArray(row)) {
                    if (row.hasOwnProperty(col)) {
                        tableData[col][i] = (row[col] !== null && typeof row[col] === "object")
                            ? "{...}"
                            : formatValue(row[col]);
                    } else {
                        tableData[col][i] = "";
                    }
                } else {
                    if (row.hasOwnProperty(col)) {
                        tableData[col][i] = (row[col] !== null && typeof row[col] === "object")
                            ? "{...}"
                            : formatValue(row[col]);
                    } else {
                        tableData[col][i] = "";
                    }
                }
            } else {
                tableData[col][i] = (col === "Values") ? formatValue(row) : "";
            }
        });
    }

    return { tableData, headerOrder };
}





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
        if (deduped[lastIndex]) {
            deduped[lastIndex].fn
        }
    }

    return deduped
        .map(f => `at ${f.fn} (js:${f.line})`)
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
                result.push(`at userCode (js:${finalLine})`);
                break;
            } else {
                result.push(`at ${fn} (js:${finalLine})`);
            }
            continue;
        }
        const matchNoFn = line.match(/at ([^:]+):(\d+):(\d+)/);
        if (matchNoFn) {
            const ln = parseInt(matchNoFn[2], 10);
            const adj = ln - WRAPPER_LINE_COUNT_FOR_ERR;
            const finalLine = adj > 0 ? adj : ln;
            result.push(`at userCode (js:${finalLine})`);
            break;
        }
    }

    if (!result.length) return '';

    const last = result[result.length - 1];
    if (!/userCode \(js:\d+\)/.test(last)) {
        const lnMatch = last.match(/js:(\d+)/);
        const ln = lnMatch ? lnMatch[1] : '?';
        result.push(`at userCode (js:${ln})`);
    }

    return result.join('\n');
}




class myPrompt {
    constructor(msg = "") {
        this.msg = msg;
        this.response = null;
        this.waiting = false;
    }

    prompt(msg, defaultValue, sharedBuffer) {
        self.postMessage({ type: "prompt", message: msg, default: defaultValue });
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


function objectToString(obj) {
    if (typeof obj === "bigint") {
        return `${obj.toString()}n`;
    }
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

function getObjectOrString(...args) {
    let objs = {}
    let num = 0
    args.forEach(arg => {
        if (["object", "function"].includes(typeof arg) && arg !== null) {
            objs[num] = [createNodeObject(null, arg, new Set()), true]
        } else {
            objs[num] = [objectToString(arg), false]
        }
        num++
    });
    return objs
}


self.addEventListener("message", (event) => {
    const { type, code, sharedBuffer, flexSwitchCheckDefault } = event.data;
    if (type === "execute") {
        const countMap = {};
        let groupLevel = 0;
        const timers = {};
        const profiles = {};
        const headers = [];
        const customConsole = {
            log: (...args) => {
                const objs = getObjectOrString(...args);
                self.postMessage({ type: "log", message: objs });
            },
            error: (...args) => {
                const objs = getObjectOrString(...args);
                self.postMessage({ type: "error", message: objs, forceUse: false });
            },
            warn: (...args) => {
                const objs = getObjectOrString(...args);
                self.postMessage({ type: "warn", message: objs });
            },
            info: (...args) => {
                const objs = getObjectOrString(...args);
                self.postMessage({ type: "info", message: objs });
            },
            debug: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const stack = getStack();
                self.postMessage({ type: "log", message: `${serializedArgs}\n   ${stack.split("\n").join("\n   ")}` });
            },
            clear: () => self.postMessage({ type: "clear" }),

            table: (data, columns) => {
                if (
                    data === null ||
                    data === undefined ||
                    typeof data === "number" ||
                    typeof data === "string" ||
                    typeof data === "boolean"
                ) {
                    customConsole.log(String(data));
                    return;
                } else if (typeof data === "symbol" || typeof data === "function") {
                    customConsole.log(data);
                    return;
                } else if (typeof data === "bigint") {
                    customConsole.log(data.toString() + "n");
                    return;
                }
                const tableData = buildTableData(data);
                self.postMessage({
                    type: "table",
                    table: tableData,
                    object: getObjectOrString(data),
                });
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
                // need to change getObjectOrString to take an argument isdir to display for example for [] Array(0) instead of [] etc
                const html = getObjectOrString(obj);
                self.postMessage({ type: "log", message: html });
            },
            dirxml: (obj) => {
                self.postMessage({ type: "warn", message: "DOM simulation is not implemented yet, please use console.dir for non DOM objects." });
            },
            timeStamp: (label) => self.postMessage({ type: "warn", message: `console.timeStamp is not implemented yet.` }),
            trace: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const stack = getStack();
                self.postMessage({ type: "log", message: `${serializedArgs}\n   ${stack.split("\n").join("\n   ")}` });
            },
            group: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const message = `${serializedArgs}`;
                self.postMessage({ type: "group", message, collapsed: false });
                groupLevel++;
            },
            groupCollapsed: (...args) => {
                const serializedArgs = args.map(arg => objectToString(arg)).join(" ");
                const message = `${serializedArgs}`;
                self.postMessage({ type: "group", message, collapsed: true });
                groupLevel++;
            },
            groupEnd: () => {
                if (groupLevel > 0) {
                    groupLevel--;
                    self.postMessage({ type: "groupEnd" });
                }
            },


            profile: (label = "default") => {
                profiles[label] = performance.now();
                const message = `Profile '${objectToString(label)}' started`;
                self.postMessage({ type: "info", message });
            },

            profileEnd: (label = "default") => {
                if (profiles[label]) {
                    const duration = performance.now() - profiles[label];
                    delete profiles[label];
                    const message = `Profile '${objectToString(label)}' finished. Duration: ${duration.toFixed(2)}ms`;
                    self.postMessage({ type: "info", message });
                } else {
                    const message = `No profile '${objectToString(label)}' found`;
                    self.postMessage({ type: "warn", message });
                }
            },

            time: (label = "default") => {
                timers[label] = performance.now();
            },

            timeEnd: (label = "default") => {
                if (timers[label]) {
                    const duration = performance.now() - timers[label];
                    const message = `${objectToString(label)}: ${duration.toFixed(2)}ms`;
                    self.postMessage({ type: "log", message });
                    delete timers[label];
                } else {
                    const message = `No timer called '${objectToString(label)}' found`;
                    self.postMessage({ type: "error", message });
                }
            },

            timeLog: (label = "default", ...args) => {
                if (timers[label]) {
                    const duration = performance.now() - timers[label];
                    const extra = args.length ? " " + args.map(a => objectToString(a)).join(" ") : "";
                    const message = `${objectToString(label)}: ${duration.toFixed(2)}ms${extra}`;
                    self.postMessage({ type: "log", message });
                } else {
                    const message = `No timer called '${objectToString(label)}' found`;
                    self.postMessage({ type: "error", message });
                }
            }
        };

        const customPrompt = (message = "", defaultValue = null) => {
            const promptInstance = new myPrompt(message);
            promptInstance.prompt(message, defaultValue, sharedBuffer);
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
                if (flexSwitchCheckDefault) {
                    self.postMessage({ type: "log", message: "Script finished with exit code 0.", forceUse: true });
                }
            } catch (e) {
                self.postMessage({ type: "error", message: `Uncaught ${e.name}: ${e.message}\n${relativeStack(e)}`, forceUse: true });
                if (flexSwitchCheckDefault) {
                    self.postMessage({ type: "log", message: "Script finished with exit code 1.", forceUse: true });
                }
            }
        };

        try {
            executeCode(code);
        } catch (e) {
            self.postMessage({ type: "error", message: `Execution failed: ${e.message}`, forceUse: true });
            if (flexSwitchCheckDefault) {
                self.postMessage({ type: "log", message: "Script finished with exit code 1.", forceUse: true });
            }
        }
        if (flexSwitchCheckDefault) {
            self.close();
        }
    }
});
