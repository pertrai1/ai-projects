// Web Audio Sound Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  if (type === 'click') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } 
  else if (type === 'swap') {
    // Detuned swoosh for swap
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(250, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(255, now);
    osc2.frequency.exponentialRampToValueAtTime(610, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }
  else if (type === 'eject') {
    // Low mechanical click for ejection
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.1);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  else if (type === 'coin') {
    // Beautiful chime arpeggio
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      gainNode.gain.setValueAtTime(0.1, now + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.2);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.25);
    });
  }
  else if (type === 'fail') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(130, now);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
  else if (type === 'victory') {
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major 7 arpeggio
    chord.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gainNode.gain.setValueAtTime(0.1, now + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }
}

// Chunks Dataset
const CHUNKS_STREAM = [
  { id: "C1", name: "DB Query Logic", score: 0.82 },
  { id: "C2", name: "Auth Config", score: 0.45 },
  { id: "C3", name: "File Regex", score: 0.78 },
  { id: "C4", name: "Code Patch", score: 0.88 },
  { id: "C5", name: "Linter Shell", score: 0.35 },
  { id: "C6", name: "Git Workflow", score: 0.92 },
  { id: "C7", name: "Unit Testing", score: 0.65 },
  { id: "C8", name: "CI Pipeline", score: 0.98 }
];

// State
let streamIdx = 0;
let heap = []; // Max capacity K = 3. Contains objects: { id, name, score }
let score = 0;
let levelPhase = "initialize"; // "initialize" (fill to K=3) or "process" (RAG streaming)
let stepPending = false; // Waiting for sift-down to finish before moving to next

// DOM Reference Mapping
const track = document.getElementById("chunk-track");
const canvas = document.getElementById("vault-canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvas-vault");
const interactiveLayer = document.getElementById("interactive-layer");
const scoreVal = document.getElementById("score-val");
const terminalLog = document.getElementById("terminal-log");

const levelTitle = document.getElementById("level-title");
const levelDesc = document.getElementById("level-desc");

const btnPush = document.getElementById("btn-push");
const btnSwap = document.getElementById("btn-swap");
const btnIgnore = document.getElementById("btn-ignore");
const btnSift = document.getElementById("btn-sift");
const btnReset = document.getElementById("btn-reset");

// Node Positions for 3-node Heap
const NODE_POSITIONS = [
  { x: 0.5, y: 0.25 }, // Root (0)
  { x: 0.3, y: 0.7 },  // Left Child (1)
  { x: 0.7, y: 0.7 }   // Right Child (2)
];

function resizeCanvas() {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawHeap();
}
window.addEventListener('resize', resizeCanvas);

