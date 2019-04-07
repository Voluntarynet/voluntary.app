"use strict"

/*

    ThingView

*/


window.ThingView = DomView.extend().newSlots({
    type: "ThingView",
    transform: null,
    transformSpeed: null,
    mass: 1,
    icon: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.setTransform(Transform.clone())
        this.setRransformSpeed(Transform.clone())
        this.turnOffUserSelect()
        this.setTransition("all 0s")
        return this
    },

    setIcon: function(iconName) {
        return this
    },

    timeStep: function() {
        this.transform().addInPlace(this.transformSpeed())
        this.setTransform(this.transform().cssString())
    },
})
