/* Copyright (c) 2015 The Open Source Geospatial Foundation
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
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.model.layer.Base', {
    extend: 'GeoExt.data.model.Base',

    inheritableStatics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         *
         * @param {OpenLayers.Layer} layer
         * @return {GeoExt.data.LayerModel}
         * @static
         */
        createFromLayer: function(layer) {
            return this.getProxy().getReader().readRecords([layer]).records[0];
        }
    },
    fields: [
        {
            name: 'opacity',
            type: 'number',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Base) {
                    return layer.get('opacity');
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'visible',
            type: 'boolean',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Group) {
                    return true;
                } else if (layer instanceof ol.layer.Base) {
                    return layer.get('visible');
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'minResolution',
            type: 'number',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Base) {
                    return layer.get('minResolution');
                } else {
                    return undefined;
                }
            }
        },
        {
            name: 'maxResolution',
            type: 'number',
            convert: function(v, record){
                var layer = record.getOlLayer();
                if (layer instanceof ol.layer.Base) {
                    return layer.get('maxResolution');
                } else {
                    return undefined;
                }
            }
        }
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    /**
     * Returns the {ol.layer.Base} layer object used in this model instance.
     *
     * @return {ol.layer.Base}
     */
    getOlLayer: function() {
        return this.data;
    }
});
