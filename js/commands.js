/**
 * commands.js — Terminal command registry
 * Author: Woozy
 */

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

/** Colour palette (Catppuccin Mocha). */
const PALETTE = Object.freeze({
  text   : '#cdd6f4',
  accent : '#b4befe',
  error  : '#f38ba8',
  barGap : '#6b7280', // Tailwind gray‑500 fallback
});

/** Skill bar width in "units" (characters). */
const SKILL_BAR_WIDTH = 20;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Returns an HTML‑formatted ASCII skill bar.
 *
 * @param {string} label    Skill name
 * @param {number} percent  Proficiency (0–100)
 * @returns {string}        HTML markup
 */
function createSkillBar(label, percent) {
  const clamped      = Math.max(0, Math.min(percent, 100));
  const filledUnits  = Math.round((clamped / 100) * SKILL_BAR_WIDTH);
  const emptyUnits   = SKILL_BAR_WIDTH - filledUnits;
  const filledBlock  = `<span style="color:${PALETTE.text}">#</span>`.repeat(filledUnits);
  const emptyBlock   = `<span style="color:${PALETTE.barGap}">─</span>`.repeat(emptyUnits);

  return (
    `<span style="color:${PALETTE.accent}">${label}</span>\n` +
    `<span style="color:${PALETTE.text}">[</span>${filledBlock}${emptyBlock}` +
    `<span style="color:${PALETTE.text}">]</span> ` +
    `<span style="color:${PALETTE.accent}">${clamped}%</span>\n`
  );
}

// ---------------------------------------------------------------------------
// COMMAND DEFINITIONS
// ---------------------------------------------------------------------------

/** @type {Record<string, {output: string, action?: () => void}>} */
const BASE_COMMANDS = Object.freeze({
  /** Prints a short self‑introduction */
  whoami: {
    output: `<span style="color:${PALETTE.text}">I dunno, I'm just a guy who likes to break things.</span>`,
  },

  /** Fancy ASCII + system info banner */
  neofetch: {
    output: `
<span style="color:${PALETTE.text}">       .--.</span>        ripwoozy@archlinux
<span style="color:${PALETTE.text}">      |o_o |</span>       -------------------
<span style="color:${PALETTE.text}">      |:_/ |</span>       <span style="color:${PALETTE.accent}">OS:</span> Arch Linux x86_64
<span style="color:${PALETTE.text}">     //   \\ \\</span>      <span style="color:${PALETTE.accent}">Host:</span> Thinkpad T480
<span style="color:${PALETTE.text}">    (|     | )</span>     <span style="color:${PALETTE.accent}">Kernel:</span> 6.7.9-arch1-1
<span style="color:${PALETTE.text}">   /'\\_   _/'\\</span>     <span style="color:${PALETTE.accent}">Shell:</span> zsh
<span style="color:${PALETTE.text}">   \\___)=(___/</span>     <span style="color:${PALETTE.accent}">Resolution:</span> 1920x1080
                   <span style="color:${PALETTE.accent}">Font:</span> JetBrains Mono
                   <span style="color:${PALETTE.accent}">Theme:</span> Catppuccin Mocha
`,
  },

  /** Displays a text‑based skill meter */
  skills: {
    output:
      '\n' +
      createSkillBar('Offensive Python',     75) +
      '\n' +
      createSkillBar('Network Pentesting',   70) +
      '\n' +
      createSkillBar('Malware Analysis',     60) +
      '\n' +
      createSkillBar('Malware Development',  40) +
      '\n' +
      createSkillBar('OSINT',                60) +
      '\n' +
      createSkillBar('Reverse Engineering',  20) +
      '\n',
  },

  /** Opens external uptime dashboard */
  status: {
    output: `<span style="color:${PALETTE.text}">Checking Network Status...</span>`,
    action() {
      window.open('https://status.woozy.cloud', '_blank', 'noopener,noreferrer');
    },
  },
});


/**
 * Full command registry including the auto‑generated `help` command.
 * Immutable via Object.freeze to prevent runtime tampering.
 */
export const commands = Object.freeze({
  ...BASE_COMMANDS,
  help: {
    output: `Available commands:\n- ${Object.keys(BASE_COMMANDS).concat('help').join('\n- ')}`,
  },
});

/**
 * Executes a terminal command by name.
 *
 * @param {string} name  Command to execute
 * @returns {string}     HTML output string
 */
export function handleCommand(name = '') {
  const trimmed = name.trim();
  const cmd     = commands[trimmed];

  if (!cmd) {
    return `<span style="color:${PALETTE.error}">Command not found: ${trimmed}</span>`;
  }

  // Invoke potential side‑effect (e.g., opening a link).
  cmd.action?.();

  return cmd.output;
}
