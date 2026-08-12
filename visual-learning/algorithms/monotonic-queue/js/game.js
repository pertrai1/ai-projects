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
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } 
  else if (type === 'eject') {
    // Punchy low pop for eject
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.12);
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }
  else if (type === 'laser') {
    // High expire laser zapp
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
  else if (type === 'coin') {
    // Sweet success sound
    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      gainNode.gain.setValueAtTime(0.1, now + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.15);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.2);
    });
  }
  else if (type === 'fail') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.35);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
  else if (type === 'victory') {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major chord
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gainNode.gain.setValueAtTime(0.08, now + idx * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.5);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  }
}

// Level Datasets
const LEVELS = [
  {
    name: "Level 1: Basic Ejection sequence",
    description: "Learn how incoming larger values eject smaller values from the back of the queue. Window size K = 3.",
    windowSize: 3,
    stream: [12, 35, 10, 8, 45, 20]
  },
  {
    name: "Level 2: Strict Window Sliding & Expiration",
    description: "Carefully manage both ejecting smaller values from the back and expiring out-of-bounds indices from the front. Window size K = 3.",
    windowSize: 3,
    stream: [50, 40, 30, 25, 35, 15, 60]
  }
];

// State
let currentLevelIdx = 0;
let level = LEVELS[0];
let leftPointer = 0;
let rightPointer = 0; // Represents active item entering
let deque = []; // Holds objects: { val, idx }
let declaredMaxes = []; // Array of answers submitted
let score = 0;

// DOM mapping
const track = document.getElementById("number-track");
const bracket = document.getElementById("sliding-bracket");
const dequeSlots = document.getElementById("deque-slots");
const terminalLog = document.getElementById("terminal-log");

const levelTitle = document.getElementById("level-title");
const levelDesc = document.getElementById("level-desc");
const scoreVal = document.getElementById("score-val");
const gameContainer = document.getElementById("main-game-container");

const btnPush = document.getElementById("btn-push");
const btnEject = document.getElementById("btn-eject");
const btnExpire = document.getElementById("btn-expire");
const btnDeclare = document.getElementById("btn-declare");
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
  leftPointer = 0;
  rightPointer = 0; // Initialize at index 0 (push first item)
  deque = [];
  declaredMaxes = [];

  levelTitle.textContent = level.name;
  levelDesc.textContent = level.description;

  btnNext.style.display = "none";
  logMessage(`🚀 Loaded Level ${idx + 1}: ${level.name}`, "warn");
  logMessage(`🎯 Step 1: Push the first item ${level.stream[0]} into the empty Deque!`, "info");

  buildStream();
  renderBoard();
}

function buildStream() {
  track.innerHTML = "";
  level.stream.forEach((val, idx) => {
    const block = document.createElement("div");
    block.className = "num-block";
    block.id = `block-${idx}`;
    block.innerHTML = `
      <div class="num-value">${val}</div>
      <div class="num-index">i=${idx}</div>
    `;
    track.appendChild(block);
  });
}

function renderBoard() {
  // 1. Render linear track highlights
  level.stream.forEach((_, idx) => {
    const block = document.getElementById(`block-${idx}`);
    if (block) {
      block.className = "num-block";
      // Highlight inside sliding window
      if (idx >= leftPointer && idx <= Math.max(leftPointer, rightPointer)) {
        block.classList.add("in-win");
      }
      // Highlight current window maximum
      if (declaredMaxes[leftPointer] !== undefined && idx === declaredMaxes[leftPointer].idx) {
        block.classList.add("win-max");
      }
    }
  });

  // 2. Adjust Bracket overlay
  const blockWidth = 60;
  const gap = 10;
  const trackOffset = 50;

  const bracketLeft = trackOffset + leftPointer * (blockWidth + gap);
  const winWidth = Math.max(1, Math.min(level.windowSize, rightPointer - leftPointer + 1)) * blockWidth + (Math.max(1, Math.min(level.windowSize, rightPointer - leftPointer + 1)) - 1) * gap;

  bracket.style.left = `${bracketLeft}px`;
  bracket.style.width = `${winWidth}px`;

  // Center scroll
  const viewportWidth = document.querySelector(".linear-track-container").clientWidth;
  const targetScrollX = (viewportWidth / 2) - (bracketLeft + winWidth / 2);
  track.style.transform = `translateX(${targetScrollX}px)`;

  // 3. Render Deque blocks
  dequeSlots.innerHTML = "";
  if (deque.length === 0) {
    dequeSlots.innerHTML = `<span style="color: var(--text-secondary); font-size:0.75rem; font-style:italic;">Deque is currently empty...</span>`;
  } else {
    deque.forEach((item, idx) => {
      const el = document.createElement("div");
      el.className = "deque-item";
      if (idx === 0) {
        el.style.borderColor = "var(--cyber-green)";
        el.style.color = "var(--cyber-green)";
        el.style.boxShadow = "0 0 8px rgba(57, 255, 20, 0.2)";
      }
      el.innerHTML = `
        <span>${item.val}</span>
        <span class="item-idx">i=${item.idx}</span>
      `;
      dequeSlots.appendChild(el);
    });
  }

  // 4. Score
  scoreVal.textContent = String(score).padStart(3, '0');

  updateButtons();
}

