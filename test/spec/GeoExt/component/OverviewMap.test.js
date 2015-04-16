Ext.Loader.syncRequire(['GeoExt.component.OverviewMap']);

describe('GeoExt.component.OverviewMap', function() {

    describe('basics', function(){
        it('GeoExt.component.OverviewMap is defined', function(){
            expect(GeoExt.component.OverviewMap).not.to.be(undefined);
        });

        describe('constructor', function(){
            it('can`t be constructed without parentMap', function(){
                expect(Ext.create).withArgs('GeoExt.component.OverviewMap').to.throwError();
            })
            it('can be constructed with a parentMap', function(){
                olMap = new ol.Map({
                    view: new ol.View({
                        center: [0, 0],
                        zoom: 2
                    })
                });

                var overviewmapPanel = Ext.create('GeoExt.component.OverviewMap',{
                    parentMap: olMap
                });
                expect(overviewmapPanel).to.be.an(GeoExt.component.OverviewMap);
            })
        });
    });

});