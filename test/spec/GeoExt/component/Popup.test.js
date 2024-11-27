Ext.Loader.syncRequire(['GeoExt.component.Popup']);

describe('GeoExt.component.Popup', function () {
  describe('basics', function () {
    it('GeoExt.component.Popup is defined', function () {
      expect(GeoExt.component.Popup).not.to.be(undefined);
    });

    describe('constructor', function () {
      it('throws if no map component provided', function () {
        expect(function () {
          Ext.create('GeoExt.component.Popup');
        }).to.throwException();
      });
    });

    it('can be created if not render target was specified', function () {
      const layer = new ol.layer.Tile({
        source: new ol.source.OSM(),
      });
      const testObjs = TestUtil.setupTestObjects({
        mapOpts: {
          layers: [layer],
          view: new ol.View({
            center: [0, 0],
            zoom: 2,
          }),
        },
      });

      const map = testObjs.map;
      const testPopup = Ext.create('GeoExt.component.Popup', {
        map: map,
      });
      expect(testPopup).not.to.be(undefined);
    });
  });
});
