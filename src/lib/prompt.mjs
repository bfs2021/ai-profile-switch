import { createInterface, emitKeypressEvents } from 'node:readline';
import { PassThrough } from 'node:stream';
import { color, cursorControl, displayWidth, sym } from './ui.mjs';
import { t } from './i18n.mjs';

// Node waits 500 ms after Esc in case the rest of an arrow key follows. Terminals send
// a whole arrow key at once, so a short wait is enough and Esc no longer feels slow.
const ESCAPE_WAIT_MS = 50;

function rl() {
  return createInterface({ input: process.stdin, output: process.stdout });
}

function readKeys(onKey) {
  const input = process.stdin;
  const wasRaw = Boolean(input.isRaw);
  const wasFlowing = input.readableFlowing === true;
  // Keep readline's decoder off stdin so it cannot consume later text prompts.
  const keys = new PassThrough();
  emitKeypressEvents(keys, { escapeCodeTimeout: ESCAPE_WAIT_MS });
  keys.on('keypress', onKey);
  const onData = chunk => keys.write(chunk);
  input.on('data', onData);
  if (!wasRaw) input.setRawMode(true);
  input.resume();

  return () => {
    input.removeListener('data', onData);
    keys.removeListener('keypress', onKey);
    keys.destroy();
    if (!wasRaw) input.setRawMode(false);
    if (wasFlowing) input.resume();
    else input.pause();
  };
}

// hint is shown only while asking, such as "now: side · empty to cancel".
export async function text(message, defaultVal, hint) {
  const suffix = hint ? `  ${color.dim(hint)}` : defaultVal !== undefined ? color.dim(` (${defaultVal})`) : '';
  const r = rl();
  const cursor = cursorControl();
  return new Promise((resolve) => {
    r.question(`${color.cyan(sym.step)}  ${message}${suffix}\n${color.dim(sym.rail)}  ${color.dim(sym.arrow)} `, (answer) => {
      r.close();
      const result = answer.trim() || defaultVal || '';
      // Replace 2-line prompt with single completed line: ◇ message … answer
      if (cursor.enabled) {
        process.stdout.write(`${cursor.up(2)}\r${cursor.clearLine}${color.green(sym.stepDone)}  ${message} ${color.dim(sym.dots)} ${result ? color.cyan(result) : color.dim(t('prompt.cancelled'))}\n${cursor.clearDown}`);
      }
      resolve(result);
    });
  });
}

export async function number(message, defaultVal) {
  const val = await text(message, defaultVal?.toString());
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1) return defaultVal ?? 1;
  return n;
}

export async function confirm(message, defaultVal = true) {
  if (!process.stdin.isTTY) {
    return defaultVal;
  }

  return new Promise((resolve) => {
    let selected = defaultVal;
    const cursor = cursorControl();

    const render = (final = false) => {
      const prefix = final ? color.green(sym.stepDone) : color.cyan(sym.step);
      const sep = final ? color.dim(` ${sym.dots} `) : color.dim(` ${sym.arrow} `);
      const no  = !selected ? color.cyan(t('prompt.no'))  : color.dim(t('prompt.no'));
      const yes =  selected ? color.cyan(t('prompt.yes')) : color.dim(t('prompt.yes'));
      const answer = final ? (selected ? yes : no) : `${no} ${color.dim('/')} ${yes}`;
      process.stdout.write(`\r${cursor.clearLine}${prefix}  ${message}${sep}${answer}`);
    };

    render();

    const stop = readKeys((character, key) => {
      if (key.name === 'left' || key.name === 'right' || key.name === 'tab') {
        selected = !selected;
        render();
      } else if (character === 'y' || character === 'Y') {
        selected = true;
        render();
      } else if (character === 'n' || character === 'N') {
        selected = false;
        render();
      } else if (key.name === 'return' || key.name === 'enter' || key.name === 'escape') {
        if (key.name === 'escape') selected = false;
        stop();
        render(true);
        process.stdout.write('\n');
        resolve(selected);
      } else if (key.ctrl && key.name === 'c') {
        stop();
        process.stdout.write('\n');
        process.exit(0);
      }
    });
  });
}

