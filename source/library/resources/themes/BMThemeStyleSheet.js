"use strict"

/*

    BMThemeStyleSheet

*/

ideal.Proto.newSubclassNamed("BMThemeStyleSheet").newSlots({
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
    },

    shared: function() {
        return this.sharedInstanceForClass(BMThemeStyleSheet)
    },

    sheet: function() {
        if (!this._sheet) {
            const sheetName = "ThemeStyleSheet"
            const sheetElement = document.getElementById(sheetName) 
            sheetElement = document.createElement("style")
            sheetElement.id = sheetName
            sheetElement.innerHTML = "";
            document.body.appendChild(sheetElement);
            this._sheet = document.styleSheets[document.styleSheets.length-1]
        }

        return this._sheet
    },

    setDivClassNameAttributeValue: function(divClassName, name, value) {
        const className = "."  + divClassName.split(" ")[0]
        const rule = className + " { " + name + ": " + value +"; }"
        const sheet = this.sheet()
        sheet.insertRule(rule, sheet.cssRules.length); 
        console.log("added rule to theme sheet: " + rule + "")
        return this
    },
    
}).initThisProto()
