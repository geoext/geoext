/*global document*/
/*jshint camelcase:true, curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80 */
;(function(doc, global){
    var specPath = './spec/',
        dependencies = [
            'GeoExt/panel/Map.test.js'
        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

        for(; i < dependencyCnt; i++) {
            doc.write(getScriptTag(specPath + dependencies[i]));
        }
})(document, this);
