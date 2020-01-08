"use strict"

/*

    BMOptionsNodeRowView 

    View for BMOptionsNode

    BMOptionsNode -> BMOptionsNodeRowView
        BMOption -> BMSingleOptionRowView
        BMMultiOption -> BMMultiOptionRowView

*/


window.BMOptionsNodeRowView = class BMOptionsNodeRowView extends BrowserTitledRow {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.setHasSubtitle(true)
        return this
    }
	
}.initThisClass()
