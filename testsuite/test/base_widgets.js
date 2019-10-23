import { Widget, WidgetComponent } from '../src/index.js';

import { assert, assert_error } from './helpers.js';

describe('Options', () => {
  it('set()', (done) => {
    const o = new Widget();
    o.set("disabled", true);
    if (o.options.disabled !== true)
      throw new Error('fail.');
    if (!o.invalid.disabled)
      throw new Error('fail.');
    done();
  });
});

describe('Components', () => {
  it('setAttribute()', (done) => {
    const o = document.createElement('aux-widget');
    o.setAttribute("disabled", true);
    const widget = o.auxWidget;
    if (widget.options.disabled !== true)
      throw new Error('fail: ' + widget.options.disabled);
    if (!widget.invalid.disabled)
      throw new Error('fail.');
    done();
  });
  it('addEventListener', (done) => {
    const o = document.createElement('aux-widget');
    o.addEventListener('set_disabled', (ev) => {
      done();
    });
    o.auxWidget.set('disabled', true);
  });
  it('removeEventListener', (done) => {
    const o = document.createElement('aux-widget');
    const cb = (ev) => { done(new Error('fail.')); };

    o.addEventListener('set_disabled', cb);
    o.removeEventListener('set_disabled', cb);
    o.auxWidget.set('disabled', true);
    done();
  });
  it('addEventListener on setAttribute does not trigger', (done) => {
    const o = document.createElement('aux-widget');
    o.addEventListener('set_disabled', (ev) => {
      done(new Error('failed.'));
    });
    o.setAttribute('disabled', 'true');
    done();
  });
  it('get_option_type()', () => {
    const o = new Widget();

    if (o.get_option_type('disabled') !== 'boolean')
      throw new Error('bad type for disabled');
  });
  it('get_default()', () => {
    const o = new Widget();

    if (o.get_default('disabled') !== false)
      throw new Error('bad default value for disabled');

    {
      let ok = false;
      try
      {
        o.get_default('this_option_does_not_exist');
      }
      catch (e)
      {
        ok = true;
      }

      if (!ok) throw new Error('Expected error for unknown option');

    }
  });
  it('child handling', () => {
    {
      const w1 = new Widget();
      const w2 = new Widget();
      const c1 = new Widget();
      const c2 = new Widget();
      w1.add_child(c1);
      w2.add_child(c2);

      assert(w1.has_child(c1), 'add_child failed.');

      w2.add_child(c1);

      assert(!w1.has_child(c1), 'add_child failed.');
      assert(w2.has_child(c1), 'add_child failed.');

      c1.set_parent();

      assert(!w2.has_child(c1), 'set_parent failed.');


      assert_error(() => w2.remove_child(c1));

      w1.destroy();
      w2.destroy();
      c1.destroy();
      c2.destroy();
    }

    {
      const w = new Widget();
      const c = new Widget();

      w.add_child(c);

      assert(w.hidden() === c.hidden());
      w.show();
      assert(!w.hidden() && w.hidden() === c.hidden());
      w.hide();
      assert(w.hidden() && w.hidden() === c.hidden());

      w.destroy();
      c.destroy();
    }

    {
      const w = new Widget({ element: document.createElement('div') });
      const c = new Widget({ element: document.createElement('div') });

      w.add_child(c);

      w.set_parent(null);

      assert(w.hidden() === c.hidden());
      assert(w.hidden() === document.hidden);

      w.destroy();
      c.destroy();
    }
  });
});
