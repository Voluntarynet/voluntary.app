"use strict"

/*

    BMFontFamily


*/

BMNode.newSubclassNamed("BMFontFamily").newSlots({
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
        font.load()
        this.addSubnode(font)
        return this
    },

})
