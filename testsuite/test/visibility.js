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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { Container, Widget } from '../src/index.js';

import { define_class } from '../src/widget_helpers.js';

import { check_visibility } from '../src/utils/debug.js';

import {
  define_component,
  component_from_widget,
} from '../src/component_helpers.js';

import { wait_for_drawn, canvas } from './helpers.js';

const errors = [];

function check_errors() {
  if (errors.length) {
    const tmp = errors.slice(0);
    errors.length = 0;
    throw tmp[0];
  }
}

function make_debug_widget(Base) {
  const DebugWidget = define_class({
    Extends: Base,
    initialize: function (options) {
      options.element = document.createElement('DIV');
      Base.prototype.initialize.call(this, options);
    },
    resize: function () {
      Base.prototype.resize.call(this);
      this.check_visibility();
    },
    check_visibility: function () {
      try {
        check_visibility(this);
      } catch (err) {
        errors.push(err);
      }
    },
    redraw: function () {
      Base.prototype.redraw.call(this);
      this.check_visibility();
    },
  });

  return DebugWidget;
}

const DebugWidget = make_debug_widget(Widget);
const DebugContainer = make_debug_widget(Container);

const DebugWidgetComponent = component_from_widget(DebugWidget);
const DebugContainerComponent = component_from_widget(DebugContainer);

define_component('debug-widget', DebugWidgetComponent);
define_component('debug-container', DebugContainerComponent);

describe('Visibility', () => {
  it('Widget(Widget)', async () => {
    const w = new DebugWidget();
    w.append_child(new DebugWidget());
    w.show();
    await wait_for_drawn(w);
    check_errors();
  });
  it('Container(Widget)', async () => {
    const container = new DebugContainer();
    const widget = new DebugWidget();
    container.append_child(widget);
    container.show();

    const check = async () => {
      container.trigger_draw();
      widget.trigger_draw();
      await wait_for_drawn(container);
      check_errors();
    };

    await check();
    container.hide_child(widget);
    await check();
    container.show_child(widget);
    await check();
    container.hide();
    await check();
  });
  it('Container(Container(Widget))', async () => {
    const outer = new DebugContainer();
    const inner = new DebugContainer();
    const widget = new DebugWidget();

    const check = async () => {
      outer.trigger_draw();
      inner.trigger_draw();
      widget.trigger_draw();
      await wait_for_drawn(outer);
      check_errors();
    };

    outer.append_child(inner);
    inner.append_child(widget);
    outer.show();

    await check();
    inner.hide_child(widget);
    await check();
    inner.show_child(widget);
    await check();
    outer.hide_child(inner);
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
      outer.trigger_draw();
      inner.trigger_draw();
      widget.trigger_draw();
      await wait_for_drawn(outer);
      check_errors();
    };

    canvas().appendChild(outerComponent);

    await check();
    inner.hide_child(widget);
    await check();
    inner.show_child(widget);
    await check();
    outer.hide_child(inner);
    await check();

    outerComponent.remove();
  });
});
