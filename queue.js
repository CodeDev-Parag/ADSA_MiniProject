const queueView = document.getElementById('queue-view');
const logContainer = document.getElementById('log-container');
const valInput = document.getElementById('val-input');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');
let queue = [4, 9, 2, 7, 11];
let selectedOp = 'enqueue';

const CODE_ENQUEUE = [
  { code: 'void enqueue(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' enqueue(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '    data.push_back(val);', plain: true },
  { code: '    rear++;', plain: true },
  { code: '}  // O(1) amortized', mix: [{ t: '}  ', c: '' }, { t: '// O(1) amortized', c: 'syn-comment' }] },
];
const CODE_DEQUEUE = [
  { code: 'int dequeue() {', mix: [{ t: 'int', c: 'syn-type' }, { t: ' dequeue() {', c: '' }] },
  { code: '    if (isEmpty())', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (isEmpty())', c: '' }] },
  { code: '        throw "underflow";', mix: [{ t: '        ', c: '' }, { t: 'throw', c: 'syn-keyword' }, { t: ' ', c: '' }, { t: '"underflow"', c: 'syn-string' }, { t: ';', c: '' }] },
  { code: '    int val = data[front];', plain: true },
  { code: '    front++;', plain: true },
  { code: '    return val;  // O(1)', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' val;  ', c: '' }, { t: '// O(1)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_FRONT = [
  { code: 'int front() {', mix: [{ t: 'int', c: 'syn-type' }, { t: ' front() {', c: '' }] },
  { code: '    if (isEmpty()) return -1;', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (isEmpty()) ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' ', c: '' }, { t: '-1', c: 'syn-number' }, { t: ';', c: '' }] },
  { code: '    return data[front_idx];', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' data[front_idx];', c: '' }] },
  { code: '}  // O(1) — no removal', mix: [{ t: '}  ', c: '' }, { t: '// O(1) — no removal', c: 'syn-comment' }] },
];

const OP_CODES = { enqueue: CODE_ENQUEUE, dequeue: CODE_DEQUEUE, front: CODE_FRONT };
const OP_BTNS = { enqueue: 'btn-enqueue', dequeue: 'btn-dequeue', front: 'btn-front' };

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
function highlightCodeLines(indices) {
  document.querySelectorAll('.code-line.active').forEach(el => el.classList.remove('active'));
  if (!indices) return;
  indices.forEach(idx => { const row = codeBody.querySelector(`[data-line-idx="${idx}"]`); if (row) row.classList.add('active'); });
}

function log(msg) { const div = document.createElement('div'); div.textContent = `> ${msg}`; logContainer.appendChild(div); logContainer.scrollTop = logContainer.scrollHeight; }
function render(data, activeIndex = -1) {
  queueView.innerHTML = '';
  if (data.length === 0) { queueView.innerHTML = '<div style="color:var(--fg-muted); font-family:var(--font-mono); font-size:0.875rem;">Queue is empty</div>'; return; }
  data.forEach((val, i) => {
    const el = document.createElement('div'); el.className = 'queue-item';
    if (i === activeIndex) el.classList.add('active');
    let label = '';
    if (i === 0) label += '<span class="item-label-front">FRONT</span>';
    if (i === data.length - 1) label += '<span class="item-label-rear">REAR</span>';
    el.innerHTML = `${label}${val}<span class="item-index">[${i}]</span>`;
    queueView.appendChild(el);
  });
}

function setActiveButton(op) {
  Object.values(OP_BTNS).forEach(id => { document.getElementById(id).classList.remove('btn-primary'); });
  document.getElementById(OP_BTNS[op]).classList.add('btn-primary');
}
function selectOperation(op) {
  selectedOp = op; buildCodePanel(OP_CODES[op]); highlightCodeLines(null); setActiveButton(op);
  const hints = { enqueue: 'Enter a value, then press ▶ Play.', dequeue: 'Press ▶ Play to dequeue the front element.', front: 'Press ▶ Play to peek at the front element.' };
  statusMsg.textContent = hints[op];
}

function buildEnqueueSteps(q, val) {
  const steps = []; const d = [...q];
  steps.push({ queue: [...d], active: -1, hl: [0], status: `enqueue(${val})` });
  d.push(val);
  steps.push({ queue: [...d], active: d.length - 1, hl: [1, 2], status: `push_back(${val}), rear = ${d.length - 1}` });
  steps.push({ queue: [...d], active: -1, hl: [3], status: `Enqueue complete — O(1)` });
  return { steps, finalQueue: [...d] };
}
function buildDequeueSteps(q) {
  const steps = []; const d = [...q];
  steps.push({ queue: [...d], active: -1, hl: [0], status: `dequeue()` });
  if (d.length === 0) { steps.push({ queue: [...d], active: -1, hl: [1, 2], status: `Queue empty — underflow!` }); return { steps, finalQueue: [...d] }; }
  const val = d[0];
  steps.push({ queue: [...d], active: 0, hl: [3], status: `val = data[front] = ${val}` });
  d.shift();
  steps.push({ queue: [...d], active: -1, hl: [4], status: `front++` });
  steps.push({ queue: [...d], active: -1, hl: [5], status: `Returning ${val} — O(1)` });
  return { steps, finalQueue: [...d] };
}
function buildFrontSteps(q) {
  const steps = []; const d = [...q];
  steps.push({ queue: [...d], active: -1, hl: [0], status: `front()` });
  if (d.length === 0) { steps.push({ queue: [...d], active: -1, hl: [1], status: `Queue empty — returning -1` }); return { steps, finalQueue: [...d] }; }
  steps.push({ queue: [...d], active: 0, hl: [2], status: `data[front] = ${d[0]}` });
  steps.push({ queue: [...d], active: -1, hl: [3], status: `Front complete — O(1)` });
  return { steps, finalQueue: [...d] };
}

function runSelectedOp() {
  let steps, finalQueue;
  switch (selectedOp) {
    case 'enqueue': {
      const val = parseInt(valInput.value); if (isNaN(val)) { log('Enter a valid number.'); return null; }
      ({ steps, finalQueue } = buildEnqueueSteps(queue, val)); valInput.value = ''; break;
    }
    case 'dequeue': { ({ steps, finalQueue } = buildDequeueSteps(queue)); break; }
    case 'front': { ({ steps, finalQueue } = buildFrontSteps(queue)); break; }
  }
  queue = finalQueue;
  return steps;
}

const engine = new PlaybackEngine({
  onStep: (step) => { render(step.queue, step.active); highlightCodeLines(step.hl); statusMsg.textContent = step.status; log(step.status); },
  onFinish: () => { statusMsg.textContent = '✓ Done.'; },
  onReset: () => { queue = [4, 9, 2, 7, 11]; logContainer.innerHTML = ''; render(queue); selectOperation('enqueue'); },
  onRun: () => runSelectedOp()
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

document.getElementById('btn-enqueue').addEventListener('click', () => selectOperation('enqueue'));
document.getElementById('btn-dequeue').addEventListener('click', () => selectOperation('dequeue'));
document.getElementById('btn-front').addEventListener('click', () => selectOperation('front'));
document.getElementById('btn-reset').addEventListener('click', () => engine.reset());
valInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') engine.play(); });

selectOperation('enqueue'); render(queue); log('Queue initialized with [4, 9, 2, 7, 11].');
