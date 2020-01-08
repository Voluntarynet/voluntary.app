"use strict"

/*

    GameView

*/

window.GameView = class GameView extends DomView {
    
    initPrototype () {
        this.newSlot("threejsView", 1)
        this.newSlot("things", null)
        this.newSlot("ship1", null)
        this.newSlot("ship2", null)
    }

    init () {
        super.init()
        this.setThings([])
        this.turnOffUserSelect()
        this.setTransition("all 0s")
        this.setBackgroundColor("blue")
        this.setupThreeJSView()
        return this
    }

    setupThreeJSView () {
        const v = ThreeJSView.clone()
        this.setThreeJSView(v)
        v.fitParentView() // TODO: do this after added to parent
        this.addSubview(v)
        return this
    }

    /*
    setParentView (aView) {

    }
    */

    addShips () {
        this.setShip1(ShipView.clone())
        this.addThing(this.ship1())

        this.setShip2(ShipView.clone())
        this.addThing(this.ship2())

        return this
    }

    run () {
        const p = new THREE.Vector3().set(20, 20, 30)
        this._c1 = SVGCircle.clone().setX(p.x).setY(p.y).setFill("red").show()
    
        this._c2 = SVGCircle.clone().setFill("white")
        this._c2.position().set(p.x, p.y, p.z)
        this._c2.mapToScreen()
        this._c2.show()
    
        //this.startTimer()
    }
    
    startTimer () {
        this._timerId = setInterval(() => {
            this.nextStep()
        }, 1000/30)            
    }
    
    stopTimer () {
        clearInterval(this._timerId);
    }
    
    nextStep () {
        const p = this._c2.position()
        p.set(p.x + 1, p.y, p.z + 1) 
        this._c2.mapToScreen()
        this._c2.show()            
    }
}.initThisClass()

