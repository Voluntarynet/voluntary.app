"use strict"

/*

    BMOptionsNodeRowView 

    View for BMOptionsNode

    BMOptionsNode -> BMOptionsNodeRowView
        BMOption -> BMSingleOptionRowView
        BMMultiOption -> BMMultiOptionRowView

*/


BrowserTitledRow.newSubclassNamed("BMOptionsNodeRowView").newSlots({
}).setSlots({
    init: function () {
        BrowserTitledRow.init.apply(this)
        //this.setHasSubtitle(true)
        return this
    },
	
}).initThisProto()
