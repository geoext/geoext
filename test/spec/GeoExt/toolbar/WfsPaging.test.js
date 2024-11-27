Ext.Loader.syncRequire(['GeoExt.toolbar.WfsPaging']);

describe('GeoExt.toolbar.WfsPaging', function () {
  describe('basics', function () {
    it('GeoExt.toolbar.WfsPaging is defined', function () {
      expect(GeoExt.toolbar.WfsPaging).not.to.be(undefined);
    });

    describe('constructor', function () {
      it('can be constructed wo/ arguments via Ext.create()', function () {
        const wfsPagingTb = Ext.create('GeoExt.toolbar.WfsPaging');
        expect(wfsPagingTb).to.be.an(GeoExt.toolbar.WfsPaging);
      });
    });
  });

  describe('event "gx-wfsstoreload" of connected store', function () {
    const dataPath = typeof __karma__ === 'undefined' ? '' : 'base/test/';
    const url = dataPath + 'data/wfs_mock.geojson';
    const wfsStore = Ext.create('GeoExt.data.store.WfsFeatures', {
      url: url,
      format: new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857',
      }),
    });

    const wfsPagingTb = Ext.create('GeoExt.toolbar.WfsPaging');
    let loadCalled = false;
    wfsPagingTb.onLoad = function () {
      loadCalled = true;
    };

    Ext.create('Ext.grid.Panel', {
      width: 500,
      store: wfsStore,
      columns: [
        {
          text: 'FOO',
          dataIndex: 'foo',
        },
      ],
      bbar: wfsPagingTb,
    });

    it('is bound to the "onLoad" function of the toolbar', function () {
      expect(loadCalled).to.be(true);
    });
  });
});
