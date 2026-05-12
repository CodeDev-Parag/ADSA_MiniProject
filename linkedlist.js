const llView = document.getElementById('ll-view');
const logContainer = document.getElementById('log-container');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');
const valInput = document.getElementById('val-input');
const posInput = document.getElementById('pos-input');

let list = [10, 20, 30, 40, 50];
let selectedOp = 'insertHead';

// ─── C++ CODE BLOCKS ───
const CODE_INSERT_HEAD = [
  { code: 'void insertHead(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insertHead(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '  Node* n = new Node(val);', mix: [{ t: '  Node* n = ', c: '' }, { t: 'new', c: 'syn-keyword' }, { t: ' Node(val);', c: '' }] },
  { code: '  n->next = head;', plain: true },
  { code: '  head = n;  // O(1)', mix: [{ t: '  head = n;  ', c: '' }, { t: '// O(1)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_INSERT_TAIL = [
  { code: 'void insertTail(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insertTail(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '  Node* n = new Node(val);', mix: [{ t: '  Node* n = ', c: '' }, { t: 'new', c: 'syn-keyword' }, { t: ' Node(val);', c: '' }] },
  { code: '  if (!head) { head = n; return; }', mix: [{ t: '  ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (!head) { head = n; ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: '; }', c: '' }] },
  { code: '  Node* cur = head;', plain: true },
  { code: '  while (cur->next)', mix: [{ t: '  ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (cur->next)', c: '' }] },
  { code: '    cur = cur->next;', plain: true },
  { code: '  cur->next = n;  // O(N)', mix: [{ t: '  cur->next = n;  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_DELETE = [
  { code: 'void deleteVal(int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' deleteVal(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '  if (!head) return;', mix: [{ t: '  ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (!head) ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ';', c: '' }] },
  { code: '  if (head->data == val) {', mix: [{ t: '  ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (head->data == val) {', c: '' }] },
  { code: '    head = head->next; return;', plain: true },
  { code: '  }', plain: true },
  { code: '  Node* cur = head;', plain: true },
  { code: '  while (cur->next) {', mix: [{ t: '  ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (cur->next) {', c: '' }] },
  { code: '    if (cur->next->data == val) {', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (cur->next->data == val) {', c: '' }] },
  { code: '      cur->next = cur->next->next;', plain: true },
  { code: '      return;', mix: [{ t: '      ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ';', c: '' }] },
  { code: '    } cur = cur->next;', plain: true },
  { code: '  }', plain: true },
  { code: '}', plain: true },
];
const CODE_SEARCH = [
  { code: 'int search(int val) {', mix: [{ t: 'int', c: 'syn-type' }, { t: ' search(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '  Node* cur = head;', plain: true },
  { code: '  int idx = 0;', mix: [{ t: '  ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' idx = 0;', c: '' }] },
  { code: '  while (cur) {', mix: [{ t: '  ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (cur) {', c: '' }] },
  { code: '    if (cur->data == val)', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (cur->data == val)', c: '' }] },
  { code: '      return idx;', mix: [{ t: '      ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' idx;', c: '' }] },
  { code: '    cur = cur->next; idx++;', plain: true },
  { code: '  }', plain: true },
  { code: '  return -1;  // O(N)', mix: [{ t: '  ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' -1;  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_REVERSE = [
  { code: 'void reverse() {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' reverse() {', c: '' }] },
  { code: '  Node *prev=NULL, *cur=head;', plain: true },
  { code: '  while (cur) {', mix: [{ t: '  ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (cur) {', c: '' }] },
  { code: '    Node* nxt = cur->next;', plain: true },
  { code: '    cur->next = prev;', plain: true },
  { code: '    prev = cur;', plain: true },
  { code: '    cur = nxt;', plain: true },
  { code: '  }', plain: true },
  { code: '  head = prev;  // O(N)', mix: [{ t: '  head = prev;  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];
const CODE_INSERT_POS = [
  { code: 'void insertAt(int pos, int val) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insertAt(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' pos, ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '  if (pos==0) {insertHead(val);return;}', plain: true },
  { code: '  Node* cur = head;', plain: true },
  { code: '  for (int i=0; i<pos-1; i++)', mix: [{ t: '  ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' i=0; i<pos-1; i++)', c: '' }] },
  { code: '    cur = cur->next;', plain: true },
  { code: '  Node* n = new Node(val);', mix: [{ t: '  Node* n = ', c: '' }, { t: 'new', c: 'syn-keyword' }, { t: ' Node(val);', c: '' }] },
  { code: '  n->next = cur->next;', plain: true },
  { code: '  cur->next = n;  // O(N)', mix: [{ t: '  cur->next = n;  ', c: '' }, { t: '// O(N)', c: 'syn-comment' }] },
  { code: '}', plain: true },
];

const OP_CODES = { insertHead: CODE_INSERT_HEAD, insertTail: CODE_INSERT_TAIL, insertPos: CODE_INSERT_POS, delete: CODE_DELETE, search: CODE_SEARCH, reverse: CODE_REVERSE };
const OP_BTNS = { insertHead: 'btn-insert-head', insertTail: 'btn-insert-tail', insertPos: 'btn-insert-pos', delete: 'btn-delete', search: 'btn-search', reverse: 'btn-reverse' };

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
  indices.forEach(idx => { const row = codeBody.querySelector(`[data-line-idx="${idx}"]`); if (row) row.classList.add('active'); });
}
function log(msg) { const div = document.createElement('div'); div.textContent = `> ${msg}`; logContainer.appendChild(div); logContainer.scrollTop = logContainer.scrollHeight; }

// ─── RENDER ───
function render(data, activeIdx = -1, foundIdx = -1, deletingIdx = -1) {
  llView.innerHTML = '';
  if (data.length === 0) { llView.innerHTML = '<div style="color:var(--fg-muted);font-family:var(--font-mono);font-size:0.875rem;">List is empty (head → NULL)</div>'; return; }
  data.forEach((val, i) => {
    const node = document.createElement('div'); node.className = 'll-node';
    const box = document.createElement('div'); box.className = 'll-node-box';
    if (i === foundIdx) box.classList.add('found');
    else if (i === deletingIdx) box.classList.add('deleting');
    else if (i === activeIdx) box.classList.add('active');
    const dataEl = document.createElement('div'); dataEl.className = 'll-data'; dataEl.textContent = val;
    const nextEl = document.createElement('div'); nextEl.className = 'll-next'; nextEl.textContent = '→';
    box.appendChild(dataEl); box.appendChild(nextEl);
    if (i === 0) { const headLabel = document.createElement('div'); headLabel.className = 'll-head-label'; headLabel.textContent = 'HEAD'; node.appendChild(headLabel); }
    node.appendChild(box);
    const arrow = document.createElement('div'); arrow.className = 'll-arrow'; arrow.textContent = '→';
    node.appendChild(arrow);
    llView.appendChild(node);
  });
  const nullEl = document.createElement('div'); nullEl.className = 'll-null'; nullEl.textContent = 'NULL';
  llView.appendChild(nullEl);
}

// ─── ACTIVE BUTTON ───
function setActiveButton(op) {
  Object.values(OP_BTNS).forEach(id => document.getElementById(id).classList.remove('btn-primary'));
  document.getElementById(OP_BTNS[op]).classList.add('btn-primary');
}
function selectOperation(op) {
  selectedOp = op;
  buildCodePanel(OP_CODES[op]);
  highlightCodeLines(null);
  setActiveButton(op);
  statusMsg.textContent = 'Select values and press ▶ Play.';
}

// ─── STEP BUILDERS ───
function buildInsertHeadSteps(lst, val) {
  const steps = [], d = [...lst];
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [0], status: `insertHead(${val})` });
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [1], status: `Create new node(${val})` });
  d.unshift(val);
  steps.push({ list: [...d], active: 0, found: -1, del: -1, hl: [2, 3], status: `n→next = head; head = n` });
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [4], status: '✓ Insert Head complete — O(1)' });
  return { steps, finalList: [...d] };
}
function buildInsertTailSteps(lst, val) {
  const steps = [], d = [...lst];
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [0, 1], status: `insertTail(${val})` });
  for (let i = 0; i < d.length; i++) {
    steps.push({ list: [...d], active: i, found: -1, del: -1, hl: [4, 5], status: `Traverse: node[${i}] = ${d[i]}` });
  }
  d.push(val);
  steps.push({ list: [...d], active: d.length - 1, found: -1, del: -1, hl: [6], status: `cur→next = new Node(${val})` });
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [7], status: '✓ Insert Tail complete — O(N)' });
  return { steps, finalList: [...d] };
}
function buildInsertPosSteps(lst, pos, val) {
  const steps = [], d = [...lst];
  const p = Math.max(0, Math.min(pos, d.length));
  if (p === 0) return buildInsertHeadSteps(lst, val);
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [0], status: `insertAt(${p}, ${val})` });
  for (let i = 0; i < Math.min(p, d.length); i++) {
    steps.push({ list: [...d], active: i, found: -1, del: -1, hl: [3, 4], status: `Traverse to position ${i}` });
  }
  d.splice(p, 0, val);
  steps.push({ list: [...d], active: p, found: -1, del: -1, hl: [5, 6, 7], status: `Inserted ${val} at position ${p}` });
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [8], status: '✓ Insert At complete — O(N)' });
  return { steps, finalList: [...d] };
}
function buildDeleteSteps(lst, val) {
  const steps = [], d = [...lst];
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [0], status: `deleteVal(${val})` });
  const idx = d.indexOf(val);
  if (idx === -1) {
    for (let i = 0; i < d.length; i++) steps.push({ list: [...d], active: i, found: -1, del: -1, hl: [6, 7], status: `Check node[${i}]=${d[i]} ≠ ${val}` });
    steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [12], status: `Value ${val} not found!` });
    return { steps, finalList: [...d] };
  }
  for (let i = 0; i <= idx; i++) {
    if (i === idx) { steps.push({ list: [...d], active: -1, found: -1, del: i, hl: idx === 0 ? [2, 3] : [7, 8], status: `Found ${val} at node[${i}] — removing` }); }
    else { steps.push({ list: [...d], active: i, found: -1, del: -1, hl: [6, 7], status: `Traverse node[${i}]=${d[i]}` }); }
  }
  d.splice(idx, 1);
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [9], status: `✓ Deleted ${val} — O(N)` });
  return { steps, finalList: [...d] };
}
function buildSearchSteps(lst, val) {
  const steps = [], d = [...lst];
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [0, 1, 2], status: `search(${val})` });
  let found = false;
  for (let i = 0; i < d.length; i++) {
    steps.push({ list: [...d], active: i, found: -1, del: -1, hl: [3, 4], status: `node[${i}]=${d[i]} == ${val}?` });
    if (d[i] === val) {
      steps.push({ list: [...d], active: -1, found: i, del: -1, hl: [5], status: `Found at position ${i}!` });
      found = true; break;
    }
  }
  if (!found) steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [8], status: `Not found — return -1` });
  else steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [9], status: '✓ Search complete — O(N)' });
  return { steps, finalList: [...d] };
}
function buildReverseSteps(lst) {
  const steps = [], d = [...lst];
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [0, 1], status: 'reverse() — prev=NULL, cur=head' });
  for (let i = 0; i < d.length; i++) {
    steps.push({ list: [...d], active: i, found: -1, del: -1, hl: [2, 3, 4, 5, 6], status: `Processing node[${i}]=${d[i]}: reverse pointer` });
  }
  d.reverse();
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [8], status: 'head = prev' });
  steps.push({ list: [...d], active: -1, found: -1, del: -1, hl: [9], status: '✓ Reverse complete — O(N)' });
  return { steps, finalList: [...d] };
}

// ─── RUN ───
function runSelectedOp() {
  let steps, finalList;
  const val = parseInt(valInput.value);
  const pos = parseInt(posInput.value);
  switch (selectedOp) {
    case 'insertHead':
      if (isNaN(val)) { log('Enter a value.'); return null; }
      ({ steps, finalList } = buildInsertHeadSteps(list, val)); break;
    case 'insertTail':
      if (isNaN(val)) { log('Enter a value.'); return null; }
      ({ steps, finalList } = buildInsertTailSteps(list, val)); break;
    case 'insertPos':
      if (isNaN(val) || isNaN(pos)) { log('Enter value and position.'); return null; }
      ({ steps, finalList } = buildInsertPosSteps(list, pos, val)); break;
    case 'delete':
      if (isNaN(val)) { log('Enter a value to delete.'); return null; }
      ({ steps, finalList } = buildDeleteSteps(list, val)); break;
    case 'search':
      if (isNaN(val)) { log('Enter a value to search.'); return null; }
      ({ steps, finalList } = buildSearchSteps(list, val)); break;
    case 'reverse':
      ({ steps, finalList } = buildReverseSteps(list)); break;
  }
  list = finalList;
  return steps;
}

// ─── PLAYBACK ───
const engine = new PlaybackEngine({
  onStep: (step) => { render(step.list, step.active, step.found, step.del); highlightCodeLines(step.hl); statusMsg.textContent = step.status; log(step.status); },
  onFinish: () => { statusMsg.textContent = '✓ Done.'; },
  onReset: () => { list = [10, 20, 30, 40, 50]; logContainer.innerHTML = ''; render(list); selectOperation('insertHead'); },
  onRun: () => runSelectedOp()
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

document.getElementById('btn-insert-head').addEventListener('click', () => selectOperation('insertHead'));
document.getElementById('btn-insert-tail').addEventListener('click', () => selectOperation('insertTail'));
document.getElementById('btn-insert-pos').addEventListener('click', () => selectOperation('insertPos'));
document.getElementById('btn-delete').addEventListener('click', () => selectOperation('delete'));
document.getElementById('btn-search').addEventListener('click', () => selectOperation('search'));
document.getElementById('btn-reverse').addEventListener('click', () => selectOperation('reverse'));
document.getElementById('btn-reset').addEventListener('click', () => engine.reset());

// ─── INIT ───
selectOperation('insertHead');
render(list);
log('Linked List initialized: 10 → 20 → 30 → 40 → 50 → NULL');
