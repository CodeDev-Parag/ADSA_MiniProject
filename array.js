const arrayView = document.getElementById('array-view');
const logContainer = document.getElementById('log-container');
const idxInput = document.getElementById('idx-input');
const valInput = document.getElementById('val-input');
const btnAccess = document.getElementById('btn-access');
const btnSearch = document.getElementById('btn-search');
const btnInsert = document.getElementById('btn-insert');
const btnDelete = document.getElementById('btn-delete');
const btnReset = document.getElementById('btn-reset');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');

let arr = [12, 5, 8, 3, 9, 7, 14, 2];
let selectedOp = 'access';

// ─── OPERATION-SPECIFIC C++ CODE ───
const CODE_ACCESS = [
  { code: 'int access(int arr[], int i) {', mix: [{ t: 'int', c: 'syn-type' }, { t: ' access(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' arr[], ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' i) {', c: '' }] },
  { code: '    // base_addr + i * sizeof(int)', cls: 'syn-comment' },
  { code: '    return arr[i];', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' arr[i];', c: '' }] },
  { code: '}  // O(1) — constant time', mix: [{ t: '}  ', c: '' }, { t: '// O(1) — constant time', c: 'syn-comment' }] },
];
const CODE_SEARCH = [
  { code: 'int linearSearch(int arr[], int n,', mix: [{ t: 'int', c: 'syn-type' }, { t: ' linearSearch(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' arr[], ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' n,', c: '' }] },
  { code: '                  int target) {', mix: [{ t: '                  ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' target) {', c: '' }] },
  { code: '    for (int i = 0; i < n; i++) {', mix: [{ t: '    ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' i = 0; i < n; i++) {', c: '' }] },
  { code: '        if (arr[i] == target)', mix: [{ t: '        ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (arr[i] == target)', c: '' }] },
  { code: '            return i;  // found', mix: [{ t: '            ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' i;  ', c: '' }, { t: '// found', c: 'syn-comment' }] },
  { code: '    }', plain: true },
  { code: '    return -1;  // O(N)', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' -1;  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_INSERT = [
  { code: 'void insertAt(vector<int>& a,', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insertAt(vector<', c: '' }, { t: 'int', c: 'syn-type' }, { t: '>& a,', c: '' }] },
  { code: '              int idx, int val) {', mix: [{ t: '              ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' idx, ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '    a.push_back(0);', plain: true },
  { code: '    for (int j=a.size()-1; j>idx; j--)', mix: [{ t: '    ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' j=a.size()-1; j>idx; j--)', c: '' }] },
  { code: '        a[j] = a[j-1]; // shift right', mix: [{ t: '        a[j] = a[j-1]; ', c: '' }, { t: '// shift right', c: 'syn-comment' }] },
  { code: '    a[idx] = val;', plain: true },
  { code: '}  // O(N)', mix: [{ t: '}  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
];
const CODE_DELETE = [
  { code: 'void deleteAt(vector<int>& a,', mix: [{ t: 'void', c: 'syn-type' }, { t: ' deleteAt(vector<', c: '' }, { t: 'int', c: 'syn-type' }, { t: '>& a,', c: '' }] },
  { code: '              int idx) {', mix: [{ t: '              ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' idx) {', c: '' }] },
  { code: '    for (int j=idx; j<a.size()-1; j++)', mix: [{ t: '    ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' j=idx; j<a.size()-1; j++)', c: '' }] },
  { code: '        a[j] = a[j+1]; // shift left', mix: [{ t: '        a[j] = a[j+1]; ', c: '' }, { t: '// shift left', c: 'syn-comment' }] },
  { code: '    a.pop_back();', plain: true },
  { code: '}  // O(N)', mix: [{ t: '}  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
];

const OP_CODES = { access: CODE_ACCESS, search: CODE_SEARCH, insert: CODE_INSERT, delete: CODE_DELETE };
const OP_BTNS = { access: 'btn-access', search: 'btn-search', insert: 'btn-insert', delete: 'btn-delete' };

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
function highlightCodeLines(indices) {
  document.querySelectorAll('.code-line.active').forEach(el => el.classList.remove('active'));
  if (!indices) return;
  indices.forEach(idx => { const row = codeBody.querySelector(`[data-line-idx="${idx}"]`); if (row) { row.classList.add('active'); } });
}

// ─── HELPERS ───
function log(msg) { const div = document.createElement('div'); div.textContent = `> ${msg}`; logContainer.appendChild(div); logContainer.scrollTop = logContainer.scrollHeight; }
function render(data, activeIndices = [], foundIndex = -1) {
  arrayView.innerHTML = '';
  if (data.length === 0) { arrayView.innerHTML = '<div style="color:var(--fg-muted); font-family:var(--font-mono); font-size:0.875rem;">Array is empty</div>'; return; }
  data.forEach((val, i) => {
    const wrap = document.createElement('div'); wrap.className = 'array-item-wrapper';
    const el = document.createElement('div'); el.className = 'array-item';
    if (i === foundIndex) el.classList.add('found');
    else if (activeIndices.includes(i)) el.classList.add('active');
    el.textContent = val;
    const idx = document.createElement('span'); idx.className = 'item-index'; idx.textContent = `[${i}]`;
    wrap.appendChild(el); wrap.appendChild(idx); arrayView.appendChild(wrap);
  });
}

// ─── ACTIVE BUTTON HIGHLIGHT ───
function setActiveButton(op) {
  Object.values(OP_BTNS).forEach(id => {
    document.getElementById(id).classList.remove('btn-primary');
  });
  document.getElementById(OP_BTNS[op]).classList.add('btn-primary');
}

function selectOperation(op) {
  selectedOp = op;
  buildCodePanel(OP_CODES[op]);
  highlightCodeLines(null);
  setActiveButton(op);
  const hints = { access: 'Enter an index, then press ▶ Play.', search: 'Enter a value, then press ▶ Play.', insert: 'Enter index + value, then press ▶ Play.', delete: 'Enter an index, then press ▶ Play.' };
  statusMsg.textContent = hints[op];
}

// ─── STEP BUILDERS ───
function buildAccessSteps(a, idx) {
  const steps = [];
  if (idx < 0 || idx >= a.length) { steps.push({ arr: [...a], active: [], found: -1, hl: null, status: `Index ${idx} out of bounds!` }); return { steps, finalArr: [...a] }; }
  steps.push({ arr: [...a], active: [], found: -1, hl: [0], status: `access(arr, ${idx})` });
  steps.push({ arr: [...a], active: [idx], found: -1, hl: [1, 2], status: `Computing: base + ${idx} × sizeof(int)` });
  steps.push({ arr: [...a], active: [], found: idx, hl: [2], status: `arr[${idx}] = ${a[idx]}` });
  steps.push({ arr: [...a], active: [], found: -1, hl: [3], status: `Access complete — O(1)` });
  return { steps, finalArr: [...a] };
}
function buildSearchSteps(a, val) {
  const steps = [];
  steps.push({ arr: [...a], active: [], found: -1, hl: [0, 1], status: `linearSearch(arr, ${val})` });
  let found = false;
  for (let i = 0; i < a.length; i++) {
    steps.push({ arr: [...a], active: [i], found: -1, hl: [2, 3], status: `[${i}] arr[${i}]=${a[i]} == ${val}?` });
    if (a[i] === val) { steps.push({ arr: [...a], active: [], found: i, hl: [4], status: `Found at index ${i}!` }); found = true; break; }
  }
  if (!found) steps.push({ arr: [...a], active: [], found: -1, hl: [6], status: `Not found — return -1` });
  else steps.push({ arr: [...a], active: [], found: -1, hl: [7], status: `Search complete — O(N)` });
  return { steps, finalArr: [...a] };
}
function buildInsertSteps(a, idx, val) {
  const steps = []; const d = [...a]; const ci = Math.max(0, Math.min(idx, d.length));
  steps.push({ arr: [...d], active: [], found: -1, hl: [0, 1], status: `insertAt(arr, ${ci}, ${val})` });
  d.push(0);
  steps.push({ arr: [...d], active: [d.length - 1], found: -1, hl: [2], status: `push_back(0) — grow array` });
  for (let j = d.length - 1; j > ci; j--) { d[j] = d[j - 1]; steps.push({ arr: [...d], active: [j, j - 1], found: -1, hl: [3, 4], status: `Shift arr[${j - 1}] → arr[${j}]` }); }
  d[ci] = val;
  steps.push({ arr: [...d], active: [], found: ci, hl: [5], status: `arr[${ci}] = ${val}` });
  steps.push({ arr: [...d], active: [], found: -1, hl: [6], status: `Insert complete — O(N)` });
  return { steps, finalArr: [...d] };
}
function buildDeleteSteps(a, idx) {
  const steps = []; const d = [...a];
  if (idx < 0 || idx >= d.length) { steps.push({ arr: [...d], active: [], found: -1, hl: null, status: `Index ${idx} out of bounds!` }); return { steps, finalArr: [...d] }; }
  steps.push({ arr: [...d], active: [idx], found: -1, hl: [0, 1], status: `deleteAt(arr, ${idx})` });
  for (let j = idx; j < d.length - 1; j++) { d[j] = d[j + 1]; steps.push({ arr: [...d], active: [j, j + 1], found: -1, hl: [2, 3], status: `Shift arr[${j + 1}] → arr[${j}]` }); }
  d.pop();
  steps.push({ arr: [...d], active: [], found: -1, hl: [4], status: `pop_back() — shrink array` });
  steps.push({ arr: [...d], active: [], found: -1, hl: [5], status: `Delete complete — O(N)` });
  return { steps, finalArr: [...d] };
}

// ─── RUN SELECTED OPERATION (called by Play) ───
function runSelectedOp() {
  let steps, finalArr;
  switch (selectedOp) {
    case 'access': {
      const idx = parseInt(idxInput.value);
      if (isNaN(idx)) { log('Enter a valid index.'); return null; }
      ({ steps, finalArr } = buildAccessSteps(arr, idx));
      break;
    }
    case 'search': {
      const val = parseInt(valInput.value);
      if (isNaN(val)) { log('Enter a value to search.'); return null; }
      ({ steps, finalArr } = buildSearchSteps(arr, val));
      break;
    }
    case 'insert': {
      const idx = parseInt(idxInput.value), val = parseInt(valInput.value);
      if (isNaN(idx) || isNaN(val)) { log('Enter index and value.'); return null; }
      ({ steps, finalArr } = buildInsertSteps(arr, idx, val));
      break;
    }
    case 'delete': {
      const idx = parseInt(idxInput.value);
      if (isNaN(idx)) { log('Enter a valid index.'); return null; }
      ({ steps, finalArr } = buildDeleteSteps(arr, idx));
      break;
    }
  }
  arr = finalArr;
  return steps;
}

// ─── PLAYBACK ENGINE ───
const engine = new PlaybackEngine({
  onStep: (step) => { render(step.arr, step.active, step.found); highlightCodeLines(step.hl); statusMsg.textContent = step.status; log(step.status); },
  onFinish: () => { statusMsg.textContent = '✓ Done.'; },
  onReset: () => { arr = [12, 5, 8, 3, 9, 7, 14, 2]; logContainer.innerHTML = ''; render(arr); selectOperation('access'); },
  onRun: () => { return runSelectedOp(); }
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

// Operation buttons just SELECT the mode (switch code + highlight button)
btnAccess.addEventListener('click', () => selectOperation('access'));
btnSearch.addEventListener('click', () => selectOperation('search'));
btnInsert.addEventListener('click', () => selectOperation('insert'));
btnDelete.addEventListener('click', () => selectOperation('delete'));
btnReset.addEventListener('click', () => engine.reset());

// Init
selectOperation('access');
render(arr);
log('Array initialized with [12, 5, 8, 3, 9, 7, 14, 2].');
