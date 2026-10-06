/*
 * Shared Vitest setup for jsdom and browser runs.
 */

import '../../src/components.js';
import { canvas } from './helpers.js';

afterEach(() => {
  const div = canvas();

  while (div.lastChild) {
    const element = div.lastChild;

    if (element.auxWidget) element.auxWidget.destroy();

    element.remove();
  }
});
