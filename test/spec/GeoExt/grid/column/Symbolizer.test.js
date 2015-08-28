Ext.Loader.syncRequire(['GeoExt.grid.column.Symbolizer']);

describe('GeoExt.grid.column.Symbolizer', function() {

    describe('basics', function() {

        it('GeoExt.grid.column.Symbolizer is defined', function() {
            expect(GeoExt.grid.column.Symbolizer).not.to.be(undefined);
        });

        describe('constructor', function() {
            var column;
            afterEach(function() {
                column.destroy();
            });
            it('can be called without arguments', function(){
                column = Ext.create('GeoExt.grid.column.Symbolizer');
                expect(column).to.be.an(GeoExt.grid.column.Symbolizer);
            });
        });
    });


    describe('column', function() {
        var meta = {},
            column;

        beforeEach(function(){
            column = Ext.create('GeoExt.grid.column.Symbolizer');
        });
        afterEach(function(){
            column.destroy();
        });

        it('has the correct CSS class', function() {
            column.renderer(null, meta);
            expect(meta.css).equal("gx-grid-symbolizercol");
        });
        it('has the correct amount of symbolizer instances', function() {
            var num = Ext.ComponentQuery.query('gx_symbolizercolumn').length;
            expect(num).to.be(1);
        });

    });

    describe('feature style', function() {
        var column, detectedStyle, feat, rec,
            style = new ol.style.Style({
                fill: new ol.style.Fill({color: 'red'})
            });
        beforeEach(function() {
            feat = new ol.Feature();
            column = Ext.create('GeoExt.grid.column.Symbolizer');
            rec = Ext.create('GeoExt.data.model.Feature', feat);
        });
        afterEach(function() {
            column.destroy();
            rec = null;
            feat = null;
            detectedStyle = null;
        });

        it('is detected correctly from a feature (by style object)',
            function() {
                feat.setStyle(style);

                detectedStyle = column.determineStyle(rec);
                expect(detectedStyle).to.be(style);
            }
        );

        it('is detected correctly from a feature (by style function)',
            function() {
                var styleFn = function() {
                    return style;
                };
                feat.setStyle(styleFn);

                detectedStyle = column.determineStyle(rec);
                expect(detectedStyle).to.be(styleFn);
            }
        );

        it('is detected correctly from an underlying layer', function() {
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [feat]
                }),
                style: style
            });
            // create feature store by passing a vector layer
            var featStore = Ext.create('GeoExt.data.store.Features', {
                layer: vectorLayer
            });
            // overwrite predefined record
            rec = featStore.first();
            detectedStyle = column.determineStyle(rec);
            expect(detectedStyle).to.be(style);
        });
    });
});