function logMessage(text, type = "info") {
  const line = document.createElement("div");
  line.className = "term-line";
  const now = new Date();
  const timestamp = `[${now.toTimeString().split(' ')[0]}]`;

  let color = "var(--cyber-green)";
  if (type === "error") color = "var(--cyber-red)";
  if (type === "warn") color = "var(--cyber-orange)";
  if (type === "success") color = "var(--cyber-blue)";

  line.innerHTML = `<span class="term-tag">${timestamp}</span><span style="color: ${color};">${text}</span>`;
  terminalLog.appendChild(line);
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

function initGame() {
  streamIdx = 0;
  heap = [];
  score = 0;
  levelPhase = "initialize";
  stepPending = false;

  levelTitle.textContent = "Level 1: RAG Vector Search Simulator";
  levelDesc.textContent = "Maintain a Min-Heap of size K=3 to capture the top-3 most similar document chunks. Push incoming items to fill the heap first!";

  logMessage("🚀 Top-K Retrieval Vault initialized. Heap Capacity: K=3.", "warn");
  logMessage(`🎯 Step 1: Push the first incoming chunk [${CHUNKS_STREAM[0].id}: ${CHUNKS_STREAM[0].score}] into the Heap!`, "info");

  buildStream();
  renderBoard();
}

function buildStream() {
  track.innerHTML = "";
  CHUNKS_STREAM.forEach((chunk, idx) => {
    const block = document.createElement("div");
    block.className = "chunk-block";
    block.id = `chunk-${idx}`;
    block.innerHTML = `
      <div class="chunk-score">${chunk.score.toFixed(2)}</div>
      <div class="chunk-title">${chunk.id}: ${chunk.name}</div>
    `;
    track.appendChild(block);
  });
}

function renderBoard() {
  // 1. Highlight stream blocks
  CHUNKS_STREAM.forEach((_, idx) => {
    const block = document.getElementById(`chunk-${idx}`);
    if (block) {
      block.className = "chunk-block";
      if (idx === streamIdx) {
        block.classList.add("active-focus");
      }
    }
  });

  // Adjust container track scroll
  const blockWidth = 90;
  const gap = 15;
  const trackOffset = 30;
  const scrollX = trackOffset - streamIdx * (blockWidth + gap);
  track.style.transform = `translateX(${scrollX}px)`;

  // 2. Score
  scoreVal.textContent = String(score).padStart(3, '0');

  // 3. Draw Heap
  drawHeap();
  updateButtons();
}

function drawHeap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  interactiveLayer.innerHTML = "";

  const padX = 25;
  const padY = 25;

  // Draw Edges (Lines between parent and child)
  if (heap.length > 1) {
    // Draw Root to Left
    const rx = NODE_POSITIONS[0].x * (canvas.width - padX * 2) + padX;
    const ry = NODE_POSITIONS[0].y * (canvas.height - padY * 2) + padY;
    const lx = NODE_POSITIONS[1].x * (canvas.width - padX * 2) + padX;
    const ly = NODE_POSITIONS[1].y * (canvas.height - padY * 2) + padY;

    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(lx, ly);
    ctx.strokeStyle = "var(--metal-light)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (heap.length > 2) {
    // Draw Root to Right
    const rx = NODE_POSITIONS[0].x * (canvas.width - padX * 2) + padX;
    const ry = NODE_POSITIONS[0].y * (canvas.height - padY * 2) + padY;
    const rx2 = NODE_POSITIONS[2].x * (canvas.width - padX * 2) + padX;
    const ry2 = NODE_POSITIONS[2].y * (canvas.height - padY * 2) + padY;

    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx2, ry2);
    ctx.strokeStyle = "var(--metal-light)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw Nodes
  heap.forEach((item, idx) => {
    const pos = NODE_POSITIONS[idx];
    const x = pos.x * (canvas.width - padX * 2) + padX;
    const y = pos.y * (canvas.height - padY * 2) + padY;

    // Check if node violates Min-Heap property (parent > child)
    let isViolated = false;
    if (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (heap[parentIdx].score > item.score) {
        isViolated = true;
      }
    }

    ctx.beginPath();
    ctx.arc(x, y, 28, 0, 2 * Math.PI);
    
    let fillColor = "var(--metal-dark)";
    let strokeColor = "var(--cyber-green)";
    let lineWidth = 2.5;

    if (isViolated) {
      fillColor = "rgba(255, 0, 85, 0.08)";
      strokeColor = "var(--cyber-red)";
      lineWidth = 3;
    } else if (idx === 0) {
      // Root is neon orange to indicate "The minimum score barrier of the Top-3"
      fillColor = "rgba(255, 157, 0, 0.05)";
      strokeColor = "var(--cyber-orange)";
    }

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw score text
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.score.toFixed(2), x, y - 6);

    // Draw chunk ID
    ctx.font = "10px monospace";
    ctx.fillStyle = varColor(strokeColor);
    ctx.fillText(item.id, x, y + 12);
  });
}

function varColor(stroke) {
  if (stroke === "var(--cyber-red)") return "var(--cyber-red)";
  if (stroke === "var(--cyber-orange)") return "var(--cyber-orange)";
  return "var(--cyber-blue)";
}

function updateButtons() {
  const currentChunk = CHUNKS_STREAM[streamIdx];
  const root = heap[0];

  // Disable all when complete
  if (streamIdx >= CHUNKS_STREAM.length) {
    btnPush.disabled = true;
    btnSwap.disabled = true;
    btnIgnore.disabled = true;
    btnSift.disabled = true;
    return;
  }

  // Push button: Active if heap is not full (size < 3) and this chunk hasn't been pushed
  const isHeapFull = heap.length >= 3;
  btnPush.disabled = isHeapFull || stepPending;

  // Swap button: Active if heap is full, incoming score > root score, and sift has not been initiated
  btnSwap.disabled = !isHeapFull || currentChunk.score <= (root ? root.score : 0) || stepPending;

  // Ignore button: Active if heap is full, incoming score <= root score, and sift not pending
  btnIgnore.disabled = !isHeapFull || currentChunk.score > (root ? root.score : 0) || stepPending;

  // Sift button: Active only if step is pending (we swapped and are violating min-heap property)
  const heapViolates = heap.length > 1 && (
    (heap[1] && heap[0].score > heap[1].score) || 
    (heap[2] && heap[0].score > heap[2].score)
  );
  btnSift.disabled = !stepPending || !heapViolates;
}

