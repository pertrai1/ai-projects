// Web Audio Sound Synthesizer (No external asset files needed!)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  // Resume context if suspended (browser security)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  if (type === 'whistle') {
    // Dual oscillator referee whistle with warble beating
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1000, now);
    // Add whistle frequency modulation (warble)
    osc1.frequency.linearRampToValueAtTime(1020, now + 0.05);
    osc1.frequency.linearRampToValueAtTime(980, now + 0.1);
    osc1.frequency.linearRampToValueAtTime(1010, now + 0.15);
    osc1.frequency.linearRampToValueAtTime(990, now + 0.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1040, now);
    osc2.frequency.linearRampToValueAtTime(1060, now + 0.05);
    osc2.frequency.linearRampToValueAtTime(1020, now + 0.1);
    osc2.frequency.linearRampToValueAtTime(1050, now + 0.15);
    osc2.frequency.linearRampToValueAtTime(1030, now + 0.2);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } 
  else if (type === 'success') {
    // Happy rising major chord arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.3);
    });
  } 
  else if (type === 'equip') {
    // Satisfying metallic pop
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }
  else if (type === 'fanfare') {
    // Completed Level Fanfare!
    const chord = [329.63, 392.00, 523.25, 659.25]; // E4, G4, C5, E5
    chord.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      
      // Slight vibrato
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 6;
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.8);
      osc.stop(now + 0.8);
    });
  }
}

// Game Datasets
const SPORTS_DATASET = {
  title: "Locker Room Gear-Up",
  avatarLabel: "Rookie Athlete",
  avatarSprite: "🧍",
  avatarCheer: "🏆🏃‍♂️💨",
  coachName: "Coach 'Topo' Sam",
  coachEmoji: "🏈",
  coachIntro: "Alright rookie! Welcome to the big leagues. Before we hit the gridiron, you gotta get dressed. But listen closely: you cannot put your cleats on until you've got your socks AND pants on first! Get the order right or get a penalty flag!",
  items: {
    socks: { id: "socks", name: "Comfort Socks", icon: "🧦", deps: [], description: "Protects feet. The absolute baseline layer." },
    pants: { id: "pants", name: "Padded Pants", icon: "👖", deps: [], description: "Protects thighs. Sits comfortably underneath outer pads." },
    pads: { id: "pads", name: "Shoulder Pads", icon: "🛡️", deps: [], description: "Protective heavy armor. Must sit underneath the team jersey." },
    jersey: { id: "jersey", name: "Team Jersey", icon: "👕", deps: ["pads"], description: "Draped beautifully over your shoulder pads." },
    cleats: { id: "cleats", name: "Spiked Cleats", icon: "👟", deps: ["socks", "pants"], description: "Laced up over socks, tucked cleanly into pants pants." },
    helmet: { id: "helmet", name: "Gridiron Helmet", icon: "🪖", deps: ["jersey"], description: "Strapped on last to protect the quarterback's cranium." }
  },
  positions: {
    socks: { x: 0.15, y: 0.75 },
    pants: { x: 0.5, y: 0.75 },
    pads: { x: 0.85, y: 0.75 },
    jersey: { x: 0.85, y: 0.35 },
    cleats: { x: 0.32, y: 0.35 },
    helmet: { x: 0.6, y: 0.15 }
  }
};

