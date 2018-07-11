"use strict"

window.DragBarView = DivView.extend().newSlots({
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
        DivView.init.apply(this)

        this.turnOffUserSelect()

        this.setDivClassName("DragBarView")

        this.setIsRegisteredForMouse(true)
        this.syncHighlighted()
        this.syncEnabled()

        this._mouseMoveTrackerFunc = (event) => {
            this.mouseMoveTracker(event)
        }

        this._mouseUpTrackerFunc = (event) => {

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
        if (this._isVertical != aBool) {
            this._isVertical = aBool
            this.setCursor(this.hoverCursorType())
        }
        return this
    },

    // --- editable ---
    
    setIsEnabled: function(aBool) {
        if (this._isEnabled != aBool) {
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
        if (this._isHighlighted != aBool) {
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
            this.setCursor(this.hoverCursorType())
        } else {
            this.setBackgroundColor(this.normalColor())
            this.setCursor(null)
        }

        return this
    },

    // --- mouse ---

    mouseMoveTracker: function(event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        if (this.delegate()) {
            this.delegate().didDragDivider(event.clientX, event.clientY)
        }
    },

    onMouseDown: function (event) {
        console.log("onMouseDown")
        this.setIsDragging(true)
        this.setBackgroundColor(this.dragColor())

        this.parentView().element().addEventListener("mousemove", this._mouseMoveTrackerFunc, false);
    },

    onMouseMove: function (event) {
    },

    onMouseOver: function(event) {
        this.setIsHighlighted(true)
    },

    onMouseOut: function(event) {
        this.setIsHighlighted(false)
    },

    onMouseUp: function(event) {
        this.setIsDragging(false)
        this.setBackgroundColor(this.normalColor())
        this.parentView().element().removeEventListener("mousemove", this._mouseMoveTrackerFunc, false);
    },

})
