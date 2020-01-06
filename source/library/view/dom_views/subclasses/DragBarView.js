"use strict"

/* 

    DragBarView

*/


window.DragBarView = class DragBarView extends DomView {
    
    initPrototype () {
        this.newSlot("isEnabled", true)
        this.newSlot("isHighlighted", false)
        this.newSlot("isDragging", false)
        this.newSlot("normalColor", "#333")
        this.newSlot("highlightColor", "#555")
        this.newSlot("dragColor", "#999")
        this.newSlot("delegate", null)
        this.newSlot("thickness", 2)
        this.newSlot("isVerticalDrag", true)
    }

    init () {
        super.init()

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
    }

    hoverCursorType () {
        if (this.isVerticalDrag()) {
            return "row-resize"
        }

        return "col-resize"
    }

    setIsVertical (aBool) {
        if (this._isVertical !== aBool) {
            this._isVertical = aBool
            //console.log("this.hoverCursorType() = ", this.hoverCursorType())
            this.setCursor(this.hoverCursorType())
        }
        return this
    }

    // --- editable ---
    
    setIsEnabled (aBool) {
        if (this._isEnabled !== aBool) {
            this._isEnabled = aBool
            this.syncEnabled()
        }

        return this
    }

    syncEnabled () {
        if (this.isEnabled()) {
            this.setDisplay("inline-block")
        } else {
            this.setDisplay("none")
        }
        return this
    }

    // --- highlighted ---
    
    setIsHighlighted (aBool) {
        if (this._isHighlighted !== aBool) {
            this._isHighlighted = aBool
            this.syncHighlighted()
        }

        return this
    }

    syncHighlighted () {
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
    }

    syncCursor () {
        if (this.isHighlighted()) {
            this.setCursor(this.hoverCursorType())
        } else {
            this.setCursor(null)
        }
        return this
    }

    // --- mouse ---

    mouseMoveTracker (event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        if (this.delegate()) {
            this.delegate().didDragDivider(Math.floor(event.clientX), Math.floor(event.clientY))
        }
    }

    mouseUpTracker (event) {
        //console.log("mouse pos: ", event.clientX, " x ", event.clientY)
        this.onMouseUp(event)
    }

    setIsDragging (b) {
        this._isDragging = b;
        if (b) {
            this.setBackgroundColor(this.dragColor())
            this.parentView().setBorder("1px dashed white")
        } else {
            this.setBackgroundColor(this.normalColor())
            this.parentView().setBorder("0px dashed white")
        }
        return this
    }

    onMouseDown (event) {
        //this.debugLog(" onMouseDown")
        this.setIsDragging(true)

        this.removeParentTracking()
        return false
    }

    addParentTracking () {
        const r = this.rootView()
        r.element().removeEventListener("mousemove", this._mouseMoveTrackerFunc, false);
        r.element().removeEventListener("mouseup", this._mouseUpTrackerFunc, false);
        return this
    }

    removeParentTracking () {
        const r = this.rootView()
        r.element().addEventListener("mousemove", this._mouseMoveTrackerFunc, false);
        r.element().addEventListener("mouseup", this._mouseUpTrackerFunc, false);
        return this
    }

    onMouseMove (event) {
        return false
    }

    onMouseOver (event) {
        //this.debugLog(" onMouseOver")
        this.setIsHighlighted(true)
        return false
    }

    onMouseLeave (event) {
        //this.debugLog(" onMouseLeave")
        this.setIsHighlighted(false)
        return false
    }

    onMouseUp (event) {
        this.setIsDragging(false)
        this.addParentTracking()
        return false
    }
    
}.initThisClass()
