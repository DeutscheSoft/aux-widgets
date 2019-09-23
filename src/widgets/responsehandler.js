/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */
 
import { define_class } from './../widget_helpers.js';
import { FrequencyResponse } from './frequencyresponse.js';
import { add_class } from '../utils/dom.js';
    
export const ResponseHandler = define_class({
    /**
     * ResponseHandler is a FrequencyResponse adding some ResponseHandles. It is
     * meant as a universal user interface for equalizers and the like.
     * 
     * This class is deprecated since all relevant functionality went into
     * the base class Graph. Use FrequencyResponse instead.
     *
     * @class ResponseHandler
     * 
     * @extends FrequencyResponse
     */
    _class: "ResponseHandler",
    Extends: FrequencyResponse,
    initialize: function (options) {
        FrequencyResponse.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} ResponseHandler#element - The main DIV container.
         *   Has class <code.aux-response-handler</code>.
         */
        add_class(this.element, "aux-response-handler");
        /**
         * @member {SVGImage} ResponseHandler#_handles - An SVG group element containing all {@link ResponseHandle} graphics.
         *   Has class <code.aux-response-handles</code>.
         */
        add_class(this._handles, "aux-response-handles");
    },
});
