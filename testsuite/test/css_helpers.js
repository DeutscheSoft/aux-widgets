import {
  add_class,
  remove_class,
  has_class,
  toggle_class,
} from '../src/index.js';

describe('CSSHelpers', () => {
  const div = document.createElement('DIV');

  it('add_class()', (done) => {
    add_class(div, 'foobar');
    if (div.classList.contains('foobar')) done();
    else done(new Error('class not found'));
    div.classList.remove('foobar');
  });
  it('remove_class()', (done) => {
    add_class(div, 'foobar');
    remove_class(div, 'foobar');
    if (!div.classList.contains('foobar')) done();
    else done(new Error('class found'));
  });
});
