"use strict"

/*

    BrowserHeaderAction

    Merge with ButtonView?
    
*/

NodeView.newSubclassNamed("BrowserHeaderAction").newSlots({
    canClick: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        return this
    },
    
    updateCanClick: function() {
        if (this.canClick()) {
            this.setOpacity(1)
            //this.setIsRegisteredForClicks(true) // will update cursor
            this.addDefaultTapGesture()

        } else {
            this.setOpacity(0.5)
            //this.setIsRegisteredForClicks(false) 
            this.removeDefaultTapGesture()

        }
    },
    
    updateTooltip: function() {
        this.setToolTip(this.action())

        /*
		if (this.target() && this.target().subnodeProto() && this.target().subnodeProto().nodeVisibleClassName()) {
			const noun = this.target().subnodeProto().nodeVisibleClassName().toLowerCase()
			const beginsWithVowel = ["a", "e", "i", "o", "u"].contains(noun[0])
			const article = beginsWithVowel ? "an" : "a";
			this.setToolTip(this.action() + " " + article + " " + noun)
		}
		*/
		
        return this
    },
	
    updateImage: function () {
        this.setBackgroundImageUrlPath(this.pathForIconName(this.action()))
        this.setBackgroundSizeWH(10, 10) // use "contain" instead?
        this.setBackgroundPosition("center")
        this.setOpacity(0.6)
        return this
    },

    syncFromNode: function() {
        this.updateCanClick()
        this.updateImage()
        this.updateTooltip()
        return this
    },

    onTapComplete: function (aGesture) {
        //this.debugLog(".onTapComplete()")
        this.sendActionToTarget()
        return false
    },
})
