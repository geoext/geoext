Ext.Loader.syncRequire(['GeoExt.data.store.Features']);

describe('GeoExt.data.store.Features', function() {

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.store.Features).not.to.be(undefined);
        });
    });

    describe('constructor (no arguments)', function() {
        var store;

        beforeEach(function() {
            store = Ext.create('GeoExt.data.store.Features');
        });
        afterEach(function() {
            store = null;
        });


        it('constucts an instance of GeoExt.data.store.Features', function() {
            expect(store).to.be.an(GeoExt.data.store.Features);
        });
        it('constucts an empty store', function() {
            expect(store.count()).to.be(0);
        });
    });

    describe('constructor (with features)', function() {
        var coll,
            store;
        beforeEach(function() {
            coll = new ol.Collection();
            coll.push(new ol.Feature());
            store = Ext.create('GeoExt.data.store.Features', {features: coll});
        });
        afterEach(function() {
            store = null;
            coll = null;
        });

        it('constucts an instance of GeoExt.data.store.Features', function() {
            expect(store).to.be.an(GeoExt.data.store.Features);
        });
        it('constucts the store with the right amount of records', function() {
            expect(store.count()).to.be(1);
        });
        it('constucts the store with the correct FC reference', function() {
            expect(store.getFeatures()).to.be(coll);
        });

    });

    describe('constructor (with layer)', function() {
        var layer,
            store;
        beforeEach(function() {
            layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [new ol.Feature()]
                })
            });
            store = Ext.create('GeoExt.data.store.Features', {layer: layer});
        });
        afterEach(function() {
            store = null;
            layer = null;
        });

        it('constucts an instance of GeoExt.data.store.Features', function() {
            expect(store).to.be.an(GeoExt.data.store.Features);
        });
        it('constucts the store with the right amount of records', function() {
            expect(store.count()).to.be(1);
        });
        it('constucts the store with the correct layer reference', function() {
            expect(store.getLayer()).to.be(layer);
        });

    });

    describe('#getFeatures', function() {
        var coll,
            store;
        beforeEach(function() {
            coll = new ol.Collection();
            coll.push(new ol.Feature());
            store = Ext.create('GeoExt.data.store.Features', {features: coll});
        });
        afterEach(function() {
            store = null;
            coll = null;
        });

        it('is defined', function() {
            expect(store.getFeatures).not.to.be(undefined);
        });
        it('returns the right ol.Collection reference', function() {
            expect(store.getFeatures()).to.be(coll);
        });
    });

    describe('config option "createLayer" without a map', function() {
        var coll,
            store,
            map,
            div;
        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
            var source = new ol.source.MapQuest({layer: 'sat'});
            var layer = new ol.layer.Tile({
                source: source
            });
            map = new ol.Map({
                target: div,
                layers: [layer],
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            coll = new ol.Collection();
            coll.push(new ol.Feature());
            store = Ext.create('GeoExt.data.store.Features', {
                features: coll,
                map: map,
                createLayer: true
            });
        });
        afterEach(function() {
            store = null;
            coll = null;
            map = null;
            document.body.removeChild(div);
        });

        it('creates a new vector layer object', function() {
            expect(store.getLayer()).to.be.an(ol.layer.Vector);
        });
        it('creates a layer with correct amount of features', function() {
            expect(store.getLayer().getSource().getFeatures().length).to.be(store.count());
        });
    });

    describe('config option "createLayer"', function() {
        var coll,
            store,
            map,
            div;
        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
            var source = new ol.source.MapQuest({layer: 'sat'});
            var layer = new ol.layer.Tile({
                source: source
            });
            map = new ol.Map({
                target: div,
                layers: [layer],
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            coll = new ol.Collection();
            coll.push(new ol.Feature());
            store = Ext.create('GeoExt.data.store.Features', {
                features: coll,
                map: map,
                createLayer: true
            });
        });
        afterEach(function() {
            store = null;
            coll = null;
            map = null;
            document.body.removeChild(div);
        });

        it('creates a new layer on the given map', function() {
            expect(map.getLayers().getLength()).to.be(2);
        });
        it('creates the layer which is retrievable via #getLayer', function() {
            expect(store.getLayer()).to.be(map.getLayers().item(1));
        });
    });
});
