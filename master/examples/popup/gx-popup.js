Ext.require([
    'GeoExt.component.Map'
]);

var olMap;
var mapComp;
var popup;

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
                center: ol.proj.fromLonLat([-122.416667, 37.783333]),
                zoom: 12
            })
        });

        popup = Ext.create('GeoExt.component.Popup', {
            map: olMap,
            width: 140
        });

        mapComp = Ext.create('GeoExt.component.Map', {
            title: 'GeoExt.component.Map Example',
            map: olMap,
            region: 'center',
            pointerRest: true,
            pointerRestInterval: 750,
            pointerRestPixelTolerance: 5
        });

        // Add a pointerrest handler to the map component to render the popup.
        mapComp.on('pointerrest', function(evt) {
            var coordinate = evt.coordinate;
            var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                coordinate, 'EPSG:3857', 'EPSG:4326')
            );
            // Insert a linebreak after either N or S in hdms
            hdms = hdms.replace(/([NS])/, '$1<br>');

            // set content and position popup
            popup.setHtml('<p><strong>Pointer rested on</strong>' +
                '<br /><code>' + hdms + '</code></p>');
            popup.position(coordinate);
            popup.show();
        });

        // hide the popup once it isn't on the map any longer
        mapComp.on('pointerrestout', popup.hide, popup);

        description = Ext.create('Ext.panel.Panel', {
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
                mapComp,
                description
            ]
        });

    }
});
