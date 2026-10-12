(function () {
  'use strict';

  if (window.__BACCARAT_PULSE_RUNTIME_DEBUG_V032__) {
    return;
  }

  window.__BACCARAT_PULSE_RUNTIME_DEBUG_V032__ = true;

  let isTopWindow = false;
  try {
    isTopWindow = window.top === window;
  } catch (_) {
    isTopWindow = false;
  }

  // Only the top-level browsing context owns the visible panel and license
  // bootstrap. Child frames remain capture-only and relay rounds upward.
  const UI_OWNER_KEY = '__BACCARAT_PULSE_UI_OWNER_V032__';
  if (isTopWindow) {
    window[UI_OWNER_KEY] = true;
  }

  const EVENT_NAME = 'bp-mt-iphone-ws-runtime-debug-v030';
  const SOCKET_DIAGNOSTICS_EVENT = 'BaccaratPulseSocketDiagnostics';
  const RECORD_PROBE_SEND_EVENT = 'BaccaratPulseRecordProbeSend';
  const EARLY_RECORD_PROBE_SEND_EVENT = 'BaccaratPulseEarlyRecordProbeSend';
  const RECORD_PROBE_LOADER_STATUS_MESSAGE = 'BaccaratPulseRecordProbeLoaderStatus';
  const RECORD_PROBE_RESPONSE_EVENT = 'BaccaratPulseRecordProbeResponse';
  const RECORD_PROBE_RESPONSE_MESSAGE = 'BaccaratPulseRecordProbeResponse';
  const RECORD_PROBE_STATUS_EVENT = 'BaccaratPulseRecordProbeStatus';
  const DG_SOCKET_INSTANCE_MESSAGE = 'BaccaratPulseDgSocketInstanceDebugV1';
  const SOCKET_DIAGNOSTICS_REQUEST = 'BaccaratPulseSocketDiagnosticsRequest';
  const SOCKET_DIAGNOSTICS_RESPONSE = 'BaccaratPulseSocketDiagnosticsResponse';
  const EARLY_EVENT_NAME = 'bp-mt-early-ws-debug-v130';
  const EARLY_STATE_KEY = '__BP_MT_EARLY_WS_DEBUG_V130__';
  const TABLE_CLICK_MESSAGE =
    'BACCARAT_PULSE_LOBBY_GAMEDESK_CLICK_DEBUG_V1';
  const TABLE_CLICK_ACK_MESSAGE =
    'BACCARAT_PULSE_LOBBY_GAMEDESK_CLICK_ACK_DEBUG_V1';
  const PENDING_CLICK_WINDOW_KEY =
    '__BP_PENDING_LOBBY_GAMEDESK_CLICK_DEBUG_V1__';
  const PENDING_CLICK_STORAGE_KEY =
    'baccaratPulse.debug.pendingLobbyGameDeskClick.v1';
  const TABLE_MAPPING_RELAY_MESSAGE =
    'BACCARAT_PULSE_TABLESVG_MAPPING_RELAY_DEBUG_V1';
  const TABLE_MAPPING_ACK_MESSAGE =
    'BACCARAT_PULSE_TABLESVG_MAPPING_ACK_DEBUG_V1';
  const PENDING_MAPPING_WINDOW_KEY =
    '__BP_PENDING_TABLESVG_MAPPING_DEBUG_V1__';
  const PENDING_MAPPING_STORAGE_KEY =
    'baccaratPulse.debug.pendingTablesvgMapping.v1';
  const HANDSHAKE_REQUEST_MESSAGE =
    'BACCARAT_PULSE_ACTIVE_TABLE_HANDSHAKE_REQUEST_V1';
  const HANDSHAKE_REPORT_MESSAGE =
    'BACCARAT_PULSE_ACTIVE_TABLE_HANDSHAKE_REPORT_V1';
  const HANDSHAKE_STORAGE_PREFIX =
    'baccaratPulse.debug.activeTableHandshake.v1.';
  const FRAME_TABLESVG_MESSAGE =
    'BACCARAT_PULSE_FRAME_TABLESVG_DEBUG_V1';
  const HISTORY_CAPTURE_REQUEST_MESSAGE =
    'BACCARAT_PULSE_HISTORY_CAPTURE_REQUEST_V1';
  const HISTORY_CAPTURE_REPORT_MESSAGE =
    'BACCARAT_PULSE_HISTORY_CAPTURE_REPORT_V1';
  const HISTORY_TRANSPORT_EVENT =
    'bp-mt-history-transport-debug-v1';
  const RECORD_PROBE_CONTEXT_MESSAGE =
    'BACCARAT_PULSE_RECORD_PROBE_CONTEXT_DEBUG_V1';
  const RECORD_PROBE_REQUEST_MESSAGE =
    'BACCARAT_PULSE_RECORD_PROBE_REQUEST_DEBUG_V1';
  const RECORD_PROBE_REPORT_MESSAGE =
    'BACCARAT_PULSE_RECORD_PROBE_REPORT_DEBUG_V1';
  const DG_DATA_PROBE_RECORD_MESSAGE =
    'BACCARAT_PULSE_DG_DATA_PROBE_RECORD_DEBUG_V1';
  const DG_ROAD_CANVAS_TEXT_EVENT =
    'BaccaratPulseDgRoadCanvasTextDebugV1';
  const DG_EXECUTION_PROBE_MESSAGE =
    'BaccaratPulseDGExecutionProbeV1';
  const DISCOVERY_FRAME_ID =
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const LICENSE_API =
    'https://baccarat-pulse-panel.onrender.com/api/license/verify';

  const LICENSE_STORAGE_KEY =
    'baccaratPulse.licenseCode.v1';
  const DG_CANONICAL_ROUNDS_STORAGE_KEY =
    'BACCARAT_PULSE_DG_CANONICAL_ROUNDS_V1';
  const DG_LIVE_OUTCOMES_STORAGE_PREFIX =
    'BACCARAT_PULSE_DG_LIVE_OUTCOMES_V1.';
  const DG_STORAGE_MARKER_KEY =
    'BACCARAT_PULSE_DG_STORAGE_MARKER_V1';
  const DG_CANONICAL_ROUNDS_VERSION = 1;
  const DG_CANONICAL_OWNER_SAVE = 'BaccaratPulseDGCanonicalSaveV1';
  const DG_CANONICAL_OWNER_REQUEST = 'BaccaratPulseDGCanonicalRequestV1';
  const DG_CANONICAL_OWNER_RESPONSE = 'BaccaratPulseDGCanonicalResponseV1';
  const DG_CANONICAL_OWNER_VERSION = 1;
  const DG_CANONICAL_ROUNDS_LIMIT = 96;
  const DG_PERSISTENCE_EVIDENCE_LIMIT = 64;
  const DG_STORAGE_MARKER_EVIDENCE_LIMIT = 8;

  const LICENSE_CHECK_INTERVAL = 60 * 1000;
  const LICENSE_REQUEST_TIMEOUT = 12000;

  let licenseValid = false;
  let licenseChecking = false;
  let lastLicenseCheck = 0;
  let licenseExpiresAt = null;
  let licenseSuccessShown = false;
  let startupStarted = false;
  let startupCompleted = false;

  const state = {
    tableId: null,
    shoe: null,
    lastRound: null,
    rounds: new Map(),
    runningCount: 0,
    lastFive: [],
    packetCapture: [],
    resetCapture: [],
    outboundCapture: [],
    tableListRows: [],
    tableListReports: new Map(),
    tableListRequestId: null,
    tableNameToIds: new Map(),
    pendingClickedTableName: null,
    handshakeEvents: [],
    handshakeReports: new Map(),
    handshakeRequestId: null,
    historyCapture: [],
    historyReports: new Map(),
    historyRequestId: null,
    recordProbe: [],
    recordProbeRunning: false,
    recordProbeContext: null,
    nativeRecordRequestEvidence: [],
    recordProbeContextSource: null,
    recordProbeRequestId: null,
    recordProbeReports: new Map(),
    activeTableBootstrap: [],
    tableIdentityRegistry: new Map(),
    modelEstimate: {
      tableId: null,
      shoeIdentity: null,
      candidateRoundCount: null,
      initialCount: null,
      baselineRoundCount: null,
      baselineValue: null,
      liveDelta: 0,
      roadOutcomes: [],
      roadEntries: [],
      roadSnapshotHistory: [],
      pendingRoadSnapshots: [],
      roadHistoryAssociation: { status: 'UNVERIFIED', tableId: null, shoeIdentity: null, liveRoundIdentity: null, winner: null, receivedOrder: [], verifiedAt: 0, recentOutcomes: [] },
      liveOutcomes: [],
      liveOutcomeEvents: [],
      liveOutcomeConflicts: [],
      liveDeltas: [],
      baselineLiveOverlap: [],
      lastRenderedRoadAssociationKey: null,
      lastRoadEvidence: [],
      initialized: false,
      status: 'WAITING_FOR_VERIFIED_ROAD',
      countedRoundKeys: new Set(),
      pending: null
    },
    recordProbeGeneration: 0,
    recordProbeDeadlineTimer: null,
    recordProbeStages: [],
    recordProbeStageContext: {},
    recordProbeLoaderFrames: new Map(),
    recordProbeInboundDuringProbe: [],
    liveResultTrace: [],
    dgPersistence: {
      restoreKey: null,
      restoredRoundKeys: new Set(),
      conflictRoundKeys: new Set()
    },
    dgCanonicalOwner: { requestKey: null, requestId: null, responseAccepted: false, restoredRoundKeys: new Set(), conflictRoundKeys: new Set() },
    recordProbeLastException: null,
    roomEntryBootstrap: { active: false, clickId: null, startedAt: 0, endsAt: 0, before: null, evidence: [], timer: null, joinTableId: null, joinRoomId: null, activeTableIdBefore: null, activeTableIdAfter: null, bootstrapSource: null },
    recordProbeSocketFound: false,
    recordProbeSocketReadyState: null,
    historicalHydrationGeneration: 0,
    historicalHydrationKey: null,
    historicalHydrationRunning: false,
    historicalHydrationId: null,
    historicalHydrationIdKey: null,
    historicalHydrationSequence: 0,
    historicalHydrationTrace: [],
    dragon: {
      signature: null,
      generation: 0,
      status: 'WAIT',
      probability: null,
      count: 0,
      seed: 20260920,
      usedCards: 0,
      remainingCards: 416,
      remainingCounts: null,
      byMargin: { 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      error: null
    },
    pair: {
      signature: null,
      probability: null,
      status: 'WAIT',
      generation: 0,
      error: null
    },
    dg: {
      tableName: null,
      tableId: null,
      tableMap: new Map(),
      lastEnvelopeTableIds: [],
      ownership: {
        tableId: null,
        source: null,
        socketGeneration: null,
        socketIdentity: null,
        runtimeInstanceId: null,
        socketKey: null,
        sequence: 0,
        establishedAt: 0,
        controlField1: null,
        controlField10: null
      },
      pendingControlIdentity: null,
      lifecycle: {
        runtimeInstanceId: DISCOVERY_FRAME_ID,
        activeRuntimeInstanceId: null,
        activeSocketKey: null,
        activeSocketIdentity: null,
        activeSocketGeneration: null,
        adoptionCount: 0,
        retiredRuntimeInstances: new Set()
      },
      rounds: new Map(),
      shoeIdentity: null,
      shoeGeneration: 0,
      lastFrame: null,
      decodedFrames: 0,
      normalizedFrames: 0,
      error: null
    },
    dgDataProbe: {
      records: [],
      sequence: 0,
      dispatchEvidence: [],
      completeCandidates: [],
      initializationCompleteCandidates: [],
      roundEvolution: [],
      objectSelectionEvidence: [],
      largeFrameStructures: [],
      binaryFramingEvidence: [],
      embeddedObjectEvidence: [],
      selectedObjectEvidence: [],
      cardProgressionEvidence: [],
      sharedStateCorrelation: [],
      outboundWebSocketFrameEvidence: [],
      dgCurrentTableUiEvidence: [],
      dgTableSelectionEvidence: [],
      dgTableSelectionCorrelationEvidence: [],
      dgProtocolTransitionEvidence: [],
      dgCardStreamCorrelationEvidence: [],
      dgInboundCardParentEnvelopeEvidence: [],
      dgInboundCardParentEnvelopeFirstSeenEvidence: [],
      dgProtocolUiEvidence: [],
      dgPersistenceEvidence: [],
      dgCanonicalOwnerEvidence: [],
      dgStorageMarkerEvidence: [],
      trustedRoomIdentityEvidence: [],
      recordOutboundSourceEvidence: [],
      dgNativeRoadCommandEvidence: [],
      dgRoadStatEvidence: [],
      dgRoadResultEvidence: [],
      dgRoadObserverDiagnostics: {
        frameId: DISCOVERY_FRAME_ID,
        isTopWindow,
        domInstalled: false,
        domScanCount: 0,
        domNodesScanned: 0,
        domScanLimitHit: false,
        domMatchedCount: 0,
        canvasHookRequested: false,
        canvasHookInstalled: false,
        canvasCallsObserved: 0,
        canvasMatchedCalls: 0,
        canvasCompleteSetCount: 0,
        canvasContextCount: 0,
        canvasLabelCount: 0,
        canvasLabelLikeCount: 0,
        canvasNumericCount: 0,
        canvasPairAcceptedCount: 0,
        canvasPairRejectedReasons: {},
        canvasLabelLikeEvidence: [],
        canvasNumericEvidence: [],
        canvasCorrelationEvidence: [],
        lastReason: 'not-started',
        reasons: []
      },
      backendIdentityAssociationEvidence: [],
      initializationObjectAssociationEvidence: [],
      historicalAssociationEvidence: {
        active: false,
        frozen: false,
        freezeReason: null,
        anchors: [],
        cardObjects: [],
        blocks: [],
        frameKeys: []
      },
      initializationObjectAssociationSummary: {
        frameCount: 0,
        objectCount: 0,
        directObjectTableIdentityCount: 0,
        directParentTableIdentityCount: 0,
        frameOnlyTableIdentityCount: 0,
        directObjectRoundCount: 0,
        directParentRoundCount: 0,
        frameOnlyRoundCount: 0,
        directObjectShoeCount: 0,
        directParentShoeCount: 0,
        frameOnlyShoeCount: 0,
        objectsWithCards: 0,
        objectsWithOutcome: 0,
        objectsWithExactAssociation: 0,
        truncated: false,
        frozen: false,
        frozenAt: 0,
        freezeReason: null
      },
      roomAssociationDiscovery: {
        jsonMetadata: [],
        dgBinaryMetadata: []
      },
      initialization: {
        active: false,
        startedAt: 0,
        endsAt: 0,
        websocketUrl: '',
        frameCount: 0,
        openCount: 0,
        completeObserved: false,
        stopReason: null,
        processSequence: 0,
        firstDispatch: null,
        associationFrameKeys: new Set(),
        timer: null
      }
    },
    socketDiagnostics: new Map(),
    childSocketDiagnostics: new Map(),
    activeTableSource: null,
    ignoredForeignTablePackets: 0,
    wsMessages: 0,
    showPoker: 0,
    activeTableId: null
  };

  let pendingClickRelay = null;
  let pendingClickRelayTimer = null;
  let pendingMappingRelay = null;
  let pendingMappingRelayTimer = null;

  function dgStorageMarkerFingerprint(value) {
    const text = String(value || '');
    if (!text) return null;
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  function dgStorageMarkerOrigin() {
    try {
      const origin = String(location.origin || '');
      return origin && origin !== 'null' ? origin.slice(0, 240) : null;
    } catch (_) {
      return null;
    }
  }

  function dgStorageMarkerCreate() {
    try {
      if (window.crypto?.getRandomValues) {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
      }
    } catch (_) {}
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`;
  }

  function dgStorageMarkerValid(value) {
    if (!value || typeof value !== 'object' || value.version !== 1) return false;
    const marker = String(value.marker || '');
    return marker.length >= 8 && marker.length <= 128 && /^[A-Za-z0-9_-]+$/.test(marker) && Number.isFinite(Number(value.savedAt));
  }

  function dgStorageMarkerEvidencePush(entry) {
    const safe = {
      timestamp: Number(entry?.timestamp) || Date.now(),
      runtimeInstanceId: DISCOVERY_FRAME_ID,
      isTopWindow: Boolean(isTopWindow),
      storageType: 'sessionStorage',
      storageMarkerRead: Boolean(entry?.storageMarkerRead),
      storageMarkerWritten: Boolean(entry?.storageMarkerWritten),
      markerCreatedThisRuntime: Boolean(entry?.markerCreatedThisRuntime),
      sameMarker: Boolean(entry?.sameMarker),
      markerFingerprint: entry?.markerFingerprint || null,
      origin: dgStorageMarkerOrigin()
    };
    state.dgDataProbe.dgStorageMarkerEvidence.push(safe);
    if (state.dgDataProbe.dgStorageMarkerEvidence.length > DG_STORAGE_MARKER_EVIDENCE_LIMIT) {
      state.dgDataProbe.dgStorageMarkerEvidence.splice(0, state.dgDataProbe.dgStorageMarkerEvidence.length - DG_STORAGE_MARKER_EVIDENCE_LIMIT);
    }
  }

  function dgInitializeStorageMarker() {
    if (!isTopWindow) return;
    let storageMarkerRead = false;
    let storageMarkerWritten = false;
    let markerCreatedThisRuntime = false;
    let sameMarker = false;
    let marker = null;
    try {
      let existing = null;
      try {
        existing = JSON.parse(sessionStorage.getItem(DG_STORAGE_MARKER_KEY) || 'null');
      } catch (_) {
        existing = null;
      }
      if (dgStorageMarkerValid(existing)) {
        marker = String(existing.marker);
        storageMarkerRead = true;
        sameMarker = true;
      } else {
        marker = dgStorageMarkerCreate();
        sessionStorage.setItem(DG_STORAGE_MARKER_KEY, JSON.stringify({ version: 1, marker, savedAt: Date.now() }));
        storageMarkerWritten = true;
        markerCreatedThisRuntime = true;
      }
    } catch (_) {}
    dgStorageMarkerEvidencePush({ storageMarkerRead, storageMarkerWritten, markerCreatedThisRuntime, sameMarker, markerFingerprint: dgStorageMarkerFingerprint(marker) });
  }

  dgInitializeStorageMarker();

  const HANDSHAKE_STAGES = new Set([
    'click-captured',
    'click-saved',
    'click-relay-sent',
    'click-relay-received-top',
    'click-ack-sent',
    'click-ack-received',
    'mapping-already-available',
    'mapping-missing',
    'tablesvg-mapping-extracted',
    'mapping-relay-sent',
    'mapping-relay-received-top',
    'mapping-applied-top',
    'pending-resolve-attempt',
    'pending-resolve-success',
    'pending-resolve-ambiguous',
    'switch-active-table'
  ]);

  function handshakeCandidateTableIds(tableName) {
    const normalized = normalizeTableName(tableName);
    const candidates = normalized
      ? state.tableNameToIds.get(normalized)
      : null;
    return candidates instanceof Set
      ? Array.from(candidates)
          .map(normalizeTableId)
          .filter(Boolean)
          .slice(0, 30)
      : [];
  }

  function latestHandshakeClickId(tableName) {
    const normalized = normalizeTableName(tableName);
    for (let index = state.handshakeEvents.length - 1; index >= 0; index -= 1) {
      const event = state.handshakeEvents[index];
      if (
        event.clickId &&
        normalizeTableName(event.tableName) === normalized
      ) {
        return event.clickId;
      }
    }
    return pendingClickRelay?.clickId || null;
  }

  function handshakeSampleMappings(entries) {
    return (Array.isArray(entries) ? entries : [])
      .map(entry => ({
        tableName: normalizeTableName(entry?.tableName),
        tableId: normalizeTableId(entry?.tableId)
      }))
      .filter(entry => entry.tableName && entry.tableId)
      .slice(0, 5);
  }

  function persistHandshakeEvents() {
    try {
      sessionStorage.setItem(
        `${HANDSHAKE_STORAGE_PREFIX}${DISCOVERY_FRAME_ID}`,
        JSON.stringify(state.handshakeEvents.slice(-100))
      );
    } catch (_) {}
  }

  function recordHandshakeStage(stage, details = {}) {
    if (!HANDSHAKE_STAGES.has(stage)) return;
    const tableName = normalizeTableName(
      details.tableName ?? state.pendingClickedTableName
    );
    const candidateTableIds = Array.isArray(details.candidateTableIds)
      ? details.candidateTableIds
          .map(normalizeTableId)
          .filter(Boolean)
          .slice(0, 30)
      : handshakeCandidateTableIds(tableName);
    const event = {
      timestamp: Date.now(),
      stage,
      clickId: details.clickId
        ? String(details.clickId).slice(0, 160)
        : latestHandshakeClickId(tableName),
      tableName,
      candidateTableIds,
      activeTableId: normalizeTableId(state.activeTableId),
      frameId: DISCOVERY_FRAME_ID,
      isTopWindow,
      entryCount: Number.isFinite(Number(details.entryCount))
        ? Number(details.entryCount)
        : null,
      sampleMappings: handshakeSampleMappings(details.sampleMappings)
    };

    const previous = state.handshakeEvents.at(-1);
    if (
      previous &&
      previous.stage === event.stage &&
      previous.clickId === event.clickId &&
      previous.tableName === event.tableName &&
      previous.activeTableId === event.activeTableId &&
      JSON.stringify(previous.candidateTableIds) ===
        JSON.stringify(event.candidateTableIds) &&
      previous.entryCount === event.entryCount &&
      JSON.stringify(previous.sampleMappings) ===
        JSON.stringify(event.sampleMappings)
    ) {
      return;
    }

    state.handshakeEvents.push(event);
    if (state.handshakeEvents.length > 100) {
      state.handshakeEvents.splice(0, state.handshakeEvents.length - 100);
    }
    persistHandshakeEvents();
  }

  // =====================================================
  // License
  // =====================================================

  function getSavedLicense() {
    try {
      return String(
        localStorage.getItem(LICENSE_STORAGE_KEY) || ''
      )
        .trim()
        .toUpperCase();
    } catch (_) {
      return '';
    }
  }

  function saveLicense(code) {
    try {
      localStorage.setItem(
        LICENSE_STORAGE_KEY,
        String(code || '').trim().toUpperCase()
      );
    } catch (_) {}
  }

  function clearLicense() {
    try {
      localStorage.removeItem(LICENSE_STORAGE_KEY);
    } catch (_) {}

    licenseValid = false;
    licenseExpiresAt = null;
  }

  async function callLicenseAPI(code) {
    const normalizedCode = String(code || '')
      .trim()
      .toUpperCase();

    const controller = new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      LICENSE_REQUEST_TIMEOUT
    );

    try {
      const response = await fetch(LICENSE_API, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: normalizedCode
        }),
        signal: controller.signal
      });

      let result = null;

      try {
        result = await response.json();
      } catch (_) {
        result = null;
      }

      if (!response.ok) {
        const reason =
          result?.reason ||
          result?.message ||
          `HTTP ${response.status}`;

        throw new Error(
          `授權伺服器回應：${reason}`
        );
      }

      if (
        !result ||
        typeof result !== 'object'
      ) {
        throw new Error(
          '授權伺服器沒有回傳有效 JSON'
        );
      }

      return result;

    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(
          '授權伺服器連線逾時'
        );
      }

      throw error;

    } finally {
      clearTimeout(timer);
    }
  }

  function licenseReasonText(reason) {
    if (reason === 'disabled') {
      return '此授權已停用';
    }

    if (reason === 'expired') {
      return '此授權已到期';
    }

    if (reason === 'invalid_code') {
      return '授權碼無效';
    }

    return '授權驗證失敗';
  }

  async function verifyLicense(options = {}) {
    const {
      force = false,
      allowPrompt = true
    } = options;

    if (licenseChecking) {
      return licenseValid;
    }

    if (
      !force &&
      licenseValid &&
      Date.now() - lastLicenseCheck <
        LICENSE_CHECK_INTERVAL
    ) {
      return true;
    }

    licenseChecking = true;

    try {
      let code = getSavedLicense();

      if (!code && allowPrompt) {
        code = String(
          window.prompt(
            '請輸入 Baccarat Pulse 授權碼'
          ) || ''
        )
          .trim()
          .toUpperCase();

        if (!code) {
          licenseValid = false;
          removePanel();
          return false;
        }
      }

      if (!code) {
        licenseValid = false;
        removePanel();
        return false;
      }

      const result =
        await callLicenseAPI(code);

      lastLicenseCheck = Date.now();

      if (
        result &&
        result.valid === true
      ) {
        saveLicense(code);

        licenseValid = true;
        licenseExpiresAt =
          result.expiresAt || null;

        if (
          allowPrompt &&
          !licenseSuccessShown
        ) {
          licenseSuccessShown = true;

          alert(
            licenseExpiresAt
              ? `Baccarat Pulse：授權成功\n到期：${licenseExpiresAt}`
              : 'Baccarat Pulse：授權成功'
          );
        }

        render();

        return true;
      }

      licenseValid = false;
      licenseExpiresAt = null;

      clearLicense();
      removePanel();

      if (allowPrompt) {
        alert(
          `Baccarat Pulse：${licenseReasonText(
            result?.reason
          )}`
        );
      }

      return false;

    } catch (error) {
      console.error(
        '[Baccarat Pulse] License error:',
        error
      );

      licenseValid = false;
      removePanel();

      if (allowPrompt) {
        alert(
          `Baccarat Pulse：授權驗證失敗\n${
            error?.message || '未知錯誤'
          }`
        );
      }

      return false;

    } finally {
      licenseChecking = false;
    }
  }

  // =====================================================
  // Baccarat Logic
  // =====================================================

  function rank(cardId) {
    const n = Number(cardId);

    if (
      !Number.isFinite(n) ||
      n <= 0
    ) {
      return null;
    }

    return ((n - 1) % 13) + 1;
  }

  function rankLabel(r) {
    if (r === 1) return 'A';
    if (r === 11) return 'J';
    if (r === 12) return 'Q';
    if (r === 13) return 'K';

    return String(r ?? '?');
  }

  function cardCount(r) {
    if (r >= 1 && r <= 4) {
      return 1;
    }

    if (r >= 7 && r <= 9) {
      return -1;
    }

    return 0;
  }

  function baccaratPoint(r) {
    if (r === null) {
      return 0;
    }

    return r >= 10 ? 0 : r;
  }

  function dgIsBaccaratRoundFinalized(playerCards, bankerCards) {
    const normalize = cards => {
      if (!Array.isArray(cards) || (cards.length !== 2 && cards.length !== 3)) {
        return null;
      }
      const normalized = cards.map(card => Number(card));
      if (normalized.some(card => !Number.isInteger(card) || card < 1 || card > 52)) {
        return null;
      }
      return normalized;
    };
    const player = normalize(playerCards);
    const banker = normalize(bankerCards);
    if (!player || !banker) return false;

    const total = cards => cards.reduce((sum, card) => sum + baccaratPoint(rank(card)), 0) % 10;
    const playerTotal = total(player.slice(0, 2));
    const bankerTotal = total(banker.slice(0, 2));

    // Natural 8/9 ends the deal only when both sides still have two cards.
    if ((player.length === 2 && playerTotal >= 8) || (banker.length === 2 && bankerTotal >= 8)) {
      return player.length === 2 && banker.length === 2;
    }

    const playerDraws = playerTotal <= 5;
    if (playerDraws && player.length !== 3) return false;
    if (!playerDraws && player.length !== 2) return false;

    if (!playerDraws) {
      const bankerDraws = bankerTotal <= 5;
      return bankerDraws ? banker.length === 3 : banker.length === 2;
    }

    const playerThirdPoint = baccaratPoint(rank(player[2]));
    let bankerDraws = false;
    if (bankerTotal <= 2) bankerDraws = true;
    else if (bankerTotal === 3) bankerDraws = playerThirdPoint !== 8;
    else if (bankerTotal === 4) bankerDraws = playerThirdPoint >= 2 && playerThirdPoint <= 7;
    else if (bankerTotal === 5) bankerDraws = playerThirdPoint >= 4 && playerThirdPoint <= 7;
    else if (bankerTotal === 6) bankerDraws = playerThirdPoint === 6 || playerThirdPoint === 7;

    return bankerDraws ? banker.length === 3 : banker.length === 2;
  }

  function getCards(result) {
    if (!Array.isArray(result)) {
      return [];
    }

    return result
      .slice(0, 6)
      .filter(
        v =>
          v !== null &&
          v !== undefined &&
          Number(v) > 0
      )
      .map(Number);
  }

  function getPlayerCards(result) {
    if (!Array.isArray(result)) {
      return [];
    }

    return [
      result[0],
      result[2],
      result[4]
    ]
      .filter(
        v =>
          v !== null &&
          v !== undefined &&
          Number(v) > 0
      )
      .map(Number);
  }

  function getBankerCards(result) {
    if (!Array.isArray(result)) {
      return [];
    }

    return [
      result[1],
      result[3],
      result[5]
    ]
      .filter(
        v =>
          v !== null &&
          v !== undefined &&
          Number(v) > 0
      )
      .map(Number);
  }

  function getOutcome(result) {
    if (
      !Array.isArray(result) ||
      result.length < 4
    ) {
      return null;
    }

    const player = getPlayerCards(result);
    const banker = getBankerCards(result);

    const p =
      player.reduce(
        (sum, id) =>
          sum + baccaratPoint(rank(id)),
        0
      ) % 10;

    const b =
      banker.reduce(
        (sum, id) =>
          sum + baccaratPoint(rank(id)),
        0
      ) % 10;

    if (p > b) return 'PLAYER';
    if (b > p) return 'BANKER';

    return 'TIE';
  }

  function findDeep(root, names) {
    const wanted =
      names.map(x => x.toLowerCase());

    const seen = new WeakSet();

    function walk(value) {
      if (
        !value ||
        typeof value !== 'object'
      ) {
        return null;
      }

      if (seen.has(value)) {
        return null;
      }

      seen.add(value);

      if (!Array.isArray(value)) {
        for (
          const key of Object.keys(value)
        ) {
          if (
            wanted.includes(
              key.toLowerCase()
            )
          ) {
            return value[key];
          }
        }
      }

      const values =
        Array.isArray(value)
          ? value
          : Object.values(value);

      for (const child of values) {
        const found = walk(child);

        if (
          found !== null &&
          found !== undefined
        ) {
          return found;
        }
      }

      return null;
    }

    return walk(root);
  }

  function parsePacket(payload) {
    const body =
      payload?.body ||
      payload?.msg?.body ||
      payload;

    const directShoe =
      body && typeof body === 'object'
        ? body.shoe ?? body.shoe_id ?? body.shoeId ?? body.shoeid
        : null;

    const directTable =
      body && typeof body === 'object'
        ? body.table_id ?? body.tableId
        : null;

    return {
      result:
        findDeep(body, ['result']),

      tableId:
        directTable ?? findDeep(body, ['table_id', 'tableid']),

      shoe:
        directShoe ?? findDeep(body, ['shoe', 'shoeid']),

      round:
        findDeep(
          body,
          ['round', 'roundnumber']
        ),

      roundIndex:
        findDeep(
          body,
          ['round_index', 'roundindex']
        ),

      shoeTrusted: directShoe !== null && directShoe !== undefined,
      tableTrusted: directTable !== null && directTable !== undefined,
      source: payload?.__bpSource || actionNameOf(payload) || 'show_poker'
    };
  }

  function recompute() {
    let total = 0;
    const outcomes = [];

    const rounds = [
      ...state.rounds.values()
    ].sort(
      (a, b) =>
        Number(a.round) -
        Number(b.round)
    );

    for (const item of rounds) {
      for (const card of item.cards) {
        total +=
          cardCount(
            rank(card)
          );
      }

      if (
        item.outcome &&
        item.outcome !== 'TIE'
      ) {
        outcomes.push(
          item.outcome
        );
      }
    }

    state.runningCount = total;

    state.lastFive =
      outcomes.slice(-5);
  }
  const INITIAL_COUNTS = Object.freeze({
    1: 1, 2: 3, 3: 2, 4: 0, 5: -2, 6: -3, 7: -1, 8: 2, 9: 3, 10: 5,
    11: 3, 12: 1, 13: 2, 14: 0, 15: -2, 16: -3, 17: -1, 18: 1, 19: 3, 20: 6,
    21: 6, 22: 4, 23: 2, 24: -1, 25: 1, 26: 3, 27: 5, 28: 6, 29: 8, 30: 9,
    31: 11, 32: 10, 33: 10, 34: 8, 35: 7, 36: 8, 37: 10, 38: 8, 39: 6, 40: 5,
    41: 4, 42: 2, 43: 0, 44: -1, 45: -3, 46: -3, 47: -4, 48: -6, 49: -4, 50: -3,
    51: 0, 52: 2, 53: 3, 54: 5, 55: 5, 56: 6, 57: 8, 58: 8, 59: 11, 60: 12,
    61: 15, 62: 15, 63: 14, 64: 12, 65: 10, 66: 11, 67: 12, 68: 10, 69: 9
  });

  function dgModelEstimateReset(reason = 'reset', retainedPendingSnapshots = []) {
    const model = state.modelEstimate;
    model.tableId = null;
    model.shoeIdentity = null;
    model.candidateRoundCount = null;
    model.initialCount = null;
    model.baselineRoundCount = null;
    model.baselineValue = null;
    model.liveDelta = 0;
    model.roadOutcomes = [];
    model.roadEntries = [];
    model.roadSnapshotHistory = [];
    model.pendingRoadSnapshots = Array.isArray(retainedPendingSnapshots) ? retainedPendingSnapshots.slice(-4) : [];
    model.roadHistoryAssociation = { status: 'UNVERIFIED', tableId: null, shoeIdentity: null, liveRoundIdentity: null, winner: null, receivedOrder: [], verifiedAt: 0, recentOutcomes: [] };
    model.liveOutcomes = [];
    model.liveOutcomeEvents = [];
    model.liveOutcomeConflicts = [];
    model.liveDeltas = [];
    model.baselineLiveOverlap = [];
    model.lastRenderedRoadAssociationKey = null;
    model.lastRoadEvidence = [];
    model.initialized = false;
    model.status = String(reason || 'reset').slice(0, 64);
    model.countedRoundKeys.clear();
    model.pending = null;
  }

  function dgRoadSnapshotEntryEqual(left, right) {
    return Boolean(left && right) && left.roadCode === right.roadCode &&
      (left.gameNo || null) === (right.gameNo || null);
  }

  function dgRoadSnapshotIsHeadInsert(previous, current) {
    if (!previous || !current || previous.tableId !== current.tableId || previous.shoeIdentity !== current.shoeIdentity) return false;
    if (!Array.isArray(previous.entries) || !Array.isArray(current.entries) || current.entries.length !== previous.entries.length + 1) return false;
    for (let index = 0; index < previous.entries.length; index += 1) {
      if (!dgRoadSnapshotEntryEqual(current.entries[index + 1], previous.entries[index])) return false;
    }
    return true;
  }

  function dgRoadSnapshotSameContext(previous, current) {
    if (!previous || !current || previous.tableId !== current.tableId || previous.shoeIdentity !== current.shoeIdentity) return false;
    if (!previous.socketKey || !current.socketKey || previous.socketKey !== current.socketKey) return false;
    if (!previous.socketGeneration || !current.socketGeneration || previous.socketGeneration !== current.socketGeneration) return false;
    return true;
  }

  function dgRoadSnapshotFingerprint(snapshot) {
    return [snapshot?.tableId || '', snapshot?.shoeIdentity || '', ...(Array.isArray(snapshot?.entries) ? snapshot.entries : []).map(entry => `${entry.gameNo || ''}:${entry.roadCode}`)].join('|');
  }

  function dgRoadSnapshotFindUniquePair(history, association) {
    const snapshots = (Array.isArray(history) ? history : []).filter(snapshot => snapshot && snapshot.tableId === association?.tableId && snapshot.shoeIdentity === association?.shoeIdentity);
    const liveObservedAt = Number(association?.liveObservedAt) || 0;
    const liveStartedAt = Number(association?.liveStartedAt) || 0;
    const completeEvents = dgUniqueCompleteEvents(state.dgDataProbe.roundEvolution, association?.liveRoundIdentity, liveObservedAt);
    if (completeEvents.length !== 1) return { status: 'REJECTED', reason: 'round-complete-event-conflict', candidates: [] };
    const candidates = [];
    for (let i = 0; i < snapshots.length; i += 1) {
      for (let j = i + 1; j < snapshots.length; j += 1) {
        const previous = snapshots[i];
        const current = snapshots[j];
        if (!dgRoadSnapshotSameContext(previous, current)) continue;
        if (previous.receivedAt > liveObservedAt || current.receivedAt < liveStartedAt) continue;
        if (!dgRoadSnapshotIsHeadInsert(previous, current)) continue;
        if (current.entries[0]?.winner !== association.winner) continue;
        const recentOutcomes = dgRoadSnapshotRecentOutcomes(current);
        if (!recentOutcomes) continue;
        candidates.push({ previous, current, recentOutcomes, key: `${dgRoadSnapshotFingerprint(previous)}=>${dgRoadSnapshotFingerprint(current)}` });
      }
    }
    const unique = [...new Map(candidates.map(candidate => [candidate.key, candidate])).values()];
    if (unique.length === 1) return { status: 'VERIFIED', ...unique[0], candidates: unique };
    if (unique.length > 1) return { status: 'REJECTED', reason: 'ambiguous-snapshot-pair', candidates: unique };
    return { status: 'REJECTED', reason: 'snapshot-not-single-head-insert-or-stale', candidates: [] };
  }

  function dgModelEstimateRenderVerifiedAssociation(association) {
    if (!association || !['VERIFIED_LIVE_TO_ROAD_HEAD_INSERT', 'DIRECT_NATIVE_ROAD_SNAPSHOT'].includes(association.status) || !Array.isArray(association.recentOutcomes) || association.recentOutcomes.length !== 5) return false;
    const key = `${association.tableId}|${association.shoeIdentity}|${association.liveRoundIdentity}|${association.verifiedSnapshotReceivedOrder}`;
    if (state.modelEstimate.lastRenderedRoadAssociationKey === key) return false;
    state.modelEstimate.lastRenderedRoadAssociationKey = key;
    render();
    return true;
  }

  function dgRoadSnapshotRecentOutcomes(snapshot) {
    const effective = Array.isArray(snapshot?.entries)
      ? snapshot.entries.filter(entry => entry.winner === 'PLAYER' || entry.winner === 'BANKER')
      : [];
    return effective.length >= 5 ? effective.slice(0, 5).reverse().map(entry => entry.winner) : null;
  }

  function dgRoadSnapshotDirectRecentOutcomes(snapshot, completedRoundIdentity = '', completedWinner = '', liveInclusionEvidence = 'UNKNOWN') {
    if (!snapshot || !Array.isArray(snapshot.entries) || !snapshot.tableId || !snapshot.shoeIdentity) return null;
    let entries = snapshot.entries.slice();
    // lastFrame.currentRoundIdentity/currentRoundComplete is not proof that
    // this 1004 snapshot contains the live round.  Only an independently
    // verified A/B head-insert may say so; unknown boundaries must not cause
    // a winner-based removal or insertion.
    if (completedWinner && liveInclusionEvidence === 'NOT_INCLUDED') {
      entries.unshift({ winner: completedWinner });
    }
    const effective = entries.filter(entry => entry.winner === 'PLAYER' || entry.winner === 'BANKER');
    return effective.length >= 5 ? effective.slice(0, 5).reverse().map(entry => entry.winner) : null;
  }

  function dgCompleteEventSignature(event) {
    if (!event || event.complete !== true || !event.roundIdentity) return '';
    return [
      event.roundIdentity,
      Array.isArray(event.playerCards) ? event.playerCards.join(',') : '',
      Array.isArray(event.bankerCards) ? event.bankerCards.join(',') : ''
    ].join('|');
  }

  function dgUniqueCompleteEvents(roundEvolution, roundIdentity, receivedAt) {
    const signatures = new Set();
    return (Array.isArray(roundEvolution) ? roundEvolution : []).filter(event => {
      if (!event || event.roundIdentity !== roundIdentity || event.complete !== true || Number(event.timestamp) > receivedAt) return false;
      const signature = dgCompleteEventSignature(event);
      if (!signature || signatures.has(signature)) return false;
      signatures.add(signature);
      return true;
    });
  }

  function dgRoadSnapshotPendingFingerprint(snapshot) {
    return [snapshot.tableId, snapshot.provenShoeIdentity || '', ...snapshot.entries.map(entry => `${entry.gameNo || ''}:${entry.roadCode}`)].join('|').slice(0, 4096);
  }

  function dgModelEstimateStorePendingRoadSnapshot(roadEntries, tableId) {
    const model = state.modelEstimate;
    if (!tableId || !Array.isArray(roadEntries?.entries)) return false;
    const receivedAt = Date.now();
    const frame = state.dg?.lastFrame || null;
    const ownership = state.dg?.ownership || null;
    const activeSocketKey = state.dg?.lifecycle?.activeSocketKey || ownership?.socketKey || null;
    const frameTableMatches = Boolean(frame?.tableId && normalizeTableId(frame.tableId) === normalizeTableId(tableId));
    const frameSocketMatches = Boolean(frame?.socketKey && activeSocketKey && frame.socketKey === activeSocketKey && (!ownership?.socketKey || frame.socketKey === ownership.socketKey));
    const frameGenerationMatches = Boolean(
      frame?.socketGeneration != null && ownership?.socketGeneration != null &&
      frame.socketGeneration === ownership.socketGeneration
    );
    const frameTimeMatches = Boolean(frame?.receivedAt && Number(frame.receivedAt) <= receivedAt);
    const frameContextTrusted = frameTableMatches && frameSocketMatches && frameGenerationMatches && frameTimeMatches;
    const roundIdentity = frameContextTrusted ? String(frame.roundIdentity || '') : '';
    const provenShoeIdentity = frameContextTrusted ? (dgShoeIdentity(roundIdentity) || null) : null;
    const pending = {
      tableId,
      provenShoeIdentity,
      roundIdentity: roundIdentity.slice(0, 120) || null,
      socketKey: activeSocketKey || null,
      ownershipSequence: Number(ownership?.sequence) || null,
      socketGeneration: ownership?.socketGeneration || null,
      frameContextTrusted,
      frameTableMatches,
      frameSocketMatches,
      frameGenerationMatches,
      receivedAt,
      currentRoundIdentity: roundIdentity.slice(0, 120) || null,
      currentRoundComplete: Boolean(frame?.complete),
      entries: roadEntries.entries.slice(0, 128).map(entry => ({ gameNo: entry.gameNo || null, roadCode: entry.roadCode, winner: entry.winner }))
    };
    pending.fingerprint = dgRoadSnapshotPendingFingerprint(pending);
    model.pendingRoadSnapshots = model.pendingRoadSnapshots.filter(item => item.fingerprint !== pending.fingerprint && pending.receivedAt - item.receivedAt <= 15000).slice(-3);
    model.pendingRoadSnapshots.push(pending);
    dgEvidencePush('dgRoadResultEvidence', {
      type: 'pending-road-snapshot',
      tableId,
      provenShoeIdentity,
      roundIdentity: pending.roundIdentity,
      socketKeyPresent: Boolean(pending.socketKey),
      ownershipSequence: pending.ownershipSequence,
      frameContextTrusted: pending.frameContextTrusted,
      frameTableMatches: pending.frameTableMatches,
      frameSocketMatches: pending.frameSocketMatches,
      frameGenerationMatches: pending.frameGenerationMatches,
      receivedAt: pending.receivedAt,
      listLength: pending.entries.length,
      bindingStatus: provenShoeIdentity ? 'WAITING_FOR_MATCHING_SHOE' : 'UNBOUND_MISSING_SHOE_PROOF'
    });
    return true;
  }

  function dgModelEstimateBindPendingRoadSnapshots(tableId, shoeIdentity) {
    const model = state.modelEstimate;
    const verifiedShoe = String(shoeIdentity || '');
    const now = Date.now();
    const candidates = model.pendingRoadSnapshots.filter(item =>
      item && item.tableId === tableId && item.provenShoeIdentity === verifiedShoe &&
      now - Number(item.receivedAt || 0) <= 15000 &&
      item.frameContextTrusted === true &&
      item.socketKey && item.socketKey === state.dg?.lifecycle?.activeSocketKey &&
      item.socketGeneration && item.socketGeneration === state.dg?.ownership?.socketGeneration
    );
    model.pendingRoadSnapshots = [];
    for (const pending of candidates.slice(-4)) {
      const snapshot = {
        tableId: pending.tableId,
        shoeIdentity: verifiedShoe,
        receivedAt: pending.receivedAt,
        socketKey: pending.socketKey || null,
        ownershipSequence: pending.ownershipSequence || null,
        socketGeneration: pending.socketGeneration || null,
        currentRoundIdentity: pending.currentRoundIdentity || null,
        currentRoundComplete: pending.currentRoundComplete === true,
        receivedOrder: (model.roadSnapshotHistory.at(-1)?.receivedOrder || 0) + 1,
        listLength: pending.entries.length,
        entries: pending.entries.slice(0, 128)
      };
      model.roadSnapshotHistory.push(snapshot);
      if (model.roadSnapshotHistory.length > 8) model.roadSnapshotHistory.shift();
      dgEvidencePush('dgRoadResultEvidence', {
        type: 'pending-road-snapshot-bound',
        tableId: snapshot.tableId,
        shoeIdentity: verifiedShoe,
        receivedOrder: snapshot.receivedOrder,
        originalReceivedAt: pending.receivedAt,
        bindingStatus: 'BOUND_SAME_SHOE_PROVEN_BY_ROUND_IDENTITY'
      });
    }
    return candidates.length;
  }

  function dgModelEstimateRecordRoadSnapshot(decoded, roadEntries, tableId, shoeIdentity) {
    const model = state.modelEstimate;
    const verifiedShoe = shoeIdentity == null ? '' : String(shoeIdentity);
    if (!tableId || !Array.isArray(roadEntries?.entries)) return null;
    if (!verifiedShoe) {
      dgModelEstimateStorePendingRoadSnapshot(roadEntries, tableId);
      return null;
    }
    const snapshot = {
      tableId,
      shoeIdentity: verifiedShoe,
      receivedAt: Date.now(),
      socketKey: state.dg?.lifecycle?.activeSocketKey || state.dg?.ownership?.socketKey || null,
      ownershipSequence: Number(state.dg?.ownership?.sequence) || null,
      socketGeneration: state.dg?.ownership?.socketGeneration || null,
      currentRoundIdentity: String(state.dg?.lastFrame?.roundIdentity || ''),
      currentRoundComplete: Boolean(state.dg?.lastFrame?.complete),
      receivedOrder: (model.roadSnapshotHistory.at(-1)?.receivedOrder || 0) + 1,
      listLength: roadEntries.entries.length,
      entries: roadEntries.entries.slice(0, 128).map(entry => ({ gameNo: entry.gameNo || null, roadCode: entry.roadCode, winner: entry.winner }))
    };
    model.roadSnapshotHistory.push(snapshot);
    if (model.roadSnapshotHistory.length > 8) model.roadSnapshotHistory.shift();
    dgEvidencePush('dgRoadResultEvidence', {
      type: 'live-road-snapshot',
      tableId,
      shoeIdentity: verifiedShoe,
      receivedAt: snapshot.receivedAt,
      receivedOrder: snapshot.receivedOrder,
      listLength: snapshot.listLength,
      entries: snapshot.entries.slice(0, 128)
    });
    const association = model.roadHistoryAssociation;
    if (association.status !== 'WAITING_FOR_POST_LIVE_SNAPSHOT' || association.tableId !== tableId || association.shoeIdentity !== verifiedShoe) return snapshot;
    const pair = dgRoadSnapshotFindUniquePair(model.roadSnapshotHistory, { ...association, liveObservedAt: association.liveObservedAt || snapshot.receivedAt });
    if (pair.status !== 'VERIFIED') {
      association.status = 'UNVERIFIED_SNAPSHOT_DIFFERENCE';
      association.failureReason = pair.reason;
      return snapshot;
    }
    association.status = 'VERIFIED_LIVE_TO_ROAD_HEAD_INSERT';
    association.verifiedAt = snapshot.receivedAt;
    association.baselineReceivedOrder = pair.previous.receivedOrder;
    association.verifiedSnapshotReceivedOrder = pair.current.receivedOrder;
    association.receivedOrder = [pair.previous.receivedOrder, pair.current.receivedOrder];
    association.recentOutcomes = pair.recentOutcomes;
    dgEvidencePush('dgRoadResultEvidence', {
      type: 'live-road-correlation-verified',
      tableId: association.tableId,
      shoeIdentity: association.shoeIdentity,
      liveRoundIdentity: association.liveRoundIdentity,
      winner: association.winner,
      baselineReceivedOrder: association.baselineReceivedOrder,
      verifiedSnapshotReceivedOrder: association.verifiedSnapshotReceivedOrder,
      recentOutcomes: association.recentOutcomes.slice()
    });
    dgModelEstimateRenderVerifiedAssociation(association);
    return snapshot;
  }

  function dgModelEstimateApplyDirectRoadHistory() {
    const model = state.modelEstimate;
    const live = Array.isArray(model.liveOutcomeEvents)
      ? model.liveOutcomeEvents.filter(event => event && event.tableId === model.tableId && event.shoeIdentity === model.shoeIdentity).at(-1)
      : null;
    const snapshot = Array.isArray(model.roadSnapshotHistory)
      ? model.roadSnapshotHistory.filter(item => item && item.tableId === model.tableId && item.shoeIdentity === model.shoeIdentity).at(-1)
      : null;
    if (!snapshot) return false;
    const liveInclusionEvidence = live
      ? (model.roadHistoryAssociation.status === 'VERIFIED_LIVE_TO_ROAD_HEAD_INSERT' ? 'ALREADY_INCLUDED' : 'UNKNOWN')
      : 'NO_LIVE';
    const recentOutcomes = dgRoadSnapshotDirectRecentOutcomes(snapshot, live?.roundIdentity || '', live?.winner || '', liveInclusionEvidence);
    if (!recentOutcomes || model.roadHistoryAssociation.status === 'VERIFIED_LIVE_TO_ROAD_HEAD_INSERT') return false;
    model.roadHistoryAssociation = {
      ...model.roadHistoryAssociation,
      status: 'DIRECT_NATIVE_ROAD_SNAPSHOT',
      failureReason: null,
      tableId: model.tableId,
      shoeIdentity: model.shoeIdentity,
      liveRoundIdentity: live?.roundIdentity || null,
      winner: live?.winner || null,
      liveInclusionEvidence,
      recentOutcomes
    };
    dgEvidencePush('dgRoadResultEvidence', {
      type: 'direct-native-road-history',
      tableId: model.tableId,
      shoeIdentity: model.shoeIdentity,
      liveRoundIdentity: live?.roundIdentity || null,
      winner: live?.winner || null,
      recentOutcomes: recentOutcomes.slice(),
      source: 'same-table-same-shoe-1004-snapshot'
    });
    dgModelEstimateRenderVerifiedAssociation(model.roadHistoryAssociation);
    return true;
  }

  function dgModelEstimateObserveRoad(decoded, ownershipTableId, shoeIdentity = null) {
    const model = state.modelEstimate;
    const packetTableId = normalizeTableId(decoded?.tableId);
    const owner = normalizeTableId(ownershipTableId);
    const currentRoundIdentity = String(state.dg?.lastFrame?.roundIdentity || '');
    const currentRoundComplete = Boolean(state.dg?.lastFrame?.complete);
    const roadEntries = dgNativeRoadEntries(decoded?.list, currentRoundIdentity, currentRoundComplete);
    if (shoeIdentity) dgModelEstimateBindPendingRoadSnapshots(packetTableId, shoeIdentity);
    dgModelEstimateRecordRoadSnapshot(decoded, roadEntries, packetTableId, shoeIdentity);
    const completeBeforeRoadSnapshot = Boolean(
      currentRoundIdentity &&
      currentRoundComplete &&
      roadEntries.entries.length > 0 &&
      roadEntries.entries.every(entry => !entry.gameNo)
    );
    const baselineRoadEntries = completeBeforeRoadSnapshot
      ? roadEntries.entries.slice(0, -1)
      : roadEntries.entries;
    const uncountedEntries = baselineRoadEntries.filter(entry => !model.countedRoundKeys.has(entry.stableKey));
    const candidateRoundCount = uncountedEntries.length;
    const base = {
      tableId: packetTableId,
      candidateRoundCount,
      invalidItemCount: roadEntries.invalidItemCount,
      currentRoundExcluded: roadEntries.currentRoundExcluded,
      currentRoundExclusionReason: roadEntries.currentRoundExclusionReason,
      shoeIdentity: shoeIdentity == null ? null : String(shoeIdentity),
      baselineLiveOverlap: completeBeforeRoadSnapshot ? {
        roundIdentity: currentRoundIdentity,
        sourcePosition: roadEntries.entries.length - 1,
        reason: 'live-complete-before-road-snapshot-blank-gameNo-tail'
      } : null
    };
    if (!owner || !packetTableId) { model.status = 'REJECTED_OWNERSHIP_UNVERIFIED'; return false; }
    if (owner !== packetTableId) { model.status = 'REJECTED_FOREIGN_TABLE'; return false; }
    if (candidateRoundCount < 1 || candidateRoundCount > 69) {
      model.status = 'REJECTED_ROUND_RANGE';
      return false;
    }
    const pendingIdentityMatches = model.pending && model.pending.tableId === packetTableId &&
      (!model.pending.shoeIdentity || !base.shoeIdentity || model.pending.shoeIdentity === base.shoeIdentity);
    if (!pendingIdentityMatches && !model.initialized) model.pending = base;
    const sameModelIdentity = model.initialized && model.tableId === packetTableId && model.shoeIdentity === String(shoeIdentity || '');
    if (!sameModelIdentity && !pendingIdentityMatches) {
      model.roadEntries = uncountedEntries;
      model.roadOutcomes = uncountedEntries.map(entry => entry.winner);
      model.lastRoadEvidence = uncountedEntries.slice(-64);
    } else {
      model.roadEntries = uncountedEntries;
      model.roadOutcomes = uncountedEntries.map(entry => entry.winner);
      if (model.roadOutcomes.length > 128) model.roadOutcomes.splice(0, model.roadOutcomes.length - 128);
      model.lastRoadEvidence = uncountedEntries.slice(-64);
    }
    model.status = 'ROAD_CANDIDATE_PENDING_SHOE';
    // The road command and the first complete live round can arrive in either
    // order. If the verified shoe is already known, retry the same idempotent
    // initializer now; the live dispatch path below remains the other order.
    if (shoeIdentity != null && String(shoeIdentity)) {
      dgModelEstimateTryInitialize(packetTableId, String(shoeIdentity));
      dgModelEstimateApplyDirectRoadHistory();
    }
    return true;
  }

  function dgModelEstimateTryInitialize(tableId, shoeIdentity) {
    const model = state.modelEstimate;
    const verifiedTableId = normalizeTableId(tableId);
    const verifiedShoe = String(shoeIdentity || '');
    const pending = model.pending;
    if (!pending || !verifiedTableId || !verifiedShoe || pending.tableId !== verifiedTableId) return false;
    if (pending.shoeIdentity && pending.shoeIdentity !== verifiedShoe) {
      model.status = 'REJECTED_SHOE_MISMATCH';
      return false;
    }
    if (!dgOwnsIdentity(verifiedTableId) || normalizeTableId(state.dg.ownership.tableId) !== verifiedTableId) {
      model.status = 'REJECTED_OWNERSHIP_UNVERIFIED';
      return false;
    }
    if (model.initialized && model.tableId === verifiedTableId && model.shoeIdentity === verifiedShoe) return false;
    const initialCount = INITIAL_COUNTS[pending.candidateRoundCount];
    if (!Number.isInteger(initialCount)) { model.status = 'REJECTED_ROUND_RANGE'; return false; }
    model.tableId = verifiedTableId;
    model.shoeIdentity = verifiedShoe;
    model.candidateRoundCount = pending.candidateRoundCount;
    model.initialCount = initialCount;
    model.baselineRoundCount = pending.candidateRoundCount;
    model.baselineValue = initialCount;
    if (pending.baselineLiveOverlap) {
      model.baselineLiveOverlap.push({ ...pending.baselineLiveOverlap });
    }
    model.liveDelta = 0;
    model.initialized = true;
    model.status = 'MODEL_INITIALIZED_CANDIDATE_ROUNDS';
    model.countedRoundKeys.clear();
    dgModelEstimateHydrateLiveOutcomes();
    const last = state.dg?.lastFrame;
    if (last && String(last.tableId) === verifiedTableId && String(state.dg?.shoeIdentity || '') === verifiedShoe) {
      const result = [last.player?.[0], last.banker?.[0], last.player?.[1], last.banker?.[1], last.player?.[2], last.banker?.[2]];
      if (dgIsBaccaratRoundFinalized(getPlayerCards(result), getBankerCards(result))) {
        dgModelEstimateAddLiveRound({ source: 'dg-binary', finalized: true, tableId: verifiedTableId, shoe: verifiedShoe, round: last.roundIdentity, result });
      }
    }
    return true;
  }

  function dgModelEstimateAddLiveRound(data) {
    const model = state.modelEstimate;
    if (!model.initialized || data?.source !== 'dg-binary' || data?.finalized !== true) return false;
    if (normalizeTableId(data.tableId) !== model.tableId || String(data.shoe || '') !== model.shoeIdentity) return false;
    const roundKey = String(data.round ?? '');
    const cards = getCards(data.result);
    const outcome = getOutcome(data.result);
    const cardFingerprint = cards.join(',');
    if (!roundKey || !cards.length || !['PLAYER', 'BANKER', 'TIE'].includes(outcome)) return false;
    const existingOutcome = model.liveOutcomeEvents.find(event => event && event.roundIdentity === roundKey);
    if (existingOutcome) {
      const sameWinner = existingOutcome.winner === outcome;
      const sameCards = !existingOutcome.cardFingerprint || existingOutcome.cardFingerprint === cardFingerprint;
      if (!sameWinner || !sameCards) {
        model.liveOutcomeConflicts.push({
          tableId: model.tableId,
          shoeIdentity: model.shoeIdentity,
          roundIdentity: roundKey.slice(0, 120),
          priorWinner: existingOutcome.winner,
          receivedWinner: outcome,
          priorCardFingerprint: existingOutcome.cardFingerprint || null,
          receivedCardFingerprint: cardFingerprint,
          observedAt: Date.now()
        });
        if (model.liveOutcomeConflicts.length > 32) model.liveOutcomeConflicts.shift();
        model.roadHistoryAssociation = {
          ...model.roadHistoryAssociation,
          status: 'CONFLICTING_LIVE_COMPLETE',
          failureReason: 'duplicate-round-winner-or-card-conflict'
        };
        dgEvidencePush('dgRoadResultEvidence', {
          type: 'live-complete-conflict',
          tableId: model.tableId,
          shoeIdentity: model.shoeIdentity,
          roundIdentity: roundKey.slice(0, 120),
          priorWinner: existingOutcome.winner,
          receivedWinner: outcome,
          priorCardFingerprint: existingOutcome.cardFingerprint || null,
          receivedCardFingerprint: cardFingerprint
        });
      }
      return false;
    }
    if (model.countedRoundKeys.has(roundKey)) return false;
    const overlapIndex = model.roadEntries.findIndex(entry => entry.gameNo === roundKey);
    if (overlapIndex >= 0) {
      const [overlap] = model.roadEntries.splice(overlapIndex, 1);
      model.roadOutcomes.splice(overlapIndex, 1);
      model.candidateRoundCount = model.roadEntries.length;
      model.initialCount = INITIAL_COUNTS[model.candidateRoundCount] ?? model.initialCount;
      model.baselineLiveOverlap.push({
        gameNo: overlap.gameNo,
        roadCode: overlap.roadCode,
        reason: 'same-gameNo-excluded-from-baseline'
      });
      if (model.baselineLiveOverlap.length > 32) model.baselineLiveOverlap.shift();
    }
    const delta = cards.reduce((sum, card) => sum + cardCount(rank(card)), 0);
    model.countedRoundKeys.add(roundKey);
    if (model.countedRoundKeys.size > 128) model.countedRoundKeys.delete(model.countedRoundKeys.values().next().value);
    model.liveDelta += delta;
    model.liveDeltas.push({ gameNo: roundKey.slice(0, 80), delta });
    if (model.liveDeltas.length > 64) model.liveDeltas.shift();
    if (outcome === 'PLAYER' || outcome === 'BANKER' || outcome === 'TIE') {
      model.liveOutcomes.push(outcome);
      if (model.liveOutcomes.length > 64) model.liveOutcomes.shift();
      model.liveOutcomeEvents.push({
        tableId: model.tableId,
        shoeIdentity: model.shoeIdentity,
        roundIdentity: roundKey.slice(0, 120),
        winner: outcome,
        cardFingerprint,
        observedAt: Date.now()
      });
      if (model.liveOutcomeEvents.length > 64) model.liveOutcomeEvents.shift();
      const liveObservedAt = model.liveOutcomeEvents.at(-1).observedAt;
      const preLiveSnapshot = model.roadSnapshotHistory
        .filter(snapshot => snapshot.tableId === model.tableId && snapshot.shoeIdentity === model.shoeIdentity && snapshot.receivedAt <= liveObservedAt)
        .at(-1);
      const liveStartedAt = state.dgDataProbe.roundEvolution
        .filter(event => event && event.roundIdentity === roundKey && Number.isFinite(Number(event.timestamp)))
        .map(event => Number(event.timestamp))
        .sort((left, right) => left - right)[0] || 0;
      const pair = dgRoadSnapshotFindUniquePair(model.roadSnapshotHistory, {
        tableId: model.tableId,
        shoeIdentity: model.shoeIdentity,
        liveRoundIdentity: roundKey,
        winner: outcome,
        liveStartedAt,
        liveObservedAt
      });
      const completedBeforeRoadRefresh = pair.status === 'VERIFIED';
      model.roadHistoryAssociation = {
        status: completedBeforeRoadRefresh ? 'VERIFIED_LIVE_TO_ROAD_HEAD_INSERT' : preLiveSnapshot ? 'WAITING_FOR_POST_LIVE_SNAPSHOT' : 'UNVERIFIED_MISSING_PRE_LIVE_SNAPSHOT',
        tableId: model.tableId,
        shoeIdentity: model.shoeIdentity,
        liveRoundIdentity: roundKey.slice(0, 120),
        winner: outcome,
        liveObservedAt,
        liveStartedAt,
        baselineReceivedOrder: completedBeforeRoadRefresh ? pair.previous.receivedOrder : preLiveSnapshot?.receivedOrder || null,
        verifiedSnapshotReceivedOrder: completedBeforeRoadRefresh ? pair.current.receivedOrder : null,
        receivedOrder: completedBeforeRoadRefresh ? [pair.previous.receivedOrder, pair.current.receivedOrder] : preLiveSnapshot ? [preLiveSnapshot.receivedOrder] : [],
        verifiedAt: completedBeforeRoadRefresh ? pair.current.receivedAt : 0,
        recentOutcomes: completedBeforeRoadRefresh ? pair.recentOutcomes : [],
        failureReason: completedBeforeRoadRefresh ? null : pair.reason || null
      };
      dgEvidencePush('dgRoadResultEvidence', {
        type: 'live-road-correlation-anchor',
        tableId: model.tableId,
        shoeIdentity: model.shoeIdentity,
        liveRoundIdentity: roundKey.slice(0, 120),
        winner: outcome,
        liveObservedAt,
        baselineReceivedOrder: preLiveSnapshot?.receivedOrder || null,
        status: model.roadHistoryAssociation.status
      });
      if (completedBeforeRoadRefresh) dgModelEstimateRenderVerifiedAssociation(model.roadHistoryAssociation);
      dgModelEstimateApplyDirectRoadHistory();
      dgModelEstimateSaveLiveOutcomes();
    }
    if (model.roadOutcomes.length > 128) model.roadOutcomes.splice(0, model.roadOutcomes.length - 128);
    model.status = 'MODEL_ESTIMATE_LIVE_ACCUMULATING';
    return true;
  }

  function dgModelEstimateRecentOutcomes() {
    dgModelEstimateHydrateLiveOutcomes();
    const verifiedHistory = state.modelEstimate.roadHistoryAssociation;
    if (['VERIFIED_LIVE_TO_ROAD_HEAD_INSERT', 'DIRECT_NATIVE_ROAD_SNAPSHOT'].includes(verifiedHistory?.status) && Array.isArray(verifiedHistory.recentOutcomes) && verifiedHistory.recentOutcomes.length === 5) {
      return verifiedHistory.recentOutcomes.slice();
    }
    const events = state.modelEstimate.liveOutcomeEvents;
    return Array.isArray(events)
      ? events
        .filter(event => event && event.tableId === state.modelEstimate.tableId && event.shoeIdentity === state.modelEstimate.shoeIdentity && (event.winner === 'PLAYER' || event.winner === 'BANKER'))
        .slice(-5)
        .map(event => event.winner)
      : [];
  }

  function dgModelEstimateHydrateLiveOutcomes() {
    const model = state.modelEstimate;
    if (!model.initialized || !model.tableId || !model.shoeIdentity) return;
    let stored = null;
    try { stored = JSON.parse(sessionStorage.getItem(`${DG_LIVE_OUTCOMES_STORAGE_PREFIX}${model.tableId}.${model.shoeIdentity}`) || 'null'); } catch (_) {}
    if (!Array.isArray(stored)) return;
    const known = new Set((Array.isArray(model.liveOutcomeEvents) ? model.liveOutcomeEvents : []).map(event => String(event?.roundIdentity || '')).filter(Boolean));
    for (const item of stored) {
      if (!item || item.tableId !== model.tableId || item.shoeIdentity !== model.shoeIdentity || !['PLAYER', 'BANKER', 'TIE'].includes(item.winner)) continue;
      const roundIdentity = String(item.roundIdentity || '').slice(0, 120);
      if (!roundIdentity || known.has(roundIdentity)) continue;
      model.liveOutcomeEvents.push({
        tableId: model.tableId,
        shoeIdentity: model.shoeIdentity,
        roundIdentity,
        winner: item.winner,
        observedAt: Number(item.observedAt) || 0
      });
      known.add(roundIdentity);
    }
    if (model.liveOutcomeEvents.length > 64) model.liveOutcomeEvents.splice(0, model.liveOutcomeEvents.length - 64);
    model.liveOutcomes = model.liveOutcomeEvents.map(event => event.winner).slice(-64);
  }

  function dgModelEstimateSaveLiveOutcomes() {
    const model = state.modelEstimate;
    if (!model.tableId || !model.shoeIdentity || !Array.isArray(model.liveOutcomeEvents)) return false;
    try {
      sessionStorage.setItem(`${DG_LIVE_OUTCOMES_STORAGE_PREFIX}${model.tableId}.${model.shoeIdentity}`, JSON.stringify(model.liveOutcomeEvents.slice(-64)));
      return true;
    } catch (_) { return false; }
  }

  function dgModelEstimateCompletedRoundCount() {
    const model = state.modelEstimate;
    return model.initialized ? model.candidateRoundCount + model.countedRoundKeys.size : null;
  }

  function dgModelEstimateValue() {
    const model = state.modelEstimate;
    return model.initialized ? model.initialCount + model.liveDelta : null;
  }

  function dgAnalysisCount() {
    const model = state.modelEstimate;
    return model.initialized && state.activeTableSource === 'dg-binary'
      ? dgModelEstimateValue()
      : state.runningCount;
  }

  function dgCanonicalOwnerFingerprint(value) {
    const text = String(value ?? '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }
  function dgCanonicalOwnerTelemetry(event, details = {}) {
    const entry = redactObject({
      timestamp: Date.now(),
      event: String(event || '').slice(0, 64),
      runtimeInstanceId: state.dg.lifecycle.runtimeInstanceId || null,
      tableId: normalizeTableId(details.tableId),
      shoeIdentity: details.shoeIdentity ? String(details.shoeIdentity).slice(0, 80) : null,
      roundCount: Number.isInteger(details.roundCount) ? details.roundCount : null,
      reason: details.reason ? String(details.reason).slice(0, 120) : null,
      requestIdFingerprint: details.requestId == null ? null : dgCanonicalOwnerFingerprint(details.requestId),
      popupGeneration: Number.isInteger(details.popupGeneration) ? details.popupGeneration : null,
      popupIdFingerprint: details.popupId == null ? null : dgCanonicalOwnerFingerprint(details.popupId),
      loaderInstanceId: details.loaderInstanceId ? String(details.loaderInstanceId).slice(0, 80) : null
    });
    state.dgDataProbe.dgCanonicalOwnerEvidence.push(entry);
    if (state.dgDataProbe.dgCanonicalOwnerEvidence.length > 64) state.dgDataProbe.dgCanonicalOwnerEvidence.splice(0, state.dgDataProbe.dgCanonicalOwnerEvidence.length - 64);
  }
  function dgPersistenceEvidencePush(event, details = {}) {
    const entry = redactObject({
      timestamp: Date.now(),
      event: String(event || '').slice(0, 48),
      tableId: normalizeTableId(details.tableId),
      shoeIdentity: details.shoeIdentity ? String(details.shoeIdentity).slice(0, 80) : null,
      roundCount: Number.isInteger(details.roundCount) ? details.roundCount : null,
      reason: details.reason ? String(details.reason).slice(0, 120) : null
    });
    state.dgDataProbe.dgPersistenceEvidence.push(entry);
    if (state.dgDataProbe.dgPersistenceEvidence.length > DG_PERSISTENCE_EVIDENCE_LIMIT) {
      state.dgDataProbe.dgPersistenceEvidence.splice(0, state.dgDataProbe.dgPersistenceEvidence.length - DG_PERSISTENCE_EVIDENCE_LIMIT);
    }
  }
  function dgPersistenceCanonicalRoundFromState(item, tableId, shoeIdentity) {
    const roundIdentity = String(item?.roundIdentity ?? item?.round ?? '').trim();
    const roundIndex = Number(item?.roundIndex ?? item?.round);
    const result = Array.isArray(item?.result) ? item.result.slice(0, 6).map(value => value == null ? null : Number(value)) : null;
    const cards = Array.isArray(item?.cards) ? item.cards.slice(0, 6).map(Number) : getCards(result);
    const complete = Boolean(item?.complete) || (Array.isArray(result) && dgIsBaccaratRoundFinalized(getPlayerCards(result), getBankerCards(result)));
    if (!roundIdentity || dgShoeIdentity(roundIdentity) !== String(shoeIdentity || '') || !Number.isInteger(roundIndex) || !Array.isArray(result) || result.length < 4 || !complete) return null;
    if (result.some(value => value !== null && (!Number.isInteger(value) || value < 1 || value > 52))) return null;
    if (cards.some(value => !Number.isInteger(value) || value < 1 || value > 52)) return null;
    return {
      roundIdentity,
      roundIndex,
      result,
      cards,
      outcome: item?.outcome || getOutcome(result),
      complete: true,
      tableId: normalizeTableId(tableId),
      shoeIdentity: String(shoeIdentity)
    };
  }
  function dgPersistenceReadSnapshot() {
    try {
      const raw = sessionStorage.getItem(DG_CANONICAL_ROUNDS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function dgPersistenceValidateSnapshot(snapshot, tableId, shoeIdentity) {
    if (!snapshot || snapshot.version !== DG_CANONICAL_ROUNDS_VERSION || normalizeTableId(snapshot.tableId) !== normalizeTableId(tableId) || String(snapshot.shoeIdentity || '') !== String(shoeIdentity || '') || !Array.isArray(snapshot.rounds) || snapshot.rounds.length > DG_CANONICAL_ROUNDS_LIMIT) return { ok: false, reason: 'malformed-or-identity-mismatch' };
    const seen = new Map();
    for (const item of snapshot.rounds) {
      const canonical = dgPersistenceCanonicalRoundFromState(item, tableId, shoeIdentity);
      if (!canonical) return { ok: false, reason: 'malformed-round' };
      const key = String(canonical.roundIdentity);
      const prior = seen.get(key);
      if (prior && JSON.stringify(prior.result) !== JSON.stringify(canonical.result)) return { ok: false, reason: 'duplicate-conflicting-round' };
      seen.set(key, canonical);
    }
    return { ok: true, rounds: [...seen.values()].sort((a, b) => a.roundIndex - b.roundIndex) };
  }
  function dgCanonicalOwnerRounds(tableId, shoeIdentity) {
    return [...state.rounds.values()].map(item => dgPersistenceCanonicalRoundFromState(item, tableId, shoeIdentity)).filter(Boolean).sort((a, b) => a.roundIndex - b.roundIndex).slice(-DG_CANONICAL_ROUNDS_LIMIT);
  }
  function dgCanonicalOwnerSaveSnapshot(tableId, shoeIdentity) {
    if (!isTopWindow || !window.opener || !dgOwnsIdentity(tableId) || normalizeTableId(state.dg.ownership.tableId) !== normalizeTableId(tableId) || state.activeTableSource !== 'dg-binary') return false;
    const snapshot = { version: DG_CANONICAL_OWNER_VERSION, tableId: normalizeTableId(tableId), shoeIdentity: String(shoeIdentity || ''), canonicalRounds: dgCanonicalOwnerRounds(tableId, shoeIdentity) };
    if (!snapshot.tableId || !/^\d+$/.test(snapshot.shoeIdentity) || JSON.stringify(snapshot).length > 65536) return false;
    try {
      window.opener.postMessage({ type: DG_CANONICAL_OWNER_SAVE, snapshot, runtimeInstanceId: state.dg.lifecycle.runtimeInstanceId || null }, '*');
      dgCanonicalOwnerTelemetry('OWNER_SAVE_POSTED', { tableId: snapshot.tableId, shoeIdentity: snapshot.shoeIdentity, roundCount: snapshot.canonicalRounds.length });
      return true;
    } catch (_) { return false; }
  }
  function dgCanonicalOwnerRequest(tableId, shoeIdentity) {
    if (!isTopWindow || !window.opener || !dgOwnsIdentity(tableId) || normalizeTableId(state.dg.ownership.tableId) !== normalizeTableId(tableId)) return false;
    const key = `${normalizeTableId(tableId)}|${String(shoeIdentity || '')}`;
    if (state.dgCanonicalOwner.requestKey === key || state.dgCanonicalOwner.responseAccepted) return false;
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    state.dgCanonicalOwner.requestKey = key; state.dgCanonicalOwner.requestId = requestId;
    try {
      window.opener.postMessage({ type: DG_CANONICAL_OWNER_REQUEST, requestId, tableId: normalizeTableId(tableId), shoeIdentity: String(shoeIdentity || ''), runtimeInstanceId: state.dg.lifecycle.runtimeInstanceId || null }, '*');
      dgCanonicalOwnerTelemetry('OWNER_REQUEST_POSTED', { tableId: normalizeTableId(tableId), shoeIdentity: String(shoeIdentity || ''), requestId });
      return true;
    } catch (_) { return false; }
  }
  function dgCanonicalOwnerApplySnapshot(snapshot, tableId, shoeIdentity) {
    if (!snapshot || snapshot.version !== DG_CANONICAL_OWNER_VERSION || normalizeTableId(snapshot.tableId) !== normalizeTableId(tableId) || String(snapshot.shoeIdentity || '') !== String(shoeIdentity || '') || !Array.isArray(snapshot.canonicalRounds) || snapshot.canonicalRounds.length > DG_CANONICAL_ROUNDS_LIMIT) return false;
    const candidate = { version: DG_CANONICAL_ROUNDS_VERSION, tableId: normalizeTableId(tableId), shoeIdentity: String(shoeIdentity), rounds: snapshot.canonicalRounds };
    const validation = dgPersistenceValidateSnapshot(candidate, tableId, shoeIdentity);
    if (!validation.ok) return false;
    let restored = 0;
    for (const canonical of validation.rounds) {
      const key = String(canonical.roundIdentity), current = state.rounds.get(key);
      if (current) { if (JSON.stringify(current.result) !== JSON.stringify(canonical.result)) state.dgCanonicalOwner.conflictRoundKeys.add(key); continue; }
      state.rounds.set(key, { round: canonical.roundIndex, roundIdentity: canonical.roundIdentity, roundIndex: canonical.roundIndex, result: canonical.result.slice(), cards: canonical.cards.slice(), outcome: canonical.outcome, complete: canonical.complete });
      state.dgCanonicalOwner.restoredRoundKeys.add(key); restored += 1;
    }
    if (restored) { recompute(); render(); }
    state.dgCanonicalOwner.responseAccepted = true;
    return true;
  }
  function dgPersistenceSaveSnapshot(tableId, shoeIdentity) {
    const verifiedTableId = normalizeTableId(tableId);
    const verifiedShoe = String(shoeIdentity || '');
    if (!isTopWindow || !verifiedTableId || !verifiedShoe || !dgOwnsIdentity(verifiedTableId) || normalizeTableId(state.dg.ownership.tableId) !== verifiedTableId || state.activeTableSource !== 'dg-binary') return false;
    const rounds = [...state.rounds.values()].map(item => dgPersistenceCanonicalRoundFromState(item, verifiedTableId, verifiedShoe)).filter(Boolean).sort((a, b) => a.roundIndex - b.roundIndex).slice(-DG_CANONICAL_ROUNDS_LIMIT);
    const snapshot = { version: DG_CANONICAL_ROUNDS_VERSION, savedAt: Date.now(), tableId: verifiedTableId, shoeIdentity: verifiedShoe, rounds };
    try {
      sessionStorage.setItem(DG_CANONICAL_ROUNDS_STORAGE_KEY, JSON.stringify(snapshot));
      dgPersistenceEvidencePush('SAVE', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: rounds.length, reason: 'verified-complete-round-entered-canonical-state' });
      dgCanonicalOwnerSaveSnapshot(verifiedTableId, verifiedShoe);
      return true;
    } catch (_) {
      dgPersistenceEvidencePush('SAVE', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: rounds.length, reason: 'session-storage-write-failed' });
      return false;
    }
  }
  function dgPersistenceRestoreIfEligible(tableId, shoeIdentity) {
    if (!isTopWindow) return false;
    dgPersistenceEvidencePush('RESTORE_REJECT_LEGACY_OWNER', { tableId, shoeIdentity, reason: 'loader-memory-owner-authoritative' });
    return false;
    const verifiedTableId = normalizeTableId(tableId);
    const verifiedShoe = String(shoeIdentity || '');
    const restoreKey = `${verifiedTableId || ''}|${verifiedShoe}`;
    if (!verifiedTableId || !verifiedShoe || !dgOwnsIdentity(verifiedTableId) || normalizeTableId(state.dg.ownership.tableId) !== verifiedTableId) {
      dgPersistenceEvidencePush('RESTORE_REJECT_UNVERIFIED', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, reason: 'ownership-or-shoe-unverified' });
      return false;
    }
    if (state.dgPersistence.restoreKey === restoreKey) return false;
    state.dgPersistence.restoreKey = restoreKey;
    const snapshot = dgPersistenceReadSnapshot();
    if (!snapshot) return false;
    if (snapshot.version !== DG_CANONICAL_ROUNDS_VERSION || normalizeTableId(snapshot.tableId) !== verifiedTableId) {
      dgPersistenceEvidencePush('RESTORE_REJECT_TABLE', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: Array.isArray(snapshot.rounds) ? snapshot.rounds.length : 0, reason: 'snapshot-table-mismatch-or-version' });
      return false;
    }
    if (String(snapshot.shoeIdentity || '') !== verifiedShoe) {
      dgPersistenceEvidencePush('RESTORE_REJECT_SHOE', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: Array.isArray(snapshot.rounds) ? snapshot.rounds.length : 0, reason: 'snapshot-shoe-mismatch' });
      return false;
    }
    const validation = dgPersistenceValidateSnapshot(snapshot, verifiedTableId, verifiedShoe);
    if (!validation.ok) {
      dgPersistenceEvidencePush('RESTORE_REJECT_MALFORMED', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: Array.isArray(snapshot.rounds) ? snapshot.rounds.length : 0, reason: validation.reason });
      return false;
    }
    let restored = 0;
    for (const canonical of validation.rounds) {
      const key = String(canonical.roundIdentity);
      const current = state.rounds.get(key);
      if (current) {
        if (JSON.stringify(current.result) !== JSON.stringify(canonical.result)) {
          dgPersistenceEvidencePush('RESTORE_CONFLICT_LIVE_WINS', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: state.rounds.size, reason: `round:${key}` });
          state.dgPersistence.conflictRoundKeys.add(key);
        }
        continue;
      }
      state.rounds.set(key, { round: canonical.roundIndex, roundIdentity: canonical.roundIdentity, roundIndex: canonical.roundIndex, result: canonical.result.slice(), cards: canonical.cards.slice(), outcome: canonical.outcome });
      state.dgPersistence.restoredRoundKeys.add(key);
      restored += 1;
    }
    state.tableId = verifiedTableId;
    state.shoe = verifiedShoe;
    if (validation.rounds.length) state.lastRound = validation.rounds.at(-1).roundIdentity;
    recompute();
    render();
    dgPersistenceEvidencePush('RESTORE_ACCEPT', { tableId: verifiedTableId, shoeIdentity: verifiedShoe, roundCount: restored, reason: 'same-table-same-shoe-canonical-rounds' });
    return restored > 0;
  }
  function dgPersistenceClear(event, reason, tableId = null, shoeIdentity = null) {
    try { sessionStorage.removeItem(DG_CANONICAL_ROUNDS_STORAGE_KEY); } catch (_) {}
    state.dgPersistence.restoreKey = null;
    state.dgPersistence.restoredRoundKeys.clear();
    state.dgPersistence.conflictRoundKeys.clear();
    dgPersistenceEvidencePush(event, { tableId, shoeIdentity, roundCount: 0, reason });
  }


  function getRoomType() {
    const recentOutcomes = state.modelEstimate.initialized
      ? dgModelEstimateRecentOutcomes()
      : state.lastFive;
    const analysisCount = dgAnalysisCount();
    if (
      recentOutcomes.length < 5
    ) {
      return '樣本不足';
    }

    const player =
      recentOutcomes.filter(
        x => x === 'PLAYER'
      ).length;

    const banker =
      recentOutcomes.filter(
        x => x === 'BANKER'
      ).length;

    if (analysisCount > 0) {
      if (player >= 3) {
        return '正打房';
      }

      if (banker >= 3) {
        return '反打房';
      }
    }

    if (analysisCount < 0) {
      if (banker >= 3) {
        return '正打房';
      }

      if (player >= 3) {
        return '反打房';
      }
    }

    return '等待判斷';
  }

  function getDirection() {
    const room = getRoomType();
    if (
      dgAnalysisCount() === 0 ||
      (room !== '正打房' && room !== '反打房')
    ) {
      return 'WAIT';
    }
    if (dgAnalysisCount() > 0) {
      return room === '正打房' ? 'PLAYER' : 'BANKER';
    }
    return room === '正打房' ? 'BANKER' : 'PLAYER';
  }

  function currentRoundItem() {
    if (
      state.lastRound !== null
    ) {
      const exact =
        state.rounds.get(
          String(state.lastRound)
        );

      if (exact) {
        return exact;
      }
    }

    const items = [
      ...state.rounds.values()
    ];

    if (!items.length) {
      return null;
    }

    return items.sort(
      (a, b) =>
        Number(b.round) -
        Number(a.round)
    )[0];
  }

  function currentRoundCount() {
    const item =
      currentRoundItem();

    if (!item) {
      return 0;
    }

    return item.cards.reduce(
      (sum, id) =>
        sum +
        cardCount(rank(id)),
      0
    );
  }

  function countPlayerBanker() {
    const recentOutcomes = state.modelEstimate.initialized
      ? dgModelEstimateRecentOutcomes()
      : state.lastFive;
    return {
      player:
        recentOutcomes.filter(
          x => x === 'PLAYER'
        ).length,

      banker:
        recentOutcomes.filter(
          x => x === 'BANKER'
        ).length
    };
  }

  function signed(n) {
    const value = Number(n) || 0;

    return value > 0
      ? `+${value}`
      : String(value);
  }

  // =====================================================
  // Panel
  // =====================================================

  let panel = null;

  function removePanel() {
    if (panel) {
      try {
        panel.remove();
      } catch (_) {}

      panel = null;
    }

    document
      .querySelectorAll(
        '#baccarat-pulse-mobile-panel'
      )
      .forEach(node => node.remove());
  }

  function cardHtml(cardId, side) {
    if (!cardId) {
      return '';
    }

    const r = rank(cardId);
    const value = cardCount(r);

    const countClass =
      value > 0
        ? 'bp-plus'
        : value < 0
          ? 'bp-minus'
          : 'bp-zero';

    return `
      <div class="bp-card ${side}">
        <div class="bp-card-rank">
          ${rankLabel(r)}
        </div>

        <div class="bp-card-count ${countClass}">
          ${signed(value)}
        </div>
      </div>
    `;
  }

  function createPanel() {
    if (!licenseValid) {
      return;
    }

    if (
      panel &&
      document.documentElement.contains(panel)
    ) {
      document
        .querySelectorAll(
          '#baccarat-pulse-mobile-panel'
        )
        .forEach(node => {
          if (node !== panel) node.remove();
        });
      const buttonGroup = panel.querySelector('#bp-export-record-probe-diagnostics')?.parentElement || panel;
      if (!panel.querySelector('#bp-export-room-entry-bootstrap')) {
        const button = document.createElement('button');
        button.id = 'bp-export-room-entry-bootstrap';
        button.type = 'button';
        button.textContent = 'Export Room Entry Bootstrap Capture';
        button.style.cssText = 'width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer';
        buttonGroup.appendChild(button);
        button.addEventListener('click', exportRoomEntryBootstrapCapture);
      }
      if (!panel.querySelector('#bp-export-socket-diagnostics')) {
        const button = document.createElement('button');
        button.id = 'bp-export-socket-diagnostics';
        button.type = 'button';
        button.textContent = 'Export WebSocket Diagnostics';
        button.style.cssText = 'width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer';
        buttonGroup.appendChild(button);
        button.addEventListener('click', exportSocketDiagnostics);
      }
      if (!panel.querySelector('#bp-export-inbound-game-packets')) {
        const button = document.createElement('button');
        button.id = 'bp-export-inbound-game-packets';
        button.type = 'button';
        button.textContent = 'Export Inbound Game Packets';
        button.style.cssText = 'width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer';
        buttonGroup.appendChild(button);
        button.addEventListener('click', exportInboundGamePackets);
      }
      addDgDataDebugButton(buttonGroup);
      return;
    }

    removePanel();

    panel =
      document.createElement('div');

    panel.id =
      'baccarat-pulse-mobile-panel';

    panel.innerHTML = `
      <style>
        #baccarat-pulse-mobile-panel {
          position: fixed;
          top: 65px;
          right: 8px;
          width: min(350px, calc(100vw - 16px));
          max-height: calc(100vh - 90px);
          z-index: 2147483647;
          color: #eaf4ff;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
          background:
            linear-gradient(
              180deg,
              rgba(5,18,35,.97),
              rgba(4,13,27,.97)
            );
          border:
            1px solid rgba(119,176,226,.38);
          border-radius: 18px;
          box-shadow:
            0 18px 50px rgba(0,0,0,.55);
          overflow: hidden;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          font-size: 12px;
        }

        #baccarat-pulse-mobile-panel * {
          box-sizing: border-box;
        }

        .bp-header {
          padding: 12px 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom:
            1px solid rgba(119,176,226,.18);
          touch-action: none;
        }

        .bp-logo {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #0ea5e9;
          color: #38bdf8;
          font-size: 19px;
          flex: 0 0 auto;
        }

        .bp-head-main {
          flex: 1;
          min-width: 0;
        }

        .bp-title {
          font-size: 14px;
          font-weight: 800;
        }

        .bp-sub {
          margin-top: 3px;
          color: #8fa8bd;
          font-size: 9px;
        }

        .bp-live {
          color: #43e7ba;
          font-size: 9px;
          font-weight: 800;
        }

        .bp-toggle {
          border: 0;
          border-radius: 6px;
          width: 27px;
          height: 27px;
          background: rgba(100,130,160,.18);
          color: white;
          font-size: 17px;
        }

        .bp-body {
          padding: 10px;
          overflow-y: auto;
          max-height: calc(100vh - 150px);
        }

        .bp-section {
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 12px;
          border:
            1px solid rgba(95,148,195,.23);
          background: rgba(7,21,39,.58);
        }

        .bp-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .bp-muted {
          color: #91a7ba;
          font-size: 9px;
        }

        .bp-count {
          margin-top: 6px;
          font-size: 34px;
          font-weight: 900;
        }

        .bp-positive {
          color: #29baf7;
        }

        .bp-negative {
          color: #fb7185;
        }

        .bp-zero-count {
          color: #dbe7f1;
        }

        .bp-badge {
          padding: 4px 7px;
          border-radius: 6px;
          font-weight: 900;
          font-size: 10px;
        }

        .bp-player-badge {
          color: #4bc7ff;
          border: 1px solid #168ecc;
          background: rgba(4,113,175,.18);
        }

        .bp-banker-badge {
          color: #ff8198;
          border: 1px solid #d12c55;
          background: rgba(156,23,66,.17);
        }

        .bp-wait-badge {
          color: #bac8d4;
          border: 1px solid #586e80;
          background: rgba(90,110,128,.15);
        }

        .bp-room {
          padding: 5px 9px;
          border-radius: 8px;
          border: 1px solid #d88b16;
          color: #ffb421;
          background: rgba(142,84,7,.18);
          font-weight: 900;
        }

        .bp-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-top: 8px;
        }

        .bp-side {
          padding: 8px;
          border-radius: 9px;
        }

        .bp-side.player {
          border: 1px solid rgba(28,162,230,.35);
          background: rgba(4,88,139,.15);
        }

        .bp-side.banker {
          border: 1px solid rgba(224,57,94,.35);
          background: rgba(123,12,46,.18);
        }

        .bp-side-title {
          font-size: 10px;
          font-weight: 900;
          margin-bottom: 7px;
        }

        .bp-side-title.player {
          color: #50c8ff;
        }

        .bp-side-title.banker {
          color: #ff8499;
        }

        .bp-cards {
          display: flex;
          gap: 5px;
        }

        .bp-card {
          flex: 1;
          height: 56px;
          position: relative;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .bp-card.player {
          border: 1px solid #168fd0;
        }

        .bp-card.banker {
          border: 1px solid #d9355d;
        }

        .bp-card-rank {
          font-size: 18px;
          font-weight: 900;
        }

        .bp-card-count {
          position: absolute;
          right: -2px;
          bottom: -5px;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 8px;
          font-weight: 900;
        }

        .bp-plus {
          background: #13b883;
          color: white;
        }

        .bp-minus {
          background: #f2a90f;
          color: #111;
        }

        .bp-zero {
          background: #42566b;
          color: white;
        }

        .bp-results {
          margin-top: 8px;
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 4px;
        }

        .bp-result {
          padding: 6px 2px;
          text-align: center;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 800;
        }

        .bp-result.player {
          color: #55c8ff;
          border: 1px solid #148bc7;
        }

        .bp-result.banker {
          color: #ff8397;
          border: 1px solid #bd3154;
        }

        .bp-result.empty {
          color: #647789;
          border: 1px solid #34495a;
        }

        .bp-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 8px;
        }

        .bp-stat {
          padding: 7px;
          border-radius: 7px;
          font-size: 9px;
          display: flex;
          justify-content: space-between;
        }

        .bp-stat.player {
          color: #5dcfff;
          background: rgba(10,109,166,.13);
        }

        .bp-stat.banker {
          color: #ff859b;
          background: rgba(137,17,53,.16);
        }

        .bp-footer {
          margin-top: 4px;
          font-size: 8px;
          color: #8297a9;
          text-align: center;
        }

        .bp-ok {
          color: #29dfaa;
        }
      </style>

      <div
        class="bp-header"
        id="bp-drag-header"
      >
        <div class="bp-logo">
          〽
        </div>

        <div class="bp-head-main">
          <div class="bp-title">
            桌號 <span id="bp-table">—</span>
          </div>

          <div class="bp-sub">
            靴 #<span id="bp-shoe">—</span>
            ｜局 #<span id="bp-round">—</span>
            
          </div>
        </div>

        <div class="bp-live">
          ● 即時
        </div>

        <button
          class="bp-toggle"
          id="bp-toggle"
        >
          −
        </button>
      </div>

      <div
        class="bp-body"
        id="bp-body"
      >
        <div class="bp-section">
          <div class="bp-row">
            <b>✨ 目前 總和</b>

            <span
              id="bp-direction"
              class="bp-badge bp-wait-badge"
            >
              等待
            </span>
          </div>

          <div class="bp-row">
            <div>
              <span
                id="bp-count"
                class="bp-count bp-zero-count"
              >
                0
              </span>

              <span
                id="bp-total"
                class="bp-muted"
              >
                (累積 0 局)
              </span>
            </div>

            <span
              id="bp-room"
              class="bp-room"
            >
              樣本不足
            </span>
          </div>
        </div>

        <div class="bp-section" id="bp-dragon-section">
          <div class="bp-row">
            <b>龍寶 5+</b>
            <span>
              <span id="bp-dragon-probability" class="bp-badge bp-wait-badge">N/A</span>
              <span id="bp-dragon-tier" class="bp-muted" style="margin-left:4px;font-size:10px"></span>
            </span>
          </div>
          <div id="bp-dragon-detail" class="bp-muted" style="font-size:9px;line-height:1.55;margin-top:5px">方向：等待<br>模擬次數：100,000<br>已出牌：— ｜ 剩餘牌：—</div>
        </div>

        <div class="bp-section" id="bp-pair-section" style="padding-top:5px;padding-bottom:5px">
          <div class="bp-row">
            <b>對子</b>
            <span>
              <span id="bp-pair-probability" class="bp-badge bp-wait-badge">N/A</span>
              <span id="bp-pair-tier" class="bp-muted" style="margin-left:4px;font-size:10px"></span>
            </span>
          </div>
        </div>

        <div class="bp-section">
          <div class="bp-row">
            <b>
              當局即時牌面
            </b>

            <span class="bp-muted">
              當局 計數:
              <b id="bp-round-count">
                0
              </b>
            </span>
          </div>

          <div class="bp-card-grid">
            <div class="bp-side player">
              <div class="bp-side-title player">
                閒
              </div>

              <div
                class="bp-cards"
                id="bp-player-cards"
              ></div>
            </div>

            <div class="bp-side banker">
              <div class="bp-side-title banker">
                莊
              </div>

              <div
                class="bp-cards"
                id="bp-banker-cards"
              ></div>
            </div>
          </div>
        </div>

        <div class="bp-section">
          <div class="bp-row">
            <b>◎ 最近五局有效結果</b>

            <span
              id="bp-sample"
              class="bp-muted"
            >
              0/5
            </span>
          </div>

          <div
            class="bp-results"
            id="bp-results"
          ></div>

          <div class="bp-stats">
            <div class="bp-stat player">
              PLAYER
              <b id="bp-player-times">
                0 次
              </b>
            </div>

            <div class="bp-stat banker">
              BANKER
              <b id="bp-banker-times">
                0 次
              </b>
            </div>
          </div>
        </div>

        <div
          class="bp-section"
          id="bp-outbound-debug-section"
          style="display:none"
        >
          <div class="bp-row">
            <b>Outbound Debug Capture</b>
            <span id="bp-outbound-count" class="bp-muted">0 packets</span>
          </div>
          <div class="bp-muted" style="font-size:9px;line-height:1.5">
            activeTableId: <span id="bp-active-table">—</span><br>
            activeTableSource: <span id="bp-active-source">—</span><br>
            ignoredForeignTablePackets: <span id="bp-ignored-foreign">0</span>
          </div>
          <button id="bp-export-outbound" type="button" style="width:100%;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Debug Capture
          </button>
          <button id="bp-export-table-list" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Table List Mapping
          </button>
          <button id="bp-export-handshake" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Active Table Handshake
          </button>
          <button id="bp-export-history" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export History Capture
          </button>
          <button id="bp-export-record-probe" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Record Probe
          </button>
          <button id="bp-export-live-result-trace" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Live Result Trace
          </button>
          <button id="bp-export-bootstrap" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Active Table Bootstrap
          </button>
          <button id="bp-export-record-probe-diagnostics" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Record Probe Diagnostics
          </button>
          <button id="bp-export-room-entry-bootstrap" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Room Entry Bootstrap Capture
          </button>
          <button id="bp-export-socket-diagnostics" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export WebSocket Diagnostics
          </button>
          <button id="bp-export-inbound-game-packets" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            Export Inbound Game Packets
          </button>
          <button id="bp-dg-data-debug" type="button" style="width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer">
            DG DATA DEBUG
          </button>
        </div>

        <div class="bp-footer">
          防重複計數
          <span class="bp-ok">
            ● 桌號＋靴號＋局號
          </span>
        </div>
      </div>
    `;

    (
      document.documentElement ||
      document.body
    ).appendChild(panel);

    const exportButton = panel.querySelector('#bp-export-outbound');
    exportButton.addEventListener('click', exportOutboundCapture);

    const tableListButton = panel.querySelector('#bp-export-table-list');
    tableListButton.addEventListener('click', exportTableListMapping);

    const handshakeButton = panel.querySelector('#bp-export-handshake');
    handshakeButton.addEventListener('click', exportActiveTableHandshake);

    const historyButton = panel.querySelector('#bp-export-history');
    historyButton.addEventListener('click', exportHistoryCapture);
    const recordProbeButton = panel.querySelector('#bp-export-record-probe');
    recordProbeButton.addEventListener('click', runAndExportRecordProbe);
    const liveResultTraceButton = panel.querySelector('#bp-export-live-result-trace');
    liveResultTraceButton.addEventListener('click', exportLiveResultTrace);
    const bootstrapButton = panel.querySelector('#bp-export-bootstrap');
    bootstrapButton.addEventListener('click', exportActiveTableBootstrap);
    const recordProbeDiagnosticsButton = panel.querySelector('#bp-export-record-probe-diagnostics');
    recordProbeDiagnosticsButton.addEventListener('click', exportRecordProbeDiagnostics);
    const roomEntryButton = panel.querySelector('#bp-export-room-entry-bootstrap');
    roomEntryButton.addEventListener('click', exportRoomEntryBootstrapCapture);
    const socketDiagnosticsButton = panel.querySelector('#bp-export-socket-diagnostics');
    socketDiagnosticsButton.addEventListener('click', exportSocketDiagnostics);
    const inboundPacketsButton = panel.querySelector('#bp-export-inbound-game-packets');
    inboundPacketsButton.addEventListener('click', exportInboundGamePackets);
    const dgDataDebugButton = panel.querySelector('#bp-dg-data-debug');
    dgDataDebugButton.addEventListener('click', showDgDataDebugOverlay);

    const toggle =
      panel.querySelector('#bp-toggle');

    const body =
      panel.querySelector('#bp-body');

    toggle.addEventListener(
      'click',
      function (e) {
        e.stopPropagation();

        const hidden =
          body.style.display === 'none';

        body.style.display =
          hidden ? 'block' : 'none';

        toggle.textContent =
          hidden ? '−' : '+';
      }
    );

    const header =
      panel.querySelector(
        '#bp-drag-header'
      );

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener(
      'touchstart',
      function (e) {
        if (
          e.target.id === 'bp-toggle'
        ) {
          return;
        }

        const touch = e.touches[0];
        const rect =
          panel.getBoundingClientRect();

        dragging = true;

        offsetX =
          touch.clientX - rect.left;

        offsetY =
          touch.clientY - rect.top;

        panel.style.right = 'auto';
      },
      {
        passive: true
      }
    );

    header.addEventListener(
      'touchmove',
      function (e) {
        if (!dragging) {
          return;
        }

        const touch = e.touches[0];

        let left =
          touch.clientX - offsetX;

        let top =
          touch.clientY - offsetY;

        left = Math.max(
          0,
          Math.min(
            window.innerWidth -
              panel.offsetWidth,
            left
          )
        );

        top = Math.max(
          0,
          Math.min(
            window.innerHeight - 45,
            top
          )
        );

        panel.style.left =
          left + 'px';

        panel.style.top =
          top + 'px';
      },
      {
        passive: true
      }
    );

    header.addEventListener(
      'touchend',
      function () {
        dragging = false;
      },
      {
        passive: true
      }
    );
  }

  function render() {
    if (!isTopWindow) {
      return;
    }

    if (!licenseValid) {
      removePanel();
      return;
    }

    createPanel();

    if (!panel) {
      return;
    }

    const current =
      currentRoundItem();

    const direction =
      getDirection();

    const room =
      getRoomType();

    const stats =
      countPlayerBanker();

    const dgOwnership =
      state.dg?.ownership || null;

    const dgMetadataVerified =
      state.activeTableSource === 'dg-binary' &&
      dgOwnership?.source === 'outbound-control-field6' &&
      dgOwnsIdentity(dgOwnership.tableId);

    const displayTableId =
      dgMetadataVerified
        ? normalizeTableId(dgOwnership.tableId)
        : state.tableId;

    const displayShoe =
      dgMetadataVerified && state.dg?.shoeIdentity
        ? state.dg.shoeIdentity
        : state.shoe;

    const dgRoundIdentity =
      dgMetadataVerified
        ? state.dg?.lastFrame?.roundIdentity
        : null;

    const dgRoundNumber =
      dgRoundIndex(dgRoundIdentity);

    const fallbackRoundNumber =
      dgRoundIndex(state.lastRound);

    const displayRound =
      dgRoundNumber !== null
        ? dgRoundNumber
        : fallbackRoundNumber !== null
          ? fallbackRoundNumber
          : state.lastRound;

    const model = state.modelEstimate;
    const dgModelActive = model.initialized && state.activeTableSource === 'dg-binary';
    const displayCount = dgModelActive ? dgModelEstimateValue() : state.runningCount;

    const countEl =
      panel.querySelector('#bp-count');

    countEl.textContent =
      signed(displayCount);

    countEl.className =
      'bp-count ' +
      (
        displayCount > 0
          ? 'bp-positive'
          : displayCount < 0
            ? 'bp-negative'
            : 'bp-zero-count'
      );

    panel.querySelector('#bp-outbound-count').textContent =
      `${state.outboundCapture.length} packets`;

    panel.querySelector('#bp-active-table').textContent =
      state.activeTableId ?? '—';
    panel.querySelector('#bp-active-source').textContent =
      state.activeTableSource ?? '—';
    panel.querySelector('#bp-ignored-foreign').textContent =
      String(state.ignoredForeignTablePackets);

    panel.querySelector(
      '#bp-total'
    ).textContent =
      `(累積 ${dgModelActive ? dgModelEstimateCompletedRoundCount() : state.rounds.size} 局${dgModelActive ? '｜DG預設起點估算' : ''})`;

    panel.querySelector(
      '#bp-table'
    ).textContent =
      displayTableId ?? '—';

    panel.querySelector(
      '#bp-shoe'
    ).textContent =
      displayShoe ?? '—';

    panel.querySelector(
      '#bp-round'
    ).textContent =
      displayRound ?? '—';

    const directionEl =
      panel.querySelector(
        '#bp-direction'
      );

    directionEl.textContent =
      directionDisplayLabel(direction);

    directionEl.className =
      'bp-badge ' +
      (
        direction === 'PLAYER'
          ? 'bp-player-badge'
          : direction === 'BANKER'
            ? 'bp-banker-badge'
            : 'bp-wait-badge'
      );

    panel.querySelector(
      '#bp-room'
    ).textContent =
      room;

    panel.querySelector(
      '#bp-round-count'
    ).textContent =
      signed(
        currentRoundCount()
      );

    const playerCards =
      current?.result
        ? getPlayerCards(
            current.result
          )
        : [];

    const bankerCards =
      current?.result
        ? getBankerCards(
            current.result
          )
        : [];

    panel.querySelector(
      '#bp-player-cards'
    ).innerHTML =
      playerCards.length
        ? playerCards
            .map(
              card =>
                cardHtml(
                  card,
                  'player'
                )
            )
            .join('')
        : '<span class="bp-muted">等待牌面</span>';

    panel.querySelector(
      '#bp-banker-cards'
    ).innerHTML =
      bankerCards.length
        ? bankerCards
            .map(
              card =>
                cardHtml(
                  card,
                  'banker'
                )
            )
            .join('')
        : '<span class="bp-muted">等待牌面</span>';

    const results = [];

    for (
      let i = 0;
      i < 5;
      i++
    ) {
      const visibleRecentOutcomes = state.modelEstimate.initialized
        ? dgModelEstimateRecentOutcomes()
        : state.lastFive;
      const value =
        visibleRecentOutcomes[i];

      if (!value) {
        results.push(
          '<div class="bp-result empty">—</div>'
        );
      } else if (
        value === 'PLAYER'
      ) {
        results.push(
          '<div class="bp-result player">閒 P</div>'
        );
      } else {
        results.push(
          '<div class="bp-result banker">莊 B</div>'
        );
      }
    }

    panel.querySelector(
      '#bp-results'
    ).innerHTML =
      results.join('');

    panel.querySelector(
      '#bp-sample'
    ).textContent =
      `${(state.modelEstimate.initialized ? dgModelEstimateRecentOutcomes() : state.lastFive).length}/5`;

    panel.querySelector(
      '#bp-player-times'
    ).textContent =
      `${stats.player} 次`;

    panel.querySelector(
      '#bp-banker-times'
    ).textContent =
      `${stats.banker} 次`;

    updateDragonUi();
    scheduleDragonAnalysis();
    updatePairUi();
    schedulePairAnalysis();
  }


  const PAIR_TIER_THRESHOLDS = [0.1453, 0.1464, 0.1494];

  function pairCompletedRoundCount() {
    const currentRound = Number(state.lastRound);
    if (!Number.isFinite(currentRound)) return 0;
    return [...state.rounds.values()].filter(item => {
      const round = Number(item?.round);
      return Number.isInteger(round) && round < currentRound;
    }).length;
  }

  function pairTierThresholds() {
    return PAIR_TIER_THRESHOLDS;
  }

  function getPairTier(probability, completedRounds = pairCompletedRoundCount()) {
    const value = Number(probability);
    if (!Number.isFinite(value)) return '';
    const thresholds = pairTierThresholds(completedRounds);
    if (value < thresholds[0]) return '一般';
    if (value < thresholds[1]) return '偏高';
    if (value < thresholds[2]) return '很高';
    return '極高';
  }

  function pairExactProbability(remainingCounts) {
    const counts = DRAGON_RANKS.map(rank => Number(remainingCounts[rank] || 0));
    const total = counts.reduce((sum, value) => sum + value, 0);
    if (total < 4 || counts.some(value => !Number.isInteger(value) || value < 0)) {
      throw new Error('invalid remaining rank counts for Any Pair');
    }
    const denominator = total * (total - 1) * (total - 2) * (total - 3);
    let noPair = 0;
    for (let p1 = 0; p1 < counts.length; p1 += 1) {
      if (counts[p1] <= 0) continue;
      for (let b1 = 0; b1 < counts.length; b1 += 1) {
        const afterB1 = counts[b1] - (p1 === b1 ? 1 : 0);
        if (afterB1 <= 0) continue;
        const after = counts.slice();
        after[p1] -= 1;
        after[b1] -= 1;
        const remainingAfterInitial = total - 2;
        const p2Eligible = remainingAfterInitial - after[p1];
        const b2Eligible = remainingAfterInitial - 1 - after[b1];
        const sharedCorrection = p1 !== b1 ? after[b1] : 0;
        noPair += counts[p1] * afterB1 * (p2Eligible * b2Eligible + sharedCorrection);
      }
    }
    return (denominator - noPair) / denominator;
  }

  function pairBuildSnapshot() {
    const snapshot = dragonBuildSnapshot();
    return {
      table: snapshot.table,
      shoe: snapshot.shoe,
      rounds: snapshot.rounds,
      signature: JSON.stringify({ table: snapshot.table, shoe: snapshot.shoe, rounds: snapshot.rounds })
    };
  }

  function updatePairUi() {
    if (!panel) return;
    const probabilityEl = panel.querySelector('#bp-pair-probability');
    const tierEl = panel.querySelector('#bp-pair-tier');
    if (!probabilityEl || !tierEl) return;
    const pair = state.pair;
    const ready = pair.status === 'READY' && pair.probability !== null;
    probabilityEl.textContent = ready ? `${(pair.probability * 100).toFixed(2)}%` : 'N/A';
    tierEl.textContent = ready ? getPairTier(pair.probability, pairCompletedRoundCount()) : '';
    probabilityEl.className = `bp-badge ${ready ? 'bp-player-badge' : 'bp-wait-badge'}`;
  }

  function schedulePairAnalysis() {
    const snapshot = pairBuildSnapshot();
    if (!snapshot.table || !Number.isFinite(snapshot.shoe)) {
      state.pair = { ...state.pair, signature: null, status: 'WAIT', probability: null, error: null };
      updatePairUi();
      return;
    }
    if (snapshot.signature === state.pair.signature) return;
    const generation = state.pair.generation + 1;
    state.pair = { ...state.pair, signature: snapshot.signature, generation, status: 'RUNNING', probability: null, error: null };
    try {
      const counts = dragonComputeCounts(snapshot);
      const probability = pairExactProbability(counts.remainingCounts);
      if (generation !== state.pair.generation || snapshot.signature !== state.pair.signature) return;
      state.pair.probability = probability;
      state.pair.status = 'READY';
      updatePairUi();
    } catch (error) {
      state.pair.status = 'ERROR';
      state.pair.error = String(error?.message || error);
      updatePairUi();
    }
  }

  // =====================================================
  // Dragon 5+ Probability — rank-count model only
  // =====================================================

  const DRAGON_RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const DRAGON_DEFAULT_COUNT = 100000;
  const DRAGON_SEED = 20260920;

  function getDragonTier(direction, probability) {
    if (
      direction !== 'PLAYER' &&
      direction !== 'BANKER'
    ) {
      return '';
    }
    if (probability === null || probability === undefined) {
      return '';
    }
    const value = Number(probability);
    if (!Number.isFinite(value)) {
      return '';
    }
    const thresholds = direction === 'PLAYER'
      ? [0.092, 0.094, 0.096]
      : [0.082, 0.084, 0.086];
    if (value < thresholds[0]) return '一般';
    if (value < thresholds[1]) return '偏高';
    if (value < thresholds[2]) return '很高';
    return '極高';
  }

  function dragonRankFromCardId(cardId) {
    const id = Number(cardId);
    if (!Number.isInteger(id) || id <= 0) throw new Error(`invalid card id: ${cardId}`);
    return DRAGON_RANKS[(id - 1) % 13];
  }

  function dragonRankValue(rank) {
    const r = String(rank).toUpperCase();
    if (r === 'A') return 1;
    if (/^[2-9]$/.test(r)) return Number(r);
    if (['10','J','Q','K'].includes(r)) return 0;
    throw new Error(`invalid baccarat rank: ${rank}`);
  }

  function dragonCreateSeededRng(seed) {
    let value = Number(seed) >>> 0;
    return () => {
      value = (value + 0x6D2B79F5) >>> 0;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dragonTotal(cards) {
    return cards.reduce((sum, rank) => (sum + dragonRankValue(rank)) % 10, 0);
  }

  function dragonDrawRank(counts, rng) {
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    if (total <= 0) throw new Error('remaining rank shoe exhausted');
    let cursor = Math.floor(rng() * total);
    for (const rank of DRAGON_RANKS) {
      cursor -= counts[rank];
      if (cursor < 0) {
        counts[rank] -= 1;
        return rank;
      }
    }
    throw new Error('rank draw failed');
  }

  function dragonBankerShouldDraw(total, playerThirdValue = null) {
    if (playerThirdValue == null) return total <= 5;
    return total <= 2 || (total === 3 && playerThirdValue !== 8) || (total === 4 && playerThirdValue >= 2 && playerThirdValue <= 7) || (total === 5 && playerThirdValue >= 4 && playerThirdValue <= 7) || (total === 6 && playerThirdValue >= 6 && playerThirdValue <= 7);
  }

  function dragonSimulateRoundExact(remainingCounts, rng) {
    const counts = { ...remainingCounts };
    // Baccarat initial deal is interleaved: P1, B1, P2, B2.
    const p1 = dragonDrawRank(counts, rng);
    const b1 = dragonDrawRank(counts, rng);
    const p2 = dragonDrawRank(counts, rng);
    const b2 = dragonDrawRank(counts, rng);
    const player = [p1, p2];
    const banker = [b1, b2];
    const initialPlayer = dragonTotal(player);
    const initialBanker = dragonTotal(banker);
    const natural = initialPlayer >= 8 || initialBanker >= 8;
    let playerThird = null;
    if (!natural && initialPlayer <= 5) {
      playerThird = dragonDrawRank(counts, rng);
      player.push(playerThird);
    }
    const bankerNeedsCard = !natural && (playerThird == null
      ? dragonBankerShouldDraw(initialBanker)
      : dragonBankerShouldDraw(initialBanker, dragonRankValue(playerThird)));
    if (bankerNeedsCard) banker.push(dragonDrawRank(counts, rng));
    const playerTotal = dragonTotal(player);
    const bankerTotal = dragonTotal(banker);
    const winner = playerTotal === bankerTotal ? 'TIE' : playerTotal > bankerTotal ? 'PLAYER' : 'BANKER';
    const margin = winner === 'TIE' ? 0 : Math.abs(playerTotal - bankerTotal);
    return { natural, winner, margin };
  }

  function dragonBuildSnapshot() {
    const direction = getDirection();
    const table = normalizeTableId(state.activeTableId);
    const shoe = Number(state.shoe);
    const rounds = [...state.rounds.values()]
      .map(item => ({ round: Number(item?.roundIndex ?? item?.round), cards: Array.isArray(item?.cards) ? item.cards.map(Number).filter(card => card > 0) : getCards(item?.result) }))
      .filter(item => Number.isInteger(item.round) && item.cards.length)
      .sort((a, b) => a.round - b.round);
    const signature = JSON.stringify({ table, shoe, direction, rounds });
    return { table, shoe, direction, rounds, signature };
  }

  function dragonComputeCounts(snapshot) {
    const usedCounts = Object.fromEntries(DRAGON_RANKS.map(rank => [rank, 0]));
    for (const item of snapshot.rounds) {
      for (const card of item.cards) usedCounts[dragonRankFromCardId(card)] += 1;
    }
    const remainingCounts = Object.fromEntries(DRAGON_RANKS.map(rank => [rank, 32 - usedCounts[rank]]));
    const usedCards = Object.values(usedCounts).reduce((sum, value) => sum + value, 0);
    const remainingCards = Object.values(remainingCounts).reduce((sum, value) => sum + value, 0);
    const invalid = DRAGON_RANKS.filter(rank => remainingCounts[rank] < 0 || remainingCounts[rank] > 32);
    if (remainingCards !== 416 - usedCards || invalid.length) throw new Error('Remaining rank-shoe invariant failed');
    return { usedCounts, remainingCounts, usedCards, remainingCards };
  }

  function directionDisplayLabel(direction) {
    return direction === 'PLAYER'
      ? '閒'
      : direction === 'BANKER'
        ? '莊'
        : '等待';
  }

  function updateDragonUi(message = null) {
    if (!panel) return;
    const probability = panel.querySelector('#bp-dragon-probability');
    const tier = panel.querySelector('#bp-dragon-tier');
    const detail = panel.querySelector('#bp-dragon-detail');
    if (!probability || !tier || !detail) return;
    const dragon = state.dragon;
    const direction = getDirection();
    const ready = dragon.status === 'READY' && dragon.probability !== null;
    probability.textContent = ready ? `${(dragon.probability * 100).toFixed(2)}%` : direction === 'WAIT' ? 'N/A' : dragon.status === 'RUNNING' ? '…' : 'N/A';
    tier.textContent = ready ? getDragonTier(direction, dragon.probability) : '';
    probability.className = `bp-badge ${direction === 'WAIT' ? 'bp-wait-badge' : dragon.status === 'READY' ? 'bp-player-badge' : 'bp-wait-badge'}`;
    const counts = dragon.remainingCounts || {};
    detail.innerHTML = `方向：${directionDisplayLabel(direction)}<br>模擬次數：${DRAGON_DEFAULT_COUNT.toLocaleString()}<br>已出牌：${dragon.usedCards} ｜ 剩餘牌：${dragon.remainingCards}<br>A-K: ${DRAGON_RANKS.map(rank => `${rank} ${counts[rank] ?? '—'}`).join(' ｜ ')}${message ? `<br>${message}` : ''}`;
  }

  function scheduleDragonAnalysis() {
    const snapshot = dragonBuildSnapshot();
    const direction = snapshot.direction;
    if (!snapshot.table || !Number.isFinite(snapshot.shoe)) {
      state.dragon = { ...state.dragon, signature: null, status: 'WAIT', probability: null, error: null, usedCards: 0, remainingCards: 416, remainingCounts: null };
      updateDragonUi();
      return;
    }
    if (snapshot.signature === state.dragon.signature) return;
    const generation = state.dragon.generation + 1;
    state.dragon = { ...state.dragon, signature: snapshot.signature, generation, status: direction === 'WAIT' ? 'WAIT' : 'RUNNING', probability: null, count: 0, usedCards: 0, remainingCards: 416, remainingCounts: null, byMargin: { 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }, error: null };
    try {
      const counts = dragonComputeCounts(snapshot);
      state.dragon.usedCards = counts.usedCards;
      state.dragon.remainingCards = counts.remainingCards;
      state.dragon.remainingCounts = counts.remainingCounts;
      if (direction === 'WAIT') { updateDragonUi(); return; }
      const rng = dragonCreateSeededRng(DRAGON_SEED);
      const total = DRAGON_DEFAULT_COUNT;
      const step = () => {
        if (generation !== state.dragon.generation || snapshot.signature !== state.dragon.signature) return;
        const end = Math.min(state.dragon.count + 1000, total);
        while (state.dragon.count < end) {
          const result = dragonSimulateRoundExact(counts.remainingCounts, rng);
          if (!result.natural && result.winner === direction && result.margin >= 5 && result.margin <= 9) {
            state.dragon.probability = (state.dragon.probability || 0) + 1;
            state.dragon.byMargin[result.margin] += 1;
          }
          state.dragon.count += 1;
        }
        updateDragonUi(`Calculating ${state.dragon.count.toLocaleString()} / ${total.toLocaleString()}`);
        if (state.dragon.count < total) {
          setTimeout(step, 0);
        } else {
          state.dragon.probability = (state.dragon.probability || 0) / total;
          state.dragon.status = 'READY';
          updateDragonUi();
        }
      };
      updateDragonUi('Calculating…');
      setTimeout(step, 0);
    } catch (error) {
      state.dragon.status = 'ERROR';
      state.dragon.error = String(error?.message || error);
      updateDragonUi(`ERROR: ${state.dragon.error}`);
    }
  }

  // =====================================================
  // show_poker
  // =====================================================


  function normalizeTableId(value) {
    const text =
      String(value ?? '').trim();

    if (!text) {
      return null;
    }

    if (
      text.length > 64 ||
      !/^[A-Z0-9][A-Z0-9_-]*$/i.test(text) ||
      /^ROOM[_-]?/i.test(text) ||
      /^(?:https?|wss?):/i.test(text)
    ) {
      return null;
    }

    return text.toUpperCase();
  }

  function normalizeTableName(value) {
    const text = String(value ?? '').trim();
    return text ? text.toUpperCase() : null;
  }

  function switchActiveTable(tableId, source) {
    const candidate = normalizeTableId(tableId);

    if (!candidate || candidate === state.activeTableId) {
      return false;
    }

    if (state.activeTableId) {
      state.resetCapture.push({
        timestamp: Date.now(),
        previousTableId: state.activeTableId,
        incomingTableId: candidate,
        previousShoe: state.shoe,
        incomingShoe: null,
        round: null,
        source,
        resetReason: 'confirmed-table-change',
        applied: true
      });
      if (state.resetCapture.length > 100) {
        state.resetCapture.splice(0, state.resetCapture.length - 100);
      }
    }

    const isDgSource = source === 'dg-binary';
    if (state.activeTableId && isTopWindow && isDgSource) dgPersistenceClear('CLEAR_TABLE_CHANGE', 'verified-table-change', state.activeTableId, state.shoe);
    if (!isDgSource) {
      state.historicalHydrationGeneration += 1;
      state.historicalHydrationKey = null;
      state.historicalHydrationRunning = false;
    }
    state.dragon.signature = null;
    state.dragon.generation += 1;
    state.dragon.status = 'WAIT';
    state.dragon.probability = null;
    state.pair.signature = null;
    state.pair.generation += 1;
    state.pair.status = 'WAIT';
    state.pair.probability = null;
    state.activeTableId = candidate;
    state.activeTableSource = source;
    dgModelEstimateReset('TABLE_CHANGED');
    state.tableId = null;
    state.shoe = null;
    state.lastRound = null;
    state.rounds.clear();
    state.dgCanonicalOwner.requestKey = null;
    state.dgCanonicalOwner.requestId = null;
    state.dgCanonicalOwner.responseAccepted = false;
    state.dgCanonicalOwner.restoredRoundKeys.clear();
    state.dgCanonicalOwner.conflictRoundKeys.clear();
    state.runningCount = 0;
    state.lastFive = [];
    if (!isDgSource) initializeTrustedActiveRowContext();
    render();
    return true;
  }

  function initializeTrustedActiveRowContext() {
    const active = normalizeTableId(state.activeTableId);
    if (!active) return false;
    const candidates = state.tableListRows
      .slice()
      .reverse()
      .map(item => item?.primitiveFields || item)
      .filter(item => normalizeTableId(item?.table_id ?? item?.tableId) === active)
      .filter(item => item?.room_id !== null && item?.room_id !== undefined && String(item.room_id).trim())
      .filter(item => item?.shoe !== null && item?.shoe !== undefined && item?.round !== null && item?.round !== undefined);
    const row = candidates[0];
    dgTrustedRoomIdentityObserve({
      source: 'initializeTrustedActiveRowContext',
      tableId: active,
      roomId: row?.room_id ?? row?.roomId ?? null,
      shoe: row?.shoe ?? null,
      round: row?.round ?? null,
      matchedVerifiedOwnership: dgOwnsIdentity(active),
      exactTableListRowPresent: Boolean(row),
      exactRowRoomIdPresent: Boolean(row?.room_id ?? row?.roomId),
      registryRoomIdPresent: Boolean(state.tableIdentityRegistry.get(active)?.roomId),
      recordProbeContextRoomIdPresent: normalizeTableId(state.recordProbeContext?.activeTableId) === active && Boolean(state.recordProbeContext?.roomId),
      finalReason: row ? 'trusted-row-found' : 'exact-row-not-found'
    });
    if (!row) return false;
    state.tableId = active;
    state.shoe = row.shoe;
    state.lastRound = Number(row.round);
    publishRecordProbeContext({ activeTableId: active, roomId: String(row.room_id).trim(), shoe: row.shoe, round: Number(row.round), frameId: DISCOVERY_FRAME_ID, source: 'trusted-active-table-row' });
    render();
    return true;
  }
  function resolvePendingClickedTableName() {
    const tableName = normalizeTableName(
      state.pendingClickedTableName
    );
    if (!tableName) return false;

    const candidates = state.tableNameToIds.get(tableName);
    if (!(candidates instanceof Set) || candidates.size !== 1) {
      return false;
    }

    const exactTableId = Array.from(candidates)[0];
    state.pendingClickedTableName = null;
    return switchActiveTable(
      exactTableId,
      'lobby-gamedesk-click'
    );
  }

  function applyTableNameMappings(entries) {
    if (!Array.isArray(entries)) return false;

    let updated = false;
    for (const entry of entries) {
      const tableName = normalizeTableName(entry?.tableName);
      const tableId = normalizeTableId(entry?.tableId);
      if (!tableName || !tableId) continue;

      let candidates = state.tableNameToIds.get(tableName);
      if (!(candidates instanceof Set)) {
        candidates = new Set();
        state.tableNameToIds.set(tableName, candidates);
      }
      const previousSize = candidates.size;
      candidates.add(tableId);
      if (candidates.size !== previousSize) updated = true;
    }

    resolvePendingClickedTableName();
    return updated;
  }

  function tableNameMappingsFromRows(rows) {
    const entries = [];
    for (const row of Array.isArray(rows) ? rows : []) {
      const tableName = normalizeTableName(row?.table_name);
      const tableId = normalizeTableId(
        row?.table_id ?? row?.tableId
      );
      if (tableName && tableId) {
        entries.push({ tableName, tableId });
      }
    }
    return entries;
  }

  function validPendingMappingRecord(value) {
    if (!value || typeof value !== 'object') return null;
    const relayId = String(value.relayId || '').trim();
    const timestamp = Number(value.timestamp);
    const entries = tableNameMappingsFromRows(
      (Array.isArray(value.entries) ? value.entries : []).map(entry => ({
        table_name: entry?.tableName,
        table_id: entry?.tableId
      }))
    );
    if (
      !relayId ||
      !Number.isFinite(timestamp) ||
      Date.now() - timestamp > 60 * 1000 ||
      !entries.length
    ) {
      return null;
    }
    return { entries, relayId, timestamp };
  }

  function readPendingMappingRecord() {
    const fromWindow = validPendingMappingRecord(
      window[PENDING_MAPPING_WINDOW_KEY]
    );
    if (fromWindow) return fromWindow;
    try {
      return validPendingMappingRecord(
        JSON.parse(
          sessionStorage.getItem(PENDING_MAPPING_STORAGE_KEY) || 'null'
        )
      );
    } catch (_) {
      return null;
    }
  }

  function savePendingMappingRecord(record) {
    pendingMappingRelay = record;
    try { window[PENDING_MAPPING_WINDOW_KEY] = record; } catch (_) {}
    try {
      sessionStorage.setItem(
        PENDING_MAPPING_STORAGE_KEY,
        JSON.stringify(record)
      );
    } catch (_) {}
  }

  function clearPendingMappingRecord(relayId) {
    if (
      relayId &&
      pendingMappingRelay &&
      pendingMappingRelay.relayId !== relayId
    ) {
      return;
    }
    if (relayId) {
      const current = readPendingMappingRecord();
      if (current && current.relayId !== relayId) return;
    }
    pendingMappingRelay = null;
    if (pendingMappingRelayTimer !== null) {
      clearTimeout(pendingMappingRelayTimer);
      pendingMappingRelayTimer = null;
    }
    try { delete window[PENDING_MAPPING_WINDOW_KEY]; } catch (_) {}
    try { sessionStorage.removeItem(PENDING_MAPPING_STORAGE_KEY); } catch (_) {}
  }

  function relayPendingMappingToTop() {
    const record = validPendingMappingRecord(pendingMappingRelay);
    if (!record || isTopWindow) return;
    try {
      window.top.postMessage({
        type: TABLE_MAPPING_RELAY_MESSAGE,
        entries: record.entries,
        relayId: record.relayId,
        timestamp: record.timestamp
      }, '*');
    } catch (_) {}
    if (pendingMappingRelayTimer !== null) {
      clearTimeout(pendingMappingRelayTimer);
    }
    pendingMappingRelayTimer = setTimeout(
      relayPendingMappingToTop,
      120
    );
  }

  function publishTableNameMappings(entries) {
    if (!Array.isArray(entries) || !entries.length) return;
    if (isTopWindow) {
      applyTableNameMappings(entries);
      return;
    }

    const record = {
      entries,
      relayId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now()
    };
    savePendingMappingRecord(record);
    relayPendingMappingToTop();
  }

  function recoverPendingTableNameMappings() {
    const record = readPendingMappingRecord();
    if (!record) {
      clearPendingMappingRecord();
      return false;
    }
    pendingMappingRelay = record;
    if (isTopWindow) {
      applyTableNameMappings(record.entries);
      clearPendingMappingRecord(record.relayId);
    } else {
      relayPendingMappingToTop();
    }
    return true;
  }

  const BOOTSTRAP_SAFE_ATTRIBUTE_PATTERN = /^(?:id|class|role|href|src|name|title|aria-[\w-]+|data-(?:table|room|game|desk|id|name)[\w-]*)$/i;
  function bootstrapSafeValue(name, value) {
    const key = String(name || '');
    if (/token|auth|cookie|session|password|license|balance|member|account|phone|email/i.test(key)) return '[REDACTED]';
    return sanitizeDiscoveryValue(key, value).slice(0, 300);
  }
  function bootstrapNodeSnapshot(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
    const attributes = {};
    for (const attr of Array.from(node.attributes || [])) {
      if (BOOTSTRAP_SAFE_ATTRIBUTE_PATTERN.test(attr.name)) attributes[attr.name] = bootstrapSafeValue(attr.name, attr.value);
    }
    const dataset = {};
    try { for (const [key, value] of Object.entries(node.dataset || {})) dataset[key] = bootstrapSafeValue(`data-${key}`, value); } catch (_) {}
    const primitive = {};
    for (const key of ['id', 'className', 'tagName', 'href', 'route', 'path', 'tableId', 'table_id', 'roomId', 'room_id', 'gameId', 'game_id']) {
      try {
        const value = node[key];
        if (value !== undefined && value !== null && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) primitive[key] = bootstrapSafeValue(key, value);
      } catch (_) {}
    }
    return { tagName: node.tagName, attributes, dataset, primitive };
  }
  function collectActiveTableBootstrap(event, gameDesk, tableName) {
    const ancestors = [];
    let node = gameDesk;
    for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) ancestors.push(bootstrapNodeSnapshot(node));
    const candidateIds = state.tableNameToIds.get(normalizeTableName(tableName));
    const record = {
      timestamp: Date.now(),
      tableName: normalizeTableName(tableName),
      clickTarget: bootstrapNodeSnapshot(event?.target),
      gameDesk: bootstrapNodeSnapshot(gameDesk),
      ancestors,
      registryCandidates: candidateIds instanceof Set ? Array.from(candidateIds).map(normalizeTableId).filter(Boolean) : [],
      activeTableId: normalizeTableId(state.activeTableId),
      pendingClickedTableName: normalizeTableName(state.pendingClickedTableName),
      location: sanitizeDiscoveryUrl(String(location?.href || ''))
    };
    state.activeTableBootstrap.push(record);
    if (state.activeTableBootstrap.length > 20) state.activeTableBootstrap.splice(0, state.activeTableBootstrap.length - 20);
    return record;
  }
  function activeTableBootstrapExportText() {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: 'active-table-bootstrap-v1',
      note: 'Sanitized observation only. No active table was inferred from an untrusted global feed.',
      records: state.activeTableBootstrap.slice(-20)
    }, null, 2);
  }
  async function exportActiveTableBootstrap() {
    await copyTableListText(activeTableBootstrapExportText(), panel?.querySelector('#bp-export-bootstrap'));
  }
  function clickedLobbyTableName(event) {
    let target = event.target;
    if (target?.nodeType !== Node.ELEMENT_NODE) {
      target = target?.parentElement || null;
    }

    let gameDesk = null;
    try {
      gameDesk = target?.closest?.('.gameDesk') || null;
    } catch (_) {}
    if (!gameDesk) return null;

    const tag = gameDesk.querySelector('.gameDesk_tag');
    const text = String(tag?.textContent || '').trim();
    const prefix = '百家樂';
    if (!text.startsWith(prefix)) return null;
    return normalizeTableName(text.slice(prefix.length));
  }

  function applyLobbyTableClick(tableName) {
    const normalized = normalizeTableName(tableName);
    if (!normalized) return false;
    state.pendingClickedTableName = normalized;
    resolvePendingClickedTableName();
    return true;
  }

  function validPendingClickRecord(value) {
    if (!value || typeof value !== 'object') return null;
    const tableName = normalizeTableName(value.tableName);
    const clickId = String(value.clickId || '').trim();
    const timestamp = Number(value.timestamp);
    if (
      !tableName ||
      !clickId ||
      !Number.isFinite(timestamp) ||
      Date.now() - timestamp > 60 * 1000
    ) {
      return null;
    }
    return { tableName, clickId, timestamp };
  }

  function readPendingClickRecord() {
    const fromWindow = validPendingClickRecord(
      window[PENDING_CLICK_WINDOW_KEY]
    );
    if (fromWindow) return fromWindow;

    try {
      return validPendingClickRecord(
        JSON.parse(
          sessionStorage.getItem(PENDING_CLICK_STORAGE_KEY) || 'null'
        )
      );
    } catch (_) {
      return null;
    }
  }

  function savePendingClickRecord(record) {
    pendingClickRelay = record;
    try { window[PENDING_CLICK_WINDOW_KEY] = record; } catch (_) {}
    try {
      sessionStorage.setItem(
        PENDING_CLICK_STORAGE_KEY,
        JSON.stringify(record)
      );
    } catch (_) {}
  }

  function clearPendingClickRecord(clickId) {
    if (
      clickId &&
      pendingClickRelay &&
      pendingClickRelay.clickId !== clickId
    ) {
      return;
    }

    if (clickId) {
      const current = readPendingClickRecord();
      if (current && current.clickId !== clickId) return;
    }

    pendingClickRelay = null;
    if (pendingClickRelayTimer !== null) {
      clearTimeout(pendingClickRelayTimer);
      pendingClickRelayTimer = null;
    }
    try { delete window[PENDING_CLICK_WINDOW_KEY]; } catch (_) {}
    try { sessionStorage.removeItem(PENDING_CLICK_STORAGE_KEY); } catch (_) {}
  }

  function relayPendingClickToTop() {
    const record = validPendingClickRecord(pendingClickRelay);
    if (!record || isTopWindow) return;

    try {
      window.top.postMessage({
        type: TABLE_CLICK_MESSAGE,
        tableName: record.tableName,
        clickId: record.clickId,
        timestamp: record.timestamp
      }, '*');
    } catch (_) {}

    if (pendingClickRelayTimer !== null) {
      clearTimeout(pendingClickRelayTimer);
    }
    pendingClickRelayTimer = setTimeout(
      relayPendingClickToTop,
      120
    );
  }

  function roomEntrySafeUrl(value) {
    try {
      const url = new URL(String(value || ''), location.href);
      for (const key of Array.from(url.searchParams.keys())) if (/token|auth|session|cookie|password|license|member|account/i.test(key)) url.searchParams.delete(key);
      url.hash = '';
      return url.toString().slice(0, 500);
    } catch (_) { return ''; }
  }
  function roomEntryFrameSnapshot() {
    const frames = [];
    try {
      for (const frame of Array.from(document.querySelectorAll('iframe')).slice(0, 30)) {
        frames.push({ src: roomEntrySafeUrl(frame.getAttribute('src') || frame.src || ''), name: String(frame.getAttribute('name') || '').slice(0, 120), id: String(frame.id || '').slice(0, 120) });
      }
    } catch (_) {}
    return frames;
  }
  function roomEntrySnapshot() {
    return { timestamp: Date.now(), frameId: DISCOVERY_FRAME_ID, isTopWindow, location: roomEntrySafeUrl(location.href), frames: roomEntryFrameSnapshot(), activeTableId: normalizeTableId(state.activeTableId), pendingTableName: normalizeTableName(state.pendingClickedTableName), candidates: state.pendingClickedTableName ? Array.from(state.tableNameToIds.get(normalizeTableName(state.pendingClickedTableName)) || []).map(normalizeTableId).filter(Boolean).slice(0, 30) : [], registry: normalizeTableId(state.activeTableId) ? state.tableIdentityRegistry.get(normalizeTableId(state.activeTableId)) || null : null };
  }
  function roomEntryDeepStructure(root) {
    const result = { topKeys: [], actionNames: [], identityPaths: [], keyPaths: [] };
    if (!root || typeof root !== 'object') return result;
    const seen = new WeakSet();
    const queue = [{ value: root, path: 'payload', depth: 0 }];
    const identityKeys = new Set(['table_id','tableId','table_name','tableName','room_id','roomId','shoe','round','game_state','gameState','state','result']);
    let inspected = 0;
    while (queue.length && inspected < 700) {
      const item = queue.shift();
      const value = item.value;
      if (!value || typeof value !== 'object' || seen.has(value)) continue;
      seen.add(value); inspected += 1;
      const keys = Object.keys(value).slice(0, 80);
      if (item.path === 'payload') result.topKeys = keys.slice(0, 40);
      for (const key of keys) {
        const path = `${item.path}.${key}`.slice(0, 500);
        if (identityKeys.has(key)) result.identityPaths.push(path);
        result.keyPaths.push(path);
        const child = value[key];
        if ((key === 'name' || key === 'action' || key === 'command' || key === 'event' || key === 'path' || key === 'route') && (typeof child === 'string' || typeof child === 'number')) {
          const text = String(child);
          if (/\/(?:api|table|room|game|wait|show|record|ready|end)|tablesvg/i.test(text)) result.actionNames.push(text.slice(0, 240));
        }
        if (child && typeof child === 'object') queue.push({ value: child, path, depth: item.depth + 1 });
      }
    }
    result.actionNames = Array.from(new Set(result.actionNames)).slice(0, 40);
    result.identityPaths = Array.from(new Set(result.identityPaths)).slice(0, 80);
    result.keyPaths = Array.from(new Set(result.keyPaths)).slice(0, 160);
    return result;
  }
  function roomEntrySafePacket(item) {
    let parsed = item?.parsed || null;
    if (!parsed && typeof item?.raw === 'string') {
      try { parsed = JSON.parse(item.raw); } catch (_) {}
    }
    const action = parsed && typeof parsed === 'object' ? parsed.action : null;
    const actionData = action && typeof action === 'object' && action.data && typeof action.data === 'object' ? action.data : null;
    const body = parsed && typeof parsed === 'object' ? parsed.body : null;
    const structure = roomEntryDeepStructure(parsed);
    return { timestamp: item?.timestamp || Date.now(), frameId: DISCOVERY_FRAME_ID, isTopWindow, direction: String(item?.direction || '').slice(0, 20), wsUrl: roomEntrySafeUrl(item?.wsUrl || item?.url || ''), actionName: String(action?.name || action || item?.actionName || structure.actionNames[0] || '').slice(0, 240), table_id: body?.table_id ?? body?.tableId ?? actionData?.table_id ?? actionData?.tableId ?? item?.table_id ?? item?.tableId ?? null, table_name: body?.table_name ?? body?.tableName ?? actionData?.table_name ?? actionData?.tableName ?? null, room_id: body?.room_id ?? body?.roomId ?? actionData?.room_id ?? actionData?.roomId ?? item?.room_id ?? null, shoe: body?.shoe ?? actionData?.shoe ?? item?.shoe ?? null, round: body?.round ?? actionData?.round ?? item?.round ?? null, structure };
  }
  function roomEntryStartCapture(event, gameDesk, tableName, clickId) {
    const capture=state.roomEntryBootstrap;
    if (capture.timer) clearInterval(capture.timer);
    capture.active=true; capture.clickId=clickId; capture.startedAt=Date.now(); capture.endsAt=capture.startedAt+15000; capture.before=roomEntrySnapshot(); capture.before.clickedTableName=normalizeTableName(tableName); capture.before.gameDeskTag=String(gameDesk?.tagName || '').slice(0, 40); capture.evidence=[]; capture.joinTableId=null; capture.joinRoomId=null; capture.activeTableIdBefore=null; capture.activeTableIdAfter=null; capture.bootstrapSource=null;
    const tick=()=>{ if (!capture.active) return; capture.evidence.push({ type:'navigation-snapshot', snapshot:roomEntrySnapshot() }); if (Date.now() >= capture.endsAt) { clearInterval(capture.timer); capture.timer=null; capture.active=false; } };
    capture.timer=setInterval(tick, 300); tick();
  }
  function observeRoomEntryEvidence(type, value) {
    const capture=state.roomEntryBootstrap;
    if (!capture.active || Date.now() > capture.endsAt) return;
    const item = type === 'transport' ? { type, transport: value?.transport, method: value?.method, path: roomEntrySafeUrl(value?.path || value?.url || ''), action: value?.action, detectedTableId: value?.detectedTableId, detectedTableName: value?.detectedTableName, detectedShoe: value?.detectedShoe, detectedRound: value?.detectedRound, structure: value?.structure || roomEntryDeepStructure(value?.parsed) } : { type, packet: roomEntrySafePacket(value) };
    capture.evidence.push(item);
    if (capture.evidence.length > 300) capture.evidence.splice(0, capture.evidence.length-300);
  }
  function roomEntryBootstrapExportText() {
    const capture=state.roomEntryBootstrap;
    return JSON.stringify({ exportedAt: new Date().toISOString(), version:'room-entry-bootstrap-deep-v3', note:'Observation only. Exact room join identity is trusted for active-table bootstrap; no global feed inference is used.', clickId:capture.clickId, startedAt:capture.startedAt, endsAt:capture.endsAt, joinTableId: normalizeTableId(capture.joinTableId), joinRoomId: capture.joinRoomId ? String(capture.joinRoomId) : '', activeTableIdBefore: normalizeTableId(capture.activeTableIdBefore), activeTableIdAfter: normalizeTableId(capture.activeTableIdAfter), bootstrapSource: capture.bootstrapSource || null, before:capture.before, after:roomEntrySnapshot(), evidence:capture.evidence.slice(-300) }, null, 2);
  }
  function exportRoomEntryBootstrapCapture() {
    const text=roomEntryBootstrapExportText();
    try { const blob=new Blob([text],{type:'application/json;charset=utf-8'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='BaccaratPulse-Room-Entry-Bootstrap-Deep-Capture.json'; link.style.display='none'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); } catch (_) {}
    try { const promise=navigator.clipboard?.writeText?.(text); if (promise?.catch) promise.catch(()=>{}); } catch (_) {}
  }
  function captureLobbyTableClick(tableName) {
    const normalized = normalizeTableName(tableName);
    if (!normalized) return false;

    state.pendingClickedTableName = normalized;

    const record = {
      tableName: normalized,
      clickId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now()
    };
    savePendingClickRecord(record);

    if (isTopWindow) {
      applyLobbyTableClick(record.tableName);
      clearPendingClickRecord(record.clickId);
    } else {
      relayPendingClickToTop();
    }
    return true;
  }

  function recoverPendingLobbyTableClick() {
    const record = readPendingClickRecord();
    if (!record) {
      clearPendingClickRecord();
      return false;
    }
    pendingClickRelay = record;
    state.pendingClickedTableName = record.tableName;
    if (isTopWindow) {
      applyLobbyTableClick(record.tableName);
      clearPendingClickRecord(record.clickId);
    } else {
      relayPendingClickToTop();
    }
    return true;
  }

  function installLobbyTableClickRouting() {
    const key = '__BP_LOBBY_GAMEDESK_CLICK_ROUTING_DEBUG_V1__';
    if (window[key]) return;
    window[key] = true;

    document.addEventListener('click', event => {
      const tableName = clickedLobbyTableName(event);
      if (!tableName) return;
      let gameDesk = null;
      try {
        const target = event.target?.nodeType === Node.ELEMENT_NODE ? event.target : event.target?.parentElement;
        gameDesk = target?.closest?.('.gameDesk') || null;
      } catch (_) {}
      const clickId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      collectActiveTableBootstrap(event, gameDesk, tableName);
      roomEntryStartCapture(event, gameDesk, tableName, clickId);
      captureLobbyTableClick(tableName);
    }, { capture: true, passive: true });

    recoverPendingTableNameMappings();
    recoverPendingLobbyTableClick();
  }

  function installActiveTableHandshakeTelemetry() {
    const key = '__BP_ACTIVE_TABLE_HANDSHAKE_TELEMETRY_V1__';
    if (window[key]) return;
    window[key] = true;

    const originalSavePendingClickRecord = savePendingClickRecord;
    savePendingClickRecord = function (record) {
      recordHandshakeStage('click-captured', {
        clickId: record?.clickId,
        tableName: record?.tableName
      });
      const result = originalSavePendingClickRecord.apply(this, arguments);
      recordHandshakeStage('click-saved', {
        clickId: record?.clickId,
        tableName: record?.tableName
      });
      return result;
    };

    const originalRelayPendingClickToTop = relayPendingClickToTop;
    relayPendingClickToTop = function () {
      const record = validPendingClickRecord(pendingClickRelay);
      if (record && !isTopWindow) {
        recordHandshakeStage('click-relay-sent', {
          clickId: record.clickId,
          tableName: record.tableName
        });
      }
      return originalRelayPendingClickToTop.apply(this, arguments);
    };

    const originalPublishTableNameMappings = publishTableNameMappings;
    publishTableNameMappings = function (entries) {
      const sampleMappings = handshakeSampleMappings(entries);
      const pendingTableName = state.pendingClickedTableName;
      const candidateTableIds = (Array.isArray(entries) ? entries : [])
        .filter(entry =>
          !pendingTableName ||
          normalizeTableName(entry?.tableName) ===
            normalizeTableName(pendingTableName)
        )
        .map(entry => normalizeTableId(entry?.tableId))
        .filter(Boolean);
      recordHandshakeStage('tablesvg-mapping-extracted', {
        tableName: pendingTableName,
        candidateTableIds,
        entryCount: Array.isArray(entries) ? entries.length : 0,
        sampleMappings
      });
      const result = originalPublishTableNameMappings.apply(this, arguments);
      if (isTopWindow && sampleMappings.length) {
        recordHandshakeStage('mapping-applied-top', {
          tableName: pendingTableName,
          candidateTableIds,
          entryCount: Array.isArray(entries) ? entries.length : 0,
          sampleMappings
        });
      }
      return result;
    };

    const originalRelayPendingMappingToTop = relayPendingMappingToTop;
    relayPendingMappingToTop = function () {
      const record = validPendingMappingRecord(pendingMappingRelay);
      if (record && !isTopWindow) {
        const tableName = normalizeTableName(
          state.pendingClickedTableName
        );
        const candidateTableIds = record.entries
          .filter(entry =>
            !tableName ||
            normalizeTableName(entry?.tableName) === tableName
          )
          .map(entry => normalizeTableId(entry?.tableId))
          .filter(Boolean);
        recordHandshakeStage('mapping-relay-sent', {
          clickId: latestHandshakeClickId(tableName),
          tableName,
          candidateTableIds,
          entryCount: record.entries.length,
          sampleMappings: record.entries
        });
      }
      return originalRelayPendingMappingToTop.apply(this, arguments);
    };

    const originalResolvePendingClickedTableName =
      resolvePendingClickedTableName;
    resolvePendingClickedTableName = function () {
      const tableName = normalizeTableName(
        state.pendingClickedTableName
      );
      if (!tableName) {
        return originalResolvePendingClickedTableName.apply(this, arguments);
      }

      const clickId = latestHandshakeClickId(tableName);
      const candidateTableIds = handshakeCandidateTableIds(tableName);
      recordHandshakeStage('pending-resolve-attempt', {
        clickId,
        tableName,
        candidateTableIds
      });
      if (!candidateTableIds.length) {
        recordHandshakeStage('mapping-missing', {
          clickId,
          tableName,
          candidateTableIds
        });
      } else if (candidateTableIds.length === 1) {
        recordHandshakeStage('mapping-already-available', {
          clickId,
          tableName,
          candidateTableIds
        });
      } else {
        recordHandshakeStage('pending-resolve-ambiguous', {
          clickId,
          tableName,
          candidateTableIds
        });
      }

      const previousActiveTableId = normalizeTableId(state.activeTableId);
      const result = originalResolvePendingClickedTableName.apply(
        this,
        arguments
      );
      const activeTableId = normalizeTableId(state.activeTableId);
      if (
        candidateTableIds.length === 1 &&
        activeTableId === candidateTableIds[0] &&
        !state.pendingClickedTableName
      ) {
        recordHandshakeStage('pending-resolve-success', {
          clickId,
          tableName,
          candidateTableIds
        });
        if (activeTableId !== previousActiveTableId) {
          recordHandshakeStage('switch-active-table', {
            clickId,
            tableName,
            candidateTableIds
          });
        }
      }
      return result;
    };
  }

  function actionNameOf(payload) {
    const action =
      payload?.action;

    if (typeof action === 'string') {
      return action;
    }

    if (
      action &&
      typeof action === 'object'
    ) {
      return String(
        action.name ||
        action.path ||
        ''
      );
    }

    return '';
  }

  function parseGameData(raw) {
    const value =
      String(raw ?? '').trim();

    if (!value) {
      return null;
    }

    let resultCode = null;
    let csv = value;

    const hashIndex =
      value.indexOf('#');

    if (hashIndex >= 0) {
      resultCode =
        value
          .slice(0, hashIndex)
          .trim();

      csv =
        value
          .slice(hashIndex + 1)
          .trim();
    }

    const parts =
      csv
        .split(',')
        .map(
          x => Number(x.trim())
        );

    if (
      parts.length < 6 ||
      parts.some(
        x => !Number.isFinite(x)
      )
    ) {
      return null;
    }

    return {
      result: parts,
      resultCode
    };
  }

  function findTablesvgRows(payload) {
    const rows =
      payload?.msg?.tables?.tables;

    return Array.isArray(rows)
      ? rows
      : [];
  }

  async function handleTablesvg(payload) {
    const rows =
      findTablesvgRows(payload);

    if (!rows.length) {
      return false;
    }

    publishTableNameMappings(
      tableNameMappingsFromRows(rows)
    );
    for (const row of rows) {
      mergeTrustedTableIdentity(row);
      const primitiveFields = tableListPrimitiveFields(row);
      if (Object.keys(primitiveFields).length) {
        boundedPush(state.tableListRows, { timestamp: Date.now(), actionName: actionNameOf(payload), actionPath: actionNameOf(payload), arrayPath: 'payload.msg.tables.tables', rowIndex: rows.indexOf(row), primitiveFields }, 300);
      }
    }
    resolvePendingClickedTableName();
    initializeTrustedActiveRowContext();

    if (!isTopWindow) {
      try {
        window.top.postMessage({
          type: FRAME_TABLESVG_MESSAGE,
          payload
        }, '*');
      } catch (_) {}
      return false;
    }

    const active =
      normalizeTableId(
        state.activeTableId
      );

    if (!active) {
      return false;
    }

    const row =
      rows.find(
        item =>
          normalizeTableId(
            item?.table_id ??
            item?.tableId
          ) === active
      ) || null;

    if (!row) {
      state.ignoredForeignTablePackets += rows.length;
      return false;
    }

    const parsed =
      parseGameData(
        row.game_data
      );

    if (!parsed) {
      return false;
    }

    const tableId =
      normalizeTableId(
        row.table_id ??
        row.tableId
      );

    const gameState =
      String(
        row.game_state || ''
      ).toLowerCase();

    const finalized =
      gameState === 'show_win' ||
      parsed.resultCode !== null;

    await handleShowPoker({
      __bpFinalized: finalized,
      __bpSource: 'tablesvg',
      __bpShoeTrusted: true,
      body: {
        result: parsed.result,
        table_id:
          tableId ??
          row.table_id ??
          row.tableId ??
          null,
        shoe:
          row.shoe ??
          row?.trend?.current_shoe ??
          null,
        round:
          row.round ??
          row?.trend?.current_round ??
          null
      }
    });

    return true;
  }

  async function handleShowPoker(payload, relayIdentity = null) {
    if (!isTopWindow) {
      try {
        window.top.postMessage(
          {
            type: 'BACCARAT_PULSE_FRAME_ROUND_V032',
            payload,
            dgIdentity: dgRelayIdentityFromState()
          },
          '*'
        );
      } catch (_) {}
      return;
    }
    if (relayIdentity && !dgRelayIdentityMatchesActive(relayIdentity)) return;

    const authorized =
      await verifyLicense({
        allowPrompt: true
      });

    if (!authorized) {
      return;
    }

    const data =
      parsePacket(payload);

    if (
      !Array.isArray(data.result)
    ) {
      return;
    }

    state.liveResultTrace.push({
      timestamp: Date.now(),
      source: data.source || payload?.__bpSource || 'show_poker',
      tableId: normalizeTableId(data.tableId),
      shoe: data.shoe ?? null,
      round: data.round ?? null,
      finalized: payload?.__bpFinalized ?? data.finalized ?? null,
      result: data.result.slice(),
      playerCards: getPlayerCards(data.result),
      bankerCards: getBankerCards(data.result)
    });
    if (state.liveResultTrace.length > 30) {
      state.liveResultTrace.splice(0, state.liveResultTrace.length - 30);
    }

    const incomingTableId =
      normalizeTableId(data.tableId);

    const activeTableId =
      normalizeTableId(state.activeTableId);

    if (
      !activeTableId ||
      !incomingTableId ||
      incomingTableId !== activeTableId
    ) {
      state.ignoredForeignTablePackets += 1;
      return;
    }

    const storedTableId =
      normalizeTableId(state.tableId);
    if (storedTableId && storedTableId !== activeTableId) {
      state.ignoredForeignTablePackets += 1;
      return;
    }

    const shoeChanged =
      state.shoe !== null &&
      data.shoe !== null &&
      String(state.shoe) !==
        String(data.shoe);

    const shoeTrusted =
      Boolean(
        payload?.__bpShoeTrusted ||
        data.shoeTrusted
      );

    const resetReason =
      shoeChanged && shoeTrusted
        ? 'confirmed-shoe-change'
        : shoeChanged
          ? 'ambiguous-shoe-change-ignored'
          : null;

    if (resetReason) {
      state.resetCapture.push({
        timestamp: Date.now(),
        previousTableId: state.tableId,
        incomingTableId: data.tableId,
        previousShoe: state.shoe,
        incomingShoe: data.shoe,
        round: data.round,
        source: data.source || payload?.__bpSource || 'show_poker',
        resetReason,
        applied: resetReason !== 'ambiguous-shoe-change-ignored'
      });
      if (state.resetCapture.length > 100) {
        state.resetCapture.splice(0, state.resetCapture.length - 100);
      }
    }

    if (shoeChanged && shoeTrusted) {
      if (data.source !== 'dg-binary') {
        state.historicalHydrationGeneration += 1;
        state.historicalHydrationKey = null;
        state.historicalHydrationRunning = false;
      }
      state.rounds.clear();
      state.runningCount = 0;
      state.lastFive = [];
    }

    const existingRound = state.rounds.get(String(data.round ?? ''));
    const existingCardCount = Array.isArray(existingRound?.cards)
      ? existingRound.cards.filter(card => Number(card) > 0).length
      : 0;
    const incomingCardCount = getCards(data.result).length;
    if (
      existingRound &&
      !shoeChanged &&
      incomingCardCount < existingCardCount
    ) {
      return;
    }

    state.tableId = activeTableId;

    if (
      data.shoe !== null &&
      (!shoeChanged || shoeTrusted)
    ) {
      state.shoe =
        data.shoe;
    }

    if (data.round !== null) {
      state.lastRound =
        data.round;
    }

    const roundKey =
      String(
        data.round ??
        `unknown-${Date.now()}`
      );

    state.rounds.set(
      roundKey,
      {
        round:
          data.round ??
          roundKey,

        roundIdentity:
          data.round ??
          roundKey,

        roundIndex:
          data.roundIndex ??
          null,

        result:
          data.result,

        cards:
          getCards(
            data.result
          ),

        outcome:
          payload?.__bpFinalized === false
            ? null
            : getOutcome(
                data.result
              )
      }
    );

    dgModelEstimateAddLiveRound({ ...data, finalized: payload?.__bpFinalized === true });
    recompute();
    render();
    if (data.source === 'dg-binary' && payload?.__bpFinalized === true && dgOwnsIdentity(data.tableId) && normalizeTableId(data.tableId) === normalizeTableId(state.dg.ownership.tableId) && String(data.shoe || '') === String(state.dg.shoeIdentity || '') && state.activeTableSource === 'dg-binary') {
      dgPersistenceSaveSnapshot(state.dg.ownership.tableId, state.dg.shoeIdentity);
    }
  }

  // =====================================================
  // First-use bootstrap
  // =====================================================

  async function bootstrapRuntime() {
    if (!isTopWindow) {
      return;
    }

    if (startupStarted || startupCompleted) {
      return;
    }

    startupStarted = true;

    try {
      // Do not wait for the first /show_poker packet. On a new iPhone install
      // the license prompt must be available before the table emits a round.
      await verifyLicense({ allowPrompt: true });
      startupCompleted = true;
      console.log('[Baccarat Pulse] Startup initialization complete');
    } catch (error) {
      startupStarted = false;
      console.error('[Baccarat Pulse] Startup bootstrap failed', error);
    }
  }

  function scheduleBootstrap() {
    if (!isTopWindow) {
      return;
    }

    void bootstrapRuntime();
  }

  // =====================================================
  // WebSocket
  // =====================================================

  function installWebSocketHook() {
    const source =
      '(' +
      function (eventName, socketSendEventName, socketStatusEventName) {
        const hookKey =
          '__BP_MT_PAGE_RUNTIME_DEBUG_HOOK__';

        if (window[hookKey]) {
          return;
        }

        window[hookKey] = true;

        const NativeWebSocket =
          window.WebSocket;
        const gameSockets = new Set();
        let socketGenerationCounter = 0;
        let transportSequence = 0;
        function emit(raw, direction, wsUrl, binary, socketEvent, socketMeta) {
          window.dispatchEvent(
            new CustomEvent(
              eventName,
              {
                detail: {
                  timestamp: Date.now(),
                  sequence: ++transportSequence,
                  wsUrl: String(wsUrl || ''),
                  direction,
                  raw: String(raw || ''),
                  binary: binary ? Array.from(binary) : null,
                  socketEvent: socketEvent || '',
                  socketGeneration: Number(socketMeta?.generation) || null,
                  socketIdentity: socketMeta?.identity || null,
                  socketOpenedAt: Number(socketMeta?.openedAt) || null,
                  showPoker:
                    /show_poker/i.test(String(raw || '')),
                  tableSvg:
                    /tablesvg/i.test(String(raw || ''))
                }
              }
            )
          );
        }

        async function inspect(raw, direction, wsUrl, socketMeta) {
          let text = '';
          let binary = null;

          if (
            typeof raw === 'string'
          ) {
            text = raw;
          }

          else if (
            raw instanceof Blob
          ) {
            try {
              binary = new Uint8Array(await raw.arrayBuffer());
              text =
                new TextDecoder()
                  .decode(binary);
            } catch (_) {}
          }

          else if (
            raw instanceof ArrayBuffer
          ) {
            try {
              binary = new Uint8Array(raw);
              text =
                new TextDecoder()
                  .decode(binary);
            } catch (_) {}
          }

          else if (
            ArrayBuffer.isView(raw)
          ) {
            try {
              binary = new Uint8Array(
                raw.buffer,
                raw.byteOffset,
                raw.byteLength
              );
              text =
                new TextDecoder()
                  .decode(binary);
            } catch (_) {}
          }

          emit(text, direction, wsUrl, binary, '', socketMeta);
        }

        class BaccaratPulseWebSocket
          extends NativeWebSocket {

          constructor(
            url,
            protocols
          ) {
            super(
              url,
              protocols
            );
            const socketUrl = String(this.url || url || '');
            const socketMeta = {
              generation: ++socketGenerationCounter,
              identity: `dg-ws-${socketGenerationCounter}`,
              openedAt: Date.now()
            };
            try {
              if (/\/game\/ws/i.test(socketUrl)) {
                gameSockets.add(this);
                window.__BP_MT_RECORD_PROBE_GAME_SOCKET__ = this;
                this.addEventListener('close', () => gameSockets.delete(this), { once: true });
              }
            } catch (_) {}
            const nativeSend = this.send;
            this.send = function (data) {
              try { void inspect(data, 'outbound', this.url, socketMeta); } catch (_) {}
              return nativeSend.apply(this, arguments);
            };
            this.addEventListener('open', () => {
              try { emit('', 'inbound', this.url, null, 'open', socketMeta); } catch (_) {}
            }, { once: true });
            this.addEventListener(
              'message',
              event => {
                void inspect(event.data, 'inbound', this.url, socketMeta);
              }
            );
          }
        }

        Object.defineProperties(
          BaccaratPulseWebSocket,
          {
            CONNECTING: {
              value: 0
            },
            OPEN: {
              value: 1
            },
            CLOSING: {
              value: 2
            },
            CLOSED: {
              value: 3
            }
          }
        );

        window.WebSocket =
          BaccaratPulseWebSocket;
        window.addEventListener(socketSendEventName, event => {
          const packets = Array.isArray(event.detail?.packets) ? event.detail.packets : [];
          for (const packet of packets) {
            const socket = Array.from(gameSockets).find(value => value && value.readyState === 1);
            if (!socket) {
              window.dispatchEvent(new CustomEvent(socketStatusEventName, { detail: { stage: 'socket-missing', requestedShoe: event.detail?.requestedShoe, requestedRound: event.detail?.requestedRound } }));
              break;
            }
            window.dispatchEvent(new CustomEvent(socketStatusEventName, { detail: { stage: 'game-socket-found', requestedShoe: event.detail?.requestedShoe, requestedRound: event.detail?.requestedRound, readyState: Number(socket.readyState), url: String(socket.url || '') } }));
            try {
              socket.send(String(packet));
              window.dispatchEvent(new CustomEvent(socketStatusEventName, { detail: { stage: 'record-request-sent', requestedShoe: event.detail?.requestedShoe, requestedRound: event.detail?.requestedRound } }));
            } catch (_) {
              window.dispatchEvent(new CustomEvent(socketStatusEventName, { detail: { stage: 'record-request-send-failed', requestedShoe: event.detail?.requestedShoe, requestedRound: event.detail?.requestedRound } }));
            }
          }
        });

      } +
      ')(' +
      JSON.stringify(EVENT_NAME) +
      ',' +
      JSON.stringify(RECORD_PROBE_SEND_EVENT) +
      ',' +
      JSON.stringify(RECORD_PROBE_STATUS_EVENT) +
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

  function installHistoryTransportHooks() {
    const source =
      '(' +
      function (eventName) {
        const hookKey = '__BP_MT_HISTORY_TRANSPORT_HOOK_V1__';
        if (window[hookKey]) return;
        window[hookKey] = true;

        const MAX_TEXT = 1500000;

        function emit(detail) {
          try {
            window.dispatchEvent(new CustomEvent(eventName, {
              detail: {
                timestamp: Date.now(),
                transport: String(detail.transport || ''),
                direction: String(detail.direction || ''),
                method: String(detail.method || ''),
                url: String(detail.url || ''),
                status: Number(detail.status) || null,
                raw: String(detail.raw || '').slice(0, MAX_TEXT)
              }
            }));
          } catch (_) {}
        }

        async function bodyText(value) {
          try {
            if (typeof value === 'string') return value.slice(0, MAX_TEXT);
            if (value instanceof URLSearchParams) return value.toString().slice(0, MAX_TEXT);
            if (value instanceof Blob) return (await value.text()).slice(0, MAX_TEXT);
            if (value instanceof ArrayBuffer) {
              return new TextDecoder().decode(new Uint8Array(value)).slice(0, MAX_TEXT);
            }
            if (ArrayBuffer.isView(value)) {
              return new TextDecoder().decode(new Uint8Array(
                value.buffer,
                value.byteOffset,
                value.byteLength
              )).slice(0, MAX_TEXT);
            }
          } catch (_) {}
          return '';
        }

        const nativeFetch = window.fetch;
        if (typeof nativeFetch === 'function') {
          window.fetch = function () {
            const args = Array.from(arguments);
            const input = args[0];
            const init = args[1] || {};
            let url = '';
            let method = '';
            try {
              url = typeof input === 'string' || input instanceof URL
                ? String(input)
                : String(input?.url || '');
              method = String(init.method || input?.method || 'GET').toUpperCase();
              const requestBody = init.body !== undefined
                ? Promise.resolve(init.body)
                : typeof input?.clone === 'function'
                  ? input.clone().text().catch(() => '')
                  : Promise.resolve('');
              void requestBody.then(bodyText).then(raw => {
                if (raw) emit({ transport: 'fetch', direction: 'outbound', method, url, raw });
              });
            } catch (_) {}

            const promise = nativeFetch.apply(this, args);
            try {
              void Promise.resolve(promise).then(response => {
                try {
                  const contentType = String(response.headers?.get('content-type') || '');
                  const contentLength = Number(response.headers?.get('content-length') || 0);
                  if (
                    (contentType && !/(?:json|text|javascript|xml)/i.test(contentType)) ||
                    (contentLength && contentLength > MAX_TEXT)
                  ) {
                    return;
                  }
                  void response.clone().text().then(raw => {
                    emit({
                      transport: 'fetch',
                      direction: 'inbound',
                      method,
                      url: response.url || url,
                      status: response.status,
                      raw
                    });
                  }).catch(() => {});
                } catch (_) {}
              }).catch(() => {});
            } catch (_) {}
            return promise;
          };
        }

        const NativeXHR = window.XMLHttpRequest;
        if (typeof NativeXHR === 'function') {
          const nativeOpen = NativeXHR.prototype.open;
          const nativeSend = NativeXHR.prototype.send;
          NativeXHR.prototype.open = function (method, url) {
            try {
              this.__bpHistoryMethod = String(method || 'GET').toUpperCase();
              this.__bpHistoryUrl = String(url || '');
            } catch (_) {}
            return nativeOpen.apply(this, arguments);
          };
          NativeXHR.prototype.send = function (body) {
            const xhr = this;
            const method = String(xhr.__bpHistoryMethod || 'GET');
            const url = String(xhr.__bpHistoryUrl || '');
            try {
              void bodyText(body).then(raw => {
                if (raw) emit({ transport: 'xhr', direction: 'outbound', method, url, raw });
              });
              xhr.addEventListener('loadend', function () {
                try {
                  if (xhr.responseType === 'json') {
                    emit({
                      transport: 'xhr', direction: 'inbound', method, url,
                      status: xhr.status, raw: JSON.stringify(xhr.response)
                    });
                    return;
                  }
                  if (!xhr.responseType || xhr.responseType === 'text') {
                    emit({
                      transport: 'xhr', direction: 'inbound', method, url,
                      status: xhr.status, raw: String(xhr.responseText || '')
                    });
                    return;
                  }
                  void bodyText(xhr.response).then(raw => {
                    if (raw) emit({
                      transport: 'xhr', direction: 'inbound', method, url,
                      status: xhr.status, raw
                    });
                  });
                } catch (_) {}
              }, { once: true });
            } catch (_) {}
            return nativeSend.apply(this, arguments);
          };
        }
      } +
      ')(' +
      JSON.stringify(HISTORY_TRANSPORT_EVENT) +
      ');';

    const script = document.createElement('script');
    script.textContent = source;
    (
      document.documentElement ||
      document.head ||
      document.body
    ).appendChild(script);
    script.remove();
  }

  function redactText(value) {
    return String(value ?? '')
      .replace(/("?(?:authorization|cookie|token|access_token|refresh_token|jwt|password|passwd|secret|session)["']?\s*[:=]\s*")([^"']*)(")/gi, '$1[REDACTED]$3')
      .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/gi, '$1[REDACTED]');
  }

  function redactUrl(value) {
    try {
      const url = new URL(String(value || ''), location.href);
      return url.origin + url.pathname;
    } catch (_) {
      return redactText(value).split('?')[0].split('#')[0];
    }
  }

  function dgExecutionProbeLocation() {
    try {
      const url = new URL(location.href);
      return { origin: url.origin, pathname: url.pathname || '/' };
    } catch (_) {
      return { origin: '', pathname: '/' };
    }
  }

  function reportDgExecutionProbe() {
    const host = (() => {
      try { return String(location.hostname || '').toLowerCase(); } catch (_) { return ''; }
    })();
    if (host === 'tz6868.com' || host.endsWith('.tz6868.com')) return;

    const detail = {
      ...dgExecutionProbeLocation(),
      inDg: true,
      loader: Boolean(window.__bp_dg_execution_probe__),
      runtime: true,
      observer: Boolean(window.__BP_MT_PAGE_RUNTIME_DEBUG_HOOK__),
      earlyBridge: Boolean(window[EARLY_STATE_KEY]?.installed),
      isTop: Boolean(isTopWindow)
    };

    try {
      let marker = document.getElementById('__bp_dg_execution_probe__');
      const root = document.documentElement || document.body;
      if (root) {
        if (!marker) {
          marker = document.createElement('div');
          marker.id = '__bp_dg_execution_probe__';
          marker.style.cssText = 'position:fixed;right:8px;top:8px;z-index:2147483646;background:#5b2a86;color:#fff;border:2px solid #fff;border-radius:8px;padding:7px 9px;font:700 11px/1.3 -apple-system,BlinkMacSystemFont,sans-serif;white-space:pre-wrap;max-width:260px;';
          root.appendChild(marker);
        }
        marker.textContent = [
          'DG EXECUTION PROBE',
          `LOADER IN DG: ${detail.loader ? 'YES' : 'NO'}`,
          'RUNTIME IN DG: YES',
          `DG OBSERVER INSTALLED: ${detail.observer ? 'YES' : 'NO'}`,
          `DG EARLY BRIDGE INSTALLED: ${detail.earlyBridge ? 'YES' : 'NO'}`
        ].join('\n');
      }
    } catch (_) {}

    try {
      if (window.opener && window.opener !== window) {
        window.opener.postMessage({ type: DG_EXECUTION_PROBE_MESSAGE, detail }, '*');
      }
    } catch (_) {}
  }

  function redactObject(value) {
    if (Array.isArray(value)) return value.map(redactObject);
    if (!value || typeof value !== 'object') return value;
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      if (/authorization|cookie|token|access_token|refresh_token|jwt|password|passwd|secret|session/i.test(key)) {
        output[key] = '[REDACTED]';
      } else {
        output[key] = redactObject(item);
      }
    }
    return output;
  }

  function dgProbeKeys(value, limit = 80) {
    if (!value || typeof value !== 'object') return [];
    return Object.keys(value).slice(0, limit).map(key => String(key).slice(0, 120));
  }

  function dgProbeStructure(value) {
    if (Array.isArray(value)) return { type: 'array', length: value.length };
    if (value && typeof value === 'object') return { type: 'object', keys: dgProbeKeys(value) };
    if (value === null || value === undefined) return { type: String(value) };
    return { type: typeof value };
  }

  function dgProbePayloadShape(raw) {
    if (typeof raw !== 'string' || !raw || raw.length > 200000) return null;
    try {
      const parsed = JSON.parse(raw);
      return { structure: dgProbeStructure(parsed), keys: dgProbeKeys(parsed) };
    } catch (_) {
      return null;
    }
  }

  const DG_INITIAL_CAPTURE_MAX_MS = 20000;
  const DG_INITIAL_CAPTURE_MAX_FRAMES = 120;
  const DG_INITIAL_CAPTURE_WS_HOST = 'appatw.kindlestone.com';
  const DG_INITIAL_KEY_PATTERN = /action|event|type|method|name|path|route|table|shoe|round|sequence|history|record|road|result|snapshot|player|banker|card|tie/i;
  const DG_INITIAL_SENSITIVE_KEY_PATTERN = /authorization|cookie|token|access_token|refresh_token|jwt|password|passwd|secret|session|account|member|phone|email|balance|license/i;

  function dgInitializationWsUrl(value) {
    try {
      const url = new URL(String(value || ''), location.href);
      return url.hostname.toLowerCase() === DG_INITIAL_CAPTURE_WS_HOST ? url.origin + url.pathname : '';
    } catch (_) {
      return '';
    }
  }

  function dgInitializationPrimitive(key, value) {
    if (DG_INITIAL_SENSITIVE_KEY_PATTERN.test(String(key || ''))) return '[REDACTED]';
    if (value === null || value === undefined) return value === null ? null : '[undefined]';
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value !== 'string') return `[${typeof value}]`;
    if (/url|href|src|query|hash/i.test(String(key || ''))) return '[URL_REDACTED]';
    if (!DG_INITIAL_KEY_PATTERN.test(String(key || ''))) return `[string:${value.length}]`;
    return String(value).slice(0, 120);
  }

  function dgInitializationShape(value, path = '$', depth = 0, budget = { nodes: 0, arrays: [], candidates: [], roundRecords: 0, cardRoundRecords: 0 }) {
    if (budget.nodes++ > 320 || depth > 6) return { type: 'depth-or-budget-limit' };
    if (Array.isArray(value)) {
      const itemKeys = value.slice(0, 8).map(item => item && typeof item === 'object' && !Array.isArray(item) ? dgProbeKeys(item, 40) : []).filter(item => item.length);
      budget.arrays.push({ path: path.slice(0, 180), length: value.length, itemKeys: itemKeys.slice(0, 8) });
      return { type: 'array', length: value.length, item: value.length ? dgInitializationShape(value[0], `${path}[0]`, depth + 1, budget) : null };
    }
    if (!value || typeof value !== 'object') return { type: typeof value, value: dgInitializationPrimitive(path.split('.').at(-1), value) };
    const keys = Object.keys(value).filter(key => !DG_INITIAL_SENSITIVE_KEY_PATTERN.test(key)).slice(0, 60);
    const lower = keys.map(key => key.toLowerCase());
    const hasRound = lower.some(key => /round|sequence|hand/.test(key));
    const hasCards = lower.some(key => /card|player|banker/.test(key));
    if (hasRound) budget.roundRecords += 1;
    if (hasRound && lower.some(key => /player/.test(key)) && lower.some(key => /banker/.test(key))) budget.cardRoundRecords += 1;
    if (keys.some(key => DG_INITIAL_KEY_PATTERN.test(key))) budget.candidates.push({ path: path.slice(0, 180), keys: keys.slice(0, 40), cardLike: hasCards, roundLike: hasRound });
    const children = {};
    for (const key of keys.slice(0, 40)) {
      const child = value[key];
      children[key] = child && typeof child === 'object' ? dgInitializationShape(child, `${path}.${key}`, depth + 1, budget) : { type: child === null ? 'null' : typeof child, value: dgInitializationPrimitive(key, child) };
    }
    return { type: 'object', keys, children };
  }

  function dgInitializationPayloadSummary(raw, binary) {
    if (typeof raw !== 'string' || !raw) return { parse: 'empty', binaryText: Boolean(binary) };
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { return { parse: 'json-fail', binaryText: Boolean(binary), textLength: raw.length }; }
    const budget = { nodes: 0, arrays: [], candidates: [], roundRecords: 0, cardRoundRecords: 0 };
    const shape = dgInitializationShape(parsed, '$', 0, budget);
    return { parse: 'json-ok', binaryText: Boolean(binary), textLength: raw.length, root: shape, arrays: budget.arrays.slice(0, 30), candidates: budget.candidates.slice(0, 50), roundRecordCount: budget.roundRecords, cardRoundRecordCount: budget.cardRoundRecords, possibleHistoricalRoundArray: budget.arrays.some(item => item.length > 1 && item.itemKeys.some(keys => keys.some(key => /round|sequence|hand/i.test(key)))), possibleHistoricalCardArray: budget.cardRoundRecords > 0 };
  }

  function dgInitializationCaptureStart(detail) {
    const url = dgInitializationWsUrl(detail?.wsUrl);
    if (!url || state.dgDataProbe.initialization.active) return;
    const capture = state.dgDataProbe.initialization;
    const association = dgHistoricalAssociationState();
    if (association.active && !association.frozen) dgHistoricalAssociationFreeze('socket-session-reset');
    association.active = true;
    association.frozen = false;
    association.freezeReason = null;
    association.anchors = [];
    association.cardObjects = [];
    association.blocks = [];
    association.frameKeys = [];
    capture.active = true;
    capture.startedAt = Date.now();
    capture.endsAt = capture.startedAt + DG_INITIAL_CAPTURE_MAX_MS;
    capture.websocketUrl = url;
    capture.frameCount = 0;
    capture.openCount += 1;
    capture.completeObserved = false;
    capture.stopReason = null;
    capture.processSequence = 0;
    capture.firstDispatch = null;
    capture.associationFrameKeys = new Set();
    state.dgDataProbe.initializationObjectAssociationEvidence.length = 0;
    state.dgDataProbe.initializationObjectAssociationSummary = {
      frameCount: 0,
      objectCount: 0,
      directObjectTableIdentityCount: 0,
      directParentTableIdentityCount: 0,
      frameOnlyTableIdentityCount: 0,
      directObjectRoundCount: 0,
      directParentRoundCount: 0,
      frameOnlyRoundCount: 0,
      directObjectShoeCount: 0,
      directParentShoeCount: 0,
      frameOnlyShoeCount: 0,
      objectsWithCards: 0,
      objectsWithOutcome: 0,
      objectsWithExactAssociation: 0,
      truncated: false,
      frozen: false,
      frozenAt: 0,
      freezeReason: null
    };
    dgProbeRecord({ transport: 'WebSocket', eventType: 'DG_INIT_CAPTURE_START', direction: 'inbound', url, maxMs: DG_INITIAL_CAPTURE_MAX_MS, maxFrames: DG_INITIAL_CAPTURE_MAX_FRAMES });
    capture.timer = setTimeout(() => dgInitializationCaptureStop('timeout'), DG_INITIAL_CAPTURE_MAX_MS);
  }

  function dgInitializationCaptureStop(reason) {
    const capture = state.dgDataProbe.initialization;
    if (!capture.active) return;
    capture.active = false;
    capture.stopReason = String(reason || 'stopped').slice(0, 80);
    if (capture.timer) clearTimeout(capture.timer);
    capture.timer = null;
    const association = state.dgDataProbe.initializationObjectAssociationSummary;
    if (String(reason || '') !== 'first-live-round-complete') {
      association.frozen = true;
      association.frozenAt = Date.now();
      association.freezeReason = String(reason || 'stopped').slice(0, 80);
    }
    dgProbeRecord({ transport: 'WebSocket', eventType: 'DG_INIT_CAPTURE_STOP', direction: 'inbound', reason: capture.stopReason, frameCount: capture.frameCount, completeObserved: capture.completeObserved, elapsedMs: Math.max(0, Date.now() - capture.startedAt) });
  }

  function observeDgInitializationFrame(detail, binary, raw) {
    const capture = state.dgDataProbe.initialization;
    if (!capture.active || capture.frameCount >= DG_INITIAL_CAPTURE_MAX_FRAMES) return;
    capture.frameCount += 1;
    dgProbeRecord({ transport: 'WebSocket', eventType: 'DG_INIT_FRAME', captureFrame: capture.frameCount, direction: String(detail.direction || 'inbound'), binary: Boolean(binary), byteLength: binary ? (Array.isArray(detail.binary) ? detail.binary.length : null) : raw.length, url: dgInitializationWsUrl(detail.wsUrl), payload: dgInitializationPayloadSummary(raw, binary) });
    if (capture.frameCount >= DG_INITIAL_CAPTURE_MAX_FRAMES) dgInitializationCaptureStop('frame-limit');
  }

  function dgProbeRecord(record) {
    if (!record || typeof record !== 'object') return;
    const safe = redactObject(record);
    const entry = { frameId: DISCOVERY_FRAME_ID, sequence: state.dgDataProbe.sequence + 1, timestamp: Date.now(), ...safe };
    state.dgDataProbe.sequence = entry.sequence;
    state.dgDataProbe.records.push(entry);
    if (state.dgDataProbe.records.length > 300) state.dgDataProbe.records.splice(0, state.dgDataProbe.records.length - 300);
    if (!isTopWindow) {
      try { window.top.postMessage({ type: DG_DATA_PROBE_RECORD_MESSAGE, record: entry }, '*'); } catch (_) {}
    }
  }

  const DG_EVIDENCE_LIMITS = Object.freeze({
    dispatchEvidence: 64,
    completeCandidates: 64,
    initializationCompleteCandidates: 32,
    roundEvolution: 128,
    objectSelectionEvidence: 64,
    largeFrameStructures: 32,
    binaryFramingEvidence: 64,
    embeddedObjectEvidence: 64,
    selectedObjectEvidence: 64,
    cardProgressionEvidence: 128,
    sharedStateCorrelation: 64,
    outboundWebSocketFrameEvidence: 32,
    dgCurrentTableUiEvidence: 64,
    dgTableSelectionEvidence: 16,
    dgTableSelectionCorrelationEvidence: 16,
    dgProtocolTransitionEvidence: 128,
    dgCardStreamCorrelationEvidence: 64,
    dgInboundCardParentEnvelopeEvidence: 64,
    dgInboundCardParentEnvelopeFirstSeenEvidence: 128,
    dgProtocolUiEvidence: 64,
    dgRoadStatEvidence: 64,
    dgRoadResultEvidence: 64,
    dgNativeRoadCommandEvidence: 64,
    trustedRoomIdentityEvidence: 64,
    backendIdentityAssociationEvidence: 64,
    initializationObjectAssociationEvidence: 1024,
    nativeRecordRequestEvidence: 64
  });
  const DG_V9_HISTORY_MS = 15000;
  const DG_V9_OPEN_WINDOW_MS = 15000;
  const DG_V9_STREAM_OUTBOUND_MS = 5000;
  const DG_V9_STREAM_FOLLOWING_MS = 2000;
  const dgV9TemporalHistory = [];
  const dgV9Streams = new Map();
  let dgV9LastField6 = null;

  function dgEvidencePush(storeName, evidence) {
    const limit = DG_EVIDENCE_LIMITS[storeName];
    const store = state.dgDataProbe[storeName];
    if (!limit || !Array.isArray(store) || !evidence || typeof evidence !== 'object') return;
    const safe = redactObject({ timestamp: Date.now(), frameId: DISCOVERY_FRAME_ID, ...evidence });
    store.push(safe);
    if (store.length > limit) store.splice(0, store.length - limit);
  }
  function dgEvidencePushFirstSeen(storeName, key, evidence) {
    const limit = DG_EVIDENCE_LIMITS[storeName];
    const store = state.dgDataProbe[storeName];
    if (!limit || !Array.isArray(store) || !key || !evidence || typeof evidence !== 'object') return;
    if (store.some(item => item && item.firstSeenKey === key)) return;
    const safe = redactObject({ timestamp: Date.now(), frameId: DISCOVERY_FRAME_ID, firstSeenKey: key, ...evidence });
    store.push(safe);
    if (store.length > limit) store.splice(0, store.length - limit);
  }

  // DG V3.3.5 PublicBeanProto.proto: cmd=1, tableId=6, list=12,
  // table=17.  This decoder is intentionally limited to the fields needed
  // for the native road command and never participates in live card decode.
  const DG_NATIVE_ROAD_COMMAND = 1004;
  function dgNativeProtoVarint(bytes, offset) {
    let value = 0;
    let shift = 0;
    let index = offset;
    while (index < bytes.length && shift <= 63) {
      const byte = Number(bytes[index++]) & 255;
      value += (byte & 127) * (2 ** shift);
      if (!(byte & 128)) return { value, next: index };
      shift += 7;
    }
    return null;
  }

  function dgNativeProtoSkip(bytes, offset, wireType) {
    if (wireType === 0) return dgNativeProtoVarint(bytes, offset)?.next ?? null;
    if (wireType === 1) return offset + 8 <= bytes.length ? offset + 8 : null;
    if (wireType === 2) {
      const length = dgNativeProtoVarint(bytes, offset);
      if (!length || length.value > bytes.length - length.next) return null;
      return length.next + length.value;
    }
    if (wireType === 5) return offset + 4 <= bytes.length ? offset + 4 : null;
    return null;
  }

  function dgNativeProtoUtf8(bytes) {
    try { return new TextDecoder().decode(Uint8Array.from(bytes)); } catch (_) { return ''; }
  }

  function dgNativeProtoDecodePublicBean(input) {
    const bytes = Array.from(input || [], value => Number(value) & 255);
    if (!bytes.length) return null;
    const result = { cmd: null, tableId: null, list: [], tables: [], consumed: 0 };
    let offset = 0;
    while (offset < bytes.length) {
      const tag = dgNativeProtoVarint(bytes, offset);
      if (!tag) return null;
      offset = tag.next;
      const field = Math.floor(tag.value / 8);
      const wireType = tag.value % 8;
      if (wireType === 0) {
        const value = dgNativeProtoVarint(bytes, offset);
        if (!value) return null;
        offset = value.next;
        if (field === 1) result.cmd = value.value;
        if (field === 6) result.tableId = value.value;
        continue;
      }
      if (wireType === 2) {
        const length = dgNativeProtoVarint(bytes, offset);
        if (!length || length.value > bytes.length - length.next) return null;
        const end = length.next + length.value;
        const payload = bytes.slice(length.next, end);
        offset = end;
        if (field === 12) result.list.push(dgNativeProtoUtf8(payload).slice(0, 512));
        else if (field === 17) result.tables.push(payload.length);
        continue;
      }
      const next = dgNativeProtoSkip(bytes, offset, wireType);
      if (next === null) return null;
      offset = next;
    }
    result.consumed = offset;
    return result.cmd === DG_NATIVE_ROAD_COMMAND && Number.isInteger(result.tableId) ? result : null;
  }

  function dgNativeRoadCodes(list) {
    const valid = [];
    let invalid = 0;
    for (const item of Array.isArray(list) ? list : []) {
      const parts = String(item).split('#');
      const code = Number(parts[1]);
      if (Number.isInteger(code) && code >= 1 && code <= 12) valid.push(code);
      else invalid += 1;
    }
    return { valid, invalid };
  }

  function dgNativeRoadEntries(list, currentRoundIdentity = '', currentRoundComplete = false) {
    const entries = [];
    const seenGameNos = new Set();
    let invalidItemCount = 0;
    let duplicateItemCount = 0;
    let currentRoundExcluded = false;
    let currentRoundExclusionReason = currentRoundIdentity ? 'gameNo-exact-match-only' : 'no-current-round-context';
    for (const [position, item] of (Array.isArray(list) ? list : []).entries()) {
      const parts = String(item).split('#');
      const gameNo = String(parts[0] || '').trim();
      const roadCode = Number(parts[1]);
      if (!Number.isInteger(roadCode) || roadCode < 1 || roadCode > 12) {
        invalidItemCount += 1;
        continue;
      }
      const stableKey = gameNo || `position:${position}`;
      if (gameNo && seenGameNos.has(gameNo)) {
        duplicateItemCount += 1;
        continue;
      }
      if (gameNo) seenGameNos.add(gameNo);
      if (currentRoundIdentity && gameNo === currentRoundIdentity) {
        currentRoundExcluded = true;
        currentRoundExclusionReason = 'exact-gameNo-match';
        continue;
      }
      entries.push({
        gameNo: gameNo || null,
        stableKey,
        roadCode,
        winner: roadCode <= 4 ? 'BANKER' : roadCode <= 8 ? 'PLAYER' : 'TIE',
        order: entries.length
      });
    }
    if (currentRoundIdentity && !currentRoundComplete && !currentRoundExcluded && entries.some(entry => !entry.gameNo)) {
      currentRoundExclusionReason = 'unverifiable-missing-gameNo';
      // DG's 1004 snapshot can omit gameNo while the final list item is the
      // live round shown by the card stream. Keep the native order, but mark
      // that boundary explicitly so callers never treat the tail as a
      // completed historical round without evidence.
      if (entries.length > 0) {
        entries.pop();
        currentRoundExcluded = true;
        currentRoundExclusionReason = 'position-tail-current-round';
      }
    }
    return { entries, invalidItemCount, duplicateItemCount, currentRoundExcluded, currentRoundExclusionReason };
  }

  function dgObserveNativeRoadCommand(bytes, detail = {}) {
    const decoded = dgNativeProtoDecodePublicBean(bytes);
    if (!decoded) return null;
    const codes = dgNativeRoadCodes(decoded.list);
    const currentRoundIdentity = String(state.dg?.lastFrame?.roundIdentity || '');
    const currentRoundComplete = Boolean(state.dg?.lastFrame?.complete);
    const roadEntries = dgNativeRoadEntries(decoded.list, currentRoundIdentity, currentRoundComplete);
    const first = roadEntries.entries[0]?.gameNo || null;
    const last = roadEntries.entries.at(-1)?.gameNo || null;
    const ownershipTableId = normalizeTableId(state.dg.ownership.tableId);
    const packetTableId = normalizeTableId(decoded.tableId);
    const matchesVerifiedOwnership = Boolean(ownershipTableId && packetTableId && ownershipTableId === packetTableId);
    if (matchesVerifiedOwnership) dgModelEstimateObserveRoad(decoded, ownershipTableId, state.dg.shoeIdentity);
    dgEvidencePush('dgNativeRoadCommandEvidence', {
      source: 'DG-PublicBeanProto',
      command: decoded.cmd,
      tableId: packetTableId,
      ownershipTableId,
      matchesVerifiedOwnership,
      associationVerified: matchesVerifiedOwnership,
      associationReason: ownershipTableId ? (matchesVerifiedOwnership ? 'verified-ownership-match' : 'foreign-table') : 'ownership-not-established',
      listLength: decoded.list.length,
      validBaccaratCodeCount: codes.valid.length,
      invalidItemCount: codes.invalid,
      duplicateItemCount: roadEntries.duplicateItemCount,
      currentRoundIdentity: currentRoundIdentity || null,
      currentRoundExcluded: roadEntries.currentRoundExcluded,
      currentRoundExclusionReason: roadEntries.currentRoundExclusionReason,
      gameNoVerified: roadEntries.entries.every(entry => Boolean(entry.gameNo)),
      completionStatus: roadEntries.currentRoundExclusionReason === 'position-tail-current-round'
        ? 'current-round-excluded-by-native-list-position'
        : roadEntries.entries.some(entry => !entry.gameNo)
          ? 'road-items-valid-but-completion-boundary-unverifiable'
        : 'road-items-valid-gameNo-boundary-checkable',
      firstGameNo: first,
      lastGameNo: last,
      candidateRoundCount: roadEntries.entries.length,
      nativeRendererTraversal: 'descending-roadArray-index',
      nativeRendererFirstSourcePosition: decoded.list.length ? decoded.list.length - 1 : null,
      nativeRendererLastSourcePosition: decoded.list.length ? 0 : null,
      nativeRendererOrderEvidence: 'showAllRoad-length-minus-one-to-zero',
      roadEntries: roadEntries.entries.slice(-64),
      socketGeneration: Number(detail.socketGeneration) || null,
      socketIdentity: detail.socketIdentity || null
    });
    return decoded;
  }
  function dgTrustedRoomIdFingerprint(value) {
    const text = String(value ?? '');
    if (!text) return null;
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }
  function dgTrustedRoomIdentityObserve({
    source,
    tableId = null,
    roomId = null,
    shoe = null,
    round = null,
    matchedVerifiedOwnership = null,
    exactTableListRowPresent = null,
    exactRowRoomIdPresent = null,
    registryRoomIdPresent = null,
    recordProbeContextRoomIdPresent = null,
    finalReason = null
  } = {}) {
    const normalizedTableId = normalizeTableId(tableId);
    const normalizedRoomId = roomId === null || roomId === undefined ? '' : String(roomId).trim();
    dgEvidencePush('trustedRoomIdentityEvidence', {
      source: String(source || 'unknown').slice(0, 80),
      tableId: normalizedTableId,
      roomIdPresent: Boolean(normalizedRoomId),
      roomId: null,
      roomIdFingerprint: dgTrustedRoomIdFingerprint(normalizedRoomId),
      shoe: shoe ?? null,
      round: round ?? null,
      matchedVerifiedOwnership: matchedVerifiedOwnership === null ? null : Boolean(matchedVerifiedOwnership),
      exactTableListRowPresent: exactTableListRowPresent === null ? null : Boolean(exactTableListRowPresent),
      exactRowRoomIdPresent: exactRowRoomIdPresent === null ? null : Boolean(exactRowRoomIdPresent),
      registryRoomIdPresent: registryRoomIdPresent === null ? null : Boolean(registryRoomIdPresent),
      recordProbeContextRoomIdPresent: recordProbeContextRoomIdPresent === null ? null : Boolean(recordProbeContextRoomIdPresent),
      finalReason: finalReason ? String(finalReason).slice(0, 80) : null
    });
  }
  function dgStoreRecordOutboundSourceEvidence(telemetry) {
    const input = telemetry?.recordOutboundSourceEvidence;
    if (!input || typeof input !== 'object') return;
    const ownershipTableId = normalizeTableId(state.dg.ownership.tableId);
    const observedTableId = normalizeTableId(input.tableIdValue);
    const safe = {
      timestamp: Number(input.timestamp) || Date.now(),
      direction: 'outbound',
      source: 'existing-game-websocket-send',
      actionFingerprint: String(input.actionFingerprint || '').slice(0, 80),
      tableIdPresent: Boolean(input.tableIdPresent),
      tableIdValue: observedTableId,
      shoe: Number.isFinite(Number(input.shoe)) ? Number(input.shoe) : null,
      round: Number.isFinite(Number(input.round)) ? Number(input.round) : null,
      isPulseGeneratedProbe: Boolean(input.isPulseGeneratedProbe),
      pulseMarkerMatched: Boolean(input.pulseMarkerMatched),
      pulseProbeIdPresent: Boolean(input.pulseProbeIdPresent),
      pulsePacketRequestIdPresent: Boolean(input.pulsePacketRequestIdPresent),
      pulseHydrationIdPresent: Boolean(input.pulseHydrationIdPresent),
      matchedVerifiedDgTableId: Boolean(input.tableIdPresent && observedTableId && ownershipTableId && observedTableId === ownershipTableId),
      dgVerifiedTableId: ownershipTableId
    };
    boundedPush(state.dgDataProbe.recordOutboundSourceEvidence, safe, 64);
  }
  function dgRoomAssociationHash(value) {
    const text = String(value ?? '');
    if (!text) return null;
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }
  function dgRoomAssociationPush(kind, evidence) {
    const store = state.dgDataProbe.roomAssociationDiscovery?.[kind];
    if (!Array.isArray(store) || !evidence || typeof evidence !== 'object') return;
    const safe = redactObject({ timestamp: Date.now(), frameId: DISCOVERY_FRAME_ID, ...evidence });
    store.push(safe);
    if (store.length > 64) store.splice(0, store.length - 64);
  }
  function dgJsonActionShape(record) {
    const parsed = record?.parsed;
    const action = parsed?.action;
    const actionKeys = action && typeof action === 'object' ? Object.keys(action).slice(0, 24).sort() : [];
    const actionName = typeof action === 'string' ? action : action?.name ?? record?.actionName ?? '';
    return {
      actionFingerprint: dgRoomAssociationHash(JSON.stringify({ actionKeys, actionName: String(actionName).replace(/\d+/g, '#').slice(0, 120) })),
      actionShape: { actionKeys, hasDataObject: Boolean(action?.data && typeof action.data === 'object'), direction: String(record?.direction || '').slice(0, 20) }
    };
  }
  function dgObserveJsonRoomAssociation(record) {
    const root = record?.parsed;
    if (!root || typeof root !== 'object') return;
    const queue = [{ value: root, path: 'payload', depth: 0 }];
    const seen = new WeakSet();
    let inspected = 0;
    const actionShape = dgJsonActionShape(record);
    while (queue.length && inspected < 500) {
      const current = queue.shift();
      const value = current.value;
      if (!value || typeof value !== 'object' || seen.has(value)) continue;
      seen.add(value);
      inspected += 1;
      const tableValue = value.table_id ?? value.tableId;
      const roomValue = value.room_id ?? value.roomId;
      const tableId = normalizeTableId(tableValue);
      const roomId = roomValue === null || roomValue === undefined ? '' : String(roomValue).trim();
      if (tableId || roomValue !== null && roomValue !== undefined) {
        dgRoomAssociationPush('jsonMetadata', {
          direction: String(record?.direction || '').slice(0, 20),
          ...actionShape,
          objectPath: current.path.slice(0, 300),
          tableId,
          roomIdPresent: Boolean(roomId),
          roomIdFingerprint: dgRoomAssociationHash(roomId),
          tableAndRoomSamePacket: Boolean(tableId && roomId),
          source: 'recordPacket-json-object'
        });
      }
      if (current.depth >= 7) continue;
      for (const [key, child] of Object.entries(value).slice(0, 160)) {
        if (child && typeof child === 'object') queue.push({ value: child, path: `${current.path}.${key}`, depth: current.depth + 1 });
      }
    }
  }
  function dgObserveBinaryRoomMetadata(detail, parent, roundIdentity) {
    const envelopeFields = parent?.envelopeFields || {};
    dgRoomAssociationPush('dgBinaryMetadata', {
      chainId: detail?.chainId || null,
      sequence: Number(detail?.sequence) || null,
      processSequence: Number(detail?.processSequence) || null,
      roundIdentity: roundIdentity || null,
      packetTableId: normalizeTableId(envelopeFields.field6),
      envelopeField1: envelopeFields.field1 ?? null,
      envelopeField5: envelopeFields.field5 || null,
      envelopeField6: envelopeFields.field6 ?? null,
      envelopeField10: envelopeFields.field10 ?? null,
      parentFieldPath: parent?.parentFieldPath || null,
      printableIdentityFingerprints: (parent?.parentPrintableIdentityStrings || []).slice(0, 16).map(item => ({ fieldPath: item.fieldPath || null, fieldNumber: item.fieldNumber ?? null, fingerprint: dgRoomAssociationHash(item.value) })),
      numericIdentityCandidates: (parent?.frameNumericIdentityCandidates || []).slice(0, 32),
      roomIdentityProven: false,
      exactAssociationProven: false,
      source: 'dg-binary-parent-envelope'
    });
  }
  function dgObserveBackendIdentityAssociation(detail = {}, parent = null, identity = {}) {
    const envelopeFields = parent?.envelopeFields || {};
    const verifiedTableId = normalizeTableId(state.dg.ownership.tableId);
    const packetTableId = normalizeTableId(identity.tableId ?? envelopeFields.field6);
    const numericIdentityCandidates = Array.from(new Set([
      ...(Array.isArray(parent?.frameNumericIdentityCandidates) ? parent.frameNumericIdentityCandidates : []),
      envelopeFields.field6,
      envelopeFields.field1,
      envelopeFields.field10
    ].map(value => normalizeTableId(value)).filter(Boolean))).slice(0, 32);
    dgEvidencePush('backendIdentityAssociationEvidence', {
      timestamp: Number(detail.timestamp) || Date.now(),
      socketGeneration: Number(detail.socketGeneration) || null,
      sequence: Number(detail.sequence) || null,
      processSequence: Number(detail.processSequence) || null,
      direction: String(detail.direction || 'inbound').slice(0, 20),
      field1: envelopeFields.field1 ?? null,
      field5: envelopeFields.field5 || null,
      field6: envelopeFields.field6 ?? null,
      field10: envelopeFields.field10 ?? null,
      verifiedOwnershipTableId: verifiedTableId,
      matchesVerifiedOwnership: Boolean(packetTableId && verifiedTableId && packetTableId === verifiedTableId),
      parentFieldPath: parent?.parentFieldPath || null,
      numericIdentityCandidates,
      printableIdentityFingerprints: (parent?.parentPrintableIdentityStrings || []).slice(0, 16).map(item => ({ fieldPath: item.fieldPath || null, fieldNumber: item.fieldNumber ?? null, fingerprint: dgRoomAssociationHash(item.value) })),
      roundIdentity: identity.roundIdentity || null,
      shoeIdentity: identity.shoeIdentity || (identity.roundIdentity ? dgShoeIdentity(identity.roundIdentity) : null),
      nestedObjectPath: identity.nestedObjectPath || null,
      sameFrameIdentityCandidates: numericIdentityCandidates,
      exactAssociationProven: false,
      source: 'dg-binary-parent-envelope'
    });
  }
  function dgObserveNativeRecordRequest(detail = {}) {
    const parsed = detail.parsed;
    const action = parsed?.action;
    const actionName = typeof action === 'string' ? action : action?.name || '';
    const safePath = String(detail.url || detail.wsUrl || '').replace(/^https?:\/\/[^/]+/i, '').split(/[?#]/, 1)[0];
    if (!/^\/api\/v1\/gametype\/[^/]+\/game\/[^/]+\/record$/i.test(String(actionName || safePath))) return;
    const data = action && typeof action === 'object' && action.data && typeof action.data === 'object' ? action.data : {};
    const tableIdValue = data.table_id ?? data.tableId ?? findDeep(parsed, ['table_id', 'tableid']);
    const verifiedTableId = normalizeTableId(state.dg.ownership.tableId);
    const observedTableId = normalizeTableId(tableIdValue);
    boundedPush(state.nativeRecordRequestEvidence, {
      timestamp: Number(detail.timestamp) || Date.now(),
      transport: String(detail.transport || '').slice(0, 20),
      direction: String(detail.direction || '').slice(0, 20),
      method: String(detail.method || parsed?.method || '').toUpperCase().slice(0, 10),
      actionShape: { actionKeys: action && typeof action === 'object' ? Object.keys(action).slice(0, 16).sort() : [], hasDataObject: Boolean(action?.data && typeof action.data === 'object') },
      tableIdPresent: tableIdValue !== undefined && tableIdValue !== null,
      tableIdValue: observedTableId,
      shoe: Number.isFinite(Number(data.shoe ?? findDeep(parsed, ['shoe', 'shoeid']))) ? Number(data.shoe ?? findDeep(parsed, ['shoe', 'shoeid'])) : null,
      round: Number.isFinite(Number(data.round ?? findDeep(parsed, ['round', 'roundnumber']))) ? Number(data.round ?? findDeep(parsed, ['round', 'roundnumber'])) : null,
      verifiedDgTableIdAtObservation: verifiedTableId,
      matchedVerifiedDgTableId: Boolean(observedTableId && verifiedTableId && observedTableId === verifiedTableId),
      socketGeneration: Number(detail.socketGeneration) || Number(state.dg.ownership.socketGeneration) || null,
      isPulseGeneratedProbe: null,
      attribution: 'unknown',
      exactAssociationProven: false,
      source: 'existing-fetch-xhr-transport'
    }, 64);
  }
  function dgV9Now() {
    return Date.now();
  }
  function dgV9ObserverSafe(stage, callback) {
    try {
      callback();
    } catch (_) {
      try {
        dgProbeRecord({
          transport: 'WebSocket',
          eventType: 'DG_V9_OBSERVER_ERROR',
          direction: 'inbound',
          stage: String(stage || '').slice(0, 80),
          processSequence: Number(state.dgDataProbe.initialization.processSequence) || null
        });
      } catch (_) {}
    }
  }
  function dgV9TrimHistory(now = dgV9Now()) {
    while (dgV9TemporalHistory.length && now - Number(dgV9TemporalHistory[0].timestamp || 0) > DG_V9_HISTORY_MS) dgV9TemporalHistory.shift();
    for (const [key, stream] of dgV9Streams) {
      if (now - Number(stream.lastUpdate || 0) > DG_V9_HISTORY_MS + DG_V9_STREAM_FOLLOWING_MS) dgV9Streams.delete(key);
    }
  }
  function dgV9IdentityString(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).replace(/[?&#].*$/, '').slice(0, 120);
    if (!text || DG_OUTBOUND_SENSITIVE_KEYS.test(text)) return null;
    return /^(?:RB\d{1,4}|BAC\d{1,6}|\d{1,12}|\d{8,}R\d{1,8}|R\d{1,12})$/i.test(text) ? text : null;
  }
  function dgV9Field(protobuf, number) {
    return protobuf?.fields?.find(item => item.fieldNumber === number && item.wireType === 0)?.varint ?? null;
  }
  function dgV9Field5(protobuf) {
    const value = protobuf?.printableLengthDelimitedStrings?.find(item => item.fieldNumber === 5)?.value;
    return dgV9IdentityString(value);
  }
  function dgV9TableCandidates(value) {
    const values = [];
    const add = item => { const normalized = normalizeTableId(item); if (normalized && !values.includes(normalized)) values.push(normalized); };
    add(value);
    if (value && typeof value === 'object') {
      for (const key of ['tableId', 'table_id', 'table', 'roomId', 'room_id']) add(value[key]);
    }
    return values.slice(0, 12);
  }
  function dgV9RoundCandidates(value) {
    const text = String(value || '');
    const matches = text.match(/(?:\d{8,}R\d{1,8}|R\d{1,12})/gi) || [];
    return Array.from(new Set(matches.map(item => item.slice(0, 80)))).slice(0, 12);
  }
  function dgV9UiSnapshot(reason, detail = {}) {
    let pathname = null;
    let title = null;
    let visibility = null;
    try { pathname = `${location.hostname}${location.pathname}`.slice(0, 300); } catch (_) {}
    try { title = String(document.title || '').replace(/[?&#].*$/, '').slice(0, 160) || null; } catch (_) {}
    try { visibility = document.visibilityState || null; } catch (_) {}
    let focused = null;
    try {
      const active = document.activeElement;
      const ancestry = [];
      let node = active;
      for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) ancestry.push(dgTableSelectionNodeSnapshot(node));
      focused = ancestry;
    } catch (_) {}
    return { reason, timestamp: dgV9Now(), frameUrl: pathname, documentTitle: title, visibilityState: visibility, focusedAncestry: focused, socketGeneration: Number(detail.socketGeneration) || null };
  }
  function dgV9RecordTemporal(entry) {
    const now = Number(entry.timestamp) || dgV9Now();
    dgV9TrimHistory(now);
    dgV9TemporalHistory.push({ timestamp: now, ...entry });
    if (dgV9TemporalHistory.length > 256) dgV9TemporalHistory.splice(0, dgV9TemporalHistory.length - 256);
    for (const stream of dgV9Streams.values()) {
      if (now < stream.firstSeen) continue;
      if (now - stream.lastUpdate <= DG_V9_STREAM_FOLLOWING_MS && stream.followingInbound.length < 16 && entry.direction === 'inbound') stream.followingInbound.push(entry);
    }
  }
  function dgV9Transition(entry) {
    dgEvidencePush('dgProtocolTransitionEvidence', entry);
    dgV9RecordTemporal(entry);
  }
  function dgV9ObserveOpen(detail) {
    dgV9LastField6 = null;
    dgV9Transition({ direction: 'open', socketGeneration: Number(detail.socketGeneration) || null, chainId: null, sequence: Number(detail.sequence) || null, byteLength: 0, openWindow: true, openWindowEndsAt: dgV9Now() + DG_V9_OPEN_WINDOW_MS, tableCandidates: [], roundCandidates: [], ui: dgV9UiSnapshot('websocket-open', detail) });
  }
  function dgV9ObserveOutbound(record) {
    const now = Number(record.timestamp) || dgV9Now();
    const field1 = dgV9Field(record.protobuf, 1);
    const field5 = dgV9Field5(record.protobuf);
    const field6 = dgV9Field(record.protobuf, 6);
    const field10 = dgV9Field(record.protobuf, 10);
    const heartbeat = field6 === null && field10 === null && !field5 && Number(record.byteLength || 0) <= 120;
    const prior = dgV9LastField6;
    if (field6 !== null) dgV9LastField6 = field6;
    const entry = { timestamp: now, socketOpenElapsedMs: record.socketOpenElapsedMs, socketGeneration: record.socketGeneration, direction: 'outbound', chainId: null, sequence: record.sequence, byteLength: record.byteLength, field1, field5, field6, field10, heartbeat, printableIdentityStrings: [field5].filter(Boolean), envelopeNumericIdentityCandidates: dgV9TableCandidates(field6), roundLikeIdentityCandidates: dgV9RoundCandidates(field5) };
    dgV9RecordTemporal(entry);
    if (!heartbeat && (prior !== field6 || now - Number(state.dgDataProbe.initialization.startedAt || now) <= DG_V9_OPEN_WINDOW_MS)) dgEvidencePush('dgProtocolTransitionEvidence', entry);
    for (const stream of dgV9Streams.values()) if (now >= stream.firstSeen && now - stream.lastUpdate <= DG_V9_STREAM_FOLLOWING_MS && stream.followingOutbound.length < 16 && !heartbeat) stream.followingOutbound.push(entry);
  }
  function dgV9ObserveInboundEnvelope(detail = {}) {
    const now = Number(detail.timestamp) || dgV9Now();
    const entry = { timestamp: now, socketGeneration: Number(detail.socketGeneration) || null, direction: 'inbound', chainId: detail.chainId || null, sequence: Number(detail.sequence) || null, byteLength: Number(detail.byteLength) || null, field1: null, field5: null, field6: null, field10: null, printableIdentityStrings: [], envelopeNumericIdentityCandidates: dgV9TableCandidates(detail.tableId), roundLikeIdentityCandidates: dgV9RoundCandidates(detail.roundIdentity), tableId: normalizeTableId(detail.tableId), tableName: detail.tableName || null, roundIdentity: dgV9IdentityString(detail.roundIdentity), family: detail.family || 'inbound-envelope' };
    dgV9Transition(entry);
    for (const stream of dgV9Streams.values()) if (now >= stream.firstSeen && now - stream.firstSeen <= DG_V9_STREAM_FOLLOWING_MS && stream.followingInbound.length < 16) stream.followingInbound.push(entry);
  }
  function dgV9CardKey(card) {
    const player = card?.player || '';
    const banker = card?.banker || '';
    if (typeof player !== 'string' || typeof banker !== 'string') return null;
    if (!/^\d+(?:-\d+){2}$/.test(player) || !/^\d+(?:-\d+){2}$/.test(banker)) return null;
    return `${player}|${banker}`;
  }
  function dgV9ObserveCards(summaries, detail = {}) {
    const now = Number(detail.timestamp) || dgV9Now();
    dgV9TrimHistory(now);
    for (const item of Array.isArray(summaries) ? summaries.slice(0, 12) : []) {
      const card = { player: item?.identity?.player?.value ?? null, banker: item?.identity?.banker?.value ?? null };
      const key = dgV9CardKey(card);
      if (!key) continue;
      const streamKey = `${detail.socketGeneration || ''}|${detail.frameId || ''}|${Number(item.objectIndex) || 0}`;
      let stream = dgV9Streams.get(streamKey);
      if (!stream) {
        const prior = dgV9TemporalHistory.filter(entry => entry.direction === 'outbound' && !entry.heartbeat && now - Number(entry.timestamp || 0) <= DG_V9_STREAM_OUTBOUND_MS).slice(-16);
        const inbound = dgV9TemporalHistory.filter(entry => entry.direction === 'inbound' && now - Number(entry.timestamp || 0) <= DG_V9_STREAM_OUTBOUND_MS).slice(-32);
        stream = { streamKey, firstSeen: now, lastUpdate: now, socketGeneration: Number(detail.socketGeneration) || null, precedingOutbound: prior, precedingInbound: inbound, followingOutbound: [], followingInbound: [], progression: [], candidateNumericTableIds: [], candidateRoundIds: [] };
        dgV9Streams.set(streamKey, stream);
      }
      stream.lastUpdate = now;
      if (stream.progression.length < 12) stream.progression.push({ timestamp: now, chainId: detail.chainId || null, frameByteLength: Number(detail.frameByteLength) || null, objectIndex: Number(item.objectIndex) || 0, startOffset: item.startOffset ?? null, endOffset: item.endOffset ?? null, rawPlayer: card.player, rawBanker: card.banker });
      const tableId = normalizeTableId(state.dg.tableId);
      if (tableId && !stream.candidateNumericTableIds.includes(tableId)) stream.candidateNumericTableIds.push(tableId);
      const round = dgV9IdentityString(state.dg.lastFrame?.roundIdentity) || null;
      if (round && !stream.candidateRoundIds.includes(round)) stream.candidateRoundIds.push(round);
      dgEvidencePush('dgCardStreamCorrelationEvidence', { streamKey, firstSeen: stream.firstSeen, lastUpdate: stream.lastUpdate, socketGeneration: stream.socketGeneration, precedingOutbound: stream.precedingOutbound, precedingInbound: stream.precedingInbound, followingOutbound: stream.followingOutbound, followingInbound: stream.followingInbound, progression: stream.progression, candidateNumericTableIds: stream.candidateNumericTableIds, candidateRoundIds: stream.candidateRoundIds });
    }
  }
  function dgOutboundControlIdentity(record) {
    const fields = record?.protobuf?.fields || [];
    const field = number => fields.find(item => item.fieldNumber === number && item.wireType === 0)?.varint ?? null;
    const field1 = field(1);
    const field6 = field(6);
    const field10 = field(10);
    const tableId = /^\d{4,12}$/.test(String(field6 ?? '')) ? normalizeTableId(field6) : null;
    if (!record?.binary || ![19, 44].includes(Number(field1)) || field10 !== 1 || !tableId) return null;
    return { tableId, field1, field6: Number(field6), field10, sequence: Number(record.sequence) || null, timestamp: Number(record.timestamp) || Date.now(), socketGeneration: Number(record.socketGeneration) || null, socketIdentity: record.socketIdentity || null, runtimeInstanceId: DISCOVERY_FRAME_ID };
  }
  function dgSocketKey(identity = {}) {
    if (identity.socketKey) return String(identity.socketKey).slice(0, 300);
    const runtimeId = String(identity.runtimeInstanceId || DISCOVERY_FRAME_ID).slice(0, 160);
    const socketId = String(identity.socketIdentity || '').slice(0, 120);
    const generation = Number(identity.socketGeneration) || 0;
    if (!socketId && !generation) return null;
    return `${runtimeId}|${socketId || `generation:${generation}`}`;
  }
  function dgTopAcceptsChildSource(source) {
    if (!isTopWindow || !source) return false;
    try {
      return Array.from(document.querySelectorAll('iframe')).some(frame => frame.contentWindow === source);
    } catch (_) {
      return false;
    }
  }
  function dgRelayIdentityMatchesActive(identity = {}) {
    const incomingKey = dgSocketKey(identity);
    const activeKey = state.dg.lifecycle.activeSocketKey;
    return Boolean(incomingKey && activeKey && incomingKey === activeKey);
  }
  function dgRelayIdentityFromState() {
    return {
      runtimeInstanceId: DISCOVERY_FRAME_ID,
      socketGeneration: Number(state.dg.ownership.socketGeneration) || null,
      socketIdentity: state.dg.ownership.socketIdentity || null,
      socketKey: state.dg.lifecycle.activeSocketKey,
      tableId: normalizeTableId(state.dg.ownership.tableId),
      shoeIdentity: state.dg.shoeIdentity || null,
      roundIdentity: state.dg.lastFrame?.roundIdentity || null
    };
  }
  function dgAdoptValidatedOwnership(identity) {
    if (!identity?.tableId) return false;
    const tableId = normalizeTableId(identity.tableId);
    if (!tableId) return false;
    const active = normalizeTableId(state.activeTableId);
    if (active && active !== tableId && state.activeTableSource !== 'dg-binary') return false;
    const previous = normalizeTableId(state.dg.ownership.tableId);
    const nextSocketKey = dgSocketKey(identity);
    const previousSocketKey = state.dg.lifecycle.activeSocketKey;
    if (!nextSocketKey) return false;
    const incomingRuntimeInstanceId = String(identity.runtimeInstanceId || DISCOVERY_FRAME_ID).slice(0, 160);
    const activeRuntimeInstanceId = state.dg.lifecycle.activeRuntimeInstanceId || state.dg.ownership.runtimeInstanceId || null;
    if (activeRuntimeInstanceId && incomingRuntimeInstanceId !== activeRuntimeInstanceId && state.dg.lifecycle.retiredRuntimeInstances.has(incomingRuntimeInstanceId)) return false;
    const newSocketInstance = Boolean(previousSocketKey && previousSocketKey !== nextSocketKey);
    const sameRuntimeInstance = Boolean(activeRuntimeInstanceId && incomingRuntimeInstanceId === activeRuntimeInstanceId);
    const incomingGeneration = Number(identity.socketGeneration) || 0;
    const activeGeneration = Number(state.dg.lifecycle.activeSocketGeneration) || 0;
    const incomingTimestamp = Number(identity.timestamp) || 0;
    const activeEstablishedAt = Number(state.dg.ownership.establishedAt) || 0;
    if (newSocketInstance && sameRuntimeInstance && activeGeneration && incomingGeneration && incomingGeneration < activeGeneration) return false;
    if (newSocketInstance && sameRuntimeInstance && activeEstablishedAt && incomingTimestamp && incomingTimestamp < activeEstablishedAt) return false;
    if (newSocketInstance && activeRuntimeInstanceId && incomingRuntimeInstanceId !== activeRuntimeInstanceId) {
      state.dg.lifecycle.retiredRuntimeInstances.add(activeRuntimeInstanceId);
      while (state.dg.lifecycle.retiredRuntimeInstances.size > 8) {
        const oldest = state.dg.lifecycle.retiredRuntimeInstances.values().next().value;
        state.dg.lifecycle.retiredRuntimeInstances.delete(oldest);
      }
    }
    if (previous !== tableId) {
      dgHistoricalAssociationFreeze('table-switch');
      state.dg.rounds.clear();
      state.dg.shoeIdentity = null;
      state.dg.shoeGeneration += 1;
      state.dg.lastFrame = null;
      state.dg.tableId = tableId;
      state.dg.tableName = null;
    }
    if (active !== tableId) switchActiveTable(tableId, 'dg-binary');
    state.activeTableSource = 'dg-binary';
    state.activeTableId = tableId;
    state.dg.tableId = tableId;
    state.dg.lifecycle.activeRuntimeInstanceId = incomingRuntimeInstanceId;
    state.dg.lifecycle.activeSocketKey = nextSocketKey;
    state.dg.lifecycle.activeSocketIdentity = identity.socketIdentity || null;
    state.dg.lifecycle.activeSocketGeneration = Number(identity.socketGeneration) || null;
    state.dg.lifecycle.adoptionCount += newSocketInstance || !previous ? 1 : 0;
    state.dg.pendingControlIdentity = { ...identity, socketKey: nextSocketKey };
    state.dg.ownership = {
      tableId,
      source: 'outbound-control-field6',
      socketGeneration: Number(identity.socketGeneration) || null,
      socketIdentity: identity.socketIdentity || null,
      runtimeInstanceId: incomingRuntimeInstanceId,
      socketKey: nextSocketKey,
      sequence: Number(identity.sequence) || 0,
      establishedAt: Number(identity.timestamp) || Date.now(),
      controlField1: Number(identity.field1) || null,
      controlField10: Number(identity.field10) || null
    };
    if (!isTopWindow) {
      try {
        window.top.postMessage({
          type: DG_SOCKET_INSTANCE_MESSAGE,
          identity: { ...dgRelayIdentityFromState(), field1: identity.field1, field6: identity.field6, field10: identity.field10 }
        }, '*');
      } catch (_) {}
    }
    return true;
  }
  function dgOwnsIdentity(tableId) {
    const owner = normalizeTableId(state.dg.ownership.tableId);
    return Boolean(owner && normalizeTableId(tableId) === owner);
  }
  function dgPublishVerifiedRecordProbeContext(decoded) {
    const packetTableId = normalizeTableId(decoded?.tableId);
    const ownerTableId = normalizeTableId(state.dg.ownership.tableId);
    if (!packetTableId || !ownerTableId || packetTableId !== ownerTableId || !dgOwnsIdentity(packetTableId)) return false;
    const roundIdentity = String(decoded?.roundIdentity || '').trim();
    const shoeIdentity = String(decoded?.shoeIdentity || dgShoeIdentity(roundIdentity) || '').trim();
    const currentRound = dgRoundIndex(roundIdentity);
    if (!roundIdentity || !/^\d{8,}R\d{1,8}$/i.test(roundIdentity) || !/^\d+$/.test(shoeIdentity) || !Number.isInteger(currentRound) || currentRound <= 0) return false;
    const registry = state.tableIdentityRegistry.get(packetTableId);
    const existingContext = state.recordProbeContext;
    const exactTableListRow = state.tableListRows
      .slice()
      .reverse()
      .map(item => item?.primitiveFields || item)
      .find(item => normalizeTableId(item?.table_id ?? item?.tableId) === packetTableId) || null;
    const exactRowRoomId = exactTableListRow?.room_id ?? exactTableListRow?.roomId ?? null;
    const recordProbeContextRoomIdPresent = normalizeTableId(existingContext?.activeTableId) === packetTableId && Boolean(existingContext?.roomId);
    const roomId = registry?.roomId || (
      normalizeTableId(existingContext?.activeTableId) === packetTableId
        ? String(existingContext?.roomId || '').trim()
        : ''
    );
    dgTrustedRoomIdentityObserve({
      source: 'dgPublishVerifiedRecordProbeContext',
      tableId: packetTableId,
      roomId,
      shoe: shoeIdentity,
      round: roundIdentity,
      matchedVerifiedOwnership: packetTableId === ownerTableId && dgOwnsIdentity(packetTableId),
      exactTableListRowPresent: Boolean(exactTableListRow),
      exactRowRoomIdPresent: Boolean(exactRowRoomId),
      registryRoomIdPresent: Boolean(registry?.roomId),
      recordProbeContextRoomIdPresent,
      finalReason: roomId ? 'roomId-available' : !exactTableListRow ? 'missing-exact-table-list-row' : !exactRowRoomId ? 'row-missing-roomId' : !registry?.roomId && !recordProbeContextRoomIdPresent ? 'registry-not-merged' : 'missing-roomId'
    });
    if (!roomId) return false;
    const context = {
      activeTableId: packetTableId,
      roomId,
      shoe: shoeIdentity,
      round: currentRound,
      frameId: DISCOVERY_FRAME_ID,
      source: 'dg-binary-verified-packet'
    };
    publishRecordProbeContext(context);
    return true;
  }
  function dgV9ObserveUiMutation(records) {
    for (const record of Array.isArray(records) ? records.slice(0, 16) : []) {
      const nodes = Array.from(record?.addedNodes || []).slice(0, 8);
      if (!nodes.length && record?.target) nodes.push(record.target);
      for (const node of nodes) {
        let text = '';
        try { text = String(node.textContent || '').replace(/\s+/g, ' ').trim(); } catch (_) {}
        const labels = text.match(/\b(?:RB\d{1,4}|BAC\d{1,6})\b/gi) || [];
        const unique = Array.from(new Set(labels.map(value => value.toUpperCase())));
        if (unique.length !== 1) continue;
        dgEvidencePush('dgProtocolUiEvidence', { ...dgV9UiSnapshot('dom-single-table-node'), changedLabel: unique[0], node: dgTableSelectionNodeSnapshot(node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement) });
      }
    }
  }

  const DG_OUTBOUND_FIELD_KEYS = new Set([
    'action', 'type', 'topic', 'channel', 'table', 'table_id', 'tableid',
    'room', 'room_id', 'roomid', 'game', 'event', 'state'
  ]);
  const DG_OUTBOUND_SENSITIVE_KEYS = /token|session|authorization|cookie|password|secret|member|account|user|phone|email|balance|license/i;

  function dgOutboundSafePrimitive(key, value) {
    if (DG_OUTBOUND_SENSITIVE_KEYS.test(String(key || ''))) return '[REDACTED]';
    if (value === null || value === undefined) return value === null ? null : '[undefined]';
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    if (/url|href|src|query|hash/i.test(String(key || ''))) return '[URL_REDACTED]';
    return value.replace(/[?&#].*$/, '').slice(0, 120);
  }

  function dgOutboundPrintableSegments(bytes) {
    const segments = [];
    let start = -1;
    const push = end => {
      if (start >= 0 && end - start >= 3 && segments.length < 16) {
        segments.push({ start, length: end - start, value: String.fromCharCode(...bytes.slice(start, end)).slice(0, 120) });
      }
      start = -1;
    };
    for (let index = 0; index < bytes.length; index += 1) {
      const printable = bytes[index] >= 32 && bytes[index] <= 126;
      if (printable && start < 0) start = index;
      if ((!printable || index === bytes.length - 1) && start >= 0) push(printable && index === bytes.length - 1 ? index + 1 : index);
    }
    return segments;
  }

  function dgOutboundReadVarint(bytes, offset) {
    let value = 0;
    let shift = 0;
    for (let index = offset; index < Math.min(bytes.length, offset + 5); index += 1) {
      value += (bytes[index] & 0x7f) * (2 ** shift);
      if (!(bytes[index] & 0x80)) return { value, next: index + 1 };
      shift += 7;
    }
    return null;
  }

  function dgOutboundProtobufSummary(bytes) {
    const fields = [];
    const strings = [];
    let offset = 0;
    while (offset < bytes.length && fields.length < 32) {
      const key = dgOutboundReadVarint(bytes, offset);
      if (!key) break;
      offset = key.next;
      const fieldNumber = Math.floor(key.value / 8);
      const wireType = key.value & 7;
      if (!fieldNumber || fieldNumber > 2048) break;
      const item = { fieldNumber, wireType };
      if (wireType === 0) {
        const value = dgOutboundReadVarint(bytes, offset);
        if (!value) break;
        item.varint = value.value;
        offset = value.next;
      } else if (wireType === 2) {
        const length = dgOutboundReadVarint(bytes, offset);
        if (!length || length.value > bytes.length - length.next) break;
        item.length = length.value;
        const start = length.next;
        const end = start + length.value;
        const segment = bytes.slice(start, Math.min(end, bytes.length));
        const printable = segment.length >= 3 && segment.every(byte => byte >= 32 && byte <= 126);
        if (printable && strings.length < 16) strings.push({ fieldNumber, length: length.value, value: String.fromCharCode(...segment).replace(/[?&#].*$/, '').slice(0, 120) });
        offset = end;
      } else if (wireType === 1) {
        item.length = 8;
        offset += 8;
      } else if (wireType === 5) {
        item.length = 4;
        offset += 4;
      } else {
        break;
      }
      fields.push(item);
    }
    return { fields, printableLengthDelimitedStrings: strings };
  }

  function dgOutboundTextSummary(raw) {
    if (typeof raw !== 'string' || !raw) return { parse: 'empty', topLevelKeys: [] };
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { return { parse: 'json-fail', topLevelKeys: [] }; }
    const topLevelKeys = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? dgProbeKeys(parsed, 40).filter(key => !DG_OUTBOUND_SENSITIVE_KEYS.test(String(key))) : [];
    const values = {};
    const visit = (value, depth = 0) => {
      if (!value || typeof value !== 'object' || depth > 4) return;
      for (const [key, child] of Object.entries(value)) {
        const lower = key.toLowerCase();
        if (DG_OUTBOUND_FIELD_KEYS.has(lower) && (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean' || child === null)) {
          if (values[lower] === undefined) values[lower] = dgOutboundSafePrimitive(key, child);
        }
        if (child && typeof child === 'object') visit(child, depth + 1);
      }
    };
    visit(parsed);
    return { parse: 'json-ok', topLevelKeys, values };
  }

  function dgCurrentTableUiSnapshot(detail = {}) {
    const labels = [];
    const pushLabel = value => {
      const text = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (!text || /token|session|authorization|cookie|account|member|license/i.test(text)) return;
      if (/^(?:[A-Z]{2,5}\d{1,5}|BAC\d{1,6}|\d{1,12})$/i.test(text)) labels.push(text);
    };
    pushLabel(state.dg.tableName);
    pushLabel(state.pendingClickedTableName);
    pushLabel(state.activeTableId);
    try {
      const nodes = document.querySelectorAll('[data-table],[data-table-id],[data-table-name],[id*="table" i],[class*="table" i]');
      for (const node of Array.from(nodes).slice(0, 80)) {
        for (const attr of ['data-table', 'data-table-id', 'data-table-name', 'data-room', 'data-room-id']) pushLabel(node.getAttribute?.(attr));
        pushLabel(node.textContent);
        if (labels.length >= 12) break;
      }
    } catch (_) {}
    const visible = Array.from(new Set(labels)).slice(0, 12);
    let locationValue = '';
    try { locationValue = `${location.hostname}${location.pathname}`.slice(0, 300); } catch (_) {}
    return {
      timestamp: Date.now(),
      socketGeneration: Number(detail.socketGeneration) || null,
      visibleTableLabels: visible,
      tableIdentityCandidates: visible.filter(value => /^\d{1,12}$/.test(value)),
      frameUrl: locationValue || null
    };
  }

  function observeDgCurrentTableUi(detail = {}, reason = 'transport') {
    const snapshot = dgCurrentTableUiSnapshot(detail);
    const previous = state.dgDataProbe.dgCurrentTableUiEvidence.at(-1);
    const signature = JSON.stringify({ labels: snapshot.visibleTableLabels, ids: snapshot.tableIdentityCandidates, url: snapshot.frameUrl, socketGeneration: snapshot.socketGeneration });
    if (reason === 'label-change' && previous?.signature === signature) return;
    dgEvidencePush('dgCurrentTableUiEvidence', { reason, sequence: Number(detail.sequence) || null, socketIdentity: detail.socketIdentity || null, signature, ...snapshot });
  }

  function dgRoadDiagnostic(reason, detail = {}) {
    const diagnostics = state.dgDataProbe.dgRoadObserverDiagnostics;
    if (!diagnostics) return;
    diagnostics.lastReason = String(reason || 'unknown').slice(0, 80);
    const entry = { timestamp: Date.now(), reason: diagnostics.lastReason, ...detail };
    diagnostics.reasons.push(redactObject(entry));
    if (diagnostics.reasons.length > 16) diagnostics.reasons.splice(0, diagnostics.reasons.length - 16);
  }

  const DG_ROAD_LABELS = Object.freeze({
    banker: /^(?:莊|庄|banker)$/i,
    player: /^(?:閒|闲|player)$/i,
    tie: /^(?:和|tie)$/i
  });
  const dgRoadLastSignatures = new Set();
  const dgRoadCanvasContexts = new WeakMap();
  const dgRoadCanvasContextIds = new Set();

  function dgRoadIdentitySnapshot() {
    const tableId = normalizeTableId(state.dg.ownership.tableId || state.dg.tableId || state.activeTableId);
    const shoeIdentity = String(state.dg.shoeIdentity || state.shoe || '').trim() || null;
    const ownershipTableId = normalizeTableId(state.dg.ownership.tableId);
    const associationVerified = Boolean(tableId && shoeIdentity && ownershipTableId === tableId);
    return {
      tableId: tableId || null,
      shoeIdentity,
      associationVerified,
      verificationReason: associationVerified
        ? 'verified-live-table-and-shoe-context-only'
        : (!tableId ? 'missing-verified-table-id' : !shoeIdentity ? 'missing-shoe-identity' : 'table-ownership-mismatch')
    };
  }

  function dgRoadNumber(value) {
    const number = Number(String(value ?? '').replace(/[,\s]/g, ''));
    return Number.isInteger(number) && number >= 0 && number <= 999 ? number : null;
  }

  function dgRoadSafeText(value) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text || text.length > 180 || /token|cookie|authorization|session|password|member|account|balance|license/i.test(text)) return null;
    return text;
  }

  function dgRoadStatFromText(value) {
    const text = dgRoadSafeText(value);
    if (!text) return null;
    const result = { bankerCount: null, playerCount: null, tieCount: null };
    const patterns = [
      ['bankerCount', /(?:莊|庄|banker)\s*(?:[:：]|=)?\s*(\d{1,3})/i],
      ['playerCount', /(?:閒|闲|player)\s*(?:[:：]|=)?\s*(\d{1,3})/i],
      ['tieCount', /(?:和|tie)\s*(?:[:：]|=)?\s*(\d{1,3})/i]
    ];
    let matched = false;
    for (const [key, pattern] of patterns) {
      const match = text.match(pattern);
      if (match) { result[key] = dgRoadNumber(match[1]); matched = result[key] !== null || matched; }
    }
    return matched ? result : null;
  }

  function dgRoadEmitStat(source, counts, detail = {}) {
    if (!counts || !['bankerCount', 'playerCount', 'tieCount'].some(key => Number.isInteger(counts[key]))) return false;
    const identity = dgRoadIdentitySnapshot();
    const bankerCount = Number.isInteger(counts.bankerCount) ? counts.bankerCount : null;
    const playerCount = Number.isInteger(counts.playerCount) ? counts.playerCount : null;
    const tieCount = Number.isInteger(counts.tieCount) ? counts.tieCount : null;
    const observedTotal = [bankerCount, playerCount, tieCount].every(Number.isInteger)
      ? bankerCount + playerCount + tieCount
      : null;
    const signature = JSON.stringify({ source, ...identity, bankerCount, playerCount, tieCount, observedTotal });
    if (dgRoadLastSignatures.has(signature)) return false;
    dgRoadLastSignatures.add(signature);
    if (dgRoadLastSignatures.size > 128) dgRoadLastSignatures.delete(dgRoadLastSignatures.values().next().value);
    dgEvidencePush('dgRoadStatEvidence', {
      source,
      tableId: identity.tableId,
      shoeIdentity: identity.shoeIdentity,
      bankerCount,
      playerCount,
      tieCount,
      observedTotal,
      completedRoundCountCandidate: observedTotal,
      associationVerified: identity.associationVerified,
      verificationReason: identity.verificationReason,
      candidateStatus: 'observed-ui-stat-not-proven-complete-shoe',
      ...detail
    });
    return true;
  }

  function dgRoadScanNode(node, source = 'dg-road-dom') {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
    let text = '';
    try { text = node.textContent || ''; } catch (_) { return; }
    let counts = dgRoadStatFromText(text);
    if (!counts && /莊|庄|閒|闲|和|banker|player|tie|\b\d{1,3}\b/i.test(text)) {
      try {
        const parentText = node.parentElement?.textContent || '';
        if (parentText.length <= 180) counts = dgRoadStatFromText(parentText);
      } catch (_) {}
    }
    if (counts) {
      state.dgDataProbe.dgRoadObserverDiagnostics.domMatchedCount += 1;
      dgRoadDiagnostic('dom-match', { nodeTag: String(node.tagName || '').slice(0, 24) });
      dgRoadEmitStat(source, counts, { nodeTag: String(node.tagName || '').slice(0, 24) });
    }
  }

  function dgRoadScanDocument(source = 'dg-road-dom-scan') {
    if (typeof document === 'undefined') return;
    const diagnostics = state.dgDataProbe.dgRoadObserverDiagnostics;
    diagnostics.domScanCount += 1;
    let nodes = [];
    try { nodes = Array.from(document.querySelectorAll('body *')); } catch (_) {}
    const limit = 2000;
    diagnostics.domScanLimitHit = nodes.length > limit;
    nodes = nodes.slice(0, limit);
    diagnostics.domNodesScanned += nodes.length;
    for (const node of nodes) dgRoadScanNode(node, source);
    if (!nodes.length) dgRoadDiagnostic('dom-no-elements');
    else if (diagnostics.domMatchedCount === 0) dgRoadDiagnostic(diagnostics.domScanLimitHit ? 'dom-no-match-scan-limit' : 'dom-no-label-number-match', { scanned: nodes.length });
    else dgRoadDiagnostic('dom-scan-complete', { scanned: nodes.length, matched: diagnostics.domMatchedCount });
  }

  function dgRoadCanvasLabel(text) {
    const normalized = String(text || '').replace(/\s+/g, '').toLowerCase();
    for (const [key, pattern] of Object.entries(DG_ROAD_LABELS)) if (pattern.test(normalized)) return key;
    return null;
  }

  function installDgRoadCanvasTextHook() {
    if (typeof document === 'undefined') return;
    const key = '__BP_DG_ROAD_CANVAS_TEXT_V1__';
    if (window[key]) return;
    window[key] = true;
    const install = () => {
      try {
        const proto = window.CanvasRenderingContext2D?.prototype;
        if (!proto || typeof proto.fillText !== 'function') return false;
        for (const method of ['fillText', 'strokeText']) {
          const original = proto[method];
          if (typeof original !== 'function' || original.__bpDgRoadHook) continue;
          const wrapped = function (text) {
            try {
              const safe = dgRoadSafeText(text);
              const label = dgRoadCanvasLabel(safe);
              const numeric = /^\d{1,3}$/.test(String(safe || '').trim()) ? dgRoadNumber(safe) : null;
              if (label || numeric !== null) {
                const current = dgRoadCanvasContexts.get(this) || { label: null, counts: { bankerCount: null, playerCount: null, tieCount: null } };
                if (label) current.label = label;
                if (numeric !== null && current.label) {
                  current.counts[`${current.label}Count`] = numeric;
                  dgRoadEmitCanvasEvent({ method, numericValue: numeric, label: current.label, width: this.canvas?.width || null, height: this.canvas?.height || null });
                  current.label = null;
                  if (Object.values(current.counts).every(Number.isInteger)) {
                    dgRoadEmitCanvasEvent({ method, counts: { ...current.counts }, width: this.canvas?.width || null, height: this.canvas?.height || null });
                  }
                }
                dgRoadCanvasContexts.set(this, current);
              }
            } catch (_) {}
            return original.apply(this, arguments);
          };
          wrapped.__bpDgRoadHook = true;
          proto[method] = wrapped;
        }
        return true;
      } catch (_) { return false; }
    };
    const source = '(' + function (eventName) {
      const hookKey = '__BP_DG_ROAD_CANVAS_PAGE_HOOK_V1__';
      if (window[hookKey]) return;
      window[hookKey] = true;
      const emit = detail => { try { window.dispatchEvent(new CustomEvent(eventName, { detail })); } catch (_) {} };
      const install = () => {
        try {
          const proto = window.CanvasRenderingContext2D?.prototype;
          if (!proto) return false;
          let diagnosticCalls = 0;
          const hookStartedAt = Date.now();
          let contextSequence = 0;
          const contexts = new WeakMap();
          const contextIds = new WeakMap();
          const contextIdFor = canvasContext => {
            let contextId = contextIds.get(canvasContext);
            if (!contextId) {
              contextId = 'canvas-' + (++contextSequence);
              contextIds.set(canvasContext, contextId);
              emit({ observation: 'context-created', contextId });
            }
            return contextId;
          };
          for (const method of ['fillText', 'strokeText']) {
            const original = proto[method];
            if (typeof original !== 'function' || original.__bpDgRoadHook) continue;
            const wrapped = function (text) {
              try {
                const safe = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
                const normalized = safe.replace(/\s+/g, '').toLowerCase();
                const labels = { banker: /^(?:莊|庄|banker)$/i, player: /^(?:閒|闲|player)$/i, tie: /^(?:和|tie)$/i };
                let label = null;
                for (const [key, pattern] of Object.entries(labels)) if (pattern.test(normalized)) label = key;
                const labelLike = /(?:莊|庄|閒|闲|和|banker|player|tie)/i.test(normalized);
                const combined = safe.match(/(莊|庄|閒|闲|和|banker|player|tie)\s*(?:[:：=])?\s*(\d{1,3})/i);
                if (!label && combined) {
                  const combinedLabel = String(combined[1]).toLowerCase();
                  label = /莊|庄|banker/i.test(combinedLabel) ? 'banker' : /閒|闲|player/i.test(combinedLabel) ? 'player' : 'tie';
                }
                const numeric = /^\d{1,3}$/.test(safe) ? Number(safe) : combined ? Number(combined[2]) : null;
                const contextId = (labelLike || numeric !== null) ? contextIdFor(this) : null;
                const atMs = Math.max(0, Date.now() - hookStartedAt);
                const labelToken = safe.match(/莊|庄|閒|闲|和|banker|player|tie/i)?.[0] || null;
                const labelStart = labelToken ? normalized.indexOf(String(labelToken).replace(/\s+/g, '').toLowerCase()) : -1;
                const labelShape = labelLike
                  ? (combined ? 'combined-label-number' : labelStart === 0 ? (normalized.length > String(labelToken || '').length ? 'label-with-suffix' : 'label') : 'label-with-prefix')
                  : null;
                const separatorFeatures = labelLike ? { colon: /[:：]/.test(safe), equals: /=/.test(safe), whitespace: /\s/.test(safe), punctuation: /[^\w\s莊庄閒闲和]/i.test(safe) } : null;
                const numericFeatures = { present: numeric !== null, standalone: /^\d{1,3}$/.test(safe), digitCount: numeric === null ? 0 : String(numeric).length };
                if (diagnosticCalls < 2000 || label || numeric !== null) {
                  diagnosticCalls += 1;
                  emit({ observation: 'text-call', method, textClass: labelLike && !label ? 'label-like' : label ? 'label' : numeric !== null ? 'numeric' : 'other', matched: Boolean(label || numeric !== null), label: label || null, contextId, atMs, width: this.canvas?.width || null, height: this.canvas?.height || null });
                }
                if (labelLike && !label) emit({ observation: 'label-like-call', method, contextId, atMs, labelShape, separatorFeatures, numericFeatures, textLengthBucket: safe.length <= 4 ? '0-4' : safe.length <= 8 ? '5-8' : safe.length <= 16 ? '9-16' : safe.length <= 32 ? '17-32' : '33-80' });
                if (label || numeric !== null) {
                  let current = contexts.get(this) || { label: null, labelAt: 0, counts: { bankerCount: null, playerCount: null, tieCount: null } };
                  const now = Date.now();
                  if (current.label && now - current.labelAt > 1500) {
                    emit({ observation: 'pair-rejected', reason: 'label-timeout', contextId });
                    current.label = null;
                  }
                  if (label) {
                    current.label = label;
                    current.labelAt = now;
                    emit({ observation: 'pair-candidate', label, contextId });
                  }
                  if (numeric !== null && current.label && now - current.labelAt <= 1500) {
                    current.counts[current.label + 'Count'] = numeric;
                    emit({ observation: 'pair-accepted', method, label: current.label, numericValue: numeric, contextId, width: this.canvas?.width || null, height: this.canvas?.height || null });
                    current.label = null;
                    if (Object.values(current.counts).every(Number.isInteger)) emit({ observation: 'complete-set', method, counts: { ...current.counts }, contextId, width: this.canvas?.width || null, height: this.canvas?.height || null });
                  } else if (numeric !== null) {
                    emit({ observation: 'pair-rejected', reason: current.label ? 'label-window-expired' : 'numeric-without-label', contextId });
                  }
                  contexts.set(this, current);
                }
              } catch (_) {}
              return original.apply(this, arguments);
            };
            wrapped.__bpDgRoadHook = true;
            proto[method] = wrapped;
          }
          emit({ observation: 'hook-installed', frame: 'page-context' });
          return true;
        } catch (_) { return false; }
      };
      let attempts = 0;
      const retry = () => { if (install()) return; if (attempts++ >= 20) { emit({ observation: 'hook-timeout', frame: 'page-context' }); return; } setTimeout(retry, 50); };
      retry();
    } + ')(' + JSON.stringify(DG_ROAD_CANVAS_TEXT_EVENT) + ');';
    try {
      const script = document.createElement('script');
      script.textContent = source;
      (document.documentElement || document.head || document.body).appendChild(script);
      script.remove();
    } catch (_) {}
  }

  function dgRoadEmitCanvasEvent(detail) {
    const counts = detail?.counts || null;
    if (counts) dgRoadEmitStat('dg-road-canvas-text', counts, { canvasMethod: detail.method, canvasWidth: detail.width, canvasHeight: detail.height });
  }

  function installDgRoadStatObserver() {
    if (typeof document === 'undefined') return;
    const diagnostics = state.dgDataProbe.dgRoadObserverDiagnostics;
    diagnostics.canvasHookRequested = true;
    dgRoadDiagnostic('canvas-hook-requested', { frame: 'document-context' });
    installDgRoadCanvasTextHook();
    const eventKey = '__BP_DG_ROAD_STAT_DOM_V1__';
    if (window[eventKey]) return;
    window[eventKey] = true;
    diagnostics.domInstalled = true;
    dgRoadDiagnostic('dom-observer-installed', { frame: isTopWindow ? 'top' : 'child' });
    const scan = () => dgRoadScanDocument('dg-road-dom');
    let scanTimer = null;
    const scheduleScan = () => {
      if (scanTimer !== null) return;
      scanTimer = setTimeout(() => { scanTimer = null; scan(); }, 120);
    };
    if (typeof MutationObserver === 'function') {
      const root = document.body || document.documentElement;
      if (root) {
        const observer = new MutationObserver(() => scheduleScan());
        try { observer.observe(root, { subtree: true, childList: true, characterData: true }); } catch (_) {}
        setTimeout(() => { try { observer.disconnect(); } catch (_) {} }, 120000);
      }
    }
    scan();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  }

  function dgRoadBoundedAppend(list, value, limit = 32) {
    list.push(redactObject(value));
    if (list.length > limit) list.splice(0, list.length - limit);
  }

  window.addEventListener(DG_ROAD_CANVAS_TEXT_EVENT, event => {
    const detail = event?.detail;
    const diagnostics = state.dgDataProbe.dgRoadObserverDiagnostics;
    if (!detail || typeof detail !== 'object') return;
    if (detail.observation === 'hook-installed') {
      diagnostics.canvasHookInstalled = true;
      diagnostics.lastReason = 'canvas-hook-installed';
      dgRoadDiagnostic('canvas-hook-installed', { frame: 'page-context' });
      return;
    }
    if (detail.observation === 'hook-timeout') {
      diagnostics.lastReason = 'canvas-hook-timeout';
      dgRoadDiagnostic('canvas-hook-timeout', { frame: 'page-context' });
      return;
    }
    if (detail.observation === 'text-call') {
      diagnostics.canvasCallsObserved = Math.min(2000, diagnostics.canvasCallsObserved + 1);
      if (detail.matched) diagnostics.canvasMatchedCalls = Math.min(2000, diagnostics.canvasMatchedCalls + 1);
      if (detail.textClass === 'label') diagnostics.canvasLabelCount = Math.min(2000, diagnostics.canvasLabelCount + 1);
      if (detail.textClass === 'label-like') diagnostics.canvasLabelLikeCount = Math.min(2000, diagnostics.canvasLabelLikeCount + 1);
      if (detail.textClass === 'numeric') diagnostics.canvasNumericCount = Math.min(2000, diagnostics.canvasNumericCount + 1);
      if (detail.label) dgRoadDiagnostic('canvas-label-observed', { label: String(detail.label).slice(0, 12) });
      if (detail.textClass === 'numeric') {
        const numericEvidence = { timestamp: Date.now(), contextId: String(detail.contextId || '').slice(0, 24) || null, method: String(detail.method || '').slice(0, 16), atMs: Number(detail.atMs) || 0, order: 'numeric' };
        dgRoadBoundedAppend(diagnostics.canvasNumericEvidence, numericEvidence);
        const previous = diagnostics.canvasLabelLikeEvidence.at(-1) || null;
        const sameContext = Boolean(previous && previous.contextId && previous.contextId === numericEvidence.contextId);
        const elapsedMs = sameContext ? numericEvidence.atMs - Number(previous.atMs || 0) : null;
        dgRoadBoundedAppend(diagnostics.canvasCorrelationEvidence, { timestamp: Date.now(), contextId: numericEvidence.contextId, labelLikeSeen: Boolean(previous), sameContext, labelBeforeNumeric: Boolean(previous && elapsedMs >= 0), within1500ms: Boolean(sameContext && elapsedMs >= 0 && elapsedMs <= 1500), elapsedMs: elapsedMs === null ? null : Math.max(0, Math.min(60000, elapsedMs)), numericAtMs: numericEvidence.atMs });
      }
    }
    if (detail.observation === 'label-like-call') {
      const labelEvidence = { timestamp: Date.now(), contextId: String(detail.contextId || '').slice(0, 24) || null, method: String(detail.method || '').slice(0, 16), atMs: Number(detail.atMs) || 0, labelShape: String(detail.labelShape || 'unknown').slice(0, 32), separatorFeatures: detail.separatorFeatures || null, numericFeatures: detail.numericFeatures || null, textLengthBucket: String(detail.textLengthBucket || 'unknown').slice(0, 8) };
      dgRoadBoundedAppend(diagnostics.canvasLabelLikeEvidence, labelEvidence);
      dgRoadDiagnostic('canvas-label-like-observed', { contextId: labelEvidence.contextId, labelShape: labelEvidence.labelShape, atMs: labelEvidence.atMs });
    }
    if (detail.observation === 'context-created' && detail.contextId) {
      dgRoadCanvasContextIds.add(String(detail.contextId).slice(0, 24));
      diagnostics.canvasContextCount = Math.min(64, dgRoadCanvasContextIds.size);
      dgRoadDiagnostic('canvas-context-created', { contextId: String(detail.contextId).slice(0, 24) });
    }
    if (detail.observation === 'pair-accepted') {
      diagnostics.canvasPairAcceptedCount = Math.min(2000, diagnostics.canvasPairAcceptedCount + 1);
      dgRoadDiagnostic('canvas-pair-accepted', { label: String(detail.label || '').slice(0, 12), contextId: String(detail.contextId || '').slice(0, 24) });
    }
    if (detail.observation === 'pair-rejected') {
      const reason = String(detail.reason || 'unknown').slice(0, 40);
      diagnostics.canvasPairRejectedReasons[reason] = Math.min(2000, (diagnostics.canvasPairRejectedReasons[reason] || 0) + 1);
      dgRoadDiagnostic('canvas-pair-rejected', { reason, contextId: String(detail.contextId || '').slice(0, 24) });
    }
    if (!detail.counts) return;
    diagnostics.canvasCompleteSetCount = Math.min(64, diagnostics.canvasCompleteSetCount + 1);
    dgRoadEmitStat('dg-road-canvas-text', detail.counts, {
      canvasMethod: String(detail.method || '').slice(0, 16),
      canvasWidth: Number(detail.width) || null,
      canvasHeight: Number(detail.height) || null,
      canvasContextId: String(detail.contextId || '').slice(0, 24) || null,
      pairing: 'same-canvas-context-within-1500ms'
    });
  });

  function dgTableSelectionSafeText(value) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text || /token|session|authorization|cookie|password|secret|member|account|user|phone|email|balance|license/i.test(text)) return null;
    return text.slice(0, 120);
  }

  function dgTableSelectionSafeAttribute(name, value) {
    const key = String(name || '').toLowerCase();
    if (!/^(?:id|class|name|value|role|title|aria-[\w-]+|href|data-(?:table|room|game|desk|id|name)[\w-]*)$/.test(key)) return null;
    if (/token|session|authorization|cookie|password|secret|member|account|user|phone|email|balance|license/i.test(key)) return '[REDACTED]';
    const text = dgTableSelectionSafeText(value);
    if (!text) return null;
    if (key === 'href') {
      try { const url = new URL(text, location.href); return `${url.origin}${url.pathname}`.slice(0, 300); } catch (_) { return '[URL_REDACTED]'; }
    }
    return text;
  }

  function dgTableSelectionNodeSnapshot(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
    const attributes = {};
    for (const attr of Array.from(node.attributes || []).slice(0, 40)) {
      const safe = dgTableSelectionSafeAttribute(attr.name, attr.value);
      if (safe !== null) attributes[attr.name] = safe;
    }
    let visibleText = null;
    try { visibleText = dgTableSelectionSafeText(node.textContent)?.slice(0, 160) || null; } catch (_) {}
    return { tagName: String(node.tagName || '').slice(0, 30), attributes, visibleText };
  }

  function dgTableSelectionLabel(nodes) {
    for (const node of nodes) {
      const values = [];
      try { values.push(node.getAttribute?.('data-table'), node.getAttribute?.('data-table-name'), node.getAttribute?.('data-room'), node.getAttribute?.('aria-label'), node.textContent); } catch (_) {}
      for (const value of values) {
        const text = dgTableSelectionSafeText(value);
        const match = text?.match(/\b(RB\d{1,4}|BAC\d{1,6})\b/i);
        if (match) return match[1].toUpperCase();
      }
    }
    return null;
  }

  function dgTableSelectionInteractionSnapshot(event, interactionType) {
    let node = event?.target;
    if (node?.nodeType !== Node.ELEMENT_NODE) node = node?.parentElement || null;
    const nodes = [];
    for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) nodes.push(node);
    const label = dgTableSelectionLabel(nodes);
    const tableSignal = label || nodes.some(item => {
      try { return Boolean(item.matches?.('.gameDesk,[data-table],[data-table-id],[data-table-name],[data-room],[data-room-id],[id*="table" i],[class*="table" i]')); } catch (_) { return false; }
    });
    if (!tableSignal) return null;
    let path = '';
    try { path = `${location.hostname}${location.pathname}`.slice(0, 300); } catch (_) {}
    return {
      selectionId: `sel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      interactionType,
      selectedUiLabel: label,
      socketGeneration: null,
      frameUrl: path || null,
      target: dgTableSelectionNodeSnapshot(nodes[0]),
      ancestors: nodes.slice(1, 6).map(dgTableSelectionNodeSnapshot)
    };
  }

  function dgTableSelectionCorrelationRecord(selection) {
    return {
      selectionId: selection.selectionId,
      selectedUiLabel: selection.selectedUiLabel,
      selectionTimestamp: selection.timestamp,
      windowEndsAt: selection.timestamp + 5000,
      candidateOutboundTableIds: [],
      candidateInboundTableIds: [],
      candidateRoundIds: [],
      outbound: [],
      inbound: [],
      cardObjectCount: 0
    };
  }

  function dgTableSelectionPushUnique(list, value, limit = 64) {
    if (value === null || value === undefined || value === '') return;
    const text = String(value).slice(0, 120);
    if (!list.includes(text)) list.push(text);
    if (list.length > limit) list.splice(0, list.length - limit);
  }

  function dgTableSelectionWindows(now = Date.now()) {
    return state.dgDataProbe.dgTableSelectionCorrelationEvidence.filter(item => Number(item.windowEndsAt) >= now);
  }

  function dgTableSelectionAddOutbound(record) {
    for (const correlation of dgTableSelectionWindows(record.timestamp)) {
      const protobuf = record.protobuf || {};
      const field = number => protobuf.fields?.find(item => item.fieldNumber === number && item.wireType === 0)?.varint ?? null;
      const field5String = record.stringValues?.find(item => item.fieldNumber === 5)?.value || null;
      dgTableSelectionPushUnique(correlation.candidateOutboundTableIds, field(6));
      if (correlation.outbound.length < 32) correlation.outbound.push({ timestamp: record.timestamp, sequence: record.sequence, socketGeneration: record.socketGeneration, field1: field(1), field5: field5String, field6: field(6), field10: field(10), byteLength: record.byteLength });
      correlation.socketGeneration = record.socketGeneration;
      const selection = state.dgDataProbe.dgTableSelectionEvidence.find(item => item.selectionId === correlation.selectionId);
      if (selection && !selection.socketGeneration) selection.socketGeneration = record.socketGeneration;
    }
  }

  function dgTableSelectionAddInbound({ timestamp = Date.now(), chainId = null, tableId = null, tableName = null, roundIdentity = null, family = null, cardObjects = [] } = {}) {
    for (const correlation of dgTableSelectionWindows(timestamp)) {
      dgTableSelectionPushUnique(correlation.candidateInboundTableIds, tableId);
      dgTableSelectionPushUnique(correlation.candidateRoundIds, roundIdentity);
      if (correlation.inbound.length < 64) correlation.inbound.push({ timestamp, chainId, tableId: tableId || null, tableName: tableName || null, roundIdentity: roundIdentity || null, family: family || null, cards: (Array.isArray(cardObjects) ? cardObjects : []).slice(0, 12).map(card => ({ player: card?.player || null, banker: card?.banker || null })) });
      for (const card of Array.isArray(cardObjects) ? cardObjects.slice(0, 12) : []) {
        if (correlation.cardObjectCount >= 64) break;
        correlation.cardObjectCount += 1;
      }
    }
  }

  function installDgTableSelectionObserver() {
    const key = '__BP_DG_TABLE_SELECTION_CORRELATION_V8__';
    if (window[key] || typeof document === 'undefined') return;
    window[key] = true;
    const handler = event => {
      const snapshot = dgTableSelectionInteractionSnapshot(event, event.type);
      if (!snapshot) return;
      const previous = state.dgDataProbe.dgTableSelectionEvidence.at(-1);
      if (previous && snapshot.timestamp - previous.timestamp < 300 && previous.selectedUiLabel === snapshot.selectedUiLabel && previous.interactionType !== 'click') return;
      dgEvidencePush('dgTableSelectionEvidence', snapshot);
      dgEvidencePush('dgTableSelectionCorrelationEvidence', dgTableSelectionCorrelationRecord(snapshot));
    };
    for (const type of ['click', 'pointerup', 'touchend']) document.addEventListener(type, handler, { capture: true, passive: true });
  }

  let dgCurrentTableUiObserverInstalled = false;
  function installDgCurrentTableUiObserver() {
    if (dgCurrentTableUiObserverInstalled || typeof MutationObserver !== 'function' || typeof document === 'undefined') return;
    const root = document.body || document.documentElement;
    if (!root) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installDgCurrentTableUiObserver, { once: true });
      return;
    }
    dgCurrentTableUiObserverInstalled = true;
    let pending = false;
    const observer = new MutationObserver(records => {
      dgV9ObserverSafe('ui-mutation', () => dgV9ObserveUiMutation(records));
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        observeDgCurrentTableUi({}, 'label-change');
      }, 100);
    });
    try { observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['id', 'class', 'title', 'aria-label', 'data-table', 'data-table-id', 'data-table-name', 'data-room', 'data-room-id'] }); } catch (_) { return; }
    setTimeout(() => { try { observer.disconnect(); } catch (_) {} }, 120000);
  }

  function observeDgOutboundFrame(detail) {
    const binary = detail.binary !== null && detail.binary !== undefined;
    const bytes = binary && Array.isArray(detail.binary) ? detail.binary.slice(0, 100000).map(Number).filter(Number.isFinite).map(value => value & 255) : [];
    const protobuf = binary ? dgOutboundProtobufSummary(bytes.slice(0, 4096)) : null;
    const record = {
      direction: 'outbound',
      sequence: Number(detail.sequence) || null,
      socketGeneration: Number(detail.socketGeneration) || null,
      socketIdentity: detail.socketIdentity || null,
      runtimeInstanceId: DISCOVERY_FRAME_ID,
      timestamp: Number(detail.timestamp) || Date.now(),
      socketOpenElapsedMs: Number(detail.socketOpenedAt) ? Math.max(0, (Number(detail.timestamp) || Date.now()) - Number(detail.socketOpenedAt)) : null,
      binary: Boolean(binary),
      byteLength: binary ? bytes.length : String(detail.raw || '').length,
      firstBytes: bytes.slice(0, 64),
      protobuf,
      stringValues: protobuf?.printableLengthDelimitedStrings || [],
      printableSegments: binary ? dgOutboundPrintableSegments(bytes.slice(0, 512)) : [],
      text: binary ? null : dgOutboundTextSummary(typeof detail.raw === 'string' ? detail.raw : '')
    };
    dgEvidencePush('outboundWebSocketFrameEvidence', record);
    const controlIdentity = dgOutboundControlIdentity(record);
    if (controlIdentity) dgAdoptValidatedOwnership(controlIdentity);
    dgV9ObserverSafe('outbound-frame', () => {
      dgV9ObserveOutbound(record);
      dgEvidencePush('dgProtocolUiEvidence', dgV9UiSnapshot('outbound-send', detail));
    });
    dgTableSelectionAddOutbound(record);
    observeDgCurrentTableUi(detail, 'outbound-send');
  }

  function observeDgTransport(detail, transport = 'WebSocket') {
    if (!detail || typeof detail !== 'object') return;
    const binary = detail.binary !== null && detail.binary !== undefined;
    const raw = typeof detail.raw === 'string' ? detail.raw : '';
    const isDgWebSocket = transport === 'WebSocket' && Boolean(dgInitializationWsUrl(detail.wsUrl));
    if (isDgWebSocket && detail.socketEvent === 'open') {
      dgInitializationCaptureStart(detail);
      dgV9ObserverSafe('websocket-open', () => {
        dgV9ObserveOpen(detail);
        dgEvidencePush('dgProtocolUiEvidence', dgV9UiSnapshot('websocket-open', detail));
      });
      observeDgCurrentTableUi(detail, 'websocket-open');
    }
    if (isDgWebSocket && detail.direction === 'outbound') observeDgOutboundFrame(detail);
    if (isDgWebSocket && detail.direction === 'inbound' && detail.socketEvent !== 'open') observeDgCurrentTableUi(detail, 'label-change');
    if (isDgWebSocket && detail.direction === 'inbound' && Array.isArray(detail.binary)) {
      try { dgObserveNativeRoadCommand(detail.binary, detail); } catch (_) {}
    }
    if (transport === 'WebSocket' && raw && dgInitializationWsUrl(detail.wsUrl)) observeDgInitializationFrame(detail, binary, raw);
    dgProbeRecord({
      transport,
      eventType: binary ? 'binary' : 'text',
      direction: String(detail.direction || 'inbound'),
      method: String(detail.method || '').slice(0, 20),
      status: Number(detail.status) || null,
      url: redactUrl(detail.wsUrl || detail.url || ''),
      byteLength: binary ? (Array.isArray(detail.binary) ? detail.binary.length : null) : raw.length,
      hasRoundMarker: /\d{12}R\d{4}/.test(raw),
      hasPlayerField: /["']player["']\s*:/.test(raw),
      hasBankerField: /["']banker["']\s*:/.test(raw),
      payloadShape: dgProbePayloadShape(raw),
      showPoker: Boolean(detail.showPoker),
      tableSvg: Boolean(detail.tableSvg)
    });
  }

  function dgDiagnosticCheckpoint(eventType, detail = {}) {
    try {
      dgProbeRecord({ transport: 'WebSocket', eventType, direction: 'inbound', ...detail });
    } catch (_) {}
  }

  function dgDiagnosticSlotStatus(value) {
    if (Array.isArray(value)) {
      return value.slice(0, 3).map(card => {
        if (card === null || card === undefined) return 'missing';
        if (Number(card) === 0) return 'zero';
        return Number.isInteger(Number(card)) && Number(card) >= 1 && Number(card) <= 52 ? 'valid' : 'invalid';
      });
    }
    if (typeof value !== 'string') return ['missing', 'missing', 'missing'];
    const parts = value.split('-');
    return [0, 1, 2].map(index => {
      const part = parts[index];
      if (part === undefined || part === '') return 'missing';
      if (part === '0') return 'zero';
      const card = Number(part);
      return Number.isInteger(card) && card >= 1 && card <= 52 ? 'valid' : 'invalid';
    });
  }

  function observeDgDecoded(merged, decoded, chainId = null) {
    if (!merged || !decoded) return;
    dgHistoricalAssociationObserveLiveAnchor(merged, chainId);
    const roundIdentity = String(merged.roundIdentity || '');
    const alreadyObserved = state.dgDataProbe.records.some(item => item.roundIdentity === roundIdentity && item.eventType === 'existing-DG-decoder-result');
    dgProbeRecord({
      transport: 'WebSocket',
      eventType: 'existing-DG-decoder-result',
      direction: 'inbound',
      tableId: normalizeTableId(merged.tableId),
      tableName: merged.tableName || null,
      roundIdentity,
      shoeIdentity: String(merged.shoeIdentity || ''),
      roundSequence: Number(merged.roundIndex) || null,
      player: merged.player.slice(),
      banker: merged.banker.slice(),
      resultOrder: merged.result.slice(),
      outcome: merged.complete ? getOutcome(merged.result) : null,
      playerRanks: merged.player.map(value => value ? rank(value) : null),
      bankerRanks: merged.banker.map(value => value ? rank(value) : null),
      suitStructure: 'suit is not present in the existing DG decoder output',
      roundEvent: alreadyObserved ? 'round-update' : 'new-round-candidate',
      resultEvent: merged.complete ? 'round-result-complete' : null,
      complete: Boolean(merged.complete),
      changed: Boolean(merged.changed),
      playerField: 'player',
      bankerField: 'banker',
      tieField: 'derived-from-player-banker',
      cardStructure: 'numeric card id; rank/suit not supplied by existing DG decoder',
      rawFieldKeys: dgProbeKeys(decoded.rawJson)
    });
    if (merged.complete && state.dgDataProbe.initialization.active) {
      state.dgDataProbe.initialization.completeObserved = true;
      dgInitializationCaptureStop('first-live-round-complete');
    }
  }

  function dgDataProbeText() {
    const capture = state.dgDataProbe.initialization;
    const association = state.modelEstimate.roadHistoryAssociation || {};
    const recentOutcomeSource = ['VERIFIED_LIVE_TO_ROAD_HEAD_INSERT', 'DIRECT_NATIVE_ROAD_SNAPSHOT'].includes(association.status) && Array.isArray(association.recentOutcomes) && association.recentOutcomes.length === 5
      ? association.status
      : state.modelEstimate.liveOutcomeEvents.some(event => event && (event.winner === 'PLAYER' || event.winner === 'BANKER'))
        ? 'LIVE_ONLY_FALLBACK'
        : association.status || 'UNVERIFIED';
    return JSON.stringify({ exportedAt: new Date().toISOString(), version: 'dg-data-probe-v9.3-storage-lifecycle-marker', note: 'Observer-only. Bounded historical card ancestry, repeated-block structure, live-anchor comparison, prior protocol evidence, and no raw payloads, decoded text, credentials, requests, or WebSocket creation.', frameId: DISCOVERY_FRAME_ID, isTopWindow, ownership: { tableId: normalizeTableId(state.dg.ownership.tableId), source: state.dg.ownership.source || null, socketGeneration: state.dg.ownership.socketGeneration || null, socketIdentity: state.dg.ownership.socketIdentity || null, socketKey: state.dg.ownership.socketKey || null, runtimeInstanceId: state.dg.ownership.runtimeInstanceId || null, sequence: state.dg.ownership.sequence || null, establishedAt: state.dg.ownership.establishedAt || null, controlField1: state.dg.ownership.controlField1 || null, controlField10: state.dg.ownership.controlField10 || null }, lifecycle: { runtimeInstanceId: state.dg.lifecycle.runtimeInstanceId || DISCOVERY_FRAME_ID, activeSocketKey: state.dg.lifecycle.activeSocketKey || null, activeSocketIdentity: state.dg.lifecycle.activeSocketIdentity || null, activeSocketGeneration: state.dg.lifecycle.activeSocketGeneration || null, adoptionCount: state.dg.lifecycle.adoptionCount || 0 }, isTopWindow, initializationObjectAssociationSummary: state.dgDataProbe.initializationObjectAssociationSummary, historicalAssociation: { verifiedLiveTableId: normalizeTableId(state.dg.ownership.tableId), verifiedLiveShoe: state.dg.shoeIdentity || null, verifiedLiveAnchors: state.dgDataProbe.historicalAssociationEvidence.anchors.slice(), historicalCardObjects: state.dgDataProbe.historicalAssociationEvidence.cardObjects.slice(), repeatedBlocks: state.dgDataProbe.historicalAssociationEvidence.blocks.slice(), active: Boolean(state.dgDataProbe.historicalAssociationEvidence.active), frozen: Boolean(state.dgDataProbe.historicalAssociationEvidence.frozen), freezeReason: state.dgDataProbe.historicalAssociationEvidence.freezeReason || null }, initialization: { active: Boolean(capture.active), startedAt: capture.startedAt || null, endsAt: capture.endsAt || null, websocketUrl: capture.websocketUrl || '', frameCount: capture.frameCount || 0, openCount: capture.openCount || 0, processSequence: capture.processSequence || 0, completeObserved: Boolean(capture.completeObserved), stopReason: capture.stopReason || null, firstDispatch: capture.firstDispatch || null }, evidence: { initializationObjectAssociationEvidence: state.dgDataProbe.initializationObjectAssociationEvidence.slice(), nativeRecordRequestEvidence: state.nativeRecordRequestEvidence.slice(), backendIdentityAssociationEvidence: state.dgDataProbe.backendIdentityAssociationEvidence.slice(), historicalHydrationTrace: state.historicalHydrationTrace.slice(-64), dgPersistenceEvidence: state.dgDataProbe.dgPersistenceEvidence.slice(-64), dgCanonicalOwnerEvidence: state.dgDataProbe.dgCanonicalOwnerEvidence.slice(-64), dgStorageMarkerEvidence: state.dgDataProbe.dgStorageMarkerEvidence.slice(-8), trustedRoomIdentityEvidence: state.dgDataProbe.trustedRoomIdentityEvidence.slice(), recordOutboundSourceEvidence: state.dgDataProbe.recordOutboundSourceEvidence.slice(), dgNativeRoadCommandEvidence: state.dgDataProbe.dgNativeRoadCommandEvidence.slice(), dgRoadStatEvidence: state.dgDataProbe.dgRoadStatEvidence.slice(), dgRoadResultEvidence: state.dgDataProbe.dgRoadResultEvidence.slice(), dgRoadObserverDiagnostics: { ...state.dgDataProbe.dgRoadObserverDiagnostics, reasons: state.dgDataProbe.dgRoadObserverDiagnostics.reasons.slice(-16) }, roomAssociationDiscovery: { jsonMetadata: state.dgDataProbe.roomAssociationDiscovery.jsonMetadata.slice(), dgBinaryMetadata: state.dgDataProbe.roomAssociationDiscovery.dgBinaryMetadata.slice() }, dispatchEvidence: state.dgDataProbe.dispatchEvidence.slice(), completeCandidates: state.dgDataProbe.completeCandidates.slice(), initializationCompleteCandidates: state.dgDataProbe.initializationCompleteCandidates.slice(), modelEstimate: { tableId: state.modelEstimate.tableId, shoeIdentity: state.modelEstimate.shoeIdentity, candidateRoundCount: state.modelEstimate.candidateRoundCount, initialCount: state.modelEstimate.initialCount, baselineRoundCount: state.modelEstimate.baselineRoundCount, baselineValue: state.modelEstimate.baselineValue, liveDelta: state.modelEstimate.liveDelta, estimatedCount: dgModelEstimateValue(), initialized: Boolean(state.modelEstimate.initialized), status: state.modelEstimate.status, countedLiveRounds: state.modelEstimate.countedRoundKeys.size, roadEntries: state.modelEstimate.roadEntries.slice(-64), liveDeltas: state.modelEstimate.liveDeltas.slice(-64), liveOutcomeEvents: state.modelEstimate.liveOutcomeEvents.slice(-64), roadHistoryAssociation: { status: association.status || 'UNVERIFIED', failureReason: association.failureReason || null, tableId: association.tableId || null, shoeIdentity: association.shoeIdentity || null, liveRoundIdentity: association.liveRoundIdentity || null, baselineReceivedOrder: association.baselineReceivedOrder || null, verifiedSnapshotReceivedOrder: association.verifiedSnapshotReceivedOrder || null, liveInclusionEvidence: association.liveInclusionEvidence || (association.status === 'VERIFIED_LIVE_TO_ROAD_HEAD_INSERT' ? 'ALREADY_INCLUDED' : 'UNKNOWN'), recentOutcomes: Array.isArray(association.recentOutcomes) ? association.recentOutcomes.slice() : [] }, recentOutcomeSource, preEntryHistoryReliable: ['VERIFIED_LIVE_TO_ROAD_HEAD_INSERT', 'DIRECT_NATIVE_ROAD_SNAPSHOT'].includes(recentOutcomeSource), recentOutcomes: dgModelEstimateRecentOutcomes() }, roundEvolution: state.dgDataProbe.roundEvolution.slice(), objectSelectionEvidence: state.dgDataProbe.objectSelectionEvidence.slice(), largeFrameStructures: state.dgDataProbe.largeFrameStructures.slice(), binaryFramingEvidence: state.dgDataProbe.binaryFramingEvidence.slice(), embeddedObjectEvidence: state.dgDataProbe.embeddedObjectEvidence.slice(), selectedObjectEvidence: state.dgDataProbe.selectedObjectEvidence.slice(), cardProgressionEvidence: state.dgDataProbe.cardProgressionEvidence.slice(), sharedStateCorrelation: state.dgDataProbe.sharedStateCorrelation.slice(), outboundWebSocketFrameEvidence: state.dgDataProbe.outboundWebSocketFrameEvidence.slice(), dgCurrentTableUiEvidence: state.dgDataProbe.dgCurrentTableUiEvidence.slice(), dgTableSelectionEvidence: state.dgDataProbe.dgTableSelectionEvidence.slice(), dgTableSelectionCorrelationEvidence: state.dgDataProbe.dgTableSelectionCorrelationEvidence.slice(), dgProtocolTransitionEvidence: state.dgDataProbe.dgProtocolTransitionEvidence.slice(), dgCardStreamCorrelationEvidence: state.dgDataProbe.dgCardStreamCorrelationEvidence.slice(), dgInboundCardParentEnvelopeEvidence: state.dgDataProbe.dgInboundCardParentEnvelopeEvidence.slice(), dgInboundCardParentEnvelopeFirstSeenEvidence: state.dgDataProbe.dgInboundCardParentEnvelopeFirstSeenEvidence.slice(), dgProtocolUiEvidence: state.dgDataProbe.dgProtocolUiEvidence.slice() }, records: state.dgDataProbe.records.slice(-300) }, null, 2);
  }

  function showDgDataDebugOverlay() {
    const existing = document.getElementById('bp-dg-data-debug-overlay');
    if (existing) { existing.remove(); return; }
    const overlay = document.createElement('div');
    overlay.id = 'bp-dg-data-debug-overlay';
    overlay.style.cssText = 'position:fixed;inset:4vh 4vw;z-index:2147483647;background:#07131d;color:#d9f3ff;border:2px solid #2f9ac0;border-radius:10px;padding:10px;box-shadow:0 8px 30px #000c;display:flex;flex-direction:column;gap:8px;font:12px -apple-system,BlinkMacSystemFont,sans-serif';
    const title = document.createElement('div');
    title.textContent = 'DG DATA DEBUG';
    title.style.cssText = 'font-weight:800;font-size:16px';
    const textarea = document.createElement('textarea');
    textarea.readOnly = true;
    textarea.value = dgDataProbeText();
    textarea.style.cssText = 'width:100%;height:65vh;box-sizing:border-box;background:#02080d;color:#d9f3ff;border:1px solid #456278;border-radius:6px;padding:8px;resize:none;overflow:auto;font:11px ui-monospace,SFMono-Regular,monospace';
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display:flex;gap:8px';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = '複製 DG DATA';
    copy.style.cssText = 'flex:1;padding:8px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800';
    copy.addEventListener('click', async () => {
      const text = dgDataProbeText();
      let copied = false;
      try { await navigator.clipboard?.writeText?.(text); copied = true; } catch (_) {}
      if (!copied) { try { textarea.focus(); textarea.select(); copied = Boolean(document.execCommand('copy')); } catch (_) {} }
      copy.textContent = copied ? '已複製 DG DATA' : '複製失敗';
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '關閉';
    close.style.cssText = 'padding:8px 14px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800';
    close.addEventListener('click', () => overlay.remove());
    buttons.append(copy, close);
    overlay.append(title, textarea, buttons);
    (document.documentElement || document.body).appendChild(overlay);
  }

  function addDgDataDebugButton(buttonGroup) {
    if (!buttonGroup || buttonGroup.querySelector('#bp-dg-data-debug')) return;
    const button = document.createElement('button');
    button.id = 'bp-dg-data-debug';
    button.type = 'button';
    button.textContent = 'DG DATA DEBUG';
    button.style.cssText = 'width:100%;margin-top:6px;padding:7px;border:1px solid #456278;border-radius:7px;background:#172b3b;color:#cfe7f5;font-weight:800;cursor:pointer';
    button.addEventListener('click', showDgDataDebugOverlay);
    buttonGroup.appendChild(button);
  }

  let dgDataDebugFloatingTimer = null;
  function installStandaloneDgDataDebugButton() {
    if (!isTopWindow || typeof document === 'undefined') return;

    const ensureButton = () => {
      if (!document.body) return false;
      const existing = document.getElementById('bp-dg-data-debug-floating');
      if (existing && typeof document.body.contains === 'function' && document.body.contains(existing)) return true;

      const button = document.createElement('button');
      button.id = 'bp-dg-data-debug-floating';
      button.type = 'button';
      button.textContent = 'DG DATA DEBUG';
      if (typeof button.setAttribute === 'function') button.setAttribute('aria-label', 'DG DATA DEBUG');
      button.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:2147483646;padding:9px 12px;border:2px solid #fff;border-radius:8px;background:#7b1fa2;color:#fff;font:700 13px -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 3px 12px #0009;cursor:pointer';
      button.addEventListener('click', showDgDataDebugOverlay);
      document.body.appendChild(button);
      return true;
    };

    if (!ensureButton()) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installStandaloneDgDataDebugButton, { once: true });
      }
      return;
    }

    if (dgDataDebugFloatingTimer !== null) return;
    let checksRemaining = 10;
    dgDataDebugFloatingTimer = setInterval(() => {
      if (checksRemaining <= 0) {
        clearInterval(dgDataDebugFloatingTimer);
        dgDataDebugFloatingTimer = null;
        return;
      }
      checksRemaining -= 1;
      ensureButton();
    }, 1000);
  }

  function firstValue(object, keys) {
    if (!object || typeof object !== 'object') return null;
    for (const key of keys) {
      if (object[key] !== undefined && object[key] !== null && object[key] !== '') return object[key];
    }
    return null;
  }

  const EXACT_ROOM_JOIN_ACTION = /^\/api\/v1\/gametype\/[^/]+\/game\/[^/]+\/room\/[^/]+\/join$/i;
  function bootstrapFromExactRoomJoin(record) {
    if (!record || record.direction !== 'outbound') return false;
    const parsed = record.parsed;
    const action = parsed?.action;
    const actionName = actionNameOf(parsed);
    if (!EXACT_ROOM_JOIN_ACTION.test(actionName)) return false;
    const data = action && typeof action === 'object' && action.data && typeof action.data === 'object' ? action.data : null;
    const joinTableId = normalizeTableId(data?.table_id ?? data?.tableId);
    const joinRoomId = data?.room_id ?? data?.roomId;
    if (!joinTableId || joinRoomId === null || joinRoomId === undefined || !String(joinRoomId).trim()) return false;
    dgTrustedRoomIdentityObserve({
      source: 'exact-room-join',
      tableId: joinTableId,
      roomId: joinRoomId,
      matchedVerifiedOwnership: dgOwnsIdentity(joinTableId),
      exactTableListRowPresent: false,
      exactRowRoomIdPresent: true,
      registryRoomIdPresent: Boolean(state.tableIdentityRegistry.get(joinTableId)?.roomId),
      recordProbeContextRoomIdPresent: normalizeTableId(state.recordProbeContext?.activeTableId) === joinTableId && Boolean(state.recordProbeContext?.roomId),
      finalReason: 'exact-room-join-observed'
    });
    const before = normalizeTableId(state.activeTableId);
    mergeTrustedTableIdentity({ table_id: joinTableId, room_id: joinRoomId });
    if (before !== joinTableId) switchActiveTable(joinTableId, 'exact-room-join');
    state.tableId = joinTableId;
    const identity = state.tableIdentityRegistry.get(joinTableId);
    publishRecordProbeContext({ activeTableId: joinTableId, roomId: String(joinRoomId).trim(), shoe: identity?.shoe ?? state.shoe ?? null, round: Number(identity?.round ?? state.lastRound) || 0, frameId: DISCOVERY_FRAME_ID, source: 'exact-room-join' });
    if (state.roomEntryBootstrap.active) {
      state.roomEntryBootstrap.joinTableId = joinTableId;
      state.roomEntryBootstrap.joinRoomId = String(joinRoomId).trim();
      state.roomEntryBootstrap.activeTableIdBefore = before;
      state.roomEntryBootstrap.activeTableIdAfter = joinTableId;
      state.roomEntryBootstrap.bootstrapSource = 'exact-room-join';
      state.roomEntryBootstrap.evidence.push({ type: 'exact-room-join-bootstrap', timestamp: Date.now(), joinTableId, joinRoomId: String(joinRoomId).trim(), activeTableIdBefore: before, activeTableIdAfter: joinTableId, bootstrapSource: 'exact-room-join' });
    }
    render();
    return true;
  }
  function recordPacket(item) {
    if (!item || !item.direction) return;
    let parsed = item.parsed;
    if (!parsed && typeof item.raw === 'string') {
      try { parsed = JSON.parse(item.raw); } catch (_) {}
    }
    const action = firstValue(parsed, ['action']);
    const record = {
      timestamp: item.timestamp || Date.now(),
      wsUrl: String(item.wsUrl || ''),
      direction: item.direction,
      raw: String(item.raw || ''),
      parsed: parsed || null,
      action,
      actionName: typeof action === 'string'
        ? action
        : firstValue(action, ['name']),
      actionPath: firstValue(action, ['path']),
      table_id: findDeep(parsed, ['table_id']),
      tableId: findDeep(parsed, ['tableid']),
      shoe: findDeep(parsed, ['shoe', 'shoeid']),
      round: findDeep(parsed, ['round', 'roundnumber']),
      game_state: findDeep(parsed, ['game_state', 'gamestate']),
      game_data: findDeep(parsed, ['game_data', 'gamedata']),
      result: findDeep(parsed, ['result']),
      room_id: findDeep(parsed, ['room_id'])
    };
    dgObserveJsonRoomAssociation(record);
    bootstrapFromExactRoomJoin(record);
    captureTableListRows(record);
    captureHistoryTransport({
      ...record,
      transport: 'websocket'
    });
    state.packetCapture.push(record);
    if (state.packetCapture.length > 1000) state.packetCapture.splice(0, state.packetCapture.length - 1000);
    if (record.direction === 'outbound') {
      state.outboundCapture.push(record);
      if (state.outboundCapture.length > 500) state.outboundCapture.splice(0, state.outboundCapture.length - 500);
    }
    render();
  }

  function truncateExportText(value, maxLength = 12000) {
    const text = String(value ?? '');
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}\n[TRUNCATED ${text.length - maxLength} CHARS]`;
  }

  function compactExportParsed(value, maxLength = 24000) {
    const redacted = redactObject(value);
    if (!redacted || typeof redacted !== 'object') {
      return redacted;
    }

    let serialized = '';
    try {
      serialized = JSON.stringify(redacted);
    } catch (_) {
      return '[UNSERIALIZABLE]';
    }

    if (serialized.length <= maxLength) {
      return redacted;
    }

    const compact = {
      truncated: true,
      originalLength: serialized.length,
      action: redactObject(firstValue(redacted, ['action'])),
      body: redactObject(firstValue(redacted, ['body'])),
      data: redactObject(firstValue(redacted, ['data'])),
      table_id: findDeep(redacted, ['table_id']),
      tableId: findDeep(redacted, ['tableid']),
      room_id: findDeep(redacted, ['room_id']),
      shoe: findDeep(redacted, ['shoe', 'shoeid']),
      round: findDeep(redacted, ['round', 'roundnumber'])
    };

    const compactText = JSON.stringify(compact);
    if (compactText.length <= maxLength) {
      return compact;
    }

    return {
      ...compact,
      body: truncateExportText(JSON.stringify(compact.body), 8000),
      data: truncateExportText(JSON.stringify(compact.data), 8000)
    };
  }

  const TABLE_LIST_REQUEST_TYPE =
    'BACCARAT_PULSE_TABLE_LIST_MAPPING_REQUEST_V1';
  const TABLE_LIST_REPORT_TYPE =
    'BACCARAT_PULSE_TABLE_LIST_MAPPING_REPORT_V1';
  const TABLE_LIST_ARRAY_KEY_PATTERN =
    /^(?:tables?|table[_-]?list|room[_-]?tables?|table[_-]?data)$/i;
  const TABLE_LIST_PREFERRED_FIELDS = [
    'table_id',
    'tableId',
    'name',
    'table_name',
    'tableName',
    'title',
    'label',
    'table_no',
    'table_number',
    'desk_no',
    'code',
    'game_type',
    'gameType',
    'room_id'
  ];
  const TABLE_LIST_EXCLUDED_KEY_PATTERN =
    /^(?:game_data|trend|road|roads|history|histories)$/i;
  const SENSITIVE_KEY_PATTERN =
    /token|authorization|cookie|session|password|secret|jwt|member|account|credential/i;

  function boundedPush(list, item, limit) {
    list.push(item);
    if (list.length > limit) {
      list.splice(0, list.length - limit);
    }
  }

  const HISTORY_SENSITIVE_KEY_PATTERN =
    /authorization|cookie|token|access[_-]?token|refresh[_-]?token|session|jwt|bearer|password|passwd|secret|credential|license|licence|member|user(?:name|id)?|account|balance|points?|wallet|credit/i;
  const HISTORY_KEY_PATTERN =
    /table[_-]?id|tableid|table[_-]?name|shoe(?:[_-]?id)?|round(?:number)?|result|history|records?|rounds?|games?|cards?|poker/i;
  const HISTORY_ARRAY_KEY_PATTERN =
    /history|histories|records?|rounds?|games?/i;
  const HISTORY_MAX_RECORDS = 240;

  function historyRedactText(value) {
    return redactText(value)
      .replace(/("?(?:license(?:Code)?|licence(?:Code)?|member(?:Id|Name)?|user(?:Id|Name)?|account(?:Id|Name)?|balance|points?|wallet|credit|credential)s?"?\s*[:=]\s*")([^"']*)(")/gi, '$1[REDACTED]$3')
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED JWT]')
      .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/gi, '$1[REDACTED]');
  }

  function historySafePrimitive(key, value) {
    if (HISTORY_SENSITIVE_KEY_PATTERN.test(String(key || ''))) {
      return '[REDACTED]';
    }
    if (typeof value === 'string') {
      return historyRedactText(
        sanitizeDiscoveryValue(key, value)
      ).slice(0, 500);
    }
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      return value;
    }
    return undefined;
  }

  function historyLooksLikeRoundObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const keys = Object.keys(value);
    const hasRound = keys.some(key => /^(?:round|roundNumber|round_no|roundNo)$/i.test(key));
    const hasCardsOrResult = keys.some(key => /(?:result|cards?|poker|game_data)/i.test(key));
    return hasRound && hasCardsOrResult;
  }

  function historyLooksLikeRoundArray(value, key) {
    if (!Array.isArray(value) || value.length < 2) return false;
    const sample = value.slice(0, 12);
    const roundObjects = sample.filter(historyLooksLikeRoundObject).length;
    return HISTORY_ARRAY_KEY_PATTERN.test(String(key || '')) ||
      roundObjects >= Math.min(2, sample.length);
  }

  function historySanitizeStructure(value, limits, key = '') {
    if (HISTORY_SENSITIVE_KEY_PATTERN.test(String(key || ''))) {
      return '[REDACTED]';
    }
    const primitive = historySafePrimitive(key, value);
    if (primitive !== undefined) return primitive;
    if (!value || typeof value !== 'object') return undefined;
    if (limits.depth > 6 || limits.budget.nodes >= 350) return '[TRUNCATED]';
    if (limits.seen.has(value)) return '[CIRCULAR]';
    limits.seen.add(value);
    limits.budget.nodes += 1;

    if (Array.isArray(value)) {
      return value.slice(0, 30)
        .map((item, index) => historySanitizeStructure(
          item,
          { ...limits, depth: limits.depth + 1, seen: limits.seen },
          `${key}[${index}]`
        ))
        .filter(item => item !== undefined);
    }

    const output = {};
    for (const [childKey, child] of Object.entries(value).slice(0, 100)) {
      if (HISTORY_SENSITIVE_KEY_PATTERN.test(childKey)) {
        output[childKey] = '[REDACTED]';
        continue;
      }
      const safe = historySanitizeStructure(
        child,
        { ...limits, depth: limits.depth + 1, seen: limits.seen },
        childKey
      );
      if (safe !== undefined) output[childKey] = safe;
    }
    return output;
  }

  function historyCandidateNodes(payload) {
    const candidates = [];
    const queue = [{ value: payload, path: 'payload', key: '', depth: 0 }];
    const seen = new WeakSet();
    let inspected = 0;

    while (queue.length && inspected < 450 && candidates.length < 12) {
      const current = queue.shift();
      const value = current.value;
      if (!value || typeof value !== 'object' || seen.has(value)) continue;
      seen.add(value);
      inspected += 1;
      if (current.depth > 7) continue;

      const keyMatch = HISTORY_KEY_PATTERN.test(current.key);
      const multiRoundArray = historyLooksLikeRoundArray(value, current.key);
      const roundObject = historyLooksLikeRoundObject(value);
      if (keyMatch || multiRoundArray || roundObject) {
        candidates.push({
          path: current.path.slice(0, 700),
          reason: multiRoundArray
            ? 'multi-round-array'
            : roundObject
              ? 'round-with-cards-or-result'
              : `history-key:${current.key}`,
          arrayLength: Array.isArray(value) ? value.length : null,
          historyArrayLength: multiRoundArray ? value.length : null,
          structure: historySanitizeStructure(value, {
            depth: 0,
            budget: { nodes: 0 },
            seen: new WeakSet()
          }, current.key)
        });
      }

      if (multiRoundArray || roundObject) {
        continue;
      }

      for (const [childKey, child] of Object.entries(value).slice(0, 150)) {
        if (
          HISTORY_SENSITIVE_KEY_PATTERN.test(childKey) ||
          !child ||
          typeof child !== 'object'
        ) {
          continue;
        }
        if (Array.isArray(child)) {
          queue.push({
            value: child,
            path: `${current.path}.${childKey}`,
            key: childKey,
            depth: current.depth + 1
          });
          for (let index = 0; index < Math.min(child.length, 30); index += 1) {
            const item = child[index];
            if (item && typeof item === 'object') {
              queue.push({
                value: item,
                path: `${current.path}.${childKey}[${index}]`,
                key: childKey,
                depth: current.depth + 2
              });
            }
          }
        } else {
          queue.push({
            value: child,
            path: `${current.path}.${childKey}`,
            key: childKey,
            depth: current.depth + 1
          });
        }
      }
    }
    return candidates;
  }

  function historyActionInfo(payload, fallbackUrl) {
    const action =
      firstValue(payload, ['action', 'event', 'name', 'path']) ??
      findDeep(payload, ['action', 'event']);
    return {
      action: typeof action === 'string'
        ? redactText(action).slice(0, 500)
        : compactExportParsed(action, 2000),
      path: redactUrl(
        firstValue(action, ['path']) ||
        firstValue(payload, ['path', 'url']) ||
        findDeep(payload, ['path', 'url']) ||
        fallbackUrl || ''
      )
    };
  }

  function historyParsePayload(raw) {
    const text = String(raw || '').trim();
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) {}
    try {
      const params = new URLSearchParams(text);
      const entries = Array.from(params.entries());
      if (entries.length) return Object.fromEntries(entries);
    } catch (_) {}
    const firstObject = text.indexOf('{');
    const firstArray = text.indexOf('[');
    const start = firstObject < 0
      ? firstArray
      : firstArray < 0
        ? firstObject
        : Math.min(firstObject, firstArray);
    if (start >= 0) {
      const opening = text[start];
      const end = text.lastIndexOf(opening === '{' ? '}' : ']');
      if (end > start) {
        try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
      }
    }
    return null;
  }

  function captureHistoryTransport(item) {
    if (!item || !item.transport || !item.direction) return;
    let parsed = item.parsed;
    if (!parsed && typeof item.raw === 'string') {
      parsed = historyParsePayload(item.raw);
    }
    const requestPath = redactUrl(item.url || item.wsUrl || '');
    if (!parsed || typeof parsed !== 'object') {
      if (!/history|records?|rounds?|games?|cards?|poker|tables?/i.test(requestPath)) {
        return;
      }
      parsed = { request: { method: item.method || null, path: requestPath } };
    }

    const candidates = historyCandidateNodes(parsed);
    if (
      !candidates.length &&
      /history|records?|rounds?|games?|cards?|poker|tables?/i.test(requestPath)
    ) {
      candidates.push({
        path: 'payload',
        reason: 'history-like-request-path',
        arrayLength: null,
        structure: historySanitizeStructure(parsed, {
          depth: 0,
          budget: { nodes: 0 },
          seen: new WeakSet()
        })
      });
    }
    if (!candidates.length) return;
    const actionInfo = historyActionInfo(parsed, item.url || item.wsUrl);
    const record = {
      timestamp: Number(item.timestamp) || Date.now(),
      transport: String(item.transport).slice(0, 30),
      direction: String(item.direction).slice(0, 30),
      method: item.method ? String(item.method).slice(0, 20) : null,
      status: Number.isFinite(Number(item.status)) ? Number(item.status) : null,
      action: actionInfo.action,
      path: actionInfo.path,
      frameId: DISCOVERY_FRAME_ID,
      isTopWindow,
      activeTableId: normalizeTableId(state.activeTableId),
      detectedTableId: historySafePrimitive(
        'tableId',
        findDeep(parsed, ['table_id', 'tableid'])
      ),
      detectedTableName: historySafePrimitive(
        'tableName',
        findDeep(parsed, ['table_name', 'tablename'])
      ),
      detectedShoe: historySafePrimitive(
        'shoe',
        findDeep(parsed, ['shoe', 'shoe_id', 'shoeid'])
      ),
      detectedRound: historySafePrimitive(
        'round',
        findDeep(parsed, ['round', 'roundnumber'])
      ),
      candidateHistoryArrayLength: candidates.reduce(
        (max, candidate) => Math.max(
          max,
          Number(candidate.historyArrayLength) || 0
        ),
        0
      ),
      candidates
    };
    record.priority =
      record.candidateHistoryArrayLength >= 2 ||
      record.transport === 'fetch' ||
      record.transport === 'xhr' ||
      /history|histories|records?|rounds?|games?/i.test(record.path);
    state.historyCapture.push(record);
    while (state.historyCapture.length > HISTORY_MAX_RECORDS) {
      const removable = state.historyCapture.findIndex(item => !item.priority);
      state.historyCapture.splice(removable >= 0 ? removable : 0, 1);
    }
  }

  function tableListPrimitive(name, value) {
    if (
      SENSITIVE_KEY_PATTERN.test(String(name || '')) ||
      TABLE_LIST_EXCLUDED_KEY_PATTERN.test(String(name || ''))
    ) {
      return undefined;
    }
    if (typeof value === 'string') {
      return sanitizeDiscoveryValue(name, value).slice(0, 300);
    }
    if (
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    return undefined;
  }

  function tableListPrimitiveFields(row) {
    const output = {};
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return output;
    }

    for (const field of TABLE_LIST_PREFERRED_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) continue;
      const value = tableListPrimitive(field, row[field]);
      if (value !== undefined) output[field] = value;
    }

    for (const [key, item] of Object.entries(row).slice(0, 120)) {
      if (Object.prototype.hasOwnProperty.call(output, key)) continue;
      const value = tableListPrimitive(key, item);
      if (value !== undefined) output[key] = value;
    }

    return output;
  }

  function looksLikeTableListRow(row) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return false;
    }
    const keys = Object.keys(row);
    return keys.some(key =>
      TABLE_LIST_PREFERRED_FIELDS.includes(key) ||
      /^(?:table|desk|game|room|code|name|title|label)/i.test(key)
    );
  }

  function findTableListArrays(root, actionLooksLikeTables) {
    const arrays = [];
    const seenObjects = new WeakSet();
    const seenArrays = new WeakSet();
    const queue = [{ value: root, path: 'payload', depth: 0 }];
    let inspected = 0;

    const addArray = (value, path) => {
      if (!Array.isArray(value) || seenArrays.has(value)) return;
      const rows = value.filter(looksLikeTableListRow);
      if (!rows.length) return;
      seenArrays.add(value);
      arrays.push({ path, rows });
    };

    const directRows = root?.msg?.tables?.tables;
    addArray(directRows, 'payload.msg.tables.tables');

    while (
      queue.length &&
      inspected < 400 &&
      arrays.length < 20
    ) {
      const current = queue.shift();
      const value = current.value;
      if (!value || typeof value !== 'object' || seenObjects.has(value)) {
        continue;
      }
      seenObjects.add(value);
      inspected += 1;
      if (current.depth > 6) continue;

      for (const [key, child] of Object.entries(value).slice(0, 150)) {
        if (
          SENSITIVE_KEY_PATTERN.test(key) ||
          TABLE_LIST_EXCLUDED_KEY_PATTERN.test(key)
        ) {
          continue;
        }
        const path = `${current.path}.${key}`;
        if (Array.isArray(child)) {
          if (
            TABLE_LIST_ARRAY_KEY_PATTERN.test(key) ||
            actionLooksLikeTables ||
            child.some(looksLikeTableListRow)
          ) {
            addArray(child, path);
          }
          if (current.depth < 6) {
            for (let index = 0; index < Math.min(child.length, 40); index += 1) {
              const item = child[index];
              if (item && typeof item === 'object') {
                queue.push({
                  value: item,
                  path: `${path}[${index}]`,
                  depth: current.depth + 1
                });
              }
            }
          }
        } else if (child && typeof child === 'object') {
          queue.push({
            value: child,
            path,
            depth: current.depth + 1
          });
        }
      }
    }

    return arrays;
  }

  function captureTableListRows(record) {
    if (
      !record ||
      record.direction !== 'inbound' ||
      !record.parsed ||
      typeof record.parsed !== 'object'
    ) {
      return;
    }

    const actionText = `${record.actionName || ''} ${record.actionPath || ''}`;
    const arrays = findTableListArrays(
      record.parsed,
      /tables/i.test(actionText)
    );

    for (const array of arrays) {
      for (let rowIndex = 0; rowIndex < Math.min(array.rows.length, 30); rowIndex += 1) {
        const primitiveFields = tableListPrimitiveFields(array.rows[rowIndex]);
        if (!Object.keys(primitiveFields).length) continue;
        const row = array.rows[rowIndex];
        const rowTableId = normalizeTableId(row?.table_id ?? row?.tableId);
        const rowRoomId = row?.room_id ?? row?.roomId;
        if (rowTableId && rowRoomId !== null && rowRoomId !== undefined && String(rowRoomId).trim()) {
          dgTrustedRoomIdentityObserve({
            source: 'captureTableListRows',
            tableId: rowTableId,
            roomId: rowRoomId,
            shoe: row?.shoe ?? null,
            round: row?.round ?? null,
            matchedVerifiedOwnership: dgOwnsIdentity(rowTableId),
            exactTableListRowPresent: true,
            exactRowRoomIdPresent: true,
            registryRoomIdPresent: Boolean(state.tableIdentityRegistry.get(rowTableId)?.roomId),
            recordProbeContextRoomIdPresent: normalizeTableId(state.recordProbeContext?.activeTableId) === rowTableId && Boolean(state.recordProbeContext?.roomId),
            finalReason: 'exact-table-list-row-observed'
          });
        }
        boundedPush(state.tableListRows, {
          timestamp: record.timestamp,
          actionName: record.actionName || null,
          actionPath: record.actionPath || null,
          arrayPath: array.path.slice(0, 500),
          rowIndex,
          primitiveFields
        }, 300);
      }
    }
  }

  function collectTableListReport(requestId) {
    return {
      requestId,
      frameId: DISCOVERY_FRAME_ID,
      timestamp: Date.now(),
      rows: state.tableListRows.slice(-300)
    };
  }

  function sendTableListRequestToChildFrames(requestId) {
    for (const frame of Array.from(document.querySelectorAll('iframe'))) {
      try {
        frame.contentWindow?.postMessage(
          { type: TABLE_LIST_REQUEST_TYPE, requestId },
          '*'
        );
      } catch (_) {}
    }
  }

  function sanitizeDiscoveryUrl(value) {
    try {
      const url = new URL(String(value || ''), location.href);
      url.username = '';
      url.password = '';
      for (const key of Array.from(url.searchParams.keys())) {
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          url.searchParams.set(key, '[REDACTED]');
        }
      }
      url.hash = url.hash
        .replace(/((?:token|authorization|cookie|session|password|secret|jwt|member|account|credential)\s*=)[^&]*/gi, '$1[REDACTED]')
        .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/gi, '$1[REDACTED]');
      return url.toString();
    } catch (_) {
      return redactText(value)
        .replace(/([?&#](?:token|authorization|cookie|session|password|secret|jwt|member|account|credential)\s*=)[^&#]*/gi, '$1[REDACTED]');
    }
  }

  function sanitizeDiscoveryValue(name, value) {
    const text = String(value ?? '');
    if (SENSITIVE_KEY_PATTERN.test(name)) {
      return '[REDACTED]';
    }
    if (
      /^(?:src|href|action|formaction)$/i.test(name) ||
      /^(?:https?|wss?):\/\//i.test(text)
    ) {
      return sanitizeDiscoveryUrl(text);
    }
    return redactText(text)
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED JWT]')
      .replace(/([?&](?:token|authorization|cookie|session|password|secret|jwt|member|account|credential)\s*=)[^&#]*/gi, '$1[REDACTED]')
      .slice(0, 500);
  }

  async function copyTableListText(text, button) {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (_) {}

    if (!copied) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      textarea.remove();
    }

    if (!copied) {
      try {
        const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'BaccaratPulse-Record-Probe.json';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        copied = true;
      } catch (_) {}
    }
    if (button) {
      const originalText = button.textContent;
      button.textContent = copied ? 'Record Probe Exported' : 'Export Failed';
      setTimeout(() => {
        if (button.isConnected) {
          button.textContent = originalText || 'Export Record Probe';
        }
      }, 2200);
    }
    return copied;
  }

  function tableListExportText(rows, maxLength = 19999) {
    const data = {
      exportedAt: new Date().toISOString(),
      version: 'table-list-mapping-v1',
      exportLength: 0,
      rows: rows.slice(-30)
    };

    const stringify = () => {
      let text = '';
      for (let attempt = 0; attempt < 6; attempt += 1) {
        text = JSON.stringify(data, null, 2);
        if (data.exportLength === text.length) break;
        data.exportLength = text.length;
      }
      text = JSON.stringify(data, null, 2);
      if (data.exportLength !== text.length) {
        data.exportLength = text.length;
        text = JSON.stringify(data, null, 2);
      }
      return text;
    };

    let text = stringify();
    while (text.length > maxLength && data.rows.length > 1) {
      data.rows.shift();
      text = stringify();
    }

    const latest = data.rows.at(-1);
    if (text.length > maxLength && latest?.primitiveFields) {
      const preferred = new Set(TABLE_LIST_PREFERRED_FIELDS);
      for (const key of Object.keys(latest.primitiveFields).reverse()) {
        if (text.length <= maxLength) break;
        if (preferred.has(key)) continue;
        delete latest.primitiveFields[key];
        text = stringify();
      }
    }

    if (text.length > maxLength && latest?.primitiveFields) {
      for (const key of Object.keys(latest.primitiveFields)) {
        if (typeof latest.primitiveFields[key] === 'string') {
          latest.primitiveFields[key] =
            latest.primitiveFields[key].slice(0, 80);
        }
      }
      text = stringify();
    }

    return text;
  }

  async function exportTableListMapping() {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    state.tableListRequestId = requestId;
    state.tableListReports.clear();

    const localReport = collectTableListReport(requestId);
    state.tableListReports.set(localReport.frameId, localReport);
    sendTableListRequestToChildFrames(requestId);

    await new Promise(resolve => setTimeout(resolve, 500));

    const rows = Array.from(state.tableListReports.values())
      .flatMap(report => Array.isArray(report?.rows) ? report.rows : [])
      .sort((a, b) => Number(a?.timestamp || 0) - Number(b?.timestamp || 0));

    await copyTableListText(
      tableListExportText(rows),
      panel?.querySelector('#bp-export-table-list')
    );
  }

  function compactHandshakeEvent(value) {
    if (!value || !HANDSHAKE_STAGES.has(value.stage)) return null;
    return {
      timestamp: Number(value.timestamp) || null,
      stage: value.stage,
      clickId: value.clickId
        ? String(value.clickId).slice(0, 160)
        : null,
      tableName: normalizeTableName(value.tableName),
      candidateTableIds: Array.isArray(value.candidateTableIds)
        ? value.candidateTableIds
            .map(normalizeTableId)
            .filter(Boolean)
            .slice(0, 30)
        : [],
      activeTableId: normalizeTableId(value.activeTableId),
      frameId: String(value.frameId || '').slice(0, 160),
      isTopWindow: Boolean(value.isTopWindow),
      entryCount: Number.isFinite(Number(value.entryCount))
        ? Number(value.entryCount)
        : null,
      sampleMappings: handshakeSampleMappings(value.sampleMappings)
    };
  }

  function persistedHandshakeEvents() {
    const events = [];
    try {
      for (let index = 0; index < sessionStorage.length; index += 1) {
        const key = sessionStorage.key(index);
        if (!String(key || '').startsWith(HANDSHAKE_STORAGE_PREFIX)) continue;
        let values = [];
        try {
          values = JSON.parse(sessionStorage.getItem(key) || '[]');
        } catch (_) {
          values = [];
        }
        for (const value of Array.isArray(values) ? values : []) {
          const event = compactHandshakeEvent(value);
          if (event) events.push(event);
        }
      }
    } catch (_) {}
    return events;
  }

  function collectHandshakeReport(requestId) {
    return {
      requestId,
      frameId: DISCOVERY_FRAME_ID,
      events: state.handshakeEvents
        .slice(-100)
        .map(compactHandshakeEvent)
        .filter(Boolean)
    };
  }

  function sendHandshakeRequestToChildFrames(requestId) {
    for (const frame of Array.from(document.querySelectorAll('iframe'))) {
      try {
        frame.contentWindow?.postMessage({
          type: HANDSHAKE_REQUEST_MESSAGE,
          requestId
        }, '*');
      } catch (_) {}
    }
  }

  function handshakeExportText(events, maxLength = 14999) {
    const seen = new Set();
    const compact = events
      .map(compactHandshakeEvent)
      .filter(Boolean)
      .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0))
      .filter(event => {
        const key = JSON.stringify(event);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(-100);

    const data = {
      exportedAt: new Date().toISOString(),
      version: 'active-table-handshake-v1',
      exportLength: 0,
      events: compact
    };

    const stringify = () => {
      let text = '';
      for (let attempt = 0; attempt < 6; attempt += 1) {
        text = JSON.stringify(data, null, 2);
        if (data.exportLength === text.length) break;
        data.exportLength = text.length;
      }
      text = JSON.stringify(data, null, 2);
      if (data.exportLength !== text.length) {
        data.exportLength = text.length;
        text = JSON.stringify(data, null, 2);
      }
      return text;
    };

    let text = stringify();
    while (text.length > maxLength && data.events.length > 1) {
      data.events.shift();
      text = stringify();
    }
    return text;
  }

  async function exportActiveTableHandshake() {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    state.handshakeRequestId = requestId;
    state.handshakeReports.clear();

    const localReport = collectHandshakeReport(requestId);
    state.handshakeReports.set(localReport.frameId, localReport);
    sendHandshakeRequestToChildFrames(requestId);
    await new Promise(resolve => setTimeout(resolve, 500));

    const events = [
      ...persistedHandshakeEvents(),
      ...Array.from(state.handshakeReports.values())
        .flatMap(report => Array.isArray(report?.events)
          ? report.events
          : [])
    ];

    await copyTableListText(
      handshakeExportText(events),
      panel?.querySelector('#bp-export-handshake')
    );
  }

  function compactHistoryRecord(value) {
    if (!value || typeof value !== 'object') return null;
    const candidates = (Array.isArray(value.candidates) ? value.candidates : [])
      .slice(0, 12)
      .map(candidate => {
        let structure = historySanitizeStructure(candidate?.structure, {
          depth: 0,
          budget: { nodes: 0 },
          seen: new WeakSet()
        }, 'structure');
        try {
          const serialized = JSON.stringify(structure);
          if (serialized.length > 14000) {
            structure = truncateExportText(serialized, 14000);
          }
        } catch (_) {
          structure = '[UNSERIALIZABLE]';
        }
        return {
          path: sanitizeDiscoveryValue('path', candidate?.path || '').slice(0, 700),
          reason: String(candidate?.reason || '').slice(0, 120),
          arrayLength: Number.isFinite(Number(candidate?.arrayLength))
            ? Number(candidate.arrayLength)
            : null,
          structure
        };
      });

    return {
      timestamp: Number(value.timestamp) || null,
      transport: String(value.transport || '').slice(0, 30),
      direction: String(value.direction || '').slice(0, 30),
      method: value.method ? String(value.method).slice(0, 20) : null,
      status: Number.isFinite(Number(value.status)) ? Number(value.status) : null,
      action: historySanitizeStructure(value.action, {
        depth: 0,
        budget: { nodes: 0 },
        seen: new WeakSet()
      }, 'action'),
      path: sanitizeDiscoveryUrl(value.path || ''),
      frameId: String(value.frameId || '').slice(0, 160),
      isTopWindow: Boolean(value.isTopWindow),
      activeTableId: normalizeTableId(value.activeTableId),
      detectedTableId: sanitizeDiscoveryValue('tableId', value.detectedTableId).slice(0, 160),
      detectedTableName: sanitizeDiscoveryValue('tableName', value.detectedTableName).slice(0, 160),
      detectedShoe: sanitizeDiscoveryValue('shoe', value.detectedShoe).slice(0, 160),
      detectedRound: sanitizeDiscoveryValue('round', value.detectedRound).slice(0, 160),
      candidateHistoryArrayLength:
        Number(value.candidateHistoryArrayLength) || 0,
      priority: Boolean(value.priority),
      candidates
    };
  }

  function collectHistoryReport(requestId) {
    const selected = [
      ...state.historyCapture.filter(item => item.priority).slice(-60),
      ...state.historyCapture.slice(-80)
    ].filter((item, index, list) => list.indexOf(item) === index)
      .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
    return {
      requestId,
      frameId: DISCOVERY_FRAME_ID,
      records: selected
        .map(compactHistoryRecord)
        .filter(Boolean)
    };
  }

  function sendHistoryRequestToChildFrames(requestId) {
    for (const frame of Array.from(document.querySelectorAll('iframe'))) {
      try {
        frame.contentWindow?.postMessage({
          type: HISTORY_CAPTURE_REQUEST_MESSAGE,
          requestId
        }, '*');
      } catch (_) {}
    }
  }

  function historyExportText(records, maxLength = 119999) {
    const normalized = records
      .map(compactHistoryRecord)
      .filter(Boolean)
      .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
    const compact = [
      ...normalized.filter(record => record.priority).slice(-60),
      ...normalized.slice(-80)
    ].filter((record, index, list) => list.indexOf(record) === index)
      .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
    const data = {
      exportedAt: new Date().toISOString(),
      version: 'history-capture-v1',
      note: 'Observation only. Records were not applied to baccarat state.',
      exportLength: 0,
      records: compact
    };

    const stringify = () => {
      let text = '';
      for (let attempt = 0; attempt < 6; attempt += 1) {
        text = JSON.stringify(data, null, 2);
        if (data.exportLength === text.length) break;
        data.exportLength = text.length;
      }
      return JSON.stringify(data, null, 2);
    };

    let text = stringify();
    while (text.length > maxLength && data.records.length > 1) {
      const removable = data.records.findIndex(record => !record.priority);
      data.records.splice(removable >= 0 ? removable : 0, 1);
      text = stringify();
    }
    if (text.length > maxLength && data.records[0]) {
      data.records[0].candidates = data.records[0].candidates.slice(0, 1);
      if (data.records[0].candidates[0]) {
        data.records[0].candidates[0].structure = truncateExportText(
          JSON.stringify(data.records[0].candidates[0].structure),
          60000
        );
      }
      text = stringify();
    }
    return text;
  }

  function mergeTrustedTableIdentity(value) {
    if (!value || typeof value !== 'object') return null;
    const tableId = normalizeTableId(value.table_id ?? value.tableId);
    const roomId = value.room_id ?? value.roomId;
    if (tableId) {
      dgTrustedRoomIdentityObserve({
        source: 'mergeTrustedTableIdentity',
        tableId,
        roomId,
        shoe: value.shoe ?? value.shoe_id ?? value.shoeId ?? null,
        round: value.round ?? value.round_number ?? value.roundNumber ?? null,
        matchedVerifiedOwnership: dgOwnsIdentity(tableId),
        exactTableListRowPresent: false,
        exactRowRoomIdPresent: roomId !== null && roomId !== undefined && Boolean(String(roomId).trim()),
        registryRoomIdPresent: Boolean(state.tableIdentityRegistry.get(tableId)?.roomId),
        recordProbeContextRoomIdPresent: normalizeTableId(state.recordProbeContext?.activeTableId) === tableId && Boolean(state.recordProbeContext?.roomId),
        finalReason: roomId !== null && roomId !== undefined && String(roomId).trim() ? 'merge-attempt' : 'missing-roomId'
      });
    }
    if (!tableId || roomId === null || roomId === undefined || !String(roomId).trim()) return null;
    const previous = state.tableIdentityRegistry.get(tableId) || {};
    const next = {
      tableId,
      roomId: String(roomId).trim(),
      shoe: value.shoe ?? value.shoe_id ?? value.shoeId ?? previous.shoe ?? null,
      round: value.round ?? value.round_number ?? value.roundNumber ?? previous.round ?? null,
      updatedAt: Date.now()
    };
    state.tableIdentityRegistry.set(tableId, next);
    return next;
  }
  function mergeTrustedTableIdentities(root) {
    if (!root || typeof root !== 'object') return;
    const seen = new WeakSet();
    const queue = [root];
    let inspected = 0;
    while (queue.length && inspected < 800) {
      const value = queue.shift();
      if (!value || typeof value !== 'object' || seen.has(value)) continue;
      seen.add(value);
      inspected += 1;
      mergeTrustedTableIdentity(value);
      for (const child of Object.values(value).slice(0, 160)) if (child && typeof child === 'object') queue.push(child);
    }
  }
  function recordProbeContextCandidateFromPayload(root, activeOverride = null) {
    const active = normalizeTableId(activeOverride || state.activeTableId);
    if (!active || !root || typeof root !== 'object') return null;
    const seen = new WeakSet();
    const queue = [root];
    let inspected = 0;
    while (queue.length && inspected < 500) {
      const value = queue.shift();
      if (!value || typeof value !== 'object' || seen.has(value)) continue;
      seen.add(value);
      inspected += 1;
      const tableId = normalizeTableId(value.table_id ?? value.tableId);
      const roomId = value.room_id ?? value.roomId;
      const shoe = value.shoe ?? value.shoe_id ?? value.shoeId;
      const round = value.round ?? value.round_number ?? value.roundNumber;
      if (
        tableId === active &&
        roomId !== null && roomId !== undefined && String(roomId).trim() &&
        shoe !== null && shoe !== undefined && String(shoe).trim() &&
        Number.isFinite(Number(round)) && Number(round) > 0
      ) {
        return {
          activeTableId: tableId,
          roomId: String(roomId).trim(),
          shoe: shoe,
          round: Number(round),
          frameId: DISCOVERY_FRAME_ID,
          source: 'trusted-active-table-packet'
        };
      }
      for (const child of Object.values(value).slice(0, 160)) {
        if (child && typeof child === 'object') queue.push(child);
      }
    }
    return null;
  }
  function recordProbeContextFromLocalState(activeOverride = null) {
    const active = normalizeTableId(activeOverride || state.activeTableId);
    if (!active) return null;
    const registry = state.tableIdentityRegistry.get(active);
    const shoe = state.shoe ?? registry?.shoe ?? null;
    const round = Number(state.lastRound ?? registry?.round);
    if (registry?.roomId && shoe !== null && shoe !== undefined && Number.isFinite(round) && round > 0) {
      return { activeTableId: active, roomId: registry.roomId, shoe, round, frameId: DISCOVERY_FRAME_ID, source: 'trusted-table-identity-registry' };
    }
    for (let index = state.packetCapture.length - 1; index >= 0; index -= 1) {
      const item = state.packetCapture[index];
      const parsed = item?.parsed;
      const found = recordProbeContextCandidateFromPayload(parsed, active);
      if (found) return found;
    }
    return null;
  }
  function historicalHydrationTraceStage(stage, detail = {}) {
    const allowed = new Set(['activeTableId', 'roomIdPresent', 'shoe', 'currentRound', 'requestedRound', 'socketFound', 'socketReadyState', 'recordsCount', 'acceptedCount', 'rejectedCount', 'stateRoundsSizeBefore', 'stateRoundsSizeAfter', 'reason']);
    const safe = {};
    for (const [key, value] of Object.entries(detail || {})) {
      if (!allowed.has(key)) continue;
      if (value === null || value === undefined) safe[key] = null;
      else if (key === 'activeTableId') safe[key] = normalizeTableId(value);
      else if (key === 'roomIdPresent' || key === 'socketFound') safe[key] = Boolean(value);
      else if (key === 'socketReadyState' || key === 'recordsCount' || key === 'acceptedCount' || key === 'rejectedCount' || key === 'stateRoundsSizeBefore' || key === 'stateRoundsSizeAfter' || key === 'shoe' || key === 'currentRound' || key === 'requestedRound') safe[key] = Number.isFinite(Number(value)) ? Number(value) : null;
      else safe[key] = String(value).slice(0, 80);
    }
    const hydrationId = String(detail.hydrationId || state.historicalHydrationId || '');
    if (!hydrationId) return;
    state.historicalHydrationTrace.push({ hydrationId, stage: String(stage || '').slice(0, 80), timestamp: Date.now(), ...safe });
    if (state.historicalHydrationTrace.length > 64) state.historicalHydrationTrace.splice(0, state.historicalHydrationTrace.length - 64);
  }
  function historicalHydrationContextId(context) {
    const active = normalizeTableId(context?.activeTableId);
    const roomId = String(context?.roomId || '').trim();
    const shoe = Number(context?.shoe);
    const key = `${active}|${roomId}|${shoe}`;
    const priorKey = state.historicalHydrationIdKey ? String(state.historicalHydrationIdKey) : '';
    if (!state.historicalHydrationId || (priorKey && priorKey !== key)) {
      state.historicalHydrationSequence += 1;
      state.historicalHydrationId = `hh-${Date.now()}-${state.historicalHydrationSequence}`;
      state.historicalHydrationIdKey = key;
    }
    return state.historicalHydrationId;
  }
  function historicalHydrationTraceContext(context, extra = {}) {
    return { hydrationId: state.historicalHydrationId, activeTableId: normalizeTableId(context?.activeTableId), roomIdPresent: Boolean(String(context?.roomId || '').trim()), shoe: context?.shoe ?? null, currentRound: Number(context?.round) || null, ...extra };
  }
  function publishRecordProbeContext(context) {
    dgTrustedRoomIdentityObserve({
      source: 'publishRecordProbeContext',
      tableId: context?.activeTableId ?? null,
      roomId: context?.roomId ?? null,
      shoe: context?.shoe ?? null,
      round: context?.round ?? null,
      matchedVerifiedOwnership: dgOwnsIdentity(context?.activeTableId),
      registryRoomIdPresent: Boolean(state.tableIdentityRegistry.get(normalizeTableId(context?.activeTableId))?.roomId),
      recordProbeContextRoomIdPresent: Boolean(state.recordProbeContext?.roomId),
      finalReason: context?.activeTableId && context?.roomId ? 'publish-guard-passed' : 'publish-guard-reject'
    });
    if (!context || !context.activeTableId || !context.roomId) return;
    historicalHydrationContextId(context);
    historicalHydrationTraceStage('context-published', historicalHydrationTraceContext(context));
    state.recordProbeContext = context;
    if (isTopWindow) {
      void scheduleHistoricalHydration(context);
    }
    if (!isTopWindow) {
      try {
        window.top.postMessage({ type: RECORD_PROBE_CONTEXT_MESSAGE, context }, '*');
      } catch (_) {}
    }
  }
  function observeRecordProbeContext(raw) {
    const parsed = historyParsePayload(raw);
    mergeTrustedTableIdentities(parsed);
    const context = recordProbeContextCandidateFromPayload(parsed);
    if (context) publishRecordProbeContext(context);
  }
  function recordProbeRoomId() {
    const context = state.recordProbeContext || recordProbeContextFromLocalState();
    return context?.roomId ? String(context.roomId) : null;
  }
  function recordProbeWsUrl() {
    for (let index = state.packetCapture.length - 1; index >= 0; index -= 1) {
      const value = String(state.packetCapture[index]?.wsUrl || '');
      if (/^wss?:\/\//i.test(value)) return value;
    }
    return null;
  }
  function recordProbeLocalSocketState() {
    try {
      const socket = window.__BP_MT_RECORD_PROBE_GAME_SOCKET__;
      return {
        found: Boolean(socket),
        readyState: socket && Number.isFinite(Number(socket.readyState))
          ? Number(socket.readyState)
          : null
      };
    } catch (_) {
      return { found: false, readyState: null };
    }
  }
  function recordProbeResponse(rawOrPayload) {
    let parsed = rawOrPayload;
    if (typeof rawOrPayload === 'string') {
      parsed = historyParsePayload(rawOrPayload);
    }
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.responseResult === 'string'
    ) {
      return {
        actionName: String(parsed.actionName || ''),
        shoe: parsed.responseShoe ?? null,
        round: parsed.responseRound ?? null,
        result: parsed.responseResult,
        name: typeof parsed.responseName === 'string' ? parsed.responseName : null
      };
    }
    const game = parsed?.msg?.game || parsed?.payload?.msg?.game || parsed?.body?.game || null;
    if (!game || typeof game !== 'object' || typeof game.result !== 'string') return null;
    return {
      actionName: actionNameOf(parsed),
      shoe: game.shoe ?? null,
      round: game.round ?? null,
      result: game.result,
      name: typeof game.name === 'string' ? game.name : null
    };
  }
  function exportLiveResultTrace() {
    const data = {
      exportedAt: new Date().toISOString(),
      version: 'live-result-trace-v1',
      note: 'Observation only. Trace does not modify baccarat state.',
      trace: Array.isArray(state.liveResultTrace) ? state.liveResultTrace.slice(-30) : []
    };
    const text = JSON.stringify(data, null, 2);
    try {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BaccaratPulse-Live-Result-Trace.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) {
      try { window.prompt('BaccaratPulse Live Result Trace', text); } catch (_) {}
    }
  }
  function recordProbeExportText(records, context) {
    const data = {
      exportedAt: new Date().toISOString(),
      version: 'record-probe-v1',
      note: 'Observation only. Probe results were not applied to baccarat state.',
      activeTableId: normalizeTableId(context.activeTableId),
      room_id: String(context.roomId || ''),
      currentShoe: context.shoe ?? null,
      currentRound: context.round ?? 0,
      reportsReceived: Number(context.reportsReceived || 0),
      loaderFrames: Array.from(state.recordProbeLoaderFrames.values()).map(frame => redactObject(frame)),
      inboundDuringProbe: Array.isArray(state.recordProbeInboundDuringProbe) ? state.recordProbeInboundDuringProbe.map(item => redactObject(item)).slice(-100) : [],
      childReports: Array.from(state.recordProbeReports.values()).map(report => ({
        frameId: String(report?.frameId || ''),
        isTopWindow: Boolean(report?.isTopWindow),
        stages: Array.isArray(report?.stages) ? report.stages.map(stage => redactObject(stage)) : [],
        socketFound: Boolean(report?.socketFound),
        socketReadyState: report?.socketReadyState ?? null,
        lastException: report?.lastException || null
      })),
      records: records.map(item => ({
        timestamp: item.timestamp,
        activeTableId: normalizeTableId(item.activeTableId),
        room_id: String(item.room_id || ''),
        currentShoe: item.currentShoe,
        currentRound: item.currentRound,
        requestedShoe: item.requestedShoe,
        requestedRound: item.requestedRound,
        requestTableId: String(item.requestTableId || ''),
        requestMethod: 'GET',
        requestActionPath: '/api/v1/gametype/*/game/*/record',
        responseShoe: item.responseShoe,
        responseRound: item.responseRound,
        responseResult: item.responseResult,
        responseName: item.responseName,
        responseMatchesRequest: item.responseMatchesRequest,
        success: item.success,
        failureReason: item.failureReason || null
      }))
    };
    return JSON.stringify(redactObject(data), null, 2);
  }
  async function executeRecordProbe(context, requestedRounds = null) {
    const activeTableId = normalizeTableId(context?.activeTableId);
    const roomId = context?.roomId ? String(context.roomId) : null;
    const shoe = context?.shoe;
    const round = Number(context?.round);
    const records = [];
    historicalHydrationTraceStage('executeRecordProbe-enter', historicalHydrationTraceContext(context, { requestedRound: Array.isArray(requestedRounds) ? Number(requestedRounds[0]) || null : null }));
    state.recordProbeStageContext = { probeId: null, packetRequestId: null, requestedShoe: shoe, requestedRound: null, hydrationId: state.historicalHydrationId };
    state.recordProbeSocketFound = false;
    state.recordProbeSocketReadyState = null;
    state.recordProbeLastException = null;
    state.recordProbeInboundDuringProbe = [];
    recordProbeStage('child-request-received', { activeTableId, room_id: roomId, shoe, round });
    if (!activeTableId || !roomId || shoe === null || shoe === undefined || !Number.isFinite(round) || round <= 0) {
      return [{ timestamp: Date.now(), activeTableId, room_id: roomId || '', currentShoe: shoe ?? null, currentRound: Number.isFinite(round) ? round : 0, requestedShoe: shoe ?? null, requestedRound: null, requestTableId: roomId || '', responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: '缺少可信的 activeTableId、room_id、shoe 或 round' }];
    }
    const requested = (Array.isArray(requestedRounds)
      ? requestedRounds
      : [round - 1, round - 2, round - 3])
      .map(value => Number(value))
      .filter(value => Number.isInteger(value) && value > 0);
    if (!requested.length) return [{ timestamp: Date.now(), activeTableId, room_id: roomId, currentShoe: shoe, currentRound: round, requestedShoe: shoe, requestedRound: null, requestTableId: roomId, responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: '沒有合法的歷史 round 可供 Probe' }];
    await new Promise(resolve => {
      const pending = new Map(requested.map(value => [value, true]));
      let finished = false;
      const probeId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const packetRequestIds = new Map(requested.map(requestedRound => [requestedRound, `${probeId}:${requestedRound}`]));
      let timeout;
      const onPacket = event => {
        const detail = event.detail || {};
        if (event.type === EVENT_NAME && detail.direction && detail.direction !== 'inbound') return;
        const response = recordProbeResponse(
          detail.raw || detail.response || detail.payload || detail
        );
        if (!response) return;
        const responseRound = Number(response.round);
        const responseShoe = Number(response.shoe);
        recordProbeStage('record-response-observed', { probeId, packetRequestId: packetRequestIds.get(responseRound) || null, requestedShoe: shoe, requestedRound: pending.has(responseRound) ? responseRound : null, responseShoe, responseRound, hasResult: Boolean(response.result), actionName: response.actionName });
        if (!pending.has(responseRound)) return;
        const matches = responseShoe === Number(shoe) && responseRound > 0;
        recordProbeStage('record-response-received', { probeId, packetRequestId: packetRequestIds.get(responseRound), requestedShoe: shoe, requestedRound: responseRound, responseShoe, responseRound, matches });
        records.push({ timestamp: Date.now(), activeTableId, room_id: roomId, currentShoe: shoe, currentRound: round, requestedShoe: shoe, requestedRound: responseRound, requestTableId: roomId, responseShoe: Number.isFinite(responseShoe) ? responseShoe : response.shoe, responseRound: Number.isFinite(responseRound) ? responseRound : response.round, responseResult: response.result, responseName: response.name, responseMatchesRequest: matches, success: matches && Boolean(response.result), failureReason: matches ? null : 'response shoe/round mismatch' });
        pending.delete(responseRound);
        if (!pending.size) { clearTimeout(timeout); finish(); }
      };
      const finish = () => { if (finished) return; finished = true; window.removeEventListener(EVENT_NAME, onPacket); window.removeEventListener(RECORD_PROBE_RESPONSE_EVENT, onPacket); resolve(); };
      timeout = setTimeout(() => {
        for (const requestedRound of pending.keys()) {
          state.recordProbeStageContext = { hydrationId: state.historicalHydrationId, requestedShoe: shoe, requestedRound };
          recordProbeStage('response-timeout', { probeId, packetRequestId: packetRequestIds.get(requestedRound), requestedShoe: shoe, requestedRound });
          records.push({ timestamp: Date.now(), activeTableId, room_id: roomId, currentShoe: shoe, currentRound: round, requestedShoe: shoe, requestedRound, requestTableId: roomId, responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: 'response timeout' });
        }
        pending.clear(); finish();
      }, 11500);
      window.addEventListener(EVENT_NAME, onPacket);
      window.addEventListener(RECORD_PROBE_RESPONSE_EVENT, onPacket);
      try {
        for (const requestedRound of requested) {
          state.recordProbeStageContext = { hydrationId: state.historicalHydrationId, requestedShoe: shoe, requestedRound };
          const packetRequestId = packetRequestIds.get(requestedRound);
          recordProbeStage('page-send-event-dispatched', { probeId, packetRequestId, requestedShoe: shoe, requestedRound, eventName: RECORD_PROBE_SEND_EVENT, method: 'GET', hydrationId: state.historicalHydrationId });
          window.dispatchEvent(new CustomEvent(RECORD_PROBE_SEND_EVENT, { detail: { hydrationId: state.historicalHydrationId, probeId, packetRequestId, requestId: packetRequestId, requestedShoe: shoe, requestedRound, packets: [JSON.stringify({ method: 'GET', action: { name: '/api/v1/gametype/*/game/*/record', data: { table_id: String(roomId), shoe: Number(shoe), round: requestedRound } } })] } }));
        }
      } catch (_) {
        for (const requestedRound of pending.keys()) records.push({ timestamp: Date.now(), activeTableId, room_id: roomId, currentShoe: shoe, currentRound: round, requestedShoe: shoe, requestedRound, requestTableId: roomId, responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: 'packet bridge dispatch failed' });
        pending.clear(); clearTimeout(timeout); finish();
      }
    });
    return records;
  }
  function historicalHydrationTraceRecordDecision(record, context) {
    const before = state.rounds.size;
    const accepted = Boolean(record?.success) && String(record.requestTableId || '') === String(context?.roomId || '') && Number(record.responseShoe) === Number(context?.shoe) && Number.isInteger(Number(record.responseRound)) && typeof record.responseResult === 'string';
    if (!accepted) {
      historicalHydrationTraceStage('record-rejected', historicalHydrationTraceContext(context, { requestedRound: record?.requestedRound ?? null, rejectedCount: 1, stateRoundsSizeBefore: before, stateRoundsSizeAfter: before, reason: record?.failureReason || 'record-validation-failed' }));
      return;
    }
    const result = record.responseResult.split(',').map(value => Number(value.trim()));
    if (result.length < 6 || result.some(value => !Number.isFinite(value))) {
      historicalHydrationTraceStage('record-rejected', historicalHydrationTraceContext(context, { requestedRound: record.responseRound, rejectedCount: 1, stateRoundsSizeBefore: before, stateRoundsSizeAfter: before, reason: 'invalid-result-shape' }));
      return;
    }
    const existing = state.rounds.get(String(Number(record.responseRound)));
    const existingCount = Array.isArray(existing?.cards) ? existing.cards.filter(card => Number(card) > 0).length : 0;
    const incomingCount = getCards(result).length;
    if (existing && incomingCount <= existingCount) {
      historicalHydrationTraceStage('record-rejected', historicalHydrationTraceContext(context, { requestedRound: record.responseRound, rejectedCount: 1, stateRoundsSizeBefore: before, stateRoundsSizeAfter: before, reason: 'duplicate-or-not-more-complete' }));
      return;
    }
    historicalHydrationTraceStage('record-accepted', historicalHydrationTraceContext(context, { requestedRound: record.responseRound, acceptedCount: 1, stateRoundsSizeBefore: before, stateRoundsSizeAfter: before + 1 }));
  }
  function applyHistoricalRecords(records, context, generation, key) {
    historicalHydrationTraceStage('applyHistoricalRecords-enter', historicalHydrationTraceContext(context, { recordsCount: Array.isArray(records) ? records.length : 0, stateRoundsSizeBefore: state.rounds.size }));
    if (generation !== state.historicalHydrationGeneration || key !== state.historicalHydrationKey) return false;
    const active = normalizeTableId(context?.activeTableId);
    if (!active || active !== normalizeTableId(state.activeTableId)) return false;
    const stateRoundsSizeBefore = state.rounds.size;
    let applied = false;
    for (const record of Array.isArray(records) ? records : []) {
      historicalHydrationTraceRecordDecision(record, context);
      if (!record?.success || String(record.requestTableId || '') !== String(context.roomId || '') || Number(record.responseShoe) !== Number(context.shoe) || !Number.isInteger(Number(record.responseRound)) || typeof record.responseResult !== 'string') continue;
      const result = record.responseResult.split(',').map(value => Number(value.trim()));
      if (result.length < 6 || result.some(value => !Number.isFinite(value))) continue;
      const roundKey = String(Number(record.responseRound));
      const existing = state.rounds.get(roundKey);
      const existingCount = Array.isArray(existing?.cards) ? existing.cards.filter(card => Number(card) > 0).length : 0;
      const incomingCount = getCards(result).length;
      if (existing && incomingCount <= existingCount) continue;
      state.rounds.set(roundKey, { round: Number(record.responseRound), result, cards: getCards(result), outcome: getOutcome(result) });
      applied = true;
    }
    if (applied && generation === state.historicalHydrationGeneration && key === state.historicalHydrationKey) {
      historicalHydrationTraceStage('recompute-called', historicalHydrationTraceContext(context, { stateRoundsSizeBefore, stateRoundsSizeAfter: state.rounds.size }));
      recompute();
      render();
    }
    return applied;
  }
  async function scheduleHistoricalHydration(context) {
    const active = normalizeTableId(context?.activeTableId);
    const roomId = String(context?.roomId || '').trim();
    const shoe = Number(context?.shoe);
    const round = Number(context?.round);
    if (!isTopWindow) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'not-top-window' })); return; }
    if (!context) return;
    historicalHydrationContextId(context);
    historicalHydrationTraceStage('hydration-schedule-enter', historicalHydrationTraceContext(context));
    if (!active) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'missing-activeTableId' })); return; }
    if (!roomId) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'missing-roomId' })); return; }
    if (!Number.isFinite(shoe)) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'invalid-shoe' })); return; }
    if (!Number.isInteger(round)) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'invalid-round' })); return; }
    if (round <= 1) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'round<=1' })); return; }
    const key = `${active}|${roomId}|${shoe}`;
    if (state.historicalHydrationKey === key) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'duplicate/in-progress' })); return; }
    if (state.historicalHydrationRunning) { historicalHydrationTraceStage('hydration-schedule-skip', historicalHydrationTraceContext(context, { reason: 'duplicate/in-progress' })); return; }
    const generation = state.historicalHydrationGeneration;
    state.historicalHydrationKey = key;
    state.historicalHydrationRunning = true;
    historicalHydrationTraceStage('hydration-start', historicalHydrationTraceContext(context));
    const historicalRounds = [];
    for (let value = round - 1; value > 0; value -= 1) historicalRounds.push(value);
    try {
      for (let index = 0; index < historicalRounds.length; index += 3) {
        if (generation !== state.historicalHydrationGeneration || key !== state.historicalHydrationKey) return;
        const batch = historicalRounds.slice(index, index + 3);
        const records = await executeRecordProbe({ activeTableId: active, roomId, shoe, round }, batch);
        const batchContext = { activeTableId: active, roomId, shoe, round };
        applyHistoricalRecords(records, batchContext, generation, key);
        historicalHydrationTraceStage('hydration-batch-complete', historicalHydrationTraceContext(batchContext, { recordsCount: records.length, acceptedCount: records.filter(record => record?.success).length, rejectedCount: records.filter(record => !record?.success).length, stateRoundsSizeAfter: state.rounds.size }));
      }
    } catch (_) {
      // Historical hydration is best-effort and must never affect live ingestion.
    } finally {
      if (generation === state.historicalHydrationGeneration && key === state.historicalHydrationKey) state.historicalHydrationRunning = false;
      historicalHydrationTraceStage('hydration-finished', historicalHydrationTraceContext(context, { stateRoundsSizeAfter: state.rounds.size }));
    }
  }
  function recordProbeStage(stage, detail = {}) {
    const safe = {};
    for (const [key, value] of Object.entries(detail || {})) {
      if (/token|auth|cookie|session|password|license|member|account|phone|email|balance/i.test(key)) continue;
      if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') safe[key] = String(value).slice(0, 300);
    }
    const stageContext = state.recordProbeStageContext || {};
    const probeId = detail.probeId ?? stageContext.probeId ?? null;
    const packetRequestId = detail.packetRequestId ?? stageContext.packetRequestId ?? null;
    const requestedShoe = detail.requestedShoe ?? stageContext.requestedShoe ?? null;
    const requestedRound = detail.requestedRound ?? stageContext.requestedRound ?? null;
    const hydrationId = detail.hydrationId ?? stageContext.hydrationId ?? state.historicalHydrationId ?? null;
    if (probeId !== null && probeId !== undefined) safe.probeId = String(probeId);
    if (packetRequestId !== null && packetRequestId !== undefined) safe.packetRequestId = String(packetRequestId);
    if (requestedShoe !== null && requestedShoe !== undefined) safe.requestedShoe = Number(requestedShoe);
    if (requestedRound !== null && requestedRound !== undefined) safe.requestedRound = Number(requestedRound);
    if (hydrationId) safe.hydrationId = String(hydrationId).slice(0, 100);
    if (safe.url) safe.url = roomEntrySafeUrl(safe.url);
    const traceStages = new Set(['record-response-observed', 'record-response-matched', 'record-response-relayed', 'response-timeout', 'page-send-event-dispatched', 'probe-request-received', 'game-socket-found', 'record-request-sent', 'record-request-send-failed']);
    if (traceStages.has(stage)) historicalHydrationTraceStage(stage, { hydrationId, activeTableId: state.recordProbeContext?.activeTableId || state.activeTableId, roomIdPresent: Boolean(state.recordProbeContext?.roomId), shoe: requestedShoe, currentRound: state.recordProbeContext?.round ?? null, requestedRound, socketFound: state.recordProbeSocketFound, socketReadyState: state.recordProbeSocketReadyState, reason: detail.reason || null });
    state.recordProbeStages.push({ timestamp: Date.now(), stage, ...safe });
    if (state.recordProbeStages.length > 100) state.recordProbeStages.splice(0, state.recordProbeStages.length - 100);
  }
  function recordProbeDiagnosticText() {
    const active = normalizeTableId(state.activeTableId);
    const registry = active ? state.tableIdentityRegistry.get(active) : null;
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: 'record-probe-diagnostics-v1',
      activeTableId: active || null,
      room_id: registry?.roomId || state.recordProbeContext?.roomId || '',
      shoe: state.shoe ?? registry?.shoe ?? null,
      round: Number(state.lastRound || registry?.round || 0),
      registryActiveTable: registry ? { tableId: registry.tableId, roomId: registry.roomId, shoe: registry.shoe ?? null, round: registry.round ?? null } : null,
      recordProbeRunning: Boolean(state.recordProbeRunning),
      generation: Number(state.recordProbeGeneration || 0),
      deadlineActive: Boolean(state.recordProbeDeadlineTimer),
      socketFound: Boolean(state.recordProbeSocketFound),
      socketReadyState: state.recordProbeSocketReadyState,
      childReports: state.recordProbeReports?.size || 0,
      lastException: state.recordProbeLastException,
      stages: state.recordProbeStages.slice(-100)
    }, null, 2);
  }
  function exportRecordProbeDiagnostics() {
    const text = recordProbeDiagnosticText();
    recordProbeStage('diagnostics-export-started');
    try {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BaccaratPulse-Record-Probe-Diagnostics.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      recordProbeStage('diagnostics-export-completed', { mechanism: 'download' });
    } catch (error) {
      recordProbeStage('exception', { message: String(error?.message || error) });
    }
    try {
      const promise = navigator.clipboard?.writeText?.(text);
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_) {}
  }
  function exportRecordProbeJsonNonBlocking(text, button) {
    recordProbeStage('export-started');
    let downloaded = false;
    try {
      const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BaccaratPulse-Record-Probe.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      downloaded = true;
    } catch (error) {
      state.recordProbeLastException = String(error?.message || error);
      recordProbeStage('exception', { message: state.recordProbeLastException });
    }
    if (button) button.textContent = downloaded ? 'Record Probe Exported' : 'Export Failed';
    try {
      const promise = navigator.clipboard?.writeText?.(text);
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_) {}
    recordProbeStage(downloaded ? 'export-completed' : 'export-failed', { mechanism: downloaded ? 'download' : 'none' });
  }
  async function runAndExportRecordProbe() {
    try { alert('Record Probe started'); } catch (_) {}
    recordProbeStage('button-clicked');
    const button = panel?.querySelector('#bp-export-record-probe');
    const owner = ++state.recordProbeGeneration;
    state.recordProbeRunning = true;
    recordProbeStage('probe-started', { generation: owner });
    if (state.recordProbeDeadlineTimer) clearTimeout(state.recordProbeDeadlineTimer);
    state.recordProbeDeadlineTimer = setTimeout(() => {
      if (state.recordProbeGeneration === owner) {
        recordProbeStage('timeout', { generation: owner });
        state.recordProbeRunning = false;
      }
    }, 13000);
    state.recordProbe = [];
    let safeContext = { activeTableId: normalizeTableId(state.activeTableId), roomId: '', shoe: state.shoe ?? null, round: Number(state.lastRound) || 0, reportsReceived: 0 };
    try {
      const context = state.recordProbeContext || recordProbeContextFromLocalState();
      safeContext = { ...safeContext, ...(context || {}), activeTableId: normalizeTableId(context?.activeTableId || state.activeTableId), reportsReceived: 0 };
      recordProbeStage(safeContext.activeTableId && safeContext.roomId && safeContext.shoe !== null && Number(safeContext.round) > 0 ? 'context-resolved' : 'context-missing', { activeTableId: safeContext.activeTableId, room_id: safeContext.roomId, shoe: safeContext.shoe, round: safeContext.round });
      if (!safeContext.activeTableId || !safeContext.roomId || safeContext.shoe === null || safeContext.shoe === undefined || !Number.isFinite(Number(safeContext.round)) || Number(safeContext.round) <= 0) {
        state.recordProbe = [{ timestamp: Date.now(), activeTableId: safeContext.activeTableId || null, room_id: safeContext.roomId || '', currentShoe: safeContext.shoe ?? null, currentRound: Number(safeContext.round) || 0, requestedShoe: safeContext.shoe ?? null, requestedRound: null, requestTableId: safeContext.roomId || '', responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: 'missing trusted active-table context', stage: 'context' }];
      } else if (isTopWindow) {
        const frames = Array.from(document.querySelectorAll('iframe'));
        const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        state.recordProbeRequestId = requestId;
        state.recordProbeReports.clear();
        const localSocket = recordProbeLocalSocketState();
        const localProbePromise = localSocket.found
          ? executeRecordProbe(safeContext)
          : null;
        if (localSocket.found) {
          state.recordProbeSocketFound = true;
          state.recordProbeSocketReadyState = localSocket.readyState;
          recordProbeStage('game-socket-found', { readyState: localSocket.readyState, source: 'top-frame-page-hook' });
        }
        recordProbeStage('top-context-ready', { frames: frames.length, localSocketFound: localSocket.found });
        for (const frame of frames) {
          try { recordProbeStage('request-relay-to-child'); frame.contentWindow?.postMessage({ type: RECORD_PROBE_REQUEST_MESSAGE, requestId, context: safeContext }, '*'); } catch (error) { recordProbeStage('exception', { message: String(error?.message || error) }); }
        }
        recordProbeStage('requests-sent', { count: frames.length ? frames.length * 3 : 3 });
        await new Promise(resolve => setTimeout(resolve, frames.length ? 12000 : 50));
        if (state.recordProbeGeneration !== owner) return;
        const localRecords = localProbePromise ? await localProbePromise : [];
        state.recordProbe = [
          ...Array.from(state.recordProbeReports.values()).flatMap(value => Array.isArray(value?.records) ? value.records : []),
          ...localRecords
        ];
        safeContext.reportsReceived = state.recordProbeReports.size;
        if (safeContext.reportsReceived) recordProbeStage('response-received', { reports: safeContext.reportsReceived });
        if (!state.recordProbe.length && !frames.length) state.recordProbe = await executeRecordProbe(safeContext);
        if (!state.recordProbe.length) { recordProbeStage('timeout', { reports: safeContext.reportsReceived }); state.recordProbe = [{ timestamp: Date.now(), activeTableId: safeContext.activeTableId, room_id: safeContext.roomId, currentShoe: safeContext.shoe, currentRound: safeContext.round, requestedShoe: safeContext.shoe, requestedRound: null, requestTableId: safeContext.roomId, responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: 'child frame did not return a report before timeout', stage: 'relay-timeout' }]; }
      } else {
        state.recordProbeSocketFound = true;
        state.recordProbeSocketReadyState = 'existing-frame';
        recordProbeStage('socket-found');
        state.recordProbe = await executeRecordProbe(safeContext);
      }
    } catch (error) {
      state.recordProbeLastException = String(error?.message || error);
      recordProbeStage('exception', { message: state.recordProbeLastException });
      state.recordProbe = [{ timestamp: Date.now(), activeTableId: safeContext.activeTableId || null, room_id: safeContext.roomId || '', currentShoe: safeContext.shoe ?? null, currentRound: Number(safeContext.round) || 0, requestedShoe: safeContext.shoe ?? null, requestedRound: null, requestTableId: safeContext.roomId || '', responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: state.recordProbeLastException, stage: 'exception' }];
    } finally {
      if (state.recordProbeGeneration === owner) {
        if (!state.recordProbe.length) state.recordProbe = [{ timestamp: Date.now(), activeTableId: safeContext.activeTableId || null, room_id: safeContext.roomId || '', currentShoe: safeContext.shoe ?? null, currentRound: Number(safeContext.round) || 0, requestedShoe: safeContext.shoe ?? null, requestedRound: null, requestTableId: safeContext.roomId || '', responseShoe: null, responseRound: null, responseResult: null, responseName: null, responseMatchesRequest: false, success: false, failureReason: 'no probe records', stage: 'finally' }];
        const text = recordProbeExportText(state.recordProbe, safeContext);
        exportRecordProbeJsonNonBlocking(text, button);
        state.recordProbeRunning = false;
        recordProbeStage('finally-cleanup', { generation: owner });
        if (state.recordProbeDeadlineTimer) { clearTimeout(state.recordProbeDeadlineTimer); state.recordProbeDeadlineTimer = null; }
      }
    }
  }
  async function exportHistoryCapture() {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    state.historyRequestId = requestId;
    state.historyReports.clear();

    const localReport = collectHistoryReport(requestId);
    state.historyReports.set(localReport.frameId, localReport);
    sendHistoryRequestToChildFrames(requestId);
    await new Promise(resolve => setTimeout(resolve, 500));

    const records = Array.from(state.historyReports.values())
      .flatMap(report => Array.isArray(report?.records)
        ? report.records
        : []);
    await copyTableListText(
      historyExportText(records),
      panel?.querySelector('#bp-export-history')
    );
  }

  window.addEventListener('message', event => {
    const message = event.data;
    if (message?.type === RECORD_PROBE_RESPONSE_MESSAGE && message.response) {
      try {
        const response = message.response;
        const raw = JSON.stringify({
          action: { name: response.actionName },
          payload: {
            msg: {
              game: {
                shoe: response.responseShoe,
                round: response.responseRound,
                result: response.responseResult,
                name: response.responseName
              }
            }
          }
        });
        window.dispatchEvent(new CustomEvent(RECORD_PROBE_RESPONSE_EVENT, {
          detail: { direction: 'inbound', raw }
        }));
      } catch (_) {}
      return;
    }
    if (message?.type === RECORD_PROBE_LOADER_STATUS_MESSAGE && message.telemetry) { const telemetry = message.telemetry; dgStoreRecordOutboundSourceEvidence(telemetry); if (telemetry.inboundObservation) { state.recordProbeInboundDuringProbe.push(redactObject(telemetry.inboundObservation)); if (state.recordProbeInboundDuringProbe.length > 100) state.recordProbeInboundDuringProbe.splice(0, state.recordProbeInboundDuringProbe.length - 100); } if (telemetry.frameId) state.recordProbeLoaderFrames.set(String(telemetry.frameId), redactObject(telemetry)); recordProbeStage(telemetry.stage || 'loader-status', { requestedShoe: telemetry.requestedShoe, requestedRound: telemetry.requestedRound, readyState: telemetry.readyState, url: telemetry.url }); return; }
    if (!message || typeof message !== 'object') return;

    if (
      message.type === TABLE_CLICK_ACK_MESSAGE &&
      message.clickId
    ) {
      recordHandshakeStage('click-ack-received', {
        clickId: String(message.clickId),
        tableName: pendingClickRelay?.tableName ??
          state.pendingClickedTableName
      });
      clearPendingClickRecord(String(message.clickId));
      return;
    }

    if (
      message.type === TABLE_MAPPING_ACK_MESSAGE &&
      message.relayId
    ) {
      clearPendingMappingRecord(String(message.relayId));
      return;
    }

    if (
      message.type === HANDSHAKE_REQUEST_MESSAGE &&
      message.requestId
    ) {
      const report = collectHandshakeReport(message.requestId);
      try {
        window.top.postMessage({
          type: HANDSHAKE_REPORT_MESSAGE,
          report
        }, '*');
      } catch (_) {}
      sendHandshakeRequestToChildFrames(message.requestId);
      return;
    }

    if (
      isTopWindow &&
      message.type === HANDSHAKE_REPORT_MESSAGE &&
      message.report?.requestId === state.handshakeRequestId &&
      message.report?.frameId
    ) {
      state.handshakeReports.set(
        message.report.frameId,
        message.report
      );
      return;
    }

    if (
      message.type === HISTORY_CAPTURE_REQUEST_MESSAGE &&
      message.requestId
    ) {
      const report = collectHistoryReport(message.requestId);
      try {
        window.top.postMessage({
          type: HISTORY_CAPTURE_REPORT_MESSAGE,
          report
        }, '*');
      } catch (_) {}
      sendHistoryRequestToChildFrames(message.requestId);
      return;
    }

    if (
      isTopWindow &&
      message.type === HISTORY_CAPTURE_REPORT_MESSAGE &&
      message.report?.requestId === state.historyRequestId &&
      message.report?.frameId
    ) {
      state.historyReports.set(
        message.report.frameId,
        message.report
      );
      return;
    }

    if (
      message.type === TABLE_LIST_REQUEST_TYPE &&
      message.requestId
    ) {
      const report = collectTableListReport(message.requestId);
      try {
        window.top.postMessage(
          { type: TABLE_LIST_REPORT_TYPE, report },
          '*'
        );
      } catch (_) {}
      sendTableListRequestToChildFrames(message.requestId);
      return;
    }

    if (
      isTopWindow &&
      message.type === TABLE_LIST_REPORT_TYPE &&
      message.report?.requestId === state.tableListRequestId &&
      message.report?.frameId
    ) {
      state.tableListReports.set(
        message.report.frameId,
        message.report
      );
    }
  });

  async function exportOutboundCapture() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: 'iPhone-outbound-debug-v1',
      activeTableId: state.activeTableId,
      activeTableSource: state.activeTableSource,
      ignoredForeignTablePackets: state.ignoredForeignTablePackets,
      resetReasons: state.resetCapture.map(item => ({
        ...item,
        source: redactText(item.source)
      })),
      packets: state.outboundCapture.slice(-150).map(item => ({
        timestamp: item.timestamp,
        wsUrl: redactUrl(item.wsUrl),
        direction: item.direction,
        raw: truncateExportText(redactText(item.raw)),
        parsed: compactExportParsed(item.parsed),
        actionName: item.actionName,
        actionPath: item.actionPath,
        table_id: item.table_id,
        tableId: item.tableId,
        shoe: item.shoe,
        round: item.round,
        game_state: item.game_state,
        game_data: redactText(item.game_data),
        result: item.result,
        room_id: item.room_id
      }))
    };
    const text = JSON.stringify(exportData, null, 2);
    const button = panel?.querySelector('#bp-export-outbound');
    let copied = false;

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (_) {}

    if (!copied) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        copied = document.execCommand('copy');
      } catch (_) {
        copied = false;
      }

      textarea.remove();
    }

    if (button) {
      const originalText = button.textContent;
      button.textContent = copied ? 'Copied!' : 'Copy failed';
      setTimeout(() => {
        if (button.isConnected) {
          button.textContent = originalText || 'Export Debug Capture';
        }
      }, 1800);
    }
  }

  function inboundPacketSummary(item) {
    let parsed = item?.parsed || null;
    if (!parsed && typeof item?.raw === 'string') { try { parsed = JSON.parse(item.raw); } catch (_) {} }
    const action = parsed?.action;
    const actionName = typeof action === 'string' ? action : action?.name || parsed?.command || parsed?.event || parsed?.path || parsed?.route || item?.actionName || '';
    const body = parsed?.body && typeof parsed.body === 'object' ? parsed.body : null;
    const result = body?.result ?? parsed?.result ?? body?.game_data ?? parsed?.game_data ?? null;
    const payloadKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed).slice(0, 80) : [];
    const bodyKeys = body ? Object.keys(body).slice(0, 100) : [];
    return {
      timestamp: Number(item?.timestamp || Date.now()),
      wsUrl: roomEntrySafeUrl(item?.wsUrl || item?.url || ''),
      actionName: String(actionName || '').slice(0, 300),
      direction: String(item?.direction || 'inbound').slice(0, 20),
      table_id: body?.table_id ?? body?.tableId ?? parsed?.table_id ?? parsed?.tableId ?? null,
      room_id: body?.room_id ?? body?.roomId ?? parsed?.room_id ?? parsed?.roomId ?? null,
      shoe: body?.shoe ?? parsed?.shoe ?? null,
      round: body?.round ?? parsed?.round ?? null,
      game_state: body?.game_state ?? body?.gameState ?? body?.state ?? parsed?.game_state ?? parsed?.gameState ?? null,
      resultStructure: result === null || result === undefined ? null : Array.isArray(result) ? { type:'array', length:result.length, preview:result.slice(0, 20) } : typeof result === 'object' ? { type:'object', keys:Object.keys(result).slice(0, 60) } : { type:typeof result, preview:String(result).slice(0, 500) },
      payloadKeys,
      bodyKeys
    };
  }
  function exportInboundGamePackets() {
    const records = state.packetCapture.filter(item => String(item?.direction || 'inbound') === 'inbound').slice(-500).map(inboundPacketSummary);
    const text = JSON.stringify({ exportedAt:new Date().toISOString(), version:'inbound-game-packets-v1', note:'Observation only. Exported from existing packetCapture; no state or routing mutation.', count:records.length, packets:records }, null, 2);
    try { const blob=new Blob([text],{type:'application/json;charset=utf-8'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='BaccaratPulse-Inbound-Game-Packets.json'; link.style.display='none'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); } catch (_) {}
    try { const promise=navigator.clipboard?.writeText?.(text); if (promise?.catch) promise.catch(()=>{}); } catch (_) {}
  }
  async function exportSocketDiagnostics() {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    state.childSocketDiagnostics.clear();
    if (isTopWindow) {
      try {
        for (const frame of Array.from(document.querySelectorAll('iframe'))) {
          frame.contentWindow?.postMessage({ type: SOCKET_DIAGNOSTICS_REQUEST, requestId }, '*');
        }
      } catch (_) {}
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    const frameReports = Array.from(state.childSocketDiagnostics.values());
    const text = JSON.stringify({ exportedAt: new Date().toISOString(), version: 'websocket-instance-diagnostics-cross-frame-v2', frameId: DISCOVERY_FRAME_ID, isTopWindow, frames: [{ frameId: DISCOVERY_FRAME_ID, frameUrl: roomEntrySafeUrl(location.href), isTopWindow: true, sockets: Array.from(state.socketDiagnostics.values()).map(item => ({ ...item })) }, ...frameReports] }, null, 2);
    try { const blob=new Blob([text],{type:'application/json;charset=utf-8'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='BaccaratPulse-WebSocket-Diagnostics.json'; link.style.display='none'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); } catch (_) {}
    try { const promise=navigator.clipboard?.writeText?.(text); if (promise?.catch) promise.catch(()=>{}); } catch (_) {}
  }
  function observeSocketDiagnostics(detail) {
    if (!detail || !detail.socketId) return;
    state.socketDiagnostics.set(String(detail.socketId), { socketId: String(detail.socketId), url: roomEntrySafeUrl(detail.url), frameUrl: roomEntrySafeUrl(detail.frameUrl), frameId: DISCOVERY_FRAME_ID, isTopWindow: Boolean(isTopWindow), readyState: Number(detail.readyState), messageCount: Number(detail.messageCount)||0, sendCount: Number(detail.sendCount)||0, lastInboundAt: Number(detail.lastInboundAt)||0, lastOutboundAt: Number(detail.lastOutboundAt)||0, hasMtPacket: Boolean(detail.hasMtPacket), lastAction: String(detail.lastAction||'').slice(0,240) });
  }
  function processEarlyItem(item) {
    if (item?.direction) observeRoomEntryEvidence('packet', item);
    if (item?.direction) {
      recordPacket(item);
      if (item.direction === 'outbound') {
        render();
        return;
      }
    } else if (item?.raw) {
      recordPacket({
        ...item,
        direction: 'inbound'
      });
    }
    state.wsMessages += 1;
    // Binary frames belong to the DG adapter only. Do not feed them through
    // MT record-context observation or the JSON live parser.
    if (item?.binary) {
      processDgBinary(item.binary, item || {});
      return;
    }
    if (item?.raw) observeRecordProbeContext(item.raw);
    const localContext = recordProbeContextFromLocalState();
    if (localContext) publishRecordProbeContext(localContext);
    processLiveRaw(item?.raw, item || {});
  }

  // =====================================================
  // DG binary adapter — evidence-backed decoder only.
  // The HAR proves: binary frame -> embedded JSON -> banker/player strings;
  // table list proves table-name -> numeric tableId; round prefix before R is
  // the evidence-backed DG shoe/session identity.
  // =====================================================

  const DG_MAX_FRAME_BYTES = 512 * 1024;
  const DG_ROUND_MARKER = /\d{12}R\d{4}/;
  const DG_PLAYER_MARKER = /["']player["']\s*:/i;
  const DG_BANKER_MARKER = /["']banker["']\s*:/i;

  function dgBinaryLength(value) {
    if (value instanceof Uint8Array) return value.byteLength;
    if (Array.isArray(value)) return value.length;
    if (value instanceof ArrayBuffer) return value.byteLength;
    if (ArrayBuffer.isView(value)) return value.byteLength;
    return typeof value === 'string' ? value.length : 0;
  }

  function dgBytesToText(value) {
    if (dgBinaryLength(value) > DG_MAX_FRAME_BYTES) return null;
    if (value instanceof Uint8Array) return new TextDecoder().decode(value);
    if (Array.isArray(value)) return new TextDecoder().decode(new Uint8Array(value));
    if (value instanceof ArrayBuffer) return new TextDecoder().decode(new Uint8Array(value));
    if (ArrayBuffer.isView(value)) return new TextDecoder().decode(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
    return String(value || '');
  }

  function dgBytesView(value) {
    if (value instanceof Uint8Array) return value;
    if (Array.isArray(value)) return new Uint8Array(value);
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return null;
  }

  function dgFramingKeyPaths(value, path = '$', output = [], depth = 0) {
    if (!value || typeof value !== 'object' || output.length >= 40 || depth > 5) return output;
    for (const key of Object.keys(value).slice(0, 40)) {
      if (DG_INITIAL_SENSITIVE_KEY_PATTERN.test(key)) continue;
      const next = `${path}.${key}`.slice(0, 180);
      output.push(next);
      if (value[key] && typeof value[key] === 'object') dgFramingKeyPaths(value[key], next, output, depth + 1);
      if (output.length >= 40) break;
    }
    return output;
  }

  function dgFramingArrayLengths(value, path = '$', output = [], depth = 0) {
    if (output.length >= 32 || depth > 5 || !value || typeof value !== 'object') return output;
    if (Array.isArray(value)) {
      output.push({ path: path.slice(0, 180), length: value.length });
      for (let index = 0; index < Math.min(value.length, 8); index += 1) dgFramingArrayLengths(value[index], `${path}[${index}]`, output, depth + 1);
      return output;
    }
    for (const key of Object.keys(value).slice(0, 40)) {
      if (DG_INITIAL_SENSITIVE_KEY_PATTERN.test(key)) continue;
      dgFramingArrayLengths(value[key], `${path}.${key}`, output, depth + 1);
      if (output.length >= 32) break;
    }
    return output;
  }

  function dgFramingJsonEnvelope(bytes, utf8Text) {
    if (!bytes || !utf8Text) return null;
    const open = Math.min(...['{', '['].map(char => utf8Text.indexOf(char)).filter(index => index >= 0));
    const close = Math.max(utf8Text.lastIndexOf('}'), utf8Text.lastIndexOf(']'));
    if (!Number.isFinite(open) || close <= open) return null;
    const start = open;
    const end = close + 1;
    try {
      const parsed = JSON.parse(utf8Text.slice(start, end));
      return {
        candidateCount: 1,
        selected: {
          prefixLength: new TextEncoder().encode(utf8Text.slice(0, start)).length,
          suffixLength: new TextEncoder().encode(utf8Text.slice(end)).length,
          topLevelType: Array.isArray(parsed) ? 'array' : typeof parsed,
          keys: parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? dgProbeKeys(parsed, 40) : [],
          nestedKeyPaths: dgFramingKeyPaths(parsed),
          arrayLengths: dgFramingArrayLengths(parsed)
        }
      };
    } catch (_) {
      return null;
    }
  }

  function dgBinaryFramingSummary(value, text, detail = {}) {
    const bytes = dgBytesView(value);
    if (!bytes) return null;
    const length = bytes.length;
    const printableCount = Array.from(bytes).filter(byte => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)).length;
    const utf8 = (() => {
      try { return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }; }
      catch (_) { return { ok: false, text: '' }; }
    })();
    const chars = ['{', '}', '[', ']', '(', ')', '"', "'"];
    const offsets = Object.fromEntries(chars.map(char => [char, Array.from(bytes).map((byte, index) => byte === char.charCodeAt(0) ? index : -1).filter(index => index >= 0).slice(0, 16)]));
    const nullPositions = Array.from(bytes).map((byte, index) => byte === 0 ? index : -1).filter(index => index >= 0);
    const read = (offset, size, littleEndian) => {
      if (offset + size > length) return null;
      let result = 0;
      for (let index = 0; index < size; index += 1) {
        const shift = littleEndian ? index : size - index - 1;
        result += bytes[offset + index] * (2 ** (8 * shift));
      }
      return result;
    };
    const headerCandidates = [];
    for (const size of [1, 2, 4]) {
      for (const endian of ['big', 'little']) {
        const valueAtZero = read(0, size, endian === 'little');
        const valueAtOne = read(1, size, endian === 'little');
        for (const [offset, candidate] of [[0, valueAtZero], [1, valueAtOne]]) {
          if (candidate !== null && (candidate === length || candidate === length - offset - size || (candidate > 0 && candidate < length))) {
            headerCandidates.push({ offset, width: size, endian, value: candidate });
          }
        }
      }
    }
    const textForStructure = utf8.ok ? utf8.text : '';
    const framing = {
      ...detail,
      byteLength: length,
      first32Bytes: Array.from(bytes.slice(0, 32)),
      last16Bytes: Array.from(bytes.slice(Math.max(0, length - 16))),
      printableRatio: length ? Number((printableCount / length).toFixed(4)) : 0,
      utf8DecodeOk: utf8.ok,
      utf8DecodedLength: textForStructure.length,
      firstStructuralByteOffsets: Object.fromEntries(Object.entries(offsets).filter(([, values]) => values.length).map(([key, values]) => [key, values[0]])),
      lastStructuralByteOffsets: Object.fromEntries(Object.entries(offsets).filter(([, values]) => values.length).map(([key, values]) => [key, values[values.length - 1]])),
      structuralByteCounts: Object.fromEntries(Object.entries(offsets).map(([key, values]) => [key, values.length])),
      multipleObjectOrArrayCandidates: (offsets['{'].length > 1 && offsets['}'].length > 1) || (offsets['['].length > 1 && offsets[']'].length > 1),
      nullByteCount: nullPositions.length,
      nullBytePositions: nullPositions.slice(0, 32),
      headerLengthCandidates: headerCandidates.slice(0, 16),
      jsonEnvelope: dgFramingJsonEnvelope(bytes, textForStructure),
      binaryHeuristics: {
        lengthPrefixedPacket: headerCandidates.length > 0,
        concatenatedPacketLike: (offsets['{'].length > 1 && offsets['}'].length > 1) || (offsets['['].length > 1 && offsets[']'].length > 1),
        protobufLike: !utf8.ok && nullPositions.length === 0,
        messagePackLike: bytes[0] >= 0x80 && bytes[0] <= 0x9f,
        compressedPayloadLike: bytes[0] === 0x1f && bytes[1] === 0x8b || bytes[0] === 0x78 && (bytes[1] === 0x01 || bytes[1] === 0x9c || bytes[1] === 0xda),
        utf8TextWithBinaryHeader: utf8.ok && printableCount / Math.max(1, length) < 0.95 && offsets['{'].length + offsets['['].length > 0
      }
    };
    return framing;
  }

  function dgHasCheapRoundMarkers(text) {
    return Boolean(
      text &&
      DG_ROUND_MARKER.test(text) &&
      DG_PLAYER_MARKER.test(text) &&
      DG_BANKER_MARKER.test(text)
    );
  }

  // Single-pass bounded extraction. The cursor advances past each completed
  // object, so nested JSON is O(n) rather than rescanning from every '{'.
  function dgExtractJsonObjects(text, onParse = null) {
    const objects = [];
    let start = -1;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (start < 0) {
        if (char === '{') {
          start = index;
          depth = 1;
          quoted = false;
          escaped = false;
        }
        continue;
      }
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') quoted = false;
        continue;
      }
      if (char === '"') quoted = true;
      else if (char === '{') depth += 1;
      else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          const candidate = text.slice(start, index + 1);
          try {
            const parsed = JSON.parse(candidate);
            objects.push(parsed);
            try { onParse?.(true, parsed); } catch (_) {}
          } catch (_) {
            try { onParse?.(false, null); } catch (_) {}
          }
          start = -1;
        }
      }
    }
    return objects;
  }

  function dgEmbeddedTextByteOffset(text, index) {
    try { return new TextEncoder().encode(String(text || '').slice(0, index)).length; }
    catch (_) { return index; }
  }

  function dgEmbeddedJsonObjects(text) {
    const objects = [];
    if (typeof text !== 'string' || !text) return objects;
    let start = -1;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = 0; index < text.length && objects.length < 12; index += 1) {
      const char = text[index];
      if (start < 0) {
        if (char === '{') {
          start = index;
          depth = 1;
          quoted = false;
          escaped = false;
        }
        continue;
      }
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') quoted = false;
        continue;
      }
      if (char === '"') quoted = true;
      else if (char === '{') depth += 1;
      else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          const end = index + 1;
          try {
            objects.push({ value: JSON.parse(text.slice(start, end)), start, end, startOffset: dgEmbeddedTextByteOffset(text, start), endOffset: dgEmbeddedTextByteOffset(text, end) });
          } catch (_) {}
          start = -1;
        }
      }
    }
    return objects;
  }

  function dgEmbeddedFieldMeta(value, matcher, path = '$', depth = 0) {
    if (depth > 5 || !value || typeof value !== 'object') return null;
    for (const key of Object.keys(value).slice(0, 40)) {
      if (DG_INITIAL_SENSITIVE_KEY_PATTERN.test(key)) continue;
      const nextPath = `${path}.${key}`.slice(0, 180);
      if (matcher(String(key).toLowerCase())) {
        const child = value[key];
        let representation = typeof child;
        if (Array.isArray(child)) representation = `array:${child.length}`;
        else if (child && typeof child === 'object') representation = `object:${dgProbeKeys(child, 20).length}keys`;
        else if (typeof child === 'string') representation = `string:${child.length}`;
        const safeValue = DG_INITIAL_SENSITIVE_KEY_PATTERN.test(key) || /url|href|query|hash/i.test(key)
          ? '[REDACTED]'
          : typeof child === 'string' && child.length <= 80 ? child
            : typeof child === 'number' || typeof child === 'boolean' || child === null ? child
              : undefined;
        return { path: nextPath, type: Array.isArray(child) ? 'array' : typeof child, representation, value: safeValue };
      }
      const nested = dgEmbeddedFieldMeta(value[key], matcher, nextPath, depth + 1);
      if (nested) return nested;
    }
    return null;
  }

  function dgEmbeddedIdentity(value) {
    const identity = (patterns) => dgEmbeddedFieldMeta(value, key => patterns.some(pattern => pattern.test(key)));
    return {
      table: identity([/^table$/, /^table[_-]?id$/, /^tablename$/, /^table[_-]?name$/]),
      shoe: identity([/^shoe$/, /^shoe[_-]?id$/]),
      round: identity([/^round$/, /^round[_-]?id$/, /^hand$/, /^hand[_-]?id$/]),
      action: identity([/^action$/, /^action[_-]?name$/]),
      type: identity([/^type$/, /^message[_-]?type$/]),
      event: identity([/^event$/, /^event[_-]?name$/]),
      state: identity([/^state$/, /^game[_-]?state$/]),
      status: identity([/^status$/]),
      phase: identity([/^phase$/]),
      sequence: identity([/^sequence$/, /^seq$/]),
      player: identity([/^player$/, /^player[_-]?cards?$/]),
      banker: identity([/^banker$/, /^banker[_-]?cards?$/])
    };
  }

  function dgEmbeddedObjectSummary(candidate, frameByteLength, objectIndex) {
    const value = candidate.value;
    return {
      objectIndex,
      startOffset: candidate.startOffset,
      endOffset: candidate.endOffset,
      objectLength: Math.max(0, candidate.endOffset - candidate.startOffset),
      topLevelKeys: dgProbeKeys(value, 40),
      nestedKeyPaths: dgFramingKeyPaths(value),
      identity: dgEmbeddedIdentity(value),
      frameByteLength
    };
  }

  function dgCaptureEmbeddedObjectEvidence(value, text, detail = {}) {
    const frameByteLength = dgBinaryLength(value);
    const candidates = dgEmbeddedJsonObjects(text);
    const summaries = candidates.slice(0, 12).map((candidate, objectIndex) => ({
      ...detail,
      frameByteLength,
      chainId: detail.chainId || null,
      ...dgEmbeddedObjectSummary(candidate, frameByteLength, objectIndex)
    }));
    for (const summary of summaries) dgEvidencePush('embeddedObjectEvidence', summary);
    return { candidates, summaries };
  }

  function dgInboundParentWireSummary(value, objectStart, objectEnd) {
    const bytes = dgBytesView(value);
    const empty = { parsed: false, parentFieldPath: null, parentFieldNumbers: [], parentLengthDelimitedBoundaries: [], parentNumericVarints: [], parentPrintableIdentityStrings: [], envelopeFields: { field1: null, field5: null, field6: null, field10: null }, frameNumericIdentityCandidates: [] };
    if (!bytes || !Number.isInteger(objectStart) || !Number.isInteger(objectEnd)) return empty;
    const nodes = [];
    const parse = (start, end, path, depth) => {
      if (depth > 5 || nodes.length >= 96 || start < 0 || end > bytes.length || end - start < 2) return;
      let offset = start;
      let fields = 0;
      while (offset < end && fields < 32 && nodes.length < 96) {
        const key = dgOutboundReadVarint(bytes, offset);
        if (!key) return;
        const fieldNumber = Math.floor(key.value / 8);
        const wireType = key.value & 7;
        if (!fieldNumber || fieldNumber > 2048) return;
        offset = key.next;
        const node = { fieldPath: `${path}.${fieldNumber}`, fieldNumber, wireType, valueStart: offset, end: null, length: null, varint: null, printable: null, depth };
        if (wireType === 0) {
          const item = dgOutboundReadVarint(bytes, offset);
          if (!item || item.next > end) return;
          node.varint = item.value;
          node.end = item.next;
          offset = item.next;
        } else if (wireType === 2) {
          const length = dgOutboundReadVarint(bytes, offset);
          if (!length || length.value > end - length.next) return;
          node.length = length.value;
          node.valueStart = length.next;
          node.end = length.next + length.value;
          const segment = bytes.slice(node.valueStart, node.end);
          if (segment.length >= 3 && segment.every(byte => byte >= 32 && byte <= 126)) node.printable = String.fromCharCode(...segment).replace(/[?&#].*$/, '').slice(0, 120);
          if (depth < 5 && node.length >= 2 && node.length <= 2048) parse(node.valueStart, node.end, node.fieldPath, depth + 1);
          offset = node.end;
        } else if (wireType === 1 || wireType === 5) {
          node.length = wireType === 1 ? 8 : 4;
          node.end = offset + node.length;
          if (node.end > end) return;
          offset = node.end;
        } else return;
        nodes.push(node);
        fields += 1;
      }
    };
    for (let start = 0; start <= Math.min(32, bytes.length - 2) && nodes.length < 96; start += 1) {
      const before = nodes.length;
      parse(start, bytes.length, '$', 0);
      if (nodes.length > before) break;
    }
    const enclosing = nodes.filter(node => node.wireType === 2 && node.valueStart <= objectStart && node.end >= objectEnd).sort((left, right) => (right.valueStart - left.valueStart) || (left.end - right.end));
    const topLevel = nodes.filter(node => node.depth === 0);
    const varints = enclosing.filter(node => node.wireType === 0 && Number.isFinite(node.varint));
    const printable = enclosing.filter(node => node.printable && dgV9IdentityString(node.printable)).slice(0, 16).map(node => ({ fieldPath: node.fieldPath, fieldNumber: node.fieldNumber, value: dgV9IdentityString(node.printable) }));
    const numeric = Array.from(new Set(nodes.filter(node => node.wireType === 0 && Number.isFinite(node.varint)).map(node => String(node.varint)).filter(item => /^\d{1,12}$/.test(item)))).slice(0, 32);
    const fieldValue = number => topLevel.find(node => node.fieldNumber === number && node.wireType === 0)?.varint ?? null;
    const field5 = topLevel.find(node => node.fieldNumber === 5 && node.printable)?.printable || null;
    const nodeLocalSummary = node => {
      const children = nodes.filter(child => child.depth === node.depth + 1 && child.fieldPath.startsWith(`${node.fieldPath}.`) && child.valueStart >= node.valueStart && child.end <= node.end);
      const values = children.filter(child => Number.isFinite(child.varint)).map(child => child.varint);
      const strings = children.filter(child => child.printable && dgV9IdentityString(child.printable)).map(child => ({ fieldPath: child.fieldPath, fieldNumber: child.fieldNumber, value: dgV9IdentityString(child.printable) }));
      const tableCandidates = Array.from(new Set(values.map(value => normalizeTableId(value)).filter(value => /^\d{4,12}$/.test(String(value || ''))))).slice(0, 16);
      const shoeCandidates = Array.from(new Set(strings.map(item => item.value).filter(value => /^20\d{10}$/.test(String(value || ''))))).slice(0, 8);
      const roundCandidates = Array.from(new Set(strings.map(item => item.value).filter(value => /^(?:\d{8,}R\d{1,8}|R\d{1,12})$/i.test(String(value || ''))))).slice(0, 8);
      return { numericVarints: values.slice(0, 24), printableStrings: strings.slice(0, 16), tableCandidates, shoeCandidates, roundCandidates };
    };
    const ancestry = enclosing.slice(0, 5).map((node, index) => ({ depth: index + 1, fieldPath: node.fieldPath, fieldNumber: node.fieldNumber, byteStart: node.valueStart, byteEnd: node.end, length: node.length, local: nodeLocalSummary(node) }));
    const nearest = key => ancestry.find(item => Array.isArray(item.local?.[key]) && item.local[key].length) || null;
    const siblingGroups = new Map();
    for (const node of nodes.filter(item => item.wireType === 2 && item.end > item.valueStart)) {
      const parentPath = node.fieldPath.split('.').slice(0, -1).join('.') || '$';
      const key = `${parentPath}|${node.fieldNumber}`;
      if (!siblingGroups.has(key)) siblingGroups.set(key, []);
      siblingGroups.get(key).push(node);
    }
    const repeatedSiblings = Array.from(siblingGroups.values()).filter(group => group.length > 1).slice(0, 24).map(group => ({
      parentFieldPath: group[0].fieldPath.split('.').slice(0, -1).join('.') || '$',
      parentFieldNumber: group[0].fieldNumber,
      blocks: group.slice(0, 24).map((node, index) => ({ blockIndex: index, byteStart: node.valueStart, byteEnd: node.end, length: node.length, local: nodeLocalSummary(node) }))
    }));
    return { parsed: nodes.length > 0, parentFieldPath: enclosing[0]?.fieldPath || null, parentFieldNumbers: enclosing.map(node => node.fieldNumber).slice(0, 16), parentLengthDelimitedBoundaries: enclosing.map(node => ({ fieldPath: node.fieldPath, fieldNumber: node.fieldNumber, startOffset: node.valueStart, endOffset: node.end, length: node.length })).slice(0, 16), parentNumericVarints: varints.map(node => ({ fieldPath: node.fieldPath, fieldNumber: node.fieldNumber, value: node.varint })).slice(0, 32), parentPrintableIdentityStrings: printable, envelopeFields: { field1: fieldValue(1), field5: dgV9IdentityString(field5), field6: fieldValue(6), field10: fieldValue(10) }, frameNumericIdentityCandidates: numeric, ancestry, nearestTableAncestor: nearest('tableCandidates'), nearestShoeAncestor: nearest('shoeCandidates'), nearestRoundAncestor: nearest('roundCandidates'), repeatedSiblings };
  }
  function dgHistoricalAssociationState() {
    return state.dgDataProbe.historicalAssociationEvidence;
  }
  function dgHistoricalAssociationCardKey(round, player, banker) {
    return `${String(round || '')}|${String(player || '')}|${String(banker || '')}`.slice(0, 260);
  }
  function dgHistoricalAssociationReconcile() {
    const association = dgHistoricalAssociationState();
    const anchors = Array.isArray(association?.anchors) ? association.anchors : [];
    const objects = Array.isArray(association?.cardObjects) ? association.cardObjects : [];
    for (const item of objects) {
      const matched = anchors.find(anchor => anchor.roundIdentity === item.roundIdentity && anchor.shoeIdentity === item.shoeIdentity && anchor.rawPlayer === item.playerRaw && anchor.rawBanker === item.bankerRaw);
      item.matchedLiveAnchor = Boolean(matched);
      item.anchorChainId = matched?.chainId || null;
      const tableCandidates = [
        ...(Array.isArray(item.localTableCandidates) ? item.localTableCandidates : []),
        ...(Array.isArray(item.nearestTableAncestor?.candidateValues) ? item.nearestTableAncestor.candidateValues : [])
      ].map(normalizeTableId).filter(Boolean);
      const verified = normalizeTableId(state.dg.ownership.tableId);
      const sameTable = Boolean(verified && tableCandidates.includes(verified));
      item.exactAssociation = Boolean(sameTable && item.matchedLiveAnchor);
      item.associationReason = item.exactAssociation
        ? 'direct-or-nearest-table-plus-exact-live-anchor'
        : item.matchedLiveAnchor
          ? 'exact-live-anchor-but-table-not-structurally-proven'
          : sameTable
            ? 'table-structurally-present-but-live-anchor-not-matched'
            : 'not-proven';
    }
  }
  function dgHistoricalAssociationObserveLiveAnchor(merged, chainId = null) {
    const association = dgHistoricalAssociationState();
    if (!association || association.frozen) return;
    const verifiedTableId = normalizeTableId(state.dg.ownership.tableId);
    const mergedTableId = normalizeTableId(merged?.tableId);
    if (!merged?.complete || !verifiedTableId || mergedTableId !== verifiedTableId || !dgOwnsIdentity(mergedTableId)) return;
    const roundIdentity = String(merged?.roundIdentity || '').trim();
    const shoeIdentity = String(merged?.shoeIdentity || dgShoeIdentity(roundIdentity) || '').trim();
    if (!roundIdentity || !shoeIdentity || shoeIdentity !== String(state.dg.shoeIdentity || '') || !merged?.player || !merged?.banker) return;
    const anchor = { timestamp: Date.now(), chainId: chainId ? String(chainId).slice(0, 80) : null, tableId: normalizeTableId(merged.tableId), shoeIdentity, roundIdentity, rawPlayer: merged.player.join('-'), rawBanker: merged.banker.join('-') };
    const key = dgHistoricalAssociationCardKey(anchor.roundIdentity, anchor.rawPlayer, anchor.rawBanker);
    if (!association.anchors.some(item => item.key === key) && association.anchors.length < 5) association.anchors.push({ ...anchor, key });
    dgHistoricalAssociationReconcile();
    if (association.anchors.length >= 5) dgHistoricalAssociationFreeze('five-verified-live-anchors');
  }
  function dgHistoricalAssociationFreeze(reason) {
    const association = dgHistoricalAssociationState();
    if (!association) return;
    association.active = false;
    association.frozen = true;
    association.freezeReason = String(reason || 'stopped').slice(0, 80);
    dgHistoricalAssociationReconcile();
  }
  function dgInitializationObjectAssociationEvidence(value, text, embeddedEvidence, detail = {}) {
    const capture = state.dgDataProbe.initialization;
    const summaryState = state.dgDataProbe.initializationObjectAssociationSummary;
    if ((!capture.active && !capture.firstDispatch) || summaryState.frozen) return;
    const summaries = Array.isArray(embeddedEvidence?.summaries) ? embeddedEvidence.summaries.slice(0, 12) : [];
    if (!summaries.length) return;
    const frameKey = String(detail.chainId || detail.sequence || detail.frameId || `${detail.timestamp || Date.now()}`).slice(0, 180);
    if (!capture.associationFrameKeys.has(frameKey)) {
      capture.associationFrameKeys.add(frameKey);
      summaryState.frameCount += 1;
    }
    const frameRoundCandidates = Array.from(new Set((String(text || '').match(/(?:\d{8,}R\d{1,8}|R\d{1,12})/gi) || []).slice(0, 24)));
    const frameShoeCandidates = Array.from(new Set(frameRoundCandidates.map(item => dgShoeIdentity(item)).filter(Boolean)));
    for (const item of summaries) {
      const parent = dgInboundParentWireSummary(value, item.startOffset, item.endOffset);
      const rawPlayer = item.identity?.player?.value ?? null;
      const rawBanker = item.identity?.banker?.value ?? null;
      const objectRoundForAssociation = dgV9IdentityString(item.identity?.round?.value) || parent.nearestRoundAncestor?.local?.roundCandidates?.[0] || null;
      const objectShoeForAssociation = dgV9IdentityString(item.identity?.shoe?.value) || parent.nearestShoeAncestor?.local?.shoeCandidates?.[0] || (objectRoundForAssociation ? dgShoeIdentity(objectRoundForAssociation) : null);
      const matchedAnchor = dgHistoricalAssociationState().anchors.find(anchor => anchor.roundIdentity === objectRoundForAssociation && anchor.shoeIdentity === objectShoeForAssociation && anchor.rawPlayer === rawPlayer && anchor.rawBanker === rawBanker) || null;
      const structuralBlocks = (Array.isArray(parent.repeatedSiblings) ? parent.repeatedSiblings : []).flatMap(group => group.blocks.map(block => {
        const cards = summaries.filter(candidate => candidate.startOffset >= block.byteStart && candidate.endOffset <= block.byteEnd).slice(0, 8).map(candidate => ({ objectIndex: candidate.objectIndex, playerRaw: candidate.identity?.player?.value ?? null, bankerRaw: candidate.identity?.banker?.value ?? null, roundIdentity: candidate.identity?.round?.value || null }));
        return { parentFieldPath: group.parentFieldPath, parentFieldNumber: group.parentFieldNumber, blockIndex: block.blockIndex, byteStart: block.byteStart, byteEnd: block.byteEnd, localTableCandidates: block.local.tableCandidates, localShoeCandidates: block.local.shoeCandidates, localRoundCandidates: block.local.roundCandidates, cards };
      })).slice(0, 32);
      const association = dgHistoricalAssociationState();
      const associationFrameKey = String(detail.chainId || detail.sequence || '').slice(0, 180);
      if (associationFrameKey && association.frameKeys.length < 64 && !association.frameKeys.includes(associationFrameKey)) association.frameKeys.push(associationFrameKey);
      if (association.blocks.length < 64) association.blocks.push(...structuralBlocks.slice(0, Math.max(0, 64 - association.blocks.length)));
      const objectTable = item.identity?.table?.value;
      const objectTableId = normalizeTableId(objectTable);
      const parentField1 = Number(parent.envelopeFields?.field1);
      const parentTableId = [44, 1002, 1003].includes(parentField1) ? normalizeTableId(parent.envelopeFields?.field6) : null;
      const tableCandidates = [];
      if (objectTableId) tableCandidates.push({ value: objectTableId, provenance: 'DIRECT_OBJECT_FIELD', path: item.identity?.table?.path || null });
      if (parentTableId) tableCandidates.push({ value: parentTableId, provenance: 'DIRECT_PARENT_FIELD', path: parent.parentFieldPath || '$' });
      for (const candidate of parent.frameNumericIdentityCandidates || []) {
        const normalized = normalizeTableId(candidate);
        if (normalized && !tableCandidates.some(entry => entry.value === normalized && entry.provenance !== 'FRAME_ONLY')) tableCandidates.push({ value: normalized, provenance: 'FRAME_ONLY', path: null });
      }
      const objectRound = dgV9IdentityString(item.identity?.round?.value);
      const parentRound = dgV9IdentityString(parent.envelopeFields?.field5) || parent.parentPrintableIdentityStrings?.find(entry => /(?:\d{8,}R\d{1,8}|R\d{1,12})/i.test(entry.value))?.value || null;
      const roundCandidates = [];
      if (objectRound) roundCandidates.push({ value: objectRound, provenance: 'DIRECT_OBJECT', path: item.identity?.round?.path || null });
      if (parentRound && !roundCandidates.some(entry => entry.value === parentRound)) roundCandidates.push({ value: parentRound, provenance: 'DIRECT_PARENT', path: parent.parentFieldPath || '$' });
      for (const candidate of frameRoundCandidates) if (!roundCandidates.some(entry => entry.value === candidate)) roundCandidates.push({ value: candidate, provenance: 'FRAME_ONLY', path: null });
      const objectShoe = dgV9IdentityString(item.identity?.shoe?.value);
      const parentShoe = parent.parentPrintableIdentityStrings?.find(entry => /^20\d{10}$/.test(String(entry.value || '')))?.value || null;
      const shoeCandidates = [];
      if (objectShoe) shoeCandidates.push({ value: objectShoe, provenance: 'DIRECT_OBJECT', path: item.identity?.shoe?.path || null });
      if (parentShoe && !shoeCandidates.some(entry => entry.value === parentShoe)) shoeCandidates.push({ value: parentShoe, provenance: 'DIRECT_PARENT', path: parent.parentFieldPath || '$' });
      for (const candidate of frameShoeCandidates) if (!shoeCandidates.some(entry => entry.value === candidate)) shoeCandidates.push({ value: candidate, provenance: 'FRAME_ONLY', path: null });
      const outcome = ['state', 'status', 'phase', 'event', 'type'].map(key => item.identity?.[key]?.value).filter(value => value !== null && value !== undefined).slice(0, 5);
      const hasCards = rawPlayer !== null || rawBanker !== null;
      const hasExactAssociation = hasCards && tableCandidates.some(entry => entry.provenance !== 'FRAME_ONLY') && roundCandidates.some(entry => entry.provenance !== 'FRAME_ONLY') && shoeCandidates.some(entry => entry.provenance !== 'FRAME_ONLY');
      const evidence = {
        frameId: detail.frameId || DISCOVERY_FRAME_ID,
        chainId: detail.chainId || null,
        socketGeneration: Number(detail.socketGeneration) || null,
        sequence: Number(detail.sequence) || null,
        processSequence: Number(detail.processSequence) || null,
        timestamp: Number(detail.timestamp) || Date.now(),
        objectIndex: Number(item.objectIndex),
        nestedPath: Array.isArray(item.nestedKeyPaths) ? item.nestedKeyPaths.slice(0, 40) : [],
        byteStart: Number(item.startOffset) || 0,
        byteEnd: Number(item.endOffset) || 0,
        parentFieldPath: parent.parentFieldPath,
        parentFieldNumbers: parent.parentFieldNumbers,
        objectDirectProtobufFields: { field1: null, field5: null, field6: null, field10: null },
        parentEnvelopeFields: parent.envelopeFields,
        objectLocalNumericCandidates: tableCandidates.filter(entry => entry.provenance !== 'FRAME_ONLY').map(entry => entry.value).slice(0, 16),
        objectLocalPrintableStrings: item.identity ? Object.values(item.identity).map(entry => entry?.value).filter(value => typeof value === 'string' && value.length <= 120).slice(0, 20) : [],
        tableIdentityCandidates: tableCandidates.slice(0, 32),
        shoeIdentityCandidates: shoeCandidates.slice(0, 16),
        roundIdentityCandidates: roundCandidates.slice(0, 32),
        rawPlayer,
        rawBanker,
        cardLikeRepresentation: { player: rawPlayer, banker: rawBanker, present: hasCards },
        outcomeLikeValues: outcome,
        parentLengthDelimitedBoundaries: parent.parentLengthDelimitedBoundaries,
        parentNumericVarints: parent.parentNumericVarints,
        parentPrintableIdentityStrings: parent.parentPrintableIdentityStrings,
        identityProvenance: { table: tableCandidates.map(entry => entry.provenance), shoe: shoeCandidates.map(entry => entry.provenance), round: roundCandidates.map(entry => entry.provenance) },
        exactAssociation: hasExactAssociation,
        ancestry: parent.ancestry,
        nearestTableAncestor: parent.nearestTableAncestor ? { depth: parent.nearestTableAncestor.depth, fieldPath: parent.nearestTableAncestor.fieldPath, byteStart: parent.nearestTableAncestor.byteStart, byteEnd: parent.nearestTableAncestor.byteEnd, candidateValues: parent.nearestTableAncestor.local.tableCandidates, provenance: 'PARENT_LOCAL' } : null,
        nearestShoeAncestor: parent.nearestShoeAncestor ? { depth: parent.nearestShoeAncestor.depth, fieldPath: parent.nearestShoeAncestor.fieldPath, byteStart: parent.nearestShoeAncestor.byteStart, byteEnd: parent.nearestShoeAncestor.byteEnd, candidateValues: parent.nearestShoeAncestor.local.shoeCandidates, provenance: 'PARENT_LOCAL' } : null,
        nearestRoundAncestor: parent.nearestRoundAncestor ? { depth: parent.nearestRoundAncestor.depth, fieldPath: parent.nearestRoundAncestor.fieldPath, byteStart: parent.nearestRoundAncestor.byteStart, byteEnd: parent.nearestRoundAncestor.byteEnd, candidateValues: parent.nearestRoundAncestor.local.roundCandidates, provenance: 'PARENT_LOCAL' } : null,
        localTableCandidates: tableCandidates.filter(entry => entry.provenance !== 'FRAME_ONLY').map(entry => entry.value),
        localShoeCandidates: shoeCandidates.filter(entry => entry.provenance !== 'FRAME_ONLY').map(entry => entry.value),
        localRoundCandidates: roundCandidates.filter(entry => entry.provenance !== 'FRAME_ONLY').map(entry => entry.value),
        repeatedSiblingBlocks: structuralBlocks,
        matchedLiveAnchor: Boolean(matchedAnchor),
        anchorChainId: matchedAnchor?.chainId || null,
        associationReason: matchedAnchor ? 'exact-live-anchor-candidate' : 'not-proven'
      };
      if (association.cardObjects.length < 64) association.cardObjects.push({ cardObjectPath: item.nestedKeyPaths?.[0] || `embedded[${item.objectIndex}]`, playerRaw: rawPlayer, bankerRaw: rawBanker, roundIdentity: objectRoundForAssociation || roundCandidates.find(candidate => candidate.provenance !== 'FRAME_ONLY')?.value || null, shoeIdentity: objectShoeForAssociation || shoeCandidates.find(candidate => candidate.provenance !== 'FRAME_ONLY')?.value || null, ancestry: parent.ancestry, nearestTableAncestor: evidence.nearestTableAncestor, nearestShoeAncestor: evidence.nearestShoeAncestor, nearestRoundAncestor: evidence.nearestRoundAncestor, localTableCandidates: evidence.localTableCandidates, localShoeCandidates: evidence.localShoeCandidates, localRoundCandidates: evidence.localRoundCandidates, matchedLiveAnchor: evidence.matchedLiveAnchor, exactAssociation: evidence.exactAssociation, associationReason: evidence.associationReason });
      dgEvidencePush('initializationObjectAssociationEvidence', evidence);
      summaryState.objectCount += 1;
      if (tableCandidates.some(entry => entry.provenance === 'DIRECT_OBJECT_FIELD')) summaryState.directObjectTableIdentityCount += 1;
      else if (tableCandidates.some(entry => entry.provenance === 'DIRECT_PARENT_FIELD')) summaryState.directParentTableIdentityCount += 1;
      else if (tableCandidates.some(entry => entry.provenance === 'FRAME_ONLY')) summaryState.frameOnlyTableIdentityCount += 1;
      if (roundCandidates.some(entry => entry.provenance === 'DIRECT_OBJECT')) summaryState.directObjectRoundCount += 1;
      else if (roundCandidates.some(entry => entry.provenance === 'DIRECT_PARENT')) summaryState.directParentRoundCount += 1;
      else if (roundCandidates.some(entry => entry.provenance === 'FRAME_ONLY')) summaryState.frameOnlyRoundCount += 1;
      if (shoeCandidates.some(entry => entry.provenance === 'DIRECT_OBJECT')) summaryState.directObjectShoeCount += 1;
      else if (shoeCandidates.some(entry => entry.provenance === 'DIRECT_PARENT')) summaryState.directParentShoeCount += 1;
      else if (shoeCandidates.some(entry => entry.provenance === 'FRAME_ONLY')) summaryState.frameOnlyShoeCount += 1;
      if (hasCards) summaryState.objectsWithCards += 1;
      if (outcome.length) summaryState.objectsWithOutcome += 1;
      if (hasExactAssociation) summaryState.objectsWithExactAssociation += 1;
    }
    if (state.dgDataProbe.initializationObjectAssociationEvidence.length >= DG_EVIDENCE_LIMITS.initializationObjectAssociationEvidence) summaryState.truncated = true;
  }
  function dgCaptureInboundCardParentEnvelopeEvidence(value, text, embeddedEvidence, detail = {}) {
    const summaries = Array.isArray(embeddedEvidence?.summaries) ? embeddedEvidence.summaries : [];
    const frameRounds = Array.from(new Set((String(text || '').match(/(?:\d{8,}R\d{1,8}|R\d{1,12})/gi) || []).slice(0, 12)));
    for (const summary of summaries.filter(item => item?.identity?.player || item?.identity?.banker).slice(0, 12)) {
      const parent = dgInboundParentWireSummary(value, summary.startOffset, summary.endOffset);
      dgObserveBinaryRoomMetadata(detail, parent, summary.identity?.round?.value || frameRounds[0] || null);
      const objectRound = summary.identity?.round?.value || null;
      const objectShoe = summary.identity?.shoe?.value || null;
      const evidence = { chainId: detail.chainId || null, sequence: Number(detail.sequence) || null, processSequence: Number(detail.processSequence) || null, timestamp: Number(detail.timestamp) || Date.now(), socketGeneration: Number(detail.socketGeneration) || null, byteLength: Number(detail.frameByteLength) || dgBinaryLength(value), rawPlayer: summary.identity?.player?.value || null, rawBanker: summary.identity?.banker?.value || null, roundIdentity: objectRound || frameRounds[0] || null, shoeIdentity: objectShoe || (frameRounds[0] ? dgShoeIdentity(frameRounds[0]) : null), objectIndex: summary.objectIndex, objectStartOffset: summary.startOffset, objectEndOffset: summary.endOffset, parentFieldPath: parent.parentFieldPath, parentFieldNumbers: parent.parentFieldNumbers, parentLengthDelimitedBoundaries: parent.parentLengthDelimitedBoundaries, parentNumericVarints: parent.parentNumericVarints, parentPrintableIdentityStrings: parent.parentPrintableIdentityStrings, envelopeFields: parent.envelopeFields, frameNumericIdentityCandidates: parent.frameNumericIdentityCandidates, frameRoundIdentityCandidates: frameRounds };
      dgEvidencePush('dgInboundCardParentEnvelopeEvidence', evidence);
      const firstSeenKey = [evidence.shoeIdentity || '', evidence.roundIdentity || '', evidence.envelopeFields?.field6 || '', evidence.rawPlayer || '', evidence.rawBanker || ''].join('|');
      dgEvidencePushFirstSeen('dgInboundCardParentEnvelopeFirstSeenEvidence', firstSeenKey, evidence);
    }
  }
  function dgPacketNativeIdentity(value, embeddedEvidence, selectedIndex) {
    const summaries = Array.isArray(embeddedEvidence?.summaries)
      ? embeddedEvidence.summaries.filter(item => item?.identity?.player || item?.identity?.banker)
      : [];
    if (summaries.length !== 1 || selectedIndex !== summaries[0]?.objectIndex) return null;
    const selected = summaries[0];
    const parent = dgInboundParentWireSummary(value, selected.startOffset, selected.endOffset);
    const field1 = Number(parent.envelopeFields?.field1);
    const field6 = normalizeTableId(parent.envelopeFields?.field6);
    const field10 = Number(parent.envelopeFields?.field10);
    if (!field6 || ![1002, 1003].includes(field1)) return null;
    return {
      tableId: field6,
      source: 'packet-envelope-field6',
      envelopeField1: field1,
      envelopeField6: field6,
      envelopeField10: Number.isFinite(field10) ? field10 : null,
      parentFieldPath: parent.parentFieldPath,
      parentFieldNumbers: parent.parentFieldNumbers
    };
  }
  function dgNormalizeCardString(value) {
    if (typeof value !== 'string') return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    const cards = parts.map(part => {
      const id = Number(part);
      return id === 0 ? null : Number.isInteger(id) && id >= 1 && id <= 52 ? id : undefined;
    });
    return cards.some(card => card === undefined) ? null : cards;
  }

  function dgRoundIndex(roundIdentity) {
    const match = String(roundIdentity || '').match(/R(\d+)$/i);
    return match ? Number(match[1]) : null;
  }

  function dgShoeIdentity(roundIdentity) {
    const value = String(roundIdentity || '');
    const marker = value.lastIndexOf('R');
    if (marker <= 0) return null;
    const identity = value.slice(0, marker);
    return /^\d+$/.test(identity) ? identity : null;
  }

  function dgSessionIsNewer(incoming, current) {
    if (!incoming || !current) return Boolean(incoming);
    if (incoming === current) return false;
    if (!/^\d+$/.test(incoming) || !/^\d+$/.test(current)) return false;
    return incoming.length > current.length ||
      (incoming.length === current.length && incoming > current);
  }

  function dgExtractContext(text) {
    const mapping = /"tableId"\s*:\s*(\d+)\s*,\s*"tableName"\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = mapping.exec(text))) {
      const tableId = normalizeTableId(match[1]);
      const tableName = normalizeTableName(match[2]);
      if (tableId && tableName) state.dg.tableMap.set(tableName, tableId);
    }
    const envelopes = Array.from(text.matchAll(/BAC(\d{3})[\s\S]{0,20}?([A-Z]{2}\d{2})/g));
    state.dg.lastEnvelopeTableIds = Array.from(new Set(envelopes
      .map(item => normalizeTableId(state.dg.tableMap.get(normalizeTableName(item[2]))))
      .filter(Boolean))).slice(0, 16);
    const preferredTableId = normalizeTableId(state.activeTableId || state.dg.tableId);
    const matching = envelopes.filter(item => {
      const name = normalizeTableName(item[2]);
      return preferredTableId && state.dg.tableMap.get(name) === preferredTableId;
    });
    const mapped = envelopes.filter(item => state.dg.tableMap.has(normalizeTableName(item[2])));
    // With no trusted active table, accept only a unique envelope that resolves
    // through the verified mapping; never use arbitrary envelopes[0].
    const envelope = matching[0] || (mapped.length === 1 ? mapped[0] : null);
    if (envelope) {
      const tableName = normalizeTableName(envelope[2]);
      const tableId = state.dg.tableMap.get(tableName);
      if (tableName && tableId && (!state.dg.ownership.tableId || dgOwnsIdentity(tableId))) {
        state.dg.tableName = tableName;
        state.dg.tableId = tableId;
      }
    }
  }

  function dgDecodeBinaryFrame(value, suppliedText = null, embeddedEvidence = null) {
    const text = suppliedText ?? dgBytesToText(value);
    if (!text || text.length > DG_MAX_FRAME_BYTES || !dgHasCheapRoundMarkers(text)) return null;
    dgExtractContext(text);
    const roundMatch = text.match(DG_ROUND_MARKER);
    const roundIdentity = roundMatch ? roundMatch[0] : null;
    const jsonCandidates = dgExtractJsonObjects(text, success => {
      dgDiagnosticCheckpoint(success ? 'DG_JSON_PARSE_OK' : 'DG_JSON_PARSE_FAIL', { byteLength: text.length });
    });
    const selectedIndex = jsonCandidates.findIndex(item =>
      typeof item?.banker === 'string' && typeof item?.player === 'string'
    );
    const json = selectedIndex >= 0 ? jsonCandidates[selectedIndex] : null;
    const packetIdentity = selectedIndex >= 0
      ? dgPacketNativeIdentity(value, embeddedEvidence, selectedIndex)
      : null;
    dgEvidencePush('objectSelectionEvidence', {
      roundIdentity,
      candidateCount: jsonCandidates.length,
      selectedIndex: selectedIndex >= 0 ? selectedIndex : null,
      candidateKeySets: jsonCandidates.slice(0, 12).map(item => dgProbeKeys(item, 40)),
      selectedPlayer: json ? { type: typeof json.player, length: typeof json.player === 'string' ? json.player.length : null, slots: dgDiagnosticSlotStatus(json.player) } : null,
      selectedBanker: json ? { type: typeof json.banker, length: typeof json.banker === 'string' ? json.banker.length : null, slots: dgDiagnosticSlotStatus(json.banker) } : null
    });
    if (selectedIndex >= 0) {
      const selected = embeddedEvidence?.summaries?.[selectedIndex] || null;
      dgEvidencePush('selectedObjectEvidence', {
        chainId: embeddedEvidence?.chainId || null,
        frameByteLength: dgBinaryLength(value),
        selectedObjectIndex: selectedIndex,
        startOffset: selected?.startOffset ?? null,
        endOffset: selected?.endOffset ?? null,
        objectLength: selected?.objectLength ?? null,
        topLevelKeys: selected?.topLevelKeys || dgProbeKeys(json, 40),
        identity: selected?.identity || dgEmbeddedIdentity(json),
        otherObjectIdentitySummary: (embeddedEvidence?.summaries || []).filter(item => item.objectIndex !== selectedIndex).slice(0, 11).map(item => ({ objectIndex: item.objectIndex, startOffset: item.startOffset, endOffset: item.endOffset, identity: item.identity, topLevelKeys: item.topLevelKeys.slice(0, 20) }))
      });
    }
    const player = dgNormalizeCardString(json?.player);
    const banker = dgNormalizeCardString(json?.banker);
    dgDiagnosticCheckpoint('DG_EXTRACT_RESULT', {
      roundFound: Boolean(roundIdentity),
      jsonFound: Boolean(json),
      playerSlots: dgDiagnosticSlotStatus(player || json?.player),
      bankerSlots: dgDiagnosticSlotStatus(banker || json?.banker),
      tableId: packetIdentity?.tableId || null,
      packetIdentitySource: packetIdentity?.source || null,
      roundIdentity: roundIdentity || null
    });
    if (!json || !roundIdentity || !packetIdentity) return null;
    if (!player || !banker) return null;
    return {
      tableName: state.dg.tableName,
      tableId: packetIdentity.tableId,
      packetIdentity,
      roundIdentity,
      shoeIdentity: dgShoeIdentity(roundIdentity),
      player,
      banker,
      rawJson: json,
      text
    };
  }

  function dgMergeFrame(decoded) {
    const tableId = normalizeTableId(decoded.tableId);
    if (!tableId || !decoded.roundIdentity) return null;
    const key = `${tableId}|${decoded.roundIdentity}`;
    const hadPrevious = state.dg.rounds.has(key);
    const previous = state.dg.rounds.get(key) || { tableId, roundIdentity: decoded.roundIdentity, player: [null, null, null], banker: [null, null, null] };
    const player = previous.player.map((value, index) => decoded.player[index] ?? value);
    const banker = previous.banker.map((value, index) => decoded.banker[index] ?? value);
    const changed = !hadPrevious || player.some((value, index) => value !== previous.player[index]) || banker.some((value, index) => value !== previous.banker[index]);
    const merged = {
      ...previous,
      tableName: decoded.tableName || previous.tableName || null,
      shoeIdentity: decoded.shoeIdentity || previous.shoeIdentity || null,
      player,
      banker
    };
    if (changed) state.dg.rounds.set(key, merged);
    const result = [merged.player[0], merged.banker[0], merged.player[1], merged.banker[1], merged.player[2], merged.banker[2]];
    const hasAnyCard = result.some(value => Number(value) > 0);
    const baseComplete = result[0] > 0 && result[1] > 0 && result[2] > 0 && result[3] > 0;
    const finalized = dgIsBaccaratRoundFinalized(getPlayerCards(result), getBankerCards(result));
    return { ...merged, result, changed, hasAnyCard, complete: baseComplete && finalized, roundIndex: dgRoundIndex(merged.roundIdentity), shoeIdentity: dgShoeIdentity(merged.roundIdentity) };
  }

  function dgNormalizeToCore(merged) {
    return {
      __bpSource: 'dg-binary',
      __bpFinalized: Boolean(merged.complete),
      __bpShoeTrusted: true,
      body: {
        result: merged.result,
        table_id: merged.tableId,
        shoe: merged.shoeIdentity,
        round: merged.roundIdentity,
        round_index: merged.roundIndex
      }
    };
  }

  function dgDispatchCardStatus(cards) {
    return Array.isArray(cards) ? cards.slice(0, 3).map(card => {
      if (card === null || card === undefined) return 'missing';
      if (Number(card) === 0) return 'zero';
      return Number.isInteger(Number(card)) && Number(card) >= 1 && Number(card) <= 52 ? 'valid' : 'invalid';
    }) : ['missing', 'missing', 'missing'];
  }

  function dgDispatchChainCheckpoint(chainId, eventType, details = {}) {
    const capture = state.dgDataProbe.initialization;
    const startedAt = Number(capture.startedAt) || 0;
    const checkpoint = {
      chainId: String(chainId || '').slice(0, 80),
      processElapsedMs: startedAt ? Math.max(0, Date.now() - startedAt) : null,
      initializationActive: Boolean(capture.active),
      initializationFrameCount: Number(capture.frameCount) || 0,
      ...details
    };
    dgDiagnosticCheckpoint(eventType, checkpoint);
    if (eventType === 'DG_DISPATCH_GATE') dgEvidencePush('dispatchEvidence', checkpoint);
  }

  function processDgBinary(value, flags = {}) {
    const byteLength = dgBinaryLength(value);
    const capture = state.dgDataProbe.initialization;
    capture.processSequence = Number(capture.processSequence || 0) + 1;
    const chainId = `dg-${capture.processSequence}`;
    dgDispatchChainCheckpoint(chainId, 'DG_CHAIN_ENTER', {
      byteLength,
      valueType: Array.isArray(value) ? 'array' : value?.constructor?.name || typeof value
    });
    dgDiagnosticCheckpoint('DG_PROCESS_BINARY_ENTER', {
      byteLength,
      valueType: Array.isArray(value) ? 'array' : value?.constructor?.name || typeof value
    });
    if (byteLength > DG_MAX_FRAME_BYTES) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'frame-too-large' });
      return false;
    }
    const text = dgBytesToText(value);
    if (!text) {
      if (byteLength > 100) {
        dgEvidencePush('binaryFramingEvidence', dgBinaryFramingSummary(value, '', {
          chainId,
          processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
          captureReason: 'text-decode-fail'
        }));
      }
      dgDiagnosticCheckpoint('DG_BINARY_TEXT_DECODE_FAIL', { byteLength });
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'text-decode-fail' });
      return false;
    }
    dgDispatchChainCheckpoint(chainId, 'DG_CHAIN_TEXT_DECODE_OK', { byteLength, textLength: text.length });
    dgDiagnosticCheckpoint('DG_BINARY_TEXT_DECODE_OK', { byteLength, textLength: text.length });
    const embeddedEvidence = dgCaptureEmbeddedObjectEvidence(value, text, {
      chainId,
      processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null
    });
    const v9Metadata = {
      socketGeneration: Number(flags.socketGeneration) || null,
      sequence: Number(flags.sequence) || null,
      processSequence: capture.processSequence,
      timestamp: Number(flags.timestamp) || Date.now(),
      frameId: flags.frameId || DISCOVERY_FRAME_ID,
      socketIdentity: flags.socketIdentity || null,
      runtimeInstanceId: DISCOVERY_FRAME_ID,
      chainId,
      frameByteLength: byteLength
    };
    dgV9ObserverSafe('initialization-object-association', () => dgInitializationObjectAssociationEvidence(value, text, embeddedEvidence, v9Metadata));
    dgV9ObserverSafe('backend-identity-association', () => {
      for (const summary of (embeddedEvidence?.summaries || []).slice(0, 12)) {
        const parent = dgInboundParentWireSummary(value, summary.startOffset, summary.endOffset);
        dgObserveBackendIdentityAssociation(v9Metadata, parent, {
          tableId: parent?.envelopeFields?.field6,
          roundIdentity: summary.identity?.round?.value || null,
          shoeIdentity: summary.identity?.shoe?.value || null,
          nestedObjectPath: `embedded[${Number(summary.objectIndex) || 0}]`
        });
      }
    });
    dgV9ObserverSafe('card-stream', () => dgV9ObserveCards(embeddedEvidence?.summaries || [], v9Metadata));
    dgV9ObserverSafe('inbound-parent-envelope', () => dgCaptureInboundCardParentEnvelopeEvidence(value, text, embeddedEvidence, v9Metadata));
    const inboundRoundMatch = text.match(DG_ROUND_MARKER);
    const inboundCardObjects = (embeddedEvidence?.summaries || [])
      .filter(item => item?.identity?.player || item?.identity?.banker)
      .slice(0, 12)
      .map(item => ({
        player: item.identity?.player?.value ?? null,
        banker: item.identity?.banker?.value ?? null
    }));
    dgExtractContext(text);
    dgV9ObserverSafe('inbound-envelope', () => dgV9ObserveInboundEnvelope({ ...v9Metadata, tableId: state.dg.tableId, tableName: state.dg.tableName, roundIdentity: inboundRoundMatch?.[0] || null, family: 'inbound-context' }));
    const framingMarkerPlayer = DG_PLAYER_MARKER.test(text);
    const framingMarkerBanker = DG_BANKER_MARKER.test(text);
    let framingEvidenceCaptured = false;
    if ((framingMarkerPlayer && framingMarkerBanker) || (byteLength >= 500 && byteLength <= 1200)) {
      dgEvidencePush('binaryFramingEvidence', dgBinaryFramingSummary(value, text, {
        chainId,
        processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
        captureReason: framingMarkerPlayer && framingMarkerBanker ? 'player-banker-marker' : 'size-range',
        markerPlayer: framingMarkerPlayer,
        markerBanker: framingMarkerBanker,
        markerRound: DG_ROUND_MARKER.test(text)
      }));
      framingEvidenceCaptured = true;
    }
    if (!dgHasCheapRoundMarkers(text)) {
      dgTableSelectionAddInbound({ timestamp: Date.now(), chainId, tableId: normalizeTableId(state.dg.tableId), tableName: state.dg.tableName, roundIdentity: inboundRoundMatch?.[0] || null, family: 'marker-reject', cardObjects: inboundCardObjects });
      const markerEvidence = {
        textLength: text.length,
        markerRound: DG_ROUND_MARKER.test(text),
        markerPlayer: DG_PLAYER_MARKER.test(text),
        markerBanker: DG_BANKER_MARKER.test(text),
        contextTableId: normalizeTableId(state.dg.tableId),
        largeFrame: text.length >= 900,
        structure: text.length >= 900 ? dgInitializationPayloadSummary(text, false) : null
      };
      if (markerEvidence.largeFrame) {
        dgEvidencePush('largeFrameStructures', {
          chainId,
          processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
          byteLength,
          textLength: text.length,
          markerRound: markerEvidence.markerRound,
          markerPlayer: markerEvidence.markerPlayer,
          markerBanker: markerEvidence.markerBanker,
          contextTableId: markerEvidence.contextTableId,
          structure: markerEvidence.structure
        });
      }
      dgDispatchChainCheckpoint(chainId, 'DG_MARKER_REJECT_EVIDENCE', markerEvidence);
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'marker-reject', ...markerEvidence });
      return false;
    }
    const tableBeforeDecode = state.dg.tableId;
    const decoded = dgDecodeBinaryFrame(value, text, embeddedEvidence);
    if (!decoded || !decoded.tableId) {
      if (!framingEvidenceCaptured && byteLength > 100) {
        dgEvidencePush('binaryFramingEvidence', dgBinaryFramingSummary(value, text, {
          chainId,
          processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
          captureReason: 'decoder-reject',
          markerPlayer: framingMarkerPlayer,
          markerBanker: framingMarkerBanker,
          markerRound: DG_ROUND_MARKER.test(text)
        }));
      }
      dgDispatchChainCheckpoint(chainId, 'DG_CHAIN_EXTRACT', {
        foundRound: Boolean(decoded?.roundIdentity),
        tableId: normalizeTableId(decoded?.tableId),
        shoeIdentity: decoded?.shoeIdentity || null,
        roundIdentity: decoded?.roundIdentity || null,
        playerCards: dgDispatchCardStatus(decoded?.player),
        bankerCards: dgDispatchCardStatus(decoded?.banker),
        extractAccepted: false
      });
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'decoder-reject' });
      dgTableSelectionAddInbound({ timestamp: Date.now(), chainId, tableId: normalizeTableId(decoded?.tableId), tableName: decoded?.tableName || null, roundIdentity: decoded?.roundIdentity || inboundRoundMatch?.[0] || null, family: 'decoder-reject', cardObjects: inboundCardObjects });
      return false;
    }
    dgTableSelectionAddInbound({ timestamp: Date.now(), chainId, tableId: normalizeTableId(decoded.tableId), tableName: decoded.tableName || null, roundIdentity: decoded.roundIdentity || null, family: 'decoded-card-stream', cardObjects: inboundCardObjects });
    dgDispatchChainCheckpoint(chainId, 'DG_CHAIN_EXTRACT', {
      foundRound: Boolean(decoded.roundIdentity),
      tableId: normalizeTableId(decoded.tableId),
      shoeIdentity: decoded.shoeIdentity || null,
      roundIdentity: decoded.roundIdentity || null,
      playerCards: dgDispatchCardStatus(decoded.player),
      bankerCards: dgDispatchCardStatus(decoded.banker),
      extractAccepted: true
    });
    const incomingSocketKey = dgSocketKey({
      runtimeInstanceId: flags.runtimeInstanceId || DISCOVERY_FRAME_ID,
      socketGeneration: flags.socketGeneration,
      socketIdentity: flags.socketIdentity
    });
    const activeSocketKey = state.dg.lifecycle.activeSocketKey;
    if (activeSocketKey && (!incomingSocketKey || incomingSocketKey !== activeSocketKey)) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', {
        dispatch: false,
        reason: !incomingSocketKey ? 'missing-socket-instance' : 'stale-socket-instance',
        activeSocketKey,
        incomingSocketKey,
        decodedTableId: normalizeTableId(decoded.tableId),
        roundIdentity: decoded.roundIdentity,
        shoeIdentity: decoded.shoeIdentity
      });
      state.ignoredForeignTablePackets += 1;
      return false;
    }
    const ownerTableId = normalizeTableId(state.dg.ownership.tableId);
    const envelopeTableIds = Array.isArray(state.dg.lastEnvelopeTableIds) ? state.dg.lastEnvelopeTableIds : [];
    if (!ownerTableId || !dgOwnsIdentity(decoded.tableId) || (envelopeTableIds.length > 0 && !envelopeTableIds.includes(ownerTableId))) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', {
        dispatch: false,
        reason: !ownerTableId ? 'unverified-table-ownership' : 'foreign-table-ownership',
        ownerTableId,
        decodedTableId: normalizeTableId(decoded.tableId),
        envelopeTableIds,
        roundIdentity: decoded.roundIdentity,
        shoeIdentity: decoded.shoeIdentity
      });
      state.ignoredForeignTablePackets += 1;
      return false;
    }
    if (tableBeforeDecode && decoded.tableId !== tableBeforeDecode) {
      if (state.activeTableSource === 'dg-binary') {
        dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'table-mismatch', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity, shoeIdentity: decoded.shoeIdentity });
        return false;
      }
      state.dg.rounds.clear();
      state.dg.shoeIdentity = null;
      state.dg.shoeGeneration += 1;
    }
    const active = normalizeTableId(state.activeTableId);
    if (active && state.activeTableSource !== 'dg-binary' && active !== decoded.tableId) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'active-table-mismatch', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity, shoeIdentity: decoded.shoeIdentity });
      return false;
    }
    if (active && state.activeTableSource === 'dg-binary' && active !== decoded.tableId) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'active-dg-table-mismatch', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity, shoeIdentity: decoded.shoeIdentity });
      return false;
    }
    const incomingShoe = decoded.shoeIdentity;
    if (!incomingShoe) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'missing-shoe', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity });
      return false;
    }
    if (state.dg.shoeIdentity && incomingShoe !== state.dg.shoeIdentity && !dgSessionIsNewer(incomingShoe, state.dg.shoeIdentity)) {
      state.dg.error = 'stale-dg-shoe-frame-ignored';
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'stale-shoe', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity, shoeIdentity: incomingShoe });
      return false;
    }
    if (state.dg.shoeIdentity !== incomingShoe) {
      if (state.dg.shoeIdentity) {
        dgHistoricalAssociationFreeze('confirmed-shoe-switch');
        if (isTopWindow) dgPersistenceClear('CLEAR_NEW_SHOE', 'verified-new-shoe', decoded.tableId, incomingShoe);
      }
      state.dg.shoeIdentity = incomingShoe;
      state.dg.shoeGeneration += 1;
      const retainedPendingSnapshots = state.modelEstimate.pendingRoadSnapshots.slice(-4);
      dgModelEstimateReset('SHOE_CHANGED', retainedPendingSnapshots);
      dgModelEstimateBindPendingRoadSnapshots(normalizeTableId(decoded.tableId), incomingShoe);
      state.dg.rounds.clear();
      state.dgCanonicalOwner.requestKey = null;
      state.dgCanonicalOwner.requestId = null;
      state.dgCanonicalOwner.responseAccepted = false;
      state.dgCanonicalOwner.restoredRoundKeys.clear();
      state.dgCanonicalOwner.conflictRoundKeys.clear();
    }
    dgCanonicalOwnerRequest(decoded.tableId, incomingShoe);
    dgPersistenceRestoreIfEligible(decoded.tableId, incomingShoe);
    dgPublishVerifiedRecordProbeContext(decoded);
    const mergeKey = `${normalizeTableId(decoded.tableId)}|${decoded.roundIdentity}`;
    const hadPrevious = state.dg.rounds.has(mergeKey);
    const merged = dgMergeFrame(decoded);
    if (!merged) {
      dgDispatchChainCheckpoint(chainId, 'DG_MERGE_RESULT', { changed: false, hasAnyCard: false, complete: false, roundEvent: 'merge-reject', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity, shoeIdentity: incomingShoe });
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', { dispatch: false, reason: 'merge-reject', tableId: decoded.tableId, roundIdentity: decoded.roundIdentity, shoeIdentity: incomingShoe });
      return false;
    }
    dgDispatchChainCheckpoint(chainId, 'DG_MERGE_RESULT', {
      changed: Boolean(merged.changed),
      hasAnyCard: Boolean(merged.hasAnyCard),
      complete: Boolean(merged.complete),
      roundEvent: hadPrevious ? 'round-update' : 'new-round-candidate',
      tableId: merged.tableId,
      roundIdentity: merged.roundIdentity,
      shoeIdentity: merged.shoeIdentity,
      playerCards: dgDispatchCardStatus(merged.player),
      bankerCards: dgDispatchCardStatus(merged.banker)
    });
    dgEvidencePush('roundEvolution', {
      chainId,
      processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
      tableId: merged.tableId,
      shoeIdentity: merged.shoeIdentity,
      roundIdentity: merged.roundIdentity,
      roundEvent: hadPrevious ? 'round-update' : 'new-round-candidate',
      changed: Boolean(merged.changed),
      hasAnyCard: Boolean(merged.hasAnyCard),
      complete: Boolean(merged.complete),
      playerCards: dgDispatchCardStatus(merged.player),
      bankerCards: dgDispatchCardStatus(merged.banker)
    });
    const selectedForChain = embeddedEvidence?.summaries?.find(item => item.objectIndex === (state.dgDataProbe.selectedObjectEvidence.slice().reverse().find(item => item.chainId === chainId)?.selectedObjectIndex ?? -1));
    dgEvidencePush('cardProgressionEvidence', {
      chainId,
      processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
      candidateKey: `${merged.tableId || ''}|${merged.shoeIdentity || ''}|${merged.roundIdentity || ''}`,
      tableId: merged.tableId,
      shoeIdentity: merged.shoeIdentity,
      roundIdentity: merged.roundIdentity,
      progressionStage: merged.complete ? 'complete' : !hadPrevious ? 'first-seen' : merged.changed ? 'card-update' : 'unchanged',
      firstSeen: !hadPrevious,
      cardUpdate: Boolean(hadPrevious && merged.changed),
      complete: Boolean(merged.complete),
      playerCards: dgDispatchCardStatus(merged.player),
      bankerCards: dgDispatchCardStatus(merged.banker),
      selectedObjectIndex: selectedForChain?.objectIndex ?? null,
      startOffset: selectedForChain?.startOffset ?? null,
      endOffset: selectedForChain?.endOffset ?? null
    });
    if (merged.complete) {
      const completeEvidence = {
        chainId,
        processElapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null,
        tableId: merged.tableId,
        shoeIdentity: merged.shoeIdentity,
        roundIdentity: merged.roundIdentity,
        roundEvent: hadPrevious ? 'round-update' : 'new-round-candidate',
        changed: Boolean(merged.changed),
        hasAnyCard: Boolean(merged.hasAnyCard),
        complete: true,
        playerCards: dgDispatchCardStatus(merged.player),
        bankerCards: dgDispatchCardStatus(merged.banker),
        initializationActive: Boolean(capture.active)
      };
      dgEvidencePush('completeCandidates', completeEvidence);
      if (capture.active) dgEvidencePush('initializationCompleteCandidates', completeEvidence);
      dgDispatchChainCheckpoint(chainId, 'DG_INIT_COMPLETE_CANDIDATE', {
        tableId: merged.tableId,
        roundIdentity: merged.roundIdentity,
        shoeIdentity: merged.shoeIdentity,
        playerCards: dgDispatchCardStatus(merged.player),
        bankerCards: dgDispatchCardStatus(merged.banker)
      });
    }
    try { observeDgDecoded(merged, decoded, chainId); } catch (_) {
      dgDispatchChainCheckpoint(chainId, 'DG_INIT_OBSERVER_ERROR', { complete: Boolean(merged.complete) });
    }
    if (merged.complete) {
      dgDispatchChainCheckpoint(chainId, 'DG_INIT_COMPLETE_AFTER_OBSERVER', {
        completeObserved: Boolean(capture.completeObserved),
        initializationActive: Boolean(capture.active),
        stopReason: capture.stopReason || null
      });
    }
    // A zero-card bootstrap, unchanged duplicate, or incomplete incremental
    // frame is consumed by DG, but must not dispatch into the shared core.
    // The core receives only a complete round after all required positions
    // have been resolved by the existing DG merge state.
    if (!merged.changed || !merged.hasAnyCard || !merged.complete) {
      dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', {
        dispatch: false,
        reason: !merged.changed ? 'unchanged' : !merged.hasAnyCard ? 'no-card' : 'incomplete',
        tableId: merged.tableId,
        roundIdentity: merged.roundIdentity,
        shoeIdentity: merged.shoeIdentity,
        complete: Boolean(merged.complete),
        playerCards: dgDispatchCardStatus(merged.player),
        bankerCards: dgDispatchCardStatus(merged.banker)
      });
      return true;
    }
    if (!state.activeTableId) switchActiveTable(merged.tableId, 'dg-binary');
    if (normalizeTableId(state.activeTableId) !== normalizeTableId(merged.tableId)) {
      dgDiagnosticCheckpoint('DG_DISPATCH_GATE', { dispatch: false, reason: 'post-switch-table-mismatch' });
      return false;
    }
    state.dg.decodedFrames += 1;
    state.dg.lastFrame = {
      tableId: decoded.tableId,
      tableName: decoded.tableName,
      roundIdentity: decoded.roundIdentity,
      player: decoded.player.slice(),
      banker: decoded.banker.slice(),
      complete: Boolean(merged.complete),
      socketKey: incomingSocketKey || null,
      socketGeneration: flags.socketGeneration || state.dg.ownership.socketGeneration || null,
      ownershipSequence: Number(state.dg.ownership.sequence) || null,
      receivedAt: Date.now()
    };
    state.dg.normalizedFrames += 1;
    dgModelEstimateTryInitialize(merged.tableId, merged.shoeIdentity);
    dgDispatchChainCheckpoint(chainId, 'DG_DISPATCH_GATE', {
      dispatch: true,
      reason: 'complete',
      tableId: merged.tableId,
      roundIdentity: merged.roundIdentity,
      shoeIdentity: merged.shoeIdentity,
      complete: Boolean(merged.complete),
      playerCards: dgDispatchCardStatus(merged.player),
      bankerCards: dgDispatchCardStatus(merged.banker)
    });
    if (!capture.firstDispatch) {
      capture.firstDispatch = { chainId, elapsedMs: capture.startedAt ? Math.max(0, Date.now() - capture.startedAt) : null, tableId: merged.tableId, roundIdentity: merged.roundIdentity, shoeIdentity: merged.shoeIdentity, playerCards: dgDispatchCardStatus(merged.player), bankerCards: dgDispatchCardStatus(merged.banker), frameCount: capture.frameCount };
      dgDispatchChainCheckpoint(chainId, 'DG_FIRST_DISPATCH_SOURCE', { ...capture.firstDispatch });
    }
    dgEvidencePush('sharedStateCorrelation', {
      chainId,
      phase: 'before-shared-core',
      tableId: merged.tableId,
      shoeIdentity: merged.shoeIdentity,
      roundIdentity: merged.roundIdentity,
      dgRoundMapSize: state.dg.rounds.size,
      dgShoeGeneration: state.dg.shoeGeneration,
      dgDecodedFrames: state.dg.decodedFrames,
      dgNormalizedFrames: state.dg.normalizedFrames,
      activeTableId: normalizeTableId(state.activeTableId),
      activeTableSource: state.activeTableSource || null,
      sharedRoundMapSize: state.rounds.size,
      sharedLastRound: state.lastRound ? String(state.lastRound).slice(0, 80) : null,
      runningCount: Number(state.runningCount) || 0
    });
    void handleShowPoker(dgNormalizeToCore(merged));
    return true;
  }

  function processLiveRaw(raw, flags = {}) {
    const text =
      String(raw || '');

    if (!text) {
      return;
    }

    let payload = null;

    try {
      payload =
        JSON.parse(text);
    } catch (_) {
      return;
    }

    const actionName =
      actionNameOf(payload);

    if (
      flags.showPoker ||
      /show_poker/i.test(text)
    ) {
      state.showPoker += 1;
      void handleShowPoker(payload);
      return;
    }

    if (
      /(?:^|\/)summary$/i.test(actionName) &&
      Array.isArray(parsePacket(payload).result)
    ) {
      void handleShowPoker({
        ...payload,
        __bpSource: 'summary',
        __bpFinalized: true
      });
      return;
    }
    if (
      flags.tableSvg ||
      /tablesvg/i.test(actionName)
    ) {
      void handleTablesvg(payload);
    }
  }

  window.addEventListener(
    HISTORY_TRANSPORT_EVENT,
    event => {
      const detail = event.detail || {};
      observeDgTransport(detail, detail.transport || 'fetch/xhr');
      const parsed = historyParsePayload(detail.raw);
      dgObserveNativeRecordRequest({ ...detail, parsed });
      captureHistoryTransport({
        ...detail,
        parsed
      });
      observeRoomEntryEvidence('transport', { ...detail, parsed });
    }
  );
  installHistoryTransportHooks();

  installActiveTableHandshakeTelemetry();
  installLobbyTableClickRouting();

  window.addEventListener(SOCKET_DIAGNOSTICS_EVENT, event => observeSocketDiagnostics(event.detail || {}));
  window.addEventListener(RECORD_PROBE_STATUS_EVENT, event => { const detail = event.detail || {}; dgStoreRecordOutboundSourceEvidence(detail); if (detail.inboundObservation) { state.recordProbeInboundDuringProbe.push(redactObject(detail.inboundObservation)); if (state.recordProbeInboundDuringProbe.length > 100) state.recordProbeInboundDuringProbe.splice(0, state.recordProbeInboundDuringProbe.length - 100); } if (detail.frameId) state.recordProbeLoaderFrames.set(String(detail.frameId), redactObject(detail)); if (detail.stage === 'game-socket-found') { state.recordProbeSocketFound = true; state.recordProbeSocketReadyState = Number(detail.readyState); } if (detail.stage === 'socket-missing') { state.recordProbeSocketFound = false; state.recordProbeSocketReadyState = null; } recordProbeStage(detail.stage || 'transport-status', { hydrationId: detail.hydrationId, requestedShoe: detail.requestedShoe, requestedRound: detail.requestedRound, readyState: detail.readyState, url: detail.url }); });

  window.addEventListener(
    EVENT_NAME,
    function (event) {
      const detail =
        event.detail || {};

      observeDgTransport(detail, 'WebSocket');
      processEarlyItem(detail);
    }
  );

  window.addEventListener(
    EARLY_EVENT_NAME,
    function (event) {
      const detail =
        event.detail || {};

      observeDgTransport(detail, 'WebSocket');
      processEarlyItem(detail);
    }
  );

  // Drain anything the Loader captured before Runtime finished downloading.
  try {
    const early =
      window[EARLY_STATE_KEY];

    if (
      early &&
      Array.isArray(early.messages)
    ) {
      const buffered =
        early.messages.splice(0);

      for (const item of buffered) {
        processEarlyItem(item);
      }
    }
  } catch (_) {}

  // Record Probe relay is available in every frame. Existing routing handlers remain unchanged.
  window.addEventListener('message', event => {
    const message = event.data;
    if (!message || typeof message !== 'object') return;
    if (message.type === DG_CANONICAL_OWNER_RESPONSE && isTopWindow) {
      const tableId = normalizeTableId(state.dg.ownership.tableId), shoeIdentity = String(state.dg.shoeIdentity || '');
      if (!window.opener || event.source !== window.opener) {
        dgCanonicalOwnerTelemetry('OWNER_RESPONSE_SOURCE_REJECT', { tableId, shoeIdentity, requestId: message.requestId, reason: 'source-not-opener' });
        return;
      }
      if (String(message.requestId || '') !== String(state.dgCanonicalOwner.requestId || '')) {
        dgCanonicalOwnerTelemetry('OWNER_RESPONSE_REQUEST_MISMATCH', { tableId, shoeIdentity, requestId: message.requestId, reason: 'request-id-mismatch' });
        return;
      }
      dgCanonicalOwnerTelemetry('OWNER_RESPONSE_RECEIVED', { tableId, shoeIdentity, requestId: message.requestId, roundCount: Array.isArray(message.snapshot?.canonicalRounds) ? message.snapshot.canonicalRounds.length : null });
      if (!tableId || !shoeIdentity || !dgOwnsIdentity(tableId) || !message.snapshot) {
        dgCanonicalOwnerTelemetry('OWNER_RESPONSE_VALIDATION_REJECT', { tableId, shoeIdentity, requestId: message.requestId, reason: !message.snapshot ? 'missing-snapshot' : 'ownership-or-context-unverified' });
        return;
      }
      const applied = dgCanonicalOwnerApplySnapshot(message.snapshot, tableId, shoeIdentity);
      if (applied) dgCanonicalOwnerTelemetry('OWNER_RESTORE_ACCEPT', { tableId, shoeIdentity, requestId: message.requestId, roundCount: state.dgCanonicalOwner.restoredRoundKeys.size, reason: 'loader-owner-snapshot-accepted' });
      else dgCanonicalOwnerTelemetry('OWNER_RESPONSE_VALIDATION_REJECT', { tableId, shoeIdentity, requestId: message.requestId, reason: 'snapshot-validation-failed' });
      return;
    }
    if (message.type === DG_SOCKET_INSTANCE_MESSAGE && message.identity && isTopWindow) {
      if (!dgTopAcceptsChildSource(event.source)) return;
      const identity = message.identity;
      if (!normalizeTableId(identity.tableId) || !identity.socketKey || ![19, 44].includes(Number(identity.field1)) || Number(identity.field10) !== 1) return;
      dgAdoptValidatedOwnership({
        tableId: identity.tableId,
        field1: identity.field1,
        field6: identity.field6,
        field10: identity.field10,
        sequence: identity.sequence,
        timestamp: identity.timestamp,
        socketGeneration: identity.socketGeneration,
        socketIdentity: identity.socketIdentity,
        runtimeInstanceId: identity.runtimeInstanceId,
        socketKey: identity.socketKey
      });
      return;
    }
    if (message.type === SOCKET_DIAGNOSTICS_REQUEST && message.requestId && !isTopWindow) {
      try {
        window.top.postMessage({ type: SOCKET_DIAGNOSTICS_RESPONSE, requestId: message.requestId, report: { frameId: DISCOVERY_FRAME_ID, frameUrl: roomEntrySafeUrl(location.href), isTopWindow: false, sockets: Array.from(state.socketDiagnostics.values()).map(item => ({ ...item })) } }, '*');
      } catch (_) {}
      return;
    }
    if (message.type === SOCKET_DIAGNOSTICS_RESPONSE && message.requestId && message.report && isTopWindow) {
      state.childSocketDiagnostics.set(String(message.report.frameId || message.requestId), { frameId: String(message.report.frameId || ''), frameUrl: roomEntrySafeUrl(message.report.frameUrl || ''), isTopWindow: false, sockets: Array.isArray(message.report.sockets) ? message.report.sockets : [] });
      return;
    }
    if (message.type === RECORD_PROBE_CONTEXT_MESSAGE && message.context) {
      state.recordProbeContext = message.context;
      if (isTopWindow) {
        state.recordProbeContextSource = event.source || null;
        void scheduleHistoricalHydration(message.context);
      }
      return;
    }
    if (message.type === RECORD_PROBE_REQUEST_MESSAGE && message.requestId && message.context && !isTopWindow) {
      const local = recordProbeContextFromLocalState(message.context.activeTableId);
      const merged = local ? { ...local, activeTableId: message.context.activeTableId } : message.context;
      const localSocket = recordProbeLocalSocketState();
      const childFrames = Array.from(document.querySelectorAll('iframe'));
      if (!localSocket.found && childFrames.length) {
        recordProbeStage('request-relay-to-child', { childFrames: childFrames.length, source: 'nested-child' });
        for (const frame of childFrames) {
          try {
            frame.contentWindow?.postMessage({ type: RECORD_PROBE_REQUEST_MESSAGE, requestId: message.requestId, context: merged }, '*');
          } catch (error) {
            recordProbeStage('exception', { message: String(error?.message || error) });
          }
        }
        return;
      }
      if (localSocket.found) recordProbeStage('game-socket-found', { readyState: localSocket.readyState, source: 'child-frame-page-hook' });
      void executeRecordProbe(merged).then(records => {
        recordProbeStage('child-report-sent', { records: records.length });
        try { window.top.postMessage({ type: RECORD_PROBE_REPORT_MESSAGE, requestId: message.requestId, report: { records, frameId: DISCOVERY_FRAME_ID, isTopWindow, stages: state.recordProbeStages.slice(-100), socketFound: Boolean(state.recordProbeSocketFound), socketReadyState: state.recordProbeSocketReadyState, lastException: state.recordProbeLastException } }, '*'); } catch (_) {}
      });
    }
  });

  window.addEventListener('message', event => {
    const message = event?.data;
    if (isTopWindow && message?.type === DG_DATA_PROBE_RECORD_MESSAGE && message.record) {
      dgProbeRecord({ ...message.record, sourceFrameId: message.record.frameId });
      return;
    }
    dgProbeRecord({
      transport: 'message',
      eventType: 'window-message',
      direction: 'inbound',
      messageType: typeof message === 'object' ? String(message?.type || '') : typeof message,
      payloadShape: dgProbeStructure(message),
      payloadKeys: dgProbeKeys(message)
    });
  });

  if (isTopWindow) {
    window.addEventListener('message', event => {
      const message = event.data;
      if (!message || typeof message !== 'object') return;
      if (message.type === RECORD_PROBE_CONTEXT_MESSAGE && message.context) {
        state.recordProbeContext = message.context;
        if (isTopWindow) state.recordProbeContextSource = event.source || null;
        return;
      }
      if (message.type === RECORD_PROBE_REQUEST_MESSAGE && message.requestId && message.context && !isTopWindow) {
        void executeRecordProbe(message.context).then(records => {
          recordProbeStage('child-report-sent', { records: records.length });
          try { window.top.postMessage({ type: RECORD_PROBE_REPORT_MESSAGE, requestId: message.requestId, report: { records, frameId: DISCOVERY_FRAME_ID, isTopWindow, stages: state.recordProbeStages.slice(-100), socketFound: Boolean(state.recordProbeSocketFound), socketReadyState: state.recordProbeSocketReadyState, lastException: state.recordProbeLastException } }, '*'); } catch (_) {}
        });
        return;
      }
      if (
        isTopWindow && message.type === RECORD_PROBE_REPORT_MESSAGE && message.requestId === state.recordProbeRequestId && message.report?.frameId
      ) {
        state.recordProbeReports.set(message.report.frameId, message.report);
        recordProbeStage('top-report-received', { frameId: message.report.frameId, records: Array.isArray(message.report.records) ? message.report.records.length : 0 });
        for (const stage of Array.isArray(message.report.stages) ? message.report.stages : []) {
          if (stage && stage.stage) recordProbeStage(stage.stage, { frameId: message.report.frameId });
        }
        return;
      }

      if (
        message.type === TABLE_MAPPING_RELAY_MESSAGE &&
        Array.isArray(message.entries)
      ) {
        const pendingTableName = normalizeTableName(
          state.pendingClickedTableName
        );
        const relayedCandidates = message.entries
          .filter(entry =>
            !pendingTableName ||
            normalizeTableName(entry?.tableName) === pendingTableName
          )
          .map(entry => normalizeTableId(entry?.tableId))
          .filter(Boolean);
        recordHandshakeStage('mapping-relay-received-top', {
          tableName: pendingTableName,
          candidateTableIds: relayedCandidates,
          entryCount: message.entries.length,
          sampleMappings: message.entries
        });
        applyTableNameMappings(message.entries);
        recordHandshakeStage('mapping-applied-top', {
          tableName: pendingTableName,
          candidateTableIds: relayedCandidates,
          entryCount: message.entries.length,
          sampleMappings: message.entries
        });
        if (message.relayId) {
          try {
            event.source?.postMessage({
              type: TABLE_MAPPING_ACK_MESSAGE,
              relayId: String(message.relayId)
            }, '*');
          } catch (_) {}
          clearPendingMappingRecord(String(message.relayId));
        }
        return;
      }

      if (
        message.type === TABLE_CLICK_MESSAGE &&
        message.tableName
      ) {
        recordHandshakeStage('click-relay-received-top', {
          clickId: message.clickId,
          tableName: message.tableName
        });
        applyLobbyTableClick(message.tableName);
        if (message.clickId) {
          try {
            event.source?.postMessage({
              type: TABLE_CLICK_ACK_MESSAGE,
              clickId: String(message.clickId)
            }, '*');
          } catch (_) {}
          recordHandshakeStage('click-ack-sent', {
            clickId: String(message.clickId),
            tableName: message.tableName
          });
          clearPendingClickRecord(String(message.clickId));
        }
        return;
      }

      if (
        message.type === FRAME_TABLESVG_MESSAGE &&
        message.payload
      ) {
        void handleTablesvg(message.payload);
        return;
      }

      if (
        message.type === 'BACCARAT_PULSE_FRAME_ROUND_V032' &&
        message.payload
      ) {
        if (!dgTopAcceptsChildSource(event.source)) return;
        void handleShowPoker(message.payload, message.dgIdentity || null);
      }
    });

    setInterval(
      async () => {
        const code =
          getSavedLicense();

        if (!code) {
          return;
        }

        const valid =
          await verifyLicense({
            force: true,
            allowPrompt: false
          });

        if (!valid) {
          removePanel();
        } else {
          render();
        }
      },
      LICENSE_CHECK_INTERVAL
    );
  }

  installWebSocketHook();
  installDgCurrentTableUiObserver();
  installDgTableSelectionObserver();
  installDgRoadStatObserver();
  reportDgExecutionProbe();

  // document-start, DOM ready, and load cover Safari's first navigation and
  // MT SPA/iframe creation timing without touching the WebSocket/counting flow.
  installStandaloneDgDataDebugButton();
  scheduleBootstrap();
  document.addEventListener('DOMContentLoaded', scheduleBootstrap, { once: true });
  window.addEventListener('load', scheduleBootstrap, { once: true });

})();
