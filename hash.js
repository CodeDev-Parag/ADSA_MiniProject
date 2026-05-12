const SIZE = 7;
let table = Array(SIZE).fill(null);
let hashType = 'linear';
const hashView = document.getElementById('hash-view');
const valInput = document.getElementById('val-input');
const typeSelect = document.getElementById('hash-type');
const logContainer = document.getElementById('log-container');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');

const CODE_LINEAR = [
  { code: 'void insert(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insert(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '    int idx = val % SIZE;', plain: true },
  { code: '' },
  { code: '    while (table[idx] != -1) {', mix: [{ t: '    ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (table[idx] != -1) {', c: '' }] },
  { code: '        idx = (idx + 1) % SIZE;', plain: true },
  { code: '        // linear probe next', cls: 'syn-comment' },
  { code: '    }', plain: true },
  { code: '' },
  { code: '    table[idx] = val;  // O(1) avg', mix: [{ t: '    table[idx] = val;  ', c: '' }, { t: '// O(1) avg', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_CHAINING = [
  { code: 'void insert(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insert(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '    int idx = val % SIZE;', plain: true },
  { code: '    Node* n = new Node{val,', mix: [{ t: '    Node* n = ', c: '' }, { t: 'new', c: 'syn-keyword' }, { t: ' Node{val,', c: '' }] },
  { code: '                  table[idx]};', plain: true },
  { code: '    table[idx] = n;  // O(1) avg', mix: [{ t: '    table[idx] = n;  ', c: '' }, { t: '// O(1) avg', c: 'syn-comment' }] },
  { code: '}', plain: true },
];

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
function logMsg(msg) { const p = document.createElement('div'); p.textContent = `> ${msg}`; logContainer.appendChild(p); logContainer.scrollTop = logContainer.scrollHeight; }

function renderTable(activeIdx = -1, foundIdx = -1) {
  hashView.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const row = document.createElement('div'); row.className = 'bucket-row';
    const idx = document.createElement('div'); idx.className = 'bucket-index'; idx.textContent = i;
    const box = document.createElement('div'); box.className = 'bucket-box';
    if (i === activeIdx) box.classList.add('active');
    if (i === foundIdx) box.classList.add('found');
    row.appendChild(idx); row.appendChild(box);
    if (hashType === 'linear') {
      box.textContent = table[i] !== null ? table[i] : '';
    } else {
      box.textContent = '';
      const chain = document.createElement('div'); chain.className = 'chain-container';
      if (Array.isArray(table[i])) {
        table[i].forEach((val, index) => {
          if (index > 0) { const arrow = document.createElement('span'); arrow.className = 'chain-arrow'; arrow.textContent = '→'; chain.appendChild(arrow); }
          const node = document.createElement('div'); node.className = 'chain-node'; node.textContent = val; chain.appendChild(node);
        });
      }
      row.appendChild(chain);
    }
    hashView.appendChild(row);
  }
}

function buildLinearSteps(val) {
  const steps = []; let hash = ((val % SIZE) + SIZE) % SIZE;
  steps.push({ active: -1, found: -1, hl: [0, 1], status: `h(${val}) = ${val} % ${SIZE} = ${hash}` });
  for (let i = 0; i < SIZE; i++) {
    let idx = (hash + i) % SIZE;
    if (table[idx] === null) {
      steps.push({ active: idx, found: -1, hl: [3, 4], status: `Slot ${idx} is empty.` });
      steps.push({ active: -1, found: idx, hl: [8], status: `Inserted ${val} at slot ${idx}.`, doInsert: { idx, val } });
      steps.push({ active: -1, found: -1, hl: [9], status: `Insert complete — O(1) avg.` });
      return steps;
    } else {
      steps.push({ active: idx, found: -1, hl: [3, 4, 5], status: `Slot ${idx} = ${table[idx]}. Probing...` });
    }
  }
  steps.push({ active: -1, found: -1, hl: [9], status: `Table full!` });
  return steps;
}
function buildChainingSteps(val) {
  const steps = []; let hash = ((val % SIZE) + SIZE) % SIZE;
  steps.push({ active: -1, found: -1, hl: [0, 1], status: `h(${val}) = ${val} % ${SIZE} = ${hash}` });
  steps.push({ active: hash, found: -1, hl: [2, 3], status: `Creating node, linking to chain[${hash}]` });
  steps.push({ active: -1, found: hash, hl: [4], status: `Inserted ${val} into chain[${hash}].`, doChain: { idx: hash, val } });
  steps.push({ active: -1, found: -1, hl: [5], status: `Insert complete — O(1) avg.` });
  return steps;
}

function runSelectedOp() {
  const val = parseInt(valInput.value);
  if (isNaN(val)) { logMsg('Enter a valid number.'); return null; }
  buildCodePanel(hashType === 'linear' ? CODE_LINEAR : CODE_CHAINING);
  const steps = hashType === 'linear' ? buildLinearSteps(val) : buildChainingSteps(val);
  valInput.value = '';
  return steps;
}

const engine = new PlaybackEngine({
  onStep: (step) => {
    if (step.doInsert) table[step.doInsert.idx] = step.doInsert.val;
    if (step.doChain) { const idx = step.doChain.idx; if (table[idx] === null) table[idx] = []; table[idx].push(step.doChain.val); }
    renderTable(step.active, step.found); highlightCodeLines(step.hl); statusMsg.textContent = step.status; logMsg(step.status);
  },
  onFinish: () => { statusMsg.textContent = '✓ Done.'; },
  onReset: () => { table = Array(SIZE).fill(null); logContainer.innerHTML = ''; statusMsg.textContent = 'Enter a value and press ▶ Play.'; renderTable(); highlightCodeLines(null); },
  onRun: () => runSelectedOp()
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

document.getElementById('btn-insert').addEventListener('click', () => { statusMsg.textContent = 'Enter a value, then press ▶ Play.'; });
document.getElementById('btn-reset').addEventListener('click', () => engine.reset());
typeSelect.addEventListener('change', (e) => {
  if (engine.isPlaying) { e.preventDefault(); return; }
  hashType = e.target.value;
  table = Array(SIZE).fill(null); logContainer.innerHTML = '';
  renderTable();
  buildCodePanel(hashType === 'linear' ? CODE_LINEAR : CODE_CHAINING);
  statusMsg.textContent = `Switched to ${hashType === 'linear' ? 'Linear Probing' : 'Separate Chaining'}. Enter a value and press ▶ Play.`;
});

buildCodePanel(CODE_LINEAR); renderTable(); logMsg('System ready.');
