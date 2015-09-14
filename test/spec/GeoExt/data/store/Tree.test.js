Ext.Loader.syncRequire(['GeoExt.data.store.LayersTree', 'GeoExt.tree.Panel']);

describe('GeoExt.data.store.LayersTree', function() {


    var div;
    var treeDiv;
    var olMap;
    var mapComponent;
    var source;
    var layer;
    var treeStore;
    var treePanel;

    beforeEach(function(){
        div = document.createElement('div');
        div.style.position = "absolute";
        div.style.top = "0";
        div.style.left = "-1000px";
        div.style.width = "512px";
        div.style.height = "256px";
        document.body.appendChild(div);

        treeDiv = document.createElement('div');
        treeDiv.style.position = "absolute";
        treeDiv.style.top = "0";
        treeDiv.style.left = "-1000px";
        treeDiv.style.width = "512px";
        treeDiv.style.height = "256px";
        document.body.appendChild(treeDiv);

        source = new ol.source.MapQuest({layer: 'sat'});
        layer = new ol.layer.Tile({
            source: source
        });

        olMap = new ol.Map({
            target: div,
            layers: [layer],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap
        });

        treeStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: olMap.getLayerGroup()
        });

        treePanel = Ext.create('GeoExt.tree.Panel', {
            title: 'GeoExt.tree.Panel Example',
            store: treeStore,
            renderTo: treeDiv,
            rootVisible: false,
            flex: 1,
            border: false
        });
    });

    afterEach(function(){
        mapComponent.destroy();
        treeStore.destroy();
        document.body.removeChild(div);
    });

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.store.LayersTree).not.to.be(undefined);
        });
    });

    describe('Instanciation', function() {

        it('can be created with ol.Map.getLayerGroup()', function() {
            treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                layerStore: olMap.getLayerGroup()
            });
            expect(treeStore).to.be.a(GeoExt.data.store.LayersTree);
        });

        it('will react to the showLayerGroupNode property', function() {
            treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                layerGroup: olMap.getLayerGroup(),
                showLayerGroupNode: true
            });

            Ext.create('GeoExt.tree.Panel', {
                title: 'GeoExt.tree.Panel Example',
                store: treeStore,
                rootVisible: false,
                flex: 1,
                border: false
            });

            var firstChild = treeStore.getRootNode().getChildAt(0);
            expect(firstChild.getOlLayer()).to.be.an(ol.layer.Group);
            expect(firstChild.getOlLayer().getLayers().item(0)).to.be(layer);
        });

    });


    describe('Listens to Map/LayerCollection events', function() {

        it('adds/removes listeners for ol.Collections (hidden LayerGroupNode)',
            function() {
                treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                    layerGroup: olMap.getLayerGroup()
                });

                treePanel = Ext.create('GeoExt.tree.Panel', {
                    title: 'GeoExt.tree.Panel Example',
                    store: treeStore,
                    rootVisible: false,
                    flex: 1,
                    border: false
                });

                var layer2 = new ol.layer.Tile({
                    source: new ol.source.MapQuest({
                        layer: 'hyb'
                    }),
                    name: 'LAYERZWO'
                });
                mapComponent.addLayer(layer2);

                var treeNode = treeStore.getRootNode().getChildAt(0);
                expect(treeNode.get('text')).to.be(layer2.get('name'));

                mapComponent.removeLayer(layer);
                treeNode = treeStore.getRootNode().getChildAt(0);
                expect(treeNode.get('text')).to.be(layer2.get('name'));
            }
        );

        it('adds/removes listeners for ol.Collections (visible LayerGroupNode)',
            function() {
                treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                    layerGroup: olMap.getLayerGroup(),
                    showLayerGroupNode: true
                });

                treePanel = Ext.create('GeoExt.tree.Panel', {
                    title: 'GeoExt.tree.Panel Example',
                    store: treeStore,
                    rootVisible: false,
                    flex: 1,
                    border: false
                });

                var layer2 = new ol.layer.Tile({
                    source: new ol.source.MapQuest({
                        layer: 'hyb'
                    }),
                    name: 'LAYERZWO'
                });
                mapComponent.addLayer(layer2);

                var root = treeStore.getRootNode();
                var treeNode = root.getChildAt(0).getChildAt(0);
                expect(treeNode.get('text')).to.be(layer2.get('name'));

                mapComponent.removeLayer(layer);
                treeNode = root.getChildAt(0).getChildAt(0);
                expect(treeNode.get('text')).to.be(layer2.get('name'));
            }
        );

        describe('Filterable store', function(){
            var noVectorTreeStore;
            var noVectorTreePanel;

            beforeEach(function(){
                noVectorTreeStore = Ext.create('GeoExt.data.store.LayersTree', {
                    layerGroup: olMap.getLayerGroup(),
                    filters: [
                        function(rec){
                            return !(rec.data instanceof ol.layer.Vector);
                        }
                    ]
                });

                noVectorTreePanel = Ext.create('GeoExt.tree.Panel', {
                    store: noVectorTreeStore,
                    rootVisible: false
                });
            });

            afterEach(function(){
                noVectorTreeStore.destroy();
                noVectorTreePanel.destroy();
            });

            it('works when the root is collapsed', function(){
                expect(noVectorTreeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(1);

                // add layer that should be filtered out
                olMap.addLayer(new ol.layer.Vector());

                expect(noVectorTreeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(2);
            });

            it('works when the root is expanded', function(){
                expect(noVectorTreeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(1);

                noVectorTreeStore.getRoot().expand();

                // add layer that should be filtered out
                olMap.addLayer(new ol.layer.Vector());

                expect(noVectorTreeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(2);
            });

            it('works when the filter is removed', function(){
                expect(noVectorTreeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(1);

                // add layer that should be filtered out
                olMap.addLayer(new ol.layer.Vector());

                expect(noVectorTreeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(2);

                // remove all filters
                var filters = noVectorTreeStore.getFilters();
                filters.each(function(filter){
                    noVectorTreeStore.removeFilter(filter);
                });

                expect(noVectorTreeStore.getCount()).to.be(2);
                expect(olMap.getLayers().getLength()).to.be(2);
            });

            it('works when the filter is added later', function(){
                // treeStore does npot have a filter yet
                expect(treeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(1);

                // add layer that should be added to both
                olMap.addLayer(new ol.layer.Vector());

                expect(treeStore.getCount()).to.be(2);
                expect(olMap.getLayers().getLength()).to.be(2);

                // now add the filter to the stzre
                treeStore.addFilter([
                    function(rec){
                        return !(rec.data instanceof ol.layer.Vector);
                    }
                ]);

                expect(treeStore.getCount()).to.be(1);
                expect(olMap.getLayers().getLength()).to.be(2);
            });

        });

        describe('folderToggleMode', function() {

            var layerGroup;

            beforeEach(function(){
                layerGroup = new ol.layer.Group({
                    visible: false,
                    name: 'LAYERGRUBBE',
                    layers: [
                        new ol.layer.Tile({
                            visible: false,
                            name: 'LAYERFOOD',
                            source: new ol.source.TileJSON({
                                url: 'http://api.tiles.mapbox.com/v3/'+
                                'mapbox.20110804-hoa-foodinsecurity-'+
                                '3month.jsonp',
                                crossOrigin: 'anonymous'
                            })
                        }),
                        new ol.layer.Tile({
                            visible: false,
                            name: 'LAYERLIGHT',
                            source: new ol.source.TileJSON({
                                url: 'http://api.tiles.mapbox.com/v3/'+
                                'mapbox.world-borders-light.jsonp',
                                crossOrigin: 'anonymous'
                            })
                        })
                    ]
                });

                mapComponent.addLayer(layerGroup);
            });

            describe('basics', function(){
                it('sets the "classic" folderToggleMode as default',function(){
                    expect(treeStore.getFolderToggleMode()).to.be('classic');
                });

                it("can't set values else then 'ol3' or 'classic'",function(){
                    expect(function(){
                        treeStore.setFolderToggleMode('ol3');
                    }).to.not.throwException();

                    expect(function(){
                        treeStore.setFolderToggleMode('classic');
                    }).to.not.throwException();

                    expect(function(){
                        treeStore.setFolderToggleMode('peter');
                    }).to.throwException();

                    expect(treeStore.getFolderToggleMode()).to.be('classic');
                });

                it('sets the toggleMode on all nodes',function(){
                    treeStore.each(function(child){
                        expect(child.get('__toggleMode')).to.be('classic');
                    });
                });
            });

            describe('classic', function(){

                it('checks all children if a folder is checked',function(){
                    var layerGroupNode = treePanel.getRootNode().getChildAt(0);
                    layerGroupNode.set('checked', true);

                    layerGroupNode.eachChild(function(child){
                        expect(child.get('checked')).to.be(true);
                    });
                });

                it('unchecks all children if a folder is unchecked',function(){
                    var layerGroupNode = treePanel.getRootNode().getChildAt(0);
                    layerGroupNode.set('checked', false);

                    layerGroupNode.eachChild(function(child){
                        expect(child.get('checked')).to.be(false);
                    });
                });

                it('checks all parent nodes if a leaf is checked',function(){
                    var layerGroupNode = treePanel.getRootNode().getChildAt(0);
                    var childNode = layerGroupNode.getChildAt(0);

                    childNode.set('checked', true);
                    expect(layerGroupNode.get('checked')).to.be(true);
                });

                it('unchecks all parent nodes if a leaf and all his siblings' +
                    'are unchecked',function(){
                    var layerGroupNode = treePanel.getRootNode().getChildAt(0);

                    layerGroupNode.eachChild(function(child){
                        child.set('checked', true);
                    });
                    expect(layerGroupNode.get('checked')).to.be(true);

                    layerGroupNode.eachChild(function(child){
                        child.set('checked', false);
                    });
                    expect(layerGroupNode.get('checked')).to.be(false);
                });

            });

            describe('ol3', function(){
                beforeEach(function(){
                    treeStore.setFolderToggleMode('ol3');
                });

                it('sets the toggleMode on all nodes',function(){
                    treeStore.each(function(child){
                        expect(child.get('__toggleMode')).to.be('ol3');
                    });
                });

                it('folderNode does not react to leafchanges',function(){
                    var layerGroupNode = treePanel.getRootNode().getChildAt(0);
                    var childNode = layerGroupNode.getChildAt(0);

                    layerGroupNode.set('checked', false);
                    childNode.set('checked', true);
                    expect(layerGroupNode.get('checked')).to.be(false);
                });

                it("leafNodes don't not react to folderchanges",function(){
                    var layerGroupNode = treePanel.getRootNode().getChildAt(0);
                    var childNode = layerGroupNode.getChildAt(0);

                    childNode.set('checked', false);
                    layerGroupNode.set('checked', true);
                    expect(childNode.get('checked')).to.be(false);
                });

            });
        });

    });
});
