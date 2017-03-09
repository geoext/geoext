(function(global) {
    /**
     * Ensures that the `BasiGX.view.component.Map` is available for
     * instantiation by calling `Ext.Loader.syncRequire` if needed.
     *
     * @private
     */
    function ensureMapComponentAvailable() {
        if (!GeoExt || !GeoExt.component || !GeoExt.component.Map) {
            Ext.Loader.syncRequire(['GeoExt.component.Map']);
        }
    }

    /**
     * A utility function that creates and adds a `<div>` to the `<body>` of the
     * document. The div is positioned absolutely off the screen and configured
     * with fixed dimensions to never be visible to the user (e.g. when the
     * test suite is viewed in a browser).
     *
     * Use this method in `beforeEach` if you need a `<div>` (e.g. to render
     * ExtJS components with their `renderTo` configuration).
     *
     * The created `<div>` is returned, so that it can easily be used in
     * `afterEach`-calls to cleanup. Most of the time you'll be using the helper
     * function #teardownTestDiv in such a case.
     *
     * @return {HTMLDivElement} The created `<div>`.
     */
    function setupTestDiv() {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = 0;
        div.style.left = -500;
        div.style.width = 256;
        div.style.height = 128;
        document.body.appendChild(div);
        return div;
    }

    /**
     * A utility function that removes the passed `div` from the document and
     * nullifies it.
     *
     * Use this method (e.g. in `afterEach`-calls) to cleanup any divs that you
     * have setup earlier (often by calling #setupTestDiv).
     *
     * @param {HTMLDivElement} div The `<div>` you want to remove.
     */
    function teardownTestDiv(div) {
        if (!div) {
            return;
        }
        var parent = div.parentNode;
        if (parent) {
            parent.removeChild(div);
        }
        div = null;
    }

    /**
     * A utility function to create several objects that our tests need every
     * now and then. Will return an object that provides the created components
     * and HTML elements.
     *
     * Use this method (e.g. in `beforeEach` calls) to have easy access to an
     * `ol.Map` and a `GeoExt.component.Map`. In order to teardown all
     * created objects, use #teardownTestObjects.
     *
     * The created objects can be configured by passing in an `opts` object,
     * where the key `mapOpts` is an object with configs for the `ol.Map`, and
     * the key `mapComponentOpts` is an object with configs for the
     * `GeoExt.component.Map`.
     *
     * @param {Object} opts The options for the objects to create. Optional.
     * @param {Object} opts.mapOpts The options for the `ol.Map` constructor.
     *     Optional.
     * @param {Object} opts.mapComponentOpts The options for the map component
     *     constructor. Optional.
     * @return {Object} An object with the following keys: `map`, `mapDiv`,
     *     `mapComponent` and `mapComponentDiv`. `map` will hold the `ol.Map`
     *     instance, `mapDiv` will hold the `<div>` of the `map`, `mapComponent`
     *     will hold the `GeoExt.component.Map` that is configured with the
     *     `map` and `mapComponentDiv` will hold the `<div>` of the created
     *     `mapComponent`. Usually you'll only interact with the components, not
     *     with the `<div>`s.
     */
    function setupTestObjects(opts) {
        ensureMapComponentAvailable();

        var options = opts || {};
        var mapOpts = options.mapOpts || {};
        var mapComponentOpts = options.mapComponentOpts || {};

        var mapDiv = setupTestDiv();
        var mapComponentDiv = setupTestDiv();

        var view = new ol.View({
            center: [0, 0]
        });
        var map = new ol.Map(Ext.apply({target: mapDiv, view: view}, mapOpts));
        var mapComponent = Ext.create('GeoExt.component.Map', Ext.apply({
            map: map,
            renderTo: mapComponentDiv
        }, mapComponentOpts));

        return {
            map: map,
            mapComponent: mapComponent,
            mapDiv: mapDiv,
            mapComponentDiv: mapComponentDiv
        };
    }

    /**
     * A utility method to clean up test objects when they are no longer needed.
     * This is the companion method for #setupTestObjects; If you pass in the
     * object that was created using #setupTestObjects, all created elements
     * will properly be cleaned up.
     *
     * Usually you'll call this method inside of e.g. `afterEach`.
     *
     * @param {Object} createdObjs The object holding the objects created by
     *     the method #setupTestObjects.
     */
    function teardownTestObjects(createdObjs) {
        if (!createdObjs) {
            return;
        }
        if (createdObjs.mapComponent && createdObjs.mapComponent.destroy) {
            createdObjs.mapComponent.destroy();
        }
        if (createdObjs.map && createdObjs.map.setTarget) {
            createdObjs.map.setTarget(null);
        }
        teardownTestDiv(createdObjs.mapComponentDiv);
        teardownTestDiv(createdObjs.mapDiv);
    }

    global.TestUtil = {
        setupTestDiv: setupTestDiv,
        teardownTestDiv: teardownTestDiv,
        setupTestObjects: setupTestObjects,
        teardownTestObjects: teardownTestObjects
    };
}(this));
