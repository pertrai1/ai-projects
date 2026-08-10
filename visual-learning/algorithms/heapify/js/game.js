// Web Audio Sound Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  if (type === 'select') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } 
  else if (type === 'swap') {
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(250, now);
    osc1.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(255, now);
    osc2.frequency.exponentialRampToValueAtTime(505, now + 0.15);
    
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
  else if (type === 'fail') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
  else if (type === 'success') {
    const notes = [440, 554, 659, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gainNode.gain.setValueAtTime(0.1, now + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }
}

// 7-Node Complete Tree Dataset Levels
const LEVELS = [
  {
    name: "Level 1: Sift-Up Insertion",
    description: "A small value (10) was inserted at the very end of the heap (bottom-right leaf). Bubble/Sift it up recursively until parent <= child!",
    array: [12, 18, 25, 40, 50, 60, 10]
  },
  {
    name: "Level 2: Sift-Down Heapify",
    description: "The root node has an extremely high value (85) that violates the min-heap property. Sift it down recursively, swapping it with its smallest child, until order is restored!",
    array: [85, 15, 20, 30, 45, 55, 60]
  }
];

// Structural positions for a 7-node complete binary tree
const NODE_POSITIONS = [
  { x: 0.5, y: 0.18 }, // Root (0)
  
  { x: 0.28, y: 0.45 }, // Left (1)
  { x: 0.72, y: 0.45 }, // Right (2)
  
  { x: 0.14, y: 0.75 }, // Left-Left (3)
  { x: 0.42, y: 0.75 }, // Left-Right (4)
  { x: 0.58, y: 0.75 }, // Right-Left (5)
  { x: 0.86, y: 0.75 }  // Right-Right (6)
];

// Adjacency edges (0-indexed indices of linked nodes)
const LINKS = [
  [0, 1], [0, 2],
  [1, 3], [1, 4],
  [2, 5], [2, 6]
];

// State
let currentLevelIdx = 0;
let level = LEVELS[0];
let heapArray = [];
let selectedNodeIdx = null;
let score = 0;

// DOM reference mapping
const canvas = document.getElementById("tree-canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvas-viewport");
const interactiveLayer = document.getElementById("interactive-layer");
const scoreVal = document.getElementById("score-val");
const terminalLog = document.getElementById("terminal-log");

const levelTitle = document.getElementById("level-title");
const levelDesc = document.getElementById("level-desc");

const btnReset = document.getElementById("btn-reset");
const btnNext = document.getElementById("btn-next");

function resizeCanvas() {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawTree();
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

function loadLevel(idx) {
  currentLevelIdx = idx;
  level = LEVELS[idx];
  heapArray = [...level.array];
  selectedNodeIdx = null;

  levelTitle.textContent = level.name;
  levelDesc.textContent = level.description;

  btnNext.style.display = "none";
  logMessage(`🚀 Loaded Level ${idx + 1}: ${level.name}`, "warn");
  logMessage("💡 Click a node to select it, then click an adjacent node connected by a line to swap their values!", "info");

  resizeCanvas();
}

function checkMinHeapProperty() {
  // A min-heap is valid if for every node i, parent score <= child score
  for (let i = 1; i < heapArray.length; i++) {
    const parentIdx = Math.floor((i - 1) / 2);
    if (heapArray[parentIdx] > heapArray[i]) {
      return false; // Violation found
    }
  }
  return true; // Complete valid min-heap!
}

function selectNode(idx) {
  if (selectedNodeIdx === null) {
    // Select first node
    selectedNodeIdx = idx;
    playSound('select');
    logMessage(`🎯 Selected node index i=${idx} (Value: ${heapArray[idx]}).`);
  } else {
    // We already have a selected node. Check if adjacent
    const isLinked = LINKS.some(link => 
      (link[0] === selectedNodeIdx && link[1] === idx) || 
      (link[0] === idx && link[1] === selectedNodeIdx)
    );

    if (isLinked) {
      // Execute Swap
      const temp = heapArray[selectedNodeIdx];
      heapArray[selectedNodeIdx] = heapArray[idx];
      heapArray[idx] = temp;

      playSound('swap');
      logMessage(`🔄 SWAPPED values! Index ${selectedNodeIdx} and ${idx} swapped: [${heapArray[idx]}] ➔ [${heapArray[selectedNodeIdx]}].`);

      // Check if this swap resolved any violation or if it was a mistake
      const parentIdx = Math.min(selectedNodeIdx, idx);
      const childIdx = Math.max(selectedNodeIdx, idx);
      
      selectedNodeIdx = null; // Clear selection

      if (checkMinHeapProperty()) {
        playSound('success');
        score += 50;
        logMessage("🏆 CONGRATULATIONS! You successfully heapified the tree! The Min-Heap property has been completely restored!", "success");
        if (currentLevelIdx < LEVELS.length - 1) {
          btnNext.style.display = "inline-block";
        } else {
          logMessage("🎉 AMAZING JOB! You have mastered both Heapify Sift-Up and Sift-Down operations!", "success");
        }
      } else {
        // Still has violations
        updateScoreDisplay();
      }
    } else {
      // Not connected. Simply switch selection
      selectedNodeIdx = idx;
      playSound('select');
      logMessage(`🎯 Switched selection to node index i=${idx} (Value: ${heapArray[idx]}).`);
    }
  }
  drawTree();
}

function updateScoreDisplay() {
  scoreVal.textContent = String(score).padStart(3, '0');
}

function drawTree() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  interactiveLayer.innerHTML = "";

  const padX = 25;
  const padY = 25;

  // 1. Draw Links (Edges)
  LINKS.forEach(link => {
    const parentIdx = link[0];
    const childIdx = link[1];

    const parentPos = NODE_POSITIONS[parentIdx];
    const childPos = NODE_POSITIONS[childIdx];

    const px = parentPos.x * (canvas.width - padX * 2) + padX;
    const py = parentPos.y * (canvas.height - padY * 2) + padY;
    const cx = childPos.x * (canvas.width - padX * 2) + padX;
    const cy = childPos.y * (canvas.height - padY * 2) + padY;

    // Check if the link violates Min-Heap property (parent > child)
    const isViolated = heapArray[parentIdx] > heapArray[childIdx];

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(cx, cy);
    
    if (isViolated) {
      ctx.strokeStyle = "var(--cyber-red)";
      ctx.lineWidth = 3.5;
    } else {
      ctx.strokeStyle = "var(--metal-light)";
      ctx.lineWidth = 2;
    }
    ctx.stroke();
  });

  // 2. Draw Nodes
  heapArray.forEach((val, idx) => {
    const pos = NODE_POSITIONS[idx];
    const x = pos.x * (canvas.width - padX * 2) + padX;
    const y = pos.y * (canvas.height - padY * 2) + padY;

    const isSelected = selectedNodeIdx === idx;

    // Check if node has violations with children
    let childViolation = false;
    const leftChild = idx * 2 + 1;
    const rightChild = idx * 2 + 2;

    if (leftChild < heapArray.length && val > heapArray[leftChild]) childViolation = true;
    if (rightChild < heapArray.length && val > heapArray[rightChild]) childViolation = true;

    ctx.beginPath();
    ctx.arc(x, y, 24, 0, 2 * Math.PI);

    let fillColor = "var(--metal-dark)";
    let strokeColor = "var(--cyber-blue)";
    let lineWidth = 2;

    if (isSelected) {
      fillColor = "rgba(0, 229, 255, 0.1)";
      strokeColor = "var(--cyber-blue)";
      lineWidth = 3.5;
      ctx.shadowColor = "var(--cyber-blue)";
      ctx.shadowBlur = 10;
    } else if (childViolation) {
      fillColor = "rgba(255, 0, 85, 0.08)";
      strokeColor = "var(--cyber-red)";
      lineWidth = 3;
    } else {
      fillColor = "rgba(57, 255, 20, 0.03)";
      strokeColor = "var(--cyber-green)";
    }

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset

    // Draw values
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(val, x, y - 5);

    // Draw index badge
    ctx.font = "9px monospace";
    ctx.fillStyle = isSelected ? "var(--cyber-blue)" : "var(--text-secondary)";
    ctx.fillText(`idx:${idx}`, x, y + 10);

    // Build interactive hover triggers
    const trigger = document.createElement("div");
    trigger.style.position = "absolute";
    trigger.style.left = `${x - 24}px`;
    trigger.style.top = `${y - 24}px`;
    trigger.style.width = "48px";
    trigger.style.height = "48px";
    trigger.style.borderRadius = "50%";
    trigger.style.pointerEvents = "auto";
    trigger.style.cursor = "pointer";
    trigger.title = `Index: ${idx}, Value: ${val}`;

    trigger.addEventListener('click', () => {
      selectNode(idx);
    });

    interactiveLayer.appendChild(trigger);
  });

  updateScoreDisplay();
}

btnReset.addEventListener('click', () => {
  playSound('select');
  loadLevel(currentLevelIdx);
});

btnNext.addEventListener('click', () => {
  playSound('select');
  loadLevel(currentLevelIdx + 1);
});

// Boot level 1
setTimeout(() => {
  loadLevel(0);
}, 100);
