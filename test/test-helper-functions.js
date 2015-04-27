/*global*/
/*jshint camelcase:true, curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80 */
;(function(global){
    /**
     * A helper method that'll return a HTML script tag for loading
     * an external JavaScript file.
     *
     * @param {string} src The `src` of the external JavaScript file.
     * @returns {string} The script tag with given `src`
     */
    function getExternalScriptTag(src){
        return '<scr' + 'ipt src="' + src + '"></scr' + 'ipt>';
    }
    
    /**
     * A helper method that'll return a HTML script tag for executing
     * some given JavaScript code.
     *
     * @param {string} code The code to execute.
     * @returns {string} The script tag with given content.
     */
    function getInlineScriptTag(code){
        return '<scr' + 'ipt>' + code + '</scr' + 'ipt>';
    }
    
    global.TestUtil = {
        getExternalScriptTag: getExternalScriptTag,
        getInlineScriptTag: getInlineScriptTag
    };
})(this);