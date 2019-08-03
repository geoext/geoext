/* Copyright (c) 2015-present The Open Source Geospatial Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class for detecting if the OpenLayers version is 3.x.x or 4.x.x.
 *
 * @class GeoExt.util.Version
 */
Ext.define('GeoExt.util.Version', {
    statics: {

        /**
        * As OpenLayers itself doesn't has any version methods we check for
        * functionality that is only supported in ol3.
         * @return {boolean} true if ol version is 3.x.x false if 4.x.x
         */
        isOl3: function() {
            return !!(ol.animation && ol.Map.prototype.beforeRender);
        },

        /**
         * Determine if the loaded version of OpenLayers is v.4.x.x.
         * @return {boolean} true if ol version is 4.x.x false if 3.x.x
         */
        isOl4: function() {
            return !this.isOl3();
        }
    }
});
