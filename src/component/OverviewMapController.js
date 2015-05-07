Ext.define('GeoExt.component.OverviewMapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.component-overviewmap',

    onResize: function(){
        // Get the corresponding view of the controller (the mapPanel).
        var overview = this.getView(),
            div = overview.getEl().dom,
            map = overview.getMap();
        if(!overview.mapRendered){
            map.setTarget(div);
            overview.mapRendered = true;
        } else {
            overview.getMap().updateSize();
        }
    }
});
