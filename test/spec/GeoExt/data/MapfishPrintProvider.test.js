Ext.Loader.syncRequire([
  'GeoExt.data.MapfishPrintProvider',
  'GeoExt.data.serializer.TileWMS',
  'GeoExt.data.serializer.ImageWMS',
]);

// Use a local resource from the test/data folder to be offline testable
const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
const jsonpCapabilitiesUrl = dataPath + 'data/staticPrintCapabilities.jsonp';

// Mock Ext.data.JsonP.request to always use a predefined callbackName,
// which matches the static name of the callback in the local resource
let originalRequestMethod;
before(function () {
  originalRequestMethod = Ext.data.JsonP.request;
  Ext.data.JsonP.request = function (options) {
    const opts = Ext.apply(options, {
      callbackName: 'staticCallbackNameDuringTests',
    });
    // call original method
    return originalRequestMethod.apply(this, [opts]);
  };
});
after(function () {
  if (originalRequestMethod) {
    Ext.data.JsonP.request = originalRequestMethod;
  }
});

describe('GeoExt.data.MapfishPrintProvider', function () {
  const printCapabilities = {
    'app': 'geoext',
    'layouts': [
      {
        'name': 'A4 portrait',
        'attributes': [
          {
            'name': 'map',
            'type': 'MapAttributeValues',
            'clientParams': {
              'center': {
                'type': 'double',
                'isArray': true,
              },
              'bbox': {
                'type': 'double',
                'isArray': true,
              },
              'layers': {
                'type': 'array',
              },
              'dpi': {
                'type': 'double',
              },
              'areaOfInterest': {
                'type': 'AreaOfInterest',
                'embeddedType': {
                  'area': {
                    'type': 'String',
                  },
                  'renderAsSvg': {
                    'type': 'boolean',
                    'default': null,
                  },
                  'display': {
                    'type': 'AoiDisplay',
                    'embeddedType': {},
                    'default': 'RENDER',
                  },
                  'style': {
                    'type': 'String',
                    'default': null,
                  },
                },
              },
              'scale': {
                'type': 'double',
                'default': null,
              },
              'rotation': {
                'type': 'double',
                'default': null,
              },
              'projection': {
                'type': 'String',
                'default': null,
              },
              'dpiSensitiveStyle': {
                'type': 'boolean',
                'default': true,
              },
              'zoomToFeatures': {
                'type': 'ZoomToFeatures',
                'embeddedType': {
                  'zoomType': {
                    'type': 'ZoomType',
                    'embeddedType': {},
                    'default': 'EXTENT',
                  },
                  'minMargin': {
                    'type': 'int',
                    'default': 10,
                  },
                  'minScale': {
                    'type': 'double',
                    'default': null,
                  },
                  'layer': {
                    'type': 'String',
                    'default': null,
                  },
                },
                'default': null,
              },
              'useNearestScale': {
                'type': 'boolean',
                'default': null,
              },
              'longitudeFirst': {
                'type': 'boolean',
                'default': null,
              },
              'useAdjustBounds': {
                'type': 'boolean',
                'default': null,
              },
            },
            'clientInfo': {
              'height': 330,
              'width': 780,
              'dpiSuggestions': [72, 120, 200, 254, 300],
              'maxDPI': 400,
            },
          },
        ],
      },
    ],
    'formats': ['bmp', 'gif', 'pdf', 'png', 'tif', 'tiff'],
  };

  it('is defined', function () {
    expect(GeoExt.data.MapfishPrintProvider).not.to.be(undefined);
  });

  it('throws if instanciated without capabilities or url', function () {
    expect(function () {
      Ext.create('GeoExt.data.MapfishPrintProvider');
    }).to.throwException();
  });

  it('can be instanciated with capabilities', function () {
    let instance = null;
    expect(function () {
      instance = Ext.create('GeoExt.data.MapfishPrintProvider', {
        capabilities: printCapabilities,
      });
    }).to.not.throwException();
    expect(instance).to.be.a(GeoExt.data.MapfishPrintProvider);
  });

  describe('has static functions', function () {
    let savedSerializers;
    let div;
    let extentLayer;
    let mapComponent;
    let mapPanel;
    let layer;
    let group;
    let groupInGroup;
    let firstgrouplayer;
    let secondgrouplayer;
    let olMap;

    beforeEach(function () {
      savedSerializers = Ext.Array.clone(
        GeoExt.data.MapfishPrintProvider._serializers,
      );

      div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = '0';
      div.style.left = '-1000px';
      div.style.width = '512px';
      div.style.height = '256px';
      document.body.appendChild(div);

      layer = new ol.layer.Tile({
        name: '1',
        source: new ol.source.TileWMS({
          url: 'http://ows.terrestris.de/osm-gray/service',
          params: {
            LAYERS: 'OSM-WMS',
          },
        }),
      });

      extentLayer = new ol.layer.Vector({
        name: '2',
        source: new ol.source.Vector(),
      });

      firstgrouplayer = new ol.layer.Tile({
        name: '3',
        source: new ol.source.StadiaMaps({
          layer: 'stamen_watercolor',
        }),
      });

      secondgrouplayer = new ol.layer.Tile({
        name: '4',
        source: new ol.source.StadiaMaps({
          layer: 'stamen_terrain_labels',
        }),
      });

      groupInGroup = new ol.layer.Group({
        layers: [
          new ol.layer.Vector({
            name: '5',
            source: new ol.source.Vector(),
          }),
          new ol.layer.Vector({
            name: '6',
            source: new ol.source.Vector(),
          }),
          new ol.layer.Vector({
            name: '7',
            source: new ol.source.Vector(),
          }),
        ],
      });

      group = new ol.layer.Group({
        layers: [groupInGroup, firstgrouplayer, secondgrouplayer],
      });

      olMap = new ol.Map({
        layers: [layer, extentLayer, group],
        view: new ol.View({
          center: [0, 0],
          zoom: 2,
        }),
      });

      mapComponent = Ext.create('GeoExt.component.Map', {
        map: olMap,
      });

      mapPanel = Ext.create('Ext.panel.Panel', {
        title: 'GeoExt.component.Map Example',
        items: [mapComponent],
        layout: 'fit',
        renderTo: div,
      });
    });

    afterEach(function () {
      GeoExt.data.MapfishPrintProvider._serializers = savedSerializers;
      mapPanel.destroy();
      document.body.removeChild(div);
    });

    it('to registers a new serializer', function () {
      const ProviderCls = GeoExt.data.MapfishPrintProvider;
      const available = ProviderCls._serializers;
      const MockupSerializer = function () {};

      const cntBefore = available.length;
      ProviderCls.registerSerializer(null, MockupSerializer);
      const cntAfter = available.length;

      expect(cntBefore + 1 === cntAfter).to.be(true);
    });

    it('to unregisters a serializer', function () {
      const ProviderCls = GeoExt.data.MapfishPrintProvider;
      const available = ProviderCls._serializers;
      const MockupSerializer = function () {};
      // so that it is removable, let's register first.
      ProviderCls.registerSerializer(null, MockupSerializer);

      const cntBefore = available.length;
      ProviderCls.unregisterSerializer(MockupSerializer);
      const cntAfter = available.length;

      expect(cntBefore - 1 === cntAfter).to.be(true);
    });

    it('to find serializers', function () {
      const ProviderCls = GeoExt.data.MapfishPrintProvider;
      const MockupSource = function () {};
      const MockupSourceUnregistered = function () {};
      const MockupSerializer = function () {};

      ProviderCls.registerSerializer(MockupSource, MockupSerializer);
      const foundSerializer = ProviderCls.findSerializerBySource(
        new MockupSource(),
      );
      expect(foundSerializer).to.be(MockupSerializer);

      const notFoundSerializer = ProviderCls.findSerializerBySource(
        new MockupSourceUnregistered(),
      );
      expect(notFoundSerializer).to.be(undefined);
    });

    it('to return a flat Array of Layers by given collection', function () {
      expect(GeoExt.data.MapfishPrintProvider.getLayerArray).to.be.a(
        'function',
      );

      const layerArray = GeoExt.data.MapfishPrintProvider.getLayerArray(
        mapComponent.getLayers().getArray(),
      );
      let groupSize = 0;
      Ext.each(layerArray, function (l) {
        if (l instanceof ol.layer.Group) {
          groupSize++;
        }
      });
      expect(layerArray.length).to.eql(7);
      expect(groupSize).to.eql(0);
      expect(mapComponent.getLayers().getArray().length).to.eql(3);
    });

    it('in the correct order within subfolders for Array', function () {
      const layerArray = GeoExt.data.MapfishPrintProvider.getLayerArray(
        mapComponent.getLayers().getArray(),
      );
      let layerOrder = '';
      Ext.each(layerArray, function (l) {
        layerOrder += l.get('name');
      });
      expect(layerOrder).to.eql('1256734');
    });

    it('in the correct order within subfolders for Store', function () {
      const layerArray = GeoExt.data.MapfishPrintProvider.getLayerArray(
        mapComponent.getLayers(),
      );
      let layerOrder = '';
      Ext.each(layerArray, function (l) {
        layerOrder += l.get('name');
      });
      expect(layerOrder).to.eql('1256734');
    });

    it(
      'getLayerArray returns the correct order within subfolders for ' +
        ' Collection',
      function () {
        const layerArray = GeoExt.data.MapfishPrintProvider.getLayerArray(
          mapComponent.getMap().getLayers(),
        );
        let layerOrder = '';
        Ext.each(layerArray, function (l) {
          layerOrder += l.get('name');
        });
        expect(layerOrder).to.eql('1256734');
      },
    );

    it('getSerializedLayers returns the serialized Layers', function () {
      const cls = GeoExt.data.MapfishPrintProvider;
      expect(cls.getSerializedLayers).to.be.a('function');
      const serializedLayers = cls.getSerializedLayers(mapComponent);
      const serializedLayer = serializedLayers[0];

      expect(serializedLayers).to.be.an('array');
      expect(serializedLayer.baseURL).to.be(layer.getSource().getUrls()[0]);
      expect(serializedLayer.customParams).to.be(layer.getSource().getParams());
      expect(serializedLayer.layers).to.be.an('array');
      expect(serializedLayer.layers[0]).to.be(
        layer.getSource().getParams().LAYERS,
      );
      expect(serializedLayer.opacity).to.be(layer.getOpacity());
    });

    // Could be improved
    it('renderPrintExtent returns a printExtent Feature', function () {
      const cls = GeoExt.data.MapfishPrintProvider;
      expect(cls.renderPrintExtent).to.be.a('function');
      const attr = printCapabilities.layouts[0].attributes[0];
      const clientInfo = attr.clientInfo;
      const feat = cls.renderPrintExtent(mapComponent, extentLayer, clientInfo);
      expect(feat).to.be.an(ol.Feature);
    });
  });

  describe('creates stores from capabilities (directly available)', function () {
    it('directly uses passed capabilities data', function () {
      const provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
        capabilities: printCapabilities,
      });
      const layoutStore = provider.capabilityRec.layouts();
      expect(layoutStore).to.be.an(Ext.data.Store);
    });
  });

  describe('creates stores from capabilities (async)', function () {
    describe('layouts', function () {
      it('creates a store for layouts', function (done) {
        Ext.create('GeoExt.data.MapfishPrintProvider', {
          capabilities: printCapabilities,
          listeners: {
            'ready': function () {
              const layoutStore = this.capabilityRec.layouts();
              expect(layoutStore).to.be.an(Ext.data.Store);
              expect(layoutStore.getCount()).to.be(1);
              expect(layoutStore.getAt(0).get('name')).to.be('A4 portrait');
              done();
            },
          },
        });
      });
    });

    describe('formats', function () {
      it('creates a store for formats', function (done) {
        Ext.create('GeoExt.data.MapfishPrintProvider', {
          capabilities: printCapabilities,
          listeners: {
            'ready': function () {
              const formats = this.capabilityRec.get('formats');
              expect(formats).to.be.an(Array);
              expect(formats.length).to.be(6);
              expect(formats[0]).to.be('bmp');
              done();
            },
          },
        });
      });
    });

    describe('attributes', function () {
      it('creates a store for attributes', function (done) {
        Ext.create('GeoExt.data.MapfishPrintProvider', {
          capabilities: printCapabilities,
          listeners: {
            'ready': function () {
              const layoutStore = this.capabilityRec.layouts();
              const firstLayout = layoutStore.getAt(0);
              const attributesStore = firstLayout.attributes();
              const firstAttributes = attributesStore.getAt(0);
              expect(attributesStore).to.be.an(Ext.data.Store);
              expect(attributesStore.getCount()).to.be(1);
              expect(firstAttributes).to.be.a(
                GeoExt.data.model.print.LayoutAttribute,
              );
              expect(firstAttributes.get('name')).to.be('map');
              expect(firstAttributes.get('type')).to.be('MapAttributeValues');
              done();
            },
          },
        });
      });
    });
  });

  describe('creates stores from url (async)', function () {
    describe('layouts', function () {
      it('creates a store for layouts', function (done) {
        var provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
          url: jsonpCapabilitiesUrl,
          listeners: {
            ready: function () {
              const layoutStore = provider.capabilityRec.layouts();
              expect(layoutStore).to.be.an(Ext.data.Store);
              expect(layoutStore.getCount()).to.be(1);
              expect(layoutStore.getAt(0).get('name')).to.be('A4 portrait');
              done();
            },
          },
        });
      });
    });

    describe('formats', function () {
      it('creates a store for formats', function (done) {
        Ext.create('GeoExt.data.MapfishPrintProvider', {
          url: jsonpCapabilitiesUrl,
          listeners: {
            ready: function () {
              const formats = this.capabilityRec.get('formats');
              expect(formats).to.be.an(Array);
              expect(formats.length).to.be(6);
              expect(formats[0]).to.be('bmp');
              done();
            },
          },
        });
      });
    });

    describe('attributes', function () {
      it('creates a store for attributes', function (done) {
        Ext.create('GeoExt.data.MapfishPrintProvider', {
          url: jsonpCapabilitiesUrl,
          listeners: {
            ready: function () {
              const layoutStore = this.capabilityRec.layouts();
              const firstLayout = layoutStore.getAt(0);
              const attributesStore = firstLayout.attributes();
              const firstAttributes = attributesStore.getAt(0);
              expect(attributesStore).to.be.an(Ext.data.Store);
              expect(attributesStore.getCount()).to.be(1);
              expect(firstAttributes).to.be.a(
                GeoExt.data.model.print.LayoutAttribute,
              );
              expect(firstAttributes.get('name')).to.be('map');
              expect(firstAttributes.get('type')).to.be('MapAttributeValues');
              done();
            },
          },
        });
      });
    });
  });
});
