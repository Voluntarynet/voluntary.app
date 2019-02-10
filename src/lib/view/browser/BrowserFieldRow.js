/*

 A BrowserRow that overrides updateSubviews

*/


"use strict"

window.BrowserFieldRow = BrowserRow.extend().newSlots({
    type: "BrowserFieldRow",
    allowsCursorNavigation: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        this.setIsSelectable(false) 
        this.makeCursorDefault()
        this.setSpellCheck(false)
		
        this.styles().setToBlackOnWhite()
		
        return this
    },

    
    didChangeNode: function() {
        BrowserRow.didUpdateNode.apply(this)
        if (this.node() && this.node().nodeShouldUseLightTheme) {
            if (this.node().nodeShouldUseLightTheme()) {
                this.styles().setToBlackOnWhite()
            } else {
                this.styles().setToWhiteOnBlack()
            }
        }
        return this
    },
    
    
    updateSubviews: function() {   
	    BrowserRow.updateSubviews.apply(this)
	
        var node = this.node()

        if (node && node.nodeMinHeight()) {
            var e = this.element()
            if (node.nodeMinHeight() == -1) {
                
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
