"use strict"

/*

    StyleSheet

    const sheet = DocumentBody.shared().styleSheets().first()
    sheet.setSelectorProperty("body", "color", "red")
*/

window.StyleSheet = class StyleSheet extends ProtoClass {
    
    initPrototype () {
        this.newSlot("sheetElement", null)
    }

    init () {
        super.init()
        return this
    }

    href () {
        return this.sheetElement().href
    }

    changeStylesheetRule (selector, property, value) {
        const sheet = this.sheetElement()

        selector = selector.toLowerCase();
        property = property.toLowerCase();
        value = value.toLowerCase(); // assumed to be a string?

        // Change it if it exists
        for(var i = 0; i < sheet.cssRules.length; i++) {
            var rule = sheet.cssRules[i];
            if(rule.selectorText === selector) {
                rule.style[property] = value;
                return this;
            }
        }

        // Add it if it does not
        sheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
        return this;
    }

    show () {
        console.log("sheetElement:", this.sheetElement())
    }

}.initThisClass()

