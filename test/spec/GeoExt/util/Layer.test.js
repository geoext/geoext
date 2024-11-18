Ext.Loader.syncRequire(['GeoExt.util.Layer']);

describe('GeoExt.util.Layer', function () {
  describe('basics', function () {
    it('is defined', function () {
      expect(GeoExt.util.Layer).not.to.be(undefined);
    });
  });

  describe('static methods', function () {
    describe('#findParentGroup', function () {
      it('is defined', function () {
        expect(GeoExt.util.Layer.findParentGroup).to.be.a('function');
      });

      it('returns the correct group (no nesting)', function () {
        const layer = new ol.layer.Vector();
        const parentGroup = new ol.layer.Group({layers: [layer]});

        const got = GeoExt.util.Layer.findParentGroup(layer, parentGroup);
        expect(got).to.be(parentGroup);
      });

      it('returns the correct group (deep nesting)', function () {
        const layer = new ol.layer.Vector();
        const parentGroup = new ol.layer.Group({layers: [layer]});
        const outerGroup1 = new ol.layer.Group({layers: [parentGroup]});
        const outerGroup2 = new ol.layer.Group({layers: [outerGroup1]});
        const outerGroup3 = new ol.layer.Group({layers: [outerGroup2]});
        const outerGroup4 = new ol.layer.Group({layers: [outerGroup3]});
        const outerGroup5 = new ol.layer.Group({layers: [outerGroup4]});

        const got = GeoExt.util.Layer.findParentGroup(layer, outerGroup5);
        expect(got).to.be(parentGroup);
      });

      it('returns the correct group (deep nesting, many layers)', function () {
        const layer0 = new ol.layer.Vector();
        const layer1 = new ol.layer.Vector();
        const layer2 = new ol.layer.Vector();
        const layer3 = new ol.layer.Vector();
        const layer4 = new ol.layer.Vector();
        const layer5 = new ol.layer.Vector();
        const layer6 = new ol.layer.Vector();
        const layer7 = new ol.layer.Vector();
        const layer8 = new ol.layer.Vector();
        const layer9 = new ol.layer.Vector();

        const parentGroup = new ol.layer.Group({
          layers: [layer0, layer1],
        });
        const outerGroup1 = new ol.layer.Group({
          layers: [layer2, parentGroup],
        });
        const outerGroup2 = new ol.layer.Group({
          layers: [outerGroup1, layer3],
        });
        const outerGroup3 = new ol.layer.Group({
          layers: [layer4, layer5, outerGroup2],
        });
        const outerGroup4 = new ol.layer.Group({
          layers: [layer6, outerGroup3, layer7],
        });
        const outerGroup5 = new ol.layer.Group({
          layers: [layer8, layer9, outerGroup4],
        });

        const got = GeoExt.util.Layer.findParentGroup(layer0, outerGroup5);
        expect(got).to.be(parentGroup);
      });

      it('returns undefined if not found', function () {
        const layer = new ol.layer.Vector();
        const parentGroup = new ol.layer.Group({layers: []});

        const got = GeoExt.util.Layer.findParentGroup(layer, parentGroup);
        expect(got).to.be(undefined);
      });
    });

    describe('#getLayerIndex', function () {
      it('is defined', function () {
        expect(GeoExt.util.Layer.getLayerIndex).to.be.a('function');
      });

      it('returns the correct index (single layer)', function () {
        const layer = new ol.layer.Vector();
        const parentGroup = new ol.layer.Group({layers: [layer]});

        const got = GeoExt.util.Layer.getLayerIndex(layer, parentGroup);
        expect(got).to.be(0);
      });

      it('returns the correct index (many layers)', function () {
        const layer0 = new ol.layer.Vector();
        const layer1 = new ol.layer.Vector();
        const layer2 = new ol.layer.Vector();
        const layer3 = new ol.layer.Vector();
        const layer4 = new ol.layer.Vector();
        const layer5 = new ol.layer.Vector();
        const layer6 = new ol.layer.Vector();
        const layer7 = new ol.layer.Vector();
        const layer8 = new ol.layer.Vector();
        const layer9 = new ol.layer.Vector();
        const group = new ol.layer.Group({
          layers: [
            layer0,
            layer1,
            layer2,
            layer3,
            layer4,
            layer5,
            layer6,
            layer7,
            layer8,
            layer9,
          ],
        });

        const got = GeoExt.util.Layer.getLayerIndex(layer7, group);
        expect(got).to.be(7);
      });

      it('returns -1 if not found', function () {
        const layer = new ol.layer.Vector();
        const parentGroup = new ol.layer.Group({layers: []});

        const got = GeoExt.util.Layer.getLayerIndex(layer, parentGroup);
        expect(got).to.be(-1);
      });
    });
  });
});
