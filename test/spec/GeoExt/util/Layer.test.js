Ext.Loader.syncRequire(['GeoExt.util.Layer']);

describe('GeoExt.util.Layer', function() {

    describe('basics', function() {

        it('is defined', function() {
            expect(GeoExt.util.Layer).not.to.be(undefined);
        });

    });

    describe('static methods', function() {

        describe('#findParentGroup', function() {

            it('is defined', function() {
                expect(GeoExt.util.Layer.findParentGroup).to.be.a('function');
            });

            it('returns the correct group (no nesting)', function() {
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: [layer]});

                var got = GeoExt.util.Layer.findParentGroup(layer, parentGroup);
                expect(got).to.be(parentGroup);
            });

            it('returns the correct group (deep nesting)', function() {
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: [layer]});
                var outerGroup1 = new ol.layer.Group({layers: [parentGroup]});
                var outerGroup2 = new ol.layer.Group({layers: [outerGroup1]});
                var outerGroup3 = new ol.layer.Group({layers: [outerGroup2]});
                var outerGroup4 = new ol.layer.Group({layers: [outerGroup3]});
                var outerGroup5 = new ol.layer.Group({layers: [outerGroup4]});

                var got = GeoExt.util.Layer.findParentGroup(layer, outerGroup5);
                expect(got).to.be(parentGroup);
            });

            it('returns the correct group (deep nesting, many layers)',
                function() {
                    var layer0 = new ol.layer.Vector();
                    var layer1 = new ol.layer.Vector();
                    var layer2 = new ol.layer.Vector();
                    var layer3 = new ol.layer.Vector();
                    var layer4 = new ol.layer.Vector();
                    var layer5 = new ol.layer.Vector();
                    var layer6 = new ol.layer.Vector();
                    var layer7 = new ol.layer.Vector();
                    var layer8 = new ol.layer.Vector();
                    var layer9 = new ol.layer.Vector();

                    var parentGroup = new ol.layer.Group({
                        layers: [layer0, layer1]
                    });
                    var outerGroup1 = new ol.layer.Group({
                        layers: [layer2, parentGroup]
                    });
                    var outerGroup2 = new ol.layer.Group({
                        layers: [outerGroup1, layer3]
                    });
                    var outerGroup3 = new ol.layer.Group({
                        layers: [layer4, layer5, outerGroup2]
                    });
                    var outerGroup4 = new ol.layer.Group({
                        layers: [layer6, outerGroup3, layer7]
                    });
                    var outerGroup5 = new ol.layer.Group({
                        layers: [layer8, layer9, outerGroup4]
                    });

                    var got = GeoExt.util.Layer.findParentGroup(
                        layer0, outerGroup5
                    );
                    expect(got).to.be(parentGroup);
                }
            );

            it('returns undefined if not found', function() {
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: []});

                var got = GeoExt.util.Layer.findParentGroup(layer, parentGroup);
                expect(got).to.be(undefined);
            });

        });

        describe('#getLayerIndex', function() {

            it('is defined', function() {
                expect(GeoExt.util.Layer.getLayerIndex).to.be.a('function');
            });

            it('returns the correct index (single layer)', function() {
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: [layer]});

                var got = GeoExt.util.Layer.getLayerIndex(layer, parentGroup);
                expect(got).to.be(0);
            });

            it('returns the correct index (many layers)', function() {
                var layer0 = new ol.layer.Vector();
                var layer1 = new ol.layer.Vector();
                var layer2 = new ol.layer.Vector();
                var layer3 = new ol.layer.Vector();
                var layer4 = new ol.layer.Vector();
                var layer5 = new ol.layer.Vector();
                var layer6 = new ol.layer.Vector();
                var layer7 = new ol.layer.Vector();
                var layer8 = new ol.layer.Vector();
                var layer9 = new ol.layer.Vector();
                var group = new ol.layer.Group({
                    layers: [
                        layer0, layer1, layer2,
                        layer3, layer4, layer5,
                        layer6, layer7, layer8,
                        layer9
                    ]
                });

                var got = GeoExt.util.Layer.getLayerIndex(layer7, group);
                expect(got).to.be(7);
            });

            it('returns -1 if not found', function() {
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: []});

                var got = GeoExt.util.Layer.getLayerIndex(layer, parentGroup);
                expect(got).to.be(-1);
            });

        });

    });

});
