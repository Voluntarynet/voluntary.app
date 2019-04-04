"use strict"

/*

    BMFont

    Managed by BMFontManager.

*/

window.BMFont = BMNode.extend().newSlots({
    type: "BMFont",
    path: null,
    name: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
    },

    title: function() {
        return this.name()
    },

    setPath: function(aPath) {
        this._path = aPath
        this.setName(this.fontNameFromPath())
        console.log("setup font: ", this.name())
        return this
    },

    fontNameFromPath: function() {
        const lastComponent = this.path().split("/").last()
        const fontName = lastComponent.before(".")
        return fontName
    },

})
