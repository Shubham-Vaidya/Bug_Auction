'use client';

import { useEffect, useRef } from 'react';

/* =====================================================
   BUG AUCTION ARENA — Complete App Logic v3
   Ported to Next.js App Router (client component)
   ===================================================== */

export default function Home() {
  const appRef = useRef(null);

  useEffect(() => {
    // All state and logic lives here inside useEffect
    // so it runs only on the client (browser), exactly like the original Vite app.

    // ── App State ──────────────────────────────────────────
    const state = {
      page: 'landing',
      roomId: null,
      teams: [],
      currentBug: null,
      bugOwner: null,
      auctionLocked: false,
      feedLog: [],
      selectedLang: 'JavaScript',
      auctionPhase: 'WAITING',
    };

    // ── Bug Pool ────────────────────────────────────────────
    const bugPool = [
      { id: 'BUG-404', name: 'Memory Leak in Galaxy Filter', value: 1200, difficulty: 'Hard', tag: '🔴' },
      { id: 'BUG-500', name: 'Database Recursive Loop', value: 800, difficulty: 'Medium', tag: '🟡' },
      { id: 'BUG-101', name: 'Auth Bypass Exploit', value: 2000, difficulty: 'Expert', tag: '💀' },
      { id: 'BUG-202', name: 'Race Condition in Scheduler', value: 1500, difficulty: 'Hard', tag: '🔴' },
      { id: 'BUG-303', name: 'Null Pointer Dereference', value: 600, difficulty: 'Easy', tag: '🟢' },
    ];

    const demoTeams = [
      { name: 'Shadow Coders', balance: 5000, status: 'online', bought: [] },
      { name: 'Cyber Phantoms', balance: 5000, status: 'online', bought: [] },
      { name: 'Logic Bombs', balance: 5000, status: 'idle', bought: [] },
    ];

    // ── Helper: current time ────────────────────────────────
    function nowStr() {
      return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }

    // ── Feed Log ────────────────────────────────────────────
    function addFeed(msg, type = '') {
      state.feedLog.unshift({ msg, type, time: nowStr() });
      if (state.feedLog.length > 30) state.feedLog.pop();
    }

    // ── Auction Phase Styles ────────────────────────────────
    const PHASE_STYLE = {
      WAITING: { cls: 'badge-gray', label: '⏳ WAITING' },
      LIVE: { cls: 'badge-green', label: '🟢 LIVE' },
      PAUSED: { cls: 'badge-amber', label: '⏸ PAUSED' },
      SOLVING: { cls: 'badge-purple', label: '🔧 SOLVING' },
      ENDED: { cls: 'badge-blue', label: '🏁 ENDED' },
    };

    function phaseBadgeHtml(phase) {
      const s = PHASE_STYLE[phase] || PHASE_STYLE.WAITING;
      return `<span class="badge ${s.cls}" style="font-size:0.62rem;padding:5px 13px;letter-spacing:1px">STATUS: ${s.label}</span>`;
    }

    // ── Router ──────────────────────────────────────────────
    function renderPage() {
      const app = appRef.current;
      if (!app) return;
      app.classList.remove('fade-in');
      void app.offsetWidth;
      app.classList.add('fade-in');

      switch (state.page) {
        case 'landing': app.innerHTML = LandingPage(); break;
        case 'admin-login': app.innerHTML = AdminLoginPage(); break;
        case 'admin-dashboard': app.innerHTML = AdminDashboardPage(); break;
        case 'team-join': app.innerHTML = TeamJoinPage(); break;
        case 'team-auction': app.innerHTML = TeamAuctionPage(); break;
        case 'leaderboard': app.innerHTML = LeaderboardPage(); break;
        default: app.innerHTML = `<div class="screen-center"><h1 class="neon-green orbitron">404</h1></div>`;
      }
      attachEvents();
      if (state.page === 'admin-dashboard') startSimulation();
      if (state.page === 'team-auction') startTeamPoll();
    }

    function go(page) {
      state.page = page;
      renderPage();
    }

    // Expose to inline onclick handlers
    window.__bugAuction__ = {
      go,
      adminLogin: () => {
        const user = document.getElementById('adm-user')?.value || 'admin';
        if (!user) { alert('Enter admin ID'); return; }
        state.teams = JSON.parse(JSON.stringify(demoTeams));
        state.currentBug = bugPool[2];
        state.feedLog = [];
        addFeed('Admin session initialized', 'green');
        addFeed('Room ARENA-X is now active', 'blue');
        demoTeams.forEach(t => addFeed(`${t.name} joined the arena`, 'green'));
        state.roomId = 'ARENA-X';
        go('admin-dashboard');
      },
      teamJoin: () => {
        const name = document.getElementById('team-name-input')?.value || 'Anonymous Team';
        const room = document.getElementById('room-id-input')?.value || 'ARENA-X';
        state.teamName = name;
        state.roomId = room;
        state.walletBalance = 5000;
        state.currentBug = bugPool[2];
        state.hasBought = false;
        go('team-auction');
      },
      selectLang: (lang) => {
        state.selectedLang = lang;
        const group = document.getElementById('lang-chip-group');
        if (!group) return;
        group.querySelectorAll('.lang-chip').forEach(chip => chip.classList.remove('selected'));
        const target = group.querySelector(`[data-lang="${lang}"]`);
        if (target) target.classList.add('selected');
      },
      teamBuy: () => {
        if (state.auctionPhase !== 'LIVE') return;
        state.hasBought = true;
        if (state.walletBalance >= (state.currentBug?.value || 0)) {
          state.walletBalance -= (state.currentBug?.value || 0);
        }
        const teamName = state.teamName || 'A team';
        addFeed(`${teamName} clicked BUY on ${state.currentBug?.id}`, 'purple');
        const ind = document.getElementById('buy-indicator');
        const buyT = document.getElementById('buying-team');
        if (ind && buyT) {
          buyT.textContent = teamName;
          ind.style.display = 'flex';
          ind.style.gap = '12px';
          ind.style.alignItems = 'center';
        }
        renderPage();
      },
      createRoom: () => {
        const id = 'ARENA-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        state.roomId = id;
        addFeed(`New room created: ${id}`, 'green');
        refreshFeed();
        const display = document.getElementById('room-id-display');
        if (display) {
          display.innerHTML = `<div class="text-xs text-sec mb-8" style="letter-spacing:2px">ACTIVE ROOM ID</div>
            <div class="orbitron neon-green" style="font-size:1.3rem;letter-spacing:4px">${id}</div>`;
        }
        const chips = document.querySelectorAll('.room-chip');
        chips.forEach(c => { c.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = ` ROOM: ${id}`; }); });
      },
      adminStartAuction: () => {
        state.auctionPhase = 'LIVE';
        addFeed(`🟢 Auction LIVE — ${state.currentBug?.id} open for bids`, 'green');
        refreshFeed();
        document.getElementById('bug-status').innerHTML = '<span class="badge badge-green">LIVE</span>';
        updatePhaseDisplay();
        document.getElementById('start-btn')?.setAttribute('disabled', true);
        document.getElementById('pause-btn')?.removeAttribute('disabled');
        document.getElementById('lock-btn')?.removeAttribute('disabled');
      },
      adminPauseAuction: () => {
        state.auctionPhase = 'PAUSED';
        addFeed('⏸ Auction paused by admin', 'amber');
        refreshFeed();
        document.getElementById('bug-status').innerHTML = '<span class="badge badge-amber">PAUSED</span>';
        updatePhaseDisplay();
        document.getElementById('start-btn')?.removeAttribute('disabled');
        document.getElementById('pause-btn')?.setAttribute('disabled', true);
        document.getElementById('lock-btn')?.setAttribute('disabled', true);
      },
      adminLockAuction: () => {
        state.auctionLocked = true;
        state.auctionPhase = 'SOLVING';
        addFeed('🔒 Auction LOCKED — SOLVING phase started!', 'purple');
        refreshFeed();
        document.getElementById('bug-status').innerHTML = '<span class="badge badge-purple">SOLVING</span>';
        updatePhaseDisplay();
        document.getElementById('start-btn')?.setAttribute('disabled', true);
        document.getElementById('pause-btn')?.setAttribute('disabled', true);
        document.getElementById('lock-btn')?.setAttribute('disabled', true);
      },
      adminSetBug: (i) => {
        state.currentBug = bugPool[i];
        addFeed(`Bug updated to ${bugPool[i].id}: ${bugPool[i].name}`, 'blue');
        refreshFeed();
        const card = document.getElementById('current-bug-card');
        if (card) {
          const b = bugPool[i];
          const diffColor = b.difficulty === 'Expert' ? 'neon-purple' : b.difficulty === 'Hard' ? 'neon-amber' : 'neon-green';
          card.innerHTML = `
            <div class="bug-card-id">BUG ID: ${b.id} &nbsp; ${b.tag}</div>
            <div class="bug-card-name">${b.name}</div>
            <div class="bug-card-meta">
              <div class="bug-meta-item">
                <span class="bug-meta-label">Market Value</span>
                <span class="bug-meta-value neon-green">₹${b.value.toLocaleString()}</span>
              </div>
              <div class="bug-meta-item">
                <span class="bug-meta-label">Difficulty</span>
                <span class="bug-meta-value ${diffColor}">${b.difficulty}</span>
              </div>
              <div class="bug-meta-item">
                <span class="bug-meta-label">Status</span>
                <span id="bug-status"><span class="badge badge-amber">PENDING</span></span>
              </div>
            </div>`;
        }
      },
      openModal: () => {
        const m = document.getElementById('assign-modal');
        if (m) m.classList.add('active');
      },
      closeModal: () => {
        const m = document.getElementById('assign-modal');
        if (m) m.classList.remove('active');
      },
      confirmAssign: () => {
        const sel = document.getElementById('assign-team-select');
        const team = sel?.value || 'Team';
        addFeed(`${state.currentBug?.id} assigned to ${team}`, 'purple');
        refreshFeed();
        window.__bugAuction__.closeModal();
      },
    };

    // ── Page Templates ──────────────────────────────────────
    function LandingPage() {
      return `
        <div class="screen-center">
          <div class="card landing-card border-green pulse-green slide-up">
            <h1 class="orbitron landing-logo neon-green">BUG AUCTION<br>ARENA</h1>
            <div class="landing-divider"></div>
            <p class="landing-sub">LIVE AUCTION · CODING BATTLE · REAL-TIME CHAOS</p>

            <div class="landing-btn-group">
              <button class="btn btn-green btn-lg btn-full" onclick="window.__bugAuction__.go('admin-login')">
                ⚡ ENTER AS ADMIN
              </button>
              <button class="btn btn-purple btn-lg btn-full" onclick="window.__bugAuction__.go('team-join')">
                👥 ENTER AS TEAM
              </button>
            </div>

            <div class="mt-32" style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.06)">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;">
                <div>
                  <div class="orbitron neon-green" style="font-size:1.4rem">5</div>
                  <div class="text-xs text-sec mt-4">BUGS IN POOL</div>
                </div>
                <div>
                  <div class="orbitron neon-purple" style="font-size:1.4rem">3</div>
                  <div class="text-xs text-sec mt-4">ACTIVE TEAMS</div>
                </div>
                <div>
                  <div class="orbitron neon-blue" style="font-size:1.4rem">LIVE</div>
                  <div class="text-xs text-sec mt-4">SESSION STATUS</div>
                </div>
              </div>
            </div>

            <p class="mt-24 text-xs text-sec" style="text-align:center">Powered by Bug Auction Engine v3.0</p>
          </div>
        </div>
      `;
    }

    function AdminLoginPage() {
      return `
        <div class="screen-center">
          <div class="card auth-card border-green pulse-green slide-up">
            <div class="text-xs text-sec mb-8" style="letter-spacing:3px;cursor:pointer" onclick="window.__bugAuction__.go('landing')">← BACK TO PORTAL</div>
            <h1 class="orbitron neon-green">ADMIN ACCESS</h1>
            <p class="auth-subtitle">INITIALIZE SECURE SESSION</p>

            <div class="input-group">
              <label class="input-label">Admin Username</label>
              <input type="text" placeholder="Enter admin ID" class="input" id="adm-user">
            </div>
            <div class="input-group mb-32">
              <label class="input-label">Key Phrase / Password</label>
              <input type="password" placeholder="••••••••" class="input" id="adm-pass">
            </div>

            <button class="btn btn-green btn-full" onclick="window.__bugAuction__.adminLogin()">INITIALIZE SESSION ⚡</button>
            <p class="mt-20 text-xs text-sec text-center cursor-pointer" onclick="window.__bugAuction__.go('team-join')">
              Switch to Team Access →
            </p>
          </div>
        </div>
      `;
    }

    function AdminDashboardPage() {
      const bug = state.currentBug || bugPool[2];
      const feedHtml = state.feedLog.length
        ? state.feedLog.map(f => `
            <div class="feed-item ${f.type}">
              ${f.msg}
              <div class="feed-time">${f.time}</div>
            </div>`).join('')
        : `<div class="text-xs text-sec">Waiting for activity...</div>`;

      const teamsHtml = state.teams.map(t => `
        <div class="team-item">
          <div style="display:flex;align-items:center">
            <div class="team-dot ${t.status === 'online' ? 'online' : 'idle'}"></div>
            <div>
              <div style="font-size:0.88rem;font-weight:600">${t.name}</div>
              <div class="text-xs text-sec">₹${t.balance.toLocaleString()}</div>
            </div>
          </div>
          <div class="badge ${t.status === 'online' ? 'badge-green' : 'badge-amber'}">${t.status}</div>
        </div>`).join('');

      const diffColor = bug.difficulty === 'Expert' ? 'neon-purple' : bug.difficulty === 'Hard' ? 'neon-amber' : 'neon-green';

      return `
        <!-- Top Header Bar -->
        <div class="top-bar">
          <div class="top-bar-title neon-green">⚡ BUG AUCTION ARENA</div>
          <div class="top-bar-center">
            <div class="room-chip">
              <div class="room-chip-dot"></div>
              ROOM: ${state.roomId || 'ARENA-X'}
            </div>
            <div id="admin-phase-badge">${phaseBadgeHtml(state.auctionPhase)}</div>
          </div>
          <div class="btn-row">
            <button class="btn btn-blue btn-sm" onclick="window.__bugAuction__.go('leaderboard')">📊 RANKINGS</button>
            <button class="btn btn-purple btn-sm" onclick="window.__bugAuction__.go('landing')">LOGOUT</button>
          </div>
        </div>

        <!-- Page Content -->
        <div class="page">
          <div class="admin-grid">

            <!-- LEFT PANEL: Room Control -->
            <div class="panel">
              <div class="card border-green">
                <div class="panel-title">Room Control</div>
                <h3 class="orbitron mb-20" style="font-size:0.95rem">ARENA MANAGER</h3>

                <button class="btn btn-green btn-full mb-16" onclick="window.__bugAuction__.createRoom()">
                  ＋ CREATE NEW ROOM
                </button>

                <div id="room-id-display" style="padding:14px 16px;border-radius:8px;background:rgba(0,255,65,0.06);border:1px solid rgba(0,255,65,0.2);margin-bottom:24px">
                  <div class="text-xs text-sec mb-8" style="letter-spacing:2px">ACTIVE ROOM ID</div>
                  <div class="orbitron neon-green" style="font-size:1.3rem;letter-spacing:4px">${state.roomId || '—'}</div>
                </div>

                <div class="section-divider"></div>

                <div class="panel-title mb-16">Joined Teams (${state.teams.length})</div>
                <div id="team-list">${teamsHtml || '<div class="text-xs text-sec">No teams joined yet</div>'}</div>
              </div>
            </div>

            <!-- CENTER PANEL: Auction Area -->
            <div class="panel">
              <div class="card">
                <div class="panel-title">Auction Control</div>
                <h3 class="orbitron mb-24" style="font-size:0.95rem">LIVE AUCTION FLOOR</h3>

                <!-- Current Bug Card -->
                <div class="bug-card mb-24" id="current-bug-card">
                  <div class="bug-card-id">BUG ID: ${bug.id} &nbsp; ${bug.tag}</div>
                  <div class="bug-card-name">${bug.name}</div>
                  <div class="bug-card-meta">
                    <div class="bug-meta-item">
                      <span class="bug-meta-label">Market Value</span>
                      <span class="bug-meta-value neon-green">₹${bug.value.toLocaleString()}</span>
                    </div>
                    <div class="bug-meta-item">
                      <span class="bug-meta-label">Difficulty</span>
                      <span class="bug-meta-value ${diffColor}">${bug.difficulty}</span>
                    </div>
                    <div class="bug-meta-item">
                      <span class="bug-meta-label">Status</span>
                      <span id="bug-status"><span class="badge badge-amber">PENDING</span></span>
                    </div>
                  </div>
                </div>

                <!-- Buy Indicator -->
                <div id="buy-indicator" style="display:none" class="buy-indicator">
                  <span class="orbitron neon-purple" style="font-size:0.7rem">🔔 TEAM CLICKED BUY:</span>
                  <span id="buying-team" class="font-bold" style="margin-left:10px">—</span>
                </div>

                <div class="section-divider"></div>

                <!-- Auction Controls -->
                <div style="margin-bottom:16px">
                  <div class="panel-title mb-12">Auction Controls</div>
                  <div class="btn-row">
                    <button class="btn btn-green" id="start-btn" onclick="window.__bugAuction__.adminStartAuction()"
                      ${['LIVE', 'SOLVING', 'ENDED'].includes(state.auctionPhase) ? 'disabled' : ''})>▶ START BIDDING</button>
                    <button class="btn btn-purple" id="pause-btn" onclick="window.__bugAuction__.adminPauseAuction()"
                      ${state.auctionPhase !== 'LIVE' ? 'disabled' : ''})>⏸ PAUSE</button>
                  </div>
                </div>
                <button class="btn btn-amber btn-full mb-16" id="lock-btn" onclick="window.__bugAuction__.adminLockAuction()"
                  ${['WAITING', 'PAUSED', 'SOLVING', 'ENDED'].includes(state.auctionPhase) ? 'disabled' : ''})>
                  🔒 LOCK AUCTION &amp; START SOLVING
                </button>

                <div class="section-divider"></div>

                <!-- Bug Selector -->
                <div class="panel-title mb-12">Set Next Bug</div>
                <div class="flex gap-8" style="flex-wrap:wrap">
                  ${bugPool.map((b, i) => `
                    <button class="btn btn-sm btn-blue" onclick="window.__bugAuction__.adminSetBug(${i})" title="${b.name}">
                      ${b.id}
                    </button>`).join('')}
                </div>
              </div>
            </div>

            <!-- RIGHT PANEL: Activity Feed -->
            <div class="panel">
              <div class="card" style="padding:24px 22px">
                <div class="panel-title">Live Feed</div>
                <h3 class="orbitron mb-20" style="font-size:0.9rem">ACTIVITY LOG</h3>
                <div id="activity-feed" class="feed" style="max-height:480px;overflow-y:auto">
                  ${feedHtml}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="card">
                <div class="panel-title mb-16">Session Controls</div>
                <div style="display:flex;flex-direction:column;gap:12px">
                  <button class="btn btn-blue btn-full" onclick="window.__bugAuction__.go('leaderboard')">📊 View Leaderboard</button>
                  <button class="btn btn-green btn-full" onclick="alert('🏆 Contest ended! Rewards distributed.')">🏆 End Contest</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Assign Modal -->
        <div id="assign-modal" class="modal-overlay">
          <div class="modal-box">
            <h3 class="orbitron neon-purple">ASSIGN BUG TO TEAM</h3>
            <div class="input-group" style="margin-top:24px">
              <label class="input-label">Select Team</label>
              <select class="input" id="assign-team-select">
                ${state.teams.map(t => `<option>${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="btn-row mt-24">
              <button class="btn btn-green flex-1" onclick="window.__bugAuction__.confirmAssign()">CONFIRM</button>
              <button class="btn btn-purple flex-1" onclick="window.__bugAuction__.closeModal()">CANCEL</button>
            </div>
          </div>
        </div>
      `;
    }

    function TeamJoinPage() {
      return `
        <div class="screen-center">
          <div class="card join-card border-purple pulse-purple slide-up">
            <div class="text-xs text-sec mb-8" style="letter-spacing:3px;cursor:pointer" onclick="window.__bugAuction__.go('landing')">← BACK TO PORTAL</div>
            <h1 class="orbitron neon-purple">TEAM UPLINK</h1>
            <p class="subtitle">CONNECT TO ACTIVE ARENA</p>

            <div style="margin-top:32px">
              <div class="input-group">
                <label class="input-label">Team Name</label>
                <input type="text" placeholder="e.g. Shadow Coders" class="input" id="team-name-input">
              </div>
              <div class="input-group">
                <label class="input-label">Auth Key</label>
                <input type="password" placeholder="••••••••" class="input" id="team-pass-input">
              </div>
              <div class="input-group">
                <label class="input-label">Room ID</label>
                <input type="text" placeholder="e.g. ARENA-X" class="input" id="room-id-input">
              </div>
              <!-- Language Chips -->
              <div style="margin-top:24px;margin-bottom:24px">
                <span class="lang-chips-label">Language Environment</span>
                <div class="lang-chips-group" id="lang-chip-group">
                  <div class="lang-chip ${state.selectedLang === 'JavaScript' ? 'selected' : ''}" data-lang="JavaScript" onclick="window.__bugAuction__.selectLang('JavaScript')">
                    <span class="lang-chip-icon">🟨</span> JavaScript
                  </div>
                  <div class="lang-chip ${state.selectedLang === 'Python' ? 'selected' : ''}" data-lang="Python" onclick="window.__bugAuction__.selectLang('Python')">
                    <span class="lang-chip-icon">🐍</span> Python
                  </div>
                  <div class="lang-chip ${state.selectedLang === 'C++' ? 'selected' : ''}" data-lang="C++" onclick="window.__bugAuction__.selectLang('C++')">
                    <span class="lang-chip-icon">⚙️</span> C++
                  </div>
                  <div class="lang-chip ${state.selectedLang === 'Java' ? 'selected' : ''}" data-lang="Java" onclick="window.__bugAuction__.selectLang('Java')">
                    <span class="lang-chip-icon">☕</span> Java
                  </div>
                  <div class="lang-chip ${state.selectedLang === 'C' ? 'selected' : ''}" data-lang="C" onclick="window.__bugAuction__.selectLang('C')">
                    <span class="lang-chip-icon">🔵</span> C
                  </div>
                </div>
              </div>
            </div>

            <button class="btn btn-purple btn-full" onclick="window.__bugAuction__.teamJoin()">ESTABLISH CONNECTION →</button>
            <p class="mt-20 text-xs text-sec text-center cursor-pointer" onclick="window.__bugAuction__.go('admin-login')">
              Switch to Admin Access →
            </p>
          </div>
        </div>
      `;
    }

    function TeamAuctionPage() {
      const bug = state.currentBug || bugPool[2];
      const name = state.teamName || 'Team';
      const bal = state.walletBalance ?? 5000;
      const diffColor = bug.difficulty === 'Expert' ? 'neon-purple' : bug.difficulty === 'Hard' ? 'neon-amber' : 'neon-green';

      return `
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="top-bar-title neon-purple">👥 TEAM UPLINK</div>
          <div class="top-bar-center">
            <div class="room-chip" style="border-color:var(--neon-purple);background:rgba(188,19,254,0.06);color:var(--neon-purple)">
              <div class="room-chip-dot" style="background:var(--neon-purple);box-shadow:0 0 8px var(--neon-purple)"></div>
              ${state.roomId || 'ARENA-X'}
            </div>
            <div id="team-phase-badge">${phaseBadgeHtml(state.auctionPhase)}</div>
          </div>
          <div class="btn-row">
            <div class="badge badge-green" style="padding:8px 16px;font-size:0.7rem">${name}</div>
            <button class="btn btn-purple btn-sm" onclick="window.__bugAuction__.go('landing')">DISCONNECT</button>
          </div>
        </div>

        <div class="page">

          <!-- Wallet Balance -->
          <div style="margin-bottom:32px">
            <div class="card wallet-card border-green" style="display:inline-flex">
              <div class="wallet-icon">💰</div>
              <div>
                <div class="wallet-label">Wallet Balance</div>
                <div class="wallet-value neon-green">₹${bal.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="auction-team-layout">

            <!-- Center: Live Auction -->
            <div class="panel">

              <div class="card border-purple pulse-purple">
                <div class="panel-title">Live Auction</div>
                <h3 class="orbitron mb-24" style="font-size:1rem">CURRENT BUG ON AUCTION</h3>

                <!-- Bug Details -->
                <div class="bug-card mb-28">
                  <div class="bug-card-id">TARGET: ${bug.id} &nbsp; ${bug.tag}</div>
                  <div class="bug-card-name" style="font-size:1.2rem">${bug.name}</div>
                  <div class="bug-card-meta">
                    <div class="bug-meta-item">
                      <span class="bug-meta-label">Market Value</span>
                      <span class="bug-meta-value neon-green">₹${bug.value.toLocaleString()}</span>
                    </div>
                    <div class="bug-meta-item">
                      <span class="bug-meta-label">Difficulty</span>
                      <span class="bug-meta-value ${diffColor}">${bug.difficulty}</span>
                    </div>
                    <div class="bug-meta-item">
                      <span class="bug-meta-label">If Solved</span>
                      <span class="bug-meta-value neon-green">₹${Math.floor(bug.value * 1.35).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <!-- BUY Section -->
                <div id="team-buy-section">
                ${state.hasBought ? `
                  <div class="buy-confirmed">
                    <span style="font-size:1.4rem">✅</span>
                    <div>
                      <div class="orbitron neon-green" style="font-size:0.78rem;margin-bottom:4px">BUY REQUEST SENT</div>
                      <div class="text-sm text-sec">Waiting for Admin to confirm lock...</div>
                    </div>
                  </div>` : state.auctionPhase === 'SOLVING' ? `
                  <div class="buy-confirmed" style="background:rgba(188,19,254,0.07);border:1px solid rgba(188,19,254,0.3)">
                    <span style="font-size:1.4rem">🔧</span>
                    <div>
                      <div class="orbitron neon-purple" style="font-size:0.78rem;margin-bottom:4px">SOLVING PHASE ACTIVE</div>
                      <div class="text-sm text-sec">Auction locked. Solve your bug to earn the reward.</div>
                    </div>
                  </div>` : `
                  <button class="btn btn-green btn-full" style="font-size:1rem;min-height:60px" id="buy-btn"
                    onclick="window.__bugAuction__.teamBuy()" ${state.auctionPhase !== 'LIVE' ? 'disabled' : ''})>
                    ${state.auctionPhase === 'LIVE' ? '🐛 CLICK TO BUY THIS BUG' : '🔒 AUCTION ' + state.auctionPhase}
                  </button>
                  <div class="text-xs text-sec mt-12 text-center">
                    ${state.auctionPhase === 'LIVE' ? 'Clicking BUY will notify the Admin panel instantly' : 'Waiting for Admin to start the auction...'}
                  </div>`}
                </div>
              </div>

              <!-- Strategy Tip Card -->
              <div class="card" style="padding:20px 24px">
                <div class="panel-title mb-12">💡 Strategy Intel</div>
                <div class="text-sm leading-relaxed text-sec">
                  Buy bugs at market value. Solve them to earn a <span class="neon-green">35% bonus</span> on top.
                  Unsolved bugs leave you at a net loss. Choose wisely.
                </div>
              </div>
            </div>

            <!-- Right: Team Stats -->
            <div class="panel">
              <div class="card">
                <div class="panel-title mb-16">Your Portfolio</div>
                <div style="display:flex;flex-direction:column;gap:14px">
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle)">
                    <span class="text-xs text-sec" style="letter-spacing:1.5px">TEAM</span>
                    <span class="font-bold" style="font-size:0.9rem">${name}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle)">
                    <span class="text-xs text-sec" style="letter-spacing:1.5px">WALLET</span>
                    <span class="orbitron neon-green">₹${bal.toLocaleString()}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle)">
                    <span class="text-xs text-sec" style="letter-spacing:1.5px">ROOM</span>
                    <span class="mono" style="font-size:0.82rem">${state.roomId}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle)">
                    <span class="text-xs text-sec" style="letter-spacing:1.5px">STATUS</span>
                    <span class="badge badge-green">LIVE</span>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="panel-title mb-16">Bugs Marketplace</div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  ${bugPool.map(b => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid var(--border-subtle);font-size:0.82rem">
                      <div>
                        <div class="mono neon-blue" style="font-size:0.72rem">${b.id}</div>
                        <div style="color:var(--text-secondary);font-size:0.75rem;margin-top:2px">${b.name.substring(0, 22)}...</div>
                      </div>
                      <div class="neon-green orbitron" style="font-size:0.75rem">₹${b.value.toLocaleString()}</div>
                    </div>`).join('')}
                </div>
              </div>

              <button class="btn btn-blue btn-full" onclick="window.__bugAuction__.go('leaderboard')">📊 View Leaderboard</button>
            </div>

          </div>
        </div>
      `;
    }

    function LeaderboardPage() {
      const rows = [
        { rank: 1, name: 'CYBER PHANTOMS', status: 'SOLVING', bugs: 4, profit: 8400, rankClass: 'neon-green' },
        { rank: 2, name: 'SHADOW CODERS', status: 'IDLE', bugs: 3, profit: 5100, rankClass: 'neon-purple' },
        { rank: 3, name: 'LOGIC BOMBS', status: 'SOLVING', bugs: 2, profit: -200, rankClass: 'text-sec' },
      ];

      return `
        <div class="top-bar">
          <div class="top-bar-title neon-green">⚡ BUG AUCTION ARENA</div>
          <div class="top-bar-center">
            <div class="room-chip"><div class="room-chip-dot"></div>LIVE RANKINGS</div>
          </div>
          <button class="btn btn-purple btn-sm" onclick="window.__bugAuction__.go('landing')">← BACK</button>
        </div>

        <div class="page">
          <div style="text-align:center;margin-bottom:48px">
            <h1 class="orbitron neon-green" style="font-size:2.4rem;margin-bottom:10px">🏆 GLOBAL RANKINGS</h1>
            <p class="text-sec" style="letter-spacing:4px;font-size:0.78rem">LIVE FROM ARENA-X</p>
          </div>

          <div class="card border-purple" style="padding:0;overflow:hidden;margin-bottom:32px">
            <table class="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Identity</th>
                  <th>Status</th>
                  <th>Bugs Cracked</th>
                  <th style="text-align:right">Total Profit</th>
                </tr>
              </thead>
              <tbody id="leaderboard-body">
                ${rows.map(r => `
                  <tr>
                    <td class="${r.rankClass} orbitron" style="font-size:1.1rem">#${r.rank}</td>
                    <td style="font-weight:600;letter-spacing:1px">${r.name}</td>
                    <td><span class="badge ${r.status === 'SOLVING' ? 'badge-green' : 'badge-purple'}">${r.status}</span></td>
                    <td><span class="orbitron neon-blue" style="font-size:1rem">${r.bugs}</span></td>
                    <td style="text-align:right">
                      <span class="${r.profit >= 0 ? 'neon-green' : 'text-sec'} orbitron mono" style="font-size:0.9rem">
                        ${r.profit >= 0 ? '+' : ''}₹${Math.abs(r.profit).toLocaleString()}
                      </span>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <div class="stats-row">
            <div class="card text-center">
              <div class="stat-label">Total Bounty</div>
              <div class="stat-value neon-green">₹45,000</div>
            </div>
            <div class="card text-center">
              <div class="stat-label">Top Team</div>
              <div class="stat-value neon-purple" style="font-size:1.1rem">CYBER PHANTOMS</div>
            </div>
            <div class="card text-center">
              <div class="stat-label">Bugs Solved</div>
              <div class="stat-value neon-blue">9</div>
            </div>
            <div class="card text-center">
              <div class="stat-label">System Uptime</div>
              <div class="stat-value neon-amber">99.9%</div>
            </div>
          </div>

          <div class="btn-row btn-row-center mt-40">
            <button class="btn btn-green" onclick="window.__bugAuction__.go('landing')">← BACK TO PORTAL</button>
          </div>
        </div>
      `;
    }

    // ── Feed refresher ──────────────────────────────────────
    function refreshFeed() {
      const el = document.getElementById('activity-feed');
      if (!el) return;
      el.innerHTML = state.feedLog.slice(0, 20).map(f => `
        <div class="feed-item ${f.type}">
          ${f.msg}
          <div class="feed-time">${f.time}</div>
        </div>`).join('');
    }

    function updatePhaseDisplay() {
      const html = phaseBadgeHtml(state.auctionPhase);
      const adminBadge = document.getElementById('admin-phase-badge');
      if (adminBadge) adminBadge.innerHTML = html;
      const teamBadge = document.getElementById('team-phase-badge');
      if (teamBadge) teamBadge.innerHTML = html;
    }

    // ── Team-side live polling ──────────────────────────────
    let teamPollInterval = null;
    function startTeamPoll() {
      if (teamPollInterval) clearInterval(teamPollInterval);
      teamPollInterval = setInterval(() => {
        if (state.page !== 'team-auction') { clearInterval(teamPollInterval); return; }

        const badge = document.getElementById('team-phase-badge');
        if (badge) badge.innerHTML = phaseBadgeHtml(state.auctionPhase);

        const buySection = document.getElementById('team-buy-section');
        if (!buySection || state.hasBought) return;

        if (state.auctionPhase === 'SOLVING') {
          buySection.innerHTML = `
            <div class="buy-confirmed" style="background:rgba(188,19,254,0.07);border:1px solid rgba(188,19,254,0.3)">
              <span style="font-size:1.4rem">🔧</span>
              <div>
                <div class="orbitron neon-purple" style="font-size:0.78rem;margin-bottom:4px">SOLVING PHASE ACTIVE</div>
                <div class="text-sm text-sec">Auction locked. Solve your bug to earn the reward.</div>
              </div>
            </div>`;
        } else {
          const isLive = state.auctionPhase === 'LIVE';
          buySection.innerHTML = `
            <button class="btn btn-green btn-full" style="font-size:1rem;min-height:60px" id="buy-btn"
              onclick="window.__bugAuction__.teamBuy()" ${isLive ? '' : 'disabled'})>
              ${isLive ? '🐛 CLICK TO BUY THIS BUG' : '🔒 AUCTION ' + state.auctionPhase}
            </button>
            <div class="text-xs text-sec mt-12 text-center">
              ${isLive ? 'Clicking BUY will notify the Admin panel instantly' : 'Waiting for Admin to start the auction...'}
            </div>`;
        }
      }, 700);
    }

    // ── Live Simulation (Admin Dashboard) ──────────────────
    let simInterval = null;
    const simEvents = [
      { msg: 'Shadow Coders viewed BUG-404', type: 'blue' },
      { msg: 'Cyber Phantoms is analyzing...', type: 'blue' },
      { msg: 'Logic Bombs requested bug info', type: 'blue' },
      { msg: 'Shadow Coders clicked BUY', type: 'purple' },
      { msg: 'Cyber Phantoms clicked BUY', type: 'purple' },
      { msg: 'Bidding war detected!', type: 'amber' },
      { msg: 'Admin paused auction', type: 'amber' },
      { msg: 'Bid confirmed: Shadow Coders', type: 'green' },
    ];

    function startSimulation() {
      if (simInterval) clearInterval(simInterval);
      let idx = 0;
      simInterval = setInterval(() => {
        if (state.page !== 'admin-dashboard') { clearInterval(simInterval); return; }
        const e = simEvents[idx % simEvents.length]; idx++;
        addFeed(e.msg, e.type);

        if (e.type === 'purple') {
          const ind = document.getElementById('buy-indicator');
          const buyT = document.getElementById('buying-team');
          if (ind && buyT) {
            const team = e.msg.split(' clicked')[0];
            buyT.textContent = team;
            ind.style.display = 'flex';
            ind.style.gap = '12px';
            ind.style.alignItems = 'center';
          }
        }

        refreshFeed();
      }, 3500);
    }

    // ── Leaderboard live ticker ─────────────────────────────
    const lbInterval = setInterval(() => {
      const body = document.getElementById('leaderboard-body');
      if (!body) return;
      const cells = body.querySelectorAll('td:last-child span');
      cells.forEach(cell => {
        const raw = cell.innerText.replace(/[+₹,]/g, '');
        const val = parseInt(raw) || 0;
        const delta = Math.floor(Math.random() * 80) - 10;
        const newVal = val + delta;
        cell.innerText = (newVal >= 0 ? '+' : '-') + '₹' + Math.abs(newVal).toLocaleString();
        cell.classList.remove('fade-in');
        void cell.offsetWidth;
        cell.classList.add('fade-in');
      });
    }, 3000);

    // ── Attach Events ───────────────────────────────────────
    function attachEvents() {
      document.getElementById('adm-pass')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') window.__bugAuction__.adminLogin();
      });
      document.getElementById('room-id-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') window.__bugAuction__.teamJoin();
      });
    }

    // ── Initialize ──────────────────────────────────────────
    renderPage();

    // Cleanup on unmount
    return () => {
      clearInterval(lbInterval);
      if (simInterval) clearInterval(simInterval);
      if (teamPollInterval) clearInterval(teamPollInterval);
      delete window.__bugAuction__;
    };
  }, []);

  return <div id="app" ref={appRef}></div>;
}
