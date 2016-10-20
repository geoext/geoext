Ext.Loader.syncRequire(['GeoExt.data.serializer.TileWMS']);

describe('GeoExt.data.serializer.TileWMS', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.data.serializer.TileWMS).not.to.be(undefined);
        });

    });

    describe('serializing behaviour', function() {
        var source = null;
        var layer = null;
        var viewResolution = 38.21851414258813;

        beforeEach(function() {
            source = new ol.source.TileWMS({
                url: 'http://demo.boundlessgeo.com/geoserver/wms',
                params: {
                    'LAYERS': 'ne:ne',
                    'STYLES': 'point,circle'
                },
                serverType: 'geoserver',
                crossOrigin: ''
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
                GeoExt.data.serializer.TileWMS.serialize(
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
                GeoExt.data.serializer.TileWMS.serialize(
                    layer, wrongSource, viewResolution
                );
            }).to.throwException();
        });

        it('serializes as expected', function() {
            var serialized = GeoExt.data.serializer.TileWMS.serialize(
                layer, source, viewResolution
            );
            var expected = {
                baseURL: 'http://demo.boundlessgeo.com/geoserver/wms',
                customParams: {
                    'LAYERS': 'ne:ne',
                    'STYLES': 'point,circle'
                },
                layers: ['ne:ne'],
                opacity: 1,
                styles: ['point', 'circle'],
                type: 'WMS'
            };
            expect(serialized).to.eql(expected);
        });

    });

});
