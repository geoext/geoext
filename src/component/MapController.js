Ext.define('GeoExt.component.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.component-map',

    onResize: function(){
        // Get the corresponding view of the controller (the mapComponent).
        var mapComponent = this.getView();
        if(!mapComponent.mapRendered){
            mapComponent.getMap().setTarget(mapComponent.getTargetEl().dom);
            mapComponent.mapRendered = true;
        } else {
            mapComponent.getMap().updateSize();
        }
    }
});