const asItem = choice => (typeof choice === 'string' ? { label: choice, value: choice } : { ...choice });

// A line wider than the window wraps, so count the screen rows it really takes.
function screenRows(lines, output) {
  return lines.reduce((sum, line) => sum + Math.max(1, Math.ceil(displayWidth(line) / (output.columns || Infinity))), 0);
}

// Hints line up in one column after the longest label that has one.
function hintGap(items, item) {
  const width = Math.max(0, ...items.filter(choice => choice.hint).map(choice => displayWidth(choice.label)));
  return item.hint ? `${' '.repeat(width - displayWidth(item.label) + 2)}${item.hint}` : '';
}

// Draws the question once and redraws the lines under it in place on every key.
// refresh is a promise of { choices, body } that arrives later, such as live usage;
// a spinner turns next to the columns line until it does.
function open(message, state, options, draw, onKey) {
  const { output = process.stdout, refresh, clear = false } = options;
  return new Promise((resolve) => {
    const cursor = cursorControl(output);
    const heading = `${color.cyan(sym.step)}  ${message}`;
    let height = 0;
    let finished = false;
    let timer;

    const render = () => {
      if (finished) return;
      if (height) output.write(cursor.up(height));
      const lines = draw(state);
      for (const line of lines) output.write(`${cursor.clearLine}${line}\n`);
      // A shorter frame, such as a usage line that no longer wraps, leaves old rows below.
      output.write(cursor.clearDown);
      height = screenRows(lines, output);
    };

    // clear leaves nothing behind, for a screen that leads to another one.
    const finish = (value, summary) => {
      finished = true;
      clearInterval(timer);
      stop();
      if (cursor.enabled) {
        output.write(`${cursor.up(height + screenRows([heading], output))}\r${cursor.clearDown}`);
        if (summary && !clear) output.write(`${summary}\n`);
      }
      resolve(value);
    };

    output.write(`${heading}\n`);
    render();

    if (refresh) {
      if (cursor.enabled && options.columns) {
        let frame = 0;
        state.spinner = sym.spinner[0];
        timer = setInterval(() => {
          frame = (frame + 1) % sym.spinner.length;
          state.spinner = sym.spinner[frame];
          render();
        }, 80);
      }
      refresh.then((next) => {
        if (next?.choices) state.items = next.choices.map(asItem);
        if (next?.body) state.body = next.body;
      }, () => {}).finally(() => {
        clearInterval(timer);
        state.spinner = '';
        state.selected = Math.min(state.selected, state.items.length - 1);
        render();
      });
    }

    // Ctrl+C backs out the same way Esc does.
    const stop = readKeys((character, key) => {
      onKey(character ?? '', key.ctrl && key.name === 'c' ? { name: 'escape' } : key, state, { render, finish });
    });
  });
}

function startState(choices, { initial = 0, body = [] }) {
  const items = choices.map(asItem);
  return { items, body, spinner: '', selected: Math.max(0, Math.min(initial, items.length - 1)) };
}

