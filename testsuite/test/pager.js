import {
  Pager,
  html
} from '../src/index.js';

import { assert, compare, object_minus } from './helpers.js';

describe('Pager', () => {
  it('creating with pages', () => {
    const p = new Pager({
      pages: [
        {
          label: 'foo',
          content: html('<p1>hello</p1>'),
        },
      ],
    });
  });
});
