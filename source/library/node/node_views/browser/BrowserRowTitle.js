"use strict"

/*
    BrowserRowTitle

    A title element in a BrowserRow. 

    Reasons not to just use setDivClassName() on a TextField instead:
    - to automatically get the full class hierarchy in the div name
    - a place to (potentially) override interaction behaviors

*/

window.BrowserRowTitle = class BrowserRowTitle extends TextField {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.setMinAndMaxHeight(17)
        return this
    }

    row () {
        return this.parentView().parentView()
    }

    selectNextKeyView () {
        /*
        this.debugLog(".selectNextKeyView()")
        const row = this.parentView().parentView();
        const nextRow = this.row().column().selectNextRow()
        */
        return true
    }
    
}.initThisClass()
