Ext.require([
    'GeoExt.component.Map'
]);

var olMap,
    mapPanel,
    popup;

Ext.application({
    name: 'Popup',
    launch: function() {

        var description;

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
                center: ol.proj.fromLonLat( [-122.416667, 37.783333] ),
                zoom: 12
            })
        });

        popup = Ext.create('GeoExt.panel.Popup', {
            map: olMap,
            title: 'Position',
            width: 240,
            bodyPadding: 5
        });

        /**
         * Add a click handler to the map to render the popup.
         */
        olMap.on('singleclick', function(evt) {
            var coordinate = evt.coordinate,
                hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                coordinate, 'EPSG:3857', 'EPSG:4326'));

            // set content and position popup
            popup.setHtml('You clicked here:<br><code>' + hdms + '</code>');
            popup.position(coordinate);
        });

        mapPanel = Ext.create('GeoExt.component.Map', {
            title: 'GeoExt.panel.Map Example',
            map: olMap,
            region: 'center'
        });

        description = Ext.create('Ext.panel.Panel', {
            contentEl: 'description',
            title: 'Description',
            region: 'east',
            width: 300,
            border: false,
            bodyPadding: 5
        });

        Ext.create('Ext.Viewport', {
            layout: "border",
            items: [
                mapPanel,
                description
            ]
        });

    }
});
