/**
 * boot.js — Animated boot sequence
 * Author: Woozy
 */


(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // DOM REFERENCES
  // ---------------------------------------------------------------------------

  const $log    = document.getElementById('boot-log');
  const $bar    = document.getElementById('boot-bar');
  const $screen = document.getElementById('boot-screen');

  if (!$log || !$bar || !$screen) {
    // Required elements missing – abort gracefully.
    return;
  }

  // ---------------------------------------------------------------------------
  // CONSTANTS
  // ---------------------------------------------------------------------------

  /** Colours used to highlight log lines by type. */
  const COLOR_MAP = Object.freeze({
    ok     : '#a6e3a1',
    fail   : '#f38ba8',
    warn   : '#f9e2af',
    default: '#cdd6f4',
  });

  /** Prefer matchMedia over direct width access for responsiveness. */
  const IS_MOBILE = window.matchMedia('(max-width: 767px)').matches;

  /** Number of synthetic log lines to emit before the real boot messages. */
  const FAST_LOG_COUNT = IS_MOBILE ? 8 : 25;

  /** Pre‑computed array of randomised fast log messages. */
  const fastLogs = Array.from({ length: FAST_LOG_COUNT }, (_, i) => {
    const ts = (Math.random() * 10).toFixed(3);
    const variants = [
      `usb ${i}-1: device descriptor read/64, error -${Math.floor(Math.random() * 20)}`,
      `audit: type=1100 audit(${ts}): pid=1 uid=0 msg='pam_unix(sshd:session): session opened for user root'`,
      `systemd[1]: Starting Cleanup of Temporary Directories...`,
      `kernel: [${ts}] random: crng init done`,
      `ACPI: \\_SB_.PCI0.LPCB.EC0._Q42: Return value not ready`,
      `usb ${i}-1: new high-speed USB device number ${i} using xhci_hcd`,
    ];
    return `[${ts}] ${variants[Math.floor(Math.random() * variants.length)]}`;
  });

  /** Fixed sequence of status messages displayed during boot. */
  const bootLines = Object.freeze([
    { text: '[  OK  ] Mounting /dev/sda3 to /mnt',                type: 'ok'   },
    { text: '[  OK  ] Loading kernel modules',                    type: 'ok'   },
    { text: '[FAILED] Failed to load module: catppuccin.service', type: 'fail' },
    { text: '[ WARN ] Skipping deprecated user: root',            type: 'warn' },
    { text: '[  OK  ] Starting SSH Daemon',                       type: 'ok'   },
    { text: '[  OK  ] Applying hostname: woozy.cloud',            type: 'ok'   },
    { text: '[  OK  ] Fetching GitHub identity',                  type: 'ok'   },
    { text: '[  OK  ] Finalizing init sequence...',               type: 'ok'   },
  ]);

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  let fastIndex = 0;
  let bootIndex = 0;

  // A single scroll anchor keeps the log view glued to the bottom.
  const anchor = document.createElement('div');
  anchor.id = 'scroll-anchor';
  $log.appendChild(anchor);

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------

  /** Appends `html` to the log and scrolls to bottom. */
  const appendLog = html => {
    $log.insertAdjacentHTML('beforeend', `${html}\n`);
    anchor.scrollIntoView({ block: 'end' });
  };

  /** Returns a colour‑ised HTML string for a log line. */
  const formatLine = ({ text, type }) =>
    `<span style="color:${COLOR_MAP[type] || COLOR_MAP.default}">${text}</span>`;

  /** Updates progress bar width [0‑100]. */
  const updateProgress = value => {
    $bar.style.width = `${Math.round(value)}%`;
  };

  // ---------------------------------------------------------------------------
  // SEQUENCE
  // ---------------------------------------------------------------------------

  /** Types out the synthetic fast logs at high speed. */
  const typeFastLogs = () => {
    if (fastIndex >= fastLogs.length) {
      return setTimeout(typeBootLines, 400);
    }

    appendLog(fastLogs[fastIndex++]);
    requestAnimationFrame(() => setTimeout(typeFastLogs, 40));
  };

  /** Types out the main boot messages and updates the progress bar. */
  const typeBootLines = () => {
    if (bootIndex >= bootLines.length) {
      return setTimeout(endBootSequence, 800);
    }

    appendLog(formatLine(bootLines[bootIndex]));

    const progress = ((bootIndex + 1) / bootLines.length) * 100;
    updateProgress(progress);

    bootIndex += 1;
    setTimeout(typeBootLines, 300);
  };

  /** Final fade‑out transition. */
  const endBootSequence = () => {
    $screen.classList.add('fade-out');
    setTimeout(() => {
      $screen.remove();
      document.body.classList.add('page-loaded');
    }, 800);
  };

  // ---------------------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------------------

  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('page-loaded');
    typeFastLogs();
  });
})();
