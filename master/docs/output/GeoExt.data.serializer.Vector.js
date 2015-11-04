Ext.data.JsonP.GeoExt_data_serializer_Vector({"tagname":"class","name":"GeoExt.data.serializer.Vector","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true},"files":[{"filename":"Vector.js","href":"Vector.html#GeoExt-data-serializer-Vector"}],"aliases":{},"alternateClassNames":[],"extends":"GeoExt.data.serializer.Base","mixins":["GeoExt.mixin.SymbolCheck"],"requires":[],"uses":[],"members":[{"name":"symbols","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"property-symbols","meta":{}},{"name":"FALLBACK_SERIALIZATION","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-FALLBACK_SERIALIZATION","meta":{"private":true,"static":true}},{"name":"FEAT_STYLE_PREFIX","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-FEAT_STYLE_PREFIX","meta":{"private":true,"static":true}},{"name":"GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE","meta":{"private":true,"static":true}},{"name":"GX_UID_PROPERTY","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-GX_UID_PROPERTY","meta":{"private":true,"static":true}},{"name":"PRINTSTYLE_TYPES","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-PRINTSTYLE_TYPES","meta":{"private":true,"static":true}},{"name":"format","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-format","meta":{"private":true,"static":true}},{"name":"sourceCls","tagname":"property","owner":"GeoExt.data.serializer.Vector","id":"static-property-sourceCls","meta":{"static":true}},{"name":"onClassMixedIn","tagname":"method","owner":"GeoExt.mixin.SymbolCheck","id":"method-onClassMixedIn","meta":{"private":true}},{"name":"encodeTextStyle","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeTextStyle","meta":{"private":true,"static":true}},{"name":"encodeVectorStyle","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeVectorStyle","meta":{"private":true,"static":true}},{"name":"encodeVectorStyleFill","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeVectorStyleFill","meta":{"private":true,"static":true}},{"name":"encodeVectorStyleLine","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeVectorStyleLine","meta":{"private":true,"static":true}},{"name":"encodeVectorStylePoint","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeVectorStylePoint","meta":{"private":true,"static":true}},{"name":"encodeVectorStylePolygon","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeVectorStylePolygon","meta":{"private":true,"static":true}},{"name":"encodeVectorStyleStroke","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-encodeVectorStyleStroke","meta":{"private":true,"static":true}},{"name":"getUid","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-getUid","meta":{"private":true,"static":true}},{"name":"padHexValue","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-padHexValue","meta":{"private":true,"static":true}},{"name":"register","tagname":"method","owner":"GeoExt.data.serializer.Base","id":"static-method-register","meta":{"protected":true,"static":true}},{"name":"rgbArrayToHex","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-rgbArrayToHex","meta":{"private":true,"static":true}},{"name":"rgbToHex","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-rgbToHex","meta":{"private":true,"static":true}},{"name":"serialize","tagname":"method","owner":"GeoExt.data.serializer.Vector","id":"static-method-serialize","meta":{"static":true}},{"name":"validateSource","tagname":"method","owner":"GeoExt.data.serializer.Base","id":"static-method-validateSource","meta":{"protected":true,"static":true}}],"code_type":"ext_define","id":"class-GeoExt.data.serializer.Vector","short_doc":"A serializer for layers that have a ol.source.Vector source. ...","component":false,"superclasses":["Ext.Base","GeoExt.data.serializer.Base"],"subclasses":[],"mixedInto":[],"parentMixins":["GeoExt.mixin.SymbolCheck"],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.Base<div class='subclass '><a href='#!/api/GeoExt.data.serializer.Base' rel='GeoExt.data.serializer.Base' class='docClass'>GeoExt.data.serializer.Base</a><div class='subclass '><strong>GeoExt.data.serializer.Vector</strong></div></div></div><h4>Mixins</h4><div class='dependency'><a href='#!/api/GeoExt.mixin.SymbolCheck' rel='GeoExt.mixin.SymbolCheck' class='docClass'>GeoExt.mixin.SymbolCheck</a></div><h4>Inherited mixins</h4><div class='dependency'><a href='#!/api/GeoExt.mixin.SymbolCheck' rel='GeoExt.mixin.SymbolCheck' class='docClass'>GeoExt.mixin.SymbolCheck</a></div><h4>Files</h4><div class='dependency'><a href='source/Vector.html#GeoExt-data-serializer-Vector' target='_blank'>Vector.js</a></div></pre><div class='doc-contents'><p>A serializer for layers that have a <code>ol.source.Vector</code> source.</p>\n\n<p>This class is heavily inspired by the excellent <code>ngeo</code> Print service class:\n<a href=\"https://github.com/camptocamp/ngeo\">camptocamp/ngeo</a>.</p>\n\n<p>Additionally some utility methods were borrowed from the color class of the\n<a href=\"https://github.com/google/closure-library\">google/closure-library</a>.</p>\n</div><div class='members'><div class='members-section'><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Instance properties</h3><div id='property-symbols' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-property-symbols' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-property-symbols' class='name expandable'>symbols</a> : String[]<span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'><p><debug></debug></p>\n<p>Defaults to: <code>['ol.color.asArray', 'ol.Feature', 'ol.Feature#getGeometry', 'ol.Feature#getStyleFunction', 'ol.format.GeoJSON', 'ol.format.GeoJSON#writeFeatureObject', 'ol.geom.Geometry', 'ol.geom.LineString#getType', 'ol.geom.MultiLineString#getType', 'ol.geom.MultiPoint#getType', 'ol.geom.MultiPolygon#getType', 'ol.geom.Point#getType', 'ol.geom.Polygon#getType', 'ol.layer.Vector#getOpacity', 'ol.layer.Vector#getStyleFunction', 'ol.source.Vector', 'ol.source.Vector#getFeatures', 'ol.style.Circle', 'ol.style.Circle#getRadius', 'ol.style.Circle#getFill', 'ol.style.Fill', 'ol.style.Fill#getColor', 'ol.style.Icon', 'ol.style.Icon#getSrc', 'ol.style.Icon#getRotation', 'ol.style.Stroke', 'ol.style.Stroke#getColor', 'ol.style.Stroke#getWidth', 'ol.style.Style', 'ol.style.Style#getFill', 'ol.style.Style#getImage', 'ol.style.Style#getStroke', 'ol.style.Style#getText', 'ol.style.Text', 'ol.style.Text#getFont', 'ol.style.Text#getOffsetX', 'ol.style.Text#getOffsetY', 'ol.style.Text#getRotation', 'ol.style.Text#getText', 'ol.style.Text#getTextAlign']</code></p><p>Overrides: <a href=\"#!/api/GeoExt.mixin.SymbolCheck-property-symbols\" rel=\"GeoExt.mixin.SymbolCheck-property-symbols\" class=\"docClass\">GeoExt.mixin.SymbolCheck.symbols</a></p></div></div></div></div><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static properties</h3><div id='static-property-FALLBACK_SERIALIZATION' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-FALLBACK_SERIALIZATION' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-FALLBACK_SERIALIZATION' class='name expandable'>FALLBACK_SERIALIZATION</a> : Object<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>A fallback serialization of a vector layer that will be used if\nthe given source e.g. ...</div><div class='long'><p>A fallback serialization of a vector layer that will be used if\nthe given source e.g. doesn't have any features.</p>\n<p>Defaults to: <code>{geoJson: {type: &quot;FeatureCollection&quot;, features: []}, opacity: 1, style: {version: &quot;2&quot;, &quot;*&quot;: {symbolizers: [{type: &quot;point&quot;, strokeColor: &quot;white&quot;, strokeOpacity: 1, strokeWidth: 4, strokeDashstyle: &quot;solid&quot;, fillColor: &quot;red&quot;}]}}, type: &quot;geojson&quot;}</code></p></div></div></div><div id='static-property-FEAT_STYLE_PREFIX' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-FEAT_STYLE_PREFIX' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-FEAT_STYLE_PREFIX' class='name expandable'>FEAT_STYLE_PREFIX</a> : String<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>The prefix we will give to the generated styles. ...</div><div class='long'><p>The prefix we will give to the generated styles. Every feature will\n-- once it is serialized -- have a property constructed with\nthe <a href=\"#!/api/GeoExt.data.serializer.Vector-static-property-FEAT_STYLE_PREFIX\" rel=\"GeoExt.data.serializer.Vector-static-property-FEAT_STYLE_PREFIX\" class=\"docClass\">FEAT_STYLE_PREFIX</a> and a counter. For every unique combination\nof <a href=\"#!/api/GeoExt.data.serializer.Vector-static-property-FEAT_STYLE_PREFIX\" rel=\"GeoExt.data.serializer.Vector-static-property-FEAT_STYLE_PREFIX\" class=\"docClass\">FEAT_STYLE_PREFIX</a>  + i with the value style uid (see <a href=\"#!/api/GeoExt.data.serializer.Vector-static-method-getUid\" rel=\"GeoExt.data.serializer.Vector-static-method-getUid\" class=\"docClass\">getUid</a>\nand <a href=\"#!/api/GeoExt.data.serializer.Vector-static-property-GX_UID_PROPERTY\" rel=\"GeoExt.data.serializer.Vector-static-property-GX_UID_PROPERTY\" class=\"docClass\">GX_UID_PROPERTY</a>), the layer serialization will also have a\nCQL entry with a matching symbolizer:</p>\n\n<pre><code>{\n     // …\n     style: {\n         \"[_gx3_style_0='ext-46']\": {\n             symbolizer: {\n                 // …\n             }\n         }\n     },\n     geoJson: {\n         // …\n         features: [\n             {\n                 // …\n                 properties: {\n                     '_gx3_style_0': 'ext-46'\n                     // …\n                 }\n             }\n         ]\n     }\n     // …\n}\n</code></pre>\n<p>Defaults to: <code>'_gx3_style_'</code></p></div></div></div><div id='static-property-GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE' class='name expandable'>GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE</a> : Object<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>An object that maps an ol.geom.GeometryType to a printstyle type. ...</div><div class='long'><p>An object that maps an ol.geom.GeometryType to a printstyle type.</p>\n<p>Defaults to: <code>{}</code></p></div></div></div><div id='static-property-GX_UID_PROPERTY' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-GX_UID_PROPERTY' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-GX_UID_PROPERTY' class='name expandable'>GX_UID_PROPERTY</a> : String<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>The name / identifier for the uid property that is assigned and read\nout in getUid ...</div><div class='long'><p>The name / identifier for the uid property that is assigned and read\nout in <a href=\"#!/api/GeoExt.data.serializer.Vector-static-method-getUid\" rel=\"GeoExt.data.serializer.Vector-static-method-getUid\" class=\"docClass\">getUid</a></p>\n<p>Defaults to: <code>'__gx_uid__'</code></p></div></div></div><div id='static-property-PRINTSTYLE_TYPES' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-PRINTSTYLE_TYPES' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-PRINTSTYLE_TYPES' class='name expandable'>PRINTSTYLE_TYPES</a> : Object<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>The types of styles that mapfish supports. ...</div><div class='long'><p>The types of styles that mapfish supports.</p>\n<p>Defaults to: <code>{POINT: 'Point', LINE_STRING: 'LineString', POLYGON: 'Polygon'}</code></p></div></div></div><div id='static-property-format' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-format' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-format' class='name expandable'>format</a> : Object<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'><p>A shareable instance of ol.format.GeoJSON to serialize the features.</p>\n</div><div class='long'><p>A shareable instance of ol.format.GeoJSON to serialize the features.</p>\n</div></div></div><div id='static-property-sourceCls' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-property-sourceCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-property-sourceCls' class='name expandable'>sourceCls</a> : ol.source.Source<span class=\"signature\"><span class='static' >static</span></span></div><div class='description'><div class='short'><p>The ol.source.Source class that this serializer will serialize.</p>\n</div><div class='long'><p>The ol.source.Source class that this serializer will serialize.</p>\n<p>Overrides: <a href=\"#!/api/GeoExt.data.serializer.Base-static-property-sourceCls\" rel=\"GeoExt.data.serializer.Base-static-property-sourceCls\" class=\"docClass\">GeoExt.data.serializer.Base.sourceCls</a></p></div></div></div></div></div><div class='members-section'><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Instance methods</h3><div id='method-onClassMixedIn' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/GeoExt.mixin.SymbolCheck' rel='GeoExt.mixin.SymbolCheck' class='defined-in docClass'>GeoExt.mixin.SymbolCheck</a><br/><a href='source/SymbolCheck.html#GeoExt-mixin-SymbolCheck-method-onClassMixedIn' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.mixin.SymbolCheck-method-onClassMixedIn' class='name expandable'>onClassMixedIn</a>( <span class='pre'>cls</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Whenever a class mixes in GeoExt.mixin.SymbolCheck, this method will be\ncalled and it actually runs the checks for al...</div><div class='long'><p>Whenever a class mixes in <a href=\"#!/api/GeoExt.mixin.SymbolCheck\" rel=\"GeoExt.mixin.SymbolCheck\" class=\"docClass\">GeoExt.mixin.SymbolCheck</a>, this method will be\ncalled and it actually runs the checks for all the defined <a href=\"#!/api/GeoExt.mixin.SymbolCheck-property-symbols\" rel=\"GeoExt.mixin.SymbolCheck-property-symbols\" class=\"docClass\">symbols</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>cls</span> : Ext.Class<div class='sub-desc'><p>The class that this mixin is mixed into.</p>\n</div></li></ul></div></div></div></div><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static methods</h3><div id='static-method-encodeTextStyle' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeTextStyle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeTextStyle' class='name expandable'>encodeTextStyle</a>( <span class='pre'>symbolizers, textStyle</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encodes an ol.style.Text and adds it to the passed symbolizers\narray. ...</div><div class='long'><p>Encodes an ol.style.Text and adds it to the passed symbolizers\narray.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>symbolizers</span> : Object[]<div class='sub-desc'><p>Array of MapFish Print symbolizers.</p>\n</div></li><li><span class='pre'>textStyle</span> : ol.style.Text<div class='sub-desc'><p>Text style.</p>\n</div></li></ul></div></div></div><div id='static-method-encodeVectorStyle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeVectorStyle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeVectorStyle' class='name expandable'>encodeVectorStyle</a>( <span class='pre'>object, geometryType, style, styleId, featureStyleProp</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encodes an ol.style.Style into the passed MapFish style object. ...</div><div class='long'><p>Encodes an ol.style.Style into the passed MapFish style object.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>object</span> : Object<div class='sub-desc'><p>The MapFish style object.</p>\n</div></li><li><span class='pre'>geometryType</span> : ol.geom.GeometryType<div class='sub-desc'><p>The type of the GeoJSON\n   geometry</p>\n</div></li><li><span class='pre'>style</span> : ol.style.Style<div class='sub-desc'><p>The style to encode.</p>\n</div></li><li><span class='pre'>styleId</span> : String<div class='sub-desc'><p>The id of the style.</p>\n</div></li><li><span class='pre'>featureStyleProp</span> : String<div class='sub-desc'><p>Feature style property name.</p>\n</div></li></ul></div></div></div><div id='static-method-encodeVectorStyleFill' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeVectorStyleFill' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeVectorStyleFill' class='name expandable'>encodeVectorStyleFill</a>( <span class='pre'>symbolizer, fillStyle</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encode the passed ol.style.Fill into the passed symbolizer. ...</div><div class='long'><p>Encode the passed ol.style.Fill into the passed symbolizer.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>symbolizer</span> : Object<div class='sub-desc'><p>MapFish Print symbolizer.</p>\n</div></li><li><span class='pre'>fillStyle</span> : ol.style.Fill<div class='sub-desc'><p>Fill style.</p>\n</div></li></ul></div></div></div><div id='static-method-encodeVectorStyleLine' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeVectorStyleLine' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeVectorStyleLine' class='name expandable'>encodeVectorStyleLine</a>( <span class='pre'>symbolizers, strokeStyle</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encodes an ol.style.Stroke and adds it to the passed symbolizers\narray. ...</div><div class='long'><p>Encodes an ol.style.Stroke and adds it to the passed symbolizers\narray.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>symbolizers</span> : Object[]<div class='sub-desc'><p>Array of MapFish Print symbolizers.</p>\n</div></li><li><span class='pre'>strokeStyle</span> : ol.style.Stroke<div class='sub-desc'><p>Stroke style.</p>\n</div></li></ul></div></div></div><div id='static-method-encodeVectorStylePoint' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeVectorStylePoint' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeVectorStylePoint' class='name expandable'>encodeVectorStylePoint</a>( <span class='pre'>symbolizers, imageStyle</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encodes an ol.style.Image and adds it to the passed symbolizers\narray. ...</div><div class='long'><p>Encodes an ol.style.Image and adds it to the passed symbolizers\narray.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>symbolizers</span> : Object[]<div class='sub-desc'><p>Array of MapFish Print symbolizers.</p>\n</div></li><li><span class='pre'>imageStyle</span> : ol.style.Image<div class='sub-desc'><p>Image style.</p>\n</div></li></ul></div></div></div><div id='static-method-encodeVectorStylePolygon' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeVectorStylePolygon' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeVectorStylePolygon' class='name expandable'>encodeVectorStylePolygon</a>( <span class='pre'>symbolizers, fillStyle, strokeStyle</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encodes an ol.style.Fill and an optional ol.style.Stroke and adds it\nto the passed symbolizers array. ...</div><div class='long'><p>Encodes an ol.style.Fill and an optional ol.style.Stroke and adds it\nto the passed symbolizers array.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>symbolizers</span> : Object[]<div class='sub-desc'><p>Array of MapFish Print symbolizers.</p>\n</div></li><li><span class='pre'>fillStyle</span> : ol.style.Fill<div class='sub-desc'><p>Fill style.</p>\n</div></li><li><span class='pre'>strokeStyle</span> : ol.style.Stroke<div class='sub-desc'><p>Stroke style. May be null.</p>\n</div></li></ul></div></div></div><div id='static-method-encodeVectorStyleStroke' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-encodeVectorStyleStroke' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-encodeVectorStyleStroke' class='name expandable'>encodeVectorStyleStroke</a>( <span class='pre'>symbolizer, strokeStyle</span> )<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Encode the passed ol.style.Stroke into the passed symbolizer. ...</div><div class='long'><p>Encode the passed ol.style.Stroke into the passed symbolizer.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>symbolizer</span> : Object<div class='sub-desc'><p>MapFish Print symbolizer.</p>\n</div></li><li><span class='pre'>strokeStyle</span> : ol.style.Stroke<div class='sub-desc'><p>Stroke style.</p>\n</div></li></ul></div></div></div><div id='static-method-getUid' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-getUid' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-getUid' class='name expandable'>getUid</a>( <span class='pre'>The</span> ) : String<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Returns a unique id for this object. ...</div><div class='long'><p>Returns a unique id for this object. The object is assigned a new\nproperty <a href=\"#!/api/GeoExt.data.serializer.Vector-static-property-GX_UID_PROPERTY\" rel=\"GeoExt.data.serializer.Vector-static-property-GX_UID_PROPERTY\" class=\"docClass\">GX_UID_PROPERTY</a> and modified in place if this hasn't\nhappened in a previous call.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>The</span> : Object<div class='sub-desc'><p>object to get the uid of.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>The uid of the object.</p>\n</div></li></ul></div></div></div><div id='static-method-padHexValue' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-padHexValue' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-padHexValue' class='name expandable'>padHexValue</a>( <span class='pre'>hex</span> ) : string<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Takes a hex value and prepends a zero if it's a single digit. ...</div><div class='long'><p>Takes a hex value and prepends a zero if it's a single digit.\nTaken from https://github.com/google/closure-library color.js-file.\nIt is called <code>prependZeroIfNecessaryHelper</code> there.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>hex</span> : string<div class='sub-desc'><p>Hex value to prepend if single digit.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>string</span><div class='sub-desc'><p>hex value prepended with zero if it was single\n    digit, otherwise the same value that was passed in.</p>\n</div></li></ul></div></div></div><div id='static-method-register' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/GeoExt.data.serializer.Base' rel='GeoExt.data.serializer.Base' class='defined-in docClass'>GeoExt.data.serializer.Base</a><br/><a href='source/Base2.html#GeoExt-data-serializer-Base-static-method-register' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Base-static-method-register' class='name expandable'>register</a>( <span class='pre'>subCls</span> )<span class=\"signature\"><span class='protected' >protected</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Given a subclass of GeoExt.data.serializer.Base, register the class\nwith the GeoExt.data.MapfishPrintProvider. ...</div><div class='long'><p>Given a subclass of <a href=\"#!/api/GeoExt.data.serializer.Base\" rel=\"GeoExt.data.serializer.Base\" class=\"docClass\">GeoExt.data.serializer.Base</a>, register the class\nwith the <a href=\"#!/api/GeoExt.data.MapfishPrintProvider\" rel=\"GeoExt.data.MapfishPrintProvider\" class=\"docClass\">GeoExt.data.MapfishPrintProvider</a>. This method is ususally\ncalled inside the 'after-create' function of Ext.class definitions.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>subCls</span> : <a href=\"#!/api/GeoExt.data.serializer.Base\" rel=\"GeoExt.data.serializer.Base\" class=\"docClass\">GeoExt.data.serializer.Base</a><div class='sub-desc'><p>The class to register.</p>\n</div></li></ul></div></div></div><div id='static-method-rgbArrayToHex' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-rgbArrayToHex' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-rgbArrayToHex' class='name expandable'>rgbArrayToHex</a>( <span class='pre'>rgbArr</span> ) : String<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Converts a color from RGB to hex representation. ...</div><div class='long'><p>Converts a color from RGB to hex representation.\nTaken from https://github.com/google/closure-library color.js-file</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rgbArr</span> : Number[]<div class='sub-desc'><p>An array with three numbers representing\n   red, green and blue.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>The passed color in hex representation.</p>\n</div></li></ul></div></div></div><div id='static-method-rgbToHex' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-rgbToHex' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-rgbToHex' class='name expandable'>rgbToHex</a>( <span class='pre'>r, g, b</span> ) : String<span class=\"signature\"><span class='private' >private</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Converts a color from RGB to hex representation. ...</div><div class='long'><p>Converts a color from RGB to hex representation.\nTaken from https://github.com/google/closure-library color.js-file.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>r</span> : number<div class='sub-desc'><p>Amount of red, int between 0 and 255.</p>\n</div></li><li><span class='pre'>g</span> : number<div class='sub-desc'><p>Amount of green, int between 0 and 255.</p>\n</div></li><li><span class='pre'>b</span> : number<div class='sub-desc'><p>Amount of blue, int between 0 and 255.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>The passed color in hex representation.</p>\n</div></li></ul></div></div></div><div id='static-method-serialize' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='GeoExt.data.serializer.Vector'>GeoExt.data.serializer.Vector</span><br/><a href='source/Vector.html#GeoExt-data-serializer-Vector-static-method-serialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Vector-static-method-serialize' class='name expandable'>serialize</a>( <span class='pre'>layer, source, viewRes</span> ) : Object<span class=\"signature\"><span class='static' >static</span></span></div><div class='description'><div class='short'>Serializes the passed source and layer into an object that the\nMapfish Print Servlet understands. ...</div><div class='long'><p>Serializes the passed source and layer into an object that the\nMapfish Print Servlet understands.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>layer</span> : ol.layer.Layer<div class='sub-desc'><p>The layer to serialize.</p>\n\n\n\n</div></li><li><span class='pre'>source</span> : ol.source.Source<div class='sub-desc'><p>The source of the layer to\n   serialize.</p>\n\n\n\n</div></li><li><span class='pre'>viewRes</span> : Number<div class='sub-desc'><p>The resolution of the mapview.</p>\n\n\n\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>a serialized representation of source and layer.</p>\n\n\n\n</div></li></ul><p>Overrides: <a href=\"#!/api/GeoExt.data.serializer.Base-static-method-serialize\" rel=\"GeoExt.data.serializer.Base-static-method-serialize\" class=\"docClass\">GeoExt.data.serializer.Base.serialize</a></p></div></div></div><div id='static-method-validateSource' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/GeoExt.data.serializer.Base' rel='GeoExt.data.serializer.Base' class='defined-in docClass'>GeoExt.data.serializer.Base</a><br/><a href='source/Base2.html#GeoExt-data-serializer-Base-static-method-validateSource' target='_blank' class='view-source'>view source</a></div><a href='#!/api/GeoExt.data.serializer.Base-static-method-validateSource' class='name expandable'>validateSource</a>( <span class='pre'>source</span> )<span class=\"signature\"><span class='protected' >protected</span><span class='static' >static</span></span></div><div class='description'><div class='short'>Given a concrete ol.source.Source instance, this method checks if\nthe non-abstract subclass is capable of serializing...</div><div class='long'><p>Given a concrete ol.source.Source instance, this method checks if\nthe non-abstract subclass is capable of serializing the source. Will\nthrow an exception if the source isn't valid for the serializer.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>source</span> : ol.source.Source<div class='sub-desc'><p>The source to test.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});