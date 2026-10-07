/*
 * Shared Vitest setup for jsdom and browser runs.
 */

import '../../../src/components.js';
import { setConsole } from '../../../src/utils/log.js';
import { testConsole } from './silent_error.js';
import { canvas } from './helpers.js';

setConsole(testConsole);

afterEach(() => {
  const div = canvas();

  while (div.lastChild) {
    const element = div.lastChild;

    if (element.auxWidget) element.auxWidget.destroy();

    element.remove();
  }
});
