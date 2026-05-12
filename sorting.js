const arrayView = document.getElementById('array-view');
const logContainer = document.getElementById('log-container');
const codeBody = document.getElementById('code-body');
const statusMsg = document.getElementById('status-message');
const arrSizeInput = document.getElementById('arr-size');
const btnRandomize = document.getElementById('btn-randomize');
const btnReset = document.getElementById('btn-reset');

let arr = [];
let selectedAlgo = 'bubble';

// ─── GENERATE RANDOM ARRAY ───
function generateArray(size) {
  arr = [];
  for (let i = 0; i < size; i++) arr.push(Math.floor(Math.random() * 95) + 5);
}

// ─── RENDER ARRAY ───
function renderArray(data, states = {}) {
  arrayView.innerHTML = '';
  data.forEach((val, i) => {
    const wrap = document.createElement('div'); wrap.className = 'array-item-wrapper';
    const cell = document.createElement('div'); cell.className = 'array-item';
    if (states.sorted && states.sorted.includes(i)) cell.classList.add('sorted');
    else if (states.pivot === i) cell.classList.add('pivot');
    else if (states.merging && states.merging.includes(i)) cell.classList.add('merging');
    else if (states.swapping && states.swapping.includes(i)) cell.classList.add('swapping');
    else if (states.comparing && states.comparing.includes(i)) cell.classList.add('comparing');
    cell.textContent = val;
    const idx = document.createElement('div'); idx.className = 'item-index'; idx.textContent = `[${i}]`;
    wrap.appendChild(cell); wrap.appendChild(idx); arrayView.appendChild(wrap);
  });
}

