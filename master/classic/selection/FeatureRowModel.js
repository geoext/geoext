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
 * A row selection model which enables automatic selection of features
 * in the map when rows are selected in the grid and vice-versa.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.selection.FeatureModel
 */
Ext.define('GeoExt.selection.FeatureRowModel', {
    // for backwards compatibility
    alternateClassName: 'GeoExt.selection.FeatureModel',
    extend: 'Ext.selection.RowModel',

    alias: [
        'selection.featuremodel', // for backwards compatibility
        'selection.featurerowmodel'
    ],

    mixins: [
        'GeoExt.selection.FeatureModelMixin'
    ]
});
