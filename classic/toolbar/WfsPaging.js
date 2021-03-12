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
 * A paging toolbar which can be used in combination with a OGC WFS by using
 * the `GeoExt.data.store.WfsFeatures` class.
 *
 * **CAUTION: This class is only usable in applications using the classic
 * toolkit of ExtJS 6.**
 *
 * @class GeoExt.toolbar.WfsPaging
 */
Ext.define('GeoExt.toolbar.WfsPaging', {
    extend: 'Ext.toolbar.Paging',
    xtype: 'gx_wfspaging_toolbar',

    /**
     * Ensures that the 'gx-wfsstoreload' event of the WFS store is bound to the
     * onLoad function of this toolbar once we have the store bound.
     */
    onBindStore: function() {
        var me = this;
        me.callParent(arguments);
        me.store.on('gx-wfsstoreload', me.onLoad, me);
    }
});
