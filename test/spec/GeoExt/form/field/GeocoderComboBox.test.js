Ext.Loader.syncRequire(['GeoExt.form.field.GeocoderComboBox']);

describe('GeoExt.form.field.GeocoderComboBox', function() {

    describe('basics', function() {
        it('GeoExt.form.field.GeocoderComboBox is defined', function() {
            expect(GeoExt.component.Map).not.to.be(undefined);
        });

        describe('constructor', function() {
            it('can be constructed wo/ arguments via Ext.create()', function() {
                var geocoderCombo =
                    Ext.create('GeoExt.form.field.GeocoderComboBox');
                expect(geocoderCombo).to.be.an(
                    GeoExt.form.field.GeocoderComboBox);
            });
        });
    });

    describe('public functions', function() {
        var geocoderCombo;
        beforeEach(function() {
            geocoderCombo = Ext.create('GeoExt.form.field.GeocoderComboBox');
        });

        it('are correctly defined', function() {
            expect(typeof geocoderCombo.convertToExtent).to.be('function');
            expect(typeof geocoderCombo.convertToCoordinate).to.be('function');
            expect(
                typeof geocoderCombo.drawLocationFeatureOnMap
            ).to.be('function');
            expect(
                typeof geocoderCombo.removeLocationFeature
            ).to.be('function');
        });
    });

    describe('configs and properties', function() {
        var geocoderCombo;
        beforeEach(function() {
            geocoderCombo = Ext.create('GeoExt.form.field.GeocoderComboBox');
        });

        it('are correctly defined (with defaults)', function() {
            expect(geocoderCombo.map).to.be(null);
            expect(geocoderCombo.proxyRootProperty).to.be(null);
            expect(geocoderCombo.displayField).to.be('name');
            expect(geocoderCombo.displayValueMapping).to.be('display_name');
            expect(geocoderCombo.valueField).to.be('extent');
            expect(geocoderCombo.queryParam).to.be('q');
            expect(geocoderCombo.emptyText).to.be('Search a location');
            expect(geocoderCombo.minChars).to.be(3);
            expect(geocoderCombo.queryDelay).to.be(100);
            expect(geocoderCombo.url).to.be(
                'https://nominatim.openstreetmap.org/search?format=json');
            expect(geocoderCombo.srs).to.be('EPSG:4326');
            expect(geocoderCombo.zoom).to.be(10);
            expect(geocoderCombo.showLocationOnMap).to.be(true);
        });

        describe('store', function() {
            beforeEach(function() {
                geocoderCombo =
                  Ext.create('GeoExt.form.field.GeocoderComboBox', {
                      proxyRootProperty: 'foo'
                  });
            });
            it('is created if not configured', function() {
                expect(
                    geocoderCombo.store instanceof Ext.data.JsonStore
                ).to.be(true);
            });

            it('proxyRootProperty is correctly applied to reader of store',
                function() {
                    var reader = geocoderCombo.store.getProxy().getReader();
                    expect(
                        reader.getRootProperty()
                    ).to.be('foo');
                }
            );
        });

        describe('locationLayer', function() {
            var style;
            beforeEach(function() {
                style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'red'
                    })
                });
                geocoderCombo =
                  Ext.create('GeoExt.form.field.GeocoderComboBox', {
                      locationLayerStyle: style
                  });
            });
            it('is created if not configured', function() {
                expect(
                    geocoderCombo.locationLayer instanceof ol.layer.Vector
                ).to.be(true);
            });

            it('has the right style if configured', function() {
                var locStyle = geocoderCombo.locationLayer.getStyle();
                expect(locStyle instanceof ol.style.Style).to.be(true);
                expect(
                    locStyle.getStroke().getColor()
                ).to.be(style.getStroke().getColor());
            });
        });

    });

    describe('event handling', function() {
        var geocoderCombo;
        var olMap;
        beforeEach(function() {
            olMap = new ol.Map({
                view: new ol.View({
                    center: [10, 10],
                    zoom: 0
                })
            });
            geocoderCombo = Ext.create('GeoExt.form.field.GeocoderComboBox', {
                map: olMap
            });
        });

        describe('select', function() {
            it('centers the map to coordinate', function() {
                var record = {
                    get: function() {
                        return [1, 1];
                    }
                };
                geocoderCombo.onSelect(geocoderCombo, record);
                expect(
                    Math.round(olMap.getView().getCenter()[0])
                // EPSG:3857
                ).to.be(111319);
                expect(
                    Math.round(olMap.getView().getCenter()[1])
                // EPSG:3857
                ).to.be(111325);
            });

            it('centers the map to extent', function() {
                var record = {
                    get: function() {
                        return [0, 0, 0, 0];
                    }
                };
                geocoderCombo.onSelect(geocoderCombo, record);
                expect(Math.round(olMap.getView().getCenter()[0])).to.be(0);
                expect(Math.round(olMap.getView().getCenter()[1])).to.be(0);
            });

            it('calls "drawLocationFeatureOnMap" if configured with ' +
                '"showLocationOnMap"', function() {
                var record = {
                    get: function() {
                        return [0, 0];
                    }
                };
                geocoderCombo.showLocationOnMap = true;
                var cnt = 0;
                geocoderCombo.drawLocationFeatureOnMap = function() {
                    cnt++;
                };
                geocoderCombo.onSelect(geocoderCombo, record);
                expect(cnt).to.be(1);
            });
        });

        describe('focus', function() {
            it('clears the value', function() {
                geocoderCombo.setValue('foo');
                geocoderCombo.onFocus();
                expect(geocoderCombo.getValue()).to.be(null);
            });

            it('clears the location feature', function() {
                geocoderCombo.locationLayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [new ol.Feature()]
                    })
                });
                geocoderCombo.onFocus();
                var src = geocoderCombo.locationLayer.getSource();
                expect(src.getFeatures().length).to.be(0);
            });
        });

    });
});
