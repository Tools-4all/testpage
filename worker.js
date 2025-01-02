{% load static %}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VSCode-like Sandboxed JS Compiler</title>
    <link rel="stylesheet" data-name="vs/editor/editor.main" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/editor/editor.main.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: 'Fira Code', monospace;
        display: flex;
        flex-direction: row;
        height: 100vh;
        background-color: #1e1e1e;
        color: #d4d4d4;
        overflow: hidden;
      }
      #activityBar {
        width: 50px;
        background-color: #252526;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 10px;
        border-right: 1px solid #333;
        transition: width 0.3s ease;
        flex-shrink: 0;
      }
      #activityBar .icon {
        color: #b3b3b3;
        padding: 12px 0;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s;
        width: 100%;
        text-align: center;
        font-size: 20px;
      }
      #activityBar .icon:hover,
      #activityBar .icon.active {
        background-color: #3c3c3c;
        color: #fff;
      }
      .sidebar-panel {
        width: 250px;
        background-color: #1e1e1e;
        border-right: 1px solid #333;
        overflow-y: auto;
        padding: 10px;
        display: none;
        flex-shrink: 0;
      }
      .sidebar-panel.active {
        display: block;
      }
      #mainContainer {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }
      #editorAndOutput {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
        height: calc(100% - 24px);
      }
      #editorContainer {
        flex: 1;
        position: relative;
        height: 100%;
      }
      #outputContainer {
        height: 200px;
        background-color: #1e1e1e;
        border-top: 1px solid #333;
        display: flex;
        flex-direction: column;
      }
      #controls {
        display: flex;
        justify-content: flex-end;
        padding: 8px 12px;
        background-color: #252526;
        border-bottom: 1px solid #333;
      }
      #runButton {
        padding: 6px 12px;
        background-color: #0e639c;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
      #runButton:hover {
        background-color: #1177bb;
      }
      #runButton i {
        margin-right: 5px;
      }
      #output {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        white-space: pre-wrap;
        background-color: #1e1e1e;
      }
      .log {
        color: #d4d4d4;
      }
      .error {
        color: #f44747;
      }
      .warn {
        color: #cca700;
      }
      .info {
        color: #3794ff;
      }
      .prompt-line {
        display: flex;
        align-items: center;
        margin-top: 5px;
        color: #d4d4d4;
        font-family: 'Fira Code', monospace;
        font-size: 14px;
      }
      .prompt-line span {
        margin-right: 5px;
        white-space: pre;
      }
      .prompt-line input {
        flex: 1;
        padding: 0;
        margin: 0;
        border: none;
        outline: none;
        background: transparent;
        color: #d4d4d4;
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        caret-color: #d4d4d4;
      }
      #statusBar {
        height: 24px;
        background-color: #252526;
        border-top: 1px solid #333;
        display: flex;
        align-items: center;
        padding: 0 10px;
        font-size: 12px;
        color: #cccccc;
        flex-shrink: 0;
      }
      .monaco-editor {
        width: 100%;
        height: 100%;
      }
      @media (max-width: 768px) {
        #activityBar {
          width: 40px;
        }
        #activityBar .icon {
          font-size: 18px;
          padding: 10px 0;
        }
        .sidebar-panel {
          width: 200px;
        }
        #runButton {
          padding: 6px 10px;
          font-size: 12px;
        }
        #statusBar {
          left: 50px;
        }
      }
    </style>
  </head>
  <body>
    <div id="activityBar">
      <div class="icon active" id="explorerIcon">
        <i class="fas fa-folder"></i>
      </div>
      <div class="icon" id="searchIcon">
        <i class="fas fa-search"></i>
      </div>
      <div class="icon" id="gitIcon">
        <i class="fas fa-code-branch"></i>
      </div>
      <div class="icon" id="extensionsIcon">
        <i class="fas fa-puzzle-piece"></i>
      </div>
    </div>

    <div id="explorerPanel" class="sidebar-panel active">
      <ul>
        <li>
          <i class="fas fa-file"></i> index.js
        </li>
        <li>
          <i class="fas fa-file"></i> script.js
        </li>
        <li>
          <i class="fas fa-file"></i> style.css
        </li>
      </ul>
    </div>
    <div id="searchPanel" class="sidebar-panel">
      <input type="text" placeholder="Search...">
    </div>
    <div id="gitPanel" class="sidebar-panel">
      <p>No repository found.</p>
    </div>
    <div id="extensionsPanel" class="sidebar-panel">
      <p>No extensions installed.</p>
    </div>

    <div id="mainContainer">
      <div id="editorAndOutput">
        <div id="editorContainer"></div>
        <div id="outputContainer">
          <div id="controls">
            <button id="runButton"><i class="fas fa-play"></i> Run</button>
          </div>
          <div id="output"></div>
        </div>
      </div>

      <div id="statusBar">Ln 1, Col 1 | UTF-8 | Spaces: 3 | JavaScript</div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
    <script>
      const workerPath = "{% url 'betzi_test_js' %}";
      let workerBlobURL = null;
      const sharedBuffer = new SharedArrayBuffer(1024);
      const view = new Int32Array(sharedBuffer);

      const cacheWorkerCode = async () => {
        if (!workerBlobURL) {
          const response = await fetch(workerPath);
          const code = await response.text();
          const blob = new Blob([code], { type: 'application/javascript' });
          workerBlobURL = URL.createObjectURL(blob);
        }
      };

      const initializeWorker = () => {
        if (!workerBlobURL) {
          console.error('Worker code has not been cached yet.');
          return null;
        }
        return new Worker(workerBlobURL);
      };

      const clearConsole = () => {
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';
      };

      const appendToOutput = (type, message) => {
        const outputDiv = document.getElementById('output');
        const line = document.createElement('div');
        line.className = type;
        line.textContent = `[${type.toUpperCase()}] ${message}`;
        outputDiv.appendChild(line);
        outputDiv.scrollTop = outputDiv.scrollHeight;
      };

      const handlePrompt = (msg) => {
        return new Promise((resolve) => {
          const promptLine = document.createElement('div');
          promptLine.className = 'prompt-line';
          const promptMsg = document.createElement('span');
          promptMsg.textContent = `[PROMPT] ${msg}`;
          const input = document.createElement('input');
          input.type = 'text';
          input.autocomplete = 'off';

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              const value = input.value.trim();
              promptMsg.textContent = `[PROMPT] ${msg} ${value}`;
              input.remove();
              const textEncoder = new TextEncoder();
              const encodedResponse = textEncoder.encode(value + '\0');
              const responseBuffer = new Uint8Array(sharedBuffer, 4);
              responseBuffer.fill(0);
              responseBuffer.set(encodedResponse);

              Atomics.store(view, 0, 1);
              Atomics.notify(view, 0);

              resolve();
            }
          });

          promptLine.appendChild(promptMsg);
          promptLine.appendChild(input);
          document.getElementById('output').appendChild(promptLine);
          input.focus();
        });
      };
      let currentWorker = null;

      document.getElementById('runButton').addEventListener('click', async () => {
        clearConsole();
        if (currentWorker) {
          currentWorker.terminate();
        }
        await cacheWorkerCode();
        const worker = initializeWorker();
        currentWorker = worker;

        if (worker) {
          worker.onmessage = async (event) => {
            const { type, message } = event.data;

            if (type === 'prompt') {
              await handlePrompt(message);
            } else if (['log', 'error', 'warn', 'info'].includes(type)) {
              appendToOutput(type, message);
            }
          };

          worker.onerror = (error) => {
            appendToOutput('error', error.message);
          };

          const userCode = window.editor.getValue();
          worker.postMessage({ type: 'execute', code: userCode, sharedBuffer });
        }
      });

      require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

      window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
          return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/'
            };
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/base/worker/workerMain.min.js');`)}
          `;
        },
      };

      require(['vs/editor/editor.main'], function () {
        monaco.editor.defineTheme('custom-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword', foreground: 'C586C0' },
            { token: 'identifier', foreground: '9CDCFE' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'comment', foreground: '6A9955' },
            { token: 'number', foreground: 'B5CEA8' },
          ],
          colors: {
            'editor.background': '#1E1E1E',
          },
        });

        window.editor = monaco.editor.create(document.getElementById('editorContainer'), {
          value: `console.log('Hello, World!');`,
          language: 'javascript',
          theme: 'custom-dark',
          automaticLayout: true,
          tabSize: 3,
          insertSpaces: true,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: 'Fira Code, Consolas, "Courier New", monospace',
          fontLigatures: true,
          folding: true,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          contextmenu: true,
          selectionHighlight: true,
          renderIndentGuides: true,
          renderLineHighlight: 'all',
          cursorStyle: 'line',
          cursorBlinking: 'blink',
          quickSuggestions: true,
          parameterHints: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnType: true,
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          smoothScrolling: true,
          breadcrumbs: {
            enabled: true,
          },
        });

        editor.onDidChangeCursorPosition((e) => {
          const position = editor.getPosition();
          document.getElementById('statusBar').textContent = `Ln ${position.lineNumber}, Col ${position.column} | UTF-8 | Spaces: 3 | JavaScript`;
        });

        document.getElementById('searchIcon').addEventListener('click', () => {
          if (window.editor) {
            window.editor.focus();
            window.editor.getAction('actions.find').run();
          }
        });

        document.getElementById('gitIcon').addEventListener('click', async () => {
          const gitUrl = prompt('Enter the GitHub file URL:');
          if (!gitUrl) {
            appendToOutput('error', 'No URL provided.');
            return;
          }
        
          const normalizedUrl = normalizeUrl(gitUrl);
          const parsedUrl = parseGitHubUrl(normalizedUrl);
        
          if (!parsedUrl.isFile && !parsedUrl.isRawFile) {
            appendToOutput('error', 'Invalid URL: Only file URLs are accepted.');
            return;
          }
        
          try {
            let fileContent;
        
            if (parsedUrl.isRawFile) {
              // Directly fetch raw file content
              fileContent = await fetchRawFile(parsedUrl.rawUrl);
            } else {
              // Fetch file via GitHub API
              const fileData = await fetchFromGit(parsedUrl.owner, parsedUrl.repo, parsedUrl.path, parsedUrl.branch);
              if (!fileData.content) {
                appendToOutput('error', 'Failed to fetch file content.');
                return;
              }
              fileContent = atob(fileData.content);
            }
        
            window.editor.setValue(fileContent);
            appendToOutput('info', `File loaded successfully: ${parsedUrl.path || parsedUrl.rawUrl}`);
          } catch (error) {
            appendToOutput('error', `Error fetching file: ${error.message}`);
          }
        });
        
        function normalizeUrl(url) {
          if (url.endsWith('.git')) {
            url = url.slice(0, -4);
          }
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          if (url.startsWith('http://')) {
            url = 'https://' + url.substring(7);
          }
          return url;
        }
        
        function parseGitHubUrl(url) {
          if (url.includes('raw.githubusercontent.com')) {
            const match = url.match(
              /^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/
            );
            if (match) {
              return {
                isRawFile: true,
                rawUrl: url,
              };
            }
            return { isRawFile: false };
          }
        
          const match = url.match(
            /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/
          );
        
          if (!match) {
            return { isFile: false };
          }
        
          return {
            owner: match[1],
            repo: match[2],
            branch: match[3],
            path: match[4],
            isFile: true,
          };
        }
        
        async function fetchFromGit(owner, repo, path, branch = 'main') {
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
          const response = await fetch(apiUrl);
        
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
        
          const data = await response.json();
        
          if (data.type !== 'file') {
            throw new Error('The URL does not point to a valid file.');
          }
        
          return data;
        }
        
        async function fetchRawFile(rawUrl) {
          const response = await fetch(rawUrl);
        
          if (!response.ok) {
            throw new Error(`Failed to fetch raw file: ${response.statusText}`);
          }
        
          return await response.text();
        }
        
        function appendToOutput(type, message) {
          const outputDiv = document.getElementById('output');
          const line = document.createElement('div');
          line.className = type;
          line.textContent = `[${type.toUpperCase()}] ${message}`;
          outputDiv.appendChild(line);
          outputDiv.scrollTop = outputDiv.scrollHeight;
        }
        
      
      });
    </script>
  </body>
</html>
