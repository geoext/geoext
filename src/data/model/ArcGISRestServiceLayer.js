/* Copyright (c) 2022-present The Open Source Geospatial Foundation
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
 * The ArcGISRestServiceLayer model class used by the stores.
 *
 * @class GeoExt.data.model.ArcGISRestServiceLayer
 */
Ext.define('GeoExt.data.model.ArcGISRestServiceLayer', {
    extend: 'GeoExt.data.model.Base',

    fields: [
        {
            name: 'layerId',
            type: 'int'
        },
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'defaultVisibility',
            type: 'boolean'
        },
        {
            name: 'visibility',
            type: 'boolean'
        }
    ]
});
