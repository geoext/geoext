Ext.Loader.syncRequire(['GeoExt.panel.Map']);

describe('GeoExt.panel.Map', function() {

    describe('basics', function(){
        it('is defined', function(){
            expect(GeoExt.panel.Map).not.to.be(undefined);
        });
    });

    describe('constructor', function(){
        it('can be constructed with minimal arguments', function(){

//            var instance = new ol.control.FullScreen();
//            expect(instance).to.be.an(ol.control.FullScreen);

            var mapPanel = Ext.create('GeoExt.panel.Map');
            expect(mapPanel).to.be.an(GeoExt.panel.Map);
        })
    });
});