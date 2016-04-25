Ext.Loader.syncRequire(['GeoExt.data.serializer.Base']);

describe('GeoExt.data.serializer.Base', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.data.serializer.Base).not.to.be(undefined);
        });

    });

    describe('static methods', function() {
        describe('#serialize', function() {

            it('is a function', function() {
                var cls = GeoExt.data.serializer.Base;
                expect(cls.serialize).to.be.a('function');
            });

            it('throws; serialize() must be implemented by subclasses',
                function() {
                    var serialize = GeoExt.data.serializer.Base.serialize;
                    expect(serialize).to.throwException();
                }
            );

        });

        describe('#register', function() {

            it('is a function', function() {
                var cls = GeoExt.data.serializer.Base;
                expect(cls.register).to.be.a('function');
            });

            it('interacts with the MapfishPrintProvider class', function() {
                var registered = GeoExt.data.MapfishPrintProvider._serializers;
                var numBefore = registered.length;
                var cls = GeoExt.data.serializer.Base;
                var mockup = {sourceCls: function() {}};
                cls.register(mockup);
                var numAfter = registered.length;
                expect(numBefore + 1 === numAfter).to.be(true);

                // cleanup
                GeoExt.data.MapfishPrintProvider.unregisterSerializer(mockup);
            });

        });

        describe('#validateSource', function() {
            it('is a function', function() {
                var cls = GeoExt.data.serializer.Base;
                expect(cls.validateSource).to.be.a('function');
            });
        });
    });

    describe('Base class is extendable', function() {
        var PrintProvider = GeoExt.data.MapfishPrintProvider;
        var serializerBefore = null;
        var MySerializer = null;

        beforeEach(function() {
            serializerBefore = PrintProvider.findSerializerBySource(
                new ol.source.BingMaps({
                    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI' +
                        '309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                    imagerySet: 'AerialWithLabels'
                })
            );

            MySerializer = Ext.define('MySerializer', {
                extend: 'GeoExt.data.serializer.Base',
                inheritableStatics: {
                    sourceCls: ol.source.BingMaps,
                    serialize: function() {
                        return {foo: 'bar'};
                    }
                }
            }, function(cls) {
                cls.register(cls);
            });
        });
        afterEach(function() {
            serializerBefore = null;
            PrintProvider.unregisterSerializer(MySerializer);
            delete Ext.ClassManager.classes.MySerializer;
            MySerializer = null;
        });

        it('can be extended and still has the static methods', function() {
            expect(MySerializer.serialize).to.be.a('function');
            expect(MySerializer.register).to.be.a('function');
            expect(MySerializer.validateSource).to.be.a('function');
        });

        it('correctly registers a new serializer', function() {
            expect(serializerBefore).to.be(undefined);
            var serializerAfter = PrintProvider.findSerializerBySource(
                new ol.source.BingMaps({
                    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI' +
                        '309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                    imagerySet: 'AerialWithLabels'
                })
            );
            expect(serializerAfter).to.be(MySerializer);
        });

        it('correctly overwrites serializer', function() {
            expect(MySerializer.serialize()).to.eql({foo: 'bar'});
        });

        it('correctly validates sources', function() {
            var goodSource = new ol.source.BingMaps({
                key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI' +
                    '309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                imagerySet: 'AerialWithLabels'
            });
            var badSource = new ol.source.OSM();
            expect(function() {
                MySerializer.validateSource(goodSource);
            }).to.not.throwException();
            expect(function() {
                MySerializer.validateSource(badSource);
            }).to.throwException();
        });

    });

});
