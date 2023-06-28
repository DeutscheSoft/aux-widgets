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

import { defineChildElement } from './../widget_helpers.js';
import {
  CSSSpace,
  getStyle,
  element,
  addClass,
  innerWidth,
  innerHeight,
} from '../utils/dom.js';
import { defineRange } from '../utils/define_range.js';
import { makeSVG } from '../utils/svg.js';
import { error, warn } from '../utils/log.js';
import { Widget, SymResize } from './widget.js';
import { Graph } from './graph.js';
import { ChartHandle } from './charthandle.js';
import { defineChildWidget } from '../child_widget.js';
import { Grid } from './grid.js';
import {
  defineRender,
  defineMeasure,
  deferRender,
  deferMeasure,
} from '../renderer.js';
import { ChildWidgets } from '../utils/child_widgets.js';

function calculateOverlap(X, Y) {
  /* no overlap, return 0 */
  if (X[2] < Y[0] || Y[2] < X[0] || X[3] < Y[1] || Y[3] < X[1]) return 0;

  return (
    (Math.min(X[2], Y[2]) - Math.max(X[0], Y[0])) *
    (Math.min(X[3], Y[3]) - Math.max(X[1], Y[1]))
  );
}

function STOP(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

const SymLabelChanged = Symbol('_label changed');
const SymGraphs = Symbol('graphs changed');

/**
 * Chart is an SVG image containing one or more Graphs. Chart
 * extends {@link Widget} and contains a {@link Grid} and two
 * {@link Range}s.
 *
 * @class Chart
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String|Boolean} [options.label=""] - A label for the Chart.
 *   Set to `false` to remove the label from the DOM.
 * @property {String} [options.label_position="top-left"] - Position of the
 *   label inside of the chart. Possible values are
 *   <code>"top-left"</code>, <code>"top"</code>, <code>"top-right"</code>,
 *   <code>"left"</code>, <code>"center"</code>, <code>"right"</code>,
 *   <code>"bottom-left"</code>, <code>"bottom"</code> and
 *   <code>"bottom-right"</code>.
 * @property {Array<Object>} [options.grid_x=[]] - An array containing
 *   objects with the following optional members to draw the grid:
 * @property {Number} [options.grid_x.pos] - The value where to draw  grid line and corresponding label.
 * @property {String} [options.grid_x.color] - A valid CSS color string to colorize the elements.
 * @property {String} [options.grid_x.class] - A class name for the elements.
 * @property {String} [options.grid_x.label] - A label string.
 * @property {Array<Object>} [options.grid_y=[]] - An array containing
 *   objects with the following optional members to draw the grid:
 * @property {Number} [options.grid_y.pos] - The value where to draw  grid line and corresponding label.
 * @property {String} [options.grid_y.color] - A valid CSS color string to colorize the elements.
 * @property {String} [options.grid_y.class] - A class name for the elements.
 * @property {String} [options.grid_y.label] - A label string.
 * @property {Boolean} [options.show_grid=true] - Set to <code>false</code> to
 *   hide the grid.
 * @property {Function|Object} [options.range_x={}] - Either a function
 *   returning a {@link Range} or an object containing options for a
 *   new {@link Range}.
 * @property {Function|Object} [options.range_y={}] - Either a function
 *   returning a {@link Range} or an object containing options for a
 *   new {@link Range}.
 * @property {Object|Function} [options.range_z={ scale: "linear", min: 0, max: 1 }] -
 *   Either a function returning a {@link Range} or an object
 *   containing options for a new {@link Range}.
 * @property {Number} [options.importance_label=4] - Multiplicator of
 *   square pixels on hit testing labels to gain importance.
 * @property {Number} [options.importance_handle=1] - Multiplicator of
 *   square pixels on hit testing handles to gain importance.
 * @property {Number} [options.importance_border=50] - Multiplicator of
 *   square pixels on hit testing borders to gain importance.
 * @property {Array<Object>} [options.handles=[]] - An array of options for
 *   creating {@link ChartHandle} on init.
 * @property {Array<Object>} [options.graphs=[]] - An array of options for
 *   creating {@link Graph} on init.
 * @property {Boolean} [options.show_handles=true] - Show or hide all
 *   handles.
 * @property {Boolean} [options.square=false] - Keep the Graph as a square.
 *
 */
function geomSet(value, key) {
  this.setStyle(key, value + 'px');
  error("using deprecated '" + key + "' options");
}
export class Chart extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
      width: 'int',
      height: 'int',
      _width: 'int',
      _height: 'int',
      range_x: 'object',
      range_y: 'object',
      range_z: 'object',
      label: 'string',
      label_position: 'string',
      resized: 'boolean',

      importance_label: 'number',
      importance_handle: 'number',
      importance_border: 'number',
      handles: 'array',
      graphs: 'array',
      show_handles: 'boolean',
      depth: 'number',
      square: 'boolean',
    });
  }

  static get options() {
    return {
      grid_x: [],
      grid_y: [],
      range_x: {}, // an object with options for a range for the x axis
      // or a function returning a Range instance (only on init)
      range_y: {}, // an object with options for a range for the y axis
      // or a function returning a Range instance (only on init)
      range_z: { scale: 'linear', min: 0, max: 1 }, // Range z options
      label: '', // a label for the chart
      label_position: 'top-left', // the position of the label
      resized: false,

      importance_label: 4, // multiplicator of square pixels on hit testing
      // labels to gain importance
      importance_handle: 1, // multiplicator of square pixels on hit testing
      // handles to gain importance
      importance_border: 50, // multiplicator of square pixels on hit testing
      // borders to gain importance
      handles: [], // list of bands to create on init
      graphs: [], // list of graphs to create on init
      show_handles: true,
      square: false,
      role: 'group',
    };
  }

  static get static_events() {
    return {
      set_width: geomSet,
      set_height: geomSet,

      mousewheel: STOP,
      DOMMouseScroll: STOP,
      set_depth: function (value) {
        this.range_z.set('basis', value);
      },
    };
  }

  static get renderers() {
    return [
      defineRender(['_width', '_height'], function (_width, _height) {
        const E = this.svg;

        if (_width && _height) {
          E.setAttribute('width', _width + 'px');
          E.setAttribute('height', _height + 'px');
        }
      }),
      defineRender(
        ['label', 'label_position', 'range_x', 'range_y', SymLabelChanged],
        function (label, label_position, range_x, range_y) {
          const _label = this._label;

          if (!_label) return;

          _label.textContent = label;

          return deferMeasure(() => {
            const mtop = parseInt(getStyle(_label, 'margin-top') || 0);
            const mleft = parseInt(getStyle(_label, 'margin-left') || 0);
            const mbottom = parseInt(getStyle(_label, 'margin-bottom') || 0);
            const mright = parseInt(getStyle(_label, 'margin-right') || 0);
            const { height } = _label.getBoundingClientRect();
            const xBasis = range_x.options.basis;
            const yBasis = range_y.options.basis;

            let x, y, anchor;

            switch (label_position) {
              case 'top-left':
                anchor = 'start';
                x = mleft;
                y = mtop + height / 2;
                break;
              case 'top':
                anchor = 'middle';
                x = xBasis / 2;
                y = mtop + height / 2;
                break;
              case 'top-right':
                anchor = 'end';
                x = xBasis - mright;
                y = mtop + height / 2;
                break;
              case 'left':
                anchor = 'start';
                x = mleft;
                y = yBasis / 2;
                break;
              case 'center':
                anchor = 'middle';
                x = xBasis / 2;
                y = yBasis / 2;
                break;
              case 'right':
                anchor = 'end';
                x = xBasis - mright;
                y = yBasis / 2;
                break;
              case 'bottom-left':
                anchor = 'start';
                x = mleft;
                y = yBasis - mtop - height / 2;
                break;
              case 'bottom':
                anchor = 'middle';
                x = xBasis / 2;
                y = yBasis - mbottom - height / 2;
                break;
              case 'bottom-right':
                anchor = 'end';
                x = xBasis - mright;
                y = yBasis - mbottom - height / 2;
                break;
              default:
                warn('Unsupported label_position', label_position);
            }

            return deferRender(() => {
              _label.setAttribute('text-anchor', anchor);
              _label.setAttribute('x', x);
              _label.setAttribute('y', y);
            });
          });
        }
      ),
      defineRender('show_handles', function (show_handles) {
        const style = this._handles.style;
        if (show_handles) {
          style.removeProperty('display');
        } else {
          style.display = 'none';
        }
      }),
      defineMeasure(['square', SymResize], function (square) {
        const E = this.element;
        const SVG = this.svg;

        const tmp = CSSSpace(SVG, 'border', 'padding');
        let w = innerWidth(E) - tmp.left - tmp.right;
        let h = innerHeight(E) - tmp.top - tmp.bottom;

        if (square) {
          w = h = Math.min(h, w);
        }

        this.set('_width', w);
        this.range_x.set('basis', w);
        this.set('_height', h);
        this.range_y.set('basis', h);
      }),
    ];
  }

  initialize(options) {
    let SVG;
    /**
     * @member {Array} Chart#handles - An array containing all {@link ChartHandle} instances.
     */
    if (!options.element) options.element = element('div');
    super.initialize(options);

    /**
     * @member {Range} Chart#range_x - The {@link Range} for the x axis.
     */
    /**
     * @member {Range} Chart#range_y - The {@link Range} for the y axis.
     */
    defineRange(this, this.options.range_x, 'range_x');
    defineRange(this, this.options.range_y, 'range_y');
    defineRange(this, this.options.range_z, 'range_z');
    this.range_y.set('reverse', true);

    /**
     * @member {HTMLDivElement} Chart#element - The main DIV container.
     *   Has class <code>.aux-chart</code>.
     */

    this.svg = SVG = makeSVG('svg');

    if (!this.options.width) this.options.width = this.range_x.options.basis;
    if (!this.options.height) this.options.height = this.range_y.options.basis;

    /**
     * @member {SVGGroup} Chart#_graphs - The SVG group containing all graphs.
     *      Has class <code>.aux-graphs</code>.
     */
    this._graphs = makeSVG('g', { class: 'aux-graphs' });
    SVG.appendChild(this._graphs);

    if (this.options.width) this.set('width', this.options.width);
    if (this.options.height) this.set('height', this.options.height);

    /**
     * @member {SVGGroup} Chart#_handles - The SVG group containing all handles.
     *      Has class <code>.aux-handles</code>.
     */
    this._handles = makeSVG('g', { class: 'aux-handles' });
    SVG.appendChild(this._handles);
    SVG.onselectstart = function () {
      return false;
    };
    this._graphChildren = new ChildWidgets(this, {
      filter: Graph,
    });
    this._graphChildren.forEachAsync((graph) => {
      graph.set('range_x', this.range_x);
      graph.set('range_y', this.range_y);
      this._graphs.appendChild(graph.element);

      /**
       * Is fired when a graph was added. Arguments are the graph
       * and its position in the array.
       *
       * @event Chart#graphadded
       *
       * @param {Graph} graph - The {@link Graph} which was added.
       */
      this.emit('graphadded', graph);

      const sub = graph.subscribe('set', (key) => {
        if (key === 'color' || key === 'class' || key === 'key')
          this.invalidate(SymGraphs);
      });

      this.invalidate(SymGraphs);

      return () => {
        sub();
        /**
         * Is fired when a graph was removed. Arguments are the graph
         * and its position in the array.
         *
         * @event Chart#graphremoved
         *
         * @param {Graph} graph - The {@link Graph} which was removed.
         */
        this.emit('graphremoved', graph);
      };
    });
    this.addHandles(this.options.handles);
    this.addGraphs(this.options.graphs);
  }

  draw(O, element) {
    addClass(element, 'aux-chart');
    element.appendChild(this.svg);

    super.draw(O, element);
  }

  getResizeTargets() {
    return [this.element, this.svg];
  }

  getGraphs() {
    return this._graphChildren.getList();
  }

  getHandles() {
    return this.getChildren().filter((child) => child instanceof ChartHandle);
  }

  destroy() {
    this._graphs.remove();
    this._handles.remove();
    this.svg.remove();
    super.destroy();
  }

  addChild(child) {
    super.addChild(child);

    if (child instanceof ChartHandle) {
      child.set('intersect', this.intersect.bind(this));
      child.set('range_x', () => this.range_x);
      child.set('range_y', () => this.range_y);
      child.set('range_z', () => this.range_z);
      this._handles.appendChild(child.element);
      /**
       * Is fired when a new handle was added.
       *
       * @param {ChartHandle} handle - The {@link ChartHandle} which was added.
       *
       * @event Chart#handleadded
       */
      this.emit('handleadded', child);
    }
  }

  removeChild(child) {
    if (this.isDestructed()) return;
    super.removeChild(child);

    if (child instanceof ChartHandle) {
      const childElement = child.element;
      const _handles = this._handles;

      if (childElement.parentNode === _handles) childElement.remove();

      /**
       * Is fired when a handle was removed.
       *
       * @event Chart#handleremoved
       */
      this.emit('handleremoved', child);
    }
  }

  /**
   * Add a graph to the chart.
   *
   * @method Chart#addGraph
   *
   * @param {Object} graph - The graph to add. This can be either an
   *  instance of {@link Graph} or an object of options to
   *  {@link Graph}.
   *
   * @returns {Object} The instance of {@link Graph}.
   *
   * @emits Chart#graphadded
   */
  addGraph(options) {
    let g;

    if (options instanceof Graph) {
      g = options;
    } else {
      g = new Graph(options);
    }

    this.addChild(g);

    return g;
  }

  /**
   * Add multiple new {@link Graph} to the widget. Options is an array
   * of objects containing options for the new instances of {@link Graph}.
   *
   * @method Chart#addGraphs
   *
   * @param {Array<Object>} options - An array of options objects for the {@link Graph}.
   */
  addGraphs(graphs) {
    for (let i = 0; i < graphs.length; i++) this.addGraph(graphs[i]);
  }

  /**
   * Remove a graph from the chart.
   *
   * @method Chart#removeGraph
   *
   * @param {Graph} graph - The {@link Graph} to remove.
   *
   * @emits Chart#graphremoved
   */
  removeGraph(g) {
    this.removeChild(g);
  }

  /**
   * Remove all graphs from the chart.
   *
   * @method Chart#empty
   *
   * @emits Chart#emptied
   */
  empty() {
    this.getGraphs().forEach((graph) => this.removeChild(graph));
    /**
     * Is fired when all graphs are removed from the chart.
     *
     * @event Chart#emptied
     */
    this.emit('emptied');
  }

  /**
   * Add a new handle to the widget. Options is an object containing
   * options for the {@link ChartHandle}.
   *
   * @method Chart#addHandle
   *
   * @param {Object} [options={ }] - An object containing initial options. - The options for the {@link ChartHandle}.
   * @param {Object} [type=ChartHandle] - A widget class to be used as the new handle.
   *
   * @emits Chart#handleadded
   */
  addHandle(options, type) {
    let handle;

    if (options instanceof ChartHandle) {
      handle = options;
    } else {
      type = type || ChartHandle;
      handle = new type(options);
    }

    this.addChild(handle);

    return handle;
  }

  /**
   * Add multiple new {@link ChartHandle} to the widget. Options is an array
   * of objects containing options for the new instances of {@link ChartHandle}.
   *
   * @method Chart#addHandles
   *
   * @param {Array<Object>} options - An array of options objects for the {@link ChartHandle}.
   * @param {Object} [type=ChartHandle] - A widget class to be used for the new handles.
   */
  addHandles(handles, type) {
    for (let i = 0; i < handles.length; i++) this.addHandle(handles[i], type);
  }

  /**
   * Remove a handle from the widget.
   *
   * @method Chart#removeHandle
   *
   * @param {ChartHandle} handle - The {@link ChartHandle} to remove.
   *
   * @emits Chart#handleremoved
   */
  removeHandle(handle) {
    this.removeChild(handle);
  }

  /**
   * Remove multiple or all {@link ChartHandle} from the widget.
   *
   * @method Chart#removeHandles
   *
   * @param {Array<ChartHandle>} handles - An array of
   *   {@link ChartHandle} instances. If the argument reveals to
   *   `false`, all handles are removed from the widget.
   */
  removeHandles(handles) {
    if (!handles) handles = this.getHandles();

    handles.forEach((handle) => this.removeHandle(handle));

    if (!this.getHandles().length) {
      /**
       * Is fired when all handles are removed.
       *
       * @event Chart#emptied
       */
      this.emit('emptied');
    }
  }

  intersect(X, handle) {
    // this function walks over all known handles and asks for the coords
    // of the label and the handle. Calculates intersecting square pixels
    // according to the importance set in options. Returns an object
    // containing intersect (the amount of intersecting square pixels) and
    // count (the amount of overlapping elements)
    let c = 0;
    let a = 0,
      _a;
    const O = this.options;
    const importance_handle = O.importance_handle;
    const importance_label = O.importance_label;
    const handles = this.getHandles();

    for (let i = 0; i < handles.length; i++) {
      const h = handles[i];
      if (h === handle || !h.get('active') || !h.get('show_handle')) continue;
      _a = calculateOverlap(X, h.getHandlePosition());

      if (_a) {
        c++;
        a += _a * importance_handle;
      }

      _a = calculateOverlap(X, h.label);

      if (_a) {
        c++;
        a += _a * importance_label;
      }
    }
    if (this.bands && this.bands.length) {
      for (let i = 0; i < this.bands.length; i++) {
        const b = this.bands[i];
        if (b === handle || !b.get('active') || !b.get('show_handle')) continue;
        _a = calculateOverlap(X, b.getHandlePosition());

        if (_a > 0) {
          c++;
          a += _a * importance_handle;
        }

        _a = calculateOverlap(X, b.label);
        if (_a > 0) {
          c++;
          a += _a * importance_label;
        }
      }
    }
    /* calculate intersection with border */
    _a = calculateOverlap(X, [
      0,
      0,
      this.range_x.options.basis,
      this.range_y.options.basis,
    ]);
    a += ((X[2] - X[0]) * (X[3] - X[1]) - _a) * O.importance_border;
    return { intersect: a, count: c };
  }
}
/**
 * @member {Grid} Chart#grid - The grid element of the chart.
 *   Has class <code>.aux-grid</code>.
 */
defineChildWidget(Chart, 'grid', {
  create: Grid,
  show: true,
  no_resize: true,
  append: function () {
    this.svg.insertBefore(this.grid.element, this.svg.firstChild);
  },
  map_options: {
    grid_x: 'grid_x',
    grid_y: 'grid_y',
  },
  default_options: function () {
    return {
      range_x: this.range_x,
      range_y: this.range_y,
    };
  },
});
/**
 * @member {SVGText} Chart#_label - The label of the chart.
 *   Has class <code>.aux-label</code>.
 */
defineChildElement(Chart, 'label', {
  option: 'label',
  dependency: SymLabelChanged,
  display_check: function (v) {
    return typeof v === 'string' && v.length;
  },
  create: function () {
    return makeSVG('text', {
      class: 'aux-label',
      style: 'dominant-baseline: central;',
    });
  },
  append: function () {
    const svg = this.svg;
    svg.insertBefore(this._label, svg.firstChild);
  },
});
