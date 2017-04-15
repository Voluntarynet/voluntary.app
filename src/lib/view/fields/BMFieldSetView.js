
BMFieldSetView = NodeView.extend().newSlots({
    type: "BMFieldSetView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BMFieldSetView")
		this.setItemProto(null)
		// calling syncToNode will set up field views
        return this
    },
})
