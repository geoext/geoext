/* Copyright (c) 2015-2017 The Open Source Geospatial Foundation
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
 * A serializer for layers that have an `ol.source.TileWMS` source.
 *
 * @class GeoExt.data.serializer.TileWMS
 */
Ext.define('GeoExt.data.serializer.TileWMS', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.layer.Layer#getOpacity',
        'ol.source.TileWMS',
        'ol.source.TileWMS#getUrls',
        'ol.source.TileWMS#getParams'
    ],
    // </debug>

    inheritableStatics: {
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.TileWMS,

        /**
         * @inheritdoc
         */
        serialize: function(layer, source) {
            this.validateSource(source);
            var styles = source.getParams().STYLES;
            var stylesArray = styles ? styles.split(',') : [''];
            var serialized = {
                baseURL: source.getUrls()[0],
                customParams: source.getParams(),
                layers: [
                    source.getParams().LAYERS
                ],
                opacity: layer.getOpacity(),
                styles: stylesArray,
                type: 'WMS'
            };
            return serialized;
        }
    }
}, function(cls) {
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});
