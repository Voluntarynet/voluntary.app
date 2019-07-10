"use strict"

/* 

    DragBarView

*/

window.DragBarView = DomView.extend().newSlots({
    type: "DragBarView",
    isEnabled: true,
    isHighlighted: false,
    isDragging: false,
    normalColor: "#333",
    highlightColor: "#555",
    dragColor: "#999",
    delegate: null,
    thickness: 2,
    isVerticalDrag: true,
}).setSlots({

    init: function () {
        DomView.init.apply(this)

        this.turnOffUserSelect()

        this.setDivClassName("DragBarView")

        this.setIsRegisteredForMouse(true)
        this.syncHighlighted()
        this.syncEnabled()

        this._mouseMoveTrackerFunc = (event) => {
            this.mouseMoveTracker(event)
            return true
        }

        this._mouseUpTrackerFunc = (event) => {
            this.mouseUpTracker(event)
            return true
        }

        this.setBackgroundColor(this.normalColor())
        return this
    },

    hoverCursorType: function() {
        if (this.isVerticalDrag()) {
            return "row-resize"
        }

        return "col-resize"
    },

    setIsVertical: function(aBool) {
        if (this._isVertical !== aBool) {
            this._isVertical = aBool
            //console.log("this.hoverCursorType() = ", this.hoverCursorType())
            this.setCursor(this.hoverCursorType())
        }
        return this
    },

    // --- editable ---
    
    setIsEnabled: function(aBool) {
        if (this._isEnabled !== aBool) {
            this._isEnabled = aBool
            this.syncEnabled()
        }

        return this
    },

    syncEnabled: function() {
        if (this.isEnabled()) {
            this.setDisplay("inline-block")
        } else {
            this.setDisplay("none")
        }
        return this
    },

    // --- highlighted ---
    
    setIsHighlighted: function(aBool) {
        if (this._isHighlighted !== aBool) {
            this._isHighlighted = aBool
            this.syncHighlighted()
        }

        return this
    },

    syncHighlighted: function() {
        if (this.isDragging()) {
            return this
        }

        if (this.isHighlighted()) {
            this.setBackgroundColor(this.highlightColor())
        } else {
            this.setBackgroundColor(this.normalColor())
        }
        this.syncCursor()

        return this
    },

    syncCursor: function() {
        if (this.isHighlighted()) {
            this.setCursor(this.hoverCursorType())
        } else {
            this.setCursor(null)
        }
        return this
    },

    // --- mouse ---

    mouseMoveTracker: function(event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        if (this.delegate()) {
            this.delegate().didDragDivider(Math.floor(event.clientX), Math.floor(event.clientY))
        }
    },

    mouseUpTracker: function(event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        this.onMouseUp(event)
    },

    setIsDragging: function(b) {
        this._isDragging = b;
        if (b) {
            this.setBackgroundColor(this.dragColor())
            this.parentView().setBorder("1px dashed white")
        } else {
            this.setBackgroundColor(this.normalColor())
            this.parentView().setBorder("0px dashed white")
        }
        return this
    },

    onMouseDown: function (event) {
        //console.log(this.typeId() + " onMouseDown")
        this.setIsDragging(true)

        this.removeParentTracking()
        return false
    },

    addParentTracking: function() {
        let r = this.rootView()
        r.element().removeEventListener("mousemove", this._mouseMoveTrackerFunc, false);
        r.element().removeEventListener("mouseup", this._mouseUpTrackerFunc, false);
        return this
    },

    removeParentTracking: function() {
        let r = this.rootView()
        r.element().addEventListener("mousemove", this._mouseMoveTrackerFunc, false);
        r.element().addEventListener("mouseup", this._mouseUpTrackerFunc, false);
        return this
    },

    onMouseMove: function (event) {
        return false
    },

    onMouseOver: function(event) {
        //console.log(this.typeId() + " onMouseOver")
        this.setIsHighlighted(true)
        return false
    },

    onMouseLeave: function(event) {
        //console.log(this.typeId() + " onMouseLeave")
        this.setIsHighlighted(false)
        return false
    },

    onMouseUp: function(event) {
        this.setIsDragging(false)
        this.addParentTracking()
        return false
    },
})
