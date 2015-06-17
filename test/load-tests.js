/*global document*/
/*jshint camelcase:true, curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80 */
;(function(doc, global){
    var specPath = './spec/',
        dependencies = [
            'GeoExt/panel/Map.test.js',
            'GeoExt/component/OverviewMap.test.js',
            'GeoExt/data/model/layer/Base.test.js',
            'GeoExt/data/model/layer/Layer.test.js',
            'GeoExt/data/model/layer/Group.test.js',
            'GeoExt/data/LayerStore.test.js',
            'GeoExt/data/MapfishPrintProvider.test.js',
            'GeoExt/data/TreeStore.test.js'
        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

        for(; i < dependencyCnt; i++) {
            doc.write(getScriptTag(specPath + dependencies[i]));
        }
})(document, this);
