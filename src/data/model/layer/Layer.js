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
Ext.define('GeoExt.data.model.layer.Layer', {
    extend: 'GeoExt.data.model.layer.Base',

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    fields: [{
        name: 'source',
        type: 'auto',
        convert: function(v, record){
            var layer = record.getOlLayer();
            if (layer instanceof ol.layer.Layer) {
                return layer.getSource();
            } else {
                return undefined;
            }
        }
    }]
});
