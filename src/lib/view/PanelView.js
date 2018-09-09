"use strict"

window.PanelView = DivView.extend().newSlots({
    type: "PanelView",
    titleView: null,
    subtitleView: null,
    button1: null,
    isDragging: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setTitleView(DivView.clone().setDivClassName("PanelTitleView"))
        this.addSubview(this.titleView())

        this.setSubtitleView(DivView.clone().setDivClassName("PanelSubtitleView"))
        this.addSubview(this.subtitleView())

        this.setButton1(ButtonView.clone())
        this.addSubview(this.button1())
        this.button1().setPosition("absolute").setRight(10).setBottom(10)
        this.button1().setMinAndMaxWidth(100)

        this.setMinAndMaxWidth(500)
        this.setMinAndMaxHeight(500)
        this.setBackgroundColor("white")
        this.setPosition("absolute")
        this.setLeft(0)
        this.setTop(0)
        this.setIsRegisteredForMouse(true)

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




    // --- mouse ---

    mouseMoveTracker: function(event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        if (this.isDragging()) {
            this.setLeft(event.clientX - (this._startClientX - this._startLeft ))
            this.setTop(event.clientY -(this._startClientY - this._startTop))
        }
    },

    onMouseDown: function (event) {
        console.log("onMouseDown")
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


})
