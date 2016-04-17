Ext.Loader.syncRequire(['GeoExt.data.serializer.WMTS']);

describe('GeoExt.data.serializer.WMTS', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.data.serializer.WMTS).not.to.be(undefined);
        });

    });

    describe('serializing behaviour', function() {
        var source = null;
        var layer = null;
        var projection = ol.proj.get('EPSG:3857');
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;
        var resolutions = new Array(14);
        var matrixIds = new Array(14);
        for (var z = 0; z < 14; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
        }

        beforeEach(function() {
            source = new ol.source.WMTS({
                url: 'http://services.arcgisonline.com/arcgis/rest/services/' +
                    'Demographics/USA_Population_Density/MapServer/WMTS/',
                layer: '0',
                matrixSet: 'EPSG:3857',
                format: 'image/png',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                style: 'default',
                wrapX: true
            });
            layer = new ol.layer.Tile({
                source: source
            });
        });
        afterEach(function() {
            source = null;
            layer = null;
        });

        it('doesn\'t throw on expected source', function() {
            expect(function() {
                GeoExt.data.serializer.WMTS.serialize(layer, source);
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
                GeoExt.data.serializer.WMTS.serialize(layer, wrongSource);
            }).to.throwException();
        });

        it('serializes as expected', function() {
            var serialized = GeoExt.data.serializer.WMTS.serialize(
                layer, source
            );
            var expected =
                {
                    'baseURL': 'http://services.arcgisonline.com/arcgis/rest/' +
                        'services/Demographics/USA_Population_Density/' +
                        'MapServer/WMTS/',
                    'dimensions': [],
                    'dimensionParams': {},
                    'imageFormat': 'image/png',
                    'layer': '0',
                    'matrices': [
                        {
                            'identifier': 0,
                            'scaleDenominator': 559082264.0287178,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                1,
                                1
                            ]
                        },
                        {
                            'identifier': 1,
                            'scaleDenominator': 279541132.0143589,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                2,
                                2
                            ]
                        },
                        {
                            'identifier': 2,
                            'scaleDenominator': 139770566.00717944,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                4,
                                4
                            ]
                        },
                        {
                            'identifier': 3,
                            'scaleDenominator': 69885283.00358972,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                8,
                                8
                            ]
                        },
                        {
                            'identifier': 4,
                            'scaleDenominator': 34942641.50179486,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                16,
                                16
                            ]
                        },
                        {
                            'identifier': 5,
                            'scaleDenominator': 17471320.75089743,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                32,
                                32
                            ]
                        },
                        {
                            'identifier': 6,
                            'scaleDenominator': 8735660.375448715,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                64,
                                64
                            ]
                        },
                        {
                            'identifier': 7,
                            'scaleDenominator': 4367830.1877243575,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                128,
                                128
                            ]
                        },
                        {
                            'identifier': 8,
                            'scaleDenominator': 2183915.0938621787,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                256,
                                256
                            ]
                        },
                        {
                            'identifier': 9,
                            'scaleDenominator': 1091957.5469310894,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                512,
                                512
                            ]
                        },
                        {
                            'identifier': 10,
                            'scaleDenominator': 545978.7734655447,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                1024,
                                1024
                            ]
                        },
                        {
                            'identifier': 11,
                            'scaleDenominator': 272989.38673277234,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                2048,
                                2048
                            ]
                        },
                        {
                            'identifier': 12,
                            'scaleDenominator': 136494.69336638617,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                4096,
                                4096
                            ]
                        },
                        {
                            'identifier': 13,
                            'scaleDenominator': 68247.34668319309,
                            'tileSize': [
                                256,
                                256
                            ],
                            'topLeftCorner': [
                                -20037508.342789244,
                                20037508.342789244
                            ],
                            'matrixSize': [
                                8192,
                                8192
                            ]
                        }
                    ],
                    'matrixSet': 'EPSG:3857',
                    'requestEncoding': 'KVP',
                    'style': 'default',
                    'opacity': '1',
                    'type': 'WMTS',
                    'version': '1.0.0'
                };

            expect(serialized).to.eql(expected);
        });

    });

});
