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

    /*
    syncFromNode: function () {
        BMFieldRowView.syncFromNode.apply(this)

        const field = this.node()
        this.applyStyles() // normally this would happen in updateSubviews
        this.booleanView().setValue(field.value())
        return this
    },

    syncToNode: function () {
        const field = this.node()
				
        this.updateKeyView()
		
        if (field.valueIsEditable()) {
            const data = this.imageWellView().imageDataURL()
            //console.log("data = " + (data ? data.slice(0, 40) + "..." : "null"))
        	field.setValue(data)
        }
        
        //NodeView.syncToNode.apply(this)
        return this
    },
    */

    
})
