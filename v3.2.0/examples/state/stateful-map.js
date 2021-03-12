Ext.require([
    'Ext.panel.Panel',
    'Ext.Viewport',
    'GeoExt.component.Map'
]);

// load components, which are only compatible with the classic toolkit
Ext.Loader.loadScript({
    url: '../../classic/state/PermalinkProvider.js'
});

var olMap;
var mapComponent;
var mapPanel;
var permalinkProvider;

Ext.application({
    name: 'StatefulMap',
    launch: function() {

        // create permalink provider
        permalinkProvider = Ext.create('GeoExt.state.PermalinkProvider');
        // set it in the state manager
        Ext.state.Manager.setProvider(permalinkProvider);

        olMap = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.Stamen({
                        layer: 'watercolor'
                    })
                }),
                new ol.layer.Tile({
                    source: new ol.source.Stamen({
                        layer: 'terrain-labels'
                    })
                })
            ],
            view: new ol.View({
                center: [923938, 6346251],
                zoom: 12
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: olMap,
            stateful: true,
            stateId: 'gx_mapstate'
        });

        mapPanel = Ext.create('Ext.panel.Panel', {
            title: 'GeoExt.state.PermalinkProvider Example',
            region: 'center',
            layout: 'fit',
            items: [mapComponent]
        });

        var permalinkDisplayPanel = Ext.create('Ext.panel.Panel', {
            title: 'Permalink',
            region: 'south',
            height: 100,
            border: false,
            bodyPadding: 5
        });

        var description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
            border: false,
            bodyPadding: 5
        });

        Ext.create('Ext.Viewport', {
            layout: 'border',
            items: [
                mapPanel,
                description,
                permalinkDisplayPanel
            ]
        });

        if (window.location.hash !== '') {
            mapComponent.applyState(
                permalinkProvider.readPermalinkHash(window.location.hash)
            );
        }

        // display permalink each time state is changed
        permalinkProvider.on({
            statechange: function(provider, name, value) {
                // get the base URL without a hash
                var base = window.location.href.split('#')[0];
                // permalink hash from current state
                var hash = provider.getPermalinkHash();
                // assemble a permalink
                var plink = Ext.urlAppend(base, hash);
                permalinkDisplayPanel.setHtml(
                    '<a href="' + plink + '" target="_blank">' + plink + '</a>'
                );
            }
        });

    }
});
