"use strict"

/*

    BMBooleanFieldRowView

*/

BMFieldRowView.newSubclassNamed("BMBooleanFieldRowView").newSlots({
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)

        this.turnOffUserSelect()
        this.keyView().setTransition("all 0.3s")

        
        return this
    },

    createValueView: function() {
        return BooleanView.clone()
    },
	
    booleanView: function() {
        return this.valueView()
    },
    
})
