exports.handlers = {
    /**
     * Intercepts and pre-processes the source code before JSDoc parses it.
     * Extracts the object passed to `Ext.define` and replaces it with
     * a "class-like" syntax for JSDoc to parse.
     */
    beforeParse(e) {
        const classRegex = /\nExt\.define\(['"]([^'"]+)['"],\s*(\{[\s\S]*.*\})\);/g;
        // console.log(e.filename);
        // console.log(e.source);
        e.source = e.source.replace(classRegex, (match, className, classBody) => {

            //console.log(className);
            //console.log(classBody);

            const extractedClass = `${className} = ${classBody};`;

            // Log the transformation for debugging
            // console.log(extractedClass);
            return extractedClass;
        });
    },
};
