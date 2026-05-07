/* ═══════════════════════════════════════════════════════
   DIJKSTRA'S ALGORITHM VISUALIZER — Engine & UI
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

// ─── C++ CODE LINES (for display + line highlighting) ───
const CPP_CODE = [
  { code: '#include <bits/stdc++.h>', cls: 'syn-preprocessor' },
  { code: 'using namespace std;', cls: 'syn-keyword' },
  { code: '' },
  { code: 'vector<int> dijkstra(int V,', mix: [
    { t: 'vector', c: 'syn-type' }, { t: '<', c: 'syn-bracket' }, { t: 'int', c: 'syn-type' },
    { t: '> ', c: 'syn-bracket' }, { t: 'dijkstra', c: 'syn-func' }, { t: '(', c: 'syn-bracket' },
    { t: 'int', c: 'syn-type' }, { t: ' V,', c: '' }
  ]},
  { code: '    vector<vector<pair<int,int>>>& adj, int src) {', plain: true },
  { code: '' },
  { code: '    // Min-heap: {distance, node}', cls: 'syn-comment' },
  { code: '    priority_queue<pair<int,int>,', plain: true },
  { code: '        vector<pair<int,int>>,', plain: true },
  { code: '        greater<pair<int,int>>> pq;', plain: true },
  { code: '' },
  { code: '    vector<int> dist(V, INT_MAX);', plain: true },       // line 12 (idx 12)
  { code: '    dist[src] = 0;', plain: true },                       // line 13
  { code: '    pq.push({0, src});', plain: true },                   // line 14
  { code: '' },
  { code: '    while (!pq.empty()) {', mix: [
    { t: '    ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (!pq.empty()) {', c: '' }
  ]},
  { code: '        int u = pq.top().second;', plain: true },         // line 17
  { code: '        int d = pq.top().first;', plain: true },
  { code: '        pq.pop();', plain: true },                        // line 19
  { code: '' },
  { code: '        if (d > dist[u]) continue;', mix: [
    { t: '        ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (d > dist[u]) ', c: '' },
    { t: 'continue', c: 'syn-keyword' }, { t: ';', c: '' }
  ]},
  { code: '' },
  { code: '        for (auto& [w, v] : adj[u]) {', mix: [
    { t: '        ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' },
    { t: 'auto', c: 'syn-keyword' }, { t: '& [w, v] : adj[u]) {', c: '' }
  ]},
  { code: '            if (dist[u] + w < dist[v]) {', mix: [
    { t: '            ', c: '' }, { t: 'if', c: 'syn-keyword' },
    { t: ' (dist[u] + w < dist[v]) {', c: '' }
  ]},
  { code: '                dist[v] = dist[u] + w;', plain: true },   // line 25
  { code: '                pq.push({dist[v], v});', plain: true },    // line 26
  { code: '            }', plain: true },
  { code: '        }', plain: true },
  { code: '    }', plain: true },
  { code: '    return dist;', mix: [
    { t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' dist;', c: '' }
  ]},
  { code: '}', plain: true },
];

// Map algorithm phases to code line indices (0-based)
const CODE_LINE_MAP = {
  init: [12, 13, 14],
  pickNode: [16, 17, 18, 19],
  skipNode: [21],
  iterNeighbors: [23],
  checkRelax: [24],
  relax: [25, 26],
  done: [30],
};

// ─── STATE ───
let startNode = 'A';
let targetNode = 'F';
let steps = [];
let finalDistances = {};
let finalPathEdges = [];
let finalVisited = [];
let currentStepIdx = -1;
let isPlaying = false;
let isFinished = false;
let playTimer = null;
let speedMultiplier = 1;

const speedMap = { 1: 0.25, 2: 0.5, 3: 1, 4: 2, 5: 4 };
const baseInterval = 1000; // ms at 1x speed

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
const themeToggle = document.getElementById('theme-toggle');

// ─── DIJKSTRA ALGORITHM ───
function runDijkstra(graph, start, target) {
  const dist = {};
  const visited = [];
  const parents = {};
  const stepsArr = [];
  ALL_NODES.forEach(n => {
    dist[n] = n === start ? 0 : Infinity;
    parents[n] = null;
  });

  // Step: initialization
  stepsArr.push({
    current: start, updated: null,
    distances: { ...dist }, visited: [...visited],
    phase: 'init', message: `Initialize: dist[${start}] = 0, all others = ∞`
  });

  // Simple min-heap simulation via array
  const pq = [{ node: start, dist: 0 }];

  while (pq.length > 0) {
    // Pick min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = pq.shift();

    if (d > dist[u]) continue;
    if (visited.includes(u)) continue;

    visited.push(u);

    if (u === target) {
      stepsArr.push({
        current: u, updated: null,
        distances: { ...dist }, visited: [...visited],
        phase: 'done', message: `Target node ${target} reached! Early exit.`
      });
      break;
    }

    // Step: visit node
    stepsArr.push({
      current: u, updated: null,
      distances: { ...dist }, visited: [...visited],
      phase: 'pickNode', message: `Visit node ${u} (distance = ${dist[u]})`
    });

    // Explore neighbors
    for (const edge of graph[u]) {
      const v = edge.to;
      const w = edge.w;

      stepsArr.push({
        current: u, updated: v,
        distances: { ...dist }, visited: [...visited],
        phase: 'iterNeighbors', message: `Check neighbor ${v} from ${u} (edge weight = ${w})`
      });

      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        parents[v] = u;
        pq.push({ node: v, dist: dist[v] });

        stepsArr.push({
          current: u, updated: v,
          distances: { ...dist }, visited: [...visited],
          phase: 'relax', message: `Relax: dist[${v}] = ${dist[u]} + ${w} = ${dist[v]}`
        });
      }
    }
  }

  // Trace back path
  const pathEdges = [];
  let curr = target;
  while (curr !== start && parents[curr]) {
    pathEdges.push([parents[curr], curr].sort().join('-'));
    curr = parents[curr];
  }

  return { steps: stepsArr, finalDistances: { ...dist }, finalPath: pathEdges, finalVisited: visited };
}

// ─── CANVAS RENDERING ───
function resizeCanvas() {
  const w = Math.min(canvasContainer.clientWidth - 32, 650);
  canvas.width = w;
  canvas.height = 400;
}

function drawGraph(state) {
  const { current, updated, distances, visited } = state;
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

      // Check if this edge is on the active path or final path
      const isFinalPath = state.finalPath && state.finalPath.includes(id);
      const isActiveEdge = (current === from && updated === edge.to) ||
                           (current === edge.to && updated === from);

      ctx.beginPath();
      ctx.moveTo(p1.x * scale, p1.y * scale);
      ctx.lineTo(p2.x * scale, p2.y * scale);
      
      if (isFinalPath) {
        ctx.strokeStyle = '#0ea5e9'; // Cyan for final path
        ctx.lineWidth = 4 * scale;
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 8 * scale;
      } else {
        ctx.strokeStyle = isActiveEdge ? COLORS.nodeUpdating : COLORS.edge;
        ctx.lineWidth = (isActiveEdge ? 3 : 2) * scale;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Weight label
      const mx = (p1.x + p2.x) / 2 * scale;
      const my = (p1.y + p2.y) / 2 * scale;
      ctx.beginPath();
      ctx.arc(mx, my, 14 * scale, 0, Math.PI * 2);
      ctx.fillStyle = isFinalPath ? '#0ea5e9' : (isActiveEdge ? COLORS.nodeUpdating : COLORS.edgeWeightBg);
      ctx.fill();
      ctx.fillStyle = (isFinalPath || isActiveEdge) ? COLORS.textDark : COLORS.text;
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
    ctx.font = `bold ${16 * scale}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(node, pos.x * scale, pos.y * scale - 2 * scale);

    // Distance
    const d = distances[node];
    const dText = (d === Infinity || d === undefined) ? '∞' : d.toString();
    ctx.font = `normal ${14 * scale}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(dText, pos.x * scale, pos.y * scale + 4 * scale);
  }
}

// ─── DISTANCE GRID UI ───
function updateDistGrid(distances) {
  distGrid.innerHTML = '';
  for (const node of ALL_NODES) {
    const d = distances[node];
    const isInf = d === Infinity || d === undefined;
    const cell = document.createElement('div');
    cell.className = 'dist-cell';
    cell.innerHTML = `<span class="node-label">${node}</span><span class="dist-val ${isInf ? 'infinity' : ''}">${isInf ? '∞' : d}</span>`;
    distGrid.appendChild(cell);
  }
}

// ─── CODE PANEL ───
function buildCodePanel() {
  codeBody.innerHTML = '';
  CPP_CODE.forEach((line, i) => {
    const row = document.createElement('div');
    row.className = 'code-line';
    row.dataset.lineIdx = i;

    const num = document.createElement('span');
    num.className = 'code-line-num';
    num.textContent = i + 1;

    const content = document.createElement('span');
    content.className = 'code-line-content';

    if (line.mix) {
      line.mix.forEach(part => {
        const s = document.createElement('span');
        if (part.c) s.className = part.c;
        s.textContent = part.t;
        content.appendChild(s);
      });
    } else if (line.cls) {
      const s = document.createElement('span');
      s.className = line.cls;
      s.textContent = line.code;
      content.appendChild(s);
    } else {
      content.textContent = line.code;
    }

    row.appendChild(num);
    row.appendChild(content);
    codeBody.appendChild(row);
  });
}

function highlightCodeLines(phase) {
  // Clear all
  document.querySelectorAll('.code-line.active').forEach(el => el.classList.remove('active'));

  const lines = CODE_LINE_MAP[phase];
  if (!lines) return;

  lines.forEach(idx => {
    const row = codeBody.querySelector(`[data-line-idx="${idx}"]`);
    if (row) {
      row.classList.add('active');
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

// ─── PLAYBACK ───
function applyStep(idx) {
  if (idx < 0 || idx >= steps.length) return;
  currentStepIdx = idx;
  const step = steps[idx];

  drawGraph(step);
  updateDistGrid(step.distances);
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
    if (next >= steps.length) {
      finish();
      return;
    }
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
  if (next >= steps.length) {
    finish();
    return;
  }
  applyStep(next);
}

function finish() {
  pause();
  isFinished = true;
  drawGraph({
    current: null, updated: null,
    distances: finalDistances, visited: finalVisited,
    finalPath: finalPathEdges
  });
  updateDistGrid(finalDistances);
  
  if (finalDistances[targetNode] === Infinity) {
    statusMsg.textContent = `Algorithm complete! Node ${targetNode} is unreachable from ${startNode}.`;
  } else {
    statusMsg.textContent = `Algorithm complete! Shortest path to ${targetNode} is ${finalDistances[targetNode]}.`;
  }
  highlightCodeLines('done');
  updateButtons();
}

function resetVisualization() {
  pause();
  isFinished = false;
  currentStepIdx = -1;
  steps = [];
  stepCounter.style.display = 'none';
  statusMsg.textContent = `Start node set to ${startNode}. Press Run.`;

  const initDist = {};
  ALL_NODES.forEach(n => initDist[n] = n === startNode ? 0 : Infinity);
  drawGraph({ current: null, updated: null, distances: initDist, visited: [] });
  updateDistGrid(initDist);
  highlightCodeLines(null);
  updateButtons();
}

function handleRun() {
  if (isPlaying) return;
  resetVisualization();

  statusMsg.textContent = `Running Dijkstra from ${startNode} to ${targetNode}...`;
  const result = runDijkstra(GRAPH, startNode, targetNode);
  steps = result.steps;
  finalDistances = result.finalDistances;
  finalPathEdges = result.finalPath;
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

  // Disable node buttons during play
  document.querySelectorAll('.node-btn').forEach(b => b.disabled = running);

  // Update run button text
  if (isFinished) {
    btnRun.disabled = true;
  }

  // Toggle pause button text
  btnPause.querySelector('svg + span, span:last-child');
}

// ─── SPEED CONTROL ───
function updateSpeed() {
  const val = parseInt(speedSlider.value);
  speedMultiplier = speedMap[val];
  speedLabel.textContent = speedMultiplier + 'x';

  // If playing, restart timer with new speed
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

// ─── THEME TOGGLE ───
function toggleTheme() {
  const html = document.documentElement;
  const body = document.body;
  const isDark = body.classList.contains('dark');

  body.classList.add('theme-transitioning');
  body.classList.toggle('dark');

  // Toggle icons
  document.getElementById('icon-sun').style.display = isDark ? 'none' : 'block';
  document.getElementById('icon-moon').style.display = isDark ? 'block' : 'none';

  // Store preference
  localStorage.setItem('theme', isDark ? 'light' : 'dark');

  setTimeout(() => body.classList.remove('theme-transitioning'), 500);
}

function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.remove('dark');
    document.getElementById('icon-sun').style.display = 'none';
    document.getElementById('icon-moon').style.display = 'block';
  }
}

// ─── START & TARGET NODE SELECTION ───
function selectNode(type, node) {
  if (isPlaying) return;
  if (type === 'start') {
    startNode = node;
    document.querySelectorAll('.node-btn[data-type="start"]').forEach(b => {
      b.classList.toggle('active', b.dataset.node === node);
    });
  } else if (type === 'target') {
    targetNode = node;
    document.querySelectorAll('.node-btn[data-type="target"]').forEach(b => {
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

      // Check distance to the weight bubble center
      const dist = Math.hypot(x - mx, y - my);
      if (dist <= 14) { // 14 is the unscaled radius
        let newWeight = prompt(`Enter new weight for edge ${from} - ${edge.to}:`, edge.w);
        if (newWeight !== null && newWeight.trim() !== "") {
          let w = parseInt(newWeight);
          if (!isNaN(w)) {
            edge.w = w;
            // Update reverse edge if it exists to keep graph undirected
            let reverseEdge = GRAPH[edge.to].find(e => e.to === from);
            if (reverseEdge) reverseEdge.w = w;
            
            resetVisualization();
            return; // Only process one click
          }
        }
      }
    }
  }
}

// ─── RESIZE HANDLER ───
function handleResize() {
  resizeCanvas();
  // Redraw current state
  if (currentStepIdx >= 0 && steps[currentStepIdx]) {
    drawGraph(steps[currentStepIdx]);
  } else {
    const initDist = {};
    ALL_NODES.forEach(n => initDist[n] = n === startNode ? 0 : Infinity);
    drawGraph({ current: null, updated: null, distances: initDist, visited: [] });
  }
}

// ─── INIT ───
function init() {
  loadTheme();
  buildCodePanel();
  resizeCanvas();
  resetVisualization();

  // Event listeners
  btnRun.addEventListener('click', handleRun);
  btnPause.addEventListener('click', pause);
  btnStep.addEventListener('click', stepForward);
  btnReset.addEventListener('click', resetVisualization);
  speedSlider.addEventListener('input', updateSpeed);
  themeToggle.addEventListener('click', toggleTheme);

  document.querySelectorAll('.node-btn').forEach(btn => {
    btn.addEventListener('click', () => selectNode(btn.dataset.type, btn.dataset.node));
  });

  window.addEventListener('resize', handleResize);
  canvas.addEventListener('click', handleCanvasClick);
  updateSpeed(); // set initial speed label
}

document.addEventListener('DOMContentLoaded', init);
