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
 * A component that renders a `ol.style.Style` with an optional `ol.Feature`.
 *
 *     @example preview
 *     var poly = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             fill: new ol.style.Fill({color: 'red'})
 *         })
 *     });
 *     var line = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             stroke: new ol.style.Stroke({color: 'orange', width: 3}),
 *         }),
 *         symbolType: 'Line'
 *     });
 *     var point = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             image: new ol.style.Circle({
 *                 radius: 7,
 *                 fill: new ol.style.Fill({color: 'gray'}),
 *                 stroke: new ol.style.Stroke({color: 'black', width: 3}),
 *             })
 *         }),
 *         symbolType: 'Point'
 *     });
 *     var star = Ext.create('GeoExt.component.FeatureRenderer', {
 *         symbolizers: new ol.style.Style({
 *             image: new ol.style.RegularShape({
 *                 fill: new ol.style.Fill({color: 'blue'}),
 *                 stroke: new ol.style.Stroke({color: 'green', width: 3}),
 *                 points: 7,
 *                 radius: 15,
 *                 radius2: 7,
 *                 angle: 0
 *             })
 *         }),
 *         minWidth: 40,
 *         minHeight: 40,
 *         symbolType: 'Point'
 *     });
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Rendering of ol.Features in a panel',
 *         items: [poly, line, point, star],
 *         border: false,
 *         renderTo: Ext.getBody()
 *     });
 *
 * @class GeoExt.component.FeatureRenderer
 */
