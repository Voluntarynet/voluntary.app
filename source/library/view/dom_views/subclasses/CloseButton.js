"use strict"


/* 

    CloseButton

    TODO: make subclass of ButtonView?

*/

window.CloseButton = class CloseButton extends DomView {
    
    initPrototype () {
        this.newSlot("isEnabled", true)
        this.newSlot("iconView", null)
    }

    init () {
        super.init()
        this.turnOffUserSelect()
        //this.setDisplay("table") // to center svg

        const iv = SvgIconView.clone().setIconName("close")
        //iv.setDisplay("table-cell") // to center svg
        //iv.setVerticalAlign("middle") // to center svg
        iv.setHeight("100%").setWidth("100%")
        iv.setStrokeColor("white")
        iv.setFillColor("white")
        this.setIconView(iv)
        this.addSubview(iv)

        this.setAction("close")
        this.addDefaultTapGesture()
        return this
    }

    setIconName (aString) {
        this.iconView().setIconName(aString)
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
        if (this._isEnabled) {
            this.setDisplay("block")
        } else {
            this.setDisplay("none")
        }
        return this
    }

    onTapComplete (aGesture) {
        //this.debugLog(".onTapComplete()")
        if (!this.isEditable()) {
            this.sendActionToTarget()
        }
        return false
    }
    
}.initThisClass()
