/**
 * main.js — Terminal UI controller
 * Author: Woozy
 */


import { handleCommand } from './commands.js';

// ---------------------------------------------------------------------------
// DOM REFERENCES
// ---------------------------------------------------------------------------

const $output   = document.getElementById('terminal-output');
const $input    = document.getElementById('terminal-input');
const $terminal = document.querySelector('.terminal');

// ---------------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------------

const history = [];
let historyIndex = -1;
let buffer = '';
let $cursor = null;
let $currentPrompt = null;

// ---------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------------------------

/** Scroll terminal output to bottom (non-janky). */
const scrollToBottom = () => {
  requestAnimationFrame(() => {
    $output.scrollTop = $output.scrollHeight;
  });
};

/** Generate a new terminal prompt. */
function newPrompt() {
  $output.querySelectorAll('.cursor').forEach((c) => c.remove());

  const line = document.createElement('div');
  line.className = 'prompt-line mb-1';
  line.innerHTML =
    '<span class="text-[#f2cdcd]">ripwoozy</span>' +
    '@<span class="text-[#eba0ac]">archlinux</span>' +
    '<span class="text-yellow-400">:~</span>' +
    '<span class="text-[#f38ba8]">$ </span>' +
    '<span class="command-input"></span>' +
    '<span class="cursor"></span>';

  $output.appendChild(line);
  $cursor = line.querySelector('.cursor');
  return line.querySelector('.command-input');
}

/** Sync buffer content into current prompt. */
const syncBuffer = () => {
  if ($currentPrompt) $currentPrompt.textContent = buffer;
};

// ---------------------------------------------------------------------------
// INITIALISE TERMINAL
// ---------------------------------------------------------------------------

$currentPrompt = newPrompt();

// ---------------------------------------------------------------------------
// INPUT HANDLING
// ---------------------------------------------------------------------------

$input.addEventListener('keydown', (e) => {
  // Blink restart (reset animation)
  if ($cursor) {
    $cursor.style.animation = 'none';
    setTimeout(() => { $cursor.style.animation = ''; }, 10);
  }

  if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();

  switch (e.key) {
    case 'Enter': {
      const cmd = buffer.trim();
      if (!cmd) break;

      $cursor.remove();

      if (cmd === 'clear') {
        $output.innerHTML = '';
      } else {
        const result = document.createElement('div');
        result.className = 'mb-1';
        result.innerHTML = handleCommand(cmd);
        $output.appendChild(result);
      }

      history.push(cmd);
      historyIndex = -1;
      buffer = '';

      $currentPrompt = newPrompt();
      scrollToBottom();
      break;
    }

    case 'ArrowUp': {
      if (history.length && historyIndex < history.length - 1) {
        buffer = history[history.length - 1 - ++historyIndex];
        syncBuffer();
      }
      break;
    }

    case 'ArrowDown': {
      if (historyIndex > 0) {
        buffer = history[history.length - 1 - --historyIndex];
      } else {
        historyIndex = -1;
        buffer = '';
      }
      syncBuffer();
      break;
    }

    case 'Backspace': {
      buffer = buffer.slice(0, -1);
      syncBuffer();
      break;
    }

    default: {
      if (e.key.length === 1) {
        buffer += e.key;
        syncBuffer();
      }
    }
  }

  $input.value = buffer;
});

// ---------------------------------------------------------------------------
// UX INTERACTIONS
// ---------------------------------------------------------------------------

$input.addEventListener('focus', () => {
  $terminal.classList.add('terminal-focused');
});

$input.addEventListener('blur', () => {
  $terminal.classList.remove('terminal-focused');
});

$terminal.addEventListener('click', () => {
  $input.focus();
});

// Ensure body fade in (in case boot screen was skipped)
window.addEventListener('load', () => {
  document.body.classList.add('page-loaded');
});
