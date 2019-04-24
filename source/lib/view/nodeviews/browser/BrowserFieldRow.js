"use strict"

/*

    BrowserFieldRow
 
    A BrowserRow that overrides updateSubviews 
    to fill in remaining space in column when requested.

*/


window.BrowserFieldRow = BrowserRow.extend().newSlots({
    type: "BrowserFieldRow",
    allowsCursorNavigation: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        this.setIsSelectable(false) 
        this.makeCursorDefault()
        this.setSpellCheck(false)
		
        this.setStyles(BMViewStyles.sharedBlackOnWhiteStyle())
        //this.setStyles(BMViewStyles.sharedWhiteOnBlackStyle())

        return this
    },

    /*
    didChangeNode: function() {
        BrowserRow.didUpdateNode.apply(this)
        if (this.node() && this.node().nodeShouldUseLightTheme) {
            if (this.node().nodeShouldUseLightTheme()) {
                this.setStyles(BMViewStyles.sharedBlackOnWhiteStyle())

            } else {
                this.setStyles(BMViewStyles.sharedWhiteOnBlackStyle())

            }
        }
        return this
    },
    */
    
    updateSubviews: function() {   
	    BrowserRow.updateSubviews.apply(this)
	
        const node = this.node()

        if (node && node.nodeMinHeight()) {
            const e = this.element()
            if (node.nodeMinHeight() === -1) {
                this.setHeight("auto")                
                this.setPaddingBottom("calc(100% - 20px)")
            } else {
                this.setHeight(this.pxNumberToString(node.nodeMinHeight()))
            }
        }
        
        //this.applyStyles()
        
        return this
    },
 
})
