"use strict"

/*

    GameView

*/

window.GameView = DomView.extend().newSlots({
    type: "GameView",
    threejsView: null,
    things: null,
    ship1: null,
    ship2: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.setThings([])
        this.turnOffUserSelect()
        this.setTransition("all 0s")
        this.setBackgroundColor("blue")
        this.setupThreeJSView()
        return this
    },

    setupThreeJSView: function() {
        const v = ThreeJSView.clone()
        this.setThreeJSView(v)
        v.fitParentView() // TODO: do this after added to parent
        this.addSubview(v)
        return this
    },

    /*
    setParentView: function(aView) {

    },
    */

    addShips: function() {
        this.setShip1(ShipView.clone())
        this.addThing(this.ship1())

        this.setShip2(ShipView.clone())
        this.addThing(this.ship2())

        return this
    },

    run: function() {
        const p = new THREE.Vector3().set(20, 20, 30)
        this._c1 = SVGCircle.clone().setX(p.x).setY(p.y).setFill("red").show()
    
        this._c2 = SVGCircle.clone().setFill("white")
        this._c2.position().set(p.x, p.y, p.z)
        this._c2.mapToScreen()
        this._c2.show()
    
        //this.startTimer()
    },
    
    startTimer: function() {
        this._timerId = setInterval(() => {
            this.nextStep()
        }, 1000/30)            
    },
    
    stopTimer: function() {
        clearInterval(this._timerId);
    },
    
    nextStep: function() {
        const p = this._c2.position()
        p.set(p.x + 1, p.y, p.z + 1) 
        this._c2.mapToScreen()
        this._c2.show()            
    },
})

