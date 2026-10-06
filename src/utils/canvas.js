/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { isJsdom } from './is_jsdom.js';
import { warn } from './log.js';

/**
 * Minimal CanvasRenderingContext2D stand-in used when getContext('2d')
 * is unavailable (e.g. jsdom). Implements only the surface AUX meters use.
 */
const NOOP_GRADIENT = {
  addColorStop() {},
};

const NOOP_CONTEXT_2D = {
  fillStyle: '#000',
  fillRect() {},
  clearRect() {},
  createLinearGradient() {
    return NOOP_GRADIENT;
  },
};

/**
 * Returns a 2d drawing context for `canvas`, or a no-op stand-in when
 * the environment cannot provide one (e.g. jsdom).
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
export function getCanvasContext2D(canvas) {
  // jsdom's getContext emits a noisy "Not implemented" error and returns null
  // unless the optional native `canvas` package is installed.
  if (isJsdom) return NOOP_CONTEXT_2D;

  try {
    const ctx = canvas.getContext('2d');
    if (ctx) return ctx;
  } catch {
    warn('Failed to get 2d context for canvas');
  }
  return NOOP_CONTEXT_2D;
}
