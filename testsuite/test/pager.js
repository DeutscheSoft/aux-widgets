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

import { Page, Pager, PageComponent, PagerComponent } from '../src/index.js';

import { waitForDrawn, assert, compare, compareOptions } from './helpers.js';

describe('Pager', () => {
  let n = 0;
  const checkShow = (pager) => {
    const list = pager.getPages();
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
  const test = (addPage, removePage, showPage) => {
    it('addPage() variants ' + n, async () => {
      {
        const pager = new Pager();
        const label = 'testing';
        const b1 = await addPage(pager, '', '');
        const b2 = await addPage(pager, '', '');
        const b3 = await addPage(pager, '', new Page({}));
        assert(compareOptions(b1, b2));
        assert(compareOptions(b1, b3));
        showPage(pager, b1);
        showPage(pager, b2);
        showPage(pager, b3);
        await removePage(pager, b1);
        await removePage(pager, b2);
        await removePage(pager, b3);
      }
      {
        // position argument
        const pager = new Pager();
        const b1 = await addPage(pager, '1', '', { title: '1' });
        assert(pager.getPages()[0] === b1);
        const b2 = await addPage(pager, '2', '', { title: '2' }, 0);
        assert(pager.getPages()[0] === b2);
        const b3 = await addPage(pager, '3', '', { title: '3' }, 1);
        assert(pager.getPages()[1] === b3);
        assert(pager.getPages().length === 3);
        let res = pager
          .getPages()
          .map((page) => page.get('title'))
          .join('');
        assert(res === '231');
        await removePage(pager, b1);
        await removePage(pager, b2);
        await removePage(pager, b3);
      }
      {
        const pager = new Pager({ show: 0 });
        const b1 = await addPage(pager, {}, '1');
        assert(b1.get('active'));
        assert(b1.get('visible') === true);
        await removePage(pager, b1);
        assert(pager.get('show') === -1);
        assert(b1.get('active'));
        await addPage(pager, {}, b1);
        assert(pager.get('show') === 0);
        assert(b1.get('visible') === true);

        // remove it again, hide() it and add it back
        await removePage(pager, b1);
        b1.forceHide();
        assert(pager.get('show') === -1);
        assert(b1.get('active'));
        await addPage(pager, {}, b1);
        assert(pager.get('show') === 0);
        assert(b1.get('visible') === true);
      }
    });
    it('show ' + n, async () => {
      const ba = new Pager({
        pages: [{ title: '1' }, { title: '2' }, { title: '3' }],
      });

      const pages = ba.getPages();

      pages.forEach((page) => assert(!page.get('active')));

      for (let i = 0; i < pages.length; i++) {
        showPage(ba, pages[i]);
        for (let j = 0; j < pages.length; j++) {
          if (i !== j) assert(!pages[j].get('active'));
        }
      }

      const page = await addPage(ba, '', '', { active: true });
      assert(page.get('active'));
      assert(page.get('visible') === true);
      pages.forEach((p) => {
        assert(p.get('active') === (p === page));
      });
    });
    n++;
  };

  const addPage1 = (pager, ...args) => {
    return pager.addPage(...args);
  };

  const addPage2 = (pager, buttonOptions, content, options, position) => {
    let component;

    if (content instanceof Page) {
      if (content.element.tagName === 'AUX-PAGE') {
        component = content.element;
      } else {
        options = content.options;
      }
    }

    if (!component) {
      component = document.createElement('aux-page');
    }

    if (typeof content === 'string') {
      component.innerHTML = content;
    }

    if (typeof options === 'object') {
      if (options instanceof Page) options = options.options;

      for (let key in options) {
        component.auxWidget.set(key, options[key]);
      }
    }

    const pages = pager.pages;

    const page = pages.getPages()[position];

    if (page) {
      pages.element.insertBefore(component, page.element);
      assert(pages.element.children[position] === component);
      assert(pages.element.children[position + 1] === page.element);
    } else {
      pages.element.appendChild(component);
    }

    return component.auxWidget;
  };

  const removePage1 = (pages, ...args) => {
    return pages.removePage(...args);
  };

  const removePage2 = (pages, page) => {
    if (page instanceof Page && page.element.tagName === 'AUX-PAGE') {
      page.element.remove();
    } else {
      pages.removePage(page);
    }
  };

  const showPage1 = (pages, page) => {
    page.set('active', true);
  };

  const showPage2 = (pages, page) => {
    const position = pages.getPages().indexOf(page);

    pages.set('show', position);
  };

  const showPage3 = (pages, page) => {
    page.userset('active', true);
  };

  [addPage1, addPage2].forEach((lowAddPage) => {
    const addPage = async (pager, ...args) => {
      const n = pager.getPages().length;
      const page = lowAddPage(pager, ...args);
      await waitForDrawn(pager);
      assert(pager.getPages().length === n + 1);
      checkShow(pager);
      return page;
    };
    [removePage1, removePage2].forEach((lowRemovePage) => {
      const removePage = async (pager, ...args) => {
        const n = pager.getPages().length;
        lowRemovePage(pager, ...args);
        await waitForDrawn(pager);
        assert(pager.getPages().length === n - 1);
        checkShow(pager);
      };
      [showPage1, showPage2, showPage3].forEach((lowShowPage) => {
        const showPage = (pager, page) => {
          lowShowPage(pager, page);
          assert(page.get('active'));
          checkShow(pager);
        };
        test(addPage, removePage, showPage);
      });
    });
  });

  it('Preventing changing pages', async () => {
    const pager = new Pager();
    const label = 'testing';
    const b1 = pager.addPage('', '');
    const b2 = pager.addPage('', '');
    pager.set('show', 1);

    // prevent all changes
    const sub = pager.subscribe('userset', (key, value) => {
      return false;
    });

    pager.navigation.buttons.getButtons()[0].userset('state', true);
    assert(!b1.get('active'));
    sub();
    pager.navigation.buttons.getButtons()[0].userset('state', true);
    assert(b1.get('active'));
  });
});