// Choices are strings or { label, value, hint, mark, gap }. mark stands in for the
// number, such as + for "add"; gap leaves an empty line above the choice.
// body lines sit under the question, columns heads the hint column, footer(choice, loading)
// says one thing about the highlighted choice, and keys replaces the key help.
// numbered lets 1-9 pick at once, back makes Esc and ← go back, and onRight(value)
// is what → returns.
export async function select(message, choices, options = {}) {
  const { numbered = false, back = false, columns, footer, onRight, done } = options;
  const state = startState(choices, options);
  if (!process.stdin.isTTY) return state.items[state.selected].value;
  const keys = options.keys ?? t(back ? 'prompt.keysBack' : 'prompt.keys');
  const rail = color.dim(sym.rail);
  const markOf = (item, index) => item.mark ?? String(index + 1);

  const draw = ({ items, selected, body, spinner }) => {
    const markWidth = numbered ? Math.max(1, ...items.map((item, index) => markOf(item, index).length)) : 0;
    const labelWidth = Math.max(0, ...items.filter(item => item.hint).map(item => displayWidth(item.label)));
    const lines = body.map(line => `${rail}  ${line}`);
    if (columns) {
      const indent = 2 + (numbered ? markWidth + 2 : 0) + labelWidth + 2;
      lines.push(`${rail}  ${' '.repeat(indent)}${columns}${spinner ? `  ${color.dim(spinner)}` : ''}`);
    }
    items.forEach((item, index) => {
      if (item.gap) lines.push(rail);
      const mark = numbered ? `${markOf(item, index).padStart(markWidth)}  ` : '';
      const head = index === selected
        ? color.cyan(`${sym.cursor} ${mark}${item.label}`)
        : `  ${color.dim(mark)}${item.label}`;
      lines.push(`${rail}  ${head}${hintGap(items, item)}`);
    });
    if (footer) lines.push(rail, `${rail}  ${footer(items[selected], Boolean(spinner)) || ''}`);
    lines.push(`${rail}  ${color.dim(keys)}`, color.dim(sym.railEnd));
    return lines;
  };

  return open(message, state, options, draw, (character, key, current, { render, finish }) => {
    const { items } = current;
    const pick = (index) => {
      const { value, label } = items[index];
      finish(value, `${color.green(sym.stepDone)}  ${done ? done(value) : `${message} ${color.dim(sym.dots)} ${color.cyan(label)}`}`);
    };
    const numberIndex = numbered && /^[1-9]$/.test(character)
      ? items.findIndex((item, index) => markOf(item, index) === character) : -1;
    if (key.name === 'up' || key.name === 'down') {
      current.selected = (current.selected + (key.name === 'up' ? items.length - 1 : 1)) % items.length;
      render();
    } else if (numberIndex !== -1) {
      current.selected = numberIndex;
      pick(numberIndex);
    } else if (key.name === 'return' || key.name === 'enter') {
      pick(current.selected);
    } else if (key.name === 'right' && onRight) {
      finish(onRight(items[current.selected].value));
    } else if (key.name === 'escape' || (back && key.name === 'left')) {
      finish(null, back ? null : `${color.dim(sym.stepDone)}  ${message} ${color.dim(t('prompt.cancelled'))}`);
    }
  });
}

// Choices are { label, value, hint }; checked lists the values that start turned on.
// Space turns the highlighted choice on or off and Enter returns the values that are on.
// notes are dim lines under the choices; Esc and ← go back with null.
export async function multiselect(message, choices, options = {}) {
  const { checked = [], notes = [] } = options;
  const state = startState(choices, options);
  for (const item of state.items) item.on = checked.includes(item.value);
  const chosen = () => state.items.filter(item => item.on).map(item => item.value);
  if (!process.stdin.isTTY) return chosen();
  const keys = options.keys ?? t('prompt.keysMulti');
  const rail = color.dim(sym.rail);

  const draw = ({ items, selected, body }) => {
    const lines = body.map(line => `${rail}  ${line}`);
    items.forEach((item, index) => {
      const box = item.on ? color.green(sym.boxOn) : color.dim(sym.boxOff);
      lines.push(`${rail}  ${index === selected ? color.cyan(sym.cursor) : ' '} ${box} ${item.label}${hintGap(items, item)}`);
    });
    if (notes.length) lines.push(rail, ...notes.map(note => `${rail}  ${color.dim(note)}`));
    lines.push(`${rail}  ${color.dim(keys)}`, color.dim(sym.railEnd));
    return lines;
  };

  return open(message, state, options, draw, (character, key, current, { render, finish }) => {
    const { items } = current;
    if (key.name === 'up' || key.name === 'down') {
      current.selected = (current.selected + (key.name === 'up' ? items.length - 1 : 1)) % items.length;
      render();
    } else if (key.name === 'space') {
      items[current.selected].on = !items[current.selected].on;
      render();
    } else if (key.name === 'return' || key.name === 'enter') {
      finish(chosen());
    } else if (key.name === 'escape' || key.name === 'left') {
      finish(null);
    }
  });
}
