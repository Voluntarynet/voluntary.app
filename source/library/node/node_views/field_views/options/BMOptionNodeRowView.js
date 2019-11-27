"use strict"

/*

    BMOptionNodeRowView 

 
*/

window.BMOptionNodeRowView = class BMOptionNodeRowView extends BrowserTitledRow {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setHasSubtitle(true)
        return this
    }

    toggle () {
        this.node().toggle()
        return this
    }

    onEnterKeyUp (event) {
        BrowserTitledRow.onEnterKeyUp.apply(this, [event])
        this.toggle()
        return this
    }
    
    onTapComplete (aGesture) {
        BrowserTitledRow.onTapComplete.apply(this, [aGesture])
        this.toggle()
        return this
    }
    
    /*
    activate () { // not getting called?
        BrowserTitledRow.activate.apply(this, [aGesture])
        this.node().toggle()
        return this
    }
    */   
               
    /*
    select () {
        BrowserTitledRow.select.apply(this)
        this.debugLog(+ " " + this.node().title() + " picked ")
        
        // will tell parent node which will ensure only one selected if needed
        //this.browser().previous()
        // unselect parentNode's view in previous column?
        //this.didEdit()
        this.node().toggle()
        return this
    }
    */

    syncToNode () {
        BrowserTitledRow.syncToNode.apply(this)
        return this
    }
	
}.initThisClass()
