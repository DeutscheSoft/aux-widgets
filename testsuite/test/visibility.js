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

import { Container, Widget } from '../src/index.js';
import { checkVisibility } from '../src/utils/debug.js';

import {
  defineComponent,
  componentFromWidget,
} from '../src/component_helpers.js';

import { waitForDrawn, canvas } from './helpers.js';

const errors = [];

function checkErrors() {
  if (errors.length) {
    const tmp = errors.slice(0);
    errors.length = 0;
    throw tmp[0];
  }
}

function makeDebugWidget(Base) {
  class DebugWidget extends Base {
    initialize(options) {
      options.element = document.createElement('DIV');
      super.initialize(options);
    }

    resize() {
      super.resize();
      this.checkVisibility();
    }

    checkVisibility() {
      try {
        checkVisibility(this);
      } catch (err) {
        errors.push(err);
      }
    }

    redraw() {
      super.redraw();
      this.checkVisibility();
    }
  }

  return DebugWidget;
}

const DebugWidget = makeDebugWidget(Widget);
const DebugContainer = makeDebugWidget(Container);

const DebugWidgetComponent = componentFromWidget(DebugWidget);
const DebugContainerComponent = componentFromWidget(DebugContainer);

defineComponent('debug-widget', DebugWidgetComponent);
defineComponent('debug-container', DebugContainerComponent);

describe('Visibility', () => {
  it('Widget(Widget)', async () => {
    const w = new DebugWidget();
    w.appendChild(new DebugWidget());
    w.show();
    await waitForDrawn(w);
    checkErrors();
  });
  it('Container(Widget)', async () => {
    const container = new DebugContainer();
    const widget = new DebugWidget();
    container.appendChild(widget);
    container.show();

    const check = async () => {
      container.triggerDraw();
      widget.triggerDraw();
      await waitForDrawn(container);
      checkErrors();
    };

    await check();
    container.hideChild(widget);
    await check();
    container.showChild(widget);
    await check();
    container.hide();
    await check();
  });
  it('Container(Container(Widget))', async () => {
    const outer = new DebugContainer();
    const inner = new DebugContainer();
    const widget = new DebugWidget();

    const check = async () => {
      outer.triggerDraw();
      inner.triggerDraw();
      widget.triggerDraw();
      await waitForDrawn(outer);
      checkErrors();
    };

    outer.appendChild(inner);
    inner.appendChild(widget);
    outer.show();

    await check();
    inner.hideChild(widget);
    await check();
    inner.showChild(widget);
    await check();
    outer.hideChild(inner);
    await check();
  });
  it('ContainerComponent(ContainerComponent(WidgetComponent))', async () => {
    const outerComponent = document.createElement('aux-debug-container');
    const innerComponent = document.createElement('aux-debug-container');
    const widgetComponent = document.createElement('aux-debug-widget');

    outerComponent.appendChild(innerComponent);
    innerComponent.appendChild(widgetComponent);

    const outer = outerComponent.auxWidget;
    const inner = innerComponent.auxWidget;
    const widget = widgetComponent.auxWidget;

    const check = async () => {
      outer.triggerDraw();
      inner.triggerDraw();
      widget.triggerDraw();
      await waitForDrawn(outer);
      checkErrors();
    };

    canvas().appendChild(outerComponent);

    await check();
    inner.hideChild(widget);
    await check();
    inner.showChild(widget);
    await check();
    outer.hideChild(inner);
    await check();

    outerComponent.remove();
  });
});
