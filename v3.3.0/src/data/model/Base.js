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
 * @class GeoExt.data.model.Base
 */
Ext.define('GeoExt.data.model.Base', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.identifier.Uuid'
    ],

    identifier: 'uuid',

    schema: {
        id: 'geoext-schema',
        namespace: 'GeoExt.data.model'
    },

    inheritableStatics: {
        /**
         * Loads a record from a provided data structure initializing the models
         * associations. Simply calling Ext.create will not utilize the models
         * configured reader and effectivly sidetrack associations configs.
         * This static helper method makes sure associations are initialized
         * properly and are available with the returned record.
         *
         * Be aware that the provided data may be modified by the models reader
         * initializing associations.
         *
         * @param  {Object} data The data the record will be created with.
         * @return {GeoExt.data.model.Base} The record.
         */
        loadRawData: function(data) {
            var me = this;
            var result = me.getProxy().getReader().readRecords(data || {});
            var records = result.getRecords();
            var success = result.getSuccess();

            if (success && records.length) {
                return records[0];
            }
        }
    }
});
