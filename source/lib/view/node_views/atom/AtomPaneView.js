"use strict"

/* 

    AtomPaneView

*/


window.AtomPaneView = DomView.extend().newSlots({
    type: "AtomPaneView",
    startView: null,
    mouseIsDown: false,
    titleView: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.setOverflow("hidden")
        this.setIsRegisteredForMouse(true)
        this.setIsRegisteredForClicks(true)
        this.setBackgroundColor(CSSColor.randomColor().cssColorString())
        this.setBackgroundColor("red")

        /*
        const t = DomView.clone().setInnerHTML("title").setColor("white")
        this.setTitleView(t)
        t.setPosition("absolute")
        this.addSubview(t)
        */
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
        let v = DomView.clone()
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
            let v = DomView.clone()
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
        
        this.subviews().forEach((subview) => { 
            if(subview.type() === "AtomPaneView") {
                return false
            } })
        return true
        
        // return this.subviews().length === 0
    },

    /*
    onMouseLeave: function(event) {
        console.log(this.typeId() + " onMouseLeave")

        return true
    },
    */

    onMouseDown: function(event) {
        console.log(this.typeId() + " onMouseDown")
        
        
        if (!this.canAddPane()) {
            return false
        }

        this.setMouseIsDown(true)
        this.listenForRootMouseUp()

        const mp = Mouse.pointForEvent(event)
        const sv = this.startView()
        sv.setLeft(mp.x() - 4)
        sv.setTop(mp.y() - 4)

        this.addSubview(sv)
        return true
    },

    onMouseMove: function (event) {
        const debug = true

        if (this.mouseIsDown()) {
            const wp = Mouse.pointForEvent(event)
            this._currentDragPos = this.viewPosForWindowPos(wp)

            const sv = this.startView()
            const dir = this.dragDirection(event)
            const downPos = this.mouseDownPos()
            //console.log("onMouseMove dir ", dir)

            
            if (dir === "x") {
                if (debug) { console.log("dir x") }
                sv.setMinAndMaxWidth(null)
                sv.setMinAndMaxHeight(1)
                sv.setWidth("100%")
                sv.setHeight(null)
                sv.setLeft(0)
                sv.setTop(downPos.y())
            } else if (dir === "y") {
                if (debug) { console.log("dir y") }
                sv.setMinAndMaxWidth(1)
                sv.setMinAndMaxHeight(null)
                sv.setWidth("100%")
                sv.setHeight("100%")
                sv.setLeft(downPos.x())
                sv.setTop(0)
            } else {
                if (debug) { console.log("no dir ") }
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
            const dx = Math.abs(dv.x())
            const dy = Math.abs(dv.y())
            const r = Math.sqrt(dx*dx + dy*dy)
            const minR = 50
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

    onMouseLeave: function() {

    },

    onMouseUp: function(event) {
        if (this.mouseIsDown()) {
            const dir = this.dragDirection()
            const downPos = this.mouseDownPos()

            if (dir) {
                if (dir === "x") {
                    this.addAtomAtY(downPos.y())
                } else if (dir === "y") {
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
        const v = AtomNodeView.clone().setNode(AtomNode.clone())
        v.setIsVertical(false).setHeadWidth(x)
        v.syncLayout()
        this.addSubview(v)
    },

    addAtomAtY: function(y) {
        // request new node from this.parentView().node()
        const v = AtomNodeView.clone().setNode(AtomNode.clone())
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
