Ext.Loader.syncRequire(['GeoExt.data.TreeStore', 'GeoExt.tree.Panel']);

describe('GeoExt.data.TreeStore', function() {
    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.TreeStore).not.to.be(undefined);
        });
    });

    describe('Instanciation', function() {
        var div;
        var olMap;
        var source;
        var layer;
        var treeStore;

        beforeEach(function(){
            div = document.createElement('div');
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

            Ext.create('GeoExt.component.Map', {
                map: olMap
            });

            treeStore = Ext.create('GeoExt.data.TreeStore', {
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
            document.body.removeChild(div);
        });

        it('can be created with ol.Map.getLayerGroup()', function() {
            treeStore = Ext.create('GeoExt.data.TreeStore', {
                layerStore: olMap.getLayerGroup()
            });
            expect(treeStore).to.be.a(GeoExt.data.TreeStore);
        });

        it('will react to the showLayerGroupNode property', function() {
            treeStore = Ext.create('GeoExt.data.TreeStore', {
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
        var div;
        var olMap;
        var mapComponent;
        var source;
        var layer;
        var treeStore;

        beforeEach(function(){
            div = document.createElement('div');
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

            treeStore = Ext.create('GeoExt.data.TreeStore', {
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
            document.body.removeChild(div);
        });

        it('sets add/remove eventlisteners for ol.Collections (hidden LayerGroupNode)', function() {
            treeStore = Ext.create('GeoExt.data.TreeStore', {
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

            var treeNode = treeStore.getRootNode().getChildAt(1);
            expect(treeNode.get('text')).to.be(layer2.get('name'));

            mapComponent.removeLayer(layer);
            treeNode = treeStore.getRootNode().getChildAt(0);
            expect(treeNode.get('text')).to.be(layer2.get('name'));
        });

        it('sets add/remove eventlisteners for ol.Collections (visible LayerGroupNode)', function() {
            treeStore = Ext.create('GeoExt.data.TreeStore', {
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

            var treeNode = treeStore.getRootNode().getChildAt(0).getChildAt(1);
            expect(treeNode.get('text')).to.be(layer2.get('name'));

            mapComponent.removeLayer(layer);
            treeNode = treeStore.getRootNode().getChildAt(0).getChildAt(0);
            expect(treeNode.get('text')).to.be(layer2.get('name'));
        });


    });
});
