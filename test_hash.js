const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div id="hash-view"></div>
  <div id="log-container"></div>
</body>
</html>
`);
const document = dom.window.document;

const SIZE = 7;
let table = Array(SIZE).fill(null);
let hashType = 'linear'; 
const hashView = document.getElementById('hash-view');
const logContainer = document.getElementById('log-container');

function logMsg(msg) {
  const p = document.createElement('div');
  p.textContent = \`> \${msg}\`;
  logContainer.appendChild(p);
}

function renderTable() {
  hashView.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const row = document.createElement('div');
    row.id = \`row-\${i}\`;

    const box = document.createElement('div');
    box.className = 'bucket-box';
    box.id = \`box-\${i}\`;
    row.appendChild(box);

    if (hashType === 'linear') {
      box.textContent = table[i] !== null ? table[i] : '';
    }
    hashView.appendChild(row);
  }
}

async function insertLinear(val) {
  let hash = val % SIZE;
  logMsg(\`Inserting \${val}. h(\${val}) = \${hash}\`);
  
  for (let i = 0; i < SIZE; i++) {
    let idx = (hash + i) % SIZE;
    const box = document.getElementById(\`box-\${idx}\`);
    
    if (table[idx] === null) {
      logMsg(\`Slot \${idx} is empty. Inserted \${val}.\`);
      table[idx] = val;
      box.textContent = val;
      return;
    } else {
      logMsg(\`Slot \${idx} is occupied by \${table[idx]}. Probing next...\`);
    }
  }
}

async function test() {
  renderTable();
  await insertLinear(5);
  console.log("After insert 5:", document.getElementById('box-5').textContent);
  await insertLinear(12);
  console.log("After insert 12:", document.getElementById('box-5').textContent, document.getElementById('box-6').textContent);
  console.log("Table state:", table);
}

test();
