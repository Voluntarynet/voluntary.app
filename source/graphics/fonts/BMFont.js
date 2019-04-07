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
        setTimeout(() => { this.createFontElement() }, 10) // TODO: timeout needed?
        return this
    },

    fontNameFromPath: function() {
        const lastComponent = this.path().split("/").last()
        const fontName = lastComponent.before(".")
        return fontName
    },

    createFontElement: function() {
        const fe = BMFontFace.clone().setUrl(this.path())
        document.head.appendChild(fe.element());
        // TODO: create DocumentHead class, ask it's share instance if it already contains this font link element
        return this
    },
})
