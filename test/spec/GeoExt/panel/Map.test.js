Ext.Loader.syncRequire(['GeoExt.panel.Map']);

describe('GeoExt.panel.Map', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.panel.Map).not.to.be(undefined);
        });
    });

    describe('constructor', function(){
        it('can be constructed without arguments', function(){

            var mapPanel = Ext.create('GeoExt.panel.Map');
            expect(mapPanel).to.be.an(GeoExt.panel.Map);
        })
    });

    describe('getters and setters', function(){
        var div,
        mapPanel,
        source,
        layer,
        map,
        zoomslider;

        beforeEach(function(){
            div = document.createElement('div');
            div.setAttribute("id", "mapDiv");
            document.body.appendChild(div);

            source = new ol.source.MapQuest({layer: 'sat'});
            layer = new ol.layer.Tile({
              source: source
            });

            olMap = new ol.Map({
                layers: [layer],
                view: new ol.View({
                  center: [0, 0],
                  zoom: 2
                })
            });

            mapPanel = Ext.create('GeoExt.panel.Map', {
                title: 'GeoExt.panel.Map Example',
                width: 800,
                height: 600,
                map: olMap,
                renderTo: 'mapDiv'
            })
        });

        afterEach(function(){
            mapPanel.destroy();
        });

        it('mapPanel.getCenter() returns an array with 2 numbers', function(){
            expect(mapPanel.getCenter()).to.be.an(Array);
            expect(mapPanel.getCenter()).to.have.length(2);
            expect(mapPanel.getCenter()[0]).to.be.a('number');
            expect(mapPanel.getCenter()[1]).to.be.a('number');
        });

        it('mapPanel.getExtent() returns an array with 4 numbers', function(){
            expect(mapPanel.getExtent()).to.be.an(Array);
            expect(mapPanel.getExtent()).to.have.length(4);
            expect(mapPanel.getExtent()[0]).to.be.a('number');
            expect(mapPanel.getExtent()[1]).to.be.a('number');
            expect(mapPanel.getExtent()[2]).to.be.a('number');
            expect(mapPanel.getExtent()[3]).to.be.a('number');
        });

        it('mapPanel.getView() returns an ol.View instance', function(){
            expect(mapPanel.getView()).to.be.an(ol.View);
        });

        it('mapPanel.setCenter() sets the correct center of the ol.View', function(){
            var center = [1183893.8882437304, 7914041.721258021];
            mapPanel.setCenter(center);
            expect(olMap.getView().getCenter()).to.be(center);
        });

        it('mapPanel.setExtent() sets the correct extent of the ol.View', function(){
            var extent = [1153395.5139579452, 7892562.916309887,
                          1214392.2625295157, 7935520.526206155];
            mapPanel.setExtent(extent);
            var calculatedExtent = olMap.getView().calculateExtent(mapPanel.getMap().getSize());
            expect(calculatedExtent).to.eql(extent);
        });

        it('mapPanel.setView() sets the correct ol.View to the ol.Map', function(){
            var view = new ol.View({
                center: [08, 15],
                zoom: 4
            });
            mapPanel.setView(view);
            expect(olMap.getView()).to.be(view);
        });
    });
});