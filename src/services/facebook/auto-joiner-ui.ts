import { AutoJoinState, AutoJoinConfig } from '../../types/auto-joiner';
import { AutoJoinerController, extractSearchQuery } from './auto-joiner-engine';

let autoJoinContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;

/**
 * Injects or updates the floating Auto-Joiner widget on Facebook search pages.
 */
export function renderAutoJoinerDock(config?: AutoJoinConfig) {
  if (typeof document === 'undefined') return;

  const controller = AutoJoinerController.getInstance();
  const state = controller.getState();
  const query = extractSearchQuery(window.location.href);

  if (!autoJoinContainer) {
    autoJoinContainer = document.createElement('div');
    autoJoinContainer.id = 'agp-auto-joiner-root';
    autoJoinContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    shadowRoot = autoJoinContainer.attachShadow({ mode: 'open' });
    document.body.appendChild(autoJoinContainer);

    // Subscribe to state changes
    controller.subscribe(newState => {
      updateDockContent(newState);
    });
  }

  updateDockContent(state, config);
}

let isDockMinimized = false;

function updateDockContent(state: AutoJoinState, initialConfig?: AutoJoinConfig) {
  if (!shadowRoot) return;

  const query = extractSearchQuery(window.location.href);
  const isRunning = state.status === 'SEARCHING' || state.status === 'JOINING';
  const isPaused = state.status === 'PAUSED';

  const statusColor =
    state.status === 'JOINING'
      ? '#10b981'
      : state.status === 'SEARCHING'
      ? '#3b82f6'
      : state.status === 'PAUSED'
      ? '#f59e0b'
      : state.status === 'COMPLETED'
      ? '#10b981'
      : state.status === 'ERROR'
      ? '#ef4444'
      : '#6366f1';

  if (isDockMinimized) {
    shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .mini-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          padding: 8px 14px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          color: white;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: transform 0.2s;
        }
        .mini-badge:hover { transform: scale(1.05); }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; ${isRunning ? 'animation: pulse 1.5s infinite;' : ''} }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      </style>
      <div id="agp-dock-expand" class="mini-badge">
        <div class="dot"></div>
        <span style="font-size: 12px; font-weight: 700;">Auto-Joiner: ${state.joinedCount} Joined</span>
        <span style="font-size: 11px; color: #94a3b8;">↗</span>
      </div>
    `;
    const expandEl = shadowRoot.getElementById('agp-dock-expand');
    if (expandEl) {
      expandEl.onclick = () => {
        isDockMinimized = false;
        updateDockContent(state, initialConfig);
      };
    }
    return;
  }

  shadowRoot.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .dock-card {
        width: 380px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 18px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(99, 102, 241, 0.2);
        color: #f8fafc;
        padding: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .dock-card:hover {
        border-color: rgba(99, 102, 241, 0.4);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .badge-icon {
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #6366f1, #3b82f6);
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 15px;
        color: white;
        box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
      }
      .title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -0.2px;
        color: #ffffff;
      }
      .subtitle {
        font-size: 11px;
        color: #94a3b8;
        max-width: 190px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        background: ${statusColor}22;
        color: ${statusColor};
        border: 1px solid ${statusColor}55;
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${statusColor};
        ${isRunning ? 'animation: pulse 1.5s infinite;' : ''}
      }
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.3); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        margin-bottom: 12px;
        background: rgba(30, 41, 59, 0.65);
        padding: 10px 8px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .stat-item {
        text-align: center;
      }
      .stat-num {
        font-size: 15px;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1.2;
      }
      .stat-label {
        font-size: 9px;
        color: #94a3b8;
        text-transform: uppercase;
        font-weight: 600;
        margin-top: 2px;
      }
      .message-box {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 12px;
        color: #cbd5e1;
        margin-bottom: 10px;
        min-height: 38px;
        display: flex;
        align-items: center;
        line-height: 1.35;
      }
      .countdown-bar-container {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 12px;
      }
      .countdown-bar {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #6366f1);
        transition: width 1s linear;
      }
      .btn-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      .btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 9px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      }
      .btn-primary:hover {
        background: linear-gradient(135deg, #059669, #047857);
      }
      .btn-pause {
        background: #f59e0b;
        color: #0f172a;
      }
      .btn-stop {
        background: #ef4444;
        color: white;
      }
      .footer-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .link-btn {
        background: transparent;
        border: none;
        color: #818cf8;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        padding: 2px 4px;
      }
      .link-btn:hover { color: #a5b4fc; }
      .icon-btn {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
        font-size: 13px;
        padding: 3px 6px;
        border-radius: 4px;
      }
      .icon-btn:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.1);
      }
    </style>

    <div class="dock-card">
      <div class="header">
        <div class="title-group">
          <div class="badge-icon">⚡</div>
          <div>
            <div class="title" style="display: flex; align-items: center; gap: 6px;">
              <span>Facebook Auto-Joiner</span>
              <span style="font-size: 9px; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4);">TURBO FAST ⚡</span>
            </div>
            <div class="subtitle" title="${query ? query : 'Group Search Results'}">
              ${query ? `Search: "${query}"` : 'Group Search Results'}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div class="status-pill">
            <div class="status-dot"></div>
            <span>${state.status}</span>
          </div>
          <button id="agp-dock-min" class="icon-btn" title="Minimize">−</button>
          <button id="agp-dock-close" class="icon-btn" title="Dismiss">✕</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-num" style="color: #60a5fa;">${state.totalFound}</div>
          <div class="stat-label">Found</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #34d399;">${state.joinedCount}</div>
          <div class="stat-label">Joined</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #fbbf24;">${state.requestedCount}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-item">
          <div class="stat-num" style="color: #a78bfa;">${state.alreadyJoinedCount}</div>
          <div class="stat-label">Member</div>
        </div>
      </div>

      ${
        state.countdownSec > 0
          ? `<div class="countdown-bar-container">
               <div class="countdown-bar" style="width: 100%; transition: width 0.9s linear;"></div>
             </div>`
          : ''
      }

      <div class="message-box">
        ${state.message || 'Ready to auto-join all groups on this search page and save them to your list.'}
      </div>

      <div class="btn-row">
        ${
          !isRunning && !isPaused
            ? `<button id="btn-start-join" class="btn btn-primary">
                 <span>▶</span> Auto-Join All Groups
               </button>`
            : isRunning
            ? `<button id="btn-pause-join" class="btn btn-pause">⏸ Pause</button>
               <button id="btn-stop-join" class="btn btn-stop">⏹ Stop</button>`
            : `<button id="btn-resume-join" class="btn btn-primary">▶ Resume</button>
               <button id="btn-stop-join" class="btn btn-stop">⏹ Stop</button>`
        }
      </div>

      <div class="footer-actions">
        <span style="font-size: 10px; color: #64748b;">Groups auto-saved for posting</span>
        <button id="btn-view-groups" class="link-btn">View My Groups ↗</button>
      </div>
    </div>
  `;

  // Attach event listeners
  const closeBtn = shadowRoot.getElementById('agp-dock-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      if (autoJoinContainer) {
        autoJoinContainer.remove();
        autoJoinContainer = null;
        shadowRoot = null;
      }
    };
  }

  const minBtn = shadowRoot.getElementById('agp-dock-min');
  if (minBtn) {
    minBtn.onclick = () => {
      isDockMinimized = true;
      updateDockContent(state, initialConfig);
    };
  }

  const viewGroupsBtn = shadowRoot.getElementById('btn-view-groups');
  if (viewGroupsBtn) {
    viewGroupsBtn.onclick = () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
        }
      } catch (_) {}
    };
  }

  const startBtn = shadowRoot.getElementById('btn-start-join');
  if (startBtn) {
    startBtn.onclick = () => {
      const ctrl = AutoJoinerController.getInstance();
      ctrl.start(initialConfig || {
        searchUrl: window.location.href,
        delaySec: 0,
        maxGroups: 0,
        autoAnswerQuestions: true,
        defaultAnswer: 'Yes, I agree to the group rules and guidelines.',
        saveToGroups: true,
      });
    };
  }

  const pauseBtn = shadowRoot.getElementById('btn-pause-join');
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      AutoJoinerController.getInstance().pause();
    };
  }

  const resumeBtn = shadowRoot.getElementById('btn-resume-join');
  if (resumeBtn) {
    resumeBtn.onclick = () => {
      AutoJoinerController.getInstance().resume();
    };
  }

  const stopBtn = shadowRoot.getElementById('btn-stop-join');
  if (stopBtn) {
    stopBtn.onclick = () => {
      AutoJoinerController.getInstance().stop();
    };
  }
}