const AGENT_DATASET = {
  title: "AI Agent Scheduler",
  avatarLabel: "Agent Hermes",
  avatarSprite: "🤖",
  avatarCheer: "🧠⚡✅",
  coachName: "Professor Neural",
  coachEmoji: "🦾",
  coachIntro: "Greetings, developer! I am Professor Neural. Our AI Agent is planning to write and deploy some code. But an agent has rules: it can't write code until it has a plan, and it can't test code that doesn't exist. Let's arrange its tool dependencies!",
  items: {
    search: { id: "search", name: "Search Codebase", icon: "🔍", deps: [], description: "Locates files. Runs first to find relevant modules." },
    read: { id: "read", name: "Read File Content", icon: "📖", deps: ["search"], description: "Inspects source files. Requires locating them first." },
    plan: { id: "plan", name: "Generate Spec Plan", icon: "📝", deps: ["read"], description: "Synthesizes approach based on read file content." },
    write: { id: "write", name: "Write Code Patch", icon: "💾", deps: ["plan"], description: "Writes physical code changes onto disk based on the plan." },
    test: { id: "test", name: "Run Test Suite", icon: "🧪", deps: ["write"], description: "Validates code execution. Requires working code on-disk." },
    push: { id: "push", name: "Git Push PR", icon: "🚀", deps: ["test"], description: "Deploys code changes to github. Only safe once tests pass!" }
  },
  positions: {
    search: { x: 0.15, y: 0.5 },
    read: { x: 0.45, y: 0.8 },
    plan: { x: 0.45, y: 0.2 },
    write: { x: 0.75, y: 0.2 },
    test: { x: 0.75, y: 0.8 },
    push: { x: 0.9, y: 0.5 }
  }
};

// State
let currentDataset = SPORTS_DATASET;
let equipped = [];
let score = 0;
let draggedId = null;

// DOM Elements
const canvas = document.getElementById("dag-canvas");
const ctx = canvas.getContext("2d");
const canvasContainer = document.getElementById("canvas-container");
const overlayContainer = document.getElementById("node-overlay-container");
const shelfContainer = document.getElementById("shelf-container");
const dropTarget = document.getElementById("drop-target");
const avatarSprite = document.getElementById("avatar-sprite");
const avatarLabel = document.getElementById("avatar-label");
const scoreVal = document.getElementById("score-val");
const terminalLog = document.getElementById("terminal-log");

// Coach / Guide elements
const coachName = document.getElementById("coach-title");
const coachEmoji = document.getElementById("coach-emoji");
const coachSpeech = document.getElementById("coach-speech");
const modeSportsBtn = document.getElementById("mode-sports-btn");
const modeAgentBtn = document.getElementById("mode-agent-btn");
const resetBtn = document.getElementById("reset-btn");
const runSolverBtn = document.getElementById("topo-run-btn");
const gameContainer = document.getElementById("game-container");

// Initialize Game Canvas
function resizeCanvas() {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawGraph();
}
window.addEventListener('resize', resizeCanvas);

