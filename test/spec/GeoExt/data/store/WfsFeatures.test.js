Ext.Loader.syncRequire(['GeoExt.data.store.WfsFeatures']);

before(TestUtil.disableLogger);
after(TestUtil.enableLogger);

describe('GeoExt.data.store.WfsFeatures', function () {
  describe('basics', function () {
    it('is defined', function () {
      expect(GeoExt.data.store.WfsFeatures).not.to.be(undefined);
    });
  });

  describe('constructor (no arguments)', function () {
    it('raises an error', function () {
      let errRaised = false;
      try {
        Ext.create('GeoExt.data.store.WfsFeatures');
      } catch (e) {
        errRaised = true;
      }

      expect(errRaised).to.be(true);
    });
  });

  describe('configs and properties', function () {
    let store;
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';
    beforeEach(function () {
      store = Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
      });
    });
    afterEach(function () {
      store.destroy();
    });

    it('are correctly defined (with defaults)', function () {
      expect(store.service).to.be('WFS');
      expect(store.version).to.be('2.0.0');
      expect(store.request).to.be('GetFeature');
      expect(store.typeName).to.be(null);
      expect(store.outputFormat).to.be('application/json');
      expect(store.startIndex).to.be(0);
      expect(store.count).to.be(null);
      expect(store.startIndexOffset).to.be(0);
    });
  });

  describe('loading without paging', function () {
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';

    it('uses the correct WFS parameters', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        format: new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857',
        }),
        listeners: {
          'gx-wfsstoreload-beforeload': function (str, params) {
            expect(params.service).to.be(str.service);
            expect(params.version).to.be(str.version);
            expect(params.request).to.be(str.request);
            expect(params.typeName).to.be(str.typeName);
            expect(params.outputFormat).to.be(str.outputFormat);
          },
          'gx-wfsstoreload': function (str) {
            expect(str.getCount()).to.be(3);
          },
        },
      });
    });

    it('WFS parameters are created correctly', function () {
      const store = Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        count: 25,
        srsName: 'EPSG:3857',
        propertyName: 'FID',
      });

      const params = store.createParameters();

      expect(params.startIndex).to.be(0);
      expect(params.count).to.be(25);
      expect(params.propertyName).to.be('FID');
      expect(params.srsName).to.be('EPSG:3857');
      expect(params.filter).to.be(undefined);
      expect(params.sortBy).to.be(undefined);
    });
  });

  describe('loading with paging', function () {
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';

    it('uses the correct WFS parameters', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        format: new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857',
        }),
        startIndex: 0,
        count: 10,
        listeners: {
          'gx-wfsstoreload-beforeload': function (str, params) {
            expect(params.service).to.be(str.service);
            expect(params.version).to.be(str.version);
            expect(params.request).to.be(str.request);
            expect(params.typeName).to.be(str.typeName);
            expect(params.outputFormat).to.be(str.outputFormat);
            expect(params.startIndex).to.be(str.startIndex);
            expect(params.count).to.be(str.pageSize);
            expect(params.startIndex).to.be(0);
            expect(params.count).to.be(10);
          },
          'gx-wfsstoreload': function (str) {
            expect(str.getCount()).to.be(3);
          },
        },
      });
    });
  });

  describe('load with propertyName', function () {
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';

    it('by default propertyName is undefined', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        format: new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857',
        }),
        listeners: {
          'gx-wfsstoreload-beforeload': function (str, params) {
            expect(params.propertyName).to.be(undefined);
          },
          'gx-wfsstoreload': function (str) {
            expect(str.getCount()).to.be(3);
          },
        },
      });
    });

    it('propertyName is set', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        format: new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857',
        }),
        propertyName: 'foo,bar',
        listeners: {
          'gx-wfsstoreload-beforeload': function (str, params) {
            expect(params.propertyName).to.be('foo,bar');
          },
          'gx-wfsstoreload': function (str) {
            expect(str.getCount()).to.be(3);
          },
        },
      });
    });
  });

  describe('config option "createLayer"', function () {
    let store;
    let div;
    let map;
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';
    beforeEach(function () {
      div = TestUtil.setupTestDiv();
      map = new ol.Map({
        target: div,
        layers: [],
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
        }),
      });
      store = Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        map: map,
        createLayer: true,
        layerOptions: {
          opacity: 0.7,
        },
        format: new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857',
        }),
      });
    });
    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      map = null;
      TestUtil.teardownTestDiv(div);
    });

    it('creates a new layer on the given map', function () {
      expect(map.getLayers().getLength()).to.be(1);
    });

    it('creates the layer which is retrievable via #getLayer', function () {
      expect(store.getLayer()).to.be(map.getLayers().item(0));
    });

    it('layerOptions have been set correctly', function () {
      const layer = store.getLayer();
      expect(layer.getOpacity()).to.be(0.7);
    });

    it('removes the autocreated layer once the store is destroyed', function () {
      // before
      expect(map.getLayers().getLength()).to.be(1);
      store.destroy();
      // after
      expect(map.getLayers().getLength()).to.be(0);
    });
  });

  describe('sorting', function () {
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';

    it('sorters are created', function () {
      const store = Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        sorters: [
          {
            property: 'foo',
            direction: 'ASC',
          },
        ],
      });

      const sorters = store.getSorters();
      expect(sorters.length).to.be(1);

      const sorter = sorters.getAt(0);
      expect(sorter.getProperty()).to.be('foo');
      expect(sorter.getDirection()).to.be('ASC');
    });

    it('creates sort string', function () {
      const store = Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        sorters: [
          {
            property: 'foo',
            direction: 'ASC',
          },
        ],
      });

      expect(store.createSortByParameter()).to.be('foo ASC');
    });

    it('creates multiple sorters string', function () {
      const store = Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        sorters: [
          {
            property: 'foo',
            direction: 'ASC',
          },
          {
            property: 'bar',
            direction: 'DESC',
          },
        ],
      });

      expect(store.createSortByParameter()).to.be('foo ASC,bar DESC');
    });
  });

  describe('collection binding', function () {
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';

    it('removes from the layer', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        listeners: {
          'gx-wfsstoreload': function (store) {
            const layer = store.getLayer();
            expect(layer.getSource().getFeatures()).to.have.lengthOf(3);

            store.remove(store.getAt(0));

            expect(layer.getSource().getFeatures()).to.have.lengthOf(2);
          },
        },
      });
    });

    it('removes from the store', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        listeners: {
          'gx-wfsstoreload': function (store) {
            expect(store.getCount()).to.be(3);

            const source = store.getLayer().getSource();
            const feature = source.getFeatures()[0];
            source.removeFeature(feature);

            expect(store.getCount()).to.be(2);
          },
        },
      });
    });

    it('adds to the layer', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        listeners: {
          'gx-wfsstoreload': function (store) {
            const layer = store.getLayer();
            expect(layer.getSource().getFeatures()).to.have.lengthOf(3);

            const model = Ext.create(
              'GeoExt.data.model.Feature',
              new ol.Feature(),
            );
            store.add(model);

            expect(layer.getSource().getFeatures()).to.have.lengthOf(4);
          },
        },
      });
    });

    it('adds to the store', function () {
      Ext.create('GeoExt.data.store.WfsFeatures', {
        url: url,
        listeners: {
          'gx-wfsstoreload': function (store) {
            expect(store.getCount()).to.be(3);

            const source = store.getLayer().getSource();
            source.addFeature(new ol.Feature());

            expect(store.getCount()).to.be(4);
          },
        },
      });
    });
  });
});
