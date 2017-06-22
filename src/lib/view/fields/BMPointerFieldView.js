
BMPointerFieldView = BMFieldView.extend().newSlots({
    type: "BMPointerFieldView",
}).setSlots({
    init: function () {
        BMFieldView.init.apply(this)
        
        //this.setDivClassName("BMPointerFieldView")

		this.noteView().setInnerHTML("→")
        this.noteView().setTarget(this).setAction("clickedOnValue")
        this.valueView().setTarget(this).setAction("clickedOnValue")

        this.valueView().makeUnselectable()

        return this
    },

	clickedOnValue: function() {
		// find browser column and select?
		console.log(this.type() + " clickedOnValue")
	},

	createValueView: function() {
		return Div.clone().setDivClassName("BMFieldValueView")
	},

})
