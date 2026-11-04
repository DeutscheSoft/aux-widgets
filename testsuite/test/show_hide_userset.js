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

import { Widget, Container, Dialog } from '../../src/index.js';
import {
  assert,
  assertEqual,
  waitForDrawn,
  delay,
  makeCallback,
} from './utils/helpers.js';

describe('show/hide userset and transitions', () => {
  describe('Widget', () => {
    it('show/hide return true without userset', () => {
      const w = new Widget({ visible: false });
      assertEqual(w.show(), true);
      assertEqual(w.get('visible'), true);
      assertEqual(w.hide(), true);
      assertEqual(w.get('visible'), false);
      w.destroy();
    });

    it('show(true)/hide(true) go through userset and useraction', () => {
      const w = new Widget({ visible: false });
      const userset = makeCallback();
      const useraction = makeCallback();
      w.subscribe('userset', userset);
      w.subscribe('useraction', useraction);

      assertEqual(w.show(true), true);
      userset.assertArgs('visible', true);
      useraction.assertArgs('visible', true);
      assertEqual(w.get('visible'), true);

      assertEqual(w.hide(true), true);
      userset.assertArgs('visible', false);
      useraction.assertArgs('visible', false);
      assertEqual(w.get('visible'), false);

      userset.assertCalls(0);
      useraction.assertCalls(0);
      w.destroy();
    });

    it('show(true)/hide(true) can be cancelled', () => {
      const w = new Widget({ visible: false });
      w.subscribe('userset', () => false);

      assertEqual(w.show(true), false);
      assertEqual(w.get('visible'), false);

      w.set('visible', true);
      assertEqual(w.hide(true), false);
      assertEqual(w.get('visible'), true);
      w.destroy();
    });

    it('show/hide are no-ops when already in that state', () => {
      const w = new Widget({ visible: true });
      const userset = makeCallback();
      w.subscribe('userset', userset);

      assertEqual(w.show(true), true);
      assertEqual(w.show(), true);
      userset.assertCalls(0);

      w.set('visible', false);
      assertEqual(w.hide(true), true);
      assertEqual(w.hide(), true);
      userset.assertCalls(0);
      w.destroy();
    });
  });

  describe('Container', () => {
    it('with transitions disabled uses boolean visible via super', () => {
      const c = new Container({
        visible: false,
        notransitions: true,
        showing_duration: 100,
        hiding_duration: 100,
      });
      const userset = makeCallback();
      c.subscribe('userset', userset);

      assertEqual(c.show(true), true);
      userset.assertArgs('visible', true);
      assertEqual(c.get('visible'), true);

      assertEqual(c.hide(true), true);
      userset.assertArgs('visible', false);
      assertEqual(c.get('visible'), false);
      c.destroy();
    });

    it('with transitions enabled goes through showing/hiding', async () => {
      const c = new Container({
        visible: false,
        notransitions: false,
        showing_duration: 40,
        hiding_duration: 40,
      });
      const userset = makeCallback();
      c.subscribe('userset', userset);

      assertEqual(c.show(true), true);
      userset.assertArgs('visible', 'showing');
      assertEqual(c.get('visible'), 'showing');

      await waitForDrawn(c);
      await delay(60);
      await waitForDrawn(c);
      assertEqual(c.get('visible'), true);

      assertEqual(c.hide(true), true);
      userset.assertArgs('visible', 'hiding');
      assertEqual(c.get('visible'), 'hiding');
      assert(c.hidden());

      await waitForDrawn(c);
      await delay(60);
      await waitForDrawn(c);
      assertEqual(c.get('visible'), false);
      c.destroy();
    });

    it('cancelling userset leaves transitional show undone', () => {
      const c = new Container({
        visible: false,
        notransitions: false,
        showing_duration: 100,
      });
      c.subscribe('userset', () => false);
      assertEqual(c.show(true), false);
      assertEqual(c.get('visible'), false);
      c.destroy();
    });

    it('programmatic show/hide with transitions do not emit userset', () => {
      const c = new Container({
        visible: false,
        notransitions: false,
        showing_duration: 100,
        hiding_duration: 100,
      });
      const userset = makeCallback();
      c.subscribe('userset', userset);

      assertEqual(c.show(), true);
      assertEqual(c.get('visible'), 'showing');
      assertEqual(c.hide(), true);
      // hide while showing: not hidden() yet ('showing' is not hidden)
      assertEqual(c.get('visible'), 'hiding');
      userset.assertCalls(0);
      c.destroy();
    });
  });

  describe('Dialog', () => {
    it('open/close go through show/hide', async () => {
      const d = new Dialog({
        visible: false,
        notransitions: false,
        showing_duration: 40,
        hiding_duration: 40,
        auto_close: false,
      });
      const opened = makeCallback();
      const closed = makeCallback();
      d.subscribe('open', opened);
      d.subscribe('close', closed);

      assertEqual(d.open(), true);
      assertEqual(d.get('visible'), 'showing');

      await waitForDrawn(d);
      await delay(60);
      await waitForDrawn(d);
      assertEqual(d.get('visible'), true);
      opened.assertCalls(1);

      assertEqual(d.close(), true);
      assertEqual(d.get('visible'), 'hiding');

      await waitForDrawn(d);
      await delay(60);
      await waitForDrawn(d);
      assertEqual(d.get('visible'), false);
      closed.assertCalls(1);
      d.destroy();
    });

    it('open/close are programmatic and do not emit userset', () => {
      const d = new Dialog({
        visible: false,
        notransitions: true,
        auto_close: false,
      });
      const userset = makeCallback();
      d.subscribe('userset', userset);

      assertEqual(d.open(), true);
      assertEqual(d.get('visible'), true);
      assertEqual(d.close(), true);
      assertEqual(d.get('visible'), false);
      userset.assertCalls(0);
      d.destroy();
    });

    it('hide(true) emits userset and can be cancelled', () => {
      const d = new Dialog({
        visible: true,
        notransitions: false,
        hiding_duration: 100,
        auto_close: false,
      });
      d.enableTransitions();
      const userset = makeCallback();
      d.subscribe('userset', userset);

      assertEqual(d.hide(true), true);
      userset.assertArgs('visible', 'hiding');
      assertEqual(d.get('visible'), 'hiding');

      d.set('visible', true);
      d.subscribe('userset', () => false);
      assertEqual(d.hide(true), false);
      assertEqual(d.get('visible'), true);
      d.destroy();
    });
  });
});
