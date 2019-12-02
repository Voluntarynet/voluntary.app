"use strict"

/*

    BMPostThread

*/


window.BMPostThread = class BMPostThread extends BMAppMessage {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.customizeNodeRowStyles().setToBlackOnWhite()
    }
    
    title () {
        return "post"
    }
    
    findThreadItems () {
        const items = []
        items.push(this.postMessage())
        items.appendItems(this.postMessage().replies())
        return items
    }
    
    update () {
        this.setSubnodes(this.findThreadItems()) // merge?
        return this
    }

}.initThisClass()

