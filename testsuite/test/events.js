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

import { Base } from '../src/index.js';
import { Events } from '../src/events.js';

for (let C of [Base, Events]) {
  describe('Events', () => {
    it('on()', () => {
      {
        const o = new C();
        let called = false;
        o.on('foo', () => {
          called = true;
        });
        o.emit('foo');
        if (!called) throw new Error('not called');
      }
      {
        const o = new C();
        let called = false;
        o.on('foo', () => {});
        o.on('foo', () => {
          called = true;
        });
        o.on('foo', () => {});
        o.emit('foo');
        if (!called) throw new Error('not called');
      }
    });
    it('off()', () => {
      {
        const o = new C();
        let called = false;

        const cb = () => {
          called = true;
        };
        o.on('foo', cb);
        o.off('foo', cb);
        o.emit('foo');
        if (called) throw new Error('called');
      }
      {
        const o = new C();
        let called = false;

        const cb = () => {
          called = true;
        };
        o.on('foo', cb);
        o.on('foo', () => {});
        o.off('foo', cb);
        o.emit('foo');
        if (called) throw new Error('called');
      }
    });
    it('subscribe()', () => {
      const o = new C();
      let called = false;
      const cb = () => {
        called = true;
      };
      const sub = o.subscribe('foo', cb);

      // check that subscription works
      o.dispatchEvent('foo');
      if (!called) throw new Error('not called');

      // check that unsubscribe works
      called = false;
      sub();
      o.dispatchEvent('foo');
      if (called) throw new Error('called');

      // check that unsubscribe can be called twice
      called = false;
      const sub2 = o.subscribe('foo', cb);
      sub();
      o.dispatchEvent('foo');
      if (!called) throw new Error('not called');
      sub2();
    });
    it('once()', () => {
      const o = new C();
      let called = false;
      const cb = () => {
        called = true;
      };
      const sub = o.once('foo', cb);

      // check that subscription works
      o.dispatchEvent('foo');
      if (!called) throw new Error('not called');

      // check that unsubscribe works
      called = false;
      o.dispatchEvent('foo');
      if (called) throw new Error('called');

      // check that unsubscribe can be called twice
      called = false;
      const sub2 = o.once('foo', cb);
      sub2();
      o.dispatchEvent('foo');
      if (called) throw new Error('called');
    });
    it('reentrance', () => {
      {
        const o = new C();
        let called = false;

        const cb = () => {
          called = true;
        };
        const cb2 = () => {
          o.off('foo', cb2);
        };

        o.on('foo', cb2);
        o.on('foo', cb);
        o.on('foo', () => cb2());

        o.emit('foo');

        if (!called) throw new Error('not called');
      }
      {
        const o = new C();
        let called = false;

        const cb = () => {
          called = true;
        };
        const cb2 = () => {
          o.on('foo', cb);
        };

        o.on('foo', cb2);
        o.on('foo', () => cb2);

        o.emit('foo');

        if (called) throw new Error('called');
      }
    });
    it('error handling', function () {
      {
        const o = new C();
        let called = false;

        const cb = () => {
          called = true;
        };

        o.on('foo', () => {
          throw new Error('ignore me');
        });
        o.on('foo', cb);
        o.emit('foo');

        if (!called) throw new Error('not called');
      }
      {
        const o = new C();
        let called = false;

        o.once('foo', () => {
          called = true;
          throw new Error('ignore me');
        });
        o.emit('foo');
        if (!called) throw new Error('not called');

        called = false;
        o.emit('foo');
        if (called) throw new Error('called');
      }
    });
    it('event termination', function () {
      {
        const o = new C();
        let called = false;

        const cb = () => {
          called = true;
        };

        o.on('foo', () => {
          return false;
        });
        o.on('foo', cb);
        o.emit('foo');

        if (called) throw new Error('called');
      }
      {
        const o = new C();
        let called = false;

        o.once('foo', () => {
          return false;
        });
        o.on('foo', () => {
          called = true;
        });
        o.emit('foo');

        if (called) throw new Error('called');
        if (!o.hasEventListener('foo')) throw new Error('lost');
        o.emit('foo');
        if (!called) throw new Error('not called');
      }
    });
    it('event termination', function () {
      const o = new C();
      o.emit('this_event_does_not_exist');
    });
  });
}
