const SIZE = 7;
let table = Array(SIZE).fill(null);
let hashType = 'linear'; // 'linear' or 'chaining'
let isAnimating = false;

const hashView = document.getElementById('hash-view');
const valInput = document.getElementById('val-input');
const btnInsert = document.getElementById('btn-insert');
const btnReset = document.getElementById('btn-reset');
const typeSelect = document.getElementById('hash-type');
const logContainer = document.getElementById('log-container');
const descText = document.getElementById('desc-text');

function logMsg(msg) {
  const p = document.createElement('div');
  p.textContent = `> ${msg}`;
  logContainer.appendChild(p);
  logContainer.scrollTop = logContainer.scrollHeight;
}

function renderTable() {
  hashView.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const row = document.createElement('div');
    row.className = 'bucket-row';
    row.id = `row-${i}`;

    const idx = document.createElement('div');
    idx.className = 'bucket-index';
    idx.textContent = i;

    const box = document.createElement('div');
    box.className = 'bucket-box';
    box.id = `box-${i}`;

    row.appendChild(idx);
    row.appendChild(box);

    if (hashType === 'linear') {
      box.textContent = table[i] !== null ? table[i] : '';
    } else {
      // Chaining
      box.textContent = ''; // Bucket itself is just head pointer conceptually
      const chain = document.createElement('div');
      chain.className = 'chain-container';
      chain.id = `chain-${i}`;
      
      if (Array.isArray(table[i])) {
        table[i].forEach((val, index) => {
          if (index > 0) {
            const arrow = document.createElement('span');
            arrow.className = 'chain-arrow';
            arrow.textContent = '→';
            chain.appendChild(arrow);
          }
          const node = document.createElement('div');
          node.className = 'chain-node';
          node.textContent = val;
          chain.appendChild(node);
        });
      }
      row.appendChild(chain);
    }
    hashView.appendChild(row);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function insertLinear(val) {
  let hash = val % SIZE;
  if (hash < 0) hash += SIZE;
  logMsg(`Inserting ${val}. h(${val}) = ${val} % ${SIZE} = ${hash}`);
  
  for (let i = 0; i < SIZE; i++) {
    let idx = (hash + i) % SIZE;
    const box = document.getElementById(`box-${idx}`);
    box.classList.add('active');
    await sleep(600);
    
    if (table[idx] === null) {
      logMsg(`Slot ${idx} is empty. Inserted ${val}.`);
      table[idx] = val;
      box.textContent = val;
      box.classList.remove('active');
      box.classList.add('found');
      await sleep(600);
      box.classList.remove('found');
      renderTable(); // Force complete sync of DOM with array state
      return;
    } else {
      logMsg(`Slot ${idx} is occupied by ${table[idx]}. Probing next...`);
      box.classList.remove('active');
    }
  }
  logMsg(`Table is full! Cannot insert ${val}.`);
}

async function insertChaining(val) {
  let hash = val % SIZE;
  if (hash < 0) hash += SIZE;
  logMsg(`Inserting ${val}. h(${val}) = ${val} % ${SIZE} = ${hash}`);
  
  const box = document.getElementById(`box-${hash}`);
  box.classList.add('active');
  await sleep(600);
  
  if (table[hash] === null) table[hash] = [];
  table[hash].push(val);
  logMsg(`Appended ${val} to chain at index ${hash}.`);
  
  renderTable(); // Re-render to show new chain node
  
  // Highlight last added node
  const chain = document.getElementById(`chain-${hash}`);
  const nodes = chain.querySelectorAll('.chain-node');
  if(nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1];
    lastNode.style.borderColor = 'var(--node-visited)';
    lastNode.style.boxShadow = '0 0 15px var(--node-visited)';
    await sleep(600);
    lastNode.style.borderColor = 'var(--accent)';
    lastNode.style.boxShadow = 'none';
  }
  
  box.classList.remove('active');
}

btnInsert.addEventListener('click', async () => {
  if (isAnimating) return;
  const val = parseInt(valInput.value);
  if (isNaN(val)) return;
  
  isAnimating = true;
  if (hashType === 'linear') {
    await insertLinear(val);
  } else {
    await insertChaining(val);
  }
  valInput.value = '';
  isAnimating = false;
});

btnReset.addEventListener('click', () => {
  if (isAnimating) return;
  table = Array(SIZE).fill(null);
  logContainer.innerHTML = '';
  logMsg('Table reset.');
  renderTable();
});

typeSelect.addEventListener('change', (e) => {
  if (isAnimating) {
    e.preventDefault();
    return;
  }
  hashType = e.target.value;
  descText.textContent = hashType === 'linear' ? 
    "Linear probing resolves collisions by checking the next slot iteratively." : 
    "Separate chaining resolves collisions by building a linked list at each bucket.";
  table = Array(SIZE).fill(null);
  logContainer.innerHTML = '';
  renderTable();
});

// Init
renderTable();
logMsg('System ready.');

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
