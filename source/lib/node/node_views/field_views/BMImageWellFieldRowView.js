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

            this.imageWellView().setImageDataURLs(field.value())
            this.imageWellView().setIsEditable(field.valueIsEditable())

        }
        */
        
        this.applyStyles() // normally this would happen in updateSubviews

        return this
    },

    syncToNode: function () {
        const field = this.node()
		
        //console.log(this.typeId() + ".syncToNode() imageDataURLs: ", this.dataUrls())
		
        this.updateKeyView()
		
        if (field.valueIsEditable()) {
        	field.setValue(this.imageWellView().imageDataURLs())
        }
        
        //NodeView.syncToNode.apply(this)
        return this
    },

    dataUrls: function() {
        return this.imageWellView().imageDataURLs()
    },
    
    updateKeyView: function() {
        let opacity = 1
        
        if(this.node().onlyShowsKeyWhenEmpty && this.node().onlyShowsKeyWhenEmpty()) {
		    opacity = this.dataUrls().length ? 0 : 1
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
