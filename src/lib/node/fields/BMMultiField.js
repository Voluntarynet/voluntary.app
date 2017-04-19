/*


*/

        
BMMultiField = BMField.extend().newSlots({
    type: "BMMultiField",
	validValues: [],
	options: [],
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMMultiFieldView")
    },

	setValidValues: function(v) {
		this._validValues = v
		
		if (this.value() == null && v.length) {
			this.setValue(v[0])
		}
		
		this.setupOptions()
		console.log("this._validValues = ", this._validValues)
		
		return this
	},
	
	removeAllItems: function() {
		var self = this

		this.items().forEach(function (item) {
			self.removeItem(item)
		})	
	},
	
	setupOptions: function() {
		this.removeAllItems()
		
		var self = this
		this.validValues().forEach(function(v) {
			self.addItem(BMMultiFieldOption.clone().setTitle(v))
		})
	},
})