// Logger Utility
function logMessage(text, type = "info") {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const now = new Date();
  const timeStr = `[${now.toTimeString().split(' ')[0]}]`;
  
  let color = "#33ff33";
  if (type === "error") color = "var(--red)";
  if (type === "success") color = "var(--green)";
  if (type === "warn") color = "var(--orange)";

  entry.innerHTML = `<span class="log-timestamp">${timeStr}</span><span style="color: ${color};">${text}</span>`;
  terminalLog.appendChild(entry);
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

// Set Active Dataset
function setDataset(dataset) {
  currentDataset = dataset;
  equipped = [];
  score = 0;
  updateScore();
  
  // Update UI texts
  avatarSprite.textContent = dataset.avatarSprite;
  avatarSprite.className = "avatar-base";
  avatarLabel.textContent = dataset.avatarLabel;
  coachName.textContent = dataset.coachName;
  coachEmoji.textContent = dataset.coachEmoji;
  coachSpeech.textContent = dataset.coachIntro;

  // Enable/Disable auto-run
  runSolverBtn.disabled = false;

  logMessage(`🔄 Loaded Dataset: ${dataset.title}`, "warn");

  // Redraw everything
  rebuildShelf();
  resizeCanvas();
}

// Check if dependencies are met
function isAvailable(itemId) {
  if (equipped.includes(itemId)) return false;
  const item = currentDataset.items[itemId];
  return item.deps.every(dep => equipped.includes(dep));
}

// Add equipped visual feedback to avatar
function updateAvatarVisuals() {
  if (equipped.length === Object.keys(currentDataset.items).length) {
    // Complete! Celebrate!
    avatarSprite.textContent = currentDataset.avatarCheer;
    avatarSprite.className = "avatar-base cheer";
    playSound('fanfare');
    logMessage("🏆 CONGRATULATIONS! You solved the Topological Sort! You sorted all dependencies perfectly!", "success");
    coachSpeech.innerHTML = `<strong>Magnificent!</strong> You resolved every dependency cleanly. That's a perfect <strong>Topological Sort</strong> traversal! See how we ended up with a perfect order? Let's check the auto run solver to see it run in reverse post-order!`;
  } else {
    avatarSprite.textContent = currentDataset.avatarSprite;
    avatarSprite.className = "avatar-base";
  }
}

// Score management
function updateScore() {
  scoreVal.textContent = String(score).padStart(3, '0');
}

// Try to equip an item
function tryEquip(itemId) {
  if (equipped.includes(itemId)) {
    logMessage(`⚠️ Already equipped ${currentDataset.items[itemId].name}!`, "warn");
    return;
  }

  const item = currentDataset.items[itemId];
  const unmet = item.deps.filter(dep => !equipped.includes(dep));

  if (unmet.length === 0) {
    // Success
    equipped.push(itemId);
    score += 20;
    updateScore();
    playSound('equip');
    
    // Visual container flashes green
    gameContainer.classList.add("flash-green");
    setTimeout(() => gameContainer.classList.remove("flash-green"), 400);

    logMessage(`✅ Successfully equipped ${item.icon} ${item.name}!`, "success");
    coachSpeech.textContent = `Great choice! "${item.name}" has no remaining dependencies. We've locked it into our topological pipeline.`;

    rebuildShelf();
    drawGraph();
    updateAvatarVisuals();
  } else {
    // Penalty / Foul
    score = Math.max(0, score - 5);
    updateScore();
    playSound('whistle');
    
    // Visual container flashes red
    gameContainer.classList.add("flash-red");
    setTimeout(() => gameContainer.classList.remove("flash-red"), 300);

    const unmetNames = unmet.map(id => currentDataset.items[id].name).join(", ");
    logMessage(`🚨 FOUL! Cannot equip ${item.icon} ${item.name} yet! Needs: [${unmetNames}]`, "error");
    
    coachSpeech.innerHTML = `🏈 <span style="color: var(--red); font-weight: bold;">PENALTY FLAG!</span> You can't use <strong>${item.name}</strong> yet! It has dependency requirements: <span style="color: var(--orange);">${unmetNames}</span> must go first!`;
    
    rebuildShelf();
  }
}

// Build the inventory shelf cards
function rebuildShelf() {
  shelfContainer.innerHTML = "";
  
  Object.keys(currentDataset.items).forEach(id => {
    const item = currentDataset.items[id];
    const isEquipped = equipped.includes(id);
    const isAvail = isAvailable(id);

    const card = document.createElement("div");
    card.className = `gear-card ${isEquipped ? 'equipped' : ''} ${isAvail ? 'available' : ''} ${(!isEquipped && !isAvail) ? 'locked' : ''}`;
    card.draggable = !isEquipped;

    // Custom badges based on state
    let badgeHTML = "";
    if (isEquipped) {
      badgeHTML = `<span class="status-badge status-equipped">Equipped</span>`;
    } else if (isAvail) {
      badgeHTML = `<span class="status-badge status-available">Ready</span>`;
    } else {
      badgeHTML = `<span class="status-badge status-locked">Locked</span>`;
    }

    const depsText = item.deps.length > 0 
      ? `Needs: ${item.deps.map(d => currentDataset.items[d].icon).join(" ")}` 
      : "Sits on ground (No deps)";

    card.innerHTML = `
      <div class="gear-icon">${item.icon}</div>
      <div class="gear-info">
        <div class="gear-name">${item.name}</div>
        <div class="gear-deps">${depsText}</div>
      </div>
      ${badgeHTML}
    `;

    // Click handler (for accessibility & quick click play)
    card.addEventListener('click', () => {
      if (!isEquipped) tryEquip(id);
    });

    // HTML5 Drag Handlers
    card.addEventListener('dragstart', (e) => {
      if (isEquipped) {
        e.preventDefault();
        return;
      }
      draggedId = id;
      card.style.opacity = '0.4';
      e.dataTransfer.setData('text/plain', id);
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      draggedId = null;
    });

    shelfContainer.appendChild(card);
  });
}

// Drag and Drop Over Target
dropTarget.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropTarget.classList.add('dragover');
});

