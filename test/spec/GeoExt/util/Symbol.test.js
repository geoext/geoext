Ext.Loader.syncRequire(['GeoExt.util.Symbol']);

describe('GeoExt.util.Symbol', function() {

    describe('Basics', function(){
        it('is defined', function(){
            expect(GeoExt.util.Symbol).not.to.be(undefined);
        });
    });

    function cleanupTestClass(className){
        Ext.getWin().dom[className] = null;
        delete Ext.getWin().dom[className];
        delete Ext.ClassManager['$namespaceCache'][className];
        delete Ext.ClassManager.classState[className];
        delete Ext.ClassManager.classes[className];
    }

    var warnLoggerSpy;
    var className;

    beforeEach(function() {
        // reset the local cache for each test
        GeoExt.util.Symbol._checked = {};
        // set up the spy to be examined in the TestClass
        warnLoggerSpy = sinon.spy(Ext.log, 'warn');
        className = 'TestClass' + (+new Date());
        Ext.define(className, {
            symbols: [
                // An existing class
                'ol.layer.Base',
                // A non-existing class in an existing namespace
                'ol.layer.NonExistingClass',
                // A completely non-existing symbol
                'non.existing.Symbol',
                // A fully specified instance method
                'ol.layer.Base.prototype.setOpacity',
                // A instance method using the shortcut
                'ol.layer.Base#setVisible',
                // A static method using the shortcut
                'GeoExt.util.Symbol::check'
            ]
        }, function(cls){
            GeoExt.util.Symbol.check(cls);
        });
    });
    afterEach(function(){
        cleanupTestClass(className);
        // restore the old method 'Ext.log.warn'
        Ext.log.warn.restore();
    });

    describe('Static methods', function() {

        describe('#check', function() {

            it('only warned when the symbol was not defined', function() {
                expect(warnLoggerSpy.called).to.be(true);
                expect(warnLoggerSpy.callCount).to.be(2);
            });

            it('filled the cache (direct requires)', function() {
                var cache = GeoExt.util.Symbol._checked;

                expect(cache['ol.layer.Base']).to.not.be(undefined);
                expect(cache['ol.layer.Base']).to.be(true);

                expect(cache['ol.layer.NonExistingClass']).to.not.be(undefined);
                expect(cache['ol.layer.NonExistingClass']).to.be(false);

                expect(cache['non.existing.Symbol']).to.not.be(undefined);
                expect(cache['non.existing.Symbol']).to.be(false);

                expect(cache['ol.layer.Base.prototype.setOpacity']).to.not.be(
                    undefined
                );
                expect(cache['ol.layer.Base.prototype.setOpacity']).to.be(true);

                expect(cache['ol.layer.Base.prototype.setVisible']).to.not.be(
                    undefined
                );
                expect(cache['ol.layer.Base.prototype.setVisible']).to.be(true);

                expect(cache['GeoExt.util.Symbol.check']).to.not.be(undefined);
                expect(cache['GeoExt.util.Symbol.check']).to.be(true);
            });

            it('filled the cache (intermediate requires)', function() {
                var cache = GeoExt.util.Symbol._checked;

                expect(cache['ol']).to.not.be(undefined);
                expect(cache['ol']).to.be(true);

                expect(cache['ol.layer']).to.not.be(undefined);
                expect(cache['ol.layer']).to.be(true);

                expect(cache['non']).to.not.be(undefined);
                expect(cache['non']).to.be(false);

                expect(cache['ol.layer.Base.prototype']).to.not.be(undefined);
                expect(cache['ol.layer.Base.prototype']).to.be(true);

                expect(cache['GeoExt']).to.not.be(undefined);
                expect(cache['GeoExt']).to.be(true);

                expect(cache['GeoExt.util']).to.not.be(undefined);
                expect(cache['GeoExt.util']).to.be(true);

                expect(cache['GeoExt.util.Symbol']).to.not.be(undefined);
                expect(cache['GeoExt.util.Symbol']).to.be(true);
            });

            it('takes a short way out if no "symbols"', function() {
                var normalizeSymbolSpy = sinon.spy(
                    GeoExt.util.Symbol, 'normalizeSymbol'
                );
                var checkSymbolSpy = sinon.spy(
                    GeoExt.util.Symbol, 'checkSymbol'
                );
                var isDefinedSymbolSpy = sinon.spy(
                    GeoExt.util.Symbol, 'isDefinedSymbol'
                );
                Ext.define('NoMember_symbols', {
                }, function(cls){
                    GeoExt.util.Symbol.check(cls);
                });
                expect(normalizeSymbolSpy.called).to.be(false);
                expect(checkSymbolSpy.called).to.be(false);
                expect(isDefinedSymbolSpy.called).to.be(false);

                // cleanup
                GeoExt.util.Symbol.normalizeSymbol.restore();
                GeoExt.util.Symbol.checkSymbol.restore();
                GeoExt.util.Symbol.isDefinedSymbol.restore();
                cleanupTestClass('NoMember_symbols');
            });

            it('takes a shortcut for checked symbols', function(){
                GeoExt.util.Symbol.isDefinedSymbol(
                    'Shub.Niggurath.Lord.Of.The.Wood'
                );
                var extEachSpy = sinon.spy(Ext, 'each');
                var extIsDefinedSpy = sinon.spy(Ext, 'isDefined');
                GeoExt.util.Symbol.isDefinedSymbol(
                    'Shub.Niggurath.Lord.Of.The.Wood'
                );

                var cache = GeoExt.util.Symbol._checked;

                expect(extIsDefinedSpy.called).to.be(true);
                expect(extIsDefinedSpy.callCount).to.be(1);
                expect(extIsDefinedSpy.calledWith(
                    cache['Shub.Niggurath.Lord.Of.The.Wood']
                )).to.be(true);

                expect(extEachSpy.called).to.be(false);

                // cleanup
                Ext.isDefined.restore();
                Ext.each.restore();
            });

        });

    });

});
