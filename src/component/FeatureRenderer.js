Ext.define('GeoExt.component.FeatureRenderer', {
    extend: 'Ext.Component',
    alias: 'widget.gx_renderer',
    config: {
        minWidth: 20,
        minHeight: 20,
        resolution: 1,
        feature: undefined,
        pointFeature: undefined,
        lineFeature: undefined,
        polygonFeature: undefined,
        textFeature: undefined,
        symbolizers: undefined,
        symbolType: "Polygon"
    },
    initComponent: function(){
        var me = this;
        var id = this.getId();
        this.autoEl = {
            tag: "div",
            "class": (this.imgCls ? this.imgCls : ""),
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
        if (!this.getFeature()) {
            this.setFeature(this['get' + this.getSymbolType() + 'Feature']());
        }
        if (this.getSymbolizers()) {
            this.getFeature().setStyle(this.getSymbolizers());
        }
        this.map = new ol.Map({
          controls: [],
          interactions: [],
          layers: [
            new ol.layer.Vector({
              source: new ol.source.Vector({
                features: [this.feature]
              })
            })
          ]
        });
        me.callParent(arguments);
    },
    onRender: function(ct, position) {
        this.callParent(arguments);
        this.drawFeature();
    },
    drawFeature: function() {
      this.map.setTarget(this.el.id);
      this.setRendererDimensions();
    },
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
    }
});
