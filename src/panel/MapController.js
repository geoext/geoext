Ext.define('GeoExt.panel.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.panel-map',

    onResize: function(){
        // Get the corresponding view of the controller (the mapPanel).
        var mapPanel = this.getView();
        if(!mapPanel.mapRendered){
            mapPanel.getMap().setTarget(mapPanel.getTargetEl().dom);
            mapPanel.mapRendered = true;
        } else {
            mapPanel.getMap().updateSize();
        }
    }
});
