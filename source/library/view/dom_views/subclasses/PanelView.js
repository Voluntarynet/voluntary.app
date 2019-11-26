"use strict"

/*

    PanelView

*/

DomView.newSubclassNamed("PanelView").newSlots({
    titleView: null,
    subtitleView: null,
    button1: null,

    isDragging: false,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.setTitleView(TextField.clone().setDivClassName("PanelTitleView"))
        this.addSubview(this.titleView())
        this.titleView().setTextAlign("center")
        this.titleView().setHeight("3em")
        this.titleView().setWhiteSpace("normal")
        this.titleView().centerInParentView()
        this.titleView().setValue("hello")
        this.titleView().setColor("white")

        //this.setSubtitleView(TextField.clone().setDivClassName("PanelSubtitleView"))
        //this.addSubview(this.subtitleView())

        this.setButton1(ButtonView.clone())
        this.addSubview(this.button1())
        this.button1().setPosition("absolute").setRight(10).setBottom(10)
        this.button1().setMinAndMaxWidth(100)
        this.button1().setTitle("OK")
        this.button1().setTarget(this).setAction("hitButton1")

        this.setMinAndMaxWidth(500)
        this.setMinAndMaxHeight(200)
        this.setBackgroundColor("black")
        //this.setBorder("1px solid #ccc")
        this.setPosition("absolute")
        this.setLeft(0)
        this.setTop(0)
        //this.setupForDraggingWithMouse()
        this.setBorderRadius(5)
        this.centerInParentView()

        this._mouseMoveTrackerFunc = (event) => {
            this.mouseMoveTracker(event)
        }

        /*
        this._mouseUpTrackerFunc = (event) => {
            //
        }
        */

        return this
    },

    setTitle: function(s) {
        this.titleView().setValue(s)
        return this
    },


    // --- dragging ---

    setupForDraggingWithMouse: function() {
        this.setIsRegisteredForMouse(true)
    },

    mouseMoveTracker: function(event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        if (this.isDragging()) {
            this.setLeft(event.clientX - (this._startClientX - this._startLeft))
            this.setTop(event.clientY  - (this._startClientY - this._startTop))
        }
    },

    onMouseDown: function (event) {
        //console.log("onMouseDown")
        this.setIsDragging(true)

        this.parentView().element().addEventListener("mousemove", this._mouseMoveTrackerFunc, false);

        this._startLeft = this.left()
        this._startTop = this.top()
        this._startClientX = event.clientX
        this._startClientY = event.clientY
    },

    onMouseMove: function (event) {
    },

    onMouseUp: function(event) {
        this.setIsDragging(false)
        //this.setBackgroundColor(this.normalColor())
        this.parentView().element().removeEventListener("mousemove", this._mouseMoveTrackerFunc, false);
    },

    hitButton1: function() {
        this.close()
        return this
    },

    close: function() {
        this.removeFromParentView()
        return this
    }
    
}).initThisProto()
