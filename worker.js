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
        const responseBuffer = new Uint8Array(sharedBuffer, 4);

        // Reset signal
        Atomics.store(view, 0, 0);

        // Wait for the main thread to signal the response
        while (Atomics.wait(view, 0, 0));

        // Decode the response
        const textDecoder = new TextDecoder();
        this.response = textDecoder.decode(responseBuffer).replace(/\0/g, ""); // Remove null terminators
        this.waiting = false;
    }

    getResponse() {
        return this.response;
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
        };

        const customPrompt = (msg) => {
            const promptInstance = new myPrompt(msg);
            currentPrompt = promptInstance;
            promptInstance.prompt(msg, sharedBuffer);
            return promptInstance.getResponse();
        };

        const executeCode = (userCode) => {
            try {
                const wrappedCode = `
                    (() => {
                        ${userCode}
                    })();
                `;
                const userFunc = new Function("console", "prompt", wrappedCode);
                userFunc(customConsole, customPrompt);
            } catch (e) {
                customConsole.error(e.message);
            }
        };

        executeCode(code);
    }
});
