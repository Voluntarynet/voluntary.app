"use strict"

/*
    Device

*/

window.Device = class Device extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init  () {
        super.init()
        return this
    }

}.initThisClass()
