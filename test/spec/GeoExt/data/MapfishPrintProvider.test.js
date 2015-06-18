Ext.Loader.syncRequire([ 'GeoExt.data.MapfishPrintProvider' ]);

describe('GeoExt.data.MapfishPrintProvider', function() {

    var printCapabilities = {
        "app": "geoext",
        "layouts": [ {
            "name": "A4 portrait",
            "attributes": [ {
                "name": "map",
                "type": "MapAttributeValues",
                "clientParams": {
                    "center": {
                        "type": "double",
                        "isArray": true
                    },
                    "bbox": {
                        "type": "double",
                        "isArray": true
                    },
                    "layers": {
                        "type": "array"
                    },
                    "dpi": {
                        "type": "double"
                    },
                    "areaOfInterest": {
                        "type": "AreaOfInterest",
                        "embeddedType": {
                            "area": {
                                "type": "String"
                            },
                            "renderAsSvg": {
                                "type": "boolean",
                                "default": null
                            },
                            "display": {
                                "type": "AoiDisplay",
                                "embeddedType": {},
                                "default": "RENDER"
                            },
                            "style": {
                                "type": "String",
                                "default": null
                            }
                        }
                    },
                    "scale": {
                        "type": "double",
                        "default": null
                    },
                    "rotation": {
                        "type": "double",
                        "default": null
                    },
                    "projection": {
                        "type": "String",
                        "default": null
                    },
                    "dpiSensitiveStyle": {
                        "type": "boolean",
                        "default": true
                    },
                    "zoomToFeatures": {
                        "type": "ZoomToFeatures",
                        "embeddedType": {
                            "zoomType": {
                                "type": "ZoomType",
                                "embeddedType": {},
                                "default": "EXTENT"
                            },
                            "minMargin": {
                                "type": "int",
                                "default": 10
                            },
                            "minScale": {
                                "type": "double",
                                "default": null
                            },
                            "layer": {
                                "type": "String",
                                "default": null
                            }
                        },
                        "default": null
                    },
                    "useNearestScale": {
                        "type": "boolean",
                        "default": null
                    },
                    "longitudeFirst": {
                        "type": "boolean",
                        "default": null
                    },
                    "useAdjustBounds": {
                        "type": "boolean",
                        "default": null
                    }
                },
                "clientInfo": {
                    "height": 330,
                    "width": 780,
                    "dpiSuggestions": [ 72, 120, 200, 254, 300 ],
                    "maxDPI": 400
                }
            } ]
        } ],
        "formats": [ "bmp", "gif", "pdf", "png", "tif", "tiff" ]
    };

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.MapfishPrintProvider).not.to.be(undefined);
        });
        it('throws if instanciated without capabilities or url', function() {
            expect(function() {
                Ext.create('GeoExt.data.MapfishPrintProvider');
            }).to.throwException();
        });
        it('can be instanciated with capabilities', function() {
            var instance = null;
            expect(function() {
                instance = Ext.create('GeoExt.data.MapfishPrintProvider', {
                    capabilities: printCapabilities
                });
            }).to.not.throwException();
            expect(instance).to.be.a(GeoExt.data.MapfishPrintProvider);
        });
    });

    describe('statics', function() {
        var div,
            extentLayer,
            mapComponent,
            mapPanel,
            layer,
            olMap;

        beforeEach(function(){
            div = document.createElement('div');
            div.style.position = "absolute";
            div.style.top = "0";
            div.style.left = "-1000px";
            div.style.width = "512px";
            div.style.height = "256px";
            document.body.appendChild(div);

            extentLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });

            layer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: 'http://ows.terrestris.de/osm-gray/service',
                    params: {
                        LAYERS: "OSM-WMS"
                    }
                })
            });

            olMap = new ol.Map({
                layers: [layer, extentLayer],
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });

            mapComponent = Ext.create('GeoExt.component.Map', {
                map: olMap
            });

            mapPanel = Ext.create('Ext.panel.Panel', {
                title: 'GeoExt.component.Map Example',
                items: [mapComponent],
                layout: 'fit',
                renderTo: div
            });
        });

        afterEach(function(){
            mapPanel.destroy();
            document.body.removeChild(div);
        });

        it('getSerializedLayers returns the serialized Layers', function(){
            expect(GeoExt.data.MapfishPrintProvider.getSerializedLayers).to.be.a('function');
            var serializedLayers = GeoExt.data.MapfishPrintProvider.getSerializedLayers(mapComponent.getStore());
            var serializedLayer = serializedLayers[0];

            expect(serializedLayers).to.be.an('array');
            expect(serializedLayer.baseURL).to.be(layer.getSource().getUrls()[0]);
            expect(serializedLayer.customParams).to.be(layer.getSource().getParams());
            expect(serializedLayer.layers).to.be.an('array');
            expect(serializedLayer.layers[0]).to.be(layer.getSource().getParams().LAYERS);
            expect(serializedLayer.opacity).to.be(layer.getOpacity());
        });

        // Could be improved
        it('renderPrintExtent returns a printExtent Feature', function(){
            expect(GeoExt.data.MapfishPrintProvider.renderPrintExtent).to.be.a('function');
            var clientInfo = printCapabilities.layouts[0].attributes[0].clientInfo;
            var feat = GeoExt.data.MapfishPrintProvider.renderPrintExtent(mapComponent, extentLayer, clientInfo);
            expect(feat).to.be.an(ol.Feature);
        });

    });

    describe('creates stores from capabilities (directly available)', function() {
        it('directly uses passed capabilities data', function(){
            var provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
                capabilities: printCapabilities
            });
            var layoutStore = provider.capabilityRec.layouts();
            expect(layoutStore).to.be.an(Ext.data.Store);
        });
    });

    describe('creates stores from capabilities (async)', function() {

        describe('layouts', function() {
            it('creates a store for layouts', function(done) {
                Ext.create('GeoExt.data.MapfishPrintProvider', {
                    capabilities: printCapabilities,
                    listeners: {
                        'ready': function(){
                            var layoutStore = this.capabilityRec.layouts();
                            expect(layoutStore).to.be.an(Ext.data.Store);
                            expect(layoutStore.getCount()).to.be(1);
                            expect(layoutStore.getAt(0).get('name')).to.be('A4 portrait');
                            done();
                        }
                    }
                });
            });
        });

        describe('formats', function() {
            it('creates a store for formats', function(done) {
                Ext.create('GeoExt.data.MapfishPrintProvider', {
                    capabilities: printCapabilities,
                    listeners: {
                        'ready': function(){
                            var formats = this.capabilityRec.get('formats');
                            expect(formats).to.be.an(Array);
                            expect(formats.length).to.be(6);
                            expect(formats[0]).to.be('bmp');
                            done();
                        }
                    }
                });
            });
        });

        describe('attributes', function() {
            it('creates a store for attributes', function(done) {
                Ext.create('GeoExt.data.MapfishPrintProvider', {
                    capabilities: printCapabilities,
                    listeners: {
                        'ready': function(){
                            var layoutStore = this.capabilityRec.layouts();
                            var firstLayout = layoutStore.getAt(0);
                            var attributesStore = firstLayout.attributes();
                            var firstAttributes = attributesStore.getAt(0);
                            expect(attributesStore).to.be.an(Ext.data.Store);
                            expect(attributesStore.getCount()).to.be(1);
                            expect(firstAttributes).to.be.a(
                                GeoExt.data.model.print.LayoutAttributes
                            );
                            expect(firstAttributes.get('name')).to.be('map');
                            expect(firstAttributes.get('type')).to.be('MapAttributeValues');
                            done();
                        }
                    }
                });
            });
        });
    });

    describe('creates stores from url (async)', function() {

        describe('layouts', function() {
            it('creates a store for layouts', function(done) {
                var provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
                    url: "http://webmapcenter.de/print-servlet-3.1.2/print/geoext/capabilities.json",
                    listeners: {
                        ready: function(){
                            var layoutStore = provider.capabilityRec.layouts();
                            expect(layoutStore).to.be.an(Ext.data.Store);
                            expect(layoutStore.getCount()).to.be(1);
                            expect(layoutStore.getAt(0).get('name')).to.be('A4 portrait');
                            done();
                        }
                    }
                });
            });
        });

        describe('formats', function() {
            it('creates a store for formats', function(done) {
                Ext.create('GeoExt.data.MapfishPrintProvider', {
                    url: "http://webmapcenter.de/print-servlet-3.1.2/print/geoext/capabilities.json",
                    listeners: {
                        'ready': function(){
                            var formats = this.capabilityRec.get('formats');
                            expect(formats).to.be.an(Array);
                            expect(formats.length).to.be(6);
                            expect(formats[0]).to.be('bmp');
                            done();
                        }
                    }
                });
            });

        });

        describe('attributes', function() {
            it('creates a store for attributes', function(done) {
                Ext.create('GeoExt.data.MapfishPrintProvider', {
                    url: "http://webmapcenter.de/print-servlet-3.1.2/print/geoext/capabilities.json",
                    listeners: {
                        'ready': function(){
                            var layoutStore = this.capabilityRec.layouts();
                            var firstLayout = layoutStore.getAt(0);
                            var attributesStore = firstLayout.attributes();
                            var firstAttributes = attributesStore.getAt(0);
                            expect(attributesStore).to.be.an(Ext.data.Store);
                            expect(attributesStore.getCount()).to.be(1);
                            expect(firstAttributes).to.be.a(
                                GeoExt.data.model.print.LayoutAttributes
                            );
                            expect(firstAttributes.get('name')).to.be('map');
                            expect(firstAttributes.get('type')).to.be('MapAttributeValues');
                            done();
                        }
                    }
                });
            });
        });
    });
});
