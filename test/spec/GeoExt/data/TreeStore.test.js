Ext.Loader.syncRequire(['GeoExt.data.TreeStore']);

describe('GeoExt.data.TreeStore', function() {
    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.data.TreeStore).not.to.be(undefined);
        });
    });

    describe('Instanciation', function() {
        var div;
        var map;

        beforeEach(function(){
            div = document.createElement('div');
            document.body.appendChild(div);

            var source = new ol.source.MapQuest({layer: 'sat'});
            var layer = new ol.layer.Tile({
                source: source
            });

            map = new ol.Map({
                target: div,
                layers: [layer],
                view: new ol.View({
                    center: [0, 0],
                    zoom: 2
                })
            });
        });

        afterEach(function(){
            document.body.removeChild(div);
        });

        it('can be created with a layer store', function() {
            var layerStore = Ext.create('GeoExt.data.LayerStore', {
                map: map
            });
            var treeStore = Ext.create('GeoExt.data.TreeStore', {
                layerStore: layerStore
            });
            expect(treeStore).to.be.a(GeoExt.data.TreeStore);
        });

    });
});
