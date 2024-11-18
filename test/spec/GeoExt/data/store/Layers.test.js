Ext.Loader.syncRequire(['GeoExt.data.store.Layers']);

describe('GeoExt.data.store.Layers', function () {
  describe('basics', function () {
    it('is defined', function () {
      expect(GeoExt.data.store.Layers).not.to.be(undefined);
    });

    describe('constructor', function () {
      it('throws if no map component or layers are provided', function () {
        expect(function () {
          Ext.create('GeoExt.data.store.Layers');
        }).to.throwException();
      });
    });
  });

  describe('function "bindLayers"', function () {
    let store;
    let map;
    beforeEach(function () {
      const layer = new ol.layer.Vector();
      map = new ol.Map({
        layers: [layer],
      });
      store = Ext.create('GeoExt.data.store.Layers', {layers: map.getLayers()});
    });

    it('exists', function () {
      expect(store.bindLayers).not.to.be(undefined);
    });

    it('couples store to layer collection', function () {
      const newLayer = new ol.layer.Vector();
      map.getLayers().push(newLayer);
      expect(map.getLayers().getLength()).to.be(2);
      expect(store.getCount()).to.be(2);
    });
  });

  describe('function "bindMap"', function () {
    let store;
    let map;
    beforeEach(function () {
      const layer = new ol.layer.Vector();
      map = new ol.Map({
        layers: [layer],
      });
      store = Ext.create('GeoExt.data.store.Layers', {map: map});
    });

    it('exists', function () {
      expect(store.bindMap).not.to.be(undefined);
    });

    it('applies the map correctly', function () {
      expect(store.map).to.be(map);
    });
  });

  describe('function "unbindLayers"', function () {
    let store;
    let map;
    beforeEach(function () {
      const layer = new ol.layer.Vector();
      map = new ol.Map({
        layers: [layer],
      });
      store = Ext.create('GeoExt.data.store.Layers', {layers: map.getLayers()});
    });

    it('exists', function () {
      expect(store.unbindLayers).not.to.be(undefined);
    });

    it('decouples store from layer collection', function () {
      store.unbindLayers();
      const newLayer = new ol.layer.Vector();
      map.getLayers().push(newLayer);
      expect(map.getLayers().getLength()).to.be(2);
      expect(store.getCount()).to.be(1);
    });
  });

  describe('function "unbindMap"', function () {
    let store;
    beforeEach(function () {
      const layer = new ol.layer.Vector();
      const map = new ol.Map({
        layers: [layer],
      });
      store = Ext.create('GeoExt.data.store.Layers', {map: map});
    });

    it('exists', function () {
      expect(store.unbindMap).not.to.be(undefined);
    });

    it('removes the map object', function () {
      store.unbindMap();
      expect(store.map).to.be(null);
    });
  });

  describe('function "getByLayer"', function () {
    let store;
    let layer;
    beforeEach(function () {
      layer = new ol.layer.Vector();
      const map = new ol.Map({
        layers: [layer],
      });
      store = Ext.create('GeoExt.data.store.Layers', {map: map});
    });

    it('exists', function () {
      expect(store.getByLayer).not.to.be(undefined);
    });

    it('returns an Ext.data.Model', function () {
      expect(store.getByLayer(layer)).not.to.be(undefined);
      expect(store.getByLayer(layer) instanceof Ext.data.Model).to.be(true);
    });

    it('provides the correct layer reference', function () {
      expect(store.getByLayer(layer).getOlLayer()).to.be(layer);
    });
  });

  describe('OL events', function () {
    let store;
    let map;
    let layer1;
    let layer2;
    beforeEach(function () {
      layer1 = new ol.layer.Vector();
      layer2 = new ol.layer.Vector();
      map = new ol.Map({
        layers: [layer1],
      });
      store = Ext.create('GeoExt.data.store.Layers', {map: map});
    });

    it('for adding a layer triggers correctly', function () {
      expect(store.getCount()).to.be(1);
      map.addLayer(layer2);
      expect(store.getCount()).to.be(2);
    });

    it('for removing a layer triggers correctly', function () {
      map.removeLayer(layer2);
      expect(store.getCount()).to.be(1);
    });
  });

  describe('GeoExt events', function () {
    describe('custom "bind" event', function () {
      let i = 0;
      beforeEach(function () {
        const layer = new ol.layer.Vector();
        const map = new ol.Map({
          layers: [layer],
        });

        Ext.create('GeoExt.data.store.Layers', {
          map: map,
          listeners: {
            bind: function () {
              i++;
            },
          },
        });
      });

      it('is triggered correctly', function () {
        expect(i).to.be(1);
      });
    });

    describe('"clear" event', function () {
      let store;
      let map;
      beforeEach(function () {
        const layer = new ol.layer.Vector();
        map = new ol.Map({
          layers: [layer],
        });

        store = Ext.create('GeoExt.data.store.Layers', {
          map: map,
        });
      });

      it('clears the store and the layer collection', function () {
        store.removeAll();
        expect(store.getCount()).to.be(0);
        expect(map.getLayers().getLength()).to.be(0);
      });
    });

    describe('"add" event', function () {
      let store;
      let map;
      beforeEach(function () {
        const layer = new ol.layer.Vector();
        map = new ol.Map({
          layers: [layer],
        });

        store = Ext.create('GeoExt.data.store.Layers', {
          map: map,
        });
      });

      it('adds the layer to layer collection', function () {
        const newLayer = new ol.layer.Vector();
        const layerRec = Ext.create('GeoExt.data.model.Layer', newLayer);
        store.add(layerRec);
        expect(store.getCount()).to.be(2);
        expect(map.getLayers().getLength()).to.be(2);
      });
    });

    describe('"remove" event', function () {
      let store;
      let map;
      let layer;
      let layer2;
      beforeEach(function () {
        layer = new ol.layer.Vector();
        layer2 = new ol.layer.Vector();
        map = new ol.Map({
          layers: [layer, layer2],
        });

        store = Ext.create('GeoExt.data.store.Layers', {
          map: map,
        });
      });

      it('removes the layer from layer collection', function () {
        const layerRec = store.getByLayer(layer);
        store.remove(layerRec);
        expect(store.getCount()).to.be(1);
        expect(map.getLayers().getLength()).to.be(1);
        expect(map.getLayers().getArray()[0]).to.be(layer2);
      });
    });

    describe('function "destroy"', function () {
      let store;
      let map;
      let layer;
      beforeEach(function () {
        layer = new ol.layer.Vector();
        const layer2 = new ol.layer.Vector();
        map = new ol.Map({
          layers: [layer, layer2],
        });
        store = Ext.create('GeoExt.data.store.Layers', {map: map});
      });

      it('exists', function () {
        expect(store.destroy).not.to.be(undefined);
      });

      it('unbinds events and destroys store', function () {
        store.destroy();
        expect(store.map).to.be(null);
        // exemplary check "remove" event to ensure the events are
        // unregistered
        expect(function () {
          map.removeLayer(layer);
        }).not.to.throwException();
        // map layers remain untouched
        expect(map.getLayers().getLength()).to.be(1);
        // store is empty now
        expect(store.getCount()).to.be(0);
      });
    });

    describe('function "onChangeLayer"', function () {
      const id = 'nice-id-1909';
      let store;
      let map;
      let layer;
      let layer2;
      const layer2Title = 'LAYER 2';
      beforeEach(function () {
        layer = new ol.layer.Vector();
        layer2 = new ol.layer.Vector();
        layer.set('id', id);
        layer2.set('id', 'another id');
        layer2.set('title', layer2Title);
        map = new ol.Map({
          layers: [layer, layer2],
        });
        store = Ext.create('GeoExt.data.store.Layers', {map: map});
      });

      it('exists', function () {
        expect(store.onChangeLayer).not.to.be(undefined);
      });

      it('sets title correctly', function () {
        const title = 'humpty-dumpty';
        layer.set('title', title);
        const evt = {
          target: layer,
          key: 'title',
        };
        store.onChangeLayer(evt);

        const recordIdx = store.findBy(function (record) {
          return record.getOlLayer().get('id') === id;
        });
        const record = store.getAt(recordIdx);
        expect(record).not.to.be(undefined);
        expect(record.get('title')).to.be(title);
      });

      it('sets description / qtip correctly', function () {
        const description = 'humpty-dumpty';
        layer.set('description', description);
        const evt = {
          target: layer,
          key: 'description',
        };
        store.onChangeLayer(evt);

        const recordIdx = store.findBy(function (record) {
          return record.getOlLayer().get('id') === id;
        });
        const record = store.getAt(recordIdx);
        expect(record).not.to.be(undefined);
        expect(record.get('qtip')).to.be(description);
      });

      it('uses filter function if provided', function () {
        const title = 'humpty-dumpty';
        layer.set('title', title);

        const evt = {
          target: layer2,
          key: 'title',
        };
        const filterFn = function (rec) {
          return rec.getOlLayer().get('id').indexOf('another') > -1;
        };
        store.setConfig({
          changeLayerFilterFunction: filterFn,
        });
        store.onChangeLayer(evt);
        const recordIdx = store.findBy(filterFn);
        const record = store.getAt(recordIdx);
        expect(record).not.to.be(null);
        expect(record.get('title')).to.be(layer2Title);
      });
    });

    describe('synchronizedProperties', function () {
      let map;
      let layer;
      beforeEach(function () {
        layer = new ol.layer.Vector({
          title: 'Initial title',
          source: new ol.source.Vector({
            features: [new ol.Feature()],
          }),
        });
        map = new ol.Map({
          layers: [layer],
        });
      });

      it('reads properties on load', function () {
        const store = Ext.create('GeoExt.data.store.Layers', {map: map});

        const record = store.getAt(0);

        expect(record.get('title')).to.eql('Initial title');
        expect(record.get('other-prop')).to.equal(undefined);
      });

      it('by default it only synchronizes `title`', function () {
        const store = Ext.create('GeoExt.data.store.Layers', {map: map});

        const layerRec = store.getAt(0);
        const olLayer = layerRec.getOlLayer();

        layerRec.set('title', 'Kalle Berga');
        layerRec.set('other-prop', 'Some value');

        expect(olLayer.get('title')).to.eql('Kalle Berga');
        expect(olLayer.get('other-prop')).to.equal(undefined);

        olLayer.set('title', 'Some title');
        olLayer.set('other-prop', 'Other value');

        expect(layerRec.get('title')).to.eql('Some title');
        expect(layerRec.get('other-prop')).to.eql('Some value');
      });

      it('synchronizes custom properties', function () {
        Ext.define('CustomLayerModel', {
          extend: 'GeoExt.data.model.Layer',
          synchronizedProperties: ['other-prop'],
        });

        const store = Ext.create('GeoExt.data.store.Layers', {
          map: map,
          model: 'CustomLayerModel',
        });

        const layerRec = store.getAt(0);
        const olLayer = layerRec.getOlLayer();

        layerRec.set('title', 'Kalle Berga');
        layerRec.set('other-prop', 'Some value');

        expect(olLayer.get('title')).to.eql('Initial title');
        expect(olLayer.get('other-prop')).to.eql('Some value');

        olLayer.set('title', 'Other title');
        olLayer.set('other-prop', 'Other value');

        expect(layerRec.get('title')).to.eql('Kalle Berga');
        expect(layerRec.get('other-prop')).to.eql('Other value');
      });
    });
  });
});
