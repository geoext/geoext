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

Ext.define('GeoExt.action.Measure', {
    extend: 'GeoExt.action.Draw',

    config: {
        /**
         * @inheritDoc
         */
        text: 'Measure',

        /**
         * Defaults to WGS84.
         * Only used if geodesic = true.
         * @type {ol.Sphere}
         */
        sphere: new ol.Sphere(6378137),

        /**
         * Geodesic calculation of measurement results.
         * @type {Boolean}
         */
        geodesic: true,
        //
        // /**
        //  * Type of measuring tool. May be 'Polygon' or 'LineString'.
        //  * @type {String}
        //  */
        // type: 'Polygon',

        /**
         * Format length output.
         * @param {ol.geom.LineString} line The line.
         * @return {string} The formatted length.
         */
        formatLength: function(line) {
            var length;
            if (this.geodesic) {
                var coordinates = line.getCoordinates();
                length = 0;
                var sourceProj = this.map.getView().getProjection();
                for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                    var c1 = ol.proj
                      .transform(coordinates[i], sourceProj, 'EPSG:4326');
                    var c2 = ol.proj
                      .transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                    length += this.sphere.haversineDistance(c1, c2);
                }
            } else {
                length = Math.round(line.getLength() * 100) / 100;
            }

            var output;
            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
            } else {
                output = (Math.round(length * 100) / 100) + ' ' + 'm';
            }

            return output;
        },

        /**
         * Format area output.
         * @param {ol.geom.Polygon} polygon The polygon.
         * @return {string} Formatted area.
         */
        formatArea: function(polygon) {
            var area;
            if (this.geodesic) {
                var sourceProj = this.map.getView().getProjection();
                var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
                var coordinates = geom.getLinearRing(0).getCoordinates();
                area = Math.abs(this.sphere.geodesicArea(coordinates));
            } else {
                area = polygon.getArea();
            }

            var output;
            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100)
                  + ' ' + 'km<sup>2</sup>';
            } else {
                output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
            }

            return output;
        }
    },

    /**
     * The measure tooltip element.
     * @type {Element}
     * @private
     */
    measureTooltipElement: null,

    /**
     * Overlay to show the measurement.
     * @type {ol.Overlay}
     */
    measureTooltip: null,

    /**
     * Array of tooltips that have been drawn before by this interaction.
     * @type {Array[ol.Overlay]}
     */
    measureTooltips: null,

    constructor: function(config) {
        var supportedTypes = ['LineString', 'Polygon'];
        var type = (config.type || this.config.type);

        if (!type || supportedTypes.indexOf(type) < 0) {
            Ext.Error.raise('Type ' + type + ' unsupported.');
        }

        this.measureTooltips = [];
        this.callParent(arguments);
    },

    /**
     * Adds the measure interaction to the map.
     */
    addInteraction: function() {
        this.callParent(arguments);
        this.createMeasureTooltip();
    },

    /**
     * Removes the interaction from the map.
     */
    removeInteraction: function() {
        // remove existing measure tooltips
        this.measureTooltips.forEach(function(tooltip) {
            this.removeMeasureTooltip(tooltip);
        }, this);
        this.measureTooltips = [];

        this.callParent(arguments);
    },

    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip: function() {
        var config = this.initialConfig;
        var cls = config.tooltipCls;

        this.measureTooltipElement = document.createElement('div');
        this.measureTooltipElement.className = cls + ' ' + cls + '-measure';
        this.measureTooltip = new ol.Overlay({
            element: this.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        config.map.addOverlay(this.measureTooltip);
    },

    /**
     * Removes the provided tooltip from the map.
     * @param  {ol.Overlay} measureTooltip The tooltip to remove.
     */
    removeMeasureTooltip: function(measureTooltip) {
        var config = this.initialConfig;
        var element = measureTooltip.getElement();
        var sketch = measureTooltip.get('sketch');

        if (sketch) {
            config.source.removeFeature(sketch);
            measureTooltip.unset('sketch');
        }

        config.map.removeOverlay(measureTooltip);
        element.parentNode.removeChild(element);
    },

    onDrawStart: function(evt) {
        this.callParent(arguments);
        this.sketch.getGeometry().on('change', this.onGeomertyChange, this);
    },

    onDrawEnd: function() {
        var config = this.initialConfig;
        var cls = config.tooltipCls;

        // make tooltip permanent for the lifetime of this interaction
        this.measureTooltipElement.className = cls + ' ' + cls + '-static';
        this.measureTooltip.setOffset([0, -7]);
        this.measureTooltip.set('sketch', this.sketch);
        this.measureTooltips.push(this.measureTooltip);
        this.measureTooltip = null;
        this.createMeasureTooltip();

        this.sketch.getGeometry().un('change', this.onGeomertyChange, this);

        this.callParent(arguments);
    },

    onGeomertyChange: function(evt) {
        var config = this.initialConfig;
        var geom = evt.target;
        var output;

        if (geom instanceof ol.geom.Polygon) {
            output = config.formatArea(geom);
            this.tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
            output = config.formatLength(geom);
            this.tooltipCoord = geom.getLastCoordinate();
        }

        this.measureTooltipElement.innerHTML = output;
        this.measureTooltip.setPosition(this.tooltipCoord);
    },

    /**
     * Hides the pointer tooltip.
     */
    onViewportMouseOut: function() {
        this.helpTooltipElement.classList.add('hidden');
    }
});
