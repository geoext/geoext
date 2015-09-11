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
 * @class GeoExt.data.model.Layer
 */
Ext.define('GeoExt.data.model.Layer', {
    extend: 'GeoExt.data.model.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.layer.Group',
        'ol.layer.Base',
        'ol.layer.Base#get'
    ],
    // </debug>

    statics: {
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
            name: 'isLayerGroup',
            type: 'boolean',
            convert: function(v, record) {
                var layer = record.getOlLayer();

                if (layer) {
                    return (layer instanceof ol.layer.Group);
                }
            }
        },
        {
            name: 'text',
            type: 'string',
            convert: function(v, record) {
                if (!v && record.get('isLayerGroup')) {
                    return 'ol.layer.Group';
                } else {
                    return v;
                }
            }
        },
        {
            name: 'opacity',
            type: 'number',
            convert: function(v, record) {
                var layer;

                if (record.data instanceof ol.layer.Base) {
                    layer = record.getOlLayer();
                    return layer.get('opacity');
                }
            }
        },
        {
            name: 'minResolution',
            type: 'number',
            convert: function(v, record){
                var layer;

                if (record.data instanceof ol.layer.Base) {
                    layer = record.getOlLayer();
                    return layer.get('minResolution');
                }
            }
        },
        {
            name: 'maxResolution',
            type: 'number',
            convert: function(v, record){
                var layer;

                if (record.data instanceof ol.layer.Base) {
                    layer = record.getOlLayer();
                    return layer.get('maxResolution');
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
        if (this.data instanceof ol.layer.Base) {
            return this.data;
        }
    }
});
