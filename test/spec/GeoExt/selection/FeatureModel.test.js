Ext.Loader.syncRequire(['GeoExt.selection.FeatureModel']);

describe('GeoExt.selection.FeatureModel', function() {

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.selection.FeatureModel).not.to.be(undefined);
        });
    });

    describe('constructor (no arguments)', function() {
        var selModel = Ext.create('GeoExt.selection.FeatureModel', {});
        it('constructs an instance of GeoExt.selection.FeatureModel',
            function() {
                expect(selModel).to.be.an(GeoExt.selection.FeatureModel);
            }
        );
    });

    describe('configs and properties', function() {
        var selModel;
        beforeEach(function() {
            selModel = Ext.create('GeoExt.selection.FeatureModel');
        });
        afterEach(function() {
            selModel.destroy();
        });

        it('are correctly defined (with defaults)', function() {
            expect(selModel.selectedFeatures).to.be(null);
            expect(selModel.layer).to.be(null);
            expect(selModel.selectStyle instanceof ol.style.Style).to.be(true);
            expect(selModel.selectedFeatureAttr).to.be('gx_selected');
        });
    });

    describe('Init process', function() {

        var selModel;
        beforeEach(function() {
            selModel = Ext.create('GeoExt.selection.FeatureModel');
        });
        afterEach(function() {
            selModel.destroy();
        });

        it('creates an empty OL collection "selectedFeatures"', function() {
            selModel.bindComponent();
            expect(selModel.selectedFeatures).to.be.an(ol.Collection);
            expect(selModel.selectedFeatures.getLength()).to.be(0);
        });

        it('binds "add" event of "selectedFeatures"', function() {
            var called = false;
            selModel.onSelectFeatAdd = function() {
                called = true;
            };
            selModel.bindComponent();

            selModel.selectedFeatures.push(new ol.Feature());
            expect(called).to.be(true);
        });

        it('bind "remove" event of "selectedFeatures"', function() {
            var called = false;
            selModel.onSelectFeatAdd = function() {
                called = true;
            };
            selModel.bindComponent();

            var feat = new ol.Feature();
            selModel.selectedFeatures.push(feat);
            selModel.selectedFeatures.remove(feat);
            expect(called).to.be(true);
        });
    });

    describe('Layer detection', function() {
        var selModel;
        var featStore;
        var layer;
        beforeEach(function() {
            layer = new ol.layer.Vector();
            featStore =
                Ext.create('GeoExt.data.store.Features', {});

            selModel = Ext.create('GeoExt.selection.FeatureModel', {});
            // feature grid with a feature selection model
            Ext.create('Ext.grid.Panel', {
                title: 'Feature Grid w. SelectionModel',
                store: featStore,
                selModel: selModel
            });
        });
        afterEach(function() {
            selModel.destroy();
            featStore.destroy();
            selModel = null;
            featStore = null;
            layer = null;
        });

        it('is done by store if not configured', function() {
            expect(selModel.layer).to.be(featStore.layer);
        });

        it('is skipped if passed in',
            function() {
                selModel = Ext.create('GeoExt.selection.FeatureModel', {
                    layer: layer
                });
                expect(selModel.layer).not.to.be(featStore.layer);
                expect(selModel.layer).to.be(layer);
            }
        );
    });

    describe('selection / deselection of single features by grid', function() {
        var selModel;
        var grid;
        var featStore;
        var selRec;
        var selFeat;
        beforeEach(function() {
            var feat = new ol.Feature();
            var coll = new ol.Collection();
            coll.push(feat);
            featStore =
                Ext.create('GeoExt.data.store.Features', {features: coll});

            selModel = Ext.create('GeoExt.selection.FeatureModel', {
                mode: 'SINGLE'});
            // feature grid with a feature selection model
            grid = Ext.create('Ext.grid.Panel', {
                store: featStore,
                selModel: selModel
            });
            selRec = featStore.getAt(0);
            selFeat = selRec.getFeature();
        });
        afterEach(function() {
            selModel.destroy();
            featStore.destroy();
            grid.destroy();
            selModel = null;
            featStore = null;
            grid = null;
            selRec = null;
            selFeat = null;
        });

        it('selection adds feature to "selectedFeatures"', function() {
            grid.getView().setSelection(selRec);

            expect(selModel.selectedFeatures.getLength()).to.be(1);
            expect(selModel.selectedFeatures.item(0)).to.be(selFeat);
        });

        it('selection tags the feature as selected', function() {
            grid.getView().setSelection(selRec);

            expect(selFeat.get(selModel.selectedFeatureAttr)).to.be(true);
        });

        it('selection sets the select style to the feature', function() {
            var selFeatStyle = selFeat.getStyle();
            expect(selFeatStyle).to.be(null);

            grid.getView().setSelection(selRec);

            selFeatStyle = selFeat.getStyle();
            expect(
                selFeatStyle.getImage().getFill().getColor()).to.
                be('rgba(255,255,255,0.8)');
        });

        it('deselection removes feature from "selectedFeatures"', function() {
            grid.getView().setSelection(selRec);
            grid.getView().deselect([selRec]);

            expect(selModel.selectedFeatures.getLength()).to.be(0);
        });

        it('deselection tags the feature as not selected', function() {
            grid.getView().setSelection(selRec);
            grid.getView().deselect([selRec]);

            expect(selFeat.get(selModel.selectedFeatureAttr)).to.be(false);
        });

        it('deselection resets the select style of the feature', function() {
            var selFeatStyle = selFeat.getStyle();

            grid.getView().setSelection(selRec);
            grid.getView().deselect([selRec]);

            selFeatStyle = selFeat.getStyle();
            expect(selFeatStyle).to.be(undefined);
        });

        it('deselection restores a possibly exist. feature style', function() {
            var existingFeatStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 16,
                    fill: new ol.style.Fill({
                        color: 'green'
                    })
                })
            });
            selFeat.setStyle(existingFeatStyle);

            grid.getView().setSelection(selRec);
            grid.getView().deselect([selRec]);

            var selFeatStyle = selFeat.getStyle();
            expect(selFeatStyle).to.be(existingFeatStyle);
        });
    });

    describe('selection / deselection of multi. features by grid', function() {
        var selModel;
        var grid;
        var featStore;
        var selRec1;
        var selFeat1;
        var selRec2;
        var selFeat2;
        beforeEach(function() {
            var feat1 = new ol.Feature();
            var feat2 = new ol.Feature();
            var coll = new ol.Collection();
            coll.push(feat1);
            coll.push(feat2);
            featStore =
                Ext.create('GeoExt.data.store.Features', {features: coll});

            selModel = Ext.create('GeoExt.selection.FeatureModel', {
                mode: 'SIMPLE' // allows selection multiple records at a time
            });
            // feature grid with a feature selection model
            grid = Ext.create('Ext.grid.Panel', {
                store: featStore,
                selModel: selModel
            });
            selRec1 = featStore.getAt(0);
            selFeat1 = selRec1.getFeature();
            selRec2 = featStore.getAt(1);
            selFeat2 = selRec2.getFeature();
        });
        afterEach(function() {
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

        it('selection adds multip. features to "selectedFeatures"', function() {
            grid.getView().select([selRec1, selRec2]);

            expect(selModel.selectedFeatures.getLength()).to.be(2);
            expect(selModel.selectedFeatures.item(0)).to.be(selFeat1);
            expect(selModel.selectedFeatures.item(1)).to.be(selFeat2);
        });

        it('deselection removes multiple features from "selectedFeatures"',
            function() {
                grid.getView().select([selRec1, selRec2]);
                grid.getView().deselect([selRec1, selRec2]);

                expect(selModel.selectedFeatures.getLength()).to.be(0);
            }
        );
    });
});
