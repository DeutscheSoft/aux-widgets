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

import { assertChildren, canvas, waitForDrawn } from './helpers.js';

describe.only('Destroy Widgets', () => {
  const C = canvas();
  const widgets = [
    { name: 'Button', tag: 'aux-button', options: { label: 'Foobar', icon: 'speaker' } },

  ];

  widgets.map((widget) => {
    it(`${widget.name}.destroy()`, async () => {
      const node = document.createElement(widget.tag);
      Object.keys(widget.options).map((option) => {
        node.setAttribute(option, widget.options[option]);
      })
      C.appendChild(node);
      await waitForDrawn(node.auxWidget);
      node.auxWidget.destroy();
      assertChildren(node);
    });
  });
});
