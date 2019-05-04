"use strict"

/*

    BrowserFieldRow
 

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
		
        //this.setStyles(BMViewStyles.sharedBlackOnWhiteStyle())
        //this.setStyles(BMViewStyles.sharedWhiteOnBlackStyle())

        return this
    },

    /*
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
                
        return this
    },
    */
 
})
