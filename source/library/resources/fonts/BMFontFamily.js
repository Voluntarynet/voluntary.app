"use strict"

/*

    BMFontFamily


*/

window.BMFontFamily = class BMFontFamily extends BMNode {
    
    initPrototype () {
        this.newSlots({
            name: null,
            fonts: null,
        })
    }

    init () {
        super.init()
        this.setNodeMinWidth(270)
    }

    title () {
        return this.name()
    }

    /*
    subtitle () {
        return "font family"
    }
    */

    addFontWithPath (aPath) {
        const font = BMFont.clone().setPath(aPath)
        font.load()
        this.addSubnode(font)
        return this
    }

}.initThisClass()
