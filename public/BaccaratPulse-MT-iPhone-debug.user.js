// ==UserScript==
// @name         Baccarat Pulse - MT iPhone Outbound Debug Loader
// @namespace    baccarat-pulse
// @version      1.3.0-debug
// @description  Isolated outbound WebSocket capture debug build
// @match        https://liu.tz6868.com/*
// @match        https://*.tz6868.com/*
// @match        https://new-dd-cn.ahsy114.com/*
// @match        https://new-dd-cn.20299999.com/*
// @include      /^https:\/\/new-dd-cn\.[^/?#]+\/.*$/
// @match        https://gsa.ofalive99.net/*
// @match        https://*.ofalive99.net/*
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // Reject unrelated documents before any DOM, timer, network, storage,
  // navigation, or WebSocket side effect occurs.
  const currentHost = String(location.hostname || '').toLowerCase();
  const isAllowedTzHost =
    currentHost === 'tz6868.com' || currentHost.endsWith('.tz6868.com');
  const isAllowedOfaliveHost =
    currentHost === 'ofalive99.net' || currentHost.endsWith('.ofalive99.net');
  const isAllowedDgHost =
    currentHost.startsWith('new-dd-cn.') &&
    currentHost.length > 'new-dd-cn.'.length &&
    !currentHost.includes('..');
  if (!isAllowedTzHost && !isAllowedOfaliveHost && !isAllowedDgHost) {
    return;
  }

  // Earliest standalone execution checkpoint. Deliberately independent of
  // body, DOMContentLoaded, storage, network, Runtime, and MT hooks.
  try {
    const installLoaderBootProbe = function () {
      try {
        const root = document.documentElement;
        if (!root) return false;
        let marker = document.getElementById('__bp_loader_boot_probe__');
        if (!marker) {
          marker = document.createElement('div');
          marker.id = '__bp_loader_boot_probe__';
          marker.textContent = 'BP LOADER BOOT';
          marker.style.cssText = 'position:fixed;top:10px;left:10px;z-index:2147483647;background:#165dff;color:#fff;border:3px solid #b8d1ff;border-radius:10px;padding:10px 14px;font:700 16px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.6);';
          root.appendChild(marker);
        }
        return true;
      } catch (_) {
        return false;
      }
    };
    if (!installLoaderBootProbe()) {
      const bootProbeStartedAt = Date.now();
      const bootProbeTimer = setInterval(function () {
        if (installLoaderBootProbe() || Date.now() - bootProbeStartedAt >= 5000) {
          clearInterval(bootProbeTimer);
        }
      }, 25);
    }
  } catch (_) {}

  // Debug-only execution probe. It is intentionally independent of Runtime,
  // MT/DG launch hooks, storage, and network requests. Cross-origin popup
  // contexts can report only sanitized origin/path and boolean checkpoints to
  // their opener; no payload or URL query/hash is transmitted.
  const DG_EXECUTION_PROBE_MESSAGE = 'BaccaratPulseDGExecutionProbeV1';
  const DG_EXECUTION_PROBE_MARKER_ID = '__bp_dg_execution_probe__';
  const dgExecutionProbeLocation = () => {
    try {
      const url = new URL(location.href);
      return { origin: url.origin, pathname: url.pathname || '/' };
    } catch (_) {
      return { origin: '', pathname: '/' };
    }
  };
  const showDgExecutionProbe = detail => {
    try {
      const root = document.documentElement;
      if (!root) return;
      let marker = document.getElementById(DG_EXECUTION_PROBE_MARKER_ID);
      if (!marker) {
        marker = document.createElement('div');
        marker.id = DG_EXECUTION_PROBE_MARKER_ID;
        marker.style.cssText = 'position:fixed;right:8px;top:8px;z-index:2147483646;background:#5b2a86;color:#fff;border:2px solid #fff;border-radius:8px;padding:7px 9px;font:700 11px/1.3 -apple-system,BlinkMacSystemFont,sans-serif;white-space:pre-wrap;max-width:260px;';
        root.appendChild(marker);
      }
      marker.textContent = [
        'DG EXECUTION PROBE',
        `LOADER IN DG: ${detail.inDg ? (detail.loader === false ? 'NO' : 'YES') : 'PENDING'}`,
        `RUNTIME IN DG: ${detail.runtime ? 'YES' : 'PENDING'}`,
        `DG OBSERVER INSTALLED: ${detail.observer ? 'YES' : 'PENDING'}`,
        `DG EARLY BRIDGE INSTALLED: ${detail.earlyBridge ? 'YES' : 'PENDING'}`
      ].join('\n');
    } catch (_) {}
  };
  const sendDgExecutionProbe = detail => {
    const inTz = (() => {
      try {
        const host = String(location.hostname || '').toLowerCase();
        return host === 'tz6868.com' || host.endsWith('.tz6868.com');
      } catch (_) { return false; }
    })();
    const payload = {
      type: DG_EXECUTION_PROBE_MESSAGE,
      detail: {
        ...dgExecutionProbeLocation(),
        inDg: !inTz,
        loader: true,
        runtime: Boolean(detail?.runtime),
        observer: Boolean(detail?.observer),
        earlyBridge: Boolean(detail?.earlyBridge),
        isTop: (() => { try { return window.top === window; } catch (_) { return false; } })()
      }
    };
    showDgExecutionProbe(payload.detail);
    try {
      if (window.opener && window.opener !== window) window.opener.postMessage(payload, '*');
    } catch (_) {}
  };
  try { window.__bp_dg_execution_probe__ = true; } catch (_) {}
  window.addEventListener('message', event => {
    try {
      const message = event?.data;
      if (!message || message.type !== DG_EXECUTION_PROBE_MESSAGE || !message.detail) return;
      const detail = {
        inDg: Boolean(message.detail.inDg),
        loader: Boolean(message.detail.loader),
        runtime: Boolean(message.detail.runtime),
        observer: Boolean(message.detail.observer),
        earlyBridge: Boolean(message.detail.earlyBridge)
      };
      showDgExecutionProbe(detail);
    } catch (_) {}
  });
  try { sendDgExecutionProbe({}); } catch (_) {}

  const RUNTIME_URL =
    'https://baccarat-pulse-dg-formal-test-5f978b0.onrender.com/BaccaratPulse-MT-runtime-debug.js';

  const LOADER_KEY =
    '__BACCARAT_PULSE_LOADER_DEBUG_V130__';

  const RUNTIME_KEY =
    '__BACCARAT_PULSE_RUNTIME_DEBUG_V032__';

  const EARLY_STATE_KEY =
    '__BP_MT_EARLY_WS_DEBUG_V130__';

  const EARLY_EVENT_NAME =
    'bp-mt-early-ws-debug-v130';

  const RECORD_PROBE_SEND_EVENT = 'BaccaratPulseEarlyRecordProbeSend';
  const RECORD_PROBE_STATUS_EVENT = 'BaccaratPulseRecordProbeStatus';
  const RECORD_PROBE_LOADER_STATUS_MESSAGE = 'BaccaratPulseRecordProbeLoaderStatus';
  const RECORD_PROBE_LOADER_REQUEST_MESSAGE = 'BaccaratPulseRecordProbeLoaderRequest';
  const RECORD_PROBE_RESPONSE_MESSAGE = 'BaccaratPulseRecordProbeResponse';
  const RECORD_PROBE_RESPONSE_EVENT = 'BaccaratPulseRecordProbeResponse';
  const LOADER_FRAME_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const DG_LOADER_CONTINUITY_KEY = '__BP_DG_LOADER_CONTINUITY_V1__';
  const DG_LOADER_CONTINUITY_LIMIT = 16;
  const DG_CANONICAL_OWNER_SAVE = 'BaccaratPulseDGCanonicalSaveV1';
  const DG_CANONICAL_OWNER_REQUEST = 'BaccaratPulseDGCanonicalRequestV1';
  const DG_CANONICAL_OWNER_RESPONSE = 'BaccaratPulseDGCanonicalResponseV1';
  const DG_CANONICAL_OWNER_VERSION = 1;
  const DG_CANONICAL_OWNER_MAX_ENTRIES = 8;
  const DG_CANONICAL_OWNER_MAX_ROUNDS = 96;
  const DG_CANONICAL_OWNER_MAX_SERIALIZED = 65536;
  const TZ_DEBUG_EXPORT_VERSION = 'tz-debug-canonical-owner-v1';
  const DG_LOADER_ROLE = (() => {
    try {
      if (window.top !== window) return 'child';
      if (window.opener && window.opener !== window) return 'dg-popup';
      return 'launcher';
    } catch (_) {
      return 'unknown';
    }
  })();
  const dgLoaderContinuityState = {
    loaderInstanceId: LOADER_FRAME_ID,
    role: DG_LOADER_ROLE,
    popupGeneration: 0,
    evidence: [],
    popupRefs: new Map(),
    launchCorrelationId: null,
    lastLaunchKey: null
  };
  const dgCanonicalOwnerState = { registry: new Map(), evidence: [], activePopupId: null, activePopupRef: null };
  const dgCanonicalOwnerFingerprint = value => {
    const text = String(value ?? '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  };
  const dgCanonicalOwnerRecord = (event, detail = {}) => {
    const safe = {
      timestamp: Date.now(),
      loaderInstanceId: dgLoaderContinuityState.loaderInstanceId,
      role: dgLoaderContinuityState.role,
      popupGeneration: dgLoaderContinuityState.popupGeneration,
      activePopupId: dgCanonicalOwnerState.activePopupId,
      event: String(event || '').slice(0, 48),
      tableId: detail.tableId == null ? null : String(detail.tableId).slice(0, 32),
      shoeIdentity: detail.shoeIdentity == null ? null : String(detail.shoeIdentity).slice(0, 80),
      roundCount: Number.isInteger(detail.roundCount) ? detail.roundCount : null,
      hit: detail.hit == null ? null : Boolean(detail.hit),
      sourceAccepted: detail.sourceAccepted == null ? null : Boolean(detail.sourceAccepted),
      reason: detail.reason == null ? null : String(detail.reason).slice(0, 120)
    };
    if (detail.popupId != null) safe.popupIdFingerprint = dgCanonicalOwnerFingerprint(detail.popupId);
    if (detail.requestId != null) safe.requestIdFingerprint = dgCanonicalOwnerFingerprint(detail.requestId);
    if (detail.runtimeInstanceId != null) safe.runtimeInstanceId = String(detail.runtimeInstanceId).slice(0, 80);
    dgCanonicalOwnerState.evidence.push(safe);
    if (dgCanonicalOwnerState.evidence.length > 64) dgCanonicalOwnerState.evidence.splice(0, dgCanonicalOwnerState.evidence.length - 64);
  };
  const dgCanonicalOwnerExport = () => ({
    version: 'dg-loader-canonical-owner-v1',
    loaderInstanceId: dgLoaderContinuityState.loaderInstanceId,
    role: dgLoaderContinuityState.role,
    popupGeneration: dgLoaderContinuityState.popupGeneration,
    activePopupId: dgCanonicalOwnerState.activePopupId,
    registrySummary: Array.from(dgCanonicalOwnerState.registry.values()).map(v => ({ tableId: v.tableId, shoeIdentity: v.shoeIdentity, roundCount: v.canonicalRounds.length })).slice(-DG_CANONICAL_OWNER_MAX_ENTRIES),
    evidence: dgCanonicalOwnerState.evidence.slice(-64).map(item => ({ ...item }))
  });
  const dgCanonicalOwnerKey = (tableId, shoe) => `${String(tableId)}|${String(shoe)}`;
  const dgCanonicalOwnerValidate = snapshot => {
    if (!snapshot || snapshot.version !== DG_CANONICAL_OWNER_VERSION) return null;
    const tableId = String(snapshot.tableId || ''), shoeIdentity = String(snapshot.shoeIdentity || '');
    if (!/^\d+$/.test(tableId) || !/^\d+$/.test(shoeIdentity) || !Array.isArray(snapshot.canonicalRounds) || snapshot.canonicalRounds.length > DG_CANONICAL_OWNER_MAX_ROUNDS) return null;
    const rounds = snapshot.canonicalRounds.map(item => {
      if (!item || !String(item.roundIdentity || '') || !Array.isArray(item.result) || item.result.length < 4 || item.result.length > 6) return null;
      const result = item.result.slice(0, 6).map(v => v == null ? null : Number(v));
      if (result.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 52))) return null;
      return { roundIdentity: String(item.roundIdentity), roundIndex: Number(item.roundIndex), result, cards: Array.isArray(item.cards) ? item.cards.slice(0, 6).map(Number) : result.filter(v => Number.isInteger(v)), outcome: item.outcome || null, complete: true };
    });
    if (rounds.some(v => !v) || new Set(rounds.map(v => v.roundIdentity)).size !== rounds.length) return null;
    const out = { version: DG_CANONICAL_OWNER_VERSION, tableId, shoeIdentity, canonicalRounds: rounds };
    return JSON.stringify(out).length <= DG_CANONICAL_OWNER_MAX_SERIALIZED ? out : null;
  };
  const dgCanonicalOwnerSourceAllowed = source => {
    if (dgLoaderContinuityState.role !== 'launcher' || !source) return false;
    return source === dgCanonicalOwnerState.activePopupRef;
  };
  const dgLoaderContinuitySafeOrigin = () => {
    try { return String(location.origin || ''); } catch (_) { return ''; }
  };
  const dgLoaderContinuityOpaqueId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const dgLoaderContinuitySnapshot = () => ({
    version: 'dg-loader-continuity-v1',
    loaderInstanceId: dgLoaderContinuityState.loaderInstanceId,
    role: dgLoaderContinuityState.role,
    popupGeneration: dgLoaderContinuityState.popupGeneration,
    evidence: dgLoaderContinuityState.evidence.map(item => ({ ...item }))
  });
  const dgLoaderContinuityRecord = (event, detail = {}) => {
    if (dgLoaderContinuityState.role !== 'launcher') return null;
    const popupRef = detail.popupRef || null;
    const popupId = detail.popupId ?? null;
    const popupClosed = detail.popupClosed === undefined
      ? (popupRef ? (() => { try { return Boolean(popupRef.closed); } catch (_) { return true; } })() : null)
      : Boolean(detail.popupClosed);
    const evidence = {
      timestamp: Date.now(),
      loaderInstanceId: dgLoaderContinuityState.loaderInstanceId,
      role: 'launcher',
      event: String(event || 'UNKNOWN').slice(0, 64),
      popupGeneration: dgLoaderContinuityState.popupGeneration,
      popupPresent: detail.popupPresent === undefined ? Boolean(popupRef || popupId !== null) : Boolean(detail.popupPresent),
      popupClosed,
      safeOrigin: dgLoaderContinuitySafeOrigin()
    };
    if (detail.launchCorrelationId) evidence.launchCorrelationId = String(detail.launchCorrelationId).slice(0, 64);
    dgLoaderContinuityState.evidence.push(evidence);
    if (dgLoaderContinuityState.evidence.length > DG_LOADER_CONTINUITY_LIMIT) {
      dgLoaderContinuityState.evidence.splice(0, dgLoaderContinuityState.evidence.length - DG_LOADER_CONTINUITY_LIMIT);
    }
    return evidence;
  };
  const dgLoaderContinuityObserve = (stage, detail = {}) => {
    if (dgLoaderContinuityState.role !== 'launcher') return;
    const popupId = detail.popupId ?? null;
    if (stage === 'WINDOW_OPEN_RESULT' && detail.popupCreated && detail.popupRef) {
      const previous = dgLoaderContinuityState.popupRefs.get(popupId);
      if (previous !== detail.popupRef) {
        dgLoaderContinuityState.popupRefs.clear();
        dgLoaderContinuityState.popupRefs.set(popupId, detail.popupRef);
        dgLoaderContinuityState.popupGeneration += 1;
      }
      dgCanonicalOwnerState.activePopupId = popupId;
      dgCanonicalOwnerState.activePopupRef = detail.popupRef;
      dgLoaderContinuityRecord('POPUP_CAPTURED', {
        popupRef: detail.popupRef,
        popupId,
        popupPresent: true,
        popupClosed: false
      });
      return;
    }
    if (stage === 'DG_OWNER_SELECTED') {
      const launchKey = `${popupId ?? 'none'}:${detail.popupRef ? 'ref' : 'none'}`;
      if (dgLoaderContinuityState.lastLaunchKey === launchKey) return;
      const reopening = dgLoaderContinuityState.lastLaunchKey !== null;
      dgLoaderContinuityState.lastLaunchKey = launchKey;
      dgLoaderContinuityState.launchCorrelationId = dgLoaderContinuityOpaqueId('dg-launch');
      if (reopening) dgLoaderContinuityRecord('DG_REOPEN_STARTED', {
        popupRef: detail.popupRef,
        popupId,
        popupPresent: Boolean(detail.popupExists),
        popupClosed: detail.popupClosed,
        launchCorrelationId: dgLoaderContinuityState.launchCorrelationId
      });
      dgLoaderContinuityRecord('DG_LAUNCH_STARTED', {
        popupRef: detail.popupRef,
        popupId,
        popupPresent: Boolean(detail.popupExists),
        popupClosed: detail.popupClosed,
        launchCorrelationId: dgLoaderContinuityState.launchCorrelationId
      });
      return;
    }
    if (stage === 'DG_NATIVE_NAV_OK' || stage === 'DG_FALLBACK_NAV_LEFT_TZ') {
      dgLoaderContinuityRecord('DG_POPUP_NAVIGATED', {
        popupId,
        popupRef: dgLoaderContinuityState.popupRefs.get(popupId) || null,
        popupPresent: Boolean(detail.popupExists),
        popupClosed: detail.popupClosed
      });
      return;
    }
    if ((stage === 'DG_POPUP_CLOSED_AFTER_NAV' || stage === 'DG_POPUP_UNAVAILABLE') && detail.popupClosed) {
      dgLoaderContinuityRecord('POPUP_CLOSED_OBSERVED', {
        popupId,
        popupRef: dgLoaderContinuityState.popupRefs.get(popupId) || null,
        popupPresent: Boolean(detail.popupExists),
        popupClosed: true
      });
    }
  };
  try {
    window[DG_LOADER_CONTINUITY_KEY] = {
      version: 'dg-loader-continuity-v1',
      loaderInstanceId: dgLoaderContinuityState.loaderInstanceId,
      role: dgLoaderContinuityState.role,
      getSnapshot: dgLoaderContinuitySnapshot,
      getEvidence: () => dgLoaderContinuitySnapshot().evidence,
      exportJson: () => JSON.stringify({ continuity: dgLoaderContinuitySnapshot(), canonicalOwner: dgCanonicalOwnerExport() })
    };
  } catch (_) {}
  dgLoaderContinuityRecord('LOADER_INIT', { popupPresent: false, popupClosed: null });

  window.addEventListener('message', event => {
    try {
      const m = event.data; if (!m || typeof m !== 'object') return;
      const isOwnerMessage = m.type === DG_CANONICAL_OWNER_SAVE || m.type === DG_CANONICAL_OWNER_REQUEST;
      if (!isOwnerMessage) return;
      const sourceAccepted = dgCanonicalOwnerSourceAllowed(event.source);
      if (!sourceAccepted) {
        dgCanonicalOwnerRecord(m.type === DG_CANONICAL_OWNER_SAVE ? 'SAVE_REJECT' : 'REQUEST', {
          tableId: m.tableId || m.snapshot?.tableId || null,
          shoeIdentity: m.shoeIdentity || m.snapshot?.shoeIdentity || null,
          sourceAccepted: false,
          reason: 'source-not-active-popup',
          requestId: m.requestId,
          runtimeInstanceId: m.runtimeInstanceId
        });
        return;
      }
      if (m.type === DG_CANONICAL_OWNER_SAVE) {
        const v = dgCanonicalOwnerValidate(m.snapshot), key = v && dgCanonicalOwnerKey(v.tableId, v.shoeIdentity);
        if (!v || (dgCanonicalOwnerState.registry.size >= DG_CANONICAL_OWNER_MAX_ENTRIES && !dgCanonicalOwnerState.registry.has(key))) {
          dgCanonicalOwnerRecord('SAVE_REJECT', { sourceAccepted: true, reason: !v ? 'snapshot-validation-failed' : 'registry-cap', runtimeInstanceId: m.runtimeInstanceId });
          return;
        }
        dgCanonicalOwnerState.registry.set(key, v);
        dgCanonicalOwnerRecord('SAVE_ACCEPT', { tableId: v.tableId, shoeIdentity: v.shoeIdentity, roundCount: v.canonicalRounds.length, sourceAccepted: true, runtimeInstanceId: m.runtimeInstanceId });
        return;
      }
      const tableId = String(m.tableId || ''), shoeIdentity = String(m.shoeIdentity || '');
      const key = dgCanonicalOwnerKey(tableId, shoeIdentity), v = dgCanonicalOwnerState.registry.get(key) || null;
      dgCanonicalOwnerRecord('REQUEST', { tableId, shoeIdentity, hit: Boolean(v), sourceAccepted: true, requestId: m.requestId, runtimeInstanceId: m.runtimeInstanceId });
      event.source.postMessage({ type: DG_CANONICAL_OWNER_RESPONSE, requestId: String(m.requestId || '').slice(0, 120), snapshot: v }, '*');
      dgCanonicalOwnerRecord('RESPONSE_SENT', { tableId, shoeIdentity, roundCount: v ? v.canonicalRounds.length : null, hit: Boolean(v), sourceAccepted: true, requestId: m.requestId, runtimeInstanceId: m.runtimeInstanceId });
    } catch (_) {}
  });

  const MAX_ATTEMPTS = 8;
  const RETRY_DELAYS =
    [0, 120, 300, 700, 1200, 2000, 3500, 5000];

  function installEarlyBridge() {
    const source =
      '(' +
      function (
        stateKey,
        eventName,
        recordProbeSendEvent,
        recordProbeStatusEvent,
        recordProbeStatusMessage,
        recordProbeRequestMessage,
        recordProbeResponseMessage,
        recordProbeResponseEvent,
        loaderFrameId
      ) {
        try { window.__bp_dg_execution_probe__ = true; } catch (_) {}
        if (window[stateKey]?.installed) {
          return;
        }

        const NativeWebSocket =
          window.WebSocket;
        const recordProbeSockets = new Set();
        const recordProbeSeen = new Set();
        const recordProbeClaims = new Set();
        const recordProbePending = new Map();
        const recordProbeInbound = [];
        const pulseRecordPendingMarkers = [];
        const PULSE_RECORD_MARKER_LIMIT = 32;
        const PULSE_RECORD_MARKER_TTL_MS = 3000;
        let activeProbeRequestId = '';
        let activeProbeId = '';
        let activeHydrationId = '';
        const isTop = window.top === window;
        const safeSocketPath = value => { try { return new URL(String(value || ''), location.href).pathname || '/'; } catch (_) { return '/'; } };
        const stableProbeHash = value => {
          const text = String(value ?? '');
          let hash = 2166136261;
          for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
        };
        const recordActionFingerprint = payload => {
          const data = payload?.action?.data || {};
          return stableProbeHash(JSON.stringify({
            method: String(payload?.method || '').toUpperCase(),
            action: String(payload?.action?.name || ''),
            tableId: data.table_id ?? data.tableId ?? null,
            shoe: data.shoe ?? null,
            round: data.round ?? null
          }));
        };
        const prunePulseRecordMarkers = now => {
          for (let index = pulseRecordPendingMarkers.length - 1; index >= 0; index -= 1) {
            if (now - pulseRecordPendingMarkers[index].createdAt > PULSE_RECORD_MARKER_TTL_MS) pulseRecordPendingMarkers.splice(index, 1);
          }
          if (pulseRecordPendingMarkers.length > PULSE_RECORD_MARKER_LIMIT) pulseRecordPendingMarkers.splice(0, pulseRecordPendingMarkers.length - PULSE_RECORD_MARKER_LIMIT);
        };
        const markPulseRecordPacket = (payload, detail) => {
          const now = Date.now();
          prunePulseRecordMarkers(now);
          const data = payload?.action?.data || {};
          pulseRecordPendingMarkers.push({
            createdAt: now,
            fingerprint: recordActionFingerprint(payload),
            tableId: data.table_id ?? data.tableId ?? null,
            shoe: data.shoe ?? null,
            round: data.round ?? null,
            packetRequestId: detail?.packetRequestId || detail?.requestId || null,
            probeId: detail?.probeId || null,
            hydrationId: detail?.hydrationId || null,
            consumed: false
          });
          prunePulseRecordMarkers(now);
        };
        const consumePulseRecordMarker = payload => {
          const now = Date.now();
          prunePulseRecordMarkers(now);
          const fingerprint = recordActionFingerprint(payload);
          const marker = pulseRecordPendingMarkers.find(item => !item.consumed && item.fingerprint === fingerprint);
          if (!marker) return null;
          marker.consumed = true;
          const index = pulseRecordPendingMarkers.indexOf(marker);
          if (index >= 0) pulseRecordPendingMarkers.splice(index, 1);
          return marker;
        };
        const emitRecordProbeStatus = (stage, detail = {}) => {
          const telemetry = { frameId: loaderFrameId, hydrationId: detail.hydrationId || activeHydrationId || null, probeId: detail.probeId || activeProbeId || null, packetRequestId: detail.packetRequestId || detail.requestId || activeProbeRequestId || null, requestId: detail.packetRequestId || detail.requestId || activeProbeRequestId || null, isTopWindow: isTop, pathname: safeSocketPath(location.href), loaderInstalled: true, capturedGameSocketCount: recordProbeSockets.size, openGameSocketCount: Array.from(recordProbeSockets).filter(value => value && value.readyState === NativeWebSocket.OPEN).length, probeId: detail.probeId || null, packetRequestId: detail.packetRequestId || activeProbeRequestId || null, probeRequestReceived: Boolean(detail.probeRequestReceived), probeRelayed: Boolean(detail.probeRelayed), probeClaimed: Boolean(detail.probeClaimed), probeSent: Boolean(detail.probeSent), stage, inboundObservation: detail.inboundObservation || null, recordOutboundSourceEvidence: detail.recordOutboundSourceEvidence || null, readyState: detail.readyState ?? null, url: detail.url ? safeSocketPath(detail.url) : '', requestedShoe: detail.requestedShoe ?? null, requestedRound: detail.requestedRound ?? null };
          try { window.dispatchEvent(new CustomEvent(recordProbeStatusEvent, { detail: telemetry })); } catch (_) {}
          if (!isTop) { try { window.top.postMessage({ type: recordProbeStatusMessage, telemetry }, '*'); } catch (_) {} }
        };
        const observeRecordProbeInbound = (text, socketUrl) => {
          if (!recordProbePending.size || recordProbeInbound.length >= 100) return;
          let root = null;
          try { root = JSON.parse(String(text || '')); } catch (_) { return; }
          if (!root || typeof root !== 'object') return;
          const sensitive = /token|cookie|authorization|auth|session|password|member|account|phone|email|license|balance/i;
          const observation = {
            timestamp: Date.now(),
            probeId: activeProbeId || null,
            packetRequestIdsPending: Array.from(recordProbePending.keys()).slice(0, 20),
            wsPath: safeSocketPath(socketUrl),
            topLevelKeys: Object.keys(root).filter(key => !sensitive.test(key)).slice(0, 50),
            actionNameCandidates: [],
            methodCandidates: [],
            payloadKeys: [],
            msgKeys: [],
            bodyKeys: [],
            gameKeys: [],
            discoveredShoeValues: [],
            discoveredRoundValues: [],
            discoveredResultTypes: [],
            discoveredNames: []
          };
          const add = (key, value, limit = 30) => { if (value === null || value === undefined || sensitive.test(key)) return; const list = observation[key]; if (!Array.isArray(list) || list.length >= limit) return; const safe = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value).slice(0, 160) : value; if (!list.includes(safe)) list.push(safe); };
          const queue = [{ value: root, depth: 0 }];
          const seen = new WeakSet();
          while (queue.length) {
            const { value, depth } = queue.shift();
            if (!value || typeof value !== 'object' || seen.has(value) || depth > 6) continue;
            seen.add(value);
            const keys = Object.keys(value).filter(key => !sensitive.test(key)).slice(0, 80);
            if (value === root) {}
            if (value.payload && typeof value.payload === 'object') observation.payloadKeys = keysOf(value.payload, sensitive);
            if (value.msg && typeof value.msg === 'object') observation.msgKeys = keysOf(value.msg, sensitive);
            if (value.body && typeof value.body === 'object') observation.bodyKeys = keysOf(value.body, sensitive);
            if (value.game && typeof value.game === 'object') observation.gameKeys = keysOf(value.game, sensitive);
            for (const key of keys) {
              const child = value[key];
              if (/^(name|actionName)$/i.test(key) && (typeof child === 'string' || typeof child === 'number')) add('actionNameCandidates', child);
              if (/^method$/i.test(key) && (typeof child === 'string' || typeof child === 'number')) add('methodCandidates', child);
              if (/^shoe(?:_id|Id)?$/i.test(key)) add('discoveredShoeValues', child);
              if (/^round(?:_number|Number)?$/i.test(key)) add('discoveredRoundValues', child);
              if (/^result$/i.test(key)) add('discoveredResultTypes', Array.isArray(child) ? 'array' : typeof child);
              if (/^name$/i.test(key) && typeof child === 'string') add('discoveredNames', child);
              if (child && typeof child === 'object' && depth < 6) queue.push({ value: child, depth: depth + 1 });
            }
          }
          recordProbeInbound.push(observation);
          emitRecordProbeStatus('record-inbound-observed', { probeId: activeProbeId, inboundObservation: observation });
        };
        const keysOf = (value, sensitive) => Object.keys(value || {}).filter(key => !sensitive.test(key)).slice(0, 50);

        const observeRecordProbeResponse = async (text, socketUrl) => {
          if (recordProbePending.size === 0) return;
          let payload = null;
          try { payload = JSON.parse(String(text || '')); } catch (_) { return; }
          const game = payload?.msg?.game || payload?.payload?.msg?.game || payload?.body?.game || null;
          if (!game || typeof game !== 'object' || typeof game.result !== 'string') return;
          const response = { actionName: typeof payload?.action?.name === 'string' ? payload.action.name : '', responseShoe: game.shoe ?? null, responseRound: game.round ?? null, responseResult: game.result, responseName: typeof game.name === 'string' ? game.name : null };
          const match = Array.from(recordProbePending.entries()).find(([, item]) => Number(item.requestedShoe) === Number(response.responseShoe) && Number(item.requestedRound) === Number(response.responseRound));
          if (!match) return;
          emitRecordProbeStatus('record-response-observed', { url: socketUrl, ...response });
          const [packetRequestId, pending] = match;
          recordProbePending.delete(packetRequestId);
          const relay = { ...response, hydrationId: pending.hydrationId || activeHydrationId || null, probeId: pending.probeId || null, packetRequestId, requestedShoe: pending.requestedShoe, requestedRound: pending.requestedRound };
          emitRecordProbeStatus('record-response-matched', relay);
          const message = { type: recordProbeResponseMessage, response: relay };
          try {
            if (pending.sourceWindow && pending.sourceWindow !== window) pending.sourceWindow.postMessage(message, '*');
            else window.dispatchEvent(new CustomEvent(recordProbeResponseEvent, { detail: relay }));
            emitRecordProbeStatus('record-response-relayed', relay);
          } catch (_) {}
        };

        const broadcastProbeRequest = (detail, sourceWindow = null) => {
          const requestId = String(detail?.packetRequestId || detail?.requestId || '');
          if (!requestId || recordProbeSeen.has(requestId)) return;
          activeProbeRequestId = requestId;
          activeProbeId = String(detail?.probeId || activeProbeId || '');
          activeHydrationId = String(detail?.hydrationId || activeHydrationId || '');
          recordProbeSeen.add(requestId);
          emitRecordProbeStatus('probe-request-received', { requestId, probeId: detail.probeId, packetRequestId: requestId, probeRequestReceived: true, requestedShoe: detail.requestedShoe, requestedRound: detail.requestedRound });
          let localSent = false;
          for (const serializedPacket of Array.isArray(detail?.packets) ? detail.packets : []) {
            let payload = null; try { payload = JSON.parse(String(serializedPacket)); } catch (_) {}
            const exact = payload?.method === 'GET' && /^\/api\/v1\/gametype\/[^/]+\/game\/[^/]+\/record$/i.test(String(payload?.action?.name || ''));
            if (!exact || !payload?.action?.data || typeof payload.action.data !== 'object') continue;
            const socket = Array.from(recordProbeSockets).find(value => value && /\/game\/ws/i.test(String(value.url || '')) && value.readyState === NativeWebSocket.OPEN);
            if (!socket || recordProbeClaims.has(requestId)) continue;
            recordProbeClaims.add(requestId); localSent = true;
            recordProbePending.set(requestId, { hydrationId: detail.hydrationId || activeHydrationId || null, probeId: detail.probeId || null, requestedShoe: payload.action.data.shoe, requestedRound: payload.action.data.round, sourceWindow: sourceWindow || null });
            emitRecordProbeStatus('game-socket-found', { probeId: detail.probeId, packetRequestId: requestId, probeClaimed: true, readyState: Number(socket.readyState), url: socket.url, requestedShoe: payload.action.data.shoe, requestedRound: payload.action.data.round });
            markPulseRecordPacket(payload, { ...detail, packetRequestId: requestId });
            try { socket.send(String(serializedPacket)); emitRecordProbeStatus('record-request-sent', { probeId: detail.probeId, packetRequestId: requestId, probeSent: true, requestedShoe: payload.action.data.shoe, requestedRound: payload.action.data.round }); } catch (_) { emitRecordProbeStatus('record-request-send-failed', { requestedShoe: payload.action.data.shoe, requestedRound: payload.action.data.round }); }
          }
          if (!localSent) {
            if (isTop) { for (const frame of Array.from(document.querySelectorAll('iframe'))) { try { if (frame.contentWindow && frame.contentWindow !== sourceWindow) frame.contentWindow.postMessage({ type: recordProbeRequestMessage, detail }, '*'); } catch (_) {} } emitRecordProbeStatus('probe-relayed', { probeRelayed: true, requestedShoe: detail.requestedShoe, requestedRound: detail.requestedRound }); setTimeout(() => { if (!recordProbeClaims.has(requestId)) emitRecordProbeStatus('socket-missing', { requestedShoe: detail.requestedShoe, requestedRound: detail.requestedRound }); }, 500); }
            else { try { window.top.postMessage({ type: recordProbeRequestMessage, detail }, '*'); emitRecordProbeStatus('probe-relayed', { probeRelayed: true, requestedShoe: detail.requestedShoe, requestedRound: detail.requestedRound }); } catch (_) {} }
          }
        };

        if (
          typeof NativeWebSocket !== 'function'
        ) {
          return;
        }

        const state =
          window[stateKey] = {
            installed: true,
            created: 0,
            messages: []
          };

        async function normalizeRaw(raw) {
          if (
            typeof raw === 'string'
          ) {
            return raw;
          }

          if (
            raw instanceof Blob
          ) {
            try {
              return await raw.text();
            } catch (_) {
              return '';
            }
          }

          if (
            raw instanceof ArrayBuffer
          ) {
            try {
              return new TextDecoder()
                .decode(
                  new Uint8Array(raw)
                );
            } catch (_) {
              return '';
            }
          }

          if (
            ArrayBuffer.isView(raw)
          ) {
            try {
              return new TextDecoder()
                .decode(
                  new Uint8Array(
                    raw.buffer,
                    raw.byteOffset,
                    raw.byteLength
                  )
                );
            } catch (_) {
              return '';
            }
          }

          return '';
        }

        function observeRecordOutboundSource(parsed) {
          if (!parsed || parsed.method !== 'GET' || !/^\/api\/v1\/gametype\/[^/]+\/game\/[^/]+\/record$/i.test(String(parsed.action?.name || ''))) return;
          const data = parsed.action?.data && typeof parsed.action.data === 'object' ? parsed.action.data : {};
          const marker = consumePulseRecordMarker(parsed);
          emitRecordProbeStatus('record-outbound-source-observed', {
            recordOutboundSourceEvidence: {
              timestamp: Date.now(),
              direction: 'outbound',
              source: 'existing-game-websocket-send',
              actionFingerprint: recordActionFingerprint(parsed),
              tableIdPresent: data.table_id !== undefined || data.tableId !== undefined,
              tableIdValue: data.table_id ?? data.tableId ?? null,
              shoe: data.shoe ?? null,
              round: data.round ?? null,
              isPulseGeneratedProbe: Boolean(marker),
              pulseMarkerMatched: Boolean(marker),
              pulseProbeIdPresent: Boolean(marker?.probeId),
              pulsePacketRequestIdPresent: Boolean(marker?.packetRequestId),
              pulseHydrationIdPresent: Boolean(marker?.hydrationId),
              matchedVerifiedDgTableId: null,
              dgVerifiedTableId: null
            }
          });
        }
        function emitOutbound(url, raw) {
          let parsed = null;
          try { parsed = JSON.parse(raw); } catch (_) {}
          observeRecordOutboundSource(parsed);
          emit({
            timestamp: Date.now(),
            wsUrl: String(url || ''),
            direction: 'outbound',
            raw,
            parsed
          });
        }

        function emit(item) {
          // Keep a small startup buffer so Runtime can drain packets that
          // arrived while its remote script was still downloading.
          state.messages.push(item);

          if (state.messages.length > 250) {
            state.messages.splice(
              0,
              state.messages.length - 250
            );
          }

          window.dispatchEvent(
            new CustomEvent(
              eventName,
              {
                detail: item
              }
            )
          );
        }

        const sendPatchKey =
          '__BP_MT_DEBUG_NATIVE_SEND_PATCH_V130__';

        if (!NativeWebSocket.prototype[sendPatchKey]) {
          const nativeSend =
            NativeWebSocket.prototype.send;

          const captureSend =
            function (data) {
              try {
                if (typeof data === 'string') {
                  emitOutbound(this.url, data);
                } else if (data instanceof ArrayBuffer) {
                  emitOutbound(
                    this.url,
                    new TextDecoder().decode(new Uint8Array(data))
                  );
                } else if (ArrayBuffer.isView(data)) {
                  emitOutbound(
                    this.url,
                    new TextDecoder().decode(
                      new Uint8Array(
                        data.buffer,
                        data.byteOffset,
                        data.byteLength
                      )
                    )
                  );
                } else if (data instanceof Blob) {
                  void data.text()
                    .then(text => emitOutbound(this.url, text))
                    .catch(() => {});
                }
              } catch (_) {}

              return nativeSend.call(this, data);
            };

          Object.defineProperty(
            captureSend,
            'name',
            { value: 'send' }
          );

          NativeWebSocket.prototype.send =
            captureSend;

          Object.defineProperty(
            NativeWebSocket.prototype,
            sendPatchKey,
            { value: true }
          );
        }

        class BPEarlyWebSocket
          extends NativeWebSocket {

          constructor(
            url,
            protocols
          ) {
            super(
              url,
              protocols
            );

            state.created += 1;
            const socketUrl = String(this.url || url || '');
            if (/\/game\/ws/i.test(socketUrl)) { recordProbeSockets.add(this); const remove = () => recordProbeSockets.delete(this); this.addEventListener('close', remove, { once: true }); this.addEventListener('error', remove, { once: true }); }

            this.addEventListener(
              'message',
              async event => {
                const text =
                  await normalizeRaw(
                    event.data
                  );

                if (!text) {
                  return;
                }
                if (recordProbePending.size > 0) {
                  void observeRecordProbeResponse(text, socketUrl);
                }
                emit({
                  raw: text,
                  showPoker:
                    /show_poker/i
                      .test(text),
                  tableSvg:
                    /tablesvg/i
                      .test(text)
                });
              }
            );
          }
        }

        window.addEventListener(recordProbeSendEvent, event => broadcastProbeRequest(event.detail || {}, null));
        window.addEventListener('message', event => {
          if (event.data?.type === recordProbeResponseMessage && event.data.response) {
            try { window.dispatchEvent(new CustomEvent(recordProbeResponseEvent, { detail: event.data.response })); } catch (_) {}
            return;
          }
          if (event.data?.type === recordProbeStatusMessage && event.data.telemetry) {
            const telemetry = event.data.telemetry;
            if (telemetry.probeClaimed && telemetry.requestId) {
              recordProbeClaims.add(String(telemetry.requestId));
              if (isTop) {
                for (const frame of Array.from(document.querySelectorAll('iframe'))) {
                  try { frame.contentWindow?.postMessage({ type: recordProbeStatusMessage, telemetry }, '*'); } catch (_) {}
                }
              }
            }
            try { window.dispatchEvent(new CustomEvent(recordProbeStatusEvent, { detail: telemetry })); } catch (_) {}
            return;
          }
          if (event.data?.type === recordProbeRequestMessage) broadcastProbeRequest(event.data.detail || {}, event.source || null);
        });

        Object.defineProperties(
          BPEarlyWebSocket,
          {
            CONNECTING: {
              value: NativeWebSocket.CONNECTING
            },
            OPEN: {
              value: NativeWebSocket.OPEN
            },
            CLOSING: {
              value: NativeWebSocket.CLOSING
            },
            CLOSED: {
              value: NativeWebSocket.CLOSED
            }
          }
        );

        window.WebSocket =
          BPEarlyWebSocket;

      } +
      ')(' +
      JSON.stringify(EARLY_STATE_KEY) +
      ',' + JSON.stringify(EARLY_EVENT_NAME) +
      ',' + JSON.stringify(RECORD_PROBE_SEND_EVENT) +
      ',' + JSON.stringify(RECORD_PROBE_STATUS_EVENT) +
      ',' + JSON.stringify(RECORD_PROBE_LOADER_STATUS_MESSAGE) +
      ',' + JSON.stringify(RECORD_PROBE_LOADER_REQUEST_MESSAGE) +
      ',' + JSON.stringify(RECORD_PROBE_RESPONSE_MESSAGE) +
      ',' + JSON.stringify(RECORD_PROBE_RESPONSE_EVENT) +
      ',' + JSON.stringify(LOADER_FRAME_ID) +
      ');';

    const script =
      document.createElement(
        'script'
      );

    script.textContent =
      source;

    (
      document.documentElement ||
      document.head ||
      document.body
    ).appendChild(script);

    script.remove();
  }

  // This MUST run before any remote fetch. This is the whole point of v1.3.0:
  // beat MT's early new WebSocket(setWebSocketApiUrl()) call.
  try {
    installEarlyBridge();
  } catch (error) {
    console.error(
      '[Baccarat Pulse] Early bridge install failed',
      error
    );
  }

 const previous =
   window[LOADER_KEY];

 const loaderAlreadyStarted = Boolean(
   previous?.started ||
   previous?.loaded
 );

 const state =
   loaderAlreadyStarted
     ? previous
     : window[LOADER_KEY] = {
         started: true,
         loaded: false,
         attempts: 0,
         timer: null,
         watchdog: null,
         injecting: false
       };

  function parentForScript() {
    return (
      document.head ||
      document.documentElement ||
      document.body ||
      null
    );
  }

  function runtimeReady() {
    return Boolean(
      window[RUNTIME_KEY]
    );
  }

  function clearStartupTimers() {
    if (state.timer !== null) {
      clearTimeout(state.timer);
      state.timer = null;
    }

    if (state.watchdog !== null) {
      clearTimeout(state.watchdog);
      state.watchdog = null;
    }
  }

  function finish(loaded) {
    state.injecting = false;
    clearStartupTimers();

    if (
      loaded ||
      runtimeReady()
    ) {
      state.loaded = true;
      console.log(
        '[Baccarat Pulse] Runtime loaded'
      );
    }
  }

  function schedule(attempt) {
    if (
      state.loaded ||
      runtimeReady() ||
      attempt >= MAX_ATTEMPTS
    ) {
      clearStartupTimers();

      if (runtimeReady()) {
        state.loaded = true;
      }

      return;
    }

    if (
      state.timer !== null ||
      state.injecting
    ) {
      return;
    }

    state.attempts =
      attempt + 1;

    const delay =
      RETRY_DELAYS[
        Math.min(
          attempt,
          RETRY_DELAYS.length - 1
        )
      ];

    state.timer =
      setTimeout(
        () => {
          state.timer = null;
          inject(attempt);
        },
        delay
      );
  }

  function inject(attempt) {
    if (
      state.loaded ||
      runtimeReady()
    ) {
      finish(true);
      return;
    }

    if (state.injecting) {
      return;
    }

    const parent =
      parentForScript();

    if (!parent) {
      schedule(attempt + 1);
      return;
    }

    state.injecting = true;

    const script =
      document.createElement(
        'script'
      );

    script.src =
      RUNTIME_URL +
      '?t=' +
      Date.now();

    script.async = false;

    script.dataset.baccaratPulseRuntime =
      'true';

    let settled = false;

    const settle =
      loaded => {
        if (settled) {
          return;
        }

        settled = true;
        state.injecting = false;

        if (
          loaded ||
          runtimeReady()
        ) {
          finish(true);
          return;
        }

        try {
          script.remove();
        } catch (_) {}

        console.error(
          '[Baccarat Pulse] Runtime load failed; retrying'
        );

        schedule(attempt + 1);
      };

    script.onload =
      () => {
        setTimeout(
          () =>
            settle(
              runtimeReady()
            ),
          0
        );
      };

    script.onerror =
      () => settle(false);

    try {
      parent.appendChild(script);

      state.watchdog =
        setTimeout(
          () => {
            state.watchdog = null;
            settle(
              runtimeReady()
            );
          },
          1500
        );

    } catch (error) {
      console.error(
        '[Baccarat Pulse] Runtime injection failed',
        error
      );

      settle(false);
    }
  }

  function start() {
    if (
      state.loaded ||
      runtimeReady()
    ) {
      finish(true);
      return;
    }

    if (
      state.injecting ||
      state.timer !== null
    ) {
      return;
    }

    inject(0);
  }

 if (!loaderAlreadyStarted) {
   start();

   document.addEventListener(
     'DOMContentLoaded',
     start,
     { once: true }
   );

   window.addEventListener(
     'load',
     start,
     { once: true }
   );
 }
  // ============================================================
  // TZ GAME LAUNCH DEBUG
  // ============================================================
  const TZ_DEBUG_STORE = '__BP_TZ_GAME_LAUNCH_DEBUG__';
  const TZ_DEBUG_EVENT = '__BP_TZ_GAME_LAUNCH_EVENT__';
  const TZ_FRAME_MESSAGE = '__BP_TZ_GAME_LAUNCH_FRAME_EVENT__';
  const TZ_FRAME_ID = LOADER_FRAME_ID;
  const TZ_IS_TOP = window.top === window;
  const TZ_FRAME_PATHNAME = (() => { try { return location.pathname || '/'; } catch (_) { return '/'; } })();
  const TZ_FRAME_READY_STATE = document.readyState || 'loading';
  let tzDebugButton = null;
  let tzActiveLaunchTrace = [];
  const TZ_TRACE_STAGES = new Set([
    'WINDOW_OPEN_CALLED',
    'WINDOW_OPEN_RESULT',
    'MT_LOGIN_START',
    'MT_OWNER_SELECTED',
    'MT_OWNER_NO_LOCAL_POPUP',
    'MT_LOGIN_RESPONSE',
    'MT_GAME_URL_READY',
    'MT_NATIVE_NAV_OK',
    'MT_POPUP_CROSS_ORIGIN',
    'MT_FALLBACK_NAV_ATTEMPT',
    'MT_FALLBACK_NAV_LEFT_TZ',
    'MT_FALLBACK_NAV_STILL_STUCK',
    'MT_POPUP_UNAVAILABLE',
    'MT_POPUP_CLOSED_AFTER_NAV',
    'DG_OWNER_SELECTED',
    'DG_OWNER_NO_LOCAL_POPUP',
    'DG_LOGIN_START',
    'DG_LOGIN_RESPONSE',
    'DG_GAME_URL_READY',
    'DG_FALLBACK_ASSIGN_START',
    'DG_FALLBACK_ASSIGN_OK',
    'DG_FALLBACK_ASSIGN_THROW',
    'DG_FALLBACK_PRE_STATE',
    'DG_FALLBACK_POST_STATE',
    'DG_VERIFY_STATE',
    'DG_SECOND_WINDOW_OPEN',
    'DG_NATIVE_NAV_OK',
    'DG_POPUP_CROSS_ORIGIN',
    'DG_FALLBACK_NAV_ATTEMPT',
    'DG_FALLBACK_NAV_LEFT_TZ',
    'DG_FALLBACK_NAV_STILL_STUCK',
    'DG_POPUP_UNAVAILABLE',
    'DG_POPUP_CLOSED_AFTER_NAV'
  ]);
  const TZ_FAILURE_STAGES = new Set([
    'MT_FALLBACK_NAV_STILL_STUCK',
    'MT_POPUP_UNAVAILABLE',
    'MT_POPUP_CLOSED_AFTER_NAV',
    'DG_FALLBACK_NAV_STILL_STUCK',
    'DG_POPUP_UNAVAILABLE',
    'DG_POPUP_CLOSED_AFTER_NAV'
  ]);
  const TZ_SENSITIVE_KEY = /token|cookie|authorization|auth|session|password|member|account|phone|email|license|balance|game[_-]url|^gameUrl$|^popupRef$/i;

  function sanitizeTZValue(value, key = '') {
    if (TZ_SENSITIVE_KEY.test(String(key || ''))) return undefined;
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      let result = value.replace(/[?#].*$/, '');
      result = result.replace(/(bearer\s+)[^\s]+/ig, '$1[redacted]');
      return result.slice(0, 300);
    }
    if (Array.isArray(value)) return value.map(item => sanitizeTZValue(item)).filter(item => item !== undefined).slice(0, 100);
    if (typeof value === 'object') {
      const result = {};
      for (const [childKey, childValue] of Object.entries(value)) {
        const safe = sanitizeTZValue(childValue, childKey);
        if (safe !== undefined) result[childKey] = safe;
      }
      return result;
    }
    return value;
  }

  function tzDebugRead() {
    try {
      const raw = JSON.parse(localStorage.getItem(TZ_DEBUG_STORE) || '[]');
      return Array.isArray(raw) ? raw.map(item => sanitizeTZValue(item) || {}).slice(-100) : [];
    } catch (_) {
      return [];
    }
  }

  function tzTraceEntry(stage, detail = {}) {
    const safe = sanitizeTZValue(detail) || {};
    return {
      stage: String(stage || 'UNKNOWN').slice(0, 80),
      status: safe.status ?? null,
      elapsed: safe.elapsed ?? safe.ms ?? null,
      popupExists: safe.popupExists ?? null,
      popupClosed: safe.popupClosed ?? null,
      gameUrlExists: safe.gameUrlExists ?? safe.exists ?? null
    };
  }

  function tzTraceText(trace) {
    return trace.map((item, index) => {
      const status = item.status === null || item.status === undefined ? '-' : item.status;
      const elapsed = item.elapsed === null || item.elapsed === undefined ? '-' : item.elapsed + 'ms';
      const popupExists = item.popupExists === null || item.popupExists === undefined ? '-' : String(Boolean(item.popupExists));
      const popupClosed = item.popupClosed === null || item.popupClosed === undefined ? '-' : String(Boolean(item.popupClosed));
      const gameUrlExists = item.gameUrlExists === null || item.gameUrlExists === undefined ? '-' : String(Boolean(item.gameUrlExists));
      return `${index + 1}. ${item.stage} | status=${status} | elapsed=${elapsed} | popupExists=${popupExists} | popupClosed=${popupClosed} | gameUrlExists=${gameUrlExists}`;
    }).join('\n');
  }

  function tzCopyText(text, targetWindow) {
    try {
      const clipboard = targetWindow?.navigator?.clipboard;
      if (clipboard && typeof clipboard.writeText === 'function') {
        const result = clipboard.writeText(text);
        if (result && typeof result.catch === 'function') result.catch(() => {});
        return true;
      }
    } catch (_) {}
    try {
      const doc = targetWindow.document;
      const area = doc.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'true');
      area.style.cssText = 'position:fixed;left:-9999px;top:0;';
      (doc.body || doc.documentElement).appendChild(area);
      area.select();
      doc.execCommand('copy');
      area.remove();
      return true;
    } catch (_) {
      return false;
    }
  }

  function showTZResultBox(trace, targetWindow = window) {
    const safeTrace = trace.map(item => tzTraceEntry(item.stage, item));
    const text = tzTraceText(safeTrace);
    const failureStage = safeTrace[safeTrace.length - 1]?.stage || 'NAVIGATION_FAILURE';
    let doc;
    try { doc = targetWindow.document; } catch (_) { return false; }
    const mount = () => {
      try {
        const parent = doc.body || doc.documentElement;
        if (!parent) return false;
        let box = doc.getElementById('__bp_tz_debug_result_box__');
        if (!box) {
          box = doc.createElement('section');
          box.id = '__bp_tz_debug_result_box__';
          box.style.cssText = 'position:fixed;left:10px;right:10px;top:10px;z-index:2147483647;background:#3b0710;color:#fff;border:3px solid #ff375f;border-radius:12px;padding:14px;box-shadow:0 4px 24px rgba(0,0,0,.65);font:14px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;';
          parent.appendChild(box);
        }
        box.textContent = '';
        const title = doc.createElement('strong');
        title.textContent = 'Baccarat Pulse Debug：MT 導航結果';
        title.style.cssText = 'display:block;font-size:17px;margin-bottom:8px;';
        box.appendChild(title);
        const status = doc.createElement('div');
        status.textContent = '最終狀態：' + failureStage;
        status.style.cssText = 'font-weight:bold;margin-bottom:8px;';
        box.appendChild(status);
        const pre = doc.createElement('pre');
        pre.textContent = text || '目前沒有 launch trace';
        pre.style.cssText = 'white-space:pre-wrap;word-break:break-word;max-height:42vh;overflow:auto;margin:0 0 10px;background:#21040a;padding:8px;border-radius:6px;';
        box.appendChild(pre);
        const copy = doc.createElement('button');
        copy.type = 'button';
        copy.textContent = '複製 Debug 紀錄';
        copy.style.cssText = 'background:#fff;color:#8b1028;border:0;border-radius:8px;padding:9px 12px;font-weight:bold;';
        copy.onclick = () => {
          const copied = tzCopyText(text, targetWindow);
          copy.textContent = copied ? '已複製 Debug 紀錄' : '複製失敗，請長按選取';
        };
        box.appendChild(copy);
        return true;
      } catch (_) { return false; }
    };
    if (mount()) return true;
    try {
      if (!doc.__BP_TZ_DEBUG_RESULT_PENDING__) {
        doc.__BP_TZ_DEBUG_RESULT_PENDING__ = true;
        doc.addEventListener('DOMContentLoaded', () => {
          doc.__BP_TZ_DEBUG_RESULT_PENDING__ = false;
          mount();
        }, { once: true });
      }
    } catch (_) {}
    return false;
  }

  function tzDebugLog(stage, detail = {}, fromCoordinator = false) {
    try {
      const stageName = String(stage || 'UNKNOWN').slice(0, 80);
      dgLoaderContinuityObserve(stageName, detail);
      const safeDetail = sanitizeTZValue(detail) || {};
      const frameMeta = {
        frameId: safeDetail.frameId || TZ_FRAME_ID,
        isTop: safeDetail.isTop ?? TZ_IS_TOP,
        pathname: safeDetail.pathname || TZ_FRAME_PATHNAME,
        readyState: safeDetail.readyState || TZ_FRAME_READY_STATE
      };
      if (!TZ_IS_TOP && !fromCoordinator) {
        try { window.top.postMessage({ type: TZ_FRAME_MESSAGE, detail: { stage: stageName, ...safeDetail, ...frameMeta } }, '*'); } catch (_) {}
        return;
      }
      const logs = tzDebugRead();
      const safeForStorage = { ...safeDetail, ...frameMeta };
      logs.push({ time: new Date().toISOString(), stage: stageName, ...safeForStorage });
      if (logs.length > 100) logs.splice(0, logs.length - 100);
      localStorage.setItem(TZ_DEBUG_STORE, JSON.stringify(logs));
      if (stageName === 'WINDOW_OPEN_CALLED' || stageName === 'DG_OWNER_SELECTED' || (stageName === 'MT_OWNER_SELECTED' && tzActiveLaunchTrace.some(item => item.stage === 'MT_LOGIN_START'))) tzActiveLaunchTrace = [];
      if (TZ_TRACE_STAGES.has(stageName)) {
        tzActiveLaunchTrace.push(tzTraceEntry(stageName, safeForStorage));
        if (tzActiveLaunchTrace.length > 30) tzActiveLaunchTrace.splice(0, tzActiveLaunchTrace.length - 30);
      }
      console.log('[BP TZ DEBUG]', stageName, safeForStorage);
      tzDebugUpdateButton();
      if (TZ_FAILURE_STAGES.has(stageName) || stageName === 'MT_OWNER_NO_LOCAL_POPUP' || (stageName === 'MT_LOGIN_RESPONSE' && detail.ok === false)) {
        showTZResultBox(tzActiveLaunchTrace, window);
        try {
          const popup = detail?.popupRef;
          if (popup && !popup.closed) showTZResultBox(tzActiveLaunchTrace, popup);
        } catch (_) {}
      }
    } catch (_) {}
  }

  if (TZ_IS_TOP) {
    window.addEventListener('message', event => {
      try {
        const payload = event?.data;
        if (!payload || payload.type !== TZ_FRAME_MESSAGE || !payload.detail) return;
        tzDebugLog(payload.detail.stage || 'UNKNOWN', payload.detail, true);
      } catch (_) {}
    });
  }

  function tzDebugUpdateButton() {
    if (!tzDebugButton) return;
    tzDebugButton.textContent = 'TZ DEBUG (' + tzDebugRead().length + ')';
  }

  function installTZLaunchDebug() {
    window.addEventListener(TZ_DEBUG_EVENT, event => {
      const detail = event.detail || {};
      tzDebugLog(detail.stage || 'UNKNOWN', detail);
    });

    const source = '(' + function (eventName, frameId, isTop, pathname, readyState) {
      if (window.__BP_TZ_GAME_LAUNCH_HOOK__) return;
      window.__BP_TZ_GAME_LAUNCH_HOOK__ = true;

      const emit = (stage, detail = {}) => {
        try {
          window.dispatchEvent(new CustomEvent(eventName, { detail: { stage, frameId, isTop, pathname, readyState, ...detail } }));
        } catch (_) {}
      };
      const safeUrl = value => {
        try {
          const u = new URL(String(value || ''), location.href);
          return u.origin + u.pathname;
        } catch (_) {
          return String(value || '').split('?')[0].split('#')[0].slice(0, 300);
        }
      };
      const pathnameOf = value => {
        try { return new URL(String(value || ''), location.href).pathname || '/'; } catch (_) { return String(value || '').split('?')[0].split('#')[0]; }
      };
      const isLogin = value => /\/v2\/game\/[^/]+\/login/i.test(pathnameOf(value));
      const isMtLogin = value => /^(?:\/api)?\/v2\/game\/MTLI\/login\/?$/i.test(pathnameOf(value));
      const isDgLogin = value => /^(?:\/api)?\/v2\/game\/DGLI\/login\/?$/i.test(pathnameOf(value));
      const popupHost = value => {
        try { return new URL(String(value || ''), location.href).hostname.toLowerCase(); } catch (_) { return ''; }
      };
      const isTargetHost = host => host === 'gsa.ofalive99.net' || host.endsWith('.ofalive99.net');
      const isTzContext = value => {
        const raw = String(value || '');
        if (!raw || raw === 'about:blank') return true;
        const host = popupHost(raw);
        return host === 'tz6868.com' || host.endsWith('.tz6868.com');
      };
      const popupClosed = popup => {
        try { return !popup || Boolean(popup.closed); } catch (_) { return true; }
      };
      let popupIdCounter = 0;
      const popupIds = new WeakMap();
      const getPopupId = popup => {
        if (!popup || (typeof popup !== 'object' && typeof popup !== 'function')) return null;
        try {
          if (!popupIds.has(popup)) popupIds.set(popup, ++popupIdCounter);
          return popupIds.get(popup);
        } catch (_) {
          return null;
        }
      };
      const observePopupState = (popup, popupId) => {
        const closed = popupClosed(popup);
        const base = { popupId: popupId ?? null, popupClosed: closed };
        if (closed) return { ...base, locationRead: 'unavailable' };
        try {
          const href = String(popup.location.href || '');
          const url = new URL(href, location.href);
          return {
            ...base,
            locationRead: 'same-origin',
            sameOriginTz: isTzContext(href),
            aboutBlank: href === 'about:blank',
            originPath: url.origin + (url.pathname || '/')
          };
        } catch (_) {
          return { ...base, locationRead: 'cross-origin' };
        }
      };
      const parseData = response => {
        try {
          if (response && response.responseType === 'json') return response.response;
          return JSON.parse(response?.responseText || '');
        } catch (_) { return null; }
      };
      const extractGameUrl = data => data?.data?.game_url || data?.game_url || '';
      const responseCodeSuccess = data => {
        const code = data?.code ?? data?.statusCode ?? data?.data?.code;
        if (code === undefined || code === null || code === '') return true;
        return code === true || ['0', '200', 'success', 'ok'].includes(String(code).toLowerCase());
      };

      let latestPopup = null;
      let activeMtLaunch = null;
      let activeDgLaunch = null;

      const emitMtLoginStart = () => {
        const launch = {
          popup: latestPopup,
          gameUrl: '',
          fallbackAttempted: false,
          nativeTimer: null,
          verifyTimer: null,
          started: performance.now()
        };
        activeMtLaunch = launch;
        emit('MT_OWNER_SELECTED', {
          status: 'owner',
          elapsed: 0,
          popupExists: Boolean(launch.popup),
          popupClosed: popupClosed(launch.popup),
          gameUrlExists: false
        });
        if (!launch.popup) emit('MT_OWNER_NO_LOCAL_POPUP', { popupExists: false, popupClosed: true, gameUrlExists: false });
        emit('MT_LOGIN_START', {
          status: 'started',
          elapsed: 0,
          gameUrlExists: false,
          popupExists: Boolean(launch.popup),
          popupClosed: popupClosed(launch.popup)
        });
        return launch;
      };

      const inspectNativeNavigation = (launch, afterFallback) => {
        if (!launch || launch !== activeMtLaunch) return;
        if (popupClosed(launch.popup)) {
          emit(afterFallback ? 'MT_POPUP_CLOSED_AFTER_NAV' : 'MT_POPUP_UNAVAILABLE', {
            popupExists: Boolean(launch.popup), popupClosed: true, popupRef: launch.popup
          });
          return;
        }
        let href = '';
        try {
          href = String(launch.popup.location.href || '');
        } catch (_) {
          emit('MT_POPUP_CROSS_ORIGIN', { popupExists: true, popupClosed: false });
          return;
        }
        const host = popupHost(href);
        if (isTargetHost(host)) {
          emit(afterFallback ? 'MT_FALLBACK_NAV_LEFT_TZ' : 'MT_NATIVE_NAV_OK', { popupExists: true, popupClosed: false });
          return;
        }
        if (!afterFallback && !isTzContext(href)) {
          emit('MT_NATIVE_NAV_OK', { popupExists: true, popupClosed: false });
          return;
        }
        if (!afterFallback && !launch.fallbackAttempted) {
          launch.fallbackAttempted = true;
          try {
            launch.popup.location.href = launch.gameUrl;
            emit('MT_FALLBACK_NAV_ATTEMPT', { popupExists: true, popupClosed: false });
          } catch (_) {
            emit('MT_FALLBACK_NAV_STILL_STUCK', { popupExists: true, popupClosed: false, popupRef: launch.popup });
            return;
          }
          launch.verifyTimer = setTimeout(() => inspectNativeNavigation(launch, true), 1200);
          return;
        }
        emit('MT_FALLBACK_NAV_STILL_STUCK', { popupExists: true, popupClosed: false, popupRef: launch.popup });
      };

      const handleMtLoginResponse = (launch, status, data, started) => {
        const gameUrl = extractGameUrl(data);
        const httpOk = Number(status) >= 200 && Number(status) < 300;
        const ok = httpOk && responseCodeSuccess(data) && Boolean(gameUrl);
        emit('MT_LOGIN_RESPONSE', {
          status: Number(status || 0),
          elapsed: Math.max(0, Math.round(performance.now() - started)),
          gameUrlExists: Boolean(gameUrl),
          popupExists: Boolean(launch?.popup),
          popupClosed: popupClosed(launch?.popup),
          ok
        });
        if (!ok || !launch || launch !== activeMtLaunch) return;
        launch.gameUrl = String(gameUrl);
        emit('MT_GAME_URL_READY', {
          status: Number(status || 0),
          elapsed: Math.max(0, Math.round(performance.now() - launch.started)),
          gameUrlExists: true,
          popupExists: Boolean(launch.popup),
          popupClosed: popupClosed(launch.popup)
        });
        if (!launch.popup) {
          emit('MT_OWNER_NO_LOCAL_POPUP', { popupExists: false, popupClosed: true, gameUrlExists: true });
          return;
        }
        launch.nativeTimer = setTimeout(() => inspectNativeNavigation(launch, false), 1000);
      };

      const emitDgLoginStart = () => {
        const launch = {
          popup: latestPopup,
          popupId: getPopupId(latestPopup),
          gameUrl: '',
          fallbackAttempted: false,
          fallbackVerified: false,
          nativeTimer: null,
          verifyTimer: null,
          started: performance.now()
        };
        activeDgLaunch = launch;
        emit('DG_OWNER_SELECTED', {
          status: 'owner',
          elapsed: 0,
          popupId: launch.popupId,
          popupExists: Boolean(launch.popup),
          popupClosed: popupClosed(launch.popup),
          gameUrlExists: false
        });
        if (!launch.popup) emit('DG_OWNER_NO_LOCAL_POPUP', { popupExists: false, popupClosed: true, gameUrlExists: false });
        emit('DG_LOGIN_START', {
          status: 'started',
          elapsed: 0,
          gameUrlExists: false,
          popupExists: Boolean(launch.popup),
          popupClosed: popupClosed(launch.popup)
        });
        return launch;
      };

      const inspectDgNavigation = (launch, afterFallback) => {
        if (!launch || launch !== activeDgLaunch) return;
        if (afterFallback) launch.fallbackVerified = true;
        if (popupClosed(launch.popup)) {
          if (afterFallback) emit('DG_VERIFY_STATE', {
            ...observePopupState(launch.popup, launch.popupId),
            phase: 'after-fallback'
          });
          emit(afterFallback ? 'DG_POPUP_CLOSED_AFTER_NAV' : 'DG_POPUP_UNAVAILABLE', {
            popupId: launch.popupId,
            popupExists: Boolean(launch.popup), popupClosed: true
          });
          return;
        }
        if (afterFallback) emit('DG_VERIFY_STATE', {
          ...observePopupState(launch.popup, launch.popupId),
          phase: 'after-fallback'
        });
        let href = '';
        try {
          href = String(launch.popup.location.href || '');
        } catch (_) {
          emit('DG_POPUP_CROSS_ORIGIN', { popupExists: true, popupClosed: false });
          return;
        }
        if (!isTzContext(href)) {
          emit(afterFallback ? 'DG_FALLBACK_NAV_LEFT_TZ' : 'DG_NATIVE_NAV_OK', { popupExists: true, popupClosed: false });
          return;
        }
        if (!afterFallback && !launch.fallbackAttempted) {
          launch.fallbackAttempted = true;
          const elapsed = Math.max(0, Math.round(performance.now() - launch.started));
          emit('DG_FALLBACK_ASSIGN_START', {
            popupId: launch.popupId,
            popupExists: Boolean(launch.popup),
            popupClosed: popupClosed(launch.popup),
            elapsed,
            attemptNumber: 1
          });
          emit('DG_FALLBACK_PRE_STATE', {
            ...observePopupState(launch.popup, launch.popupId),
            elapsed
          });
          try {
            launch.popup.location.href = launch.gameUrl;
            emit('DG_FALLBACK_ASSIGN_OK', {
              popupId: launch.popupId,
              popupExists: Boolean(launch.popup),
              popupClosed: popupClosed(launch.popup),
              elapsed: Math.max(0, Math.round(performance.now() - launch.started)),
              attemptNumber: 1
            });
            emit('DG_FALLBACK_POST_STATE', {
              ...observePopupState(launch.popup, launch.popupId),
              elapsed: Math.max(0, Math.round(performance.now() - launch.started))
            });
            emit('DG_FALLBACK_NAV_ATTEMPT', { popupId: launch.popupId, popupExists: true, popupClosed: false });
          } catch (_) {
            launch.fallbackVerified = true;
            emit('DG_FALLBACK_ASSIGN_THROW', {
              popupId: launch.popupId,
              popupExists: Boolean(launch.popup),
              popupClosed: popupClosed(launch.popup),
              elapsed: Math.max(0, Math.round(performance.now() - launch.started)),
              attemptNumber: 1
            });
            emit('DG_FALLBACK_NAV_STILL_STUCK', { popupId: launch.popupId, popupExists: true, popupClosed: false });
            return;
          }
          launch.verifyTimer = setTimeout(() => inspectDgNavigation(launch, true), 1200);
          return;
        }
        emit('DG_FALLBACK_NAV_STILL_STUCK', { popupId: launch.popupId, popupExists: true, popupClosed: false });
      };

      const handleDgLoginResponse = (launch, status, data, started) => {
        const gameUrl = extractGameUrl(data);
        const httpOk = Number(status) >= 200 && Number(status) < 300;
        const ok = httpOk && responseCodeSuccess(data) && Boolean(gameUrl);
        emit('DG_LOGIN_RESPONSE', {
          status: Number(status || 0),
          elapsed: Math.max(0, Math.round(performance.now() - started)),
          gameUrlExists: Boolean(gameUrl),
          popupExists: Boolean(launch?.popup),
          popupClosed: popupClosed(launch?.popup),
          ok
        });
        if (!ok || !launch || launch !== activeDgLaunch) return;
        launch.gameUrl = String(gameUrl);
        emit('DG_GAME_URL_READY', {
          status: Number(status || 0),
          elapsed: Math.max(0, Math.round(performance.now() - launch.started)),
          gameUrlExists: true,
          popupExists: Boolean(launch.popup),
          popupClosed: popupClosed(launch.popup)
        });
        if (!launch.popup) {
          emit('DG_POPUP_UNAVAILABLE', { popupExists: false, popupClosed: true, gameUrlExists: true });
          return;
        }
        launch.nativeTimer = setTimeout(() => inspectDgNavigation(launch, false), 1000);
      };

      // ----------------------------
      // window.open: observe only; bind the popup to MT at MTLI login time.
      // ----------------------------
      try {
        const nativeWindowOpen = window.open;
        window.open = function (...args) {
          emit('WINDOW_OPEN_CALLED', { url: safeUrl(args[0] || '') });
          try {
            const popup = nativeWindowOpen.apply(this, args);
            if (popup) {
              latestPopup = popup;
              const newPopupId = getPopupId(popup);
              emit('WINDOW_OPEN_RESULT', { popupCreated: true, popupId: newPopupId, popupRef: popup });
              if (activeDgLaunch && !activeDgLaunch.fallbackVerified) {
                emit('DG_SECOND_WINDOW_OPEN', {
                  originalPopupId: activeDgLaunch.popupId,
                  newPopupId,
                  elapsed: Math.max(0, Math.round(performance.now() - activeDgLaunch.started))
                });
              }
            } else {
              emit('WINDOW_OPEN_RESULT', { popupCreated: false });
            }
            return popup;
          } catch (error) {
            emit('WINDOW_OPEN_ERROR', { error: String(error?.message || error) });
            throw error;
          }
        };
      } catch (error) {
        emit('WINDOW_OPEN_HOOK_ERROR', { error: String(error?.message || error) });
      }

      // ----------------------------
      // fetch: observe login responses; only MTLI can arm fallback.
      // ----------------------------
      try {
        const nativeFetch = window.fetch;
        if (typeof nativeFetch === 'function') {
          window.fetch = function (input, init) {
            const url = typeof input === 'string' ? input : input?.url;
            if (!isLogin(url)) return nativeFetch.apply(this, arguments);
            const mt = isMtLogin(url);
            const dg = isDgLogin(url);
            const started = performance.now();
            const launch = mt ? emitMtLoginStart() : dg ? emitDgLoginStart() : null;
            emit(mt ? 'LOGIN_FETCH_START' : 'LOGIN_FETCH_START', { url: safeUrl(url) });
            return nativeFetch.apply(this, arguments).then(async response => {
              let data = null;
              try { data = await response.clone().json(); } catch (_) {}
              emit('LOGIN_FETCH_RESPONSE', { status: response.status, ok: response.ok, ms: Math.round(performance.now() - started) });
              if (mt) handleMtLoginResponse(launch, response.status, data, started);
              else if (dg) handleDgLoginResponse(launch, response.status, data, started);
              else emit('GAME_URL_RESULT', { exists: Boolean(extractGameUrl(data)), url: '' });
              return response;
            }).catch(error => {
              emit('LOGIN_FETCH_ERROR', { error: String(error?.message || error), ms: Math.round(performance.now() - started) });
              throw error;
            });
          };
        }
      } catch (error) {
        emit('FETCH_HOOK_ERROR', { error: String(error?.message || error) });
      }

      // ----------------------------
      // XMLHttpRequest/Axios: observe MTLI without changing response or navigation.
      // ----------------------------
      try {
        const XHR = window.XMLHttpRequest;
        if (XHR) {
          const nativeOpen = XHR.prototype.open;
          const nativeSend = XHR.prototype.send;
          XHR.prototype.open = function (method, url) {
            this.__BP_TZ_LOGIN__ = isLogin(url);
            this.__BP_TZ_MT_LOGIN__ = isMtLogin(url);
            this.__BP_TZ_DG_LOGIN__ = isDgLogin(url);
            this.__BP_TZ_LOGIN_URL__ = safeUrl(url);
            return nativeOpen.apply(this, arguments);
          };
          XHR.prototype.send = function () {
            if (!this.__BP_TZ_LOGIN__) return nativeSend.apply(this, arguments);
            const xhr = this;
            const started = performance.now();
            const mt = Boolean(xhr.__BP_TZ_MT_LOGIN__);
            const dg = Boolean(xhr.__BP_TZ_DG_LOGIN__);
            const launch = mt ? emitMtLoginStart() : dg ? emitDgLoginStart() : null;
            emit('LOGIN_XHR_START', { url: xhr.__BP_TZ_LOGIN_URL__ });
            xhr.addEventListener('load', function () {
              const data = parseData(xhr);
              emit('LOGIN_XHR_RESPONSE', { status: Number(xhr.status || 0), ms: Math.round(performance.now() - started) });
              if (mt) handleMtLoginResponse(launch, xhr.status, data, started);
              else if (dg) handleDgLoginResponse(launch, xhr.status, data, started);
              else emit('GAME_URL_RESULT', { exists: Boolean(extractGameUrl(data)), url: '' });
            }, { once: true });
            xhr.addEventListener('error', () => emit('LOGIN_XHR_ERROR', { status: Number(xhr.status || 0), ms: Math.round(performance.now() - started) }), { once: true });
            xhr.addEventListener('timeout', () => emit('LOGIN_XHR_TIMEOUT', { status: Number(xhr.status || 0), ms: Math.round(performance.now() - started) }), { once: true });
            xhr.addEventListener('abort', () => emit('LOGIN_XHR_ABORT', { status: Number(xhr.status || 0), ms: Math.round(performance.now() - started) }), { once: true });
            return nativeSend.apply(this, arguments);
          };
        }
      } catch (error) {
        emit('XHR_HOOK_ERROR', { error: String(error?.message || error) });
      }

      emit('TZ_HOOK_READY', { page: safeUrl(location.href) });
    } + ')(' + [JSON.stringify(TZ_DEBUG_EVENT), JSON.stringify(TZ_FRAME_ID), String(TZ_IS_TOP), JSON.stringify(TZ_FRAME_PATHNAME), JSON.stringify(TZ_FRAME_READY_STATE)].join(',') + ');';

    try {
      const script = document.createElement('script');
      script.textContent = source;
      (document.documentElement || document.head || document.body).appendChild(script);
      script.remove();
      tzDebugLog('TZ_DEBUG_INSTALLED');
      tzDebugLog('FRAME_HOOK_READY', { frameId: TZ_FRAME_ID, isTop: TZ_IS_TOP, pathname: TZ_FRAME_PATHNAME, readyState: document.readyState || TZ_FRAME_READY_STATE });
    } catch (error) {
      tzDebugLog('TZ_DEBUG_INSTALL_ERROR', { error: String(error?.message || error) });
    }
  }

  function tzDebugExportObject(recordGenerated = false) {
    if (recordGenerated && dgLoaderContinuityState.role === 'launcher') {
      dgCanonicalOwnerRecord('EXPORT_GENERATED', {
        registryEntryCount: dgCanonicalOwnerState.registry.size
      });
    }
    const legacyLog = tzDebugRead();
    const exportObject = {
      version: TZ_DEBUG_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      loaderInstanceId: dgLoaderContinuityState.loaderInstanceId,
      role: dgLoaderContinuityState.role,
      frameId: TZ_FRAME_ID,
      dgLoaderContinuity: dgLoaderContinuitySnapshot(),
      canonicalOwner: dgCanonicalOwnerExport(),
      legacyLog
    };
    return exportObject;
  }

  function tzDebugExportText(recordGenerated = false) {
    return JSON.stringify(tzDebugExportObject(recordGenerated), null, 2);
  }

  function tzDebugDownload() {
    try {
      const text = tzDebugExportText(true);
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'TZ-Debug-Canonical-Owner.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (_) {
      return false;
    }
  }

  function createTZDebugButton() {
    if (!document.body) return;
    const existingButton = document.getElementById('__bp_tz_debug_button__');
    if (existingButton) {
      try { existingButton.remove(); } catch (_) {}
    }
    const existingOverlay = document.getElementById('__bp_tz_debug_overlay__');
    if (existingOverlay) {
      try { existingOverlay.remove(); } catch (_) {}
    }
    if (!document.getElementById('__bp_tz_hook_active__')) {
      const active = document.createElement('div');
      active.id = '__bp_tz_hook_active__';
      active.textContent = 'BP TZ HOOK ACTIVE';
      active.style.cssText = 'position:fixed;left:10px;bottom:75px;z-index:2147483647;background:#0a7a35;color:#fff;border:2px solid #8ff0b5;border-radius:18px;padding:8px 12px;font-size:13px;font-weight:bold;box-shadow:0 3px 14px rgba(0,0,0,.45);';
      document.body.appendChild(active);
    }
    tzDebugButton = document.createElement('button');
    tzDebugButton.id = '__bp_tz_debug_button__';
    tzDebugButton.dataset.bpLoaderInstanceId = dgLoaderContinuityState.loaderInstanceId;
    tzDebugButton.dataset.bpDebugVersion = TZ_DEBUG_EXPORT_VERSION;
    tzDebugButton.style.cssText = 'position:fixed;right:10px;bottom:75px;z-index:2147483647;background:#ff2d55;color:white;border:0;border-radius:20px;padding:10px 14px;font-size:13px;font-weight:bold;';
    tzDebugButton.onclick = function () {
      const fullText = tzDebugExportText(false);
      const existing = document.getElementById('__bp_tz_debug_overlay__');
      if (existing) {
        const existingText = existing.querySelector('textarea');
        if (existingText) existingText.value = fullText;
        return;
      }

      const overlay = document.createElement('div');
      overlay.id = '__bp_tz_debug_overlay__';
      overlay.style.cssText = 'position:fixed;inset:5vh 5vw;z-index:2147483647;background:#111;color:#fff;border:3px solid #ff2d55;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px;box-shadow:0 6px 30px rgba(0,0,0,.7);';

      const title = document.createElement('div');
      title.textContent = 'TZ DEBUG 完整紀錄';
      title.style.cssText = 'font-size:16px;font-weight:bold;flex:0 0 auto;';

      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      textarea.readOnly = true;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.cssText = 'width:90vw;max-width:100%;height:65vh;box-sizing:border-box;resize:none;overflow:auto;display:block;background:#000;color:#fff;border:1px solid #aaa;border-radius:6px;padding:8px;font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre;';

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:8px;flex:0 0 auto;';

      const copyButton = document.createElement('button');
      copyButton.textContent = '複製完整 Debug';
      copyButton.style.cssText = 'background:#0a7a35;color:#fff;border:0;border-radius:6px;padding:10px 12px;font-weight:bold;';
      copyButton.onclick = function () {
        const copyFallback = function () {
          textarea.focus();
          textarea.select();
          try { document.execCommand('copy'); } catch (_) {}
        };
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(fullText).catch(copyFallback);
        } else {
          copyFallback();
        }
      };

      const downloadButton = document.createElement('button');
      downloadButton.textContent = '下載完整 Debug';
      downloadButton.style.cssText = 'background:#1565c0;color:#fff;border:0;border-radius:6px;padding:10px 12px;font-weight:bold;';
      downloadButton.onclick = function () {
        const downloaded = tzDebugDownload();
        downloadButton.textContent = downloaded ? '已下載完整 Debug' : '下載失敗';
      };

      const closeButton = document.createElement('button');
      closeButton.textContent = '關閉';
      closeButton.style.cssText = 'background:#555;color:#fff;border:0;border-radius:6px;padding:10px 12px;font-weight:bold;';
      closeButton.onclick = function () { overlay.remove(); };

      actions.appendChild(copyButton);
      actions.appendChild(downloadButton);
      actions.appendChild(closeButton);
      overlay.appendChild(title);
      overlay.appendChild(textarea);
      overlay.appendChild(actions);
      document.body.appendChild(overlay);
    };
    document.body.appendChild(tzDebugButton);
    tzDebugUpdateButton();
  }

  try { installTZLaunchDebug(); } catch (error) { tzDebugLog('TZ_DEBUG_FATAL', { error: String(error?.message || error) }); }

  if (TZ_IS_TOP) {
    const startTZDebugUI = function () {
      createTZDebugButton();
      setInterval(function () {
        if (!document.body) return;
        if (!document.getElementById('__bp_tz_debug_button__')) {
          tzDebugButton = null;
          createTZDebugButton();
        }
      }, 1500);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startTZDebugUI, { once: true });
    else startTZDebugUI();
  }

})();
