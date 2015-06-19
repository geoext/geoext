/**
 * The feature renderer
 *
 * @class GeoExt.component.FeatureRenderer
 */
Ext.define('GeoExt.component.FeatureRenderer', {
    extend: 'Ext.Component',
    alias: 'widget.gx_renderer',
    /**
     * Fires when the feature is clicked on.
     *
     * Listener arguments:
     *
     *  * renderer - GeoExt.component.FeatureRenderer This feature renderer.
     *
     * @event click
     */
    config: {
        /**
         * Optional class to set on the feature renderer div.
         *
         * @cfg {String}
         */
        imgCls: "",
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
         * One of `"Point"`, `"Line"`, `"Polygon"` or `"Text"`.  Only relevant if
         * `feature` is not provided.
         *
         * @cfg {String}
         */
        symbolType: "Polygon"
    },
    /**
     *
     */
    initComponent: function(){
        var me = this;
        var id = this.getId();
        this.autoEl = {
            tag: "div",
            "class": this.getImgCls(),
            id: id
        };
        if (!this.getLineFeature()) {
            this.setLineFeature(new ol.Feature({
                geometry: new ol.geom.LineString([[-8, -3], [-3, 3], [3, -3], [8, 3]])
            }));
        }
        if (!this.getPointFeature()) {
            this.setPointFeature(new ol.Feature({
                geometry: new ol.geom.Point([0, 0])
            }));
        }
        if (!this.getPolygonFeature()) {
            this.setPolygonFeature(new ol.Feature({
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
        if (!this.getTextFeature()) {
            this.setTextFeature(new ol.Feature({
                geometry: new ol.geom.Point([0, 0])
            }));
        }
        this.map = new ol.Map({
          controls: [],
          interactions: [],
          layers: [
            new ol.layer.Vector({
              source: new ol.source.Vector()
            })
          ]
        });
        var feature = this.getFeature();
        if (!feature) {
            this.setFeature(this['get' + this.getSymbolType() + 'Feature']());
        } else {
            this.applyFeature(feature);
        }
        me.callParent(arguments);
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
        this.clearCustomEvents();
        this.el.on("click", this.onClick, this);
    },
    /**
     * Unbinds previously bound listeners on #el.
     *
     * @private
     */
    clearCustomEvents: function() {
        if (this.el && this.el.clearListeners) {
            this.el.clearListeners();
        }
    },
    /**
     * Bound to the click event on the #el, this fires the click event.
     *
     * @private
     */
    onClick: function() {
        this.fireEvent("click", this);
    },
    /**
     * Private method called during the destroy sequence.
     *
     * @private
     */
    beforeDestroy: function() {
        this.clearCustomEvents();
        if (this.map) {
            this.map.setTarget(null);
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
      this.map.setTarget(this.el.id);
      this.setRendererDimensions();
    },
    /**
     * Set the dimension of our renderer, i.e. map and view.
     *
     * @private
     */
    setRendererDimensions: function() {
        var gb = this.feature.getGeometry().getExtent();
        var gw = ol.extent.getWidth(gb);
        var gh = ol.extent.getHeight(gb);
        /*
         * Determine resolution based on the following rules:
         * 1) always use value specified in config
         * 2) if not specified, use max res based on width or height of element
         * 3) if no width or height, assume a resolution of 1
         */
        var resolution = this.initialConfig.resolution;
        if(!resolution) {
            resolution = Math.max(gw / this.width || 0, gh / this.height || 0) || 1;
        }
        this.map.setView(new ol.View({
            minResolution: resolution,
            maxResolution: resolution,
            projection: new ol.proj.Projection({
                units: 'pixels'
            })
        }));
        // determine height and width of element
        var width = Math.max(this.width || this.getMinWidth(), gw / resolution);
        var height = Math.max(this.height || this.getMinHeight(), gh / resolution);
        // determine bounds of renderer
        var center = ol.extent.getCenter(gb);
        var bhalfw = width * resolution / 2;
        var bhalfh = height * resolution / 2;
        var bounds = [
            center[0] - bhalfw, center[1] - bhalfh,
            center[0] + bhalfw, center[1] + bhalfh
            ];
        this.el.setSize(Math.round(width), Math.round(height));
        this.map.updateSize();
        this.map.getView().fitExtent(bounds, this.map.getSize());
    },
    /**
     * We're setting the symbolizers on the feature.
     *
     * @param {ol.style.Style[]|ol.style.Style} symbolizers
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
     * @param {ol.Feature} feature
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
     * @param options {Object} Object with properties to be updated.
     * @param options.feature {ol.Feature} The new or updated
     *     feature.
     * @param options.symbolizers {ol.style.Style[]|ol.style.Style}
     *     Symbolizers.
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
