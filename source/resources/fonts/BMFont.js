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

    name: function() {
        return this.path().fileName()
    },

    setPath: function(aPath) {
        this._path = aPath
        this.load()
        return this
    },

    load: function() {
        const fe = BMFontFace.clone().setUrl(this.path())
        // TODO: create DocumentHead class, ask it's share instance if it already contains this font link element
        return this
    },
})
