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
 * A serializer for layer that have a `ol.source.WMTS` source.
 *
 * This class is heavily inspired by the excellent `ngeo` Print service class:
 * [camptocamp/ngeo](https://github.com/camptocamp/ngeo).
 *
 * @class GeoExt.data.serializer.WMTS
 */
Ext.define('GeoExt.data.serializer.WMTS', {
    extend: 'GeoExt.data.serializer.Base',
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.proj.Projection#getMetersPerUnit',
        'ol.size.toSize',
        'ol.source.WMTS',
        'ol.source.WMTS#getDimensions',
        'ol.source.WMTS#getFormat',
        'ol.source.WMTS#getLayer',
        'ol.source.WMTS#getMatrixSet',
        'ol.source.WMTS#getProjection',
        'ol.source.WMTS#getRequestEncoding',
        'ol.source.WMTS#getStyle',
        'ol.source.WMTS#getTileGrid',
        'ol.source.WMTS#getUrls',
        'ol.source.WMTS#getVersion',
        'ol.tilegrid.WMTS#getMatrixIds',
        'ol.tilegrid.WMTS#getOrigin',
        'ol.tilegrid.WMTS#getResolution'
    ],
    // </debug>

    inheritableStatics: {
        /**
         * @inheritdoc
         */
        sourceCls: ol.source.WMTS,

        /**
         * @inheritdoc
         */
        serialize: function(layer, source) {
            this.validateSource(source);

            var projection = source.getProjection();
            var tileGrid = source.getTileGrid();
            var dimensions = source.getDimensions();
            var dimensionKeys = Ext.Object.getKeys(dimensions);
            var matrixIds = tileGrid.getMatrixIds();
            var matrices = [];

            Ext.each(matrixIds, function(matrix, idx) {
                var sqrZ = Math.pow(2, idx);
                matrices.push(
                    {
                        identifier: matrix,
                        scaleDenominator: tileGrid.getResolution(idx) *
                            projection.getMetersPerUnit() / 0.28E-3,
                        tileSize: ol.size.toSize(tileGrid.getTileSize(idx)),
                        topLeftCorner: tileGrid.getOrigin(idx),
                        matrixSize: [sqrZ, sqrZ]
                    }
                );
            });

            var serialized = {
                "baseURL": source.getUrls()[0],
                "dimensions": dimensionKeys,
                "dimensionParams": dimensions,
                "imageFormat": source.getFormat(),
                "layer": source.getLayer(),
                "matrices": matrices,
                "matrixSet": source.getMatrixSet(),
                "opacity": layer.getOpacity(),
                "requestEncoding": source.getRequestEncoding(),
                "style": source.getStyle(),
                "type": "WMTS",
                "version": source.getVersion()
            };
            return serialized;
        }
    }
}, function(cls) {
    // Register this serializer via the inherited method `register`.
    cls.register(cls);
});
