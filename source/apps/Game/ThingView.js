"use strict"

/*

    ThingView

*/


window.ThingView = class ThingView extends DomView {
    
    initPrototype () {
        this.newSlots({
            transform: null,
            transformSpeed: null,
            mass: 1,
            icon: null,
        })
    }

    init () {
        super.init()
        this.setTransform(Transform.clone())
        this.setRransformSpeed(Transform.clone())
        this.turnOffUserSelect()
        this.setTransition("all 0s")
        return this
    }

    setIcon (iconName) {
        return this
    }

    timeStep () {
        this.transform().addInPlace(this.transformSpeed())
        this.setTransform(this.transform().cssString())
    }
    
}.initThisClass()
