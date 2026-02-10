/**
 * Verifies that the package index (src/index.js + src/index.d.ts) correctly
 * re-exports widgets, utils, Base, and renderer so consumers can import
 * everything from a single entry.
 *
 * These imports use the relative path to the built package entry; in a real
 * app you would use: import { ... } from '@deutschesoft/aux-widgets'
 */

import {
  Widget,
  Fader,
  Root,
  Bitstring,
  IWidgetOptions,
  IFaderOptions,
  IContainerOptions,
  IBitstringOptions,
} from '../src/index.js';

// Utils (from index.pure re-exports)
import {
  hasClass,
  addClass,
  removeClass,
  merge,
  warn,
  sprintf,
  setGlobalCursor,
  unsetGlobalCursor,
  deferRender,
  Renderer,
  Base,
} from '../src/index.js';

// --- Widget types from barrel ---
const _opts: Partial<IWidgetOptions> = {};
const _faderOpts: Partial<IFaderOptions> = {};
const _containerOpts: Partial<IContainerOptions> = {};
const _bitstringOpts: Partial<IBitstringOptions> = {};

const w = new Widget();
const f = new Fader();
const r = new Root({});
const b = new Bitstring({ length: 8 });

// --- Utils from barrel ---
const _bool: boolean = hasClass(document.body, 'test');
addClass(document.body, 'foo');
removeClass(document.body, 'foo');
const _merged: Record<string, unknown> = merge({}, { a: 1 });
warn('test');
const _fmt: string = sprintf('%d', 42);
setGlobalCursor('pointer');
unsetGlobalCursor('pointer');

// --- Renderer from barrel ---
const _defer = deferRender(() => {});
const _renderer = new Renderer();

// --- Base from barrel ---
class Sub extends Base {}
