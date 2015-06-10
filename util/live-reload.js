(function(loc, doc){
    if (loc && doc && (/reload/i).test(loc.href)) {
        doc.write('<scr' + 'ipt src="//localhost:9091"></scr' + 'ipt>');
    }
})(location, document);