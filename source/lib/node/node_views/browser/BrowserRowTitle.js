"use strict"

/*
    BrowserRowTitle

    A title element in a BrowserRow. 

    Reasons not to just use setDivClassName() on a TextField instead:
    - to automatically get the full class hierarchy in the div name
    - a place to (potentially) override interaction behaviors

*/

window.BrowserRowTitle = TextField.extend().newSlots({
    type: "BrowserRowTitle",
}).setSlots({
    init: function () {
        TextField.init.apply(this)
        //this.setMinAndMaxHeight(17)
        return this
    },

    row: function() {
        return this.parentView().parentView()
    },

    selectNextKeyView: function() {
        /*
        console.log(this.typeId() + ".selectNextKeyView()")
        const row = this.parentView().parentView();
        const nextRow = this.row().column().selectNextRow()
        */
        return true
    },
})