// Push to Heap
btnPush.addEventListener('click', () => {
  if (heap.length >= 3) return;

  const current = CHUNKS_STREAM[streamIdx];
  heap.push(current);
  playSound('click');
  logMessage(`📥 Pushed chunk [${current.id}: ${current.score}] to Heap (Size: ${heap.length}/3).`);

  // Simple sift-up logic for level initialization
  if (heap.length === 2 && heap[0].score > heap[1].score) {
    // Swap root with left child
    const temp = heap[0];
    heap[0] = heap[1];
    heap[1] = temp;
    playSound('swap');
    logMessage(`🔀 Auto-Sift Up: Swapped index 0 and 1 to preserve Min-Heap property.`);
  } else if (heap.length === 3) {
    // Check right child
    if (heap[0].score > heap[2].score) {
      const temp = heap[0];
      heap[0] = heap[2];
      heap[2] = temp;
      playSound('swap');
      logMessage(`🔀 Auto-Sift Up: Swapped index 0 and 2 to preserve Min-Heap property.`);
    }
    // Also check parent/child again just in case
    if (heap[0].score > heap[1].score) {
      const temp = heap[0];
      heap[0] = heap[1];
      heap[1] = temp;
      playSound('swap');
    }
  }

  advanceStream();
});

// Swap Root
btnSwap.addEventListener('click', () => {
  const current = CHUNKS_STREAM[streamIdx];
  const oldRoot = heap[0];
  
  // Eject old root and insert new
  heap[0] = current;
  stepPending = true;
  playSound('eject');
  logMessage(`🔀 SWAPPED root! Ejected old root [${oldRoot.id}: ${oldRoot.score}] and inserted [${current.id}: ${current.score}] at Root.`, "warn");
  logMessage(`⚠️ Min-Heap property violated! Parent (${current.score}) is larger than child values. You must click SIFT DOWN to restore balance!`, "error");

  renderBoard();
});

// Ignore Chunk
btnIgnore.addEventListener('click', () => {
  const current = CHUNKS_STREAM[streamIdx];
  const root = heap[0];
  playSound('click');
  logMessage(`⏭️ IGNORED chunk [${current.id}: ${current.score}]. It is less than or equal to the root threshold (${root.score}), so it can never be in the Top-3!`, "success");
  
  score += 10;
  advanceStream();
});

// Sift Down (Restores balance)
btnSift.addEventListener('click', () => {
  if (!stepPending) return;

  const left = heap[1];
  const right = heap[2];
  let smallerChildIdx = 1;

  if (right && right.score < left.score) {
    smallerChildIdx = 2;
  }

  // Swap root with the smaller child
  const temp = heap[0];
  heap[0] = heap[smallerChildIdx];
  heap[smallerChildIdx] = temp;

  playSound('swap');
  logMessage(`📥 Sift Down: Swapped root with smaller child index ${smallerChildIdx} ([${heap[0].id}] and [${heap[smallerChildIdx].id}]).`);

  stepPending = false;
  score += 20;
  advanceStream();
});

function advanceStream() {
  streamIdx++;
  if (streamIdx < CHUNKS_STREAM.length) {
    logMessage(`🎯 Active focus moved to [${CHUNKS_STREAM[streamIdx].id}: ${CHUNKS_STREAM[streamIdx].score}]. Make your play!`);
  } else {
    // End of game
    playSound('victory');
    score += 50;
    logMessage("🏆 RETRIEVAL CYCLE COMPLETE! The Min-Heap vault now holds the absolute Top-3 highest scoring vector chunks!", "success");
    
    // Output final results
    const results = [...heap].sort((a,b) => b.score - a.score);
    logMessage(`📂 Final Compiled Top-3 Context: [${results.map(c => `${c.id} (${c.score})`).join(", ")}]`, "success");

    gameContainer.classList.add("flash-green");
    setTimeout(() => gameContainer.classList.remove("flash-green"), 400);
  }
  renderBoard();
}

btnReset.addEventListener('click', () => {
  playSound('click');
  initGame();
});

// Start
setTimeout(() => {
  initGame();
  resizeCanvas();
}, 100);
