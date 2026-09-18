import { createFaultyTerminal } from './faultyTerminal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize React Bits FaultyTerminal WebGL Shader Component
  const terminalContainer = document.getElementById('terminal-canvas-container');
  let terminalShader = null;

  if (terminalContainer) {
    terminalShader = createFaultyTerminal(terminalContainer, {
      scale: 1.3,
      gridMul: [2, 1],
      digitSize: 1.2,
      timeScale: 0.75,
      pause: false,
      scanlineIntensity: 0.5,
      glitchAmount: 0.35,
      flickerAmount: 0.45,
      noiseAmp: 0.7,
      chromaticAberration: 0.6,
      dither: 0.08,
      curvature: 0.03,
      tint: '#00ffcc',
      mouseReact: true,
      mouseStrength: 0.4,
      pageLoadAnimation: true,
      brightness: 0.65
    });
  }

  // 2. Interactive Network Chaos State
  const state = {
    profile: 'subway',
    latency: 800,
    dropRate: 10,
    jitter: 120,
    port: '8080',
    totalPackets: 0,
    droppedPackets: 0,
    packetRate: 46
  };

  const profiles = {
    subway: { latency: 800, drop: 10, jitter: 120 },
    elevator: { latency: 2500, drop: 20, jitter: 350 },
    mountain: { latency: 4000, drop: 5, jitter: 150 },
    '3g': { latency: 400, drop: 2, jitter: 80 },
    chaos: { latency: 1500, drop: 35, jitter: 450 }
  };

  // DOM Elements
  const profileButtons = document.querySelectorAll('.preset-btn');
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
  const statRate = document.getElementById('stat-rate');
  const logContainer = document.getElementById('packet-terminal-log');
  const dynamicCliCmd = document.getElementById('dynamic-cli-cmd');
  const copyCliBtn = document.getElementById('copy-cli-btn');
  const quickInstallBtn = document.getElementById('quick-install-btn');
  const quickCopyText = document.getElementById('quick-copy-text');

  function updateDynamicCommand() {
    let cmd = `subway-sim start`;
    if (state.port !== 'all') {
      cmd += ` --port ${state.port}`;
    }
    cmd += ` --latency ${state.latency} --drop ${state.dropRate} --jitter ${state.jitter}`;
    if (dynamicCliCmd) {
      dynamicCliCmd.textContent = cmd;
    }
  }

  function updateControls() {
    if (latencySlider) latencySlider.value = state.latency;
    if (dropSlider) dropSlider.value = state.dropRate;
    if (jitterSlider) jitterSlider.value = state.jitter;

    if (latencyVal) latencyVal.textContent = `${state.latency} ms`;
    if (dropVal) dropVal.textContent = `${state.dropRate} %`;
    if (jitterVal) jitterVal.textContent = `±${state.jitter} ms`;

    updateDynamicCommand();
  }

  // Profile Button Click Handlers
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
      profileButtons.forEach(b => b.classList.remove('active'));
      updateDynamicCommand();
    });
  }

  if (dropSlider) {
    dropSlider.addEventListener('input', (e) => {
      state.dropRate = parseInt(e.target.value, 10);
      if (dropVal) dropVal.textContent = `${state.dropRate} %`;
      profileButtons.forEach(b => b.classList.remove('active'));
      updateDynamicCommand();
    });
  }

  if (jitterSlider) {
    jitterSlider.addEventListener('input', (e) => {
      state.jitter = parseInt(e.target.value, 10);
      if (jitterVal) jitterVal.textContent = `±${state.jitter} ms`;
      profileButtons.forEach(b => b.classList.remove('active'));
      updateDynamicCommand();
    });
  }

  if (portSelect) {
    portSelect.addEventListener('change', (e) => {
      state.port = e.target.value;
      updateDynamicCommand();
    });
  }

  // Copy Buttons
  if (copyCliBtn) {
    copyCliBtn.addEventListener('click', () => {
      const textToCopy = dynamicCliCmd.textContent.trim();
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyCliBtn.textContent = 'Copied!';
        copyCliBtn.style.color = '#00ffcc';
        copyCliBtn.style.borderColor = '#00ffcc';
        setTimeout(() => {
          copyCliBtn.textContent = 'Copy';
          copyCliBtn.style.color = '';
          copyCliBtn.style.borderColor = '';
        }, 1800);
      });
    });
  }

  if (quickInstallBtn) {
    quickInstallBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('cargo install subway-sim').then(() => {
        if (quickCopyText) {
          quickCopyText.textContent = 'COPIED!';
          quickCopyText.style.color = '#00ffcc';
          setTimeout(() => {
            quickCopyText.textContent = 'COPY';
            quickCopyText.style.color = '';
          }, 1800);
        }
      });
    });
  }

  // 3. Live Animated Packet Waterfall Simulator
  const protocols = [
    { name: 'TCP', port: 8080, type: 'SYN', size: 64 },
    { name: 'TCP', port: 8080, type: 'ACK', size: 52 },
    { name: 'HTTP', port: 8080, type: 'GET /api/v1/health', size: 248 },
    { name: 'HTTP', port: 8080, type: '200 OK (json payload)', size: 1042 },
    { name: 'WS', port: 8080, type: 'PING frame', size: 32 },
    { name: 'WS', port: 8080, type: 'PONG frame', size: 32 },
    { name: 'UDP', port: 5000, type: 'DATAGRAM stream', size: 512 },
    { name: 'gRPC', port: 9000, type: 'STREAM /TelemetryService', size: 380 }
  ];

  function getMicroTimestamp() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    const us = Math.floor(Math.random() * 900 + 100);
    return `${h}:${m}:${s}.${ms}.${us}`;
  }

  function emitPacket() {
    state.totalPackets++;
    const proto = protocols[Math.floor(Math.random() * protocols.length)];
    const isDropped = Math.random() * 100 < state.dropRate;
    
    if (isDropped) {
      state.droppedPackets++;
    }

    const currentJitter = (Math.random() * 2 - 1) * state.jitter;
    const effectiveRtt = Math.max(0, Math.round(state.latency + currentJitter));

    // Update Stats Bar
    if (statRtt) statRtt.textContent = `${effectiveRtt} ms`;
    if (statDropped) {
      const dropPct = ((state.droppedPackets / state.totalPackets) * 100).toFixed(1);
      statDropped.textContent = `${dropPct}%`;
    }
    if (statQueue) {
      const queueDepth = isDropped ? 0 : Math.max(1, Math.round((state.latency / 1000) * (state.packetRate / 2) + Math.random() * 4));
      statQueue.textContent = `${queueDepth} pkts`;
    }

    // Build log element
    const row = document.createElement('div');
    row.className = 'log-entry';

    const tsSpan = document.createElement('span');
    tsSpan.className = 'log-ts';
    tsSpan.textContent = getMicroTimestamp();

    const protoSpan = document.createElement('span');
    protoSpan.className = 'log-proto';
    protoSpan.textContent = `[${proto.name}:${state.port === 'all' ? proto.port : state.port}]`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'log-msg';
    msgSpan.textContent = `${proto.type} (${proto.size}B)`;

    const statusSpan = document.createElement('span');
    if (isDropped) {
      statusSpan.className = 'log-status-dropped';
      statusSpan.textContent = '✕ DROPPED (KERNEL_DROP)';
    } else if (state.latency > 0) {
      statusSpan.className = 'log-status-delayed';
      statusSpan.textContent = `⏳ DELAYED +${effectiveRtt}ms`;
    } else {
      statusSpan.className = 'log-status-pass';
      statusSpan.textContent = `✓ FORWARDED (0ms)`;
    }

    row.appendChild(tsSpan);
    row.appendChild(protoSpan);
    row.appendChild(msgSpan);
    row.appendChild(statusSpan);

    if (logContainer) {
      logContainer.appendChild(row);
      // Keep only last 10 entries for ultra smooth performance
      while (logContainer.children.length > 9) {
        logContainer.removeChild(logContainer.firstChild);
      }
    }

    // Schedule next packet with variable timing
    const nextInterval = Math.max(120, Math.floor(1000 / state.packetRate + (Math.random() * 80 - 40)));
    setTimeout(emitPacket, nextInterval);
  }

  // Kickoff simulation loop
  setTimeout(emitPacket, 400);
});
