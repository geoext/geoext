Ext.Loader.syncRequire(['GeoExt.data.store.OlObjects']);

describe('GeoExt.data.store.OlObjects', function() {

    var props = {
        key1: 'value1',
        key2: 'value2'
    };
    var coll;
    var obj;

    beforeEach(function() {
        obj = new ol.Object(props);
        coll = new ol.Collection();

        coll.push(obj);
    });

    describe('basics', function() {
        it('is defined', function() {
            expect(GeoExt.data.store.OlObjects).not.to.be(undefined);
        });

        it('can be instantiated', function() {
            expect(function() {
                Ext.create('GeoExt.data.store.OlObjects');
            }).to.not.throwException(Error);
        });
    });

    describe('initialization', function() {
        var store;

        beforeEach(function() {
            store = Ext.create('GeoExt.data.store.OlObjects', {
                data: coll
            });
        });

        it('will have the passed collection as a property', function() {
            expect(store.olCollection).to.equal(coll);
        });

        it('will have model representations of the collections items',
            function() {
                expect(store.getCount()).to.equal(coll.getLength());
                expect(store.getAt(0).olObject).equal(obj);
            }
        );
    });

    describe('adding and removing items', function() {
        var store;
        var collection;

        beforeEach(function() {
            collection = new ol.Collection();
            store = Ext.create('GeoExt.data.store.OlObjects', {
                data: collection
            });
        });

        describe('adding and removing records from the store', function() {

            it('the collection will have items of the added records',
                function() {
                    expect(collection.getLength()).to.be(0);
                    expect(store.getCount()).to.be(0);

                    store.add({});
                    expect(collection.getLength()).to.be(1);
                    expect(store.getCount()).to.be(1);
                    expect(store.getAt(0).olObject).to.be(collection.item(0));
                }
            );

            it('the collection will not have items of remove store records',
                function() {
                    store.add({});
                    expect(store.getCount()).to.be(1);
                    expect(collection.getLength()).to.be(1);

                    store.add([{}, {}, {}]);
                    expect(store.getCount()).to.be(4);

                    store.removeAt(0);
                    expect(store.getCount()).to.be(3);
                    expect(collection.getLength()).to.be(3);

                    store.removeAt(0, 3);
                    expect(store.getCount()).to.be(0);
                    expect(collection.getLength()).to.be(0);
                }
            );
        });
    });
});
