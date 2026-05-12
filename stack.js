const stackView = document.getElementById('stack-view');
const logContainer = document.getElementById('log-container');
const valInput = document.getElementById('val-input');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');
let stack = [3, 8, 5, 12, 7];
let selectedOp = 'push';

const CODE_PUSH = [
  { code: 'void push(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' push(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '    data.push_back(val);', plain: true },
  { code: '    top = data.size() - 1;', plain: true },
  { code: '}  // O(1) amortized', mix: [{ t: '}  ', c: '' }, { t: '// O(1) amortized', c: 'syn-comment' }] },
];
const CODE_POP = [
  { code: 'int pop() {', mix: [{ t: 'int', c: 'syn-type' }, { t: ' pop() {', c: '' }] },
  { code: '    if (isEmpty())', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (isEmpty())', c: '' }] },
  { code: '        throw "underflow";', mix: [{ t: '        ', c: '' }, { t: 'throw', c: 'syn-keyword' }, { t: ' ', c: '' }, { t: '"underflow"', c: 'syn-string' }, { t: ';', c: '' }] },
  { code: '    int val = data[top];', plain: true },
  { code: '    data.pop_back();', plain: true },
  { code: '    top--;', plain: true },
  { code: '    return val;  // O(1)', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' val;  ', c: '' }, { t: '// O(1)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_PEEK = [
  { code: 'int peek() {', mix: [{ t: 'int', c: 'syn-type' }, { t: ' peek() {', c: '' }] },
  { code: '    if (isEmpty()) return -1;', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (isEmpty()) ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' ', c: '' }, { t: '-1', c: 'syn-number' }, { t: ';', c: '' }] },
  { code: '    return data[top];', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' data[top];', c: '' }] },
  { code: '}  // O(1) — no removal', mix: [{ t: '}  ', c: '' }, { t: '// O(1) — no removal', c: 'syn-comment' }] },
];

const OP_CODES = { push: CODE_PUSH, pop: CODE_POP, peek: CODE_PEEK };
const OP_BTNS = { push: 'btn-push', pop: 'btn-pop', peek: 'btn-peek' };

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
  stackView.innerHTML = '';
  if (data.length === 0) { stackView.innerHTML = '<div style="color:var(--fg-muted); font-family:var(--font-mono); font-size:0.875rem;">Stack is empty</div>'; return; }
  data.forEach((val, i) => {
    const el = document.createElement('div'); el.className = 'stack-item';
    if (i === activeIndex) el.classList.add('active');
    el.innerHTML = `<span class="item-index">[${i}]</span>${val}${i === data.length - 1 ? '<span class="item-label">TOP →</span>' : ''}`;
    stackView.appendChild(el);
  });
}

function setActiveButton(op) {
  Object.values(OP_BTNS).forEach(id => { document.getElementById(id).classList.remove('btn-primary'); });
  document.getElementById(OP_BTNS[op]).classList.add('btn-primary');
}
function selectOperation(op) {
  selectedOp = op; buildCodePanel(OP_CODES[op]); highlightCodeLines(null); setActiveButton(op);
  const hints = { push: 'Enter a value, then press ▶ Play.', pop: 'Press ▶ Play to pop the top element.', peek: 'Press ▶ Play to peek at the top element.' };
  statusMsg.textContent = hints[op];
}

function buildPushSteps(s, val) {
  const steps = []; const d = [...s];
  steps.push({ stack: [...d], active: -1, hl: [0], status: `push(${val})` });
  d.push(val);
  steps.push({ stack: [...d], active: d.length - 1, hl: [1, 2], status: `Appended ${val}. top = ${d.length - 1}` });
  steps.push({ stack: [...d], active: -1, hl: [3], status: `Push complete — O(1)` });
  return { steps, finalStack: [...d] };
}
function buildPopSteps(s) {
  const steps = []; const d = [...s];
  steps.push({ stack: [...d], active: -1, hl: [0], status: `pop()` });
  if (d.length === 0) { steps.push({ stack: [...d], active: -1, hl: [1, 2], status: `Stack empty — underflow!` }); return { steps, finalStack: [...d] }; }
  const topIdx = d.length - 1; const val = d[topIdx];
  steps.push({ stack: [...d], active: topIdx, hl: [3], status: `val = data[top] = ${val}` });
  d.pop();
  steps.push({ stack: [...d], active: -1, hl: [4, 5], status: `pop_back(); top--` });
  steps.push({ stack: [...d], active: -1, hl: [6], status: `Returning ${val} — O(1)` });
  return { steps, finalStack: [...d] };
}
function buildPeekSteps(s) {
  const steps = []; const d = [...s];
  steps.push({ stack: [...d], active: -1, hl: [0], status: `peek()` });
  if (d.length === 0) { steps.push({ stack: [...d], active: -1, hl: [1], status: `Stack empty — returning -1` }); return { steps, finalStack: [...d] }; }
  const topIdx = d.length - 1;
  steps.push({ stack: [...d], active: topIdx, hl: [2], status: `data[top] = ${d[topIdx]}` });
  steps.push({ stack: [...d], active: -1, hl: [3], status: `Peek complete — O(1)` });
  return { steps, finalStack: [...d] };
}

function runSelectedOp() {
  let steps, finalStack;
  switch (selectedOp) {
    case 'push': {
      const val = parseInt(valInput.value); if (isNaN(val)) { log('Enter a valid number.'); return null; }
      ({ steps, finalStack } = buildPushSteps(stack, val)); valInput.value = ''; break;
    }
    case 'pop': { ({ steps, finalStack } = buildPopSteps(stack)); break; }
    case 'peek': { ({ steps, finalStack } = buildPeekSteps(stack)); break; }
  }
  stack = finalStack;
  return steps;
}

const engine = new PlaybackEngine({
  onStep: (step) => { render(step.stack, step.active); highlightCodeLines(step.hl); statusMsg.textContent = step.status; log(step.status); },
  onFinish: () => { statusMsg.textContent = '✓ Done.'; },
  onReset: () => { stack = [3, 8, 5, 12, 7]; logContainer.innerHTML = ''; render(stack); selectOperation('push'); },
  onRun: () => runSelectedOp()
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

document.getElementById('btn-push').addEventListener('click', () => selectOperation('push'));
document.getElementById('btn-pop').addEventListener('click', () => selectOperation('pop'));
document.getElementById('btn-peek').addEventListener('click', () => selectOperation('peek'));
document.getElementById('btn-reset').addEventListener('click', () => engine.reset());
valInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') engine.play(); });

selectOperation('push'); render(stack); log('Stack initialized with [3, 8, 5, 12, 7].');
