"use strict"

/*

    BMImageWellFieldRowView

*/

BMFieldRowView.newSubclassNamed("BMImageWellFieldRowView").newSlots({
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)
        //this.keyView().setDivClassName("BMImageWellKeyField") //.setDisplay("none")
        //this.valueView().setIsEditable(false)
        this.turnOffUserSelect()
        this.keyView().setTransition("all 0.3s")
        return this
    },

    createValueView: function() {
        return ImageWellView.clone()
    },
	
    imageWellView: function() {
        return this.valueView()
    },

    syncFromNode: function () {
        BMFieldRowView.syncFromNode.apply(this)

        const field = this.node()

        /*
        const field = this.node()

        if (this.imageWellView()) {
            //console.log("field = ", field.type())
            // sync key view
            this.keyView().setInnerHTML(field.key())
            this.keyView().setIsEditable(field.keyIsEditable())
		    this.updateKeyView()

            this.imageWellView().setImageDataURL(field.value())
            this.imageWellView().setIsEditable(field.valueIsEditable())

        }
        */
        
        this.applyStyles() // normally this would happen in updateSubviews
        this.imageWellView().setImageDataURL(field.value())

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

    dataUrl: function() {
        return this.imageWellView().imageDataURL()
    },

    isEmpty: function() {
        return Type.isNull(this.dataUrl())
    },
    
    updateKeyView: function() {
        let opacity = 1
        
        if(this.node().onlyShowsKeyWhenEmpty && this.node().onlyShowsKeyWhenEmpty()) {
		    opacity = this.isEmpty() ? 0 : 1
        }
        
	    this.keyView().setOpacity(opacity)
	    
        return this
    },
    
    didUpdateImageWellView: function(anImageWell) {
        //console.log(this.typeId() + ".didUpdateImageWellView()")
        this.scheduleSyncToNode() 
        return this
    },
})
