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

import { Container } from './container.js';
import { defineClass } from '../widget_helpers.js';
import { DragValue } from '../modules/dragvalue.js';
import { Range } from '../modules/range.js';
import { addStaticEvent } from '../widget_helpers.js';
import { addClass } from '../utils/dom.js';

export const Drag3D = defineClass({
/**
 * Drag3D is a {@link Container} with a collection of three
 * {@link DragValue}s applied. Use the dot notation to get access to
 * the options of the members, e.g. to set the drag angle in x direction
 * use `drag_x.rotation`.
 *
 * @class Drag3D
 * 
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.x] - Value for x direction.
 * @property {Number} [options.y] - Value for y direction.
 * @property {Number} [options.z] - Value for z direction.
 * @property {Number} [options.range_x] - {@link Range} for x direction.
 * @property {Number} [options.range_y] - {@link Range} for y direction.
 * @property {Number} [options.range_z] - {@link Range} for z direction.
 */
  Extends: Container,

  _options: Object.assign(Object.create(Container.prototype._options), {
    x: 'number',
    y: 'number',
    z: 'number',
    range_x: 'object',
    range_y: 'object',
    range_z: 'object',
  }),

  options: {
    x: 0,
    y: 0,
    z: 0,
    range_x: { min: 0, max: 1, basis: 200 },
    range_y: { min: 0, max: 1, basis: 200 },
    range_z: { min: 0, max: 1, basis: 200 },
    'drag_x.rotation': 330,
    'drag_y.rotation': 30,
    'drag_z.rotation': 90,
  },
  static_events: {
    set_range_x: v=>this.range_x = new Range(v),
    set_range_y: v=>this.range_y = new Range(v),
    set_range_z: v=>this.range_z = new Range(v),
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    const O = this.options;
    
    /**
     * @member Drag3D#range_x
     *
     * The {@link Range} for x direction.
     */
    this.range_x = new Range(O.range_x);
    
    /**
     * @member Drag3D#range_y
     *
     * The {@link Range} for y direction.
     */
    this.range_y = new Range(O.range_y);
    
    /**
     * @member Drag3D#range_z
     *
     * The {@link Range} for z direction.
     */
    this.range_z = new Range(O.range_z);
    
    /**
     * @member Drag3D#drag_x
     *
     * The {@link DragValue} for x direction.
     */
    this.drag_x = new DragValue(this, {
      node: this.element,
      limit: true,
      range: ()=>this.range_x,
      get: ()=>this.get('x'),
      set: (v)=>this.userset('x', v),
      direction: 'polar',
      rotation: O['drag_x.rotation'],
      blind_angle: 160,
    });
    
    /**
     * @member Drag3D#drag_y
     *
     * The {@link DragValue} for y direction.
     */
    this.drag_y = new DragValue(this, {
      node: this.element,
      limit: true,
      range: ()=>this.range_y,
      get: ()=>this.get('y'),
      set: (v)=>this.userset('y', v),
      direction: 'polar',
      rotation: O['drag_y.rotation'],
      blind_angle: 160,
    });
    
    /**
     * @member Drag3D#drag_z
     *
     * The {@link DragValue} for z direction.
     */
    this.drag_z = new DragValue(this, {
      node: this.element,
      limit: true,
      range: ()=>this.range_z,
      get: ()=>this.get('z'),
      set: (v)=>this.userset('z', v),
      direction: 'polar',
      rotation: O['drag_z.rotation'],
      blind_angle: 160,
    });
  },
  draw: function (O, element) {
    addClass(element, 'aux-drag3d');
    Container.prototype.draw.call(this, O, element);
  },
});

const setCallback = function (val, key) {
  if (this[name]) this[name].set(key.substr(name.length + 1), val);
};

for (let i in {'x':0, 'y':0, 'z':0}) {
  for (let opt in DragValue.prototype._options) {
    addStaticEvent(Drag3D, 'set_drag_' + i + '.' + opt, setCallback);
    Drag3D.prototype._options['drag_' + i + '.' + opt] = DragValue.prototype._options[opt];
  }
  for (let opt in Range.prototype._options) {
    addStaticEvent(Drag3D, 'set_range_' + i + '.' + opt, setCallback);
    Drag3D.prototype._options['range_' + i + '.' + opt] = Range.prototype._options[opt];
  }
}
