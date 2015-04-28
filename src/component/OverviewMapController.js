Ext.define('GeoExt.component.OverviewMapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.component-overviewmap',

    afterRender: function(){
        var overviewMapComponent = this.getView(),
            div = overviewMapComponent.getEl().dom,
            map = overviewMapComponent.getMap();

        map.setTarget(div);
    }

});
