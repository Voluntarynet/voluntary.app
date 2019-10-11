"use strict"


/* 

    CloseButton

    TODO: make subclass of ButtonView?

*/

window.CloseButton = DomView.newSubclassNamed("CloseButton").newSlots({ 
    isEnabled: true,
    iconView: null,
}).setSlots({

    init: function () {
        DomView.init.apply(this)
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
    },

    setIconName: function(aString) {
        this.iconView().setIconName(aString)
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
        if (this._isEnabled) {
            this.setDisplay("block")
        } else {
            this.setDisplay("none")
        }
        return this
    },

    onTapComplete: function (aGesture) {
        //console.log(this.typeId() + ".onTapComplete()")
        if (!this.isEditable()) {
            DomView.sendActionToTarget.apply(this)
        }
        return false
    },
})
