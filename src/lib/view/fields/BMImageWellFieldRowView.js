"use strict"

window.BMImageWellFieldRowView = BMFieldRowView.extend().newSlots({
    type: "BMImageWellFieldView",
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)
        this.keyView().setDivClassName("BMImageWellKeyField") //.setDisplay("none")
        //this.valueView().setContentEditable(false)
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
        var field = this.node()

        if (this.imageWellView()) {
            //console.log("field = ", field.type())
            this.keyView().setInnerHTML(field.key())
            this.imageWellView().setImageDataURLs(field.value())
		    this.updateKeyView()
		    this.imageWellView().setMaxImageCount(this.node().maxImageCount())
        }
		
        return this
    },

    syncToNode: function () {
        var field = this.node()
		
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
        var opacity = 1
        
        if(this.node().onlyShowsKeyWhenEmpty()) {
		    opacity = this.dataUrls().length ? 0 : 1
	    }
	    
	    this.keyView().setOpacity(opacity)
	    
        return this
    },
    
    didUpdateImageWellView: function(anImageWell) {
        //console.log(this.typeId() + ".didUpdateImageWellView()")
        this.scheduleSyncToNode() //this.setNeedsSyncToNode(true)
        return this
    },
})
