"use strict"

window.BMThemeStyleSheet = ideal.Proto.extend().newSlots({
    type: "BMThemeStyleSheet",
}).setSlots({
    init: function () {
    },

    shared: function() {
        return this.sharedInstanceForClass(BMThemeStyleSheet)
    },

    sheet: function() {
        if (!this._sheet) {
            let sheetName = "ThemeStyleSheet"
            let sheetElement = document.getElementById(sheetName) 
            sheetElement = document.createElement("style")
            sheetElement.id = sheetName
            sheetElement.innerHTML = "";
            document.body.appendChild(sheetElement);
            this._sheet = document.styleSheets[document.styleSheets.length-1]
        }

        return this._sheet
    },

    setDivClassNameAttributeValue: function(divClassName, name, value) {
        var className = "."  + divClassName.split(" ")[0]
        var rule = className + " { " + name + ": " + value +"; }"


        var sheet = this.sheet()
        sheet.insertRule(rule, sheet.cssRules.length); 
        console.log("added rule to theme sheet: " + rule + "")
        return this
    },
})