Ext.define('GeoExt.component.FeatureRenderer', {
    extend: 'Ext.Component',
    alias: 'widget.gx_renderer',
    requires: [
        'GeoExt.util.Version'
    ],
    mixins: [
        'GeoExt.mixin.SymbolCheck'
    ],

    // <debug>
    symbols: [
        'ol.extent.getCenter',
        'ol.extent.getWidth',
        'ol.extent.getHeight',
        'ol.Feature',
        'ol.Feature#getGeometry',
        'ol.Feature#setStyle',
        'ol.geom.Geometry#getExtent',
        'ol.geom.Point',
        'ol.geom.LineString',
        'ol.geom.Polygon',
        'ol.layer.Vector',
        'ol.layer.Vector#getSource',
        'ol.Map#getSize',
        'ol.Map#getView',
        'ol.Map#setView',
        'ol.Map#updateSize',
        'ol.proj.Projection',
        'ol.source.Vector',
        'ol.source.Vector#addFeature',
        'ol.View',
        'ol.View#fit'
    ],
    // </debug>

    /**
     * Fires when the feature is clicked on.
     *
     * @event click
     * @param {GeoExt.component.FeatureRenderer} renderer The feature renderer.
     */

    config: {
        /**
         * Optional class to set on the feature renderer div.
         *
         * @cfg {String}
         */
        imgCls: '',

        /**
         * The minimum width.
         *
         * @cfg {Number}
         */
        minWidth: 20,

        /**
         * The minimum height.
         *
         * @cfg {Number}
         */
        minHeight: 20,

        /**
         * The resolution for the renderer.
         *
         * @cfg {Number}
         */
        resolution: 1,

        /**
         * Optional vector to be drawn.
         *
         * @cfg {ol.Feature}
         */
        feature: undefined,

        /**
         * Feature to use for point swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        pointFeature: undefined,

        /**
         * Feature to use for line swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        lineFeature: undefined,

        /**
         * Feature to use for polygon swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        polygonFeature: undefined,

        /**
         * Feature to use for text label swatches. Optional.
         *
         * @cfg {ol.Feature}
         */
        textFeature: undefined,

        /**
         * An `ol.style.Style` instance or an array of `ol.style.Style`
         * instances for rendering a  feature.  If no symbolizers are
         * provided, the default style from OpenLayers will be used.
         *
         * @cfg {ol.style.Style[]|ol.style.Style}
         */
        symbolizers: undefined,

        /**
         * One of `"Point"`, `"Line"`, `"Polygon"` or `"Text"`.  Only relevant
         * if `feature` is not provided.
         *
         * @cfg {String}
         */
        symbolType: 'Polygon'
    },

    inheritableStatics: {

        /**
         * Determines the style for the given feature record.
         *
         * @param {GeoExt.data.model.Feature} record A feature record to get the
         *     styler for.
         * @return {ol.style.Style[]|ol.style.Style} The style(s) applied to the
         *     given feature record.
         * @public
         */
        determineStyle: function(record) {
            var feature = record.getFeature();
            return feature.getStyle() || feature.getStyleFunction() ||
                (record.store ? record.store.layer.getStyle() : null);
        }

    },

    /**
     * Initialize the GeoExt.component.FeatureRenderer.
     */
    initComponent: function() {
        var me = this;
        var id = me.getId();
        me.autoEl = {
            'id': id,
            'tag': 'div',
            'class': this.getImgCls()
        };
        if (!me.getLineFeature()) {
            me.setLineFeature(new ol.Feature({
                geometry: new ol.geom.LineString([
                    [-8, -3],
                    [-3, 3],
                    [3, -3],
                    [8, 3]
                ])
            }));
        }
        if (!me.getPointFeature()) {
            me.setPointFeature(new ol.Feature({
                geometry: new ol.geom.Point([0, 0])
            }));
        }
        if (!me.getPolygonFeature()) {
            me.setPolygonFeature(new ol.Feature({
                geometry: new ol.geom.Polygon([[
                    [-8, -4],
                    [-6, -6],
                    [6, -6],
                    [8, -4],
                    [8, 4],
                    [6, 6],
                    [-6, 6],
                    [-8, 4]
                ]])
            }));
        }
        if (!me.getTextFeature()) {
            me.setTextFeature(new ol.Feature({
                geometry: new ol.geom.Point([0, 0])
            }));
        }
        me.map = new ol.Map({
            controls: [],
            interactions: [],
            layers: [
                new ol.layer.Vector({
                    source: new ol.source.Vector()
                })
            ]
        });
        var feature = me.getFeature();
        if (!feature) {
            me.setFeature(me['get' + me.getSymbolType() + 'Feature']());
        } else {
            me.applyFeature(feature);
        }
        me.callParent();
    },
    /**
     * Draw the feature when we are rendered.
     *
     * @private
     */
    onRender: function() {
        this.callParent(arguments);
        this.drawFeature();
    },
    /**
     * After rendering we setup our own custom events using #initCustomEvents.
     *
     * @private
     */
    afterRender: function() {
        this.callParent(arguments);
        this.initCustomEvents();
    },
    /**
     * (Re-)Initializes our custom event listeners, mainly #onClick.
     *
     * @private
     */
    initCustomEvents: function() {
        var me = this;
        me.clearCustomEvents();
        me.el.on('click', me.onClick, me);
    },
    /**
     * Unbinds previously bound listeners on #el.
     *
     * @private
     */
    clearCustomEvents: function() {
        var el = this.el;
        if (el && el.clearListeners) {
            el.clearListeners();
        }
    },
    /**
     * Bound to the click event on the #el, this fires the click event.
     *
     * @private
     */
    onClick: function() {
        this.fireEvent('click', this);
    },
    /**
     * Private method called during the destroy sequence.
     *
     * @private
     */
    beforeDestroy: function() {
        var me = this;
        me.clearCustomEvents();
        if (me.map) {
            me.map.setTarget(null);
        }
    },
    /**
     * When resizing has happened, we might need to re-set the renderer's
     * dimensions via #setRendererDimensions.
     *
     * @private
     */
    onResize: function() {
        this.setRendererDimensions();
        this.callParent(arguments);
    },
    /**
     * Draw the feature in the map.
     *
     * @private
     */
    drawFeature: function() {
        var me = this;
        me.map.setTarget(me.el.id); // TODO why not me.el?
        me.setRendererDimensions();
    },
    /**
     * Set the dimension of our renderer, i.e. map and view.
     *
     * @private
     */
    setRendererDimensions: function() {
        var me = this;
        var gb = me.feature.getGeometry().getExtent();
        var gw = ol.extent.getWidth(gb);
        var gh = ol.extent.getHeight(gb);
        /*
         * Determine resolution based on the following rules:
         * 1) always use value specified in config
         * 2) if not specified, use max res based on width or height of element
         * 3) if no width or height, assume a resolution of 1
         */
        var resolution = me.initialConfig.resolution;
        if (!resolution) {
            resolution = Math.max(
                gw / me.width || 0,
                gh / me.height || 0
            ) || 1;
        }
        me.map.setView(new ol.View({
            minResolution: resolution,
            maxResolution: resolution,
            projection: new ol.proj.Projection({
                code: '',
                units: 'pixels'
            })
        }));
        // determine height and width of element
        var width = Math.max(
            me.width || me.getMinWidth(),
            gw / resolution
        );
        var height = Math.max(
            me.height || me.getMinHeight(),
            gh / resolution
        );
        // determine bounds of renderer
        var center = ol.extent.getCenter(gb);
        var bhalfw = width * resolution / 2;
        var bhalfh = height * resolution / 2;
        var bounds = [
            center[0] - bhalfw, center[1] - bhalfh,
            center[0] + bhalfw, center[1] + bhalfh
        ];
        me.el.setSize(Math.round(width), Math.round(height));
        me.map.updateSize();
        // Check for backwards compatibility
        if (GeoExt.util.Version.isOl3()) {
            me.map.getView().fit(bounds, me.map.getSize());
        } else {
            me.map.getView().fit(bounds);
        }
    },
    /**
     * We're setting the symbolizers on the feature.
     *
     * @param {ol.style.Style[]|ol.style.Style} symbolizers The style (or
     *     array of styles) that have been set.
     * @return {ol.style.Style[]|ol.style.Style} The style (or
     *     array of styles) that have been set.
     * @private
     */
    applySymbolizers: function(symbolizers) {
        var feature = this.getFeature();
        if (feature && symbolizers) {
            feature.setStyle(symbolizers);
        }
        return symbolizers;
    },

    /**
     * We're setting the feature and add it to the source.
     *
     * @param {ol.Feature} feature The feature that has been set.
     * @return {ol.Feature} feature The feature that has been set.
     * @private
     */
    applyFeature: function(feature) {
        var symbolizers = this.getSymbolizers();
        if (feature && symbolizers) {
            feature.setStyle(symbolizers);
        }
        if (this.map) {
            var source = this.map.getLayers().item(0).getSource();
            source.clear();
            source.addFeature(feature);
        }
        return feature;
    },

    /**
     * Update the `feature` or `symbolizers` and redraw the feature.
     *
     * Valid options:
     *
     * @param {Object} options Object with properties to be updated.
     * @param {ol.Feature} options.feature The new or updated feature.
     * @param {ol.style.Style[]|ol.style.Style} options.symbolizers The
     *     symbolizers.
     */
    update: function(options) {
        if (options.feature) {
            this.setFeature(options.feature);
        }
        if (options.symbolizers) {
            this.setSymbolizers(options.symbolizers);
        }
    }
});
