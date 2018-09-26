Ext.Loader.syncRequire(['GeoExt.data.serializer.Vector']);

describe('GeoExt.data.serializer.Vector', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.data.serializer.Vector).not.to.be(undefined);
        });

    });

    describe('static methods and properties', function() {

        describe('#GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE', function() {

            it('assigns a valid printstyle-type for 6 geometry types',
                function() {
                    var olGeomTypes = [
                        'Point', 'LineString', 'Polygon',
                        'MultiPoint', 'MultiLineString', 'MultiPolygon'
                    ];
                    var cls = GeoExt.data.serializer;
                    var possiblePrintStyles = Ext.Object.getValues(
                        cls.Vector.PRINTSTYLE_TYPES
                    );
                    var lookUp = cls.Vector.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE;
                    Ext.each(olGeomTypes, function(olGeomType) {
                        var printstyle = lookUp[olGeomType];
                        expect(printstyle).to.not.be(undefined);
                        var contained = Ext.Array.contains(
                            possiblePrintStyles, printstyle
                        );
                        expect(contained).to.be(true);
                    });
                }
            );

        });

        describe('#getUid', function() {

            it('throws when called on a non-object', function() {
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(null);
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(undefined);
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(-1);
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(12.345);
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid('Humpty');
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(/abc/);
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid([]);
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(function() {});
                }).to.throwException();
                expect(function() {
                    GeoExt.data.serializer.Vector.getUid(true);
                }).to.throwException();
            });

            it('assigns once, reads out for subsequent calls', function() {
                var obj = {};
                var got = GeoExt.data.serializer.Vector.getUid(obj);
                expect(got).to.not.be(undefined);
                var got2 = GeoExt.data.serializer.Vector.getUid(obj);
                var got3 = GeoExt.data.serializer.Vector.getUid(obj);
                expect(got).to.be(got2);
                expect(got).to.be(got3);
            });

            it('assigns a new property to the passed object', function() {
                var obj = {};
                GeoExt.data.serializer.Vector.getUid(obj);
                var key = GeoExt.data.serializer.Vector.GX_UID_PROPERTY;
                expect(Ext.Object.getSize(obj)).to.be(1);
                expect(obj[key]).to.not.be(undefined);
            });

        });

    });

    describe('serializing behaviour', function() {
        var source = null;
        var layer = null;
        var viewResolution = 38.21851414258813;
        var style0 = null;
        var style1 = null;
        var style2 = null;
        var style3 = null;
        var style4 = null;

        beforeEach(function() {
            var feature0 = new ol.Feature({
                geometry: new ol.geom.Point([0, 0]),
                foo: '0'
            });

            var feature1 = new ol.Feature({
                geometry: new ol.geom.LineString([[0, 0], [1, 1]]),
                foo: '1'
            });

            var feature2 = new ol.Feature({
                geometry: new ol.geom.Polygon([[
                    [0, 0], [1, 1], [1, 0], [0, 0]
                ]]),
                foo: '2'
            });

            var feature3 = new ol.Feature({
                geometry: new ol.geom.Point([0, 0]),
                foo: '3'
            });

            style0 = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: [1, 1, 1, 0.1]
                }),
                image: new ol.style.Circle({
                    radius: 1,
                    stroke: new ol.style.Stroke({
                        width: 1,
                        color: [1, 1, 1, 0.1]
                    })
                }),
                stroke: new ol.style.Stroke({
                    width: 1,
                    color: [1, 1, 1, 0.1]
                })
            });

            // styles for feature0
            var styles0 = [style0];

            style1 = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: [2, 2, 2, 0.2]
                })
            });

            // styles for feature1
            var styles1 = [style0, style1];

            style2 = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: [3, 3, 3, 0.3]
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: [3, 3, 3, 0.3]
                })
            });

            // styles for features2
            var styles2 = [style2];

            style3 = new ol.style.Style({
                text: new ol.style.Text({
                    font: 'normal 16px "sans serif"',
                    text: 'GeoExt3',
                    textAlign: 'left',
                    offsetX: 42,
                    offsetY: -42
                })
            });

            // Here to check that no offset are present
            // if textAlign is not there.
            style4 = new ol.style.Style({
                text: new ol.style.Text({
                    font: 'normal 16px "sans serif"',
                    text: 'Ngeo',
                    offsetX: 42,
                    offsetY: -42
                })
            });

            // styles for features3
            var styles3 = [style3, style4];

            var styleFunction = function(feature) {
                var v = feature.get('foo');
                if (v === '0') {
                    return styles0;
                } else if (v === '1') {
                    return styles1;
                } else if (v === '2') {
                    return styles2;
                } else if (v === '3') {
                    return styles3;
                }
            };

            source = new ol.source.Vector({
                features: [
                    feature0,
                    feature1,
                    feature2,
                    feature3
                ]
            });
            layer = new ol.layer.Vector({
                opacity: 0.8,
                source: source,
                style: styleFunction
            });
        });

        afterEach(function() {
            source = null;
            layer = null;
            style0 = style1 = style2 = style3 = style4 = null;
        });

        it('doesn\'t throw on expected source', function() {
            expect(function() {
                GeoExt.data.serializer.Vector.serialize(
                    layer, source, viewResolution
                );
            }).to.not.throwException();
        });

        it('correctly throws on unexpected source', function() {
            var wrongSource = new ol.source.ImageWMS({
                url: 'http://demo.boundlessgeo.com/geoserver/wms',
                params: {'LAYERS': 'ne:ne'},
                serverType: 'geoserver',
                crossOrigin: ''
            });
            expect(function() {
                GeoExt.data.serializer.Vector.serialize(
                    layer, wrongSource, viewResolution
                );
            }).to.throwException();
        });

        // This test is more or less a copy of the test
        // that is used in camptocamp/ngeo
        // see e.g. https://github.com/camptocamp/ngeo/blob/master/test/
        // spec/services/print.spec.js
        it('serializes as expected', function() {
            var vecSerializer = GeoExt.data.serializer.Vector;

            var styleId0P = vecSerializer.getUid(style0, 'Point');
            var styleId0L = vecSerializer.getUid(style0, 'LineString');
            var styleId1 = vecSerializer.getUid(style1, 'LineString');
            var styleId2 = vecSerializer.getUid(style2, 'Polygon');
            var styleId3 = vecSerializer.getUid(style3, 'Point');
            var styleId4 = vecSerializer.getUid(style4, 'Point');

            var expectedStyle = {
                version: 2
            };
            expectedStyle['[_gx3_style_0 = \'' + styleId0P + '\']'] = {
                symbolizers: [{
                    type: 'point',
                    pointRadius: 1,
                    strokeColor: '#010101',
                    strokeOpacity: 0.1,
                    strokeWidth: 1
                }]
            };
            expectedStyle['[_gx3_style_0 = \'' + styleId0L + '\']'] = {
                symbolizers: [{
                    type: 'line',
                    strokeColor: '#010101',
                    strokeOpacity: 0.1,
                    strokeWidth: 1
                }]
            };
            expectedStyle['[_gx3_style_1 = \'' + styleId1 + '\']'] = {
                symbolizers: [{
                    type: 'line',
                    strokeColor: '#020202',
                    strokeOpacity: 0.2,
                    strokeWidth: 2
                }]
            };
            expectedStyle['[_gx3_style_0 = \'' + styleId2 + '\']'] = {
                symbolizers: [{
                    type: 'polygon',
                    fillColor: '#030303',
                    fillOpacity: 0.3,
                    strokeColor: '#030303',
                    strokeOpacity: 0.3,
                    strokeWidth: 3
                }]
            };
            expectedStyle['[_gx3_style_0 = \'' + styleId3 + '\']'] = {
                symbolizers: [{
                    type: 'Text',
                    fontColor: '#333333', // Default color of ol3
                    fontWeight: 'normal',
                    fontSize: '16px',
                    fontFamily: '"sans serif"',
                    label: 'GeoExt3',
                    labelAlign: 'left',
                    labelXOffset: 42,
                    labelYOffset: 42
                }]
            };
            expectedStyle['[_gx3_style_1 = \'' + styleId4 + '\']'] = {
                symbolizers: [{
                    type: 'Text',
                    fontColor: '#333333', // Default color of ol3
                    fontWeight: 'normal',
                    fontSize: '16px',
                    fontFamily: '"sans serif"',
                    label: 'Ngeo'
                }]
            };

            // the expected properties of feature0
            var properties0 = {
                'foo': '0',
                '_gx3_style_0': styleId0P
            };

            // the expected properties of feature1
            var properties1 = {
                'foo': '1',
                '_gx3_style_0': styleId0L,
                '_gx3_style_1': styleId1
            };

            // the expected properties of feature2
            var properties2 = {
                'foo': '2',
                '_gx3_style_0': styleId2
            };

            // the expected properties of feature3
            var properties3 = {
                'foo': '3',
                '_gx3_style_0': styleId3,
                '_gx3_style_1': styleId4
            };

            // construct the final expected layer serialisation
            var expected = {
                geoJson: {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [0, 0]
                        },
                        properties: properties0
                    }, {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [[0, 0], [1, 1]]
                        },
                        properties: properties1
                    }, {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[0, 0], [1, 1], [1, 0], [0, 0]]]
                        },
                        properties: properties2
                    }, {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [0, 0]
                        },
                        properties: properties3
                    }]
                },
                opacity: 0.8,
                style: expectedStyle,
                type: 'geojson'
            };

            var serialized = GeoExt.data.serializer.Vector.serialize(
                layer, source, viewResolution
            );
            expect(serialized).to.eql(expected);
        });

        it('serializes an empty source with the fallback serialization',
            function() {
                layer = new ol.layer.Vector({
                    source: new ol.source.Vector()
                });
                var serialized = GeoExt.data.serializer.Vector.serialize(
                    layer, layer.getSource(), viewResolution
                );
                expect(serialized).to.eql(
                    GeoExt.data.serializer.Vector.FALLBACK_SERIALIZATION
                );
            }
        );

        it('skips features without geometry', function() {
            layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [
                        new ol.Feature(),
                        new ol.Feature({
                            geometry: null
                        }),
                        new ol.Feature({
                            geometry: new ol.geom.Point([0, 0])
                        })
                    ]
                })
            });
            var serialized = GeoExt.data.serializer.Vector.serialize(
                layer, layer.getSource(), viewResolution
            );
            expect(serialized.geoJson.features.length).to.be(1);
        });

        it('uses a features style function', function() {
            var feat = new ol.Feature({
                geometry: new ol.geom.Point([0, 0])
            });
            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 84,
                    stroke: new ol.style.Stroke({
                        width: 42,
                        color: [255, 0, 0, 0.5]
                    })
                })
            });
            var styleUid = GeoExt.data.serializer.Vector.getUid(style, 'Point');
            feat.setStyle(function() {
                return [style];
            });

            layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [feat]
                })
            });

            var serialized = GeoExt.data.serializer.Vector.serialize(
                layer, layer.getSource(), viewResolution
            );

            var cql = '[_gx3_style_0 = \'' + styleUid + '\']';
            var symbolizer = serialized.style[cql].symbolizers[0];

            expect(symbolizer).to.eql({
                pointRadius: 84,
                strokeColor: '#ff0000',
                strokeOpacity: 0.5,
                strokeWidth: 42,
                type: 'point'
            });
        });

    });

});
