/* ═══════════════════════════════════════════════════════
   GRAPH TRAVERSAL VISUALIZER — Engine & UI
   Pure JavaScript — No dependencies
   ═══════════════════════════════════════════════════════ */

// ─── GRAPH DEFINITION ───
const GRAPH = {
  A: [{ to: 'B', w: 4 }, { to: 'C', w: 2 }],
  B: [{ to: 'A', w: 4 }, { to: 'C', w: 1 }, { to: 'D', w: 5 }],
  C: [{ to: 'A', w: 2 }, { to: 'B', w: 1 }, { to: 'D', w: 8 }, { to: 'E', w: 10 }],
  D: [{ to: 'B', w: 5 }, { to: 'C', w: 8 }, { to: 'E', w: 2 }, { to: 'F', w: 6 }],
  E: [{ to: 'C', w: 10 }, { to: 'D', w: 2 }, { to: 'F', w: 3 }],
  F: [{ to: 'D', w: 6 }, { to: 'E', w: 3 }],
};

const ALL_NODES = Object.keys(GRAPH);
const NODE_POS = {
  A: { x: 100, y: 200 }, B: { x: 250, y: 100 }, C: { x: 250, y: 300 },
  D: { x: 400, y: 100 }, E: { x: 400, y: 300 }, F: { x: 550, y: 200 },
};

const COLORS = {
  canvasBg: '#0f1117', nodeDefault: '#1e293b', nodeCurrent: '#fbbf24',
  nodeUpdating: '#f97316', nodeVisited: '#22c55e', text: '#ffffff',
  textDark: '#0f1117', edge: '#64748b', edgeWeightBg: '#1e293b',
};

