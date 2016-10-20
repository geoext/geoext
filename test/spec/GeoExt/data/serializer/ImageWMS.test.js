Ext.Loader.syncRequire(['GeoExt.data.serializer.ImageWMS']);

describe('GeoExt.data.serializer.ImageWMS', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.data.serializer.ImageWMS).not.to.be(undefined);
        });

    });

    describe('serializing behaviour', function() {
        var source = null;
        var layer = null;
        var viewResolution = 38.21851414258813;

        beforeEach(function() {
            source = new ol.source.ImageWMS({
                url: 'http://demo.boundlessgeo.com/geoserver/wms',
                params: {
                    'LAYERS': 'ne:ne',
                    'STYLES': 'point'
                },
                serverType: 'geoserver',
                crossOrigin: ''
            });
            layer = new ol.layer.Image({
                source: source
            });
        });
        afterEach(function() {
            source = null;
            layer = null;
        });

        it('doesn\'t throw on expected source', function() {
            expect(function() {
                GeoExt.data.serializer.ImageWMS.serialize(
                    layer, source, viewResolution
                );
            }).to.not.throwException();
        });

        it('correctly throws on unexpected source', function() {
            var wrongSource = new ol.source.TileWMS({
                urls: ['http://demo.boundlessgeo.com/geoserver/wms'],
                params: {'LAYERS': 'ne:ne'},
                serverType: 'geoserver',
                crossOrigin: ''
            });
            expect(function() {
                GeoExt.data.serializer.ImageWMS.serialize(
                    layer, wrongSource, viewResolution
                );
            }).to.throwException();
        });

        it('serializes as expected', function() {
            var serialized = GeoExt.data.serializer.ImageWMS.serialize(
                layer, source, viewResolution
            );

            var expected = {
                baseURL: 'http://demo.boundlessgeo.com/geoserver/wms',
                customParams: {
                    'LAYERS': 'ne:ne',
                    'STYLES': 'point'
                },
                layers: ['ne:ne'],
                opacity: 1,
                styles: ['point'],
                type: 'WMS'
            };
            expect(serialized).to.eql(expected);
        });

    });

});
