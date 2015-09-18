Ext.Loader.syncRequire(['GeoExt.tree.Panel']);

describe('GeoExt.tree.Panel', function() {

    describe('basics', function(){

        it('is defined', function(){
            expect(GeoExt.tree.Panel).not.to.be(undefined);
        });

        it('can be instantiated', function(){
            expect(function() {
                var tree = Ext.create('GeoExt.tree.Panel');
                tree.destroy();
            }).to.not.throwException();
        });

    });

    describe('static methods', function(){

        describe('#findParentGroup', function(){

            it('is defined', function(){
                expect(GeoExt.tree.Panel.findParentGroup).to.be.a('function');
            });

            it('returns the correct group (no nesting)', function(){
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: [layer]});

                var got = GeoExt.tree.Panel.findParentGroup(layer, parentGroup);
                expect(got).to.be(parentGroup);
            });

            it('returns the correct group (deep nesting)', function(){
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: [layer]});
                var outerGroup1 = new ol.layer.Group({layers: [parentGroup]});
                var outerGroup2 = new ol.layer.Group({layers: [outerGroup1]});
                var outerGroup3 = new ol.layer.Group({layers: [outerGroup2]});
                var outerGroup4 = new ol.layer.Group({layers: [outerGroup3]});
                var outerGroup5 = new ol.layer.Group({layers: [outerGroup4]});

                var got = GeoExt.tree.Panel.findParentGroup(layer, outerGroup5);
                expect(got).to.be(parentGroup);
            });

            it('returns the correct group (deep nesting, many layers)',
                function(){
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

                    var got = GeoExt.tree.Panel.findParentGroup(
                        layer0, outerGroup5
                    );
                    expect(got).to.be(parentGroup);
                }
            );

            it('returns undefined if not found', function(){
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: []});

                var got = GeoExt.tree.Panel.findParentGroup(layer, parentGroup);
                expect(got).to.be(undefined);
            });

        });

        describe('#getLayerIndex', function(){

            it('is defined', function(){
                expect(GeoExt.tree.Panel.getLayerIndex).to.be.a('function');
            });

            it('returns the correct index (single layer)', function(){
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: [layer]});

                var got = GeoExt.tree.Panel.getLayerIndex(layer, parentGroup);
                expect(got).to.be(0);
            });

            it('returns the correct index (many layers)', function(){
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

                var got = GeoExt.tree.Panel.getLayerIndex(layer7, group);
                expect(got).to.be(7);
            });

            it('returns -1 if not found', function(){
                var layer = new ol.layer.Vector();
                var parentGroup = new ol.layer.Group({layers: []});

                var got = GeoExt.tree.Panel.getLayerIndex(layer, parentGroup);
                expect(got).to.be(-1);
            });

        });

    });

    describe('drag and drop is configurable', function(){

        describe('configuration option "dragDrop"', function(){
            var tree;

            beforeEach(function(){
                tree = Ext.create('GeoExt.tree.Panel');
            });
            afterEach(function(){
                tree.destroy();
            });

            it('defaults to true', function(){
                expect(tree.getDragDrop()).to.be(true);
            });

            it('registers a plugin on the view', function(){
                expect(tree.getView().getPlugins().length).to.be(1);
                expect(tree.getView().getPlugins()[0]).to.be.a(
                    Ext.tree.plugin.TreeViewDragDrop
                );
            });

            it('registers an eventhandler for "beforedrop" on the view',
                function(){
                    var view = tree.getView();
                    expect(view.hasListener('beforedrop')).to.be(true);
                }
            );

            it('registers an eventhandler for "drop" on the view',
                function(){
                    var view = tree.getView();
                    expect(view.hasListener('drop')).to.be(true);
                }
            );

        });

        describe('drag and drop can be turned off', function(){
            var tree;

            beforeEach(function(){
                tree = Ext.create('GeoExt.tree.Panel', {dragDrop: false});
            });
            afterEach(function(){
                tree.destroy();
            });

            it('can be set to false', function(){
                expect(tree.getDragDrop()).to.be(false);
            });

            it('doesn\'t register a plugin on the view', function(){
                expect(tree.getView().getPlugins()).to.be(null);
            });

            it('doesn\'t register an eventhandler for "beforedrop" on the view',
                function(){
                    var view = tree.getView();
                    expect(view.hasListener('beforedrop')).to.be(false);
                }
            );

            it('doesn\'t register an eventhandler for "drop" on the view',
                function(){
                    var view = tree.getView();
                    expect(view.hasListener('drop')).to.be(false);
                }
            );

        });

        describe('configuration option "dragDrop" and "viewConfig"', function(){
            var tree;

            beforeEach(function(){
                tree = Ext.create('GeoExt.tree.Panel', {
                    dragDrop: true,
                    viewConfig: {
                        plugins: [{
                            ptype: 'treeviewdragdrop'
                        }]
                    }
                });
            });
            afterEach(function(){
                tree.destroy();
            });

            it('it uses an existing dragdrop plugin', function(){
                expect(tree.getView().getPlugins().length).to.be(1);
                expect(tree.getView().getPlugins()[0]).to.be.a(
                    Ext.tree.plugin.TreeViewDragDrop
                );
            });

            it('still registers an eventhandler for "beforedrop" on the view',
                function(){
                    var view = tree.getView();
                    expect(view.hasListener('beforedrop')).to.be(true);
                }
            );

            it('still registers an eventhandler for "drop" on the view',
                function(){
                    var view = tree.getView();
                    expect(view.hasListener('drop')).to.be(true);
                }
            );

            it('does not overwrite existing handlers', function(){
                // setup
                var spy = sinon.spy();
                var div = document.createElement('div');
                document.body.appendChild(div);
                var tree2 = Ext.create('GeoExt.tree.Panel', {
                    dragDrop: true,
                    store: Ext.create('GeoExt.data.store.LayersTree', {
                        layerGroup: new ol.layer.Group()
                    }),
                    viewConfig: {
                        listeners: {
                            beforedrop: spy
                        },
                        plugins: [{
                            ptype: 'treeviewdragdrop'
                        }]
                    },
                    renderTo: div
                });
                var mockData = { records: [{ getOlLayer: function(){} }] };
                var mockOverModel = { getOlLayer: function(){} };

                // Fire the event…
                tree2.getView().fireEvent(
                    'beforedrop', {}, mockData, mockOverModel, ''
                );

                // … our spy mnust have been called
                expect(spy.called).to.be(true);

                // cleanup
                tree2.destroy();
                document.body.removeChild(div);
            });

        });

    });

    describe('dragging leafs / layers and folders / groups', function(){
        var div;
        var layer1;
        var layer2;
        var layer3;
        var innerGroup;
        var topMostGroup;
        var store;
        var tree;

        beforeEach(function(){
            div = document.createElement('div');
            document.body.appendChild(div);

            layer1 = new ol.layer.Vector({name: 'one'});
            layer2 = new ol.layer.Vector({name: 'two'});
            layer3 = new ol.layer.Vector({name: 'three'});
            innerGroup = new ol.layer.Group({
                layers: [layer2, layer3],
                name: 'innergroup'
            });
            topMostGroup = new ol.layer.Group({
                layers: [layer1, innerGroup],
                name: 'topMostGroup'
            });
            store = Ext.create('GeoExt.data.store.LayersTree', {
                layerGroup: topMostGroup
            });
            tree = Ext.create('GeoExt.tree.Panel', {
                store: store,
                renderTo: div
            });
        });
        afterEach(function(){
            store.destroy();
            tree.destroy();
            document.body.removeChild(div);
            div = null;
        });

        it('changes the layer order', function(done){
            tree.expandAll(function() {

                // Before we do anything
                //   0 => layer2
                //   1 => layer3
                expect(innerGroup.getLayers().item(0)).to.be(layer2);
                expect(innerGroup.getLayers().item(1)).to.be(layer3);

                // Let's emulate drag
                tree.getView().fireEvent(
                    'drop',
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(2)] // layer two
                    },
                    store.getAt(3), // layer three
                    'after'
                );

                // Now
                //   0 => layer3
                //   1 => layer2
                expect(innerGroup.getLayers().item(0)).to.be(layer3);
                expect(innerGroup.getLayers().item(1)).to.be(layer2);

                // Let's emulate a drag that reverts the previous one
                tree.getView().fireEvent(
                    'drop',
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(2)] // layer two
                    },
                    store.getAt(3), // layer three
                    'before'
                );

                // Now the order is again just like we started
                //   0 => layer2
                //   1 => layer3
                expect(innerGroup.getLayers().item(0)).to.be(layer2);
                expect(innerGroup.getLayers().item(1)).to.be(layer3);

                done();
            });

        });

        it('can move layers to different folders', function(done){
            tree.expandAll(function() {

                // Before we do anything
                //   0 => layer2
                //   1 => layer3
                expect(innerGroup.getLayers().item(0)).to.be(layer2);
                expect(innerGroup.getLayers().item(1)).to.be(layer3);

                // Let's emulate drag
                tree.getView().fireEvent(
                    'drop',
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(4)] // layer one
                    },
                    store.getAt(1), // innergroup
                    'append'
                );

                // Now
                //   length = 3
                expect(innerGroup.getLayers().getLength()).to.be(3);

                // Let's emulate a drag that reverts the previous one
                tree.getView().fireEvent(
                    'drop',
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(4)] // layer two
                    },
                    store.getAt(1), // innergroup
                    'before'
                );

                // Now the length is again just like we started
                //   length = 2
                expect(innerGroup.getLayers().getLength()).to.be(2);

                done();
            });

        });

        it('can move folders around', function(done){
            tree.expandAll(function() {

                // Before we do anything
                //   0 => layer1
                //   1 => innerGroup
                expect(topMostGroup.getLayers().item(0)).to.be(layer1);
                expect(topMostGroup.getLayers().item(1)).to.be(innerGroup);

                // Let's emulate drag
                tree.getView().fireEvent(
                    'drop',
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(1)] // innergroup
                    },
                    store.getAt(4), // layer one
                    'after'
                );

                // Now
                //   0 => innerGroup
                //   1 => layer1
                expect(topMostGroup.getLayers().item(0)).to.be(innerGroup);
                expect(topMostGroup.getLayers().item(1)).to.be(layer1);

                // Let's emulate a drag that reverts the previous one
                tree.getView().fireEvent(
                    'drop',
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(1)] // innergroup
                    },
                    store.getAt(4), // layer1
                    'before'
                );

                // Now the order is again just like we started
                //   0 => layer1
                //   1 => innerGroup
                expect(topMostGroup.getLayers().item(0)).to.be(layer1);
                expect(topMostGroup.getLayers().item(1)).to.be(innerGroup);

                done();
            });

        });

    });

    describe('illegal drags get cancelled in beforedrop', function(){
        var div;
        var layer1;
        var layer2;
        var layer3;
        var innerGroup;
        var topMostGroup;
        var store;
        var tree;

        beforeEach(function(){
            div = document.createElement('div');
            document.body.appendChild(div);

            layer1 = new ol.layer.Vector({name: 'one'});
            layer2 = new ol.layer.Vector({name: 'two'});
            layer3 = new ol.layer.Vector({name: 'three'});
            innerGroup = new ol.layer.Group({
                layers: [layer2, layer3],
                name: 'innergroup'
            });
            topMostGroup = new ol.layer.Group({
                layers: [layer1, innerGroup],
                name: 'topMostGroup'
            });
            store = Ext.create('GeoExt.data.store.LayersTree', {
                layerGroup: topMostGroup,
                showLayerGroupNode: true // otherwise nothing will get cancelled
            });
            tree = Ext.create('GeoExt.tree.Panel', {
                store: store,
                renderTo: div
            });
        });
        afterEach(function(){
            store.destroy();
            tree.destroy();
            document.body.removeChild(div);
            div = null;
        });

        it('cancels a drag "before" the topMostFolder', function(done){
            tree.expandAll(function() {
                // This time we call directly into the handler of the beforedrop
                // if it returns fals, the event sequence will not be continued
                var gotForBefore = tree.handleLayerBeforeDrop.call(
                    tree,
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(2)] // innergroup
                    },
                    store.getAt(1), // topMostGroup
                    'before'
                );

                expect(gotForBefore).to.be(false);

                done();
            });
        });

        it('cancels a drag "after" the topMostFolder', function(done){
            tree.expandAll(function() {
                // We also do not allow the drop after topMostGroup
                var gotForAfter = tree.handleLayerBeforeDrop.call(
                    tree,
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(2)] // innergroup
                    },
                    store.getAt(1), // topMostGroup
                    'after'
                );

                expect(gotForAfter).to.be(false);

                done();
            });
        });

        it('always allows a drag to "append" to the topMostFolder',
            function(done){
                tree.expandAll(function() {
                    // appending is always allowed
                    var gotForAppend = tree.handleLayerBeforeDrop.call(
                        tree,
                        tree.getView().getEl().dom,
                        {
                            records: [store.getAt(2)] // innergroup
                        },
                        store.getAt(1), // topMostGroup
                        'append'
                    );

                    expect(gotForAppend).to.be(true);

                    done();
                });
            });

        it('always allows a drag to some other place', function(done){
            tree.expandAll(function() {
                var gotForSomethingElse = tree.handleLayerBeforeDrop.call(
                    tree,
                    tree.getView().getEl().dom,
                    {
                        records: [store.getAt(1)] // innergroup
                    },
                    store.getAt(4), // layer one
                    'after'
                );

                expect(gotForSomethingElse).to.be(true);

                done();
            });
        });

    });

});
