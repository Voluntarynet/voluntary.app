"use strict"

/*

    BMFontFamily


*/

window.BMFontFamily = BMNode.extend().newSlots({
    type: "BMFontFamily",
    name: null,
    fonts: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(270)
    },

    title: function() {
        return this.name()
    },

    /*
    subtitle: function () {
        return "font family"
    },
    */

    addFontWithPath: function(aPath) {
        const font = BMFont.clone().setPath(aPath)
        this.addSubnode(font)
        return this
    },

})
