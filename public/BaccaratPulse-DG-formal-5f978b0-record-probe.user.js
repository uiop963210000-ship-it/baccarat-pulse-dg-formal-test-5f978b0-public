// ==UserScript==
// @name         Baccarat Pulse - DG Formal Persistent Record Probe (5f978b0 base)
// @namespace    baccarat-pulse
// @version      0.2.0-debug
// @description  Persistent TZ -> DG launch diagnostic probe for iPhone
// @match        https://liu.tz6868.com/*
// @match        https://*.tz6868.com/*
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const VERSION = '0.2.0';
  const EVENT = 'bp-tz-dg-probe-v020';
  const STORE = '__BP_TZ_DG_LOG_V020__';
  const MAX_LOG = 100;

  // ============================================================
  // STORAGE
  // ============================================================

  function readLog() {
    try {
      return JSON.parse(localStorage.getItem(STORE) || '[]');
    } catch (_) {
      return [];
    }
  }

  function writeLog(list) {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify(list.slice(-MAX_LOG))
      );
    } catch (_) {}
  }

  function addLog(stage, detail = {}) {
    const list = readLog();

    list.push({
      ts: Date.now(),
      stage,
      ...detail
    });

    writeLog(list);
    updateButton();
  }

  function clearLog() {
    try {
      localStorage.removeItem(STORE);
    } catch (_) {}

    updateButton();
  }

  // ============================================================
  // URL SANITIZER
  // ============================================================

  function cleanUrl(value) {
    try {
      const u = new URL(String(value || ''), location.href);

      // 不保存 query/hash，避免 token 被記錄
      return u.origin + u.pathname;
    } catch (_) {
      return String(value || '')
        .split('?')[0]
        .split('#')[0]
        .slice(0, 300);
    }
  }

  // ============================================================
  // RECEIVE PAGE EVENTS
  // ============================================================

  window.addEventListener(EVENT, function (event) {
    const d = event.detail || {};

    addLog(
      d.stage || 'UNKNOWN',
      d
    );
  });

  // ============================================================
  // PAGE CONTEXT PROBE
  // ============================================================

  function installPageProbe() {
    const code = `
(function () {

  if (window.__BP_TZ_DG_PROBE_V020__) return;
  window.__BP_TZ_DG_PROBE_V020__ = true;

  const EVENT = ${JSON.stringify(EVENT)};

  function emit(stage, detail) {
    try {
      window.dispatchEvent(
        new CustomEvent(EVENT, {
          detail: Object.assign(
            {
              ts: Date.now(),
              stage: stage
            },
            detail || {}
          )
        })
      );
    } catch (_) {}
  }

  function clean(value) {
    try {
      const u = new URL(
        String(value || ''),
        location.href
      );

      return u.origin + u.pathname;

    } catch (_) {

      return String(value || '')
        .split('?')[0]
        .split('#')[0]
        .slice(0, 300);
    }
  }

  function isGameLogin(value) {
    try {

      const u = new URL(
        String(value || ''),
        location.href
      );

      return /\\/v2\\/game\\/[^/]+\\/login/i.test(
        u.pathname
      );

    } catch (_) {

      return /\\/v2\\/game\\/[^/]+\\/login/i.test(
        String(value || '')
      );
    }
  }

  // ============================================================
  // WINDOW.OPEN
  // ============================================================

  try {

    const nativeOpen = window.open;

    window.open = function () {

      const args =
        Array.prototype.slice.call(arguments);

      let popup = null;

      emit('WINDOW_OPEN_CALL', {
        url: clean(args[0] || '')
      });

      try {

        popup =
          nativeOpen.apply(
            window,
            args
          );

      } catch (error) {

        emit('WINDOW_OPEN_THROW', {
          error:
            String(
              error &&
              error.message ||
              error
            )
        });

        throw error;
      }

      emit('WINDOW_OPEN_RESULT', {
        popup: !!popup
      });

      return popup;
    };

  } catch (error) {

    emit('WINDOW_OPEN_HOOK_ERROR', {
      error:
        String(
          error &&
          error.message ||
          error
        )
    });
  }

  // ============================================================
  // FETCH
  // ============================================================

  try {

    const nativeFetch = window.fetch;

    if (typeof nativeFetch === 'function') {

      window.fetch = function (input, init) {

        const url =
          typeof input === 'string'
            ? input
            : (
                input &&
                input.url
              );

        if (!isGameLogin(url)) {

          return nativeFetch.apply(
            this,
            arguments
          );
        }

        const start =
          performance.now();

        emit('LOGIN_FETCH_START', {
          url: clean(url),
          method:
            String(
              (
                init &&
                init.method
              ) ||
              (
                input &&
                input.method
              ) ||
              'GET'
            ).toUpperCase()
        });

        return nativeFetch
          .apply(
            this,
            arguments
          )
          .then(function (response) {

            emit(
              'LOGIN_FETCH_RESPONSE',
              {
                status:
                  response.status,

                ok:
                  response.ok,

                ms:
                  Math.round(
                    performance.now() -
                    start
                  )
              }
            );

            try {

              const clone =
                response.clone();

              clone
                .text()
                .then(function (text) {

                  try {

                    const data =
                      JSON.parse(text);

                    const gameUrl =
                      (
                        data &&
                        data.data &&
                        data.data.game_url
                      ) ||
                      (
                        data &&
                        data.game_url
                      ) ||
                      '';

                    emit(
                      'LOGIN_GAME_URL',
                      {
                        exists:
                          !!gameUrl,

                        target:
                          gameUrl
                            ? clean(gameUrl)
                            : ''
                      }
                    );

                  } catch (_) {

                    emit(
                      'LOGIN_BODY_NOT_JSON',
                      {}
                    );
                  }
                })
                .catch(function () {});

            } catch (_) {}

            return response;
          })
          .catch(function (error) {

            emit(
              'LOGIN_FETCH_ERROR',
              {
                error:
                  String(
                    error &&
                    error.message ||
                    error
                  ),

                ms:
                  Math.round(
                    performance.now() -
                    start
                  )
              }
            );

            throw error;
          });
      };
    }

  } catch (error) {

    emit('FETCH_HOOK_ERROR', {
      error:
        String(
          error &&
          error.message ||
          error
        )
    });
  }

  // ============================================================
  // XHR
  // ============================================================

  try {

    const XHR =
      window.XMLHttpRequest;

    if (XHR) {

      const nativeOpen =
        XHR.prototype.open;

      const nativeSend =
        XHR.prototype.send;

      XHR.prototype.open =
        function (
          method,
          url
        ) {

          try {

            if (
              isGameLogin(url)
            ) {

              this.__BP_GAME_LOGIN__ = {
                method:
                  String(
                    method || 'GET'
                  ).toUpperCase(),

                url:
                  clean(url)
              };

            } else {

              this.__BP_GAME_LOGIN__ =
                null;
            }

          } catch (_) {}

          return nativeOpen.apply(
            this,
            arguments
          );
        };

      XHR.prototype.send =
        function () {

          const meta =
            this.__BP_GAME_LOGIN__;

          if (!meta) {

            return nativeSend.apply(
              this,
              arguments
            );
          }

          const xhr = this;

          const start =
            performance.now();

          emit(
            'LOGIN_XHR_START',
            meta
          );

          xhr.addEventListener(
            'load',
            function () {

              emit(
                'LOGIN_XHR_RESPONSE',
                {
                  status:
                    Number(
                      xhr.status || 0
                    ),

                  ms:
                    Math.round(
                      performance.now() -
                      start
                    )
                }
              );

              try {

                let data = null;

                if (
                  xhr.responseType ===
                  'json'
                ) {

                  data =
                    xhr.response;

                } else {

                  data =
                    JSON.parse(
                      xhr.responseText ||
                      ''
                    );
                }

                const gameUrl =
                  (
                    data &&
                    data.data &&
                    data.data.game_url
                  ) ||
                  (
                    data &&
                    data.game_url
                  ) ||
                  '';

                emit(
                  'LOGIN_GAME_URL',
                  {
                    exists:
                      !!gameUrl,

                    target:
                      gameUrl
                        ? clean(gameUrl)
                        : ''
                  }
                );

              } catch (_) {

                emit(
                  'LOGIN_BODY_PARSE_ERROR',
                  {}
                );
              }
            },
            { once: true }
          );

          xhr.addEventListener(
            'error',
            function () {

              emit(
                'LOGIN_XHR_ERROR',
                {
                  status:
                    Number(
                      xhr.status || 0
                    ),

                  ms:
                    Math.round(
                      performance.now() -
                      start
                    )
                }
              );
            },
            { once: true }
          );

          xhr.addEventListener(
            'timeout',
            function () {

              emit(
                'LOGIN_XHR_TIMEOUT',
                {
                  status:
                    Number(
                      xhr.status || 0
                    ),

                  ms:
                    Math.round(
                      performance.now() -
                      start
                    )
                }
              );
            },
            { once: true }
          );

          xhr.addEventListener(
            'abort',
            function () {

              emit(
                'LOGIN_XHR_ABORT',
                {
                  status:
                    Number(
                      xhr.status || 0
                    ),

                  ms:
                    Math.round(
                      performance.now() -
                      start
                    )
                }
              );
            },
            { once: true }
          );

          return nativeSend.apply(
            this,
            arguments
          );
        };
    }

  } catch (error) {

    emit(
      'XHR_HOOK_ERROR',
      {
        error:
          String(
            error &&
            error.message ||
            error
          )
      }
    );
  }

  emit(
    'PAGE_PROBE_READY',
    {
      page:
        clean(location.href),

      visibility:
        document.visibilityState
    }
  );

})();
`;

    const script =
      document.createElement(
        'script'
      );

    script.textContent = code;

    const parent =
      document.documentElement ||
      document.head ||
      document.body;

    if (!parent) {

      addLog(
        'INJECT_PARENT_MISSING'
      );

      return false;
    }

    try {

      parent.appendChild(script);

      script.remove();

      addLog(
        'PAGE_PROBE_INJECTED'
      );

      return true;

    } catch (error) {

      addLog(
        'PAGE_PROBE_INJECT_ERROR',
        {
          error:
            String(
              error &&
              error.message ||
              error
            )
        }
      );

      return false;
    }
  }

  // ============================================================
  // FLOATING BUTTON
  // ============================================================

  let debugButton = null;

  function updateButton() {

    if (!debugButton) return;

    const list =
      readLog();

    debugButton.textContent =
      'BP DEBUG (' +
      list.length +
      ')';
  }

  function createButton() {

    if (
      debugButton ||
      !document.body
    ) {
      return;
    }

    debugButton =
      document.createElement(
        'button'
      );

    debugButton.id =
      '__bp_debug_button__';

    debugButton.style.cssText = [
      'position:fixed',
      'right:10px',
      'bottom:80px',
      'z-index:2147483647',
      'background:#ff2d55',
      'color:#fff',
      'border:0',
      'border-radius:999px',
      'padding:11px 14px',
      'font-size:13px',
      'font-weight:700',
      'box-shadow:0 3px 12px rgba(0,0,0,.45)'
    ].join(';');

    debugButton.onclick =
      openDebugPanel;

    document.body.appendChild(
      debugButton
    );

    updateButton();
  }

  // ============================================================
  // DEBUG PANEL
  // ============================================================

  function openDebugPanel() {

    const old =
      document.getElementById(
        '__bp_debug_panel__'
      );

    if (old) {
      old.remove();
    }

    const panel =
      document.createElement(
        'div'
      );

    panel.id =
      '__bp_debug_panel__';

    panel.style.cssText = [
      'position:fixed',
      'left:8px',
      'right:8px',
      'top:8px',
      'bottom:8px',
      'z-index:2147483647',
      'background:#111',
      'color:#fff',
      'padding:12px',
      'border-radius:10px',
      'font:12px/1.45 -apple-system,BlinkMacSystemFont,sans-serif',
      'overflow:auto',
      'word-break:break-word'
    ].join(';');

    const title =
      document.createElement(
        'div'
      );

    title.textContent =
      'TZ → DG DEBUG ' +
      VERSION;

    title.style.cssText =
      'font-size:16px;font-weight:700;margin-bottom:10px';

    const controls =
      document.createElement(
        'div'
      );

    controls.style.cssText =
      'display:flex;gap:8px;margin-bottom:10px';

    const copy =
      document.createElement(
        'button'
      );

    copy.textContent =
      '複製紀錄';

    copy.style.cssText =
      'padding:8px;font-size:13px';

    const clear =
      document.createElement(
        'button'
      );

    clear.textContent =
      '清空紀錄';

    clear.style.cssText =
      'padding:8px;font-size:13px';

    const close =
      document.createElement(
        'button'
      );

    close.textContent =
      '關閉';

    close.style.cssText =
      'padding:8px;font-size:13px';

    const output =
      document.createElement(
        'pre'
      );

    output.style.cssText =
      'white-space:pre-wrap;margin:0';

    function refresh() {

      const list =
        readLog();

      output.textContent =
        list.length
          ? list
              .map(function (x) {

                const time =
                  new Date(
                    x.ts
                  ).toLocaleTimeString();

                return (
                  time +
                  '  ' +
                  x.stage +
                  '\n' +
                  JSON.stringify(x)
                );

              })
              .join('\n\n')
          : '目前沒有紀錄';
    }

    copy.onclick =
      async function () {

        const text =
          readLog()
            .map(function (x) {
              return JSON.stringify(x);
            })
            .join('\n');

        try {

          await navigator
            .clipboard
            .writeText(text);

          copy.textContent =
            '已複製';

          setTimeout(
            function () {
              copy.textContent =
                '複製紀錄';
            },
            1000
          );

        } catch (_) {

          prompt(
            '長按並複製',
            text
          );
        }
      };

    clear.onclick =
      function () {

        clearLog();

        refresh();
      };

    close.onclick =
      function () {

        panel.remove();
      };

    controls.appendChild(copy);
    controls.appendChild(clear);
    controls.appendChild(close);

    panel.appendChild(title);
    panel.appendChild(controls);
    panel.appendChild(output);

    document.body.appendChild(
      panel
    );

    refresh();
  }

  // ============================================================
  // START
  // ============================================================

  addLog(
    'USERSCRIPT_START',
    {
      version:
        VERSION,

      page:
        cleanUrl(
          location.href
        )
    }
  );

  // 先嘗試注入
  if (!installPageProbe()) {

    // document-start 太早時再補一次
    document.addEventListener(
      'DOMContentLoaded',
      function () {

        installPageProbe();

      },
      { once: true }
    );
  }

  function startUI() {

    createButton();

    // SPA 可能重畫 DOM，所以持續確認按鈕存在
    setInterval(
      function () {

        if (
          !document.getElementById(
            '__bp_debug_button__'
          )
        ) {

          debugButton = null;
          createButton();
        }

      },
      1500
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      startUI,
      { once: true }
    );

  } else {

    startUI();
  }

})();
