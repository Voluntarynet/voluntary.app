"use strict"

/* 

    AtomPaneView

*/


window.AtomPaneView = DivView.extend().newSlots({
    type: "AtomPaneView",
    startView: null,
    mouseIsDown: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setOverflow("hidden")
        this.setIsRegisteredForMouse(true)
        this.setIsRegisteredForClicks(true)
        return this
    },

    // mouse

    onDoubleClick: function(event) {
        console.log("onDoubleClick")

    },

    removeStartView: function() {
        if (this.startView() && this.startView().parentView()) {
            this.startView().removeFromParentView()
        }
    },

    newStartView: function() {
        let v = DivView.clone()
        v.setMinAndMaxWidth(8)
        v.setMinAndMaxHeight(8)
        v.setBackgroundColor("#aaa")
        v.setPosition("absolute")
        v.setOpacity(0.2)
        v.setLeft(this.mouseDownPos().x() - 4)
        v.setTop(this.mouseDownPos().y() - 4)
        return v
    },

    startView: function() {
        //this.removeStartView()

        if (!this._startView) {
            let v = DivView.clone()
            v.setMinAndMaxWidth(8)
            v.setMinAndMaxHeight(8)
            v.setBackgroundColor("#aaa")
            v.setPosition("absolute")
            v.setOpacity(0.2)
            this.setStartView(v)
        }

        return this._startView
    },

    canAddPane: function() {
        return this.subviews().length == 0
    },

    /*
    onMouseOut: function(event) {
        console.log(this.type() + " onMouseOut")

        return true
    },
    */

    onMouseDown: function(event) {
        console.log(this.type() + " onMouseDown")
        
        if (!this.canAddPane()) {
            return false
        }


        this.setMouseIsDown(true)
        this.listenForRootMouseUp()

        let mp = Mouse.shared().downPos()
        let sv = this.startView()
        sv.setLeft(mp.x() - 4)
        sv.setTop(mp.y() - 4)

        this.addSubview(sv)
        return true
    },

    onMouseMove: function (event) {
        if (this.mouseIsDown()) {
            this._currentDragPos = this.viewPositionForEvent(event)

            let sv = this.startView()
            let dir = this.dragDirection(event)
            let downPos = this.mouseDownPos()
            //console.log("onMouseMove dir ", dir)

            
            if (dir == "x") {
                //console.log("dir x")
                sv.setMinAndMaxWidth(null)
                sv.setMinAndMaxHeight(1)
                sv.setWidth("100%")
                sv.setHeight(null)
                sv.setLeft(0)
                sv.setTop(downPos.y())
            } else if (dir == "y") {
                //console.log("dir y")
                sv.setMinAndMaxWidth(1)
                sv.setMinAndMaxHeight(null)
                sv.setWidth("100%")
                sv.setHeight("100%")
                sv.setLeft(downPos.x)
                sv.setTop(0)
            } else {
                sv.setMinAndMaxWidth(8)
                sv.setMinAndMaxHeight(8)
                sv.setWidth(null)
                sv.setHeight(null)
                sv.setLeft(downPos.x())
                sv.setTop(downPos.y())
            }
            //console.log("is moving ", event.clientX + "," + event.clientY)
        }
        return this
    },

    dragDirection: function(event) {
        let dv = Mouse.shared().dragVector()
        //console.log("dv = ", dv)
        if (this.mouseDownPos()) {
            let dx = Math.abs(dv.x())
            let dy = Math.abs(dv.y())
            let r = Math.sqrt(dx*dx + dy*dy)
            let minR = 50
            if (r > minR) {
                if (dx > dy) {
                    this._dragDir = "x"
                } else {
                    this._dragDir = "y"
                }
            } else {
                this._dragDir = null
            }
            
            let o = 0.2 + r/minR;
            if (o > 1) { o = 1 }
            this.startView().setOpacity(o)
        }

        return this._dragDir
    },

    onMouseOut: function() {

    },

    onMouseUp: function(event) {
        if (this.mouseIsDown()) {
            let dir = this.dragDirection()
            let downPos = this.mouseDownPos()

            if (dir) {
                if (dir == "x") {
                    this.addAtomAtY(downPos.y())
                } else if (dir == "y") {
                    this.addAtomAtX(downPos.x())
                }
            }
            
            this.removeStartView()
        }
        this.setMouseIsDown(false)
        return this
    },

    addAtomAtX: function(x) {
        // request new node from this.parentView().node()
        let v = AtomNodeView.clone().setNode(AtomNode.clone())
        v.setIsVertical(false).setHeadWidth(x)
        v.syncLayout()
        this.addSubview(v)
    },

    addAtomAtY: function(y) {
        // request new node from this.parentView().node()
        let v = AtomNodeView.clone().setNode(AtomNode.clone())
        v.setIsVertical(true).setHeadHeight(y)
        v.syncLayout()
        this.addSubview(v)
    },

    onRootMouseUp: function(event) {
        this.onMouseUp(event)
        return true
    },

    rootMouseUpFunc: function() {
        if (!this._rootMouseUpFunc) {
            this._rootMouseUpFunc = (event) => { this.onRootMouseUp(event) }
        }
        return this._rootMouseUpFunc
    },

    listenForRootMouseUp: function() {
        this.rootView().element().addEventListener("mouseup", this.rootMouseUpFunc(), false);
        return this
    },

    unlistenForRootMouseUp: function() {
        this.rootView().element().removeEventListener("mouseup", this.rootMouseUpFunc(), false);
        return this
    },
})
