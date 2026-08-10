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
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } 
  else if (type === 'push') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }
  else if (type === 'pulse') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.15);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
  else if (type === 'unlock') {
    const notes = [440, 554, 659]; // A major
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);
      gainNode.gain.setValueAtTime(0.1, now + index * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.05 + 0.15);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.2);
    });
  }
  else if (type === 'fail') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.35);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
  else if (type === 'victory') {
    const chords = [
      [261.63, 329.63, 392.00], // C
      [349.23, 440.00, 523.25], // F
      [392.00, 493.88, 587.33], // G
      [523.25, 659.25, 783.99]  // C
    ];
    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + step * 0.15);
        gainNode.gain.setValueAtTime(0.08, now + step * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + step * 0.15 + 0.4);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(now + step * 0.15);
        osc.stop(now + step * 0.15 + 0.4);
      });
    });
  }
}

// Level Datasets (DAG Nodes and Edges)
const LEVELS = [
  {
    name: "Level 1: Simple Chain Sequence",
    description: "Initialize Kahn's by finding the starting vertex with an in-degree of 0, queuing it, and processing neighbors.",
    nodes: {
      A: { id: "A", name: "Data Source", icon: "💾", x: 0.15, y: 0.5, deps: [] },
      B: { id: "B", name: "Transformation", icon: "⚙️", x: 0.5, y: 0.5, deps: ["A"] },
      C: { id: "C", name: "Client Delivery", icon: "📱", x: 0.85, y: 0.5, deps: ["B"] }
    }
  },
  {
    name: "Level 2: Dual Branch Convergence",
    description: "Two distinct paths converge on a single merge node. Manage your queue carefully to resolve both branches.",
    nodes: {
      A: { id: "A", name: "Query DB", icon: "🔍", x: 0.15, y: 0.3, deps: [] },
      B: { id: "B", name: "API Fetch", icon: "📡", x: 0.15, y: 0.7, deps: [] },
      C: { id: "C", name: "Join Data", icon: "🔗", x: 0.5, y: 0.5, deps: ["A", "B"] },
      D: { id: "D", name: "Export JSON", icon: "📄", x: 0.85, y: 0.5, deps: ["C"] }
    }
  },
  {
    name: "Level 3: The Cyclic Trap!",
    description: "Alert! There is a circular dependency embedded in this graph! Process what you can, and declare a loop when no 0 in-degree nodes remain.",
    nodes: {
      A: { id: "A", name: "Main Script", icon: "🖥️", x: 0.15, y: 0.5, deps: [] },
      B: { id: "B", name: "Loader Module", icon: "📥", x: 0.45, y: 0.3, deps: ["A", "D"] }, // Cyclic dependency link
      C: { id: "C", name: "Parser Core", icon: "🧱", x: 0.45, y: 0.7, deps: ["B"] },
      D: { id: "D", name: "Serializer API", icon: "🔐", x: 0.75, y: 0.5, deps: ["C"] }
    }
  }
];

// App State Variables
let currentLevelIdx = 0;
let nodes = {};
let edges = []; // Derived
let inDegrees = {}; // Active in-degree tracker
let queue = [];
let processed = [];
let score = 0;
let activePulses = [];

// DOM Reference Mapping
const canvas = document.getElementById("viewport-canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvas-viewport");
const interactiveLayer = document.getElementById("interactive-layer");
const queueSlots = document.getElementById("queue-slots");
const terminalLog = document.getElementById("terminal-log");

const levelTitle = document.getElementById("level-title");
const levelDesc = document.getElementById("level-desc");
const processBtn = document.getElementById("process-btn");
const cycleBtn = document.getElementById("cycle-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-btn");
const scoreVal = document.getElementById("score-val");
const gameContainer = document.getElementById("main-game-container");

// Resize Listener
function resizeCanvas() {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawGraph();
}
window.addEventListener('resize', resizeCanvas);

