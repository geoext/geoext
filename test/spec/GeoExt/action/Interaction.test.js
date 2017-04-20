Ext.Loader.syncRequire([
    'Ext.button.Button',
    'GeoExt.action.Interaction',
    'GeoExt.action.Measure'
]);

describe('A GeoExt.action.Interaction', function() {

    it('can be instantiated', function() {
        var action = Ext.create('GeoExt.action.Interaction', {});

        expect(action.type).to.not.be('string');
        expect(action.itemId).to.not.be('undefined');
        expect(action.items).to.be.empty;
        expect(action.initialConfig).to.be.an('object');
        expect(action.initialConfig.enableToggle).to.be.false;
        expect(action.initialConfig.handler).to.be.a('function');
        expect(action.initialConfig.toggleHandler).to.be.a('function');
    });

    describe('can be mapped', function() {

        var div;

        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
        });

        afterEach(function() {
            document.body.removeChild(div);
        });

        it('to a button', function() {
            var label = 'Label';
            var clicked = 0;
            var action = Ext.create('GeoExt.action.Interaction', {
                text: label,
                renderTo: div,
                handler: function() {
                    clicked++;
                }
            });
            var button = Ext.create('Ext.Button', action);

            expect(button.baseAction).to.be(action);
            expect(action.items.length).to.equal(1);
            expect(button.getText()).to.equal(label);
            expect(button.handler).to.be(action.initialConfig.handler);
            button.fireHandler();
            expect(clicked).to.equal(1);
            button.destroy();
        });

    });

});
