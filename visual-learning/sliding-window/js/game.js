// Web Audio Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  if (type === 'slide') {
    // Whistling frequency sweep for window slide
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } 
  else if (type === 'match') {
    // Happy double chime
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      gainNode.gain.setValueAtTime(0.12, now + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.2);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.25);
    });
  }
  else if (type === 'fail') {
    // Dual buzzer fail sound
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, now);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(143, now); // Detuned for grinding effect
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }
  else if (type === 'victory') {
    const chord = [349.23, 440.00, 523.25, 659.25]; // Fmaj7 arpeggio
    chord.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gainNode.gain.setValueAtTime(0.1, now + idx * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.5);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  }
}

// Levels Configuration
const LEVELS = [
  {
    name: "Level 1: Fixed Window Stream Parser",
    description: "Align the fixed-size window (size = 4) to capture the structured tool call command sequence: ['<tool_call>', 'web_search', '(\"hermes\")', '</tool_call>']. Click slide buttons to move the viewport.",
    type: "fixed",
    windowSize: 4,
    stream: ["User:", "hello", "agent", "run", "<tool_call>", "web_search", "(\"hermes\")", "</tool_call>", "done", "prompt", "end"],
    target: ["<tool_call>", "web_search", "(\"hermes\")", "</tool_call>"]
  },
  {
    name: "Level 2: Dynamic Window Context Maximize",
    description: "Find the longest sequence of instruction tokens without duplicates (LeetCode 3: Longest Substring Without Repeating Characters). Expand Right (R) and contract Left (L) pointers. Goal: Obtain a window size of 5 unique elements.",
    type: "dynamic",
    stream: ["read", "write", "plan", "read", "test", "push", "test", "deploy"],
    targetSize: 5
  },
  {
    name: "Level 3: RAG Document Overlap Chunking",
    description: "Segment the document into smaller pieces. Stamp a chunk of size 6, then slide the window forward by a stride of 3 (overlap = 3). Complete 3 chunk stamps to finish!",
    type: "chunking",
    windowSize: 6,
    stride: 3,
    stream: ["The", "Agent", "loads", "the", "files", "to", "generate", "a", "high", "quality", "plan", "for", "the", "system"],
    targetStamps: 3
  }
];

// State
let currentLevelIdx = 0;
let level = LEVELS[0];
let leftPointer = 0;
let rightPointer = 3; // L=0, R=3 (size 4)
let score = 0;
let stampedChunks = [];

// DOM Reference Mapping
const track = document.getElementById("token-track");
const windowBracket = document.getElementById("window-bracket");
const windowLabel = document.getElementById("bracket-label");
const terminalLog = document.getElementById("terminal-log");

const levelTitle = document.getElementById("level-title");
const levelDesc = document.getElementById("level-desc");
const scoreVal = document.getElementById("score-val");
const gameContainer = document.getElementById("main-game-container");

// Stats DOM overlays
const statLeft = document.getElementById("stat-left");
const statRight = document.getElementById("stat-right");
const statSize = document.getElementById("stat-size");

// Control buttons
const btnLMinus = document.getElementById("btn-l-minus");
const btnLPlus = document.getElementById("btn-l-plus");
const btnRMinus = document.getElementById("btn-r-minus");
const btnRPlus = document.getElementById("btn-r-plus");
const btnSubmit = document.getElementById("btn-submit");
const btnReset = document.getElementById("btn-reset");
const btnNext = document.getElementById("btn-next");

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
  stampedChunks = [];

  levelTitle.textContent = level.name;
  levelDesc.textContent = level.description;

  // Initialize pointers based on type
  if (level.type === "fixed") {
    leftPointer = 0;
    rightPointer = level.windowSize - 1;
  } else if (level.type === "dynamic") {
    leftPointer = 0;
    rightPointer = 0; // Start window at size 1
  } else if (level.type === "chunking") {
    leftPointer = 0;
    rightPointer = level.windowSize - 1;
  }

  btnNext.style.display = "none";
  logMessage(`🔄 Loaded Level ${idx + 1}: ${level.name}`, "warn");

  buildStream();
  renderWindow();
  updateButtons();
}

