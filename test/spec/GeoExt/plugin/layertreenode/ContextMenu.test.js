Ext.Loader.syncRequire(['GeoExt.plugin.layertreenode.ContextMenu']);

describe('GeoExt.plugin.layertreenode.ContextMenu', function() {

    describe('basics', function() {
        it('GeoExt.plugin.layertreenode.ContextMenu is defined', function() {
            expect(
                GeoExt.plugin.layertreenode.ContextMenu).not.to.be(undefined);
        });

        var ctxMenuPlugin;
        var layerTree;
        beforeEach(function() {
            layerTree = Ext.create('Ext.tree.Panel', {
                columns: {
                    header: false,
                    items: [
                        {
                            xtype: 'treecolumn',
                            dataIndex: 'text',
                            flex: 1,
                            plugins: [{
                                ptype: 'gx_layertreenode_contextmenu',
                                pluginId: 'myTestPlugin'
                            }]
                        }
                    ]
                }
            });

            ctxMenuPlugin = layerTree.getColumns()[0].getPlugin('myTestPlugin');
        });

        describe('creation', function() {
            it('can be injected to LayerTree', function() {
                expect(ctxMenuPlugin
                ).to.be.an(GeoExt.plugin.layertreenode.ContextMenu);
            });
        });

        describe('public functions', function() {
            it('are correctly defined', function() {
                expect(typeof ctxMenuPlugin.createContextUi).to.be('function');
                expect(typeof ctxMenuPlugin.showContextUi).to.be('function');
            });
        });

        describe('configs and properties', function() {
            it('are correctly defined (with defaults)', function() {
                expect(ctxMenuPlugin.contextUi).to.be(null);
                expect(ctxMenuPlugin.recreateContextUi).to.be(true);
            });
        });
    });

    describe('Context UI creation', function() {
        var ctxMenuPlugin;
        var layerTree;
        beforeEach(function() {
            layerTree = Ext.create('Ext.tree.Panel', {
                columns: {
                    header: false,
                    items: [
                        {
                            xtype: 'treecolumn',
                            dataIndex: 'text',
                            flex: 1,
                            plugins: [{
                                ptype: 'gx_layertreenode_contextmenu',
                                pluginId: 'myTestPlugin',
                                createContextUi: function() {
                                    return Ext.create('Ext.Component', {
                                        html: 'test'
                                    });
                                }
                            }]
                        }
                    ]
                }
            });

            ctxMenuPlugin = layerTree.getColumns()[0].getPlugin('myTestPlugin');
        });

        it('works when "contextmenu" event is fired', function() {
            var mockEvt = {
                preventDefault: Ext.emptyFn,
                getXY: Ext.emptyFn
            };
            ctxMenuPlugin.onContextMenu(null, null, 0, 0, mockEvt);

            expect(ctxMenuPlugin.contextUi.html).to.be('test');
        });

        it('"recreateContextUi" destroys the "contextUi"', function() {
            var mockEvt = {
                preventDefault: Ext.emptyFn,
                getXY: Ext.emptyFn
            };

            // fire "contextmenu" twice to check if the contextUi is re-created
            ctxMenuPlugin.onContextMenu(null, null, 0, 0, mockEvt);
            var contextUiId = ctxMenuPlugin.contextUi.id;
            ctxMenuPlugin.onContextMenu(null, null, 0, 0, mockEvt);
            expect(contextUiId).not.to.be(ctxMenuPlugin.contextUi.id);
        });
    });
});
