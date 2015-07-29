Ext.Loader.syncRequire(['GeoExt.grid.column.Symbolizer']);

describe('GeoExt.grid.column.Symbolizer', function() {

    describe('basics', function() {
        it('GeoExt.grid.column.Symbolizer is defined', function() {
            expect(GeoExt.grid.column.Symbolizer).not.to.be(undefined);
        });

        describe('constructor', function(){
            it('can be called without arguments', function(){
                var inst = Ext.create('GeoExt.grid.column.Symbolizer');
                expect(inst).to.be.an(GeoExt.grid.column.Symbolizer);
            });
        });
    });

});