function updateButtons() {
  const currentVal = level.stream[rightPointer];

  // Eject button is active if deque has items and the back of deque is smaller than incoming val
  const backItem = deque[deque.length - 1];
  btnEject.disabled = !backItem || backItem.val >= currentVal;

  // Expire button is active if front of deque has fallen out of window boundary (idx < leftPointer)
  const frontItem = deque[0];
  btnExpire.disabled = !frontItem || frontItem.idx >= leftPointer;

  // Push is active if we haven't pushed the current incoming item, AND we have ejected everything smaller
  const isAlreadyPushed = deque.some(item => item.idx === rightPointer);
  const needsEjections = backItem && backItem.val < currentVal;
  btnPush.disabled = isAlreadyPushed || needsEjections || (rightPointer >= level.stream.length && isAlreadyPushed);

  // Declare max is active once:
  // - Window is fully initialized (rightPointer >= windowSize - 1 or we reached end of stream)
  // - No active expirations are required (front node is valid)
  // - Incoming node is already pushed
  const currentWindowIsLoaded = rightPointer >= leftPointer + level.windowSize - 1 || rightPointer >= level.stream.length - 1;
  const frontIsExpired = frontItem && frontItem.idx < leftPointer;
  btnDeclare.disabled = !currentWindowIsLoaded || frontIsExpired || !isAlreadyPushed || declaredMaxes[leftPointer] !== undefined;
}

// Action button handlers
btnPush.addEventListener('click', () => {
  const val = level.stream[rightPointer];
  deque.push({ val, idx: rightPointer });
  playSound('click');
  logMessage(`📥 Pushed block ${val} at i=${rightPointer} onto the back of the Deque.`);
  renderBoard();
});

btnEject.addEventListener('click', () => {
  const popped = deque.pop();
  playSound('eject');
  logMessage(`◀ EJECTED smaller block ${popped.val} from back of Deque (Index i=${popped.idx} can never be maximum).`, "warn");
  renderBoard();
});

btnExpire.addEventListener('click', () => {
  const popped = deque.shift();
  playSound('laser');
  logMessage(`❌ EXPIRED block ${popped.val} from front of Deque (Index i=${popped.idx} has slid out of window).`, "warn");
  renderBoard();
});

btnDeclare.addEventListener('click', () => {
  const front = deque[0];
  if (!front) return;

  // Validate if indeed front is the maximum
  const slice = level.stream.slice(leftPointer, leftPointer + level.windowSize);
  const actualMax = Math.max(...slice);

  if (front.val === actualMax) {
    playSound('coin');
    score += 20;
    declaredMaxes[leftPointer] = { val: front.val, idx: front.idx };
    logMessage(`🏆 CORRECT! Declared Window Maximum: ${front.val} (index i=${front.idx})`, "success");
    
    // Advance Window
    if (leftPointer + level.windowSize - 1 < level.stream.length - 1) {
      leftPointer++;
      // Increment rightPointer to prepare next incoming
      if (rightPointer < level.stream.length - 1) {
        rightPointer++;
      }
      logMessage(`🛷 Sliding Window forward. New incoming element is ${level.stream[rightPointer]} at index i=${rightPointer}.`);
    } else {
      // Completed Level!
      playSound('victory');
      score += 50;
      logMessage("🏆 LEVEL COMPLETED! Monotonic Deque maintained O(1) maximum queries across all sliding states!", "success");
      
      gameContainer.classList.add("flash-green");
      setTimeout(() => gameContainer.classList.remove("flash-green"), 400);

      if (currentLevelIdx < LEVELS.length - 1) {
        btnNext.style.display = "inline-block";
      } else {
        logMessage("🎉 CONGRATULATIONS! You have completed the Monotonic Queue training curriculum!", "success");
      }
    }
  } else {
    playSound('fail');
    score = Math.max(0, score - 10);
    logMessage(`🚨 ERROR: Declaration Failed! Element ${front.val} is not the absolute maximum of this window. Check your ejections!`, "error");
    gameContainer.classList.add("flash-red");
    setTimeout(() => gameContainer.classList.remove("flash-red"), 350);
  }

  renderBoard();
});

btnReset.addEventListener('click', () => {
  playSound('click');
  loadLevel(currentLevelIdx);
});

btnNext.addEventListener('click', () => {
  playSound('click');
  loadLevel(currentLevelIdx + 1);
});

// Boot level 1
setTimeout(() => {
  loadLevel(0);
}, 100);
