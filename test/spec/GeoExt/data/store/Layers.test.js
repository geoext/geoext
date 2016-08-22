Ext.Loader.syncRequire(['GeoExt.data.store.Layers']);

describe('GeoExt.data.store.Layers', function() {

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.store.Layers).not.to.be(undefined);
        });

        describe('constructor', function() {
            it('throws if no map component provided', function() {
                expect(function() {
                    Ext.create('GeoExt.data.store.Layers');
                }).to.throwException();
            });
        });
    });

    describe('function "bindMap"', function() {
        var store;
        var map;
        beforeEach(function() {
            var layer = new ol.layer.Vector();
            map = new ol.Map({
                layers: [layer]
            });
            store = Ext.create('GeoExt.data.store.Layers', {map: map});
        });

        it('exists', function() {
            expect(store.bindMap).not.to.be(undefined);
        });

        it('applies the map correctly', function() {
            expect(store.map).to.be(map);
        });
    });

    describe('function "unbindMap"', function() {
        var store;
        beforeEach(function() {
            var layer = new ol.layer.Vector();
            var map = new ol.Map({
                layers: [layer]
            });
            store = Ext.create('GeoExt.data.store.Layers', {map: map});
        });

        it('exists', function() {
            expect(store.unbindMap).not.to.be(undefined);
        });

        it('removes the map object', function() {
            store.unbindMap();
            expect(store.map).to.be(null);
        });
    });

    describe('function "getByLayer"', function() {
        var store;
        var layer;
        beforeEach(function() {
            layer = new ol.layer.Vector();
            var map = new ol.Map({
                layers: [layer]
            });
            store = Ext.create('GeoExt.data.store.Layers', {map: map});
        });

        it('exists', function() {
            expect(store.getByLayer).not.to.be(undefined);
        });

        it('returns an Ext.data.Model', function() {
            expect(store.getByLayer(layer)).not.to.be(undefined);
            expect(store.getByLayer(layer)
              instanceof Ext.data.Model).to.be(true);
        });

        it('provides the correct layer reference', function() {
            expect(store.getByLayer(layer).getOlLayer()).to.be(layer);
        });
    });

    describe('OL events', function() {
        var store;
        var map;
        var layer1;
        var layer2;
        beforeEach(function() {
            layer1 = new ol.layer.Vector();
            layer2 = new ol.layer.Vector();
            map = new ol.Map({
                layers: [layer1]
            });
            store =
                Ext.create('GeoExt.data.store.Layers', {map: map});
        });

        it('for adding a layer triggers correctly', function() {
            expect(store.getCount()).to.be(1);
            map.addLayer(layer2);
            expect(store.getCount()).to.be(2);
        });

        it('for removing a layer triggers correctly', function() {
            map.removeLayer(layer2);
            expect(store.getCount()).to.be(1);
        });
    });

    describe('GeoExt events', function() {

        describe('custom "bind" event', function() {
            var i = 0;
            beforeEach(function() {
                var layer = new ol.layer.Vector();
                var map = new ol.Map({
                    layers: [layer]
                });

                Ext.create('GeoExt.data.store.Layers', {
                    map: map,
                    listeners: {
                        bind: function() {
                            i++;
                        }
                    }
                });
            });

            it('is triggered correctly', function() {
                expect(i).to.be(1);
            });
        });

    });

});
