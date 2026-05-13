// Antigravity HUD: Telemetry & Replay Logic (v5.5)

const timeline = document.getElementById('executionTimeline');
const consoleOutput = document.getElementById('consoleOutput');
const confidenceVal = document.getElementById('confidenceVal');
const launchBtn = document.getElementById('launchBtn');
const taskInput = document.getElementById('taskInput');

let socket = null;
let currentNodes = {};

// 1. WebSocket Infrastructure
function connect() {
    socket = new WebSocket('ws://localhost:8000/telemetry');
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleTelemetryEvent(data);
    };

    socket.onclose = () => {
        console.log("Disconnected. Reconnecting...");
        setTimeout(connect, 2000);
    };
}

function handleTelemetryEvent(event) {
    const { type, payload } = event;

    if (type === 'NODE_ADDED') {
        createNode(payload);
    } else if (type === 'NODE_UPDATED') {
        updateNode(payload);
    } else if (type === 'CONFIDENCE_UPDATE') {
        confidenceVal.innerText = `${payload.score}%`;
    } else if (type === 'TERMINAL_STREAM') {
        appendConsole(payload.text, payload.level);
    }
}

// 2. Timeline Visualization
function createNode(node) {
    const div = document.createElement('div');
    div.id = `node-${node.id}`;
    div.className = `node idle`;
    div.innerHTML = `
        <div class="node-header">
            <strong>${node.action.toUpperCase()}</strong>
            <span class="node-status">IDLE</span>
        </div>
    `;
    div.onclick = () => showReplay(node.id);
    timeline.appendChild(div);
    currentNodes[node.id] = node;
}

function updateNode(node) {
    const div = document.getElementById(`node-${node.id}`);
    if (!div) return;

    div.className = `node ${node.status.toLowerCase()}`;
    div.querySelector('.node-status').innerText = node.status;

    // Apply Glow States
    if (node.status === 'EXECUTING') div.classList.add('executing');
    else if (node.status === 'REPAIRING') div.classList.add('repairing');
    else {
        div.classList.remove('executing', 'repairing');
    }
}

// 3. Replay HUD Logic
function showReplay(nodeId) {
    const node = currentNodes[nodeId];
    if (!node) return;

    // Highlight the selected node in the UI
    document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
    document.getElementById(`node-${nodeId}`).classList.add('selected');

    // Display the historical output in the console
    consoleOutput.innerHTML = `<div class="line info">REPLAYING: ${node.action}</div>`;
    if (node.output) {
        appendConsole(JSON.stringify(node.output, null, 2));
    }
    if (node.error) {
        appendConsole(node.error, 'warning');
    }
}

function appendConsole(text, level = 'info') {
    const div = document.createElement('div');
    div.className = `line ${level}`;
    div.innerText = text;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// 4. Launch Autonomous Cycle
launchBtn.onclick = () => {
    const intent = taskInput.value;
    if (!intent) return;

    appendConsole(`Launching Autonomous Infrastructure Cycle: ${intent}`, 'success');
    
    // Send command to kernel via WebSocket or API
    fetch('http://localhost:8000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent })
    });
};

connect();
