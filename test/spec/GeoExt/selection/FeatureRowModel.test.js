Ext.Loader.syncRequire(['GeoExt.selection.FeatureRowModel']);

describe('GeoExt.selection.FeatureRowModel', function () {
  describe('basics', function () {
    it('is defined', function () {
      expect(GeoExt.selection.FeatureRowModel).not.to.be(undefined);
    });
  });

  describe('constructor (no arguments)', function () {
    const selModel = Ext.create('GeoExt.selection.FeatureRowModel', {});
    it('constructs an instance of GeoExt.selection.FeatureRowModel', function () {
      expect(selModel).to.be.an(GeoExt.selection.FeatureRowModel);
    });
  });

  describe('configs and properties', function () {
    let selModel;
    beforeEach(function () {
      selModel = Ext.create('GeoExt.selection.FeatureRowModel');
    });
    afterEach(function () {
      selModel.destroy();
    });

    it('are correctly defined (with defaults)', function () {
      expect(selModel.selectedFeatures).to.be(null);
      expect(selModel.layer).to.be(null);
      expect(selModel.selectStyle instanceof ol.style.Style).to.be(true);
      expect(selModel.selectedFeatureAttr).to.be('gx_selected');
    });
  });

  describe('Init process', function () {
    let selModel;
    beforeEach(function () {
      selModel = Ext.create('GeoExt.selection.FeatureRowModel');
    });
    afterEach(function () {
      selModel.destroy();
    });

    it('creates an empty OL collection "selectedFeatures"', function () {
      selModel.bindComponent();
      expect(selModel.selectedFeatures).to.be.an(ol.Collection);
      expect(selModel.selectedFeatures.getLength()).to.be(0);
    });

    it('binds "add" event of "selectedFeatures"', function () {
      let called = false;
      selModel.onSelectFeatAdd = function () {
        called = true;
      };
      selModel.bindComponent();

      selModel.selectedFeatures.push(new ol.Feature());
      expect(called).to.be(true);
    });

    it('bind "remove" event of "selectedFeatures"', function () {
      let called = false;
      selModel.onSelectFeatAdd = function () {
        called = true;
      };
      selModel.bindComponent();

      const feat = new ol.Feature();
      selModel.selectedFeatures.push(feat);
      selModel.selectedFeatures.remove(feat);
      expect(called).to.be(true);
    });
  });

  describe('destruction', function () {
    let testObjs;
    let map;

    beforeEach(function () {
      testObjs = TestUtil.setupTestObjects({
        mapOpts: {
          view: new ol.View({
            center: [0, 0],
            zoom: 2,
          }),
        },
      });

      map = testObjs.map;
    });

    afterEach(function () {
      TestUtil.teardownTestObjects(testObjs);
    });

    it('binds and unbinds', function () {
      const spy = sinon.spy(
        GeoExt.selection.FeatureRowModel.prototype,
        'onFeatureClick',
      );

      const selModel = Ext.create('GeoExt.selection.FeatureRowModel', {
        mapSelection: true,
        map: map,
        layer: new ol.layer.Vector({
          source: new ol.source.Vector(),
        }),
      });

      const panel = Ext.create('Ext.grid.Panel', {
        title: 'Feature Grid w. SelectionModel',
        selModel: selModel,
      });

      map.dispatchEvent('singleclick');

      expect(spy.calledOnce).to.be(true);

      panel.destroy();

      map.dispatchEvent('singleclick');

      expect(spy.calledOnce).to.be(true);
    });
  });

  describe('Layer detection', function () {
    let selModel;
    let featStore;
    let layer;
    beforeEach(function () {
      layer = new ol.layer.Vector();
      featStore = Ext.create('GeoExt.data.store.Features', {});

      selModel = Ext.create('GeoExt.selection.FeatureRowModel', {});
      // feature grid with a feature selection model
      Ext.create('Ext.grid.Panel', {
        title: 'Feature Grid w. SelectionModel',
        store: featStore,
        selModel: selModel,
      });
    });
    afterEach(function () {
      selModel.destroy();
      featStore.destroy();
      selModel = null;
      featStore = null;
      layer = null;
    });

    it('is done by store if not configured', function () {
      expect(selModel.layer).to.be(featStore.layer);
    });

    it('is skipped if passed in', function () {
      selModel = Ext.create('GeoExt.selection.FeatureRowModel', {
        layer: layer,
      });
      expect(selModel.layer).not.to.be(featStore.layer);
      expect(selModel.layer).to.be(layer);
    });
  });

  describe('selection / deselection of single features by grid', function () {
    let selModel;
    let grid;
    let featStore;
    let selRec;
    let selFeat;
    beforeEach(function () {
      const feat = new ol.Feature();
      const coll = new ol.Collection();
      coll.push(feat);
      featStore = Ext.create('GeoExt.data.store.Features', {features: coll});

      selModel = Ext.create('GeoExt.selection.FeatureRowModel', {
        mode: 'SINGLE',
      });
      // feature grid with a feature selection model
      grid = Ext.create('Ext.grid.Panel', {
        store: featStore,
        selModel: selModel,
      });
      selRec = featStore.getAt(0);
      selFeat = selRec.getFeature();
    });
    afterEach(function () {
      selModel.destroy();
      featStore.destroy();
      grid.destroy();
      selModel = null;
      featStore = null;
      grid = null;
      selRec = null;
      selFeat = null;
    });

    it('selection adds feature to "selectedFeatures"', function () {
      grid.getView().setSelection(selRec);

      expect(selModel.selectedFeatures.getLength()).to.be(1);
      expect(selModel.selectedFeatures.item(0)).to.be(selFeat);
    });

    it('selection tags the feature as selected', function () {
      grid.getView().setSelection(selRec);

      expect(selFeat.get(selModel.selectedFeatureAttr)).to.be(true);
    });

    it('selection sets the select style to the feature', function () {
      let selFeatStyle = selFeat.getStyle();
      expect(selFeatStyle).to.be(null);

      grid.getView().setSelection(selRec);

      selFeatStyle = selFeat.getStyle();
      expect(selFeatStyle.getImage().getFill().getColor()).to.be(
        'rgba(255,255,255,0.8)',
      );
    });

    it('deselection removes feature from "selectedFeatures"', function () {
      grid.getView().setSelection(selRec);
      grid.getView().deselect([selRec]);

      expect(selModel.selectedFeatures.getLength()).to.be(0);
    });

    it('deselection tags the feature as not selected', function () {
      grid.getView().setSelection(selRec);
      grid.getView().deselect([selRec]);

      expect(selFeat.get(selModel.selectedFeatureAttr)).to.be(false);
    });

    it('deselection resets the select style of the feature', function () {
      let selFeatStyle = selFeat.getStyle();

      grid.getView().setSelection(selRec);
      grid.getView().deselect([selRec]);

      selFeatStyle = selFeat.getStyle();
      expect(selFeatStyle).to.be(undefined);
    });

    it('deselection restores a possibly exist. feature style', function () {
      const existingFeatStyle = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 16,
          fill: new ol.style.Fill({
            color: 'green',
          }),
        }),
      });
      selFeat.setStyle(existingFeatStyle);

      grid.getView().setSelection(selRec);
      grid.getView().deselect([selRec]);

      const selFeatStyle = selFeat.getStyle();
      expect(selFeatStyle).to.be(existingFeatStyle);
    });
  });

  describe('selection / deselection of multi. features by grid', function () {
    let selModel;
    let grid;
    let featStore;
    let selRec1;
    let selFeat1;
    let selRec2;
    let selFeat2;
    beforeEach(function () {
      const feat1 = new ol.Feature();
      const feat2 = new ol.Feature();
      const coll = new ol.Collection();
      coll.push(feat1);
      coll.push(feat2);
      featStore = Ext.create('GeoExt.data.store.Features', {features: coll});

      selModel = Ext.create('GeoExt.selection.FeatureRowModel', {
        mode: 'SIMPLE', // allows selection multiple records at a time
      });
      // feature grid with a feature selection model
      grid = Ext.create('Ext.grid.Panel', {
        store: featStore,
        selModel: selModel,
      });
      selRec1 = featStore.getAt(0);
      selFeat1 = selRec1.getFeature();
      selRec2 = featStore.getAt(1);
      selFeat2 = selRec2.getFeature();
    });
    afterEach(function () {
      selModel.destroy();
      featStore.destroy();
      grid.destroy();
      selModel = null;
      featStore = null;
      grid = null;
      selRec1 = null;
      selFeat1 = null;
      selRec2 = null;
      selFeat2 = null;
    });

    it('selection adds multip. features to "selectedFeatures"', function () {
      grid.getView().select([selRec1, selRec2]);

      expect(selModel.selectedFeatures.getLength()).to.be(2);
      expect(selModel.selectedFeatures.item(0)).to.be(selFeat1);
      expect(selModel.selectedFeatures.item(1)).to.be(selFeat2);
    });

    it('deselection removes multiple features from "selectedFeatures"', function () {
      grid.getView().select([selRec1, selRec2]);
      grid.getView().deselect([selRec1, selRec2]);

      expect(selModel.selectedFeatures.getLength()).to.be(0);
    });
  });

  describe('selection and clearing of features with filters', function () {
    let selModel;
    let grid;
    let featStore;
    let selRec;
    let selFeat;
    let layer;

    beforeEach(function () {
      const feat = new ol.Feature({fid: 1});
      const coll = new ol.Collection();
      coll.push(feat);

      layer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: coll,
        }),
      });

      featStore = Ext.create('GeoExt.data.store.Features', {
        layer: layer,
      });

      featStore.filterBy(function (rec) {
        return rec.get('fid') !== -1;
      });

      selModel = Ext.create('GeoExt.selection.FeatureRowModel', {
        mode: 'SINGLE',
      });
      // feature grid with a feature selection model
      grid = Ext.create('Ext.grid.Panel', {
        store: featStore,
        selModel: selModel,
      });
      selRec = featStore.getAt(0);
      selFeat = selRec.getFeature();
    });

    afterEach(function () {
      selModel.destroy();
      featStore.destroy();
      grid.destroy();
      selModel = null;
      featStore = null;
      grid = null;
      selRec = null;
      selFeat = null;
    });

    it('selection is cleared when layer is cleared', function () {
      grid.getView().setSelection(selRec);
      layer.getSource().clear();
      expect(selModel.selectedFeatures.getLength()).to.be(0);
      expect(featStore.getData().getCount()).to.be(0);
      expect(layer.getSource().getFeatures().length).to.be(0);
    });

    it('selection is cleared when feature is removed', function () {
      grid.getView().setSelection(selRec);
      layer.getSource().removeFeature(selFeat);
      expect(selModel.selectedFeatures.getLength()).to.be(0);
      expect(featStore.getData().getCount()).to.be(0);
      expect(layer.getSource().getFeatures().length).to.be(0);
    });
  });
});
