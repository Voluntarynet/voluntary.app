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
        this.addAction("delete")
		this.setNodeBackgroundColor("white")
    },

	prepareToAccess: function() {
		BMFieldSetNode.prepareToAccess.apply(this)
		
		if (!this._didSetupFields) {
			//console.log(this.type() + " prepareToAccess")
			this.addStoredField(BMTextAreaField.clone().setKey("dict").setValueMethod("dictString").setValueIsEditable(false).setIsMono(true))
			this._didSetupFields = true
		}
	},
	
	valuePid: function() {
	    return this.title()
	},
/*
	subtitle: function() {
		return this.value().length + " bytes"
	},
	*/
	
	value: function() {
		return NodeStore.shared().sdb().at(this.valuePid())
	},
	
	dictString: function() {
		return JSON.stringify(JSON.parse(this.value()), null, 2)
	},
	
	delete: function() {
	    BMFieldSetNode.delete.apply(this)
//        NodeStore.shared().justRemoveObject(this.value())
        NodeStore.shared().justRemovePid(this.valuePid())
	    return this
	},
})

