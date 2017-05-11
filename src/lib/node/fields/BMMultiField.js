/*


*/

        
BMMultiField = BMField.extend().newSlots({
    type: "BMMultiField",
	validValues: [],
	options: [],
	validValuesMethod: null,
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
		
		//this.setupOptions()
		//console.log("this._validValues = ", this._validValues)
		
		return this
	},
	
	/*
	removeAllItems: function() {
		var self = this

		this.items().forEach(function (item) {
			self.removeItem(item)
		})	
	},
	*/
	
	validValues: function() {
		if (this._validValues.length == 0 && this.validValuesMethod()) {
			var t = this.target()
			return t[this.validValuesMethod()].apply(t)
		}
		
		return this._validValues
	},
	
	validate: function() {
		//console.log(this.type() + " validate")
		 
		if(!this.validValues().contains(this.value())) {	
			this.setValueError("invalid value")
			return false
		}
		this.setValueError(null)
		return true
	},
	
	/*
	setupOptions: function() {
		if (this.validValuesMethod()) {
			var t = this.target()
			this.setValidValues(t[this.validValuesMethod()].apply(t))
		}
		
		this.removeAllItems()
		
		var self = this
		this.validValues().forEach(function(v) {
			self.addItem(BMMultiFieldOption.clone().setTitle(v))
		})
	},
	*/
	
	// lazy load items
	/*
	prepareToSyncToView: function() {
		BMField.prepareToSyncToView.apply(this)
		console.log(this.type() + " prepareToSyncToView <<<<<<<<<<<<<<<<<<<<<<<")
	},
	*/
	
	/*
	prepareToAccess: function() {
		BMField.prepareToAccess.apply(this)
		

		if (this.validValuesMethod()) {
			var t = this.target()
			this.setValidValues(t[this.validValuesMethod()].apply(t))
			this.setupOptions()
		}
			
		console.log(this.type() + " lazy load items <<<<<<<<<<<<<<<<<<<<<<<")
		if ((this._items == null || this._items.length ==  0) && this.validValuesMethod()) {
			var t = this.target()
			this.setValidValues(t[this.validValuesMethod()].apply(t))
			this.setupOptions()
		}
	},
	*/
})