// ─── OPERATION-SPECIFIC C++ CODE ───
const CODE_BFS = [
  { code: 'void bfs(int start,', mix: [{ t: 'void', c: 'syn-type' }, { t: ' bfs(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' start,', c: '' }] },
  { code: '         vector<vector<int>>& adj) {', plain: true },
  { code: '    vector<bool> visited(n, false);', mix: [{ t: '    vector<', c: '' }, { t: 'bool', c: 'syn-type' }, { t: '> visited(n, ', c: '' }, { t: 'false', c: 'syn-keyword' }, { t: ');', c: '' }] },
  { code: '    queue<int> q;', plain: true },
  { code: '    visited[start] = true;', plain: true },
  { code: '    q.push(start);', plain: true },
  { code: '' },
  { code: '    while (!q.empty()) {', mix: [{ t: '    ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (!q.empty()) {', c: '' }] },
  { code: '        int u = q.front();', plain: true },
  { code: '        q.pop();', plain: true },
  { code: '' },
  { code: '        for (int v : adj[u]) {', mix: [{ t: '        ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' v : adj[u]) {', c: '' }] },
  { code: '            if (!visited[v]) {', mix: [{ t: '            ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (!visited[v]) {', c: '' }] },
  { code: '                visited[v] = true;', plain: true },
  { code: '                q.push(v);', plain: true },
  { code: '            }', plain: true },
  { code: '        }', plain: true },
  { code: '    }  // O(V+E)', mix: [{ t: '    }  ', c: '' }, { t: '// O(V+E)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];

const CODE_DFS = [
  { code: 'void dfs(int start,', mix: [{ t: 'void', c: 'syn-type' }, { t: ' dfs(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' start,', c: '' }] },
  { code: '         vector<vector<int>>& adj) {', plain: true },
  { code: '    vector<bool> visited(n, false);', mix: [{ t: '    vector<', c: '' }, { t: 'bool', c: 'syn-type' }, { t: '> visited(n, ', c: '' }, { t: 'false', c: 'syn-keyword' }, { t: ');', c: '' }] },
  { code: '    stack<int> s;', plain: true },
  { code: '    s.push(start);', plain: true },
  { code: '' },
  { code: '    while (!s.empty()) {', mix: [{ t: '    ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (!s.empty()) {', c: '' }] },
  { code: '        int u = s.top();', plain: true },
  { code: '        s.pop();', plain: true },
  { code: '' },
  { code: '        if (visited[u]) continue;', mix: [{ t: '        ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (visited[u]) ', c: '' }, { t: 'continue', c: 'syn-keyword' }, { t: ';', c: '' }] },
  { code: '        visited[u] = true;', plain: true },
  { code: '' },
  { code: '        for (int v : adj[u]) {', mix: [{ t: '        ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' v : adj[u]) {', c: '' }] },
  { code: '            if (!visited[v])', mix: [{ t: '            ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (!visited[v])', c: '' }] },
  { code: '                s.push(v);', plain: true },
  { code: '        }', plain: true },
  { code: '    }  // O(V+E)', mix: [{ t: '    }  ', c: '' }, { t: '// O(V+E)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];

const CODE_LINE_MAP_BFS = {
  init: [2, 3, 4, 5],
  pickNode: [7, 8, 9],
  iterNeighbors: [11],
  checkRelax: [12],
  relax: [13, 14],
  done: [17, 18],
};

const CODE_LINE_MAP_DFS = {
  init: [2, 3, 4],
  pickNode: [6, 7, 8],
  skipNode: [10],
  markVisited: [11],
  iterNeighbors: [13],
  checkRelax: [14],
  relax: [15],
  done: [17, 18],
};

// ─── STATE ───
let startNode = 'A';
let traversalType = 'bfs';
let steps = [];
let finalVisited = [];
let currentStepIdx = -1;
let isPlaying = false;
let isFinished = false;
let playTimer = null;
let speedMultiplier = 1;

const speedMap = { 1: 0.25, 2: 0.5, 3: 1, 4: 2, 5: 4 };
const baseInterval = 1000;

// ─── DOM REFS ───
const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvas-container');
const statusMsg = document.getElementById('status-message');
const stepCounter = document.getElementById('step-counter');
const distGrid = document.getElementById('dist-grid');
const codeBody = document.getElementById('code-body');

const btnRun = document.getElementById('btn-run');
const btnPause = document.getElementById('btn-pause');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');

// ─── TRAVERSAL ALGORITHM ───
function runTraversal(graph, start, type) {
  const visited = [];
  const stepsArr = [];
  const dsName = type === 'bfs' ? 'Queue' : 'Stack';

  stepsArr.push({
    current: start, updated: null, visited: [...visited],
    phase: 'init', message: `Initialize: push ${start} to ${dsName}`
  });

  if (type === 'bfs') {
    // BFS — Queue-based
    const queue = [start];
    visited.push(start);

    while (queue.length > 0) {
      const u = queue.shift();

      stepsArr.push({
        current: u, updated: null, visited: [...visited],
        phase: 'pickNode', message: `Dequeue ${u} from Queue`
      });

      for (const edge of graph[u]) {
        const v = edge.to;
        stepsArr.push({
          current: u, updated: v, visited: [...visited],
          phase: 'iterNeighbors', message: `Check neighbor ${v} of ${u}`
        });

        if (!visited.includes(v)) {
          visited.push(v);
          queue.push(v);
          stepsArr.push({
            current: u, updated: v, visited: [...visited],
            phase: 'relax', message: `Mark ${v} visited → push to Queue`
          });
        } else {
          stepsArr.push({
            current: u, updated: v, visited: [...visited],
            phase: 'checkRelax', message: `${v} already visited — skip`
          });
        }
      }
    }
  } else {
    // DFS — Stack-based (iterative)
    const stack = [start];

    while (stack.length > 0) {
      const u = stack.pop();

      if (visited.includes(u)) {
        stepsArr.push({
          current: u, updated: null, visited: [...visited],
          phase: 'skipNode', message: `${u} already visited — skip`
        });
        continue;
      }

      visited.push(u);
      stepsArr.push({
        current: u, updated: null, visited: [...visited],
        phase: 'markVisited', message: `Pop ${u} from Stack — mark visited`
      });

      for (const edge of graph[u]) {
        const v = edge.to;
        stepsArr.push({
          current: u, updated: v, visited: [...visited],
          phase: 'iterNeighbors', message: `Check neighbor ${v} of ${u}`
        });

        if (!visited.includes(v)) {
          stack.push(v);
          stepsArr.push({
            current: u, updated: v, visited: [...visited],
            phase: 'relax', message: `Push ${v} to Stack`
          });
        } else {
          stepsArr.push({
            current: u, updated: v, visited: [...visited],
            phase: 'checkRelax', message: `${v} already visited — skip`
          });
        }
      }
    }
  }

  stepsArr.push({
    current: null, updated: null, visited: [...visited],
    phase: 'done', message: `${type.toUpperCase()} complete! Visited: ${visited.join(' → ')}`
  });

  return { steps: stepsArr, finalVisited: visited };
}

// ─── CANVAS RENDERING ───
function resizeCanvas() {
  const w = Math.min(canvasContainer.clientWidth - 32, 650);
  canvas.width = w;
  canvas.height = 400;
}

function drawGraph(state) {
  const { current, updated, visited } = state;
  const scale = canvas.width / 650;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  ctx.lineWidth = 2 * scale;
  const drawn = new Set();
  for (const [from, edges] of Object.entries(GRAPH)) {
    const p1 = NODE_POS[from];
    for (const edge of edges) {
      const id = [from, edge.to].sort().join('-');
      if (drawn.has(id)) continue;
      drawn.add(id);
      const p2 = NODE_POS[edge.to];

      const isActiveEdge = (current === from && updated === edge.to) ||
                           (current === edge.to && updated === from);

      ctx.beginPath();
      ctx.moveTo(p1.x * scale, p1.y * scale);
      ctx.lineTo(p2.x * scale, p2.y * scale);
      ctx.strokeStyle = isActiveEdge ? COLORS.nodeUpdating : COLORS.edge;
      ctx.lineWidth = (isActiveEdge ? 3 : 2) * scale;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Weight label
      const mx = (p1.x + p2.x) / 2 * scale;
      const my = (p1.y + p2.y) / 2 * scale;
      ctx.beginPath();
      ctx.arc(mx, my, 14 * scale, 0, Math.PI * 2);
      ctx.fillStyle = isActiveEdge ? COLORS.nodeUpdating : COLORS.edgeWeightBg;
      ctx.fill();
      ctx.fillStyle = isActiveEdge ? COLORS.textDark : COLORS.text;
      ctx.font = `bold ${12 * scale}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.w.toString(), mx, my);
    }
  }

  // Draw nodes
  const nodeRadius = 30 * scale;
  for (const [node, pos] of Object.entries(NODE_POS)) {
    const isCurrent = current === node;
    const isVisited = visited.includes(node);
    const isUpdated = updated === node;

    let fill = COLORS.nodeDefault;
    let textCol = COLORS.text;
    if (isCurrent) { fill = COLORS.nodeCurrent; textCol = COLORS.textDark; }
    else if (isUpdated) { fill = COLORS.nodeUpdating; }
    else if (isVisited) { fill = COLORS.nodeVisited; textCol = COLORS.textDark; }

    // Glow for current node
    if (isCurrent) {
      ctx.save();
      ctx.shadowColor = COLORS.nodeCurrent;
      ctx.shadowBlur = 20 * scale;
      ctx.beginPath();
      ctx.arc(pos.x * scale, pos.y * scale, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(pos.x * scale, pos.y * scale, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = (isCurrent || isUpdated) ? '#ffffff' : COLORS.edge;
    ctx.lineWidth = (isCurrent ? 4 : 2) * scale;
    ctx.stroke();

    // Node label
    ctx.fillStyle = textCol;
    ctx.font = `bold ${18 * scale}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node, pos.x * scale, pos.y * scale);
  }
}

// ─── CODE PANEL ───
function buildCodePanel(code) {
  codeBody.innerHTML = '';
  code.forEach((line, i) => {
    const row = document.createElement('div'); row.className = 'code-line'; row.dataset.lineIdx = i;
    const num = document.createElement('span'); num.className = 'code-line-num'; num.textContent = i + 1;
    const content = document.createElement('span'); content.className = 'code-line-content';
    if (line.mix) { line.mix.forEach(p => { const s = document.createElement('span'); if (p.c) s.className = p.c; s.textContent = p.t; content.appendChild(s); }); }
    else if (line.cls) { const s = document.createElement('span'); s.className = line.cls; s.textContent = line.code; content.appendChild(s); }
    else { content.textContent = line.code; }
    row.appendChild(num); row.appendChild(content); codeBody.appendChild(row);
  });
}

function highlightCodeLines(phase) {
  document.querySelectorAll('.code-line.active').forEach(el => el.classList.remove('active'));
  const map = traversalType === 'bfs' ? CODE_LINE_MAP_BFS : CODE_LINE_MAP_DFS;
  const lines = map[phase];
  if (!lines) return;
  lines.forEach(idx => {
    const row = codeBody.querySelector(`[data-line-idx="${idx}"]`);
    if (row) { row.classList.add('active'); row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  });
}

// ─── PLAYBACK ───
function applyStep(idx) {
  if (idx < 0 || idx >= steps.length) return;
  currentStepIdx = idx;
  const step = steps[idx];
  drawGraph(step);
  statusMsg.textContent = step.message;
  stepCounter.style.display = 'inline';
  stepCounter.textContent = `Step ${idx + 1} / ${steps.length}`;
  highlightCodeLines(step.phase);
}

function play() {
  if (isFinished || steps.length === 0) return;
  isPlaying = true;
  updateButtons();
  const interval = baseInterval / speedMultiplier;
  playTimer = setInterval(() => {
    const next = currentStepIdx + 1;
    if (next >= steps.length) { finish(); return; }
    applyStep(next);
  }, interval);
}

function pause() {
  isPlaying = false;
  clearInterval(playTimer);
  playTimer = null;
  updateButtons();
}

function stepForward() {
  if (isFinished) return;
  pause();
  const next = currentStepIdx + 1;
  if (next >= steps.length) { finish(); return; }
  applyStep(next);
}

function finish() {
  pause();
  isFinished = true;
  statusMsg.textContent = `Traversal complete! Visited: ${finalVisited.join(' → ')}`;
  highlightCodeLines('done');
  updateButtons();
}

function resetVisualization() {
  pause();
  isFinished = false;
  currentStepIdx = -1;
  steps = [];
  stepCounter.style.display = 'none';
  statusMsg.textContent = `Start node: ${startNode}. Select traversal type and press Run.`;
  drawGraph({ current: null, updated: null, visited: [] });
  highlightCodeLines(null);
  updateButtons();
}

function handleRun() {
  traversalType = document.getElementById('traversal-type').value;
  buildCodePanel(traversalType === 'bfs' ? CODE_BFS : CODE_DFS);
  statusMsg.textContent = `Running ${traversalType.toUpperCase()} from ${startNode}...`;
  const result = runTraversal(GRAPH, startNode, traversalType);
  steps = result.steps;
  finalVisited = result.finalVisited;
  currentStepIdx = -1;
  isFinished = false;
  play();
}

// ─── BUTTON STATE ───
function updateButtons() {
  const running = isPlaying;
  btnRun.disabled = running;
  btnPause.disabled = !running;
  btnStep.disabled = running || isFinished;
  btnReset.disabled = running;
  document.querySelectorAll('.node-btn').forEach(b => b.disabled = running);
  if (isFinished) btnRun.disabled = true;
}

// ─── SPEED CONTROL ───
function updateSpeed() {
  const val = parseInt(speedSlider.value);
  speedMultiplier = speedMap[val];
  speedLabel.textContent = speedMultiplier + 'x';
  if (isPlaying) {
    clearInterval(playTimer);
    const interval = baseInterval / speedMultiplier;
    playTimer = setInterval(() => {
      const next = currentStepIdx + 1;
      if (next >= steps.length) { finish(); return; }
      applyStep(next);
    }, interval);
  }
}

// ─── START NODE SELECTION ───
function selectNode(type, node) {
  if (isPlaying) return;
  if (type === 'start') {
    startNode = node;
    document.querySelectorAll('.node-btn[data-type="start"]').forEach(b => {
      b.classList.toggle('active', b.dataset.node === node);
    });
  }
  resetVisualization();
}

// ─── INTERACTIVE EDGE EDITING ───
function handleCanvasClick(e) {
  if (isPlaying) return;
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / 650;
  const x = (e.clientX - rect.left) / scale;
  const y = (e.clientY - rect.top) / scale;

  for (const [from, edges] of Object.entries(GRAPH)) {
    const p1 = NODE_POS[from];
    for (const edge of edges) {
      const p2 = NODE_POS[edge.to];
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const dist = Math.hypot(x - mx, y - my);
      if (dist <= 14) {
        let newWeight = prompt(`Enter new weight for edge ${from} - ${edge.to}:`, edge.w);
        if (newWeight !== null && newWeight.trim() !== "") {
          let w = parseInt(newWeight);
          if (!isNaN(w)) {
            edge.w = w;
            let reverseEdge = GRAPH[edge.to].find(e => e.to === from);
            if (reverseEdge) reverseEdge.w = w;
            resetVisualization();
            return;
          }
        }
      }
    }
  }
}

// ─── RESIZE HANDLER ───
function handleResize() {
  resizeCanvas();
  if (currentStepIdx >= 0 && steps[currentStepIdx]) {
    drawGraph(steps[currentStepIdx]);
  } else {
    drawGraph({ current: null, updated: null, visited: [] });
  }
}

// ─── TRAVERSAL TYPE CHANGE ───
document.getElementById('traversal-type').addEventListener('change', () => {
  if (isPlaying) return;
  traversalType = document.getElementById('traversal-type').value;
  buildCodePanel(traversalType === 'bfs' ? CODE_BFS : CODE_DFS);
  resetVisualization();
});

// ─── INIT ───
function init() {
  buildCodePanel(CODE_BFS);
  resizeCanvas();
  resetVisualization();

  btnRun.addEventListener('click', handleRun);
  btnPause.addEventListener('click', pause);
  btnStep.addEventListener('click', stepForward);
  btnReset.addEventListener('click', resetVisualization);
  speedSlider.addEventListener('input', updateSpeed);

  document.querySelectorAll('.node-btn').forEach(btn => {
    btn.addEventListener('click', () => selectNode(btn.dataset.type, btn.dataset.node));
  });

  window.addEventListener('resize', handleResize);
  canvas.addEventListener('click', handleCanvasClick);
  updateSpeed();
}

document.addEventListener('DOMContentLoaded', init);
