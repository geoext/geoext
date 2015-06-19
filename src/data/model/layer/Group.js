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
Ext.define('GeoExt.data.model.layer.Group', {
    extend: 'GeoExt.data.model.layer.Base',

    hasMany: [ {
       name: 'layer',
       associationKey: 'gxLayers',
       model: 'layer.Base'
    } ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            transform: {
                fn: function(groupLayers) {
                    Ext.each(groupLayers, function(groupLayer) {
                        groupLayer.gxLayers = groupLayer.getLayers().getArray();
                    });
                    return groupLayers;
                }
            }
        }
    },

    fields: [
        {
            type: 'auto',
            name: 'gxLayers'
        }
    ]

//    /**
//     * Returns the {ol.Collection} containing the layer {ol.layer.Base} objects.
//     *
//     * @return {ol.Collection}
//     */
//    getLayers: function() {
//        return this.getLayer().getLayers();
//    }
});
