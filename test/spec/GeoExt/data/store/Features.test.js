Ext.Loader.syncRequire(['GeoExt.data.store.Features']);

describe('GeoExt.data.store.Features', function () {
  describe('basics', function () {
    it('is defined', function () {
      expect(GeoExt.data.store.Features).not.to.be(undefined);
    });
  });

  describe('constructor (no arguments)', function () {
    let store;

    beforeEach(function () {
      store = Ext.create('GeoExt.data.store.Features');
    });
    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
    });

    it('constructs an instance of GeoExt.data.store.Features', function () {
      expect(store).to.be.an(GeoExt.data.store.Features);
    });
    it('constructs an empty store', function () {
      expect(store.count()).to.be(0);
    });
  });

  describe('constructor (with features)', function () {
    let coll;
    let store;

    beforeEach(function () {
      coll = new ol.Collection();
      coll.push(new ol.Feature());
      store = Ext.create('GeoExt.data.store.Features', {features: coll});
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      coll = null;
    });

    it('constructs an instance of GeoExt.data.store.Features', function () {
      expect(store).to.be.an(GeoExt.data.store.Features);
    });
    it('constructs the store with the right amount of records', function () {
      expect(store.count()).to.be(1);
    });
    it('constructs the store with the correct FC reference', function () {
      expect(store.getFeatures()).to.be(coll);
    });
  });

  describe('constructor (with fields)', function () {
    let feat;
    let store;

    beforeEach(function () {
      const coll = new ol.Collection();
      feat = new ol.Feature({foo: 'bar'});
      coll.push(feat);
      store = Ext.create('GeoExt.data.store.Features', {
        features: coll,
        fields: ['foo'],
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      feat = null;
    });

    it('constructs an instance of GeoExt.data.store.Features', function () {
      expect(store).to.be.an(GeoExt.data.store.Features);
    });
    it('constructs records with an olObject reference', function () {
      expect(store.getAt(0).getFeature()).to.be(feat);
    });
    it('constructs records with the right fields', function () {
      expect(store.getAt(0).get('foo')).to.be('bar');
      expect(store.getAt(0).get('xyz')).to.be(undefined);
    });
  });

  describe('constructor (with fields and model)', function () {
    let feat;
    let store;

    beforeEach(function () {
      const coll = new ol.Collection();
      feat = new ol.Feature({foo: 'bar'});
      coll.push(feat);
      store = Ext.create('GeoExt.data.store.Features', {
        features: coll,
        fields: ['foo'],
        model: 'GeoExt.data.model.Feature',
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      feat = null;
    });

    it('constructs an instance of GeoExt.data.store.Features', function () {
      expect(store).to.be.an(GeoExt.data.store.Features);
    });
    it('constructs records with an olObject reference', function () {
      expect(store.getAt(0).getFeature()).to.be(feat);
    });
    it('constructs records with the right fields', function () {
      expect(store.getAt(0).get('foo')).to.be('bar');
      expect(store.getAt(0).get('xyz')).to.be(undefined);
    });
  });

  describe('constructor (with layer)', function () {
    let div;
    let map;
    let layer;
    let store;

    beforeEach(function () {
      div = document.createElement('div');
      document.body.appendChild(div);
      map = new ol.Map({
        target: div,
      });
      layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: new ol.Collection([new ol.Feature()]),
        }),
      });
      map.addLayer(layer);
      store = Ext.create('GeoExt.data.store.Features', {layer: layer});
    });
    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      layer = null;
      map = null;
      document.body.removeChild(div);
      div = null;
    });

    it('constructs an instance of GeoExt.data.store.Features', function () {
      expect(store).to.be.an(GeoExt.data.store.Features);
    });
    it('constructs the store with the right amount of records', function () {
      expect(store.count()).to.be(1);
    });
    it('constructs the store with the correct layer reference', function () {
      expect(store.getLayer()).to.be(layer);
    });
    it("doesn't remove a passed layer once the store is destroyed", function () {
      // before
      expect(map.getLayers().getLength()).to.be(1);
      store.destroy();
      // after
      expect(map.getLayers().getLength()).to.be(1);
    });
  });

  describe('#getFeatures', function () {
    let coll;
    let store;

    beforeEach(function () {
      coll = new ol.Collection();
      coll.push(new ol.Feature());
      store = Ext.create('GeoExt.data.store.Features', {features: coll});
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      coll = null;
    });

    it('is defined', function () {
      expect(store.getFeatures).not.to.be(undefined);
    });
    it('returns the right ol.Collection reference', function () {
      expect(store.getFeatures()).to.be(coll);
    });
  });

  describe('#getByFeature', function () {
    let coll;
    let store;
    let feature;

    beforeEach(function () {
      feature = new ol.Feature();
      coll = new ol.Collection();
      coll.push(feature);
      store = Ext.create('GeoExt.data.store.Features', {features: coll});
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      coll = null;
      feature = null;
    });

    it('is defined', function () {
      expect(store.getByFeature).not.to.be(undefined);
    });

    it('returns the right feature record', function () {
      expect(store.getByFeature(feature).getFeature()).to.be.equal(feature);
    });

    it('returns null in case of passing a non-managed feature', function () {
      expect(store.getByFeature(new ol.Feature())).to.be(null);
    });
  });

  describe('adding and removing items from the collection', function () {
    let collection;
    let store;

    beforeEach(function () {
      collection = new ol.Collection();
      store = Ext.create('GeoExt.data.store.Features', {
        features: collection,
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      collection = null;
    });

    it('will have records of collection items added', function () {
      const olObj = new ol.Object();

      expect(store.getCount()).to.be(0);

      collection.push(new ol.Object());
      expect(store.getCount()).to.be(1);

      collection.push([new ol.Object(), new ol.Object()]);
      expect(store.getCount()).to.be(3);

      collection.insertAt(0, olObj);
      expect(collection.item(0)).to.be(olObj);
      expect(store.getAt(0).olObject).to.be(olObj);
    });

    it('will not have records of collection items that are removed', function () {
      collection.push(new ol.Object());
      expect(store.getCount()).to.be(1);

      collection.removeAt(0);
      expect(store.getCount()).to.be(0);
    });
  });

  describe('adding and removing items from the store', function () {
    let feature;
    let layer;
    let store;

    beforeEach(function () {
      feature = new ol.Feature();
      layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: new ol.Collection([feature]),
        }),
      });
      store = Ext.create('GeoExt.data.store.Features', {
        layer: layer,
      });
    });

    it('should add features to the layer', function () {
      const feat = new ol.Feature();
      const model = Ext.create('GeoExt.data.model.Feature', feat);

      store.add(model);

      expect(layer.getSource().getFeatures()).to.contain(feat);
      expect(layer.getSource().getFeatures().length).to.equal(2);
    });

    it('should remove features from the layer', function () {
      const model = store.getAt(0);

      store.remove(model);

      expect(layer.getSource().getFeatures().length).to.equal(0);
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      layer = null;
      feature = null;
    });
  });

  describe('config option "createLayer" without a map', function () {
    let coll;
    let store;
    let map;
    let div;

    beforeEach(function () {
      div = document.createElement('div');
      document.body.appendChild(div);
      const source = new ol.source.OSM();
      const layer = new ol.layer.Tile({
        source: source,
      });
      map = new ol.Map({
        target: div,
        layers: [layer],
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
        }),
      });
      coll = new ol.Collection();
      coll.push(new ol.Feature());
      store = Ext.create('GeoExt.data.store.Features', {
        features: coll,
        map: map,
        createLayer: true,
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      coll = null;
      map = null;
      document.body.removeChild(div);
      div = null;
    });

    it('creates a new vector layer object', function () {
      expect(store.getLayer()).to.be.an(ol.layer.Vector);
    });
    it('creates a layer with correct amount of features', function () {
      expect(store.getLayer().getSource().getFeatures().length).to.be(
        store.count(),
      );
    });
  });

  describe('config option "createLayer"', function () {
    let coll;
    let store;
    let map;
    let div;

    beforeEach(function () {
      div = document.createElement('div');
      document.body.appendChild(div);
      const source = new ol.source.OSM();
      const layer = new ol.layer.Tile({
        source: source,
      });
      map = new ol.Map({
        target: div,
        layers: [layer],
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
        }),
      });
      coll = new ol.Collection();
      coll.push(new ol.Feature());
      store = Ext.create('GeoExt.data.store.Features', {
        features: coll,
        map: map,
        createLayer: true,
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      coll = null;
      map = null;
      document.body.removeChild(div);
      div = null;
    });

    it('creates a new layer on the given map', function () {
      expect(map.getLayers().getLength()).to.be(2);
    });

    it('creates the layer which is retrievable via #getLayer', function () {
      expect(store.getLayer()).to.be(map.getLayers().item(1));
    });

    it('removes the autocreated layer once the store is destroyed', function () {
      // before
      expect(map.getLayers().getLength()).to.be(2);
      store.destroy();
      // after
      expect(map.getLayers().getLength()).to.be(1);
    });
  });

  describe('Event binding on vector layer', function () {
    let layer;
    let store;
    let feature;

    beforeEach(function () {
      feature = new ol.Feature({id: 'foo'});
      layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: new ol.Collection([feature]),
        }),
      });
      store = Ext.create('GeoExt.data.store.Features', {
        layer: layer,
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      layer = null;
      feature = null;
    });

    it('is done correctly for "addfeature"', function () {
      layer.getSource().addFeatures([new ol.Feature()]);
      expect(store.getCount()).to.be(layer.getSource().getFeatures().length);
    });

    it('is done correctly for "removefeature"', function () {
      layer.getSource().removeFeature(layer.getSource().getFeatures()[0]);
      expect(store.getCount()).to.be(layer.getSource().getFeatures().length);
    });

    it('is done correctly for "clear"', function () {
      layer.getSource().clear();
      expect(store.getCount()).to.be(layer.getSource().getFeatures().length);
    });
  });

  describe('Passing filter to underlying layer', function () {
    let layer;
    let store;
    let feature1;
    let feature2;

    beforeEach(function () {
      feature1 = new ol.Feature({id: 1});
      feature2 = new ol.Feature({id: 2});
      layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: new ol.Collection([feature1, feature2]),
        }),
      });
    });

    afterEach(function () {
      if (store.destroy) {
        store.destroy();
      }
      store = null;
      layer = null;
      feature1 = null;
      feature2 = null;
    });

    it('is not enabled by default', function () {
      store = Ext.create('GeoExt.data.store.Features', {
        layer: layer,
      });
      store.filter('id', 1);
      expect(layer.getSource().getFeatures().length).to.be(2);
    });

    it('can be activated by setting config "passThroughFilter" to "true"', function () {
      store = Ext.create('GeoExt.data.store.Features', {
        layer: layer,
        passThroughFilter: true,
      });
      store.filter('id', 1);
      expect(layer.getSource().getFeatures().length).to.be(1);
    });
  });
});
