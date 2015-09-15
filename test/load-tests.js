/*global document*/
(function(doc, global){
    var specPath = './spec/',
        dependencies = [
            'GeoExt/component/FeatureRenderer.test.js',
            'GeoExt/component/Map.test.js',
            'GeoExt/component/OverviewMap.test.js',
            'GeoExt/component/Popup.test.js',
            'GeoExt/data/model/Feature.test.js',
            'GeoExt/data/model/Layer.test.js',
            'GeoExt/data/model/OlObject.test.js',
            'GeoExt/data/serializer/Base.test.js',
            'GeoExt/data/serializer/ImageWMS.test.js',
            'GeoExt/data/serializer/TileWMS.test.js',
            'GeoExt/data/serializer/WMTS.test.js',
            'GeoExt/data/serializer/XYZ.test.js',
            'GeoExt/data/serializer/Vector.test.js',
            'GeoExt/data/store/OlObjects.test.js',
            'GeoExt/data/store/Features.test.js',
            'GeoExt/data/store/LayersTree.test.js',
            'GeoExt/data/store/Layers.test.js',
            'GeoExt/data/MapfishPrintProvider.test.js',
            'GeoExt/grid/column/Symbolizer.test.js',
            'GeoExt/mixin/SymbolCheck.test.js',
            'GeoExt/tree/Panel.test.js'
        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

    for(; i < dependencyCnt; i++) {
        doc.write(getScriptTag(specPath + dependencies[i]));
    }
}(document, this));
