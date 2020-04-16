import {
    Container,
    Pager,
    ContainerComponent,
    PagerComponent
  } from '../src/index.js';

import { wait_for_drawn, assert, compare, compare_options } from './helpers.js';

describe('Pager', () => {
    let n = 0;
    const check_show = (pager) => {
      const list = pager.get_pages();
      const shown = list.filter((b) => b.get('active'));
      const notshown = list.filter((b) => !b.get('active'));

      let show = pager.get('show');

      shown.forEach((b) => {
        assert(show === list.indexOf(b));
      });
      notshown.forEach((b) => {
        assert(show !== list.indexOf(b));
      });
    };
    const test = (add_page, remove_page, show_page) => {
      it("add_page() variants " + n, async () => {
        {
           const pager = new Pager();
           const label = "testing";
           const b1 = await add_page(pager, '', '');
           const b2 = await add_page(pager, '', '');
           const b3 = await add_page(pager, '', new Container({ content: '' }));
           assert(compare_options(b1, b2));
           assert(compare_options(b1, b3));
           show_page(pager, b1);
           show_page(pager, b2);
           show_page(pager, b3);
           await remove_page(pager, b1);
           await remove_page(pager, b2);
           await remove_page(pager, b3);
        }
        {
          // position argument
          const pager = new Pager();
          const b1 = await add_page(pager, '1', '', { title: "1" });
          assert(pager.get_pages()[0] === b1);
          const b2 = await add_page(pager, '2', '', { title: "2" }, 0);
          console.log(pager.get_pages());
          assert(pager.get_pages()[0] === b2);
          const b3 = await add_page(pager, '3', '', { title: "3" }, 1);
          assert(pager.get_pages()[1] === b3);
          assert(pager.get_pages().length === 3);
          let res = pager.get_pages().map((page) => page.get('title')).join('');
          assert(res === "231");
          await remove_page(pager, b1);
          await remove_page(pager, b2);
          await remove_page(pager, b3);
        }
        {
          const pager = new Pager({ show: 0 });
          const b1 = await add_page(pager, {}, "1");
          assert(b1.get('active'));
          assert(b1.get('visible') === true);
          await remove_page(pager, b1);
          assert(pager.get('show') === -1);
          assert(b1.get('active'));
          await add_page(pager, {}, b1);
          assert(pager.get('show') === 0);
          assert(b1.get('visible') === true);

          // remove it again, hide() it and add it back
          await remove_page(pager, b1);
          b1.force_hide();
          assert(pager.get('show') === -1);
          assert(b1.get('active'));
          await add_page(pager, {}, b1);
          assert(pager.get('show') === 0);
          assert(b1.get('visible') === true);
        }
      });
      it('show ' + n, async () => {
          const ba = new Pager({
            pages: [
              { title: '1' },
              { title: '2' },
              { title: '3' }
            ]
          });

          const pages = ba.get_pages();

          pages.forEach((page) => assert(!page.get('active')));

          for (let i = 0; i < pages.length; i++)
          {
            show_page(ba, pages[i]);
            for (let j = 0; j < pages.length; j++)
            {
              if (i !== j)
                assert(!pages[j].get('active'));
            }
          }

          const page = await add_page(ba, '', '', { active: true });
          assert(page.get('active'));
          assert(page.get('visible') === true);
          pages.forEach((p) => { assert(p.get('active') === (p === page)); });
      });
      n++;
    };

    const add_page1 = (pager, ...args) => {
      return pager.add_page(...args);
    };

    const add_page2 = (pager, buttonOptions, content, options, position) => {
      let component;

      if (content instanceof Container)
      {
        if (content.element.tagName === 'AUX-CONTAINER')
        {
          component = content.element;
        }
        else
        {
          options = content.options;
        }
      }

      if (!component)
      {
        component = document.createElement('aux-container');
      }

      if (typeof content === 'string')
      {
        component.content = content;
      }

      if (typeof options === 'object')
      {
        if (options instanceof Container)
          options = options.options;

        for (let key in options)
        {
          component.auxWidget.set(key, options[key]);
        }
      }

      const pages = pager.pages;

      const page = pages.get_pages()[position];

      if (page)
      {
        pages.element.insertBefore(component, page.element);
        assert(pages.element.children[position] === component);
        assert(pages.element.children[position+1] === page.element);
      }
      else
      {
        pages.element.appendChild(component);
      }

      return component.auxWidget;
    };

    const remove_page1 = (pages, ...args) => {
      return pages.remove_page(...args);
    };

    const remove_page2 = (pages, page) => {
      if (page instanceof Container && page.element.tagName === 'AUX-CONTAINER')
      {
        page.element.remove();
      }
      else
      {
        pages.remove_page(page);
      }
    };

    const show_page1 = (pages, page) => {
      page.set('active', true);
    };

    const show_page2 = (pages, page) => {
      const position = pages.get_pages().indexOf(page);

      pages.set('show', position);
    };

    const show_page3 = (pages, page) => {
      page.userset('active', true);
    };

    [ add_page1, add_page2 ].forEach((low_add_page) => {
      const add_page = async (pager, ...args) => {
        const n = pager.get_pages().length;
        const page = low_add_page(pager, ... args);
        await wait_for_drawn(pager);
        assert(pager.get_pages().length === n+1);
        check_show(pager);
        return page;
      };
      [ remove_page1, remove_page2 ].forEach((low_remove_page) => {
        const remove_page = async (pager, ...args) => {
          const n = pager.get_pages().length;
          low_remove_page(pager, ...args);
          await wait_for_drawn(pager);
          assert(pager.get_pages().length === n-1);
          check_show(pager);
        };
        [ show_page1, show_page2, show_page3 ].forEach((low_show_page) => {
          const show_page = (pager, page) => {
            low_show_page(pager, page);
            assert(page.get('active'));
            check_show(pager);
          };
          test(add_page, remove_page, show_page);
        });
      });
    });

});

