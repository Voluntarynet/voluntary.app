"use strict"

/*

    GameView

*/

window.GameView = DivView.extend().newSlots({
    type: "GameView",
    things: null,
    ship1: null,
    ship2: null,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setThings([])
        this.turnOffUserSelect()
        this.setTransition("all 0s")
        this.setBackgroundColor("blue")
        return this
    },

    addShips: function() {
        this.setShip1(ShipView.clone())
        this.addThing(this.ship1())

        this.setShip2(ShipView.clone())
        this.addThing(this.ship2())

        return this
    },
})


window.ThingView = DivView.extend().newSlots({
    type: "ThingView",
    transform: null,
    transformSpeed: null,
    mass: 1,
    icon: null,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
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

window.ShipView = ThingView.extend().newSlots({
    type: "ShipView",
}).setSlots({
    init: function () {
        ThingView.init.apply(this)

        return this
    },

    update: function() {
        ThingView.update.apply(this)
    },


})