"use strict"

/*

    BMBuys

*/

window.BMBuys = class BMBuys extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setTitle("Buys")
        this.setActions(["add"])
        this.setSubnodeProto(BMBuy)
        this.setSubtitleIsSubnodeCount(true)
    }

}.initThisClass()
