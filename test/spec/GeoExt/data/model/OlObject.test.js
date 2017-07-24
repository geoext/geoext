Ext.Loader.syncRequire(['GeoExt.data.model.OlObject']);

Ext.define('Test.data.model.Object', {
    extend: 'GeoExt.data.model.OlObject',
    fields: ['key1']
});

describe('GeoExt.data.model.OlObject', function() {

    var props;

    beforeEach(function() {
        props = {
            key1: 'value1',
            key2: 'value2',
            num1: 1,
            obj1: {},
            arr1: []
        };
    });

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.model.OlObject).not.to.be(undefined);
        });
    });

    describe('init record from simple javascript object', function() {
        var records = [];
        var objs = [];
        var types = ['plain obj', 'ol.Object'];

        beforeEach(function() {
            var record1 = Ext.create('Test.data.model.Object', props);
            // js object
            records.push(record1);
            objs.push(record1.olObject);

            // ol.Object
            var olObj = new ol.Object(props);
            objs.push(olObj);
            records.push(Ext.create('Test.data.model.Object', olObj));
        });

        afterEach(function() {
            records = [];
            objs = [];
        });

        Ext.Array.each(types, function(t, i) {
            it(t + ': values are synced from record to ol.Object', function() {
                expect(records[i].get('key1')).to.be('value1');
            });

            it(t + ': fields don\'t need to be defined for syncing properties',
                function() {
                    expect(records[i].get('key2')).to.be('value2');
                }
            );

            it(t + ': model data equals ol.Object properties', function() {
                Ext.Object.each(objs[i].getProperties(), function(key, value) {
                    expect(records[i].get(key)).to.equal(value);
                });
            });

            it(t + ': changes on the ol.Object are synced to Ext.data.Model',
                function() {
                    objs[i].set('key1', 'value1changed');
                    expect(records[i].get('key1')).to.be('value1changed');
                }
            );

            it(t + ': changes on the Ext.data.Model are synced to ol.Object',
                function() {
                    records[i].set('key2', 'value2changed');
                    expect(objs[i].get('key2')).to.be('value2changed');
                }
            );

            it(t + ': setting multiple properties of ol.Object syncs with' +
                'Ext.data.Model instance',
            function() {
                objs[i].setProperties({
                    key1: 'value1changed',
                    key3: 'value3'
                });

                Ext.Object.each(objs[i].getProperties(), function(k, v) {
                    expect(records[i].get(k)).to.equal(v);
                });
            }
            );
        });
    });
});
