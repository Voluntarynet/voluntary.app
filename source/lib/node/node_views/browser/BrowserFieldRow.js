"use strict"

/*

    BrowserFieldRow
 

*/

BrowserRow.newSubclassNamed("BrowserFieldRow").newSlots({
    allowsCursorNavigation: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        //this.setIsSelectable(false) 
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

        if (node && node.nodeMinRowHeight()) {
            const e = this.element()
            if (node.nodeMinRowHeight() === -1) {
                this.setHeight("auto")                
                this.setPaddingBottom("calc(100% - 20px)")
            } else {
                this.setHeight(this.pxNumberToString(node.nodeMinRowHeight()))
            }
        }
                
        return this
    },
    */
 
})
