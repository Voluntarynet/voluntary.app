"use strict"

/*

    WebDocument

    Abstraction for web document object.

*/

window.WebDocument = class WebDocument extends ProtoClass {
    
    initPrototype () {

    }

    init () {
        super.init()
        return this
    }

    body () {
        return DocumentBody.shared()
    }

    styleSheets () {
        const elements = document.styleSheets;
        const sheets = []

        for (let i = 0; i < elements.length; i ++) {
            const sheetElement = elements[i];
            sheets.push(StyleSheet.clone().setSheetElement(sheetElement))
        }

        return sheets
    }

    show () {
        this.debugLog(":")
        this.styleSheets().forEach(sheet => sheet.show())
    }

}.initThisClass()