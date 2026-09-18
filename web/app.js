import { createFaultyTerminal } from './faultyTerminal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize React Bits FaultyTerminal WebGL Shader Component
  const terminalContainer = document.getElementById('terminal-canvas-container');
  let terminalShader = null;

  if (terminalContainer) {
    terminalShader = createFaultyTerminal(terminalContainer, {
      scale: 1.4,
      gridMul: [2, 1],
      digitSize: 1.2,
      timeScale: 0.8,
      pause: false,
      scanlineIntensity: 0.6,
      glitchAmount: 0.4,
      flickerAmount: 0.6,
      noiseAmp: 0.8,
      chromaticAberration: 0.8,
      dither: 0.1,
      curvature: 0.04,
      tint: '#00ffcc',
      mouseReact: true,
      mouseStrength: 0.35,
      pageLoadAnimation: true,
      brightness: 0.75
    });
  }

  // 2. Interactive Network Chaos State
  const state = {
    profile: 'subway',
    latency: 800,
    dropRate: 10,
    jitter: 120,
    port: '8080',
    packetSeq: 1024,
    totalPackets: 0,
    droppedPackets: 0
  };

  const profiles = {
    subway: { latency: 800, drop: 10, jitter: 120 },
    elevator: { latency: 2500, drop: 20, jitter: 350 },
    mountain: { latency: 4000, drop: 5, jitter: 150 },
    '3g': { latency: 400, drop: 2, jitter: 80 },
    chaos: { latency: 1500, drop: 35, jitter: 450 }
  };

  // DOM Elements
  const profileButtons = document.querySelectorAll('.prof-pill');
  const latencySlider = document.getElementById('latency-slider');
  const dropSlider = document.getElementById('drop-slider');
  const jitterSlider = document.getElementById('jitter-slider');
  const portSelect = document.getElementById('port-select');

  const latencyVal = document.getElementById('latency-val');
  const dropVal = document.getElementById('drop-val');
  const jitterVal = document.getElementById('jitter-val');

  const statRtt = document.getElementById('stat-rtt');
  const statDropped = document.getElementById('stat-dropped');
  const statQueue = document.getElementById('stat-queue');
  const logContainer = document.getElementById('packet-terminal-log');

  function updateControls() {
    if (latencySlider) latencySlider.value = state.latency;
    if (dropSlider) dropSlider.value = state.dropRate;
    if (jitterSlider) jitterSlider.value = state.jitter;

    if (latencyVal) latencyVal.textContent = `${state.latency} ms`;
    if (dropVal) dropVal.textContent = `${state.dropRate} %`;
    if (jitterVal) jitterVal.textContent = `±${state.jitter} ms`;
  }

  // Profile Pill Click Handlers
  profileButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      profileButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const pKey = btn.getAttribute('data-preset');
      state.profile = pKey;
      if (profiles[pKey]) {
        state.latency = profiles[pKey].latency;
        state.dropRate = profiles[pKey].drop;
        state.jitter = profiles[pKey].jitter;
        updateControls();
      }
    });
  });

  // Slider Change Listeners
  if (latencySlider) {
    latencySlider.addEventListener('input', (e) => {
      state.latency = parseInt(e.target.value, 10);
      if (latencyVal) latencyVal.textContent = `${state.latency} ms`;
    });
  }

  if (dropSlider) {
    dropSlider.addEventListener('input', (e) => {
      state.dropRate = parseInt(e.target.value, 10);
      if (dropVal) dropVal.textContent = `${state.dropRate} %`;
    });
  }

  if (jitterSlider) {
    jitterSlider.addEventListener('input', (e) => {
      state.jitter = parseInt(e.target.value, 10);
      if (jitterVal) jitterVal.textContent = `±${state.jitter} ms`;
    });
  }

  if (portSelect) {
    portSelect.addEventListener('change', (e) => {
      state.port = e.target.value;
    });
  }

  // 3. Live Simulated Packet Stream Loop
  const packetMethods = ['GET /api/v1/sync', 'POST /events/stream', 'GET /ws/socket', 'PUT /state/heartbeat', 'GET /healthz', 'POST /orders/checkout'];
  const maxLogs = 12;

  function generatePacket() {
    state.packetSeq += 1;
    state.totalPackets += 1;

    const isDrop = Math.random() * 100 < state.dropRate;
    if (isDrop) state.droppedPackets += 1;

    const jitterOffset = (Math.random() * 2 - 1) * state.jitter;
    const currentRtt = Math.max(1, Math.round(state.latency + jitterOffset));

    // Update Stats Display
    if (statRtt) statRtt.textContent = `${currentRtt} ms`;
    if (statDropped) {
      const dropPct = ((state.droppedPackets / state.totalPackets) * 100).toFixed(1);
      statDropped.textContent = `${dropPct}%`;
    }
    if (statQueue) {
      const queueLen = Math.min(64, Math.round((currentRtt / 1000) * 15 + Math.random() * 5));
      statQueue.textContent = `${queueLen} pkts`;
    }

    // Build Log Entry
    const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);
    const method = packetMethods[state.packetSeq % packetMethods.length];
    const portStr = state.port === 'all' ? (8000 + (state.packetSeq % 1000)) : state.port;

    const line = document.createElement('div');
    line.className = 'log-line';

    if (isDrop) {
      line.innerHTML = `
        <span class="tok-comment">[${timeStr}]</span>
        <span>[#${state.packetSeq}]</span>
        <span>127.0.0.1:${portStr}</span>
        <span class="tok-param">${method}</span>
        <span class="log-tag-drop">✖ DROPPED (Loss Sim)</span>
      `;
    } else {
      line.innerHTML = `
        <span class="tok-comment">[${timeStr}]</span>
        <span>[#${state.packetSeq}]</span>
        <span>127.0.0.1:${portStr}</span>
        <span class="tok-param">${method}</span>
        <span class="log-tag-delay">${currentRtt}ms</span>
        <span class="log-tag-pass">✔ FORWARDED</span>
      `;
    }

    if (logContainer) {
      logContainer.appendChild(line);
      while (logContainer.children.length > maxLogs) {
        logContainer.removeChild(logContainer.firstChild);
      }
    }
  }

  // Generate packet every 350ms
  setInterval(generatePacket, 380);

  // Initial seed logs
  for (let i = 0; i < 6; i++) {
    generatePacket();
  }

  // 4. Quickstart Tabs Switcher
  const tabButtons = document.querySelectorAll('.inst-tab');
  const tabContents = document.querySelectorAll('.terminal-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = `tab-${btn.getAttribute('data-tab')}`;
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
    });
  });
});
