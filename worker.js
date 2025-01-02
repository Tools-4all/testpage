class myPrompt {
    constructor(msg = "") {
        this.msg = msg;
        this.response = null;
        this.waiting = false;
    }

    prompt(msg, sharedBuffer) {
        console.log("new")
        self.postMessage({ type: "prompt", message: msg });
        this.waiting = true;

        const view = new Int32Array(sharedBuffer);

        // Reset signal before waiting
        Atomics.store(view, 0, 0);

        // Wait for the main thread to signal
        while (Atomics.wait(view, 0, 0) === "ok");

        // Create a copy of the shared buffer for decoding
        const sharedResponseBuffer = new Uint8Array(sharedBuffer, 4);
        const copiedBuffer = new Uint8Array(sharedResponseBuffer.length);
        copiedBuffer.set(sharedResponseBuffer);

        // Decode the response
        const textDecoder = new TextDecoder();
        this.response = textDecoder.decode(copiedBuffer).replace(/\0/g, ""); // Remove null terminators

        // Reset signal after processing response
        Atomics.store(view, 0, 0);

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
