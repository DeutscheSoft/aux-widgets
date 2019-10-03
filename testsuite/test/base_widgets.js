import { Widget, WidgetComponent } from '../src/index.js';

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
    const widget = o.widget;
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
    o.widget.set('disabled', true);
  });
  it('removeEventListener', (done) => {
    const o = document.createElement('aux-widget');
    const cb = (ev) => { done(new Error('fail.')); };

    o.addEventListener('set_disabled', cb);
    o.removeEventListener('set_disabled', cb);
    o.widget.set('disabled', true);
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
});