// ─── CODE DEFINITIONS ───
const CODES = {
  bubble: [
    { code: 'void bubbleSort(int a[], int n) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' bubbleSort(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[], ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' n) {', c: '' }] },
    { code: '  for (int i=0; i<n-1; i++)', mix: [{ t: '  ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' i=0; i<n-1; i++)', c: '' }] },
    { code: '    for (int j=0; j<n-i-1; j++)', mix: [{ t: '    ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' j=0; j<n-i-1; j++)', c: '' }] },
    { code: '      if (a[j] > a[j+1])', mix: [{ t: '      ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (a[j] > a[j+1])', c: '' }] },
    { code: '        swap(a[j], a[j+1]);', plain: true },
    { code: '}', plain: true },
  ],
  selection: [
    { code: 'void selectionSort(int a[], int n) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' selectionSort(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[], ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' n) {', c: '' }] },
    { code: '  for (int i=0; i<n-1; i++) {', mix: [{ t: '  ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' i=0; i<n-1; i++) {', c: '' }] },
    { code: '    int minIdx = i;', mix: [{ t: '    ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' minIdx = i;', c: '' }] },
    { code: '    for (int j=i+1; j<n; j++)', mix: [{ t: '    ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' j=i+1; j<n; j++)', c: '' }] },
    { code: '      if (a[j] < a[minIdx]) minIdx=j;', mix: [{ t: '      ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (a[j] < a[minIdx]) minIdx=j;', c: '' }] },
    { code: '    swap(a[i], a[minIdx]);', plain: true },
    { code: '  }', plain: true },
    { code: '}', plain: true },
  ],
  insertion: [
    { code: 'void insertionSort(int a[], int n) {', mix: [{ t: 'void', c: 'syn-type' }, { t: ' insertionSort(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[], ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' n) {', c: '' }] },
    { code: '  for (int i=1; i<n; i++) {', mix: [{ t: '  ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' i=1; i<n; i++) {', c: '' }] },
    { code: '    int key = a[i], j = i-1;', mix: [{ t: '    ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' key = a[i], j = i-1;', c: '' }] },
    { code: '    while (j>=0 && a[j]>key) {', mix: [{ t: '    ', c: '' }, { t: 'while', c: 'syn-keyword' }, { t: ' (j>=0 && a[j]>key) {', c: '' }] },
    { code: '      a[j+1] = a[j]; j--;', plain: true },
    { code: '    }', plain: true },
    { code: '    a[j+1] = key;', plain: true },
    { code: '  }', plain: true },
    { code: '}', plain: true },
  ],
  merge: [
    { code: 'void merge(int a[],int l,int m,int r){', mix: [{ t: 'void', c: 'syn-type' }, { t: ' merge(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[],l,m,r){', c: '' }] },
    { code: '  // copy to L[] and R[]', cls: 'syn-comment' },
    { code: '  // merge L[] and R[] back', cls: 'syn-comment' },
    { code: '}', plain: true },
    { code: 'void mergeSort(int a[],int l,int r){', mix: [{ t: 'void', c: 'syn-type' }, { t: ' mergeSort(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[],l,r){', c: '' }] },
    { code: '  if (l < r) {', mix: [{ t: '  ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (l < r) {', c: '' }] },
    { code: '    int m = l+(r-l)/2;', mix: [{ t: '    ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' m = l+(r-l)/2;', c: '' }] },
    { code: '    mergeSort(a, l, m);', plain: true },
    { code: '    mergeSort(a, m+1, r);', plain: true },
    { code: '    merge(a, l, m, r);', plain: true },
    { code: '  }', plain: true },
    { code: '}', plain: true },
  ],
  quick: [
    { code: 'int partition(int a[],int lo,int hi){', mix: [{ t: 'int', c: 'syn-type' }, { t: ' partition(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[],lo,hi){', c: '' }] },
    { code: '  int pivot=a[hi], i=lo-1;', mix: [{ t: '  ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' pivot=a[hi], i=lo-1;', c: '' }] },
    { code: '  for (int j=lo; j<hi; j++)', mix: [{ t: '  ', c: '' }, { t: 'for', c: 'syn-keyword' }, { t: ' (', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' j=lo; j<hi; j++)', c: '' }] },
    { code: '    if (a[j] <= pivot)', mix: [{ t: '    ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (a[j] <= pivot)', c: '' }] },
    { code: '      swap(a[++i], a[j]);', plain: true },
    { code: '  swap(a[i+1], a[hi]);', plain: true },
    { code: '  return i+1;', mix: [{ t: '  ', c: '' }, { t: 'return', c: 'syn-keyword' }, { t: ' i+1;', c: '' }] },
    { code: '}', plain: true },
    { code: 'void quickSort(int a[],int lo,int hi){', mix: [{ t: 'void', c: 'syn-type' }, { t: ' quickSort(', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' a[],lo,hi){', c: '' }] },
    { code: '  if (lo < hi) {', mix: [{ t: '  ', c: '' }, { t: 'if', c: 'syn-keyword' }, { t: ' (lo < hi) {', c: '' }] },
    { code: '    int p = partition(a,lo,hi);', mix: [{ t: '    ', c: '' }, { t: 'int', c: 'syn-type' }, { t: ' p = partition(a,lo,hi);', c: '' }] },
    { code: '    quickSort(a, lo, p-1);', plain: true },
    { code: '    quickSort(a, p+1, hi);', plain: true },
    { code: '  }', plain: true },
    { code: '}', plain: true },
  ],
};

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

// ─── STEP BUILDERS ───
function buildBubbleSteps(a) {
  const d = [...a], steps = [], n = d.length, sorted = [];
  steps.push({ arr: [...d], states: {}, hl: [0], status: 'bubbleSort() — start' });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ arr: [...d], states: { comparing: [j, j + 1], sorted: [...sorted] }, hl: [2, 3], status: `Compare a[${j}]=${d[j]} & a[${j + 1}]=${d[j + 1]}` });
      if (d[j] > d[j + 1]) {
        [d[j], d[j + 1]] = [d[j + 1], d[j]];
        steps.push({ arr: [...d], states: { swapping: [j, j + 1], sorted: [...sorted] }, hl: [4], status: `Swap → a[${j}]=${d[j]}, a[${j + 1}]=${d[j + 1]}` });
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);
  steps.push({ arr: [...d], states: { sorted: [...Array(n).keys()] }, hl: [5], status: '✓ Bubble Sort complete — O(N²)' });
  return { steps, finalArr: [...d] };
}

function buildSelectionSteps(a) {
  const d = [...a], steps = [], n = d.length, sorted = [];
  steps.push({ arr: [...d], states: {}, hl: [0], status: 'selectionSort() — start' });
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({ arr: [...d], states: { comparing: [i], sorted: [...sorted] }, hl: [1, 2], status: `Pass ${i + 1}: minIdx = ${i}` });
    for (let j = i + 1; j < n; j++) {
      steps.push({ arr: [...d], states: { comparing: [minIdx, j], sorted: [...sorted] }, hl: [3, 4], status: `Compare a[${j}]=${d[j]} < a[${minIdx}]=${d[minIdx]}?` });
      if (d[j] < d[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [d[i], d[minIdx]] = [d[minIdx], d[i]];
      steps.push({ arr: [...d], states: { swapping: [i, minIdx], sorted: [...sorted] }, hl: [5], status: `Swap a[${i}] ↔ a[${minIdx}]` });
    }
    sorted.push(i);
  }
  sorted.push(n - 1);
  steps.push({ arr: [...d], states: { sorted: [...Array(n).keys()] }, hl: [7], status: '✓ Selection Sort complete — O(N²)' });
  return { steps, finalArr: [...d] };
}

function buildInsertionSteps(a) {
  const d = [...a], steps = [], n = d.length;
  steps.push({ arr: [...d], states: { sorted: [0] }, hl: [0], status: 'insertionSort() — start' });
  for (let i = 1; i < n; i++) {
    const key = d[i]; let j = i - 1;
    steps.push({ arr: [...d], states: { comparing: [i], sorted: [...Array(i).keys()] }, hl: [1, 2], status: `key = a[${i}] = ${key}` });
    while (j >= 0 && d[j] > key) {
      d[j + 1] = d[j];
      steps.push({ arr: [...d], states: { swapping: [j, j + 1], sorted: [...Array(i).keys()] }, hl: [3, 4], status: `Shift a[${j}]=${d[j]} → a[${j + 1}]` });
      j--;
    }
    d[j + 1] = key;
    steps.push({ arr: [...d], states: { comparing: [j + 1], sorted: [...Array(i + 1).keys()] }, hl: [6], status: `Place key=${key} at index ${j + 1}` });
  }
  steps.push({ arr: [...d], states: { sorted: [...Array(n).keys()] }, hl: [8], status: '✓ Insertion Sort complete — O(N²)' });
  return { steps, finalArr: [...d] };
}

function buildMergeSteps(a) {
  const d = [...a], steps = [], n = d.length;
  steps.push({ arr: [...d], states: {}, hl: [4, 5], status: 'mergeSort() — start' });
  function msort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    msort(lo, mid);
    msort(mid + 1, hi);
    // merge
    const L = d.slice(lo, mid + 1), R = d.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    const mergeIndices = [];
    for (let x = lo; x <= hi; x++) mergeIndices.push(x);
    steps.push({ arr: [...d], states: { merging: mergeIndices }, hl: [0, 1], status: `Merge [${lo}..${mid}] & [${mid + 1}..${hi}]` });
    while (i < L.length && j < R.length) {
      if (L[i] <= R[j]) { d[k] = L[i]; i++; } else { d[k] = R[j]; j++; }
      k++;
    }
    while (i < L.length) { d[k] = L[i]; i++; k++; }
    while (j < R.length) { d[k] = R[j]; j++; k++; }
    steps.push({ arr: [...d], states: { merging: mergeIndices }, hl: [2, 9], status: `Merged [${lo}..${hi}]` });
  }
  msort(0, n - 1);
  steps.push({ arr: [...d], states: { sorted: [...Array(n).keys()] }, hl: [11], status: '✓ Merge Sort complete — O(N log N)' });
  return { steps, finalArr: [...d] };
}

function buildQuickSteps(a) {
  const d = [...a], steps = [], n = d.length, sorted = new Set();
  steps.push({ arr: [...d], states: {}, hl: [8, 9], status: 'quickSort() — start' });
  function qsort(lo, hi) {
    if (lo >= hi) { if (lo >= 0 && lo < n) sorted.add(lo); return; }
    const pivotVal = d[hi];
    steps.push({ arr: [...d], states: { pivot: hi, sorted: [...sorted] }, hl: [0, 1], status: `Partition [${lo}..${hi}], pivot=${pivotVal}` });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({ arr: [...d], states: { comparing: [j], pivot: hi, sorted: [...sorted] }, hl: [2, 3], status: `a[${j}]=${d[j]} <= ${pivotVal}?` });
      if (d[j] <= pivotVal) {
        i++;
        [d[i], d[j]] = [d[j], d[i]];
        if (i !== j) steps.push({ arr: [...d], states: { swapping: [i, j], pivot: hi, sorted: [...sorted] }, hl: [4], status: `Swap a[${i}] ↔ a[${j}]` });
      }
    }
    [d[i + 1], d[hi]] = [d[hi], d[i + 1]];
    const pi = i + 1;
    sorted.add(pi);
    steps.push({ arr: [...d], states: { swapping: [pi, hi], sorted: [...sorted] }, hl: [5, 6], status: `Pivot placed at index ${pi}` });
    qsort(lo, pi - 1);
    qsort(pi + 1, hi);
  }
  qsort(0, n - 1);
  steps.push({ arr: [...d], states: { sorted: [...Array(n).keys()] }, hl: [14], status: '✓ Quick Sort complete — O(N log N) avg' });
  return { steps, finalArr: [...d] };
}

const BUILDERS = { bubble: buildBubbleSteps, selection: buildSelectionSteps, insertion: buildInsertionSteps, merge: buildMergeSteps, quick: buildQuickSteps };

// ─── ALGORITHM SELECTOR ───
function selectAlgo(algo) {
  selectedAlgo = algo;
  document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-algo="${algo}"]`).classList.add('active');
  buildCodePanel(CODES[algo]);
  highlightCodeLines(null);
  statusMsg.textContent = `${algo.charAt(0).toUpperCase() + algo.slice(1)} Sort selected — press ▶ Play.`;
}
document.querySelectorAll('.algo-btn').forEach(b => b.addEventListener('click', () => selectAlgo(b.dataset.algo)));

// ─── PLAYBACK ───
function runSelectedOp() {
  const { steps, finalArr } = BUILDERS[selectedAlgo](arr);
  arr = finalArr;
  return steps;
}

const engine = new PlaybackEngine({
  onStep: (step) => { renderArray(step.arr, step.states); highlightCodeLines(step.hl); statusMsg.textContent = step.status; log(step.status); },
  onFinish: () => { statusMsg.textContent = '✓ Sorting complete.'; },
  onReset: () => { generateArray(parseInt(arrSizeInput.value) || 16); logContainer.innerHTML = ''; renderArray(arr); selectAlgo(selectedAlgo); },
  onRun: () => runSelectedOp()
});
injectPlaybackControls('.controls-wrapper');
wirePlaybackControls(engine);

btnRandomize.addEventListener('click', () => { engine.reset(); });
btnReset.addEventListener('click', () => { engine.reset(); });

// ─── INIT ───
generateArray(16);
selectAlgo('bubble');
renderArray(arr);
log('Random array generated. Select algorithm and press Play.');
