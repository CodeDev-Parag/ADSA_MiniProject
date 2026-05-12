class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

let root = null;
let isAnimating = false;

const canvas = document.getElementById('tree-canvas');
const ctx = canvas.getContext('2d');
const valInput = document.getElementById('val-input');
const btnInsert = document.getElementById('btn-insert');
const btnReset = document.getElementById('btn-reset');
const logContainer = document.getElementById('log-container');

function resizeCanvas() {
  const container = document.getElementById('tree-view');
  canvas.width = container.clientWidth;
  canvas.height = 400;
  drawTree();
}

window.addEventListener('resize', resizeCanvas);

function logMsg(msg) {
  const p = document.createElement('div');
  p.textContent = `> ${msg}`;
  logContainer.appendChild(p);
  logContainer.scrollTop = logContainer.scrollHeight;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculatePositions(node, x, y, xOffset) {
  if (!node) return;
  node.x = x;
  node.y = y;
  calculatePositions(node.left, x - xOffset, y + 60, xOffset / 1.8);
  calculatePositions(node.right, x + xOffset, y + 60, xOffset / 1.8);
}

function drawNode(x, y, val, color, textColor = '#fff') {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = "bold 16px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(val, x, y);
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTreeAux(node) {
  if (!node) return;
  if (node.left) {
    drawLine(node.x, node.y, node.left.x, node.left.y);
    drawTreeAux(node.left);
  }
  if (node.right) {
    drawLine(node.x, node.y, node.right.x, node.right.y);
    drawTreeAux(node.right);
  }
  drawNode(node.x, node.y, node.val, '#1e293b');
}

function drawTree() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (root) {
    calculatePositions(root, canvas.width / 2, 40, canvas.width / 4);
    drawTreeAux(root);
  }
}

async function insert(val) {
  if (!root) {
    root = new TreeNode(val);
    logMsg(`Inserted ${val} as root.`);
    drawTree();
    return;
  }

  let curr = root;
  while (curr) {
    // Highlight current
    drawTree();
    drawNode(curr.x, curr.y, curr.val, '#f97316'); // Updating color
    await sleep(600);

    if (val < curr.val) {
      logMsg(`${val} < ${curr.val}, going left.`);
      if (!curr.left) {
        curr.left = new TreeNode(val);
        logMsg(`Inserted ${val} as left child of ${curr.val}.`);
        break;
      }
      curr = curr.left;
    } else if (val > curr.val) {
      logMsg(`${val} > ${curr.val}, going right.`);
      if (!curr.right) {
        curr.right = new TreeNode(val);
        logMsg(`Inserted ${val} as right child of ${curr.val}.`);
        break;
      }
      curr = curr.right;
    } else {
      logMsg(`${val} already exists.`);
      break;
    }
  }
  drawTree();
}

btnInsert.addEventListener('click', async () => {
  if (isAnimating) return;
  const val = parseInt(valInput.value);
  if (isNaN(val)) return;
  
  isAnimating = true;
  await insert(val);
  valInput.value = '';
  isAnimating = false;
});

btnReset.addEventListener('click', () => {
  if (isAnimating) return;
  root = null;
  logContainer.innerHTML = '';
  logMsg('Tree reset.');
  drawTree();
});

setTimeout(resizeCanvas, 100);

// ─── THEME TOGGLE ───
const themeToggle = document.getElementById('theme-toggle');
function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.remove('dark');
    document.getElementById('icon-sun').style.display = 'none';
    document.getElementById('icon-moon').style.display = 'block';
  }
}
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark');
  body.classList.add('theme-transitioning');
  body.classList.toggle('dark');
  document.getElementById('icon-sun').style.display = isDark ? 'none' : 'block';
  document.getElementById('icon-moon').style.display = isDark ? 'block' : 'none';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
  setTimeout(() => body.classList.remove('theme-transitioning'), 500);
}
loadTheme();
if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