dropTarget.addEventListener('dragleave', () => {
  dropTarget.classList.remove('dragover');
});

dropTarget.addEventListener('drop', (e) => {
  e.preventDefault();
  dropTarget.classList.remove('dragover');
  const itemId = e.dataTransfer.getData('text/plain') || draggedId;
  if (itemId) {
    tryEquip(itemId);
  }
});

// Drawing the DAG on HTML5 Canvas
function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  overlayContainer.innerHTML = "";

  const items = currentDataset.items;
  const positions = currentDataset.positions;
  const padX = 25;
  const padY = 25;

  // 1. Draw Edges (Arrows)
  Object.keys(items).forEach(childId => {
    const item = items[childId];
    const childPos = positions[childId];
    
    const cx = childPos.x * (canvas.width - padX * 2) + padX;
    const cy = childPos.y * (canvas.height - padY * 2) + padY;

    item.deps.forEach(parentId => {
      const parentPos = positions[parentId];
      const px = parentPos.x * (canvas.width - padX * 2) + padX;
      const py = parentPos.y * (canvas.height - padY * 2) + padY;

      // Compute arrow math
      const dx = cx - px;
      const dy = cy - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Shrink line ends slightly so they don't enter circle bounds (circles are ~24px radius)
      const radiusOffset = 26;
      const startX = px + (dx / dist) * radiusOffset;
      const startY = py + (dy / dist) * radiusOffset;
      const endX = cx - (dx / dist) * radiusOffset;
      const endY = cy - (dy / dist) * radiusOffset;

      // Check if path is highlighted (e.g. parent is equipped and child is next)
      const isHighlighted = equipped.includes(parentId);
      const isFullySolved = equipped.includes(parentId) && equipped.includes(childId);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      
      if (isFullySolved) {
        ctx.strokeStyle = "var(--green)";
        ctx.lineWidth = 3;
      } else if (isHighlighted) {
        ctx.strokeStyle = "var(--orange)";
        ctx.lineWidth = 2.5;
        // Draw flowing dashes
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = "#444455";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Draw Arrow Head
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI/6), endY - 10 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI/6), endY - 10 * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fillStyle = isFullySolved ? "var(--green)" : (isHighlighted ? "var(--orange)" : "#444455");
      ctx.fill();
    });
  });

  // 2. Draw Nodes (Elements)
  Object.keys(items).forEach(id => {
    const item = items[id];
    const pos = positions[id];
    
    const x = pos.x * (canvas.width - padX * 2) + padX;
    const y = pos.y * (canvas.height - padY * 2) + padY;

    const isEquipped = equipped.includes(id);
    const isAvail = isAvailable(id);

    // Draw Node Background Circle
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI);
    
    let fillColor = "#1c1c24";
    let strokeColor = "#444455";
    let lineWidth = 2;

    if (isEquipped) {
      fillColor = "rgba(76, 175, 80, 0.2)";
      strokeColor = "var(--green)";
      lineWidth = 3.5;
    } else if (isAvail) {
      fillColor = "rgba(255, 152, 0, 0.1)";
      strokeColor = "var(--orange)";
      lineWidth = 2.5;
    }

    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw Node Icon
    ctx.font = "20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(item.icon, x, y);

    // Render HTML tooltip-badges above elements dynamically on hover
    const nodeDiv = document.createElement("div");
    nodeDiv.style.position = "absolute";
    nodeDiv.style.left = `${x - 22}px`;
    nodeDiv.style.top = `${y - 22}px`;
    nodeDiv.style.width = "44px";
    nodeDiv.style.height = "44px";
    nodeDiv.style.borderRadius = "50%";
    nodeDiv.style.cursor = "pointer";
    nodeDiv.style.pointerEvents = "auto";
    nodeDiv.title = `${item.name}: ${item.description}`;
    
    // Clicking node is same as clicking card
    nodeDiv.addEventListener('click', () => {
      if (!isEquipped) tryEquip(id);
    });

    overlayContainer.appendChild(nodeDiv);
  });
}

