/* Copyright (c) 2015-2016 The Open Source Geospatial Foundation
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
 * An Ext.grid.column.Column pre-configured with a GeoExt.FeatureRenderer.
 * This can be used to display the rendering style of a vector feature in a
 * grid column.
 *
 * @class GeoExt.grid.column.Symbolizer
 */
Ext.define('GeoExt.grid.column.Symbolizer', {
    extend: 'Ext.grid.column.Column',
    alternateClassName: 'GeoExt.grid.SymbolizerColumn',
    alias: ['widget.gx_symbolizercolumn'],
    requires: ['GeoExt.component.FeatureRenderer'],

    /**
     * The default renderer method for ol.Feature objects.
     *
     * @param {Object} value The value to render for the current cell.
     * @param {Object} meta A collection of metadata about the current cell; can
     *     be used or modified by the renderer. Recognized properties are:
     *     tdCls, tdAttr, and tdStyle.
     * @param {Ext.data.Model} record The record for the current row.
     * @return {String} The HTML-fragment to render as string.
     */
    defaultRenderer: function(value, meta, record) {
        var me = this;
        var id = Ext.id();

        if (record) {
            var feature = record.olObject;
            var symbolType = 'Line';
            var geometry = feature.getGeometry();

            if (geometry instanceof ol.geom.Point ||
                    geometry instanceof ol.geom.MultiPoint) {
                symbolType = 'Point';
            } else if (geometry instanceof ol.geom.Polygon ||
                       geometry instanceof ol.geom.MultiPolygon) {
                symbolType = 'Polygon';
            }

            var task = new Ext.util.DelayedTask(function() {
                var ct = Ext.get(id);
                // ct for old field may not exist any more during a grid update
                if (ct) {
                    Ext.create('GeoExt.component.FeatureRenderer', {
                        renderTo: ct,
                        symbolizers: me.determineStyle(record),
                        symbolType: symbolType
                    });
                }
            });
            task.delay(0);
        }
        meta.css = 'gx-grid-symbolizercol';
        return Ext.String.format('<div id="{0}"></div>', id);
    },

    /**
     * Determines the style for the given feature record.
     *
     * @param {GeoExt.data.model.Feature} record A feature record to get the
     *     styler for.
     * @return {ol.style.Style[]|ol.style.Style} The style(s) applied to the
     *     given feature record.
     * @private
     */
    determineStyle: function(record) {
        var feature = record.olObject;
        return feature.getStyle() || feature.getStyleFunction() ||
            (record.store ? record.store.layer.getStyle() : null);
    }
});
