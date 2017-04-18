/*


*/
        
BMDateField = BMField.extend().newSlots({
    type: "BMDateField",
	unsetVisibleValue: "unset",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMFieldView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },

	visibleValue: function() {
		var v = this.value()
		if (!v) { 
			return this.unsetVisibleValue()
		}
		return new Date(v).toDateString()
	},
})
