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

import { Page, Pages, PageComponent, PagesComponent } from '../src/index.js';

import {
  waitForConnected,
  waitForDrawn,
  assert,
  compare,
  compareOptions,
} from './helpers.js';

describe('Pages', () => {
  let n = 0;
  const checkShow = (pages) => {
    const list = pages.getPages();
    const shown = list.filter((b) => b.get('active'));
    const notshown = list.filter((b) => !b.get('active'));

    let show = pages.get('show');

    shown.forEach((b) => {
      assert(show === list.indexOf(b));
      assert(!b.hidden());
      assert(
        b.element.classList.contains('aux-show') ||
          b.element.classList.contains('aux-showing')
      );
    });
    notshown.forEach((b) => {
      assert(show !== list.indexOf(b));
      assert(
        b.element.classList.contains('aux-hide') ||
          b.element.classList.contains('aux-hiding')
      );
      assert(b.hidden());
    });
  };
  const test = (addPage, removePage, showPage) => {
    it('addPage() variants ' + n, async () => {
      {
        const pages = new Pages();
        const label = 'testing';
        const b1 = await addPage(pages, '');
        const b2 = await addPage(pages, '');
        const b3 = await addPage(pages, new Page({}));
        assert(compareOptions(b1, b2));
        assert(compareOptions(b1, b3));
        await showPage(pages, b1);
        await showPage(pages, b2);
        await showPage(pages, b3);
        await removePage(pages, b1);
        await removePage(pages, b2);
        await removePage(pages, b3);
      }
      {
        // position argument
        const pages = new Pages();
        const b1 = await addPage(pages, '', void 0, { title: '1' });
        assert(pages.getPages()[0] === b1);
        const b2 = await addPage(pages, '', 0, { title: '2' });
        assert(pages.getPages()[0] === b2);
        const b3 = await addPage(pages, '', 1, { title: '3' });
        assert(pages.getPages()[1] === b3);
        assert(pages.getPages().length === 3);
        let res = pages
          .getPages()
          .map((page) => page.get('title'))
          .join('');
        assert(res === '231');
        await removePage(pages, b1);
        await removePage(pages, b2);
        await removePage(pages, b3);
      }
      {
        const pages = new Pages({ show: 0 });
        const b1 = await addPage(pages, '1');
        assert(b1.get('active'));
        assert(b1.get('visible') === true);
        await removePage(pages, b1);
        assert(pages.get('show') === -1);
        assert(b1.get('active'));
        await addPage(pages, b1);
        assert(pages.get('show') === 0);
        assert(b1.get('visible') === true);

        // remove it again, hide() it and add it back
        await removePage(pages, b1);
        b1.forceHide();
        assert(pages.get('show') === -1);
        assert(b1.get('active'));
        await addPage(pages, b1);
        assert(pages.get('show') === 0);
        assert(b1.get('visible') === true);
      }
    });
    it('show ' + n, async () => {
      const ba = new Pages({ pages: ['1', '2', '3'] });

      const pages = ba.getPages();

      pages.forEach((page) => assert(!page.get('active')));

      for (let i = 0; i < pages.length; i++) {
        await showPage(ba, pages[i]);
        for (let j = 0; j < pages.length; j++) {
          if (i !== j) assert(!pages[j].get('active'));
        }
      }

      const page = await addPage(ba, '', void 0, { active: true });
      assert(page.get('active'));
      assert(page.get('visible') === true);
      pages.forEach((p) => {
        assert(p.get('active') === (p === page));
      });
    });
    n++;
  };

  const addPage1 = (pages, ...args) => {
    return pages.addPage(...args);
  };

  const addPage2 = (pages, content, position, options) => {
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
    const addPage = async (pages, ...args) => {
      const n = pages.getPages().length;
      const page = lowAddPage(pages, ...args);
      await waitForConnected(pages);
      assert(pages.getPages().length === n + 1);
      await waitForDrawn(pages);
      checkShow(pages);
      return page;
    };
    [removePage1, removePage2].forEach((lowRemovePage) => {
      const removePage = async (pages, ...args) => {
        const n = pages.getPages().length;
        lowRemovePage(pages, ...args);
        await waitForConnected(pages);
        assert(pages.getPages().length === n - 1);
        await waitForDrawn(pages);
        checkShow(pages);
      };
      [showPage1, showPage2, showPage3].forEach((lowShowPage) => {
        const showPage = async (pages, page) => {
          lowShowPage(pages, page);
          await waitForDrawn(pages);
          assert(page.get('active'));
          await waitForDrawn(pages);
          checkShow(pages);
        };
        test(addPage, removePage, showPage);
      });
    });
  });
});
