// ==UserScript==
// @name         Baccarat Pulse - DG Formal Loader (5f978b0 base)
// @namespace    baccarat-pulse
// @version      1.0.0-dg-5f978b0-candidate
// @description  DG formal candidate based on commit-pinned 5f978b0
// @match        https://liu.tz6868.com/*
// @match        https://*.tz6868.com/*
// @match        https://new-dd-cn.ahsy114.com/*
// @match        https://new-dd-cn.20299999.com/*
// @match        https://gsa.ofalive99.net/*
// @match        https://*.ofalive99.net/*
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  // Candidate provenance: transport/Record Probe logic originates from 5f978b0.


  // Reject unrelated documents before any DOM, timer, network, storage,
  // navigation, or WebSocket side effect occurs.
  const currentHost = String(location.hostname || '').toLowerCase();
  const isAllowedTzHost = false;
  const isAllowedOfaliveHost = false;
  const isAllowedDgHost =
    currentHost.startsWith('new-dd-cn.') &&
    currentHost.length > 'new-dd-cn.'.length &&
    !currentHost.includes('..');
  if (!isAllowedTzHost && !isAllowedOfaliveHost && !isAllowedDgHost) {
    return;
  }

  const RUNTIME_URL =
    'https://baccarat-pulse-panel.onrender.com/BaccaratPulse-DG-formal-5f978b0-runtime.js';

  const LOADER_KEY =
    '__BACCARAT_PULSE_DG_FORMAL_LOADER_5F978B0_V1__';

  const RUNTIME_KEY =
    '__BACCARAT_PULSE_DG_FORMAL_RUNTIME_5F978B0_V1__';

  const EARLY_STATE_KEY =
    '__BP_DG_FORMAL_EARLY_WS_5F978B0_V1__';

  const EARLY_EVENT_NAME =
    'bp-dg-formal-early-ws-5f978b0-v1';

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
})();
