import {
    Container,
    Pages,
    ContainerComponent,
    PagesComponent
  } from '../src/index.js';

import { wait_for_connected, wait_for_drawn, assert, compare, compare_options } from './helpers.js';

describe('Pages', () => {
    let n = 0;
    const check_show = (pages) => {
      const list = pages.get_pages();
      const shown = list.filter((b) => b.get('active'));
      const notshown = list.filter((b) => !b.get('active'));

      let show = pages.get('show');

      shown.forEach((b) => {
        assert(show === list.indexOf(b));
        assert(!b.hidden());
        assert(b.element.classList.contains('aux-show') ||
               b.element.classList.contains('aux-showing'));
      });
      notshown.forEach((b) => {
        assert(show !== list.indexOf(b));
        assert(b.element.classList.contains('aux-hide') ||
               b.element.classList.contains('aux-hiding'));
        assert(b.hidden());
      });
    };
    const test = (add_page, remove_page, show_page) => {
      it("add_page() variants " + n, async () => {
        {
           const pages = new Pages();
           const label = "testing";
           const b1 = await add_page(pages, '');
           const b2 = await add_page(pages, '');
           const b3 = await add_page(pages, new Container({ content: '' }));
           assert(compare_options(b1, b2));
           assert(compare_options(b1, b3));
           await show_page(pages, b1);
           await show_page(pages, b2);
           await show_page(pages, b3);
           await remove_page(pages, b1);
           await remove_page(pages, b2);
           await remove_page(pages, b3);
        }
        {
          // position argument
          const pages = new Pages();
          const b1 = await add_page(pages, '', void(0), { title: "1" });
          assert(pages.get_pages()[0] === b1);
          const b2 = await add_page(pages, '', 0, { title: "2" });
          assert(pages.get_pages()[0] === b2);
          const b3 = await add_page(pages, '', 1, { title: "3" });
          assert(pages.get_pages()[1] === b3);
          assert(pages.get_pages().length === 3);
          let res = pages.get_pages().map((page) => page.get('title')).join('');
          assert(res === "231");
          await remove_page(pages, b1);
          await remove_page(pages, b2);
          await remove_page(pages, b3);
        }
        {
          const pages = new Pages({ show: 0 });
          const b1 = await add_page(pages, "1");
          assert(b1.get('active'));
          assert(b1.get('visible') === true);
          await remove_page(pages, b1);
          assert(pages.get('show') === -1);
          assert(b1.get('active'));
          await add_page(pages, b1);
          assert(pages.get('show') === 0);
          assert(b1.get('visible') === true);

          // remove it again, hide() it and add it back
          await remove_page(pages, b1);
          b1.force_hide();
          assert(pages.get('show') === -1);
          assert(b1.get('active'));
          await add_page(pages, b1);
          assert(pages.get('show') === 0);
          assert(b1.get('visible') === true);
        }
      });
      it('show ' + n, async () => {
          const ba = new Pages({pages:['1','2','3']});

          const pages = ba.get_pages();

          pages.forEach((page) => assert(!page.get('active')));

          for (let i = 0; i < pages.length; i++)
          {
            await show_page(ba, pages[i]);
            for (let j = 0; j < pages.length; j++)
            {
              if (i !== j)
                assert(!pages[j].get('active'));
            }
          }

          const page = await add_page(ba, '', void(0), { active: true });
          assert(page.get('active'));
          assert(page.get('visible') === true);
          pages.forEach((p) => { assert(p.get('active') === (p === page)); });
      });
      n++;
    };

    const add_page1 = (pages, ...args) => {
      return pages.add_page(...args);
    };

    const add_page2 = (pages, content, position, options) => {
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
      const add_page = async (pages, ...args) => {
        const n = pages.get_pages().length;
        const page = low_add_page(pages, ... args);
        await wait_for_connected(pages);
        assert(pages.get_pages().length === n+1);
        check_show(pages);
        return page;
      };
      [ remove_page1, remove_page2 ].forEach((low_remove_page) => {
        const remove_page = async (pages, ...args) => {
          const n = pages.get_pages().length;
          low_remove_page(pages, ...args);
          await wait_for_connected(pages);
          assert(pages.get_pages().length === n-1);
          check_show(pages);
        };
        [ show_page1, show_page2, show_page3 ].forEach((low_show_page) => {
          const show_page = async (pages, page) => {
            low_show_page(pages, page);
            await wait_for_drawn(pages);
            assert(page.get('active'));
            check_show(pages);
          };
          test(add_page, remove_page, show_page);
        });
      });
    });

});