// Auto-Run Topological Solver (Demonstrates DFS Cycle-free traversal)
async function runAutoSolver() {
  equipped = [];
  rebuildShelf();
  drawGraph();
  runSolverBtn.disabled = true;

  logMessage("🤖 Auto Solver initiated. Running DFS Post-Order Traversal...", "warn");
  coachSpeech.innerHTML = `Let me show you how a computer solves this! I'm going to run a <strong>Depth-First Search (DFS)</strong>. It will traverse deep down each dependency path, and then write down the items in reverse post-order!`;

  const visited = new Set();
  const stack = [];

  // DFS helper
  async function dfs(id) {
    visited.add(id);
    logMessage(`🔍 DFS: Visiting node [${currentDataset.items[id].name}]`, "info");
    
    const nodePos = currentDataset.positions[id];
    // Visual effect: highlight active DFS node on canvas
    const padX = 25, padY = 25;
    const x = nodePos.x * (canvas.width - padX * 2) + padX;
    const y = nodePos.y * (canvas.height - padY * 2) + padY;
    
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, 2 * Math.PI);
    ctx.strokeStyle = "var(--blue)";
    ctx.lineWidth = 4;
    ctx.stroke();

    await new Promise(resolve => setTimeout(resolve, 800));

    // Visit neighbors/dependencies
    for (const dep of currentDataset.items[id].deps) {
      if (!visited.has(dep)) {
        await dfs(dep);
      }
    }

    // Push to stack upon return (Post-Order)
    stack.push(id);
    logMessage(`📦 Post-Order: Finished dependency branches of [${currentDataset.items[id].name}]. Pushing to execution stack!`, "success");
    playSound('equip');
  }

  // Run DFS on all nodes to get topological sort
  for (const id of Object.keys(currentDataset.items)) {
    if (!visited.has(id)) {
      await dfs(id);
    }
  }

  // Now stack contains the reverse order
  logMessage(`📊 DFS Traversal Complete! Reverse order stack assembled: [${stack.join(", ")}]`, "warn");
  coachSpeech.innerHTML = `Boom! DFS is complete. By stepping through recursively and stacking them upon return, we computed a correct sequence: <strong>${stack.map(id => currentDataset.items[id].name).join(" ➡️ ")}</strong>`;

  // Physically equip them in sorted order one by one
  for (const itemId of stack) {
    equipped.push(itemId);
    score += 20;
    updateScore();
    playSound('equip');
    rebuildShelf();
    drawGraph();
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  updateAvatarVisuals();
  runSolverBtn.disabled = false;
}

// Toggle Mode Button Click Handlers
modeSportsBtn.addEventListener('click', () => {
  modeSportsBtn.classList.add('active');
  modeAgentBtn.classList.remove('active');
  setDataset(SPORTS_DATASET);
});

modeAgentBtn.addEventListener('click', () => {
  modeAgentBtn.classList.add('active');
  modeSportsBtn.classList.remove('active');
  setDataset(AGENT_DATASET);
});

resetBtn.addEventListener('click', () => {
  equipped = [];
  score = 0;
  updateScore();
  playSound('equip');
  rebuildShelf();
  drawGraph();
  updateAvatarVisuals();
  logMessage("⟲ Board reset! Let's build the topological sort pipeline again.", "info");
});

runSolverBtn.addEventListener('click', () => {
  runAutoSolver();
});

// Start!
setTimeout(() => {
  setDataset(SPORTS_DATASET);
}, 100);
