Ext.Loader.syncRequire(['GeoExt.panel.Popup']);

describe('GeoExt.panel.Popup', function() {

    describe('basics', function(){
        it('GeoExt.panel.Popup is defined', function(){
            expect(GeoExt.panel.Popup).not.to.be(undefined);
        });

        describe('constructor', function(){
            it('throws if no map component provided', function(){
                expect(function() {
                    Ext.create('GeoExt.panel.Popup');
                }).to.throwException();
            });
        });
    });

});
