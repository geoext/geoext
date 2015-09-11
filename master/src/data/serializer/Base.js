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
 * The base class for all serializers.
 *
 * @class GeoExt.data.serializer.Base
 */
Ext.define('GeoExt.data.serializer.Base', {
    extend: 'Ext.Base',
    requires: [
        'GeoExt.data.MapfishPrintProvider'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.layer.Layer',
        'ol.source.Source'
    ],
    // </debug>

    inheritableStatics: {
        /**
         * The ol.source.Source class that this serializer will serialize.
         *
         * @type {ol.source.Source}
         * @protected
         */
        sourceCls: null,

        /**
         * Serializes the passed source and layer into an object that the
         * Mapfish Print Servlet understands.
         *
         * @param {ol.layer.Layer} layer The layer to serialize.
         * @param {ol.source.Source} source The source of the layer to
         *    serialize.
         * @param {Number} viewRes The resolution of the mapview.
         * @return {Object} a serialized representation of source and layer.
         */
        serialize: function() {
            Ext.raise('This method must be overriden by subclasses.');
        },

        /**
         * Given a subclass of GeoExt.data.serializer.Base, register the class
         * with the GeoExt.data.MapfishPrintProvider. This method is ususally
         * called inside the 'after-create' function of Ext.class definitions.
         *
         * @param {GeoExt.data.serializer.Base} subCls The class to register.
         * @protected
         */
        register: function(subCls) {
            GeoExt.data.MapfishPrintProvider.registerSerializer(
                subCls.sourceCls,
                subCls
            );
        },

        /**
         * Given a concrete ol.source.Source instance, this method checks if
         * the non-abstract subclass is capable of serializing the source. Will
         * throw an exception if the source isn't valid for the serializer.
         *
         * @param {ol.source.Source} source The source to test.
         * @protected
         */
        validateSource: function(source) {
            if (!(source instanceof this.sourceCls)) {
                Ext.raise("Cannot serialize this source with this serializer");
            }
        }
    }
});
