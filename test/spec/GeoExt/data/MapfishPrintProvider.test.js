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

    describe('creates stores from capabilities', function() {
        var provider = null;
        beforeEach(function() {
            provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
                capabilities: printCapabilities
            });
        });
        afterEach(function() {
            provider = null;
        });

        describe('layouts', function() {
            it('creates a store for layouts', function(done) {
                provider.on('ready', function(){
                    var layoutStore = provider.capabilityRec.layouts();
                    expect(layoutStore).to.be.an(Ext.data.Store);
                    expect(layoutStore.getCount()).to.be(1);
                    expect(layoutStore.getAt(0).get('name')).to.be('A4 portrait');
                    done();
                });
            });
        });

        describe('formats', function() {
            it('creates a store for formats', function(done) {
                provider.on('ready', function(){
                    var formats = provider.capabilityRec.get('formats');
                    expect(formats).to.be.an(Array);
                    expect(formats.length).to.be(6);
                    expect(formats[0]).to.be('bmp');
                    done();
                });
            });
        });

        describe('attributes', function() {
            it('creates a store for attributes', function(done) {
                provider.on('ready', function(){
                    var layoutStore = provider.capabilityRec.layouts();
                    var firstLayout = layoutStore.getAt(0);
                    var attributesStore = firstLayout.attributes();
                    var firstAttributes = attributesStore.getAt(0);
                    expect(attributesStore).to.be.an(Ext.data.Store);
                    expect(attributesStore.getCount()).to.be(1);
                    expect(firstAttributes).to.be.a(
                        GeoExt.data.model.PrintLayoutAttributes
                    );
                    expect(firstAttributes.get('name')).to.be('map');
                    expect(firstAttributes.get('type')).to.be('MapAttributeValues');
                    done();
                });
            });
        });
    });

    describe('creates stores from url', function() {
        var provider = null;
        beforeEach(function() {
            provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
                url: "http://webmapcenter.de/print-servlet-3.1.2/print/geoext/capabilities.json"
            });
        });
        afterEach(function() {
            provider = null;
        });

        describe('layouts', function() {
            it('creates a store for layouts', function(done) {
                provider.on('ready', function(){
                    var layoutStore = provider.capabilityRec.layouts();
                    expect(layoutStore).to.be.an(Ext.data.Store);
                    expect(layoutStore.getCount()).to.be(1);
                    expect(layoutStore.getAt(0).get('name')).to.be('A4 portrait');
                    done();
                });
            });
        });

        describe('formats', function() {
            it('creates a store for formats', function(done) {
                provider.on('ready', function(){
                    var formats = provider.capabilityRec.get('formats');
                    expect(formats).to.be.an(Array);
                    expect(formats.length).to.be(6);
                    expect(formats[0]).to.be('bmp');
                    done();
                });
            });
        });

        describe('attributes', function() {
            it('creates a store for attributes', function(done) {
                provider.on('ready', function(){
                    var layoutStore = provider.capabilityRec.layouts();
                    var firstLayout = layoutStore.getAt(0);
                    var attributesStore = firstLayout.attributes();
                    var firstAttributes = attributesStore.getAt(0);
                    expect(attributesStore).to.be.an(Ext.data.Store);
                    expect(attributesStore.getCount()).to.be(1);
                    expect(firstAttributes).to.be.a(
                        GeoExt.data.model.PrintLayoutAttributes
                    );
                    expect(firstAttributes.get('name')).to.be('map');
                    expect(firstAttributes.get('type')).to.be('MapAttributeValues');
                    done();
                });
            });
        });
    });
});
