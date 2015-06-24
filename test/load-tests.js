/*global document*/
/*jshint camelcase:true, curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80 */
;(function(doc, global){
    var specPath = './spec/',
        dependencies = [
            'GeoExt/component/Map.test.js',
            'GeoExt/component/OverviewMap.test.js',
            'GeoExt/data/model/Feature.test.js',
            'GeoExt/data/model/Object.test.js',
            'GeoExt/data/model/Layer.test.js',
            'GeoExt/data/store/Collection.test.js',
            'GeoExt/component/FeatureRenderer.test.js',
            'GeoExt/data/store/Features.test.js',
            'GeoExt/data/LayerStore.test.js',
            'GeoExt/data/MapfishPrintProvider.test.js',
            'GeoExt/data/TreeStore.test.js',
            'GeoExt/panel/Popup.test.js'
        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

        for(; i < dependencyCnt; i++) {
            doc.write(getScriptTag(specPath + dependencies[i]));
        }
})(document, this);
