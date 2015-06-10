Ext.define('GeoExt.data.MapfishPrintProvider', {
    extend: 'Ext.Base',
    mixins: ['Ext.mixin.Observable'],
    requires: [
        'GeoExt.data.model.print.Capability',
        'Ext.data.JsonStore'
    ],

    // Events
    /**
     * @event ready
     * Fires after the PrintCapability store is loaded.
     * @param {GeoExt.data.MapfishPrintProvider} GeoExt.data.MapfishPrintProvider
     * The GeoExt.data.MapfishPrintProvider itself
     */
    // End Events
    config: {
        capabilities: null,
        url: ''
    },

    statics: {
        getSerializedLayers: function(layerStore){
            var serializedLayers = [];
            layerStore.each(function(layerRec) {
                var layer = layerRec.getLayer();
                var source = layer.getSource();
                if (source instanceof ol.source.TileWMS) {
                    var serialized = {
                        "baseURL": source.getUrls()[0],
                        "customParams": source.getParams(),
                        "layers": [
                            source.getParams().LAYERS
                        ],
                        "opacity": layer.getOpacity(),
                        "styles": [""],
                        "type": "WMS"
                    };
                    serializedLayers.push(serialized);
                } else {
                    // TODO implement serialization of other ol.source classes.
                }
            });
            return serializedLayers;
        },

        /**
         * Renders the extent of the printout. Will ensure that the extent is
         * always visible and that the ratio matches the ratio that clientInfo
         * contains
         */
        renderPrintExtent: function(mapPanel, extentLayer, clientInfo){
            var mapPanelWidth = mapPanel.getWidth();
            var mapPanelHeight = mapPanel.getHeight();
            var currentMapRatio = mapPanelWidth / mapPanelHeight;
            var scaleFactor = 0.6;
            var desiredPrintRatio = clientInfo.width / clientInfo.height;
            var targetWidth;
            var targetHeight;
            var geomExtent;
            var feat;

            if (desiredPrintRatio >= currentMapRatio){
                targetWidth = mapPanelWidth * scaleFactor;
                targetHeight = targetWidth / desiredPrintRatio;
            } else {
                targetHeight = mapPanelHeight * scaleFactor;
                targetWidth = targetHeight * desiredPrintRatio;
            }

            geomExtent = mapPanel.getView().calculateExtent([
                targetWidth,
                targetHeight
            ]);
            feat = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));
            extentLayer.getSource().addFeature(feat);
            return feat;
        }
    },

    /**
     * @property
     * The capabiltyRec is an instance of 'GeoExt.data.model.print.Capability'
     * and contains the PrintCapabilities of the Printprovider.
     * @readonly
     */
    capabilityRec: null,

    constructor: function(cfg){
        this.mixins.observable.constructor.call(this, cfg);
        if (!cfg.capabilities && !cfg.url) {
            Ext.Error.raise('Print capabilities or Url required');
        }
        this.initConfig(cfg);
        this.fillCapabilityRec();
    },

    /**
     * @private
     * Creates the store from object or url.
     */
    fillCapabilityRec: function(){
        // enhance checks
        var store;
        var capabilities = this.getCapabilities();
        var url = this.getUrl();
        var fillRecordAndFireEvent = function(){
            this.capabilityRec = store.getAt(0);
            this.fireEvent('ready', this);
        };
        if (capabilities) { // if capability object is passed
            store = Ext.create('Ext.data.JsonStore', {
                model: 'GeoExt.data.model.print.Capability',
                listeners: {
                    datachanged: fillRecordAndFireEvent,
                    scope: this
                }
            });
            store.loadRawData(capabilities);
        } else if (url){ // if servlet url is passed
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                model: 'GeoExt.data.model.print.Capability',
                proxy: {
                    type: 'jsonp',
                    url: url,
                    callbackKey: 'jsonp'
                },
                listeners: {
                    load: fillRecordAndFireEvent,
                    scope: this
                }
            });
        }
    }
});
