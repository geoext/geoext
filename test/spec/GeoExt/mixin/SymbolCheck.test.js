Ext.Loader.syncRequire(['GeoExt.mixin.SymbolCheck']);

describe('GeoExt.mixin.SymbolCheck', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(GeoExt.mixin.SymbolCheck).not.to.be(undefined);
        });
    });

    function cleanupTestClass(className) {
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
        GeoExt.mixin.SymbolCheck._checked = {};
        // set up the spy to be examined in the TestClass
        warnLoggerSpy = sinon.spy(Ext.log, 'warn');
        className = 'TestClass' + (+new Date());
        Ext.define(className, {
            mixins: ['GeoExt.mixin.SymbolCheck'],
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
                'GeoExt.mixin.SymbolCheck::check'
            ]
        });
    });
    afterEach(function() {
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
                var cache = GeoExt.mixin.SymbolCheck._checked;

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

                expect(cache['GeoExt.mixin.SymbolCheck.check']).to.not.be(
                    undefined
                );
                expect(cache['GeoExt.mixin.SymbolCheck.check']).to.be(true);
            });

            it('filled the cache (intermediate requires)', function() {
                var cache = GeoExt.mixin.SymbolCheck._checked;

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

                expect(cache['GeoExt.mixin']).to.not.be(undefined);
                expect(cache['GeoExt.mixin']).to.be(true);

                expect(cache['GeoExt.mixin.SymbolCheck']).to.not.be(undefined);
                expect(cache['GeoExt.mixin.SymbolCheck']).to.be(true);
            });

            it('takes a short way out if no "symbols"', function() {
                var normalizeSymbolSpy = sinon.spy(
                    GeoExt.mixin.SymbolCheck, 'normalizeSymbol'
                );
                var checkSymbolSpy = sinon.spy(
                    GeoExt.mixin.SymbolCheck, 'checkSymbol'
                );
                var isDefinedSymbolSpy = sinon.spy(
                    GeoExt.mixin.SymbolCheck, 'isDefinedSymbol'
                );
                Ext.define('NoMember_symbols', {
                    mixins: ['GeoExt.mixin.SymbolCheck']
                });
                expect(normalizeSymbolSpy.called).to.be(false);
                expect(checkSymbolSpy.called).to.be(false);
                expect(isDefinedSymbolSpy.called).to.be(false);

                // cleanup
                GeoExt.mixin.SymbolCheck.normalizeSymbol.restore();
                GeoExt.mixin.SymbolCheck.checkSymbol.restore();
                GeoExt.mixin.SymbolCheck.isDefinedSymbol.restore();
                cleanupTestClass('NoMember_symbols');
            });

            it('takes a shortcut for checked symbols', function() {
                GeoExt.mixin.SymbolCheck.isDefinedSymbol(
                    'Shub.Niggurath.Lord.Of.The.Wood'
                );
                var extEachSpy = sinon.spy(Ext, 'each');
                var extIsDefinedSpy = sinon.spy(Ext, 'isDefined');
                GeoExt.mixin.SymbolCheck.isDefinedSymbol(
                    'Shub.Niggurath.Lord.Of.The.Wood'
                );

                var cache = GeoExt.mixin.SymbolCheck._checked;

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
