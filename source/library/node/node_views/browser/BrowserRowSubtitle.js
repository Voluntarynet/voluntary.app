"use strict"

/*
    
    BrowserRowSubtitle
    
*/

window.BrowserRowSubtitle = class BrowserRowSubtitle extends TextField {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setDisplay("block")
        return this
    }

}.initThisClass()


