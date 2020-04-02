import {
    Button,
    Buttons,
    ButtonComponent,
    ButtonsComponent
  } from '../src/index.js';

import { wait_for_drawn, assert, compare, compare_options } from './helpers.js';

describe('Buttons', () => {
    let n = 0;
    const check_select = (buttons) => {
      const list = buttons.get_buttons();
      const selected = list.filter((b) => b.get('state'));
      const notselected = list.filter((b) => !b.get('state'));

      let select = buttons.get('select');

      if (!Array.isArray(select))
      {
        select = select === -1 ? [] : [ select ];
      }

      selected.forEach((b) => {
        assert(select.includes(list.indexOf(b)));
      });
      notselected.forEach((b) => {
        assert(!select.includes(list.indexOf(b)));
      });
    };
    const test = (add_button, remove_button, select_button) => {
      it("add_button() variants " + n, async () => {
        {
           const buttons = new Buttons();
           const label = "testing";
           const b1 = await add_button(buttons, label);
           const b2 = await add_button(buttons, {label:label});
           const b3 = await add_button(buttons, new Button({label:label}));
           assert(compare_options(b1, b2));
           assert(compare_options(b1, b3));
           select_button(buttons, b1);
           select_button(buttons, b2);
           select_button(buttons, b3);
           await remove_button(buttons, b1);
           await remove_button(buttons, b2);
           await remove_button(buttons, b3);
        }
        {
          // position argument
          const buttons = new Buttons();
          const b1 = await add_button(buttons, "1");
          const b2 = await add_button(buttons, "2", 0);
          const b3 = await add_button(buttons, "3", 1);
          let res = buttons.get_buttons().map((b) => b.get('label')).join('');
          assert(res === "231");
          await remove_button(buttons, b1);
          await remove_button(buttons, b2);
          await remove_button(buttons, b3);
        }
        {
          const buttons = new Buttons({ select: 0 });
          const b1 = await add_button(buttons, "1");
          assert(b1.get('state'));
          await remove_button(buttons, b1);
          assert(buttons.get('select') === -1);
          await add_button(buttons, b1);
          assert(buttons.get('select') === 0);
        }
      });
      it('select ' + n, async () => {
          const ba = new Buttons({buttons:['1','2','3']});

          const buttons = ba.get_buttons();

          buttons.forEach((button) => assert(!button.get('state')));

          for (let i = 0; i < buttons.length; i++)
          {
            select_button(ba, buttons[i]);
            for (let j = 0; j < buttons.length; j++)
            {
              if (i !== j)
                assert(!buttons[j].get('state'));
            }
          }

          const button = await add_button(ba, { label: 'foo', state: true });
          //button.set('state', true);
          assert(button.get('state'));
      });
      it("multi-select restriction " + n, (done) => {
        {
          const ba = new Buttons({multi_select:1, buttons:['1','2','3']});
          var sel = [];
          var test = [];
          for (var i = 0; i < ba.get_buttons().length; i++) {
            sel.push(i);
            test.push(i);
            ba.set("select", sel);
            assert(compare(ba.get('select'), test));
          }
        }
        {
          const ba = new Buttons({multi_select:2, buttons:['1','2','3']});
          var sel = [];
          for (var i = 0; i < ba.get_buttons().length; i++) {
            sel.push(i);
            ba.set("select", sel);
            assert(ba.get("select").length <= 2);
          }
        }
        done();
      });
      n++;
    };

    const add_button1 = (buttons, ...args) => {
      return buttons.add_button(...args);
    };

    const add_button2 = (buttons, options, position) => {
      const component = document.createElement('aux-button');

      if (typeof options === 'string')
      {
        component.label = options;
      }
      else if (typeof options === 'object')
      {
        if (options instanceof Button)
          options = options.options;

        for (let key in options)
        {
          component[key] = options[key];
        }
      }

      const node = buttons.get_buttons()[position];

      if (node)
      {
        buttons.element.insertBefore(component, node.element);
      }
      else
      {
        buttons.element.appendChild(component);
      }

      return component.auxWidget;
    };

    const remove_button1 = (buttons, ...args) => {
      return buttons.remove_button(...args);
    };

    const remove_button2 = (buttons, button) => {
      if (button instanceof Button && button.element.tagName === 'AUX-BUTTON')
      {
        button.element.remove();
      }
      else
      {
        buttons.remove_button(button);
      }
    };

    const select_button1 = (buttons, button) => {
      button.set('state', true);
    };

    const select_button2 = (buttons, button) => {
      let select = buttons.get('select');
      const position = buttons.get_buttons().indexOf(button);

      if (Array.isArray(select))
      {
        select = [ position ].concat(select);
      }
      else
      {
        select = position;
      }

      buttons.set('select', select);
    };

    const select_button3 = (buttons, button) => {
      button.userset('state', true);
    };

    const select_button4 = (buttons, button) => {
      button.element.dispatchEvent(new CustomEvent('click'));
    };

    [ add_button1, add_button2 ].forEach((low_add_button) => {
      const add_button = async (buttons, ...args) => {
        const n = buttons.get_buttons().length;
        const button = low_add_button(buttons, ... args);
        await wait_for_drawn(buttons);
        assert(buttons.get_buttons().length === n+1);
        check_select(buttons);
        return button;
      };
      [ remove_button1, remove_button2 ].forEach((low_remove_button) => {
        const remove_button = async (buttons, ...args) => {
          const n = buttons.get_buttons().length;
          low_remove_button(buttons, ...args);
          await wait_for_drawn(buttons);
          assert(buttons.get_buttons().length === n-1);
          check_select(buttons);
        };
        [ select_button1, select_button2, select_button3, select_button4 ].forEach((low_select_button) => {
          const select_button = (buttons, button) => {
            low_select_button(buttons, button);
            assert(button.get('state'));
            check_select(buttons);
          };
          test(add_button, remove_button, select_button);
        });
      });
    });

});

