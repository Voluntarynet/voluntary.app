"use strict"

/*

    BMOptionNodeRowView 

 
*/

window.BMOptionNodeRowView = class BMOptionNodeRowView extends BrowserTitledRow {
    
    initPrototype () {

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
        super.onEnterKeyUp(event)
        this.toggle()
        return this
    }
    
    onTapComplete (aGesture) {
        super.onTapComplete(aGesture)
        this.toggle()
        return this
    }
    
    /*
    activate () { // not getting called?
        super.activate(aGesture)
        this.node().toggle()
        return this
    }
    */   
               
    /*
    select () {
        super.select()
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
        super.syncToNode()
        return this
    }
	
}.initThisClass()
