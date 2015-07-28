Ext.Loader.syncRequire(['GeoExt.data.store.Tree', 'GeoExt.tree.Panel']);

describe('GeoExt.data.store.Tree', function() {


    var div;
    var olMap;
    var mapComponent;
    var source;
    var layer;
    var treeStore;

    beforeEach(function(){
        div = document.createElement('div');
        div.style.position = "absolute";
        div.style.top = "0";
        div.style.left = "-1000px";
        div.style.width = "512px";
        div.style.height = "256px";
        document.body.appendChild(div);

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

        treeStore = Ext.create('GeoExt.data.store.Tree', {
            layerGroup: olMap.getLayerGroup()
        });

        Ext.create('GeoExt.tree.Panel', {
            title: 'GeoExt.tree.Panel Example',
            store: treeStore,
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
            expect(GeoExt.data.store.Tree).not.to.be(undefined);
        });
    });

    describe('Instanciation', function() {

        it('can be created with ol.Map.getLayerGroup()', function() {
            treeStore = Ext.create('GeoExt.data.store.Tree', {
                layerStore: olMap.getLayerGroup()
            });
            expect(treeStore).to.be.a(GeoExt.data.store.Tree);
        });

        it('will react to the showLayerGroupNode property', function() {
            treeStore = Ext.create('GeoExt.data.store.Tree', {
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

        it('sets add/remove eventlisteners for ol.Collections (hidden LayerGroupNode)', function() {
            treeStore = Ext.create('GeoExt.data.store.Tree', {
                layerGroup: olMap.getLayerGroup()
            });

            Ext.create('GeoExt.tree.Panel', {
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
        });

        it('sets add/remove eventlisteners for ol.Collections (visible LayerGroupNode)', function() {
            treeStore = Ext.create('GeoExt.data.store.Tree', {
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


            var layer2 = new ol.layer.Tile({
                    source: new ol.source.MapQuest({
                        layer: 'hyb'
                    }),
                    name: 'LAYERZWO'
                });
            mapComponent.addLayer(layer2);

            var treeNode = treeStore.getRootNode().getChildAt(0).getChildAt(0);
            expect(treeNode.get('text')).to.be(layer2.get('name'));

            mapComponent.removeLayer(layer);
            treeNode = treeStore.getRootNode().getChildAt(0).getChildAt(0);
            expect(treeNode.get('text')).to.be(layer2.get('name'));
        });

        describe('Filterable store', function(){
            var noVectorTreeStore;
            var noVectorTreePanel;

            beforeEach(function(){
                noVectorTreeStore = Ext.create('GeoExt.data.store.Tree', {
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

    });
});
