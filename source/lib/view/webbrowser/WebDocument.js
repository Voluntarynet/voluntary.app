"use strict"

/*

    WebDocument

    Abstraction for web document object.

*/

window.WebDocument = ideal.Proto.extend().newSlots({
    type: "WebDocument",
}).setSlots({
    init: function () {
        return this
    },

    shared: function() {   
        return this.sharedInstanceForClass(WebDocument)
    },

    body: function() {
        return DocumentBody.shared()
    },

    styleSheets: function() {
        const elements = document.styleSheets;
        const sheets = []

        for (let i = 0; i < elements.length; i ++) {
            const e = elements[i];
            sheets.push(StyleSheet.clone().setSheet(e))
        }

        return sheets
    },

})