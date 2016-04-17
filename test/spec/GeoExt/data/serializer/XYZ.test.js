Ext.Loader.syncRequire(['GeoExt.data.serializer.XYZ']);

describe('GeoExt.data.serializer.XYZ', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.data.serializer.XYZ).not.to.be(undefined);
        });

    });

    describe('serializing behaviour', function() {
        var source = null;
        var layer = null;
        var viewResolution = 38.21851414258813;

        beforeEach(function() {
            source = new ol.source.XYZ({
                url: 'http://geo.nls.uk/maps/towns/glasgow1857/{z}/{x}/{-y}.png'
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
                GeoExt.data.serializer.XYZ.serialize(
                    layer, source
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
                GeoExt.data.serializer.XYZ.serialize(
                    layer, wrongSource, viewResolution
                );
            }).to.throwException();
        });

        it('serializes as expected', function() {
            var serialized = GeoExt.data.serializer.XYZ.serialize(
                layer, source, viewResolution
            );
            var expected = {
                baseURL: 'http://geo.nls.uk/maps/towns/' +
                    'glasgow1857/{z}/{x}/{-y}.png',
                opacity: 1,
                resolutions: [
                    156543.03392804097, 78271.51696402048, 39135.75848201024,
                    19567.87924100512, 9783.93962050256, 4891.96981025128,
                    2445.98490512564, 1222.99245256282, 611.49622628141,
                    305.748113140705, 152.8740565703525, 76.43702828517625,
                    38.21851414258813, 19.109257071294063, 9.554628535647032,
                    4.777314267823516, 2.388657133911758, 1.194328566955879,
                    0.5971642834779395, 0.29858214173896974,
                    0.14929107086948487, 0.07464553543474244,
                    0.03732276771737122, 0.01866138385868561,
                    0.009330691929342804, 0.004665345964671402,
                    0.002332672982335701, 0.0011663364911678506,
                    0.0005831682455839253, 0.00029158412279196264,
                    0.00014579206139598132, 0.00007289603069799066,
                    0.00003644801534899533, 0.000018224007674497665,
                    0.000009112003837248832, 0.000004556001918624416,
                    0.000002278000959312208, 0.000001139000479656104,
                    5.69500239828052e-7, 2.84750119914026e-7,
                    1.42375059957013e-7, 7.11875299785065e-8,
                    3.559376498925325e-8
                ],
                imageExtension: 'png',
                tileSize: [256, 256],
                type: 'OSM'
            };
            expect(serialized).to.eql(expected);
        });

        it('throws if it cannot get an URL', function() {
            var sourceNoUrl = new ol.source.XYZ({});
            var layerNoUrlSource = new ol.layer.Tile({
                source: sourceNoUrl
            });

            expect(function() {
                GeoExt.data.serializer.XYZ.serialize(
                    layerNoUrlSource, sourceNoUrl, viewResolution
                );
            }).to.throwException();
        });

    });

});
