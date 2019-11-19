"use strict"

/*

    WebDocument

    Abstraction for web document object.

*/

ideal.Proto.newSubclassNamed("WebDocument").newSlots({
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
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
            const sheetElement = elements[i];
            sheets.push(StyleSheet.clone().setSheetElement(sheetElement))
        }

        return sheets
    },

    show: function() {
        this.debugLog(":")
        this.styleSheets().forEach(sheet => sheet.show())
    },

})