// Log Utility
function logMessage(text, type = "info") {
  const line = document.createElement("div");
  line.className = "term-line";
  const now = new Date();
  const timestamp = `[${now.toTimeString().split(' ')[0]}]`;

  let color = "var(--cyber-green)";
  if (type === "error") color = "var(--cyber-red)";
  if (type === "warn") color = "var(--cyber-orange)";
  if (type === "success") color = "#00ffcc";

  line.innerHTML = `<span class="term-tag">${timestamp}</span><span style="color: ${color};">${text}</span>`;
  terminalLog.appendChild(line);
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

// Setup Level State
function loadLevel(idx) {
  currentLevelIdx = idx;
  const level = LEVELS[idx];

  levelTitle.textContent = level.name;
  levelDesc.textContent = level.description;

  // Clone nodes and extract edges
  nodes = JSON.parse(JSON.stringify(level.nodes));
  queue = [];
  processed = [];
  activePulses = [];

  // Compute Initial In-Degrees
  inDegrees = {};
  Object.keys(nodes).forEach(id => {
    inDegrees[id] = nodes[id].deps.length;
  });

  logMessage(`🚀 Loaded Level ${idx + 1}: ${level.name}`, "warn");
  logMessage("📋 Initial in-degrees calculated. Find nodes with In-Degree = 0 to insert into Queue!", "info");

  cycleBtn.disabled = true;
  processBtn.disabled = true;
  nextBtn.style.display = "none";

  updateHUD();
  resizeCanvas();
}

// Update HUD & Queue Layout
function updateHUD() {
  scoreVal.textContent = String(score).padStart(3, '0');
  queueSlots.innerHTML = "";

  if (queue.length === 0) {
    queueSlots.innerHTML = `<span style="color: var(--text-secondary); font-size:0.75rem; font-style:italic;">Queue is currently empty...</span>`;
    processBtn.disabled = true;
  } else {
    processBtn.disabled = false;
    queue.forEach((nodeId, idx) => {
      const item = document.createElement("div");
      item.className = "queue-item";
      if (idx === 0) {
        item.style.borderColor = "var(--cyber-green)";
        item.style.color = "var(--cyber-green)";
        item.style.boxShadow = "0 0 10px rgba(57, 255, 20, 0.2)";
        item.innerHTML = `<span style="font-size:0.6rem; background: var(--cyber-green); color:#000; padding:2px 4px; border-radius:2px; margin-right:4px;">NEXT</span> ${nodes[nodeId].icon} ${nodeId}`;
      } else {
        item.innerHTML = `${nodes[nodeId].icon} ${nodeId}`;
      }
      queueSlots.appendChild(item);
    });
  }

  // Check if Cycle Button should be enabled
  // A cycle alert is valid if:
  // - Queue is empty
  // - There are still un-processed nodes on the board
  // - None of the un-processed nodes have an in-degree of 0
  const unProcessed = Object.keys(nodes).filter(id => !processed.includes(id));
  if (queue.length === 0 && unProcessed.length > 0) {
    const zeroExists = unProcessed.some(id => inDegrees[id] === 0);
    if (!zeroExists) {
      cycleBtn.disabled = false;
    }
  } else {
    cycleBtn.disabled = true;
  }
}

// Check Level Completion
function checkLevelCompletion() {
  const totalNodes = Object.keys(nodes).length;
  if (processed.length === totalNodes) {
    playSound('victory');
    logMessage("🏆 LEVEL CLEAR! Topological sort execution path completed successfully!", "success");
    score += 50;
    updateHUD();

    gameContainer.classList.add("flash-green");
    setTimeout(() => gameContainer.classList.remove("flash-green"), 400);

    // Show Next Button
    if (currentLevelIdx < LEVELS.length - 1) {
      nextBtn.style.display = "inline-block";
    } else {
      logMessage("🎉 AMAZING JOB! You have mastered Kahn's Algorithm across all simulation models!", "success");
    }
  }
}

// Push to Queue Event
function pushToQueue(nodeId) {
  if (processed.includes(nodeId)) return;
  if (queue.includes(nodeId)) return;

  if (inDegrees[nodeId] === 0) {
    queue.push(nodeId);
    playSound('push');
    logMessage(`📥 Enqueued Node [${nodes[nodeId].name}] (In-degree is 0)`, "success");
    updateHUD();
    drawGraph();
  } else {
    // Penalty / Error
    playSound('fail');
    score = Math.max(0, score - 5);
    gameContainer.classList.add("flash-red");
    setTimeout(() => gameContainer.classList.remove("flash-red"), 350);
    logMessage(`🚨 ERROR: Cannot enqueue [${nodes[nodeId].name}]! In-degree is ${inDegrees[nodeId]}, dependencies must be cleared first!`, "error");
    updateHUD();
  }
}

// Process Front Node of Queue
function processFrontNode() {
  if (queue.length === 0) return;

  const targetId = queue.shift();
  processed.push(targetId);
  playSound('click');
  logMessage(`⚙️ Processing Front Node [${nodes[targetId].name}] (Removing out-edges...)`, "warn");
  updateHUD();

  // Find all edges starting from targetId
  const targets = [];
  Object.keys(nodes).forEach(childId => {
    if (nodes[childId].deps.includes(targetId)) {
      targets.push(childId);
    }
  });

  if (targets.length > 0) {
    // Trigger electrical pulse animation to targets
    targets.forEach(childId => {
      activePulses.push({
        from: targetId,
        to: childId,
        progress: 0
      });
    });
    animatePulses();
  } else {
    // No neighbors, check directly
    checkLevelCompletion();
    drawGraph();
  }
}

// Pulse Animation Logic loop
let animationId = null;
function animatePulses() {
  if (activePulses.length === 0) {
    cancelAnimationFrame(animationId);
    animationId = null;
    return;
  }

  // Update pulses
  let finishedCount = 0;
  activePulses.forEach(pulse => {
    pulse.progress += 0.05; // speed
    if (pulse.progress >= 1) {
      pulse.progress = 1;
      finishedCount++;
    }
  });

  drawGraph();

  if (finishedCount === activePulses.length) {
    // Finish processing pulses, execute in-degree deductions
    const finished = [...activePulses];
    activePulses = [];
    
    finished.forEach(pulse => {
      inDegrees[pulse.to] = Math.max(0, inDegrees[pulse.to] - 1);
      logMessage(`⚡ Pulse landed on [${nodes[pulse.to].name}]. In-degree decremented to: ${inDegrees[pulse.to]}`, "info");
      
      if (inDegrees[pulse.to] === 0) {
        playSound('unlock');
        logMessage(`🔓 Node [${nodes[pulse.to].name}]'s in-degree hit 0! Click it to enqueue!`, "success");
      }
    });

    updateHUD();
    checkLevelCompletion();
    drawGraph();
  } else {
    animationId = requestAnimationFrame(animatePulses);
  }
}

// Canvas Painting Renderer
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  interactiveLayer.innerHTML = "";

  const padX = 35;
  const padY = 35;

  // 1. Draw Edges
  Object.keys(nodes).forEach(childId => {
    const childNode = nodes[childId];
    const cx = childNode.x * (canvas.width - padX * 2) + padX;
    const cy = childNode.y * (canvas.height - padY * 2) + padY;

    childNode.deps.forEach(parentId => {
      const parentNode = nodes[parentId];
      const px = parentNode.x * (canvas.width - padX * 2) + padX;
      const py = parentNode.y * (canvas.height - padY * 2) + padY;

      // Distance and angles
      const dx = cx - px;
      const dy = cy - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      const offset = 26;
      const startX = px + (dx / dist) * offset;
      const startY = py + (dy / dist) * offset;
      const endX = cx - (dx / dist) * offset;
      const endY = cy - (dy / dist) * offset;

      // Draw base edge
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      
      // Styling based on state
      const isParentProcessed = processed.includes(parentId);
      const isChildProcessed = processed.includes(childId);

      if (isParentProcessed && isChildProcessed) {
        ctx.strokeStyle = "var(--cyber-green)";
        ctx.lineWidth = 3;
      } else if (isParentProcessed) {
        ctx.strokeStyle = "var(--cyber-blue)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = "var(--metal-light)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Arrow Head
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 8 * Math.cos(angle - Math.PI/6), endY - 8 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(endX - 8 * Math.cos(angle + Math.PI/6), endY - 8 * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fillStyle = isParentProcessed ? "var(--cyber-blue)" : "var(--metal-light)";
      ctx.fill();
    });
  });

  // 2. Draw Active Pulse Animations
  activePulses.forEach(pulse => {
    const parentNode = nodes[pulse.from];
    const childNode = nodes[pulse.to];

    const px = parentNode.x * (canvas.width - padX * 2) + padX;
    const py = parentNode.y * (canvas.height - padY * 2) + padY;
    const cx = childNode.x * (canvas.width - padX * 2) + padX;
    const cy = childNode.y * (canvas.height - padY * 2) + padY;

    const pulseX = px + (cx - px) * pulse.progress;
    const pulseY = py + (cy - py) * pulse.progress;

    ctx.beginPath();
    ctx.arc(pulseX, pulseY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--cyber-green)";
    ctx.shadowColor = "var(--cyber-green)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  });

  // 3. Draw Nodes
  Object.keys(nodes).forEach(id => {
    const node = nodes[id];
    const x = node.x * (canvas.width - padX * 2) + padX;
    const y = node.y * (canvas.height - padY * 2) + padY;

    const activeInDegree = inDegrees[id];
    const isProcessed = processed.includes(id);
    const isQueued = queue.includes(id);

    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI);

    let fillColor = "var(--metal-dark)";
    let strokeColor = "var(--metal-light)";
    let lineWidth = 2;

    if (isProcessed) {
      fillColor = "rgba(57, 255, 20, 0.08)";
      strokeColor = "var(--cyber-green)";
      lineWidth = 3;
    } else if (isQueued) {
      fillColor = "rgba(255, 157, 0, 0.08)";
      strokeColor = "var(--cyber-orange)";
      lineWidth = 2.5;
    } else if (activeInDegree === 0) {
      // Glow blue as available to click!
      fillColor = "rgba(0, 229, 255, 0.05)";
      strokeColor = "var(--cyber-blue)";
      lineWidth = 2.5;
      ctx.shadowColor = "var(--cyber-blue)";
      ctx.shadowBlur = 5;
    }

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset

    // Draw Icon
    ctx.font = "20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.icon, x, y);

    // Draw In-Degree counter badge above un-processed nodes
    if (!isProcessed) {
      ctx.beginPath();
      ctx.arc(x + 15, y - 15, 9, 0, 2 * Math.PI);
      ctx.fillStyle = activeInDegree === 0 ? "var(--cyber-green)" : "#000";
      ctx.fill();
      ctx.strokeStyle = activeInDegree === 0 ? "var(--cyber-green)" : "var(--metal-light)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "bold 10px monospace";
      ctx.fillStyle = activeInDegree === 0 ? "#000" : "var(--text-primary)";
      ctx.fillText(activeInDegree, x + 15, y - 15);
    }

    // Build interactive pointer zone
    const trigger = document.createElement("div");
    trigger.style.position = "absolute";
    trigger.style.left = `${x - 22}px`;
    trigger.style.top = `${y - 22}px`;
    trigger.style.width = "44px";
    trigger.style.height = "44px";
    trigger.style.borderRadius = "50%";
    trigger.style.pointerEvents = "auto";
    trigger.style.cursor = isProcessed || isQueued ? "default" : "pointer";
    trigger.title = `${node.name} (In-degree: ${activeInDegree})`;

    trigger.addEventListener('click', () => {
      pushToQueue(id);
    });

    interactiveLayer.appendChild(trigger);
  });
}

// Declare Cycle Event (For Level 3 cycle trap level)
cycleBtn.addEventListener('click', () => {
  if (currentLevelIdx === 2) {
    // Success - correctly declared loop!
    playSound('victory');
    logMessage("🏆 VICTORY! Cycle correctly detected! A cycle was found in: B ➔ C ➔ D ➔ B. Kahn's Algorithm has halted.", "success");
    score += 100;
    processed = Object.keys(nodes); // Complete level
    updateHUD();
    drawGraph();

    gameContainer.classList.add("flash-green");
    setTimeout(() => gameContainer.classList.remove("flash-green"), 400);

    // Cycle has cleared the game!
    nextBtn.style.display = "none";
    logMessage("🎉 CONGRATULATIONS! You completed all Kahn's Algorithm training levels!", "success");
  } else {
    // Foul
    playSound('fail');
    score = Math.max(0, score - 15);
    logMessage("🚨 ERROR: False Cycle Declaration! A valid 0 in-degree execution path still exists on the board!", "error");
    gameContainer.classList.add("flash-red");
    setTimeout(() => gameContainer.classList.remove("flash-red"), 350);
    updateHUD();
  }
});

// Controls hooks
processBtn.addEventListener('click', () => {
  processFrontNode();
});

resetBtn.addEventListener('click', () => {
  playSound('click');
  loadLevel(currentLevelIdx);
});

nextBtn.addEventListener('click', () => {
  playSound('click');
  loadLevel(currentLevelIdx + 1);
});

// Boot level 1
setTimeout(() => {
  loadLevel(0);
}, 100);
