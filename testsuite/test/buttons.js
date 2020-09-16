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

import {
  Button,
  Buttons,
  ButtonComponent,
  ButtonsComponent,
} from '../src/index.js';

import { waitForDrawn, assert, compare, compareOptions } from './helpers.js';

describe('Buttons', () => {
  let n = 0;
  const checkSelect = (buttons) => {
    const list = buttons.getButtons();
    const selected = list.filter((b) => b.get('state'));
    const notselected = list.filter((b) => !b.get('state'));

    let select = buttons.get('select');

    if (!Array.isArray(select)) {
      select = select === -1 ? [] : [select];
    }

    selected.forEach((b) => {
      assert(select.includes(list.indexOf(b)));
    });
    notselected.forEach((b) => {
      assert(!select.includes(list.indexOf(b)));
    });
  };
  const test = (addButton, removeButton, selectButton) => {
    it('addButton() variants ' + n, async () => {
      {
        const buttons = new Buttons();
        const label = 'testing';
        const b1 = await addButton(buttons, label);
        const b2 = await addButton(buttons, { label: label });
        const b3 = await addButton(buttons, new Button({ label: label }));
        assert(compareOptions(b1, b2));
        assert(compareOptions(b1, b3));
        selectButton(buttons, b1);
        selectButton(buttons, b2);
        selectButton(buttons, b3);
        await removeButton(buttons, b1);
        await removeButton(buttons, b2);
        await removeButton(buttons, b3);
      }
      {
        // position argument
        const buttons = new Buttons();
        const b1 = await addButton(buttons, '1');
        const b2 = await addButton(buttons, '2', 0);
        const b3 = await addButton(buttons, '3', 1);
        let res = buttons
          .getButtons()
          .map((b) => b.get('label'))
          .join('');
        assert(res === '231');
        await removeButton(buttons, b1);
        await removeButton(buttons, b2);
        await removeButton(buttons, b3);
      }
      {
        const buttons = new Buttons({ select: 0 });
        const b1 = await addButton(buttons, '1');
        assert(b1.get('state'));
        await removeButton(buttons, b1);
        assert(buttons.get('select') === -1);
        await addButton(buttons, b1);
        assert(buttons.get('select') === 0);
      }
    });
    it('select ' + n, async () => {
      const ba = new Buttons({ buttons: ['1', '2', '3'] });

      const buttons = ba.getButtons();

      buttons.forEach((button) => assert(!button.get('state')));

      for (let i = 0; i < buttons.length; i++) {
        selectButton(ba, buttons[i]);
        for (let j = 0; j < buttons.length; j++) {
          if (i !== j) assert(!buttons[j].get('state'));
        }
      }

      const button = await addButton(ba, { label: 'foo', state: true });
      //button.set('state', true);
      assert(button.get('state'));
    });
    it('multi-select restriction ' + n, (done) => {
      {
        const ba = new Buttons({ multi_select: 1, buttons: ['1', '2', '3'] });
        var sel = [];
        var test = [];
        for (var i = 0; i < ba.getButtons().length; i++) {
          sel.push(i);
          test.push(i);
          ba.set('select', sel);
          assert(compare(ba.get('select'), test));
        }
      }
      {
        const ba = new Buttons({ multi_select: 2, buttons: ['1', '2', '3'] });
        var sel = [];
        for (var i = 0; i < ba.getButtons().length; i++) {
          sel.push(i);
          ba.set('select', sel);
          assert(ba.get('select').length <= 2);
        }
      }
      done();
    });
    n++;
  };

  const addButton1 = (buttons, ...args) => {
    return buttons.addButton(...args);
  };

  const addButton2 = (buttons, options, position) => {
    const component = document.createElement('aux-button');

    if (typeof options === 'string') {
      component.label = options;
    } else if (typeof options === 'object') {
      if (options instanceof Button) options = options.options;

      for (let key in options) {
        component[key] = options[key];
      }
    }

    const node = buttons.getButtons()[position];

    if (node) {
      buttons.element.insertBefore(component, node.element);
    } else {
      buttons.element.appendChild(component);
    }

    return component.auxWidget;
  };

  const removeButton1 = (buttons, ...args) => {
    return buttons.removeButton(...args);
  };

  const removeButton2 = (buttons, button) => {
    if (button instanceof Button && button.element.tagName === 'AUX-BUTTON') {
      button.element.remove();
    } else {
      buttons.removeButton(button);
    }
  };

  const selectButton1 = (buttons, button) => {
    button.set('state', true);
  };

  const selectButton2 = (buttons, button) => {
    let select = buttons.get('select');
    const position = buttons.getButtons().indexOf(button);

    if (Array.isArray(select)) {
      select = [position].concat(select);
    } else {
      select = position;
    }

    buttons.set('select', select);
  };

  const selectButton3 = (buttons, button) => {
    button.userset('state', true);
  };

  const selectButton4 = (buttons, button) => {
    button.element.dispatchEvent(new CustomEvent('click'));
  };

  [addButton1, addButton2].forEach((lowAddButton) => {
    const addButton = async (buttons, ...args) => {
      const n = buttons.getButtons().length;
      const button = lowAddButton(buttons, ...args);
      await waitForDrawn(buttons);
      assert(buttons.getButtons().length === n + 1);
      checkSelect(buttons);
      return button;
    };
    [removeButton1, removeButton2].forEach((lowRemoveButton) => {
      const removeButton = async (buttons, ...args) => {
        const n = buttons.getButtons().length;
        lowRemoveButton(buttons, ...args);
        await waitForDrawn(buttons);
        assert(buttons.getButtons().length === n - 1);
        checkSelect(buttons);
      };
      [selectButton1, selectButton2, selectButton3, selectButton4].forEach(
        (lowSelectButton) => {
          const selectButton = (buttons, button) => {
            lowSelectButton(buttons, button);
            assert(button.get('state'));
            checkSelect(buttons);
          };
          test(addButton, removeButton, selectButton);
        }
      );
    });
  });
});