function buildStream() {
  track.innerHTML = "";
  level.stream.forEach((token, idx) => {
    const block = document.createElement("div");
    block.className = "token-block";
    block.id = `token-${idx}`;
    block.innerHTML = `
      <div class="token-text">${escapeHtml(token)}</div>
      <div class="token-index">i=${idx}</div>
    `;
    track.appendChild(block);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderWindow() {
  // Compute positions dynamically
  const blocks = level.stream.map((_, idx) => document.getElementById(`token-${idx}`));
  if (!blocks[0]) return;

  const blockWidth = 80;
  const gap = 10;
  const trackOffset = 50; // left position of token-stream container

  // Clear all in-window classes
  level.stream.forEach((_, idx) => {
    const block = blocks[idx];
    block.className = "token-block";
  });

  // Calculate window dimensions
  const winLeft = trackOffset + leftPointer * (blockWidth + gap);
  const winWidth = (rightPointer - leftPointer + 1) * blockWidth + (rightPointer - leftPointer) * gap;

  // Render bracket box overlay
  windowBracket.style.left = `${winLeft}px`;
  windowBracket.style.width = `${winWidth}px`;
  
  // Update stats
  statLeft.textContent = leftPointer;
  statRight.textContent = rightPointer;
  const currentSize = rightPointer - leftPointer + 1;
  statSize.textContent = currentSize;

  windowLabel.textContent = level.type === "chunking" 
    ? `Chunk #${stampedChunks.length + 1}` 
    : `Window [Size: ${currentSize}]`;

  // Highlight blocks inside the active window
  const activeTokens = [];
  for (let i = leftPointer; i <= rightPointer; i++) {
    const block = blocks[i];
    if (block) {
      block.classList.add("in-window");
      activeTokens.push(level.stream[i]);
    }
  }

  // Check for duplicates inside window (Level 2 specific)
  if (level.type === "dynamic") {
    const counts = {};
    activeTokens.forEach(tok => counts[tok] = (counts[tok] || 0) + 1);
    
    for (let i = leftPointer; i <= rightPointer; i++) {
      const token = level.stream[i];
      const block = blocks[i];
      if (counts[token] > 1) {
        block.classList.add("duplicate");
      } else {
        block.classList.add("unique-active");
      }
    }
  }

  // Adjust container track scroll to keep the window centered
  const viewportWidth = document.querySelector(".stream-track-container").clientWidth;
  const targetScrollX = (viewportWidth / 2) - (winLeft + winWidth / 2);
  track.style.transform = `translateX(${targetScrollX}px)`;
}

function updateButtons() {
  // L pointer boundaries
  btnLMinus.disabled = leftPointer <= 0 || level.type === "fixed";
  btnLPlus.disabled = leftPointer >= rightPointer || level.type === "fixed";

  // R pointer boundaries
  btnRMinus.disabled = rightPointer <= leftPointer || level.type === "fixed";
  btnRPlus.disabled = rightPointer >= level.stream.length - 1 || level.type === "fixed";

  if (level.type === "fixed" || level.type === "chunking") {
    // Show sliding track controls instead of fine pointer tuning
    btnLMinus.textContent = "Slide Left ◀";
    btnLMinus.disabled = leftPointer <= 0;
    
    btnLPlus.textContent = "Slide Right ▶";
    btnLPlus.disabled = rightPointer >= level.stream.length - 1;

    // Disable raw R controls
    btnRMinus.style.display = "none";
    btnRPlus.style.display = "none";
  } else {
    // Standard fine tuning controls for L & R
    btnLMinus.textContent = "L ◀";
    btnLPlus.textContent = "L ▶";
    btnRMinus.style.display = "inline-block";
    btnRPlus.style.display = "inline-block";
  }

  if (level.type === "chunking") {
    btnSubmit.textContent = "STAMP CHUNK 📥";
  } else {
    btnSubmit.textContent = "SUBMIT WINDOW ✅";
  }
}

// Slide Entire Fixed Window
function slideWindow(direction) {
  const currentSize = rightPointer - leftPointer + 1;
  if (direction === "left" && leftPointer > 0) {
    leftPointer--;
    rightPointer--;
  } else if (direction === "right" && rightPointer < level.stream.length - 1) {
    leftPointer++;
    rightPointer++;
  }
  playSound('slide');
  renderWindow();
  updateButtons();
  logMessage(`🛷 Slipped Window to index range [${leftPointer} ➔ ${rightPointer}]`);
}

// Button click handlers
btnLMinus.addEventListener('click', () => {
  if (level.type === "fixed" || level.type === "chunking") {
    slideWindow("left");
  } else {
    if (leftPointer > 0) {
      leftPointer--;
      playSound('slide');
      renderWindow();
      updateButtons();
      logMessage(`Pointer Left (L) moved back to index: ${leftPointer}`);
    }
  }
});

btnLPlus.addEventListener('click', () => {
  if (level.type === "fixed" || level.type === "chunking") {
    slideWindow("right");
  } else {
    if (leftPointer < rightPointer) {
      leftPointer++;
      playSound('slide');
      renderWindow();
      updateButtons();
      logMessage(`Pointer Left (L) advanced to index: ${leftPointer}`);
    }
  }
});

btnRMinus.addEventListener('click', () => {
  if (rightPointer > leftPointer) {
    rightPointer--;
    playSound('slide');
    renderWindow();
    updateButtons();
    logMessage(`Pointer Right (R) retracted to index: ${rightPointer}`);
  }
});

btnRPlus.addEventListener('click', () => {
  if (rightPointer < level.stream.length - 1) {
    rightPointer++;
    playSound('slide');
    renderWindow();
    updateButtons();
    logMessage(`Pointer Right (R) expanded to index: ${rightPointer}`);
  }
});

btnReset.addEventListener('click', () => {
  playSound('slide');
  loadLevel(currentLevelIdx);
});

btnNext.addEventListener('click', () => {
  playSound('slide');
  loadLevel(currentLevelIdx + 1);
});

// Submit / Match checker
btnSubmit.addEventListener('click', () => {
  const currentSize = rightPointer - leftPointer + 1;

  if (level.type === "fixed") {
    // Check if covered elements match the target array
    const slice = level.stream.slice(leftPointer, rightPointer + 1);
    const matched = slice.every((val, i) => val === level.target[i]);

    if (matched) {
      playSound('match');
      score += 50;
      logMessage(`🎉 SUCCESS! Bounded the exact tool call sequence! Bounded tokens: [${slice.join(", ")}]`, "success");
      
      gameContainer.classList.add("flash-green");
      setTimeout(() => gameContainer.classList.remove("flash-green"), 400);

      btnNext.style.display = "inline-block";
    } else {
      playSound('fail');
      score = Math.max(0, score - 10);
      logMessage(`❌ FAULT: Window does not align with the target sequence. Tokens currently in window: [${slice.join(", ")}]`, "error");
      
      gameContainer.classList.add("flash-red");
      setTimeout(() => gameContainer.classList.remove("flash-red"), 350);
    }
  } 
  else if (level.type === "dynamic") {
    // Check if there are duplicates in window
    const slice = level.stream.slice(leftPointer, rightPointer + 1);
    const set = new Set(slice);
    const isUnique = set.size === slice.length;

    if (isUnique && currentSize === level.targetSize) {
      playSound('match');
      score += 50;
      logMessage(`🎉 SUCCESS! Found the maximum unique token chunk! Window size: ${currentSize}, Content: [${slice.join(", ")}]`, "success");
      
      gameContainer.classList.add("flash-green");
      setTimeout(() => gameContainer.classList.remove("flash-green"), 400);

      btnNext.style.display = "inline-block";
    } else if (!isUnique) {
      playSound('fail');
      score = Math.max(0, score - 10);
      logMessage(`❌ FAULT: Duplicate elements detected inside your window! You must evict duplicates by shifting Left (L).`, "error");
      
      gameContainer.classList.add("flash-red");
      setTimeout(() => gameContainer.classList.remove("flash-red"), 350);
    } else {
      playSound('fail');
      score = Math.max(0, score - 5);
      logMessage(`❌ FAULT: Window is unique, but size is ${currentSize}. Expand Right (R) to maximize the unique chunk size (Target: ${level.targetSize})!`, "error");
      
      gameContainer.classList.add("flash-red");
      setTimeout(() => gameContainer.classList.remove("flash-red"), 350);
    }
  } 
  else if (level.type === "chunking") {
    // Check overlapping chunk logic
    const slice = level.stream.slice(leftPointer, rightPointer + 1);
    
    // Ensure correct window size
    if (currentSize !== level.windowSize) {
      playSound('fail');
      logMessage(`❌ FAULT: Chunk size must be exactly ${level.windowSize}!`, "error");
      return;
    }

    // Validate the sliding stride match
    const currentStampCount = stampedChunks.length;
    const expectedLeft = currentStampCount * level.stride;

    if (leftPointer === expectedLeft) {
      stampedChunks.push({
        left: leftPointer,
        right: rightPointer,
        data: [...slice]
      });

      playSound('match');
      logMessage(`📥 STAMPED Chunk #${stampedChunks.length}: [${slice.join(", ")}] at indices [${leftPointer} - ${rightPointer}]`, "success");

      if (stampedChunks.length === level.targetStamps) {
        playSound('victory');
        score += 80;
        logMessage(`🎉 CONGRATULATIONS! Document successfully chunked into overlapping blocks! Stride is exactly 3 (50% overlap). Your tokens are ready for vector embedding ingestion!`, "success");
        
        gameContainer.classList.add("flash-green");
        setTimeout(() => gameContainer.classList.remove("flash-green"), 400);
      } else {
        // Automatically shift forward by stride for convenience
        slideWindow("right");
        slideWindow("right");
        slideWindow("right");
      }
    } else {
      playSound('fail');
      logMessage(`❌ FAULT: Invalid Slide! Stride step must be exactly ${level.stride} positions. Slide your window to start at i=${expectedLeft}`, "error");
    }
  }

  scoreVal.textContent = String(score).padStart(3, '0');
  updateButtons();
}

);

// Initialize Boot
setTimeout(() => {
  loadLevel(0);
}, 100);
