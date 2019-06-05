Ext.Loader.syncRequire(['GeoExt.data.store.WfsFeatures']);

describe('GeoExt.data.store.WfsFeatures', function() {

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.store.WfsFeatures).not.to.be(undefined);
        });
    });

    describe('constructor (no arguments)', function() {

        it('raises an error', function() {
            var errRaised = false;
            try {
                Ext.create('GeoExt.data.store.WfsFeatures');
            } catch (e) {
                errRaised = true;
            }

            expect(errRaised).to.be(true);
        });
    });

    describe('configs and properties', function() {
        var store;
        var dataPath = (typeof __karma__ === 'undefined' ? '' : 'base/test/');
        var url = dataPath + 'data/wfs_mock.geojson';
        beforeEach(function() {
            store = Ext.create('GeoExt.data.store.WfsFeatures', {
                url: url
            });
        });
        afterEach(function() {
            store.destroy();
        });

        it('are correctly defined (with defaults)', function() {
            expect(store.service).to.be('WFS');
            expect(store.version).to.be('2.0.0');
            expect(store.request).to.be('GetFeature');
            expect(store.typeName).to.be(null);
            expect(store.outputFormat).to.be('application/json');
            expect(store.sortBy).to.be(null);
            expect(store.startIndex).to.be(0);
            expect(store.count).to.be(null);
            expect(store.startIndexOffset).to.be(0);
        });
    });

    describe('loading without paging', function() {
        var dataPath = (typeof __karma__ === 'undefined' ? '' : 'base/test/');
        var url = dataPath + 'data/wfs_mock.geojson';

        it('uses the correct WFS parameters', function() {

            Ext.create('GeoExt.data.store.WfsFeatures', {
                url: url,
                format: new ol.format.GeoJSON({
                    featureProjection: 'EPSG:3857'
                }),
                listeners: {
                    'gx-wfsstoreload-beforeload': function(str, params) {
                        expect(params.service).to.be(str.service);
                        expect(params.version).to.be(str.version);
                        expect(params.request).to.be(str.request);
                        expect(params.typeName).to.be(str.typeName);
                        expect(params.outputFormat).to.be(str.outputFormat);
                        expect(params.sortBy).to.be(str.sortBy);
                    },
                    'gx-wfsstoreload': function(str) {
                        expect(str.getCount()).to.be(3);
                    }
                }
            });
        });
    });

    describe('loading with paging', function() {
        var dataPath = (typeof __karma__ === 'undefined' ? '' : 'base/test/');
        var url = dataPath + 'data/wfs_mock.geojson';

        it('uses the correct WFS parameters', function() {

            Ext.create('GeoExt.data.store.WfsFeatures', {
                url: url,
                format: new ol.format.GeoJSON({
                    featureProjection: 'EPSG:3857'
                }),
                sortBy: 'foo',
                startIndex: 0,
                count: 10,
                listeners: {
                    'gx-wfsstoreload-beforeload': function(str, params) {
                        expect(params.service).to.be(str.service);
                        expect(params.version).to.be(str.version);
                        expect(params.request).to.be(str.request);
                        expect(params.typeName).to.be(str.typeName);
                        expect(params.outputFormat).to.be(str.outputFormat);
                        expect(params.sortBy).to.be(str.sortBy);
                        expect(params.startIndex).to.be(str.startIndex);
                        expect(params.count).to.be(str.pageSize);
                        expect(params.startIndex).to.be(0);
                        expect(params.count).to.be(10);
                    },
                    'gx-wfsstoreload': function(str) {
                        expect(str.getCount()).to.be(3);
                    }
                }
            });
        });
    });

    describe('config option "createLayer"', function() {
        var store;
        var div;
        var map;
        var dataPath = (typeof __karma__ === 'undefined' ? '' : 'base/test/');
        var url = dataPath + 'data/wfs_mock.geojson';
        beforeEach(function() {
            div = TestUtil.setupTestDiv();
            map = new ol.Map({
                target: div,
                layers: [],
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
            store = Ext.create('GeoExt.data.store.WfsFeatures', {
                url: url,
                map: map,
                createLayer: true,
                format: new ol.format.GeoJSON({
                    featureProjection: 'EPSG:3857'
                })
            });
        });
        afterEach(function() {
            if (store.destroy) {
                store.destroy();
            }
            store = null;
            map = null;
            TestUtil.teardownTestDiv(div);
        });

        it('creates a new layer on the given map', function() {
            expect(map.getLayers().getLength()).to.be(1);
        });

        it('creates the layer which is retrievable via #getLayer', function() {
            expect(store.getLayer()).to.be(map.getLayers().item(0));
        });

        it('removes the autocreated layer once the store is destroyed',
            function() {
                // before
                expect(map.getLayers().getLength()).to.be(1);
                store.destroy();
                // after
                expect(map.getLayers().getLength()).to.be(0);
            }
        );
    });
});
