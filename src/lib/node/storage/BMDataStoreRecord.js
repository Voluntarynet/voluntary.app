"use strict"

window.BMDataStoreRecord = BMFieldSetNode.extend().newSlots({
    type: "BMDataStoreRecord",
	key: null,
	didSetupFields: false,
}).setSlots({
    init: function () {
		BMFieldSetNode.init.apply(this)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
		this.setNodeBackgroundColor("white")
    },

	prepareToAccess: function() {
		BMFieldSetNode.prepareToAccess.apply(this)
		
		if (!this._didSetupFields) {
			console.log(this.type() + " prepareToAccess")
			this.addStoredField(BMTextAreaField.clone().setKey("dict").setValueMethod("dictString").setValueIsEditable(false).setIsMono(true))
			this._didSetupFields = true
		}
	},
	
/*
	subtitle: function() {
		return this.value().length + " bytes"
	},
	*/
	
	value: function() {
		return NodeStore.shared().sdb().at(this.title())
	},
	
	dictString: function() {
		return JSON.stringify(JSON.parse(this.value()), null, 2)
	},
})

