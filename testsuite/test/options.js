import { OptionsComponent, ButtonComponent } from '../src/index.js';

import { canvas, assert } from './helpers.js';

function createElement(name, attr) {
  const element = document.createElement(name);

  if (attr)
    for (let key in attr) {
      element.setAttribute(key, attr[key]);
    }

  return element;
}

function createOptions(attr) {
  return createElement('aux-options', attr);
}
function createButton(attr) {
  return createElement('aux-button', attr);
}

describe('AUX-OPTIONS', () => {
  it('adding and removing aux-options', async () => {
    const c = canvas();

    const div = createElement('div');
    const options = createOptions({ label: 'foo', name: 'options1' });
    const button1 = createButton({ options: 'options1' });
    const button2 = createButton({ options: 'options1' });

    c.appendChild(div);
    div.appendChild(button1);
    div.appendChild(button2);
    assert(button1.label === false);
    assert(button2.label === false);
    div.appendChild(options);
    assert(button1.label === 'foo');
    assert(button2.label === 'foo');
    div.removeChild(options);
    assert(button1.label === false);
    assert(button2.label === false);
    div.remove();
  });

  it('changing options attributes', async () => {
    const c = canvas();

    const div = createElement('div');
    const options = createOptions({ label: 'foo', name: 'options1' });
    const button1 = createButton({});
    const button2 = createButton({});

    c.appendChild(div);
    div.appendChild(button1);
    div.appendChild(button2);
    div.appendChild(options);
    assert(button1.label === false);
    assert(button2.label === false);
    button1.setAttribute('options', 'options1');
    button2.setAttribute('options', 'options1');
    assert(button1.label === 'foo');
    assert(button2.label === 'foo');
    button1.setAttribute('options', null);
    button2.setAttribute('options', null);
    assert(button1.label === false);
    assert(button2.label === false);
    div.remove();
  });

  it('inheriting options', async () => {
    const c = canvas();

    const div = createElement('div');
    const options1 = createOptions({ options: 'options2', name: 'options1' });
    const options2 = createOptions({ label: 'foo', name: 'options2' });
    const button1 = createButton({});
    const button2 = createButton({});

    c.appendChild(div);
    div.appendChild(button1);
    div.appendChild(button2);
    div.appendChild(options1);
    div.appendChild(options2);
    assert(button1.label === false);
    assert(button2.label === false);
    button1.setAttribute('options', 'options1');
    button2.setAttribute('options', 'options1');
    assert(button1.label === 'foo');
    assert(button2.label === 'foo');
    button1.setAttribute('options', null);
    button2.setAttribute('options', null);
    assert(button1.label === false);
    assert(button2.label === false);
    div.remove();
  });
});
