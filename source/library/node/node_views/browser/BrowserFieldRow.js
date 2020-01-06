"use strict"

/*

    BrowserFieldRow
 
    Is this needed? 

*/

window.BrowserFieldRow = class BrowserFieldRow extends BrowserRow {
    
    initPrototype () {
        this.newSlot("allowsCursorNavigation", false)
    }

    init () {
        super.init()
        //this.setIsSelectable(false) 
        this.makeCursorDefault()
        this.setSpellCheck(false)
		
        //this.setStyles(BMViewStyles.shared().sharedBlackOnWhiteStyle())
        //this.setStyles(BMViewStyles.shared().sharedWhiteOnBlackStyle())

        return this
    }

    /*
    updateSubviews () {   
        super.updateSubviews()
	
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
    }
    */

 
}.initThisClass()
