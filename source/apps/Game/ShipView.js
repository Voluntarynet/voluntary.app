"use strict"

/*

    ShipView

*/

window.ShipView = class ShipView extends ThingView {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        return this
    } 

    update () {
        ThingView.update.apply(this)
    }


}.initThisClass()