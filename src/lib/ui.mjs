// ANSI colors, terminal capability detection, and the left-rail layout helpers.
// Single source for any module that writes to stdout/stderr.

const colorAllowed = !process.env.NO_COLOR && process.env.TERM !== 'dumb';
export let hasColor = Boolean(process.stdout.isTTY || process.env.FORCE_COLOR) && colorAllowed;

// The claude picker draws on stderr while its stdout is captured by the shell.
export function colorFor(stream) {
  hasColor = Boolean(stream.isTTY || process.env.FORCE_COLOR) && colorAllowed;
}

// On legacy Windows consoles (cmd.exe without UTF-8 codepage), Unicode box
// characters may not render.  Detect via the WT_SESSION env var (set by
// Windows Terminal) or non-Windows platforms.
export const supportsUnicode = Boolean(
  process.env.WT_SESSION
  || process.env.TERM_PROGRAM
  || process.platform !== 'win32'
);

const ESC = '\x1b[';
const c = (code) => hasColor ? `${ESC}${code}m` : '';

export const color = {
  bold:    (s) => `${c('1')}${s}${c('0')}`,
  dim:     (s) => `${c('2')}${s}${c('0')}`,
  green:   (s) => `${c('32')}${s}${c('0')}`,
  yellow:  (s) => `${c('33')}${s}${c('0')}`,
  blue:    (s) => `${c('34')}${s}${c('0')}`,
  cyan:    (s) => `${c('36')}${s}${c('0')}`,
  red:     (s) => `${c('31')}${s}${c('0')}`,
};

export function cursorControl(output = process.stdout) {
  const enabled = Boolean(output.isTTY) && process.env.TERM !== 'dumb';
  return {
    enabled,
    up: (n) => enabled ? `${ESC}${n}A` : '',
    clearLine: enabled ? `${ESC}2K` : '',
    clearDown: enabled ? `${ESC}0J` : '',
  };
}

// Symbols with ASCII fallback for non-Unicode terminals.
export const sym = {
  check:     supportsUnicode ? '✓' : 'v',
  warn:      supportsUnicode ? '⚠' : '!',
  cross:     supportsUnicode ? '✗' : 'x',
  info:      supportsUnicode ? 'ℹ' : 'i',
  arrow:     supportsUnicode ? '›' : '>',
  cursor:    supportsUnicode ? '❯' : '>',
  dots:      supportsUnicode ? '…' : '...',
  bulletOn:  supportsUnicode ? '●' : '*',
  bulletOff: supportsUnicode ? '○' : 'o',
  dash:      supportsUnicode ? '──' : '--',
  none:      supportsUnicode ? '–' : '-',
  arrows:    supportsUnicode ? '↑↓' : 'Up/Down',
  // Left rail that groups one flow: ┌ start, │ body, ◆ question, ◇ answered, └ end.
  railTop:   supportsUnicode ? '┌' : '+',
  rail:      supportsUnicode ? '│' : '|',
  railEnd:   supportsUnicode ? '└' : '`',
  step:      supportsUnicode ? '◆' : '*',
  stepDone:  supportsUnicode ? '◇' : 'o',
  barOn:     supportsUnicode ? '▰' : '#',
  barOff:    supportsUnicode ? '▱' : '-',
  boxOn:     supportsUnicode ? '◼' : '[x]',
  boxOff:    supportsUnicode ? '◻' : '[ ]',
  spinner:   supportsUnicode ? '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏' : '-\\|/',
};

export function success(msg) {
  process.stdout.write(`  ${color.green(sym.check)} ${msg}\n`);
}

export function warn(msg) {
  process.stdout.write(`  ${color.yellow(sym.warn)} ${msg}\n`);
}

// Hints are { label, text } or { label, command } lines telling what to do next.
export function error(msg, hints = []) {
  process.stderr.write(`  ${color.red(sym.cross)} ${msg}\n`);
  for (const hint of hints) {
    process.stderr.write(`    ${color.dim(hint.label)} ${hint.command ? color.cyan(hint.command) : hint.text}\n`);
  }
}

export function userError(message, hints = []) {
  return Object.assign(new Error(message), { hints });
}

export function intro(title, note = '', output = process.stdout) {
  output.write(`${color.dim(sym.railTop)}  ${color.bold(title)}${note ? `  ${color.dim(note)}` : ''}\n${color.dim(sym.rail)}\n`);
}

export function outro(message, output = process.stdout) {
  output.write(`${color.dim(sym.railEnd)}  ${message}\n`);
}

// The number is always printed so the bar never relies on color alone.
export function meter(percent, width = 10) {
  const filled = Math.round(percent / 100 * width);
  const paint = percent >= 80 ? color.red : percent >= 50 ? color.yellow : color.green;
  return `${paint(sym.barOn.repeat(filled))}${color.dim(sym.barOff.repeat(width - filled))} ${String(percent).padStart(3)}%`;
}

export function info(msg) {
  process.stdout.write(`  ${color.blue(sym.info)} ${msg}\n`);
}

export function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

// Hangul and other wide characters take two terminal columns.
export function displayWidth(text) {
  return [...stripAnsi(text)].reduce((width, char) => width
    + (/[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\uff00-\uff60]/.test(char) ? 2 : 1), 0);
}

// Pads colored text to a column width.
export function pad(text, width) {
  return text + ' '.repeat(Math.max(0, width - displayWidth(text)));
}
