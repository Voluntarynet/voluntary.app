
BMImageWellFieldView = BMFieldView.extend().newSlots({
    type: "BMImageWellFieldView",
}).setSlots({
    init: function () {
        BMFieldView.init.apply(this)
        this.setDivClassName("BMImageWellFieldView")
		this.keyView().setDivClassName("BMImageWellKeyField") //.setDisplay("none")
		//this.valueView().setContentEditable(false)
        this.turnOnUserSelect()
        this.makeUnselectable()
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
			console.log("field = ", field.type())
			this.keyView().setInnerHTML(field.key())
			this.imageWellView().setImageDataURLs(field.value())
		}
        return this
    },


    syncToNode: function () {
        var field = this.node()
		
		if (field.valueIsEditable()) {
        	field.setValue(this.imageWellView().imageDataURLs())
		}
		
        //NodeView.syncToNode.apply(this)
        return this
    },
})
