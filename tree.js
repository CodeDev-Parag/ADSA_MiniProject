class TreeNode { constructor(val) { this.val = val; this.left = null; this.right = null; this.x = 0; this.y = 0; } }
let root = null;
const canvas = document.getElementById('tree-canvas');
const ctx = canvas.getContext('2d');
const valInput = document.getElementById('val-input');
const logContainer = document.getElementById('log-container');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');

function resizeCanvas() { const c = document.getElementById('tree-view'); canvas.width = c.clientWidth; canvas.height = 400; drawTree(); }
window.addEventListener('resize', resizeCanvas);

const CODE_INSERT = [
  { code: 'Node* insert(Node* root, int val) {', mix: [{ t: 'Node', c: 'syn-type' }, { t: '* insert(', c: '' }, { t: 'Node', c: 'syn-type' }, { t: '* root, ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' val) {', c: '' }] },
  { code: '    if (root == NULL)', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (root == NULL)', c: '' }] },
  { code: '        return new Node(val);', mix: [{ t: '        ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' ', c: '' }, { t: 'new', c: 'syn-keyword' }, { t: ' Node(val);', c: '' }] },
  { code: '' },
  { code: '    if (val < root->val)', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (val < root->val)', c: '' }] },
  { code: '        root->left = insert(...);', plain: true },
  { code: '    else if (val > root->val)', mix: [{ t: '    ', c: '' }, { t: 'else if', c: 'syn-keyword' }, { t: ' (val > root->val)', c: '' }] },
  { code: '        root->right = insert(...);', plain: true },
  { code: '' },
  { code: '    return root; // O(log N) avg', mix: [{ t: '    ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' root; ', c: '' }, { t: '// O(log N) avg', c: 'syn-comment' }] },
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

function calcPos(node, x, y, xOff) { if (!node) return; node.x = x; node.y = y; calcPos(node.left, x - xOff, y + 60, xOff / 1.8); calcPos(node.right, x + xOff, y + 60, xOff / 1.8); }
function drawNode(x, y, val, color) {
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = "bold 16px 'JetBrains Mono', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(val, x, y);
}
function drawLine(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke(); }
function drawTreeAux(node, hlVal) {
  if (!node) return;
  if (node.left) { drawLine(node.x, node.y, node.left.x, node.left.y); drawTreeAux(node.left, hlVal); }
  if (node.right) { drawLine(node.x, node.y, node.right.x, node.right.y); drawTreeAux(node.right, hlVal); }
  drawNode(node.x, node.y, node.val, node.val === hlVal ? '#f97316' : '#1e293b');
}
function drawTree(hlVal = null) { ctx.clearRect(0, 0, canvas.width, canvas.height); if (root) { calcPos(root, canvas.width / 2, 40, canvas.width / 4); drawTreeAux(root, hlVal); } }
function actualInsert(val) {
  if (!root) { root = new TreeNode(val); return; }
  let c = root;
  while (c) { if (val < c.val) { if (!c.left) { c.left = new TreeNode(val); return; } c = c.left; } else if (val > c.val) { if (!c.right) { c.right = new TreeNode(val); return; } c = c.right; } else return; }
}

function buildInsertSteps(val) {
  const steps = [];
  if (!root) {
    steps.push({ hl: [1, 2], hlVal: null, status: `Tree empty. Inserting ${val} as root.`, doInsert: val });
    steps.push({ hl: [1, 2], hlVal: val, status: `${val} is now the root.` });
    steps.push({ hl: [9, 10], hlVal: null, status: `Insert complete.` });
    return steps;
  }
  steps.push({ hl: [0], hlVal: null, status: `insert(root, ${val})` });
  let c = root;
  while (c) {
    if (val < c.val) {
      steps.push({ hl: [4, 5], hlVal: c.val, status: `${val} < ${c.val} → go left` });
      if (!c.left) { steps.push({ hl: [1, 2], hlVal: val, status: `NULL found. Insert ${val} here.`, doInsert: val }); break; }
      c = c.left;
    } else if (val > c.val) {
      steps.push({ hl: [6, 7], hlVal: c.val, status: `${val} > ${c.val} → go right` });
      if (!c.right) { steps.push({ hl: [1, 2], hlVal: val, status: `NULL found. Insert ${val} here.`, doInsert: val }); break; }
      c = c.right;
    } else { steps.push({ hl: [9], hlVal: c.val, status: `${val} already exists. Skipping.` }); break; }
  }
  steps.push({ hl: [9, 10], hlVal: null, status: `Insert complete.` });
  return steps;
}

function runSelectedOp() {
  const val = parseInt(valInput.value);
  if (isNaN(val)) { logMsg('Enter a valid number.'); return null; }
  const steps = buildInsertSteps(val);
  valInput.value = '';
  return steps;
}

const engine = new PlaybackEngine({
  onStep: (step) => { if (step.doInsert !== undefined) actualInsert(step.doInsert); drawTree(step.hlVal); highlightCodeLines(step.hl); statusMsg.textContent = step.status; logMsg(step.status); },
  onFinish: () => { statusMsg.textContent = '✓ Done.'; },
  onReset: () => { root = null; logContainer.innerHTML = ''; statusMsg.textContent = 'Enter a number and press ▶ Play.'; drawTree(); highlightCodeLines(null); },
  onRun: () => runSelectedOp()
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

document.getElementById('btn-insert').addEventListener('click', () => { statusMsg.textContent = 'Enter a number, then press ▶ Play.'; });
document.getElementById('btn-reset').addEventListener('click', () => engine.reset());
valInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') engine.play(); });

buildCodePanel(CODE_INSERT); setTimeout(resizeCanvas, 100);